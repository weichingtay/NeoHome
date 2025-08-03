# backend/main.py - Simplified Smart Home Backend
from fastapi import FastAPI, HTTPException, Depends, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.websockets import WebSocket, WebSocketDisconnect
from pydantic import BaseModel, Field, validator
from typing import Dict, List, Optional, Any, Literal
from datetime import datetime, timezone
from urllib.parse import unquote
import asyncio
import json
import logging
import uvicorn

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# ====================
# PYDANTIC MODELS
# ====================

class DeviceBase(BaseModel):
    """Base device model"""
    device_id: str = Field(..., description="Format: location/type/instance")
    name: str
    device_type: Literal["light", "thermostat", "lock"]
    is_on: bool = True
    last_updated: str = "Just now"

class LightDevice(DeviceBase):
    """Smart light device"""
    device_type: Literal["light"] = "light"
    brightness: int = Field(65, ge=0, le=100)
    color_temp: str = "white"

class ThermostatDevice(DeviceBase):
    """Smart thermostat device"""
    device_type: Literal["thermostat"] = "thermostat"
    target_temp: int = Field(22, ge=16, le=30)
    current_temp: int = Field(21, ge=-20, le=50)

class LockDevice(DeviceBase):
    """Smart lock device"""
    device_type: Literal["lock"] = "lock"
    is_locked: bool = True

# Union type for all device types
Device = LightDevice | ThermostatDevice | LockDevice

class DeviceUpdate(BaseModel):
    """Model for updating device properties"""
    is_on: Optional[bool] = None
    brightness: Optional[int] = Field(None, ge=0, le=100)
    color_temp: Optional[str] = None
    target_temp: Optional[int] = Field(None, ge=16, le=30)
    is_locked: Optional[bool] = None

class DeviceStats(BaseModel):
    """System statistics"""
    lighting: str
    temperature: str
    security: str

# ====================
# DEVICE MANAGER
# ====================

class DeviceManager:
    """Simple device manager with in-memory storage"""
    
    def __init__(self):
        self.devices: Dict[str, Device] = {}
        self.websocket_connections: List[WebSocket] = []
        self._initialize_demo_devices()
    
    def _initialize_demo_devices(self):
        """Initialize devices with demo data"""
        demo_devices = [
            LockDevice(
                device_id="living-room/lock/front-door-01",
                name="Front Door Lock",
                is_locked=True
            ),
            LightDevice(
                device_id="living-room/light/ceiling-01",
                name="Living Room Light",
                brightness=65,
                color_temp="white"
            ),
            ThermostatDevice(
                device_id="living-room/thermostat/wall-01",
                name="Smart Thermostat",
                target_temp=22,
                current_temp=21
            ),
            LightDevice(
                device_id="kitchen/light/ceiling-01",
                name="Kitchen Ceiling Light",
                brightness=80,
                color_temp="warm-white"
            ),
            LightDevice(
                device_id="kitchen/light/under-cabinet-01",
                name="Under-Cabinet Lights",
                is_on=False,
                brightness=45,
                color_temp="cool-white"
            ),
            LightDevice(
                device_id="bedroom/light/ceiling-01",
                name="Bedroom Main Light",
                is_on=False,
                brightness=30,
                color_temp="warm"
            ),
            LightDevice(
                device_id="bedroom/light/bedside-01",
                name="Bedside Lamp",
                brightness=25,
                color_temp="warm"
            ),
            ThermostatDevice(
                device_id="bedroom/thermostat/wall-01",
                name="Bedroom Thermostat",
                target_temp=20,
                current_temp=19
            ),
            LightDevice(
                device_id="bathroom/light/vanity-01",
                name="Bathroom Vanity Light",
                brightness=90,
                color_temp="cool"
            ),
            LightDevice(
                device_id="bathroom/light/shower-01",
                name="Shower Light",
                is_on=False,
                brightness=70,
                color_temp="white"
            )
        ]
        
        for device in demo_devices:
            self.devices[device.device_id] = device
        
        logger.info(f"Initialized {len(demo_devices)} demo devices")
    
    async def broadcast_device_update(self, device_id: str, device: Device):
        """Broadcast device updates to WebSocket clients"""
        if self.websocket_connections:
            message = {
                "type": "device_update",
                "device_id": device_id,
                "device": device.dict()
            }
            
            # Remove disconnected clients
            active_connections = []
            for websocket in self.websocket_connections:
                try:
                    await websocket.send_text(json.dumps(message))
                    active_connections.append(websocket)
                except:
                    pass  # Connection closed
            
            self.websocket_connections = active_connections
    
    def get_all_devices(self) -> List[Device]:
        return list(self.devices.values())
    
    def get_device(self, device_id: str) -> Optional[Device]:
        return self.devices.get(device_id)
    
    def get_devices_by_room(self, room: str) -> List[Device]:
        if room == "all":
            return self.get_all_devices()
        
        room_normalized = room.replace('_', '-')
        return [
            device for device in self.devices.values()
            if device.device_id.split('/')[0] == room_normalized
        ]
    
    async def update_device(self, device_id: str, updates: DeviceUpdate) -> Device:
        """Update device with validation"""
        device = self.get_device(device_id)
        if not device:
            raise HTTPException(status_code=404, detail="Device not found")
        
        # Update only provided fields
        update_data = updates.dict(exclude_unset=True)
        update_data["last_updated"] = "Just now"
        
        # Apply updates
        for key, value in update_data.items():
            if hasattr(device, key):
                setattr(device, key, value)
        
        # Broadcast update
        await self.broadcast_device_update(device_id, device)
        
        return device
    
    def get_system_stats(self) -> DeviceStats:
        """Calculate system statistics"""
        lights = [d for d in self.devices.values() if d.device_type == "light"]
        active_lights = sum(1 for light in lights if light.is_on)
        
        thermostats = [d for d in self.devices.values() if d.device_type == "thermostat"]
        avg_temp = round(sum(t.current_temp for t in thermostats) / len(thermostats)) if thermostats else 0
        
        locks = [d for d in self.devices.values() if d.device_type == "lock"]
        all_locked = all(lock.is_locked for lock in locks) if locks else True
        
        return DeviceStats(
            lighting=f"{active_lights}/{len(lights)} Active",
            temperature=f"{avg_temp}°C Average",
            security="All Locked" if all_locked else "Some Unlocked"
        )

# ====================
# FASTAPI APPLICATION
# ====================

# Initialize FastAPI
app = FastAPI(
    title="Smart Home Control Panel API",
    description="Simple smart home device management",
    version="1.0.0"
)

# CORS middleware for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global device manager
device_manager = DeviceManager()

# ====================
# API ENDPOINTS
# ====================

@app.get("/")
async def root():
    """Health check"""
    return {"message": "Smart Home API", "status": "running"}

@app.get("/api/devices", response_model=List[Device])
async def get_devices(room: Optional[str] = None):
    """Get all devices with optional room filtering"""
    if room:
        return device_manager.get_devices_by_room(room)
    return device_manager.get_all_devices()

@app.get("/api/devices/{device_id:path}", response_model=Device)
async def get_device(device_id: str):
    """Get specific device by ID"""
    # URL decode the device_id
    decoded_device_id = unquote(device_id)
    
    device = device_manager.get_device(decoded_device_id)
    if not device:
        raise HTTPException(status_code=404, detail=f"Device {decoded_device_id} not found")
    return device

@app.patch("/api/devices/{device_id:path}", response_model=Device)
async def update_device(device_id: str, updates: DeviceUpdate):
    """Update device properties"""
    # URL decode the device_id
    decoded_device_id = unquote(device_id)
    
    logger.info(f"Updating device: {decoded_device_id} with {updates.dict(exclude_unset=True)}")
    return await device_manager.update_device(decoded_device_id, updates)

@app.get("/api/stats", response_model=DeviceStats)
async def get_system_stats():
    """Get system statistics"""
    return device_manager.get_system_stats()

# ====================
# WEBSOCKET
# ====================

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    """WebSocket for real-time updates"""
    await websocket.accept()
    device_manager.websocket_connections.append(websocket)
    
    try:
        # Send initial device state
        devices = device_manager.get_all_devices()
        await websocket.send_text(json.dumps({
            "type": "initial_state",
            "devices": [device.dict() for device in devices]
        }))
        
        # Keep connection alive
        while True:
            await websocket.receive_text()
    
    except WebSocketDisconnect:
        pass
    finally:
        if websocket in device_manager.websocket_connections:
            device_manager.websocket_connections.remove(websocket)

# ====================
# DEVELOPMENT SERVER
# ====================

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    )