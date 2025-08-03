# backend/main.py - FastAPI Smart Home Backend
from fastapi import FastAPI, HTTPException, Depends, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.websockets import WebSocket, WebSocketDisconnect
from pydantic import BaseModel, Field, validator
from typing import Dict, List, Optional, Any, Literal
from datetime import datetime, timezone
import asyncio
import json
import logging
import uvicorn
from contextlib import asynccontextmanager

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# ====================
# PYDANTIC MODELS (IoT Data Models)
# ====================

class DeviceBase(BaseModel):
    """Base device model following IoT naming conventions"""
    device_id: str = Field(..., description="Format: location/type/instance")
    name: str
    device_type: Literal["light", "thermostat", "lock"]
    is_on: bool = True
    last_updated: str = "Just now"
    
    @validator('device_id')
    def validate_device_id(cls, v):
        parts = v.split('/')
        if len(parts) != 3:
            raise ValueError('Device ID must follow format: location/type/instance')
        location, device_type, instance = parts
        
        # IoT naming validation: lowercase, alphanumeric, hyphens only
        for part in parts:
            if not part.replace('-', '').replace('_', '').isalnum():
                raise ValueError('Device ID parts must be alphanumeric with hyphens/underscores only')
        
        return v.lower().replace('_', '-')  # Normalize to lowercase with hyphens

class LightDevice(DeviceBase):
    """Smart light device with brightness and color temperature"""
    device_type: Literal["light"] = "light"
    brightness: int = Field(65, ge=0, le=100, description="Brightness percentage")
    color_temp: str = Field("white", description="Color temperature setting")

class ThermostatDevice(DeviceBase):
    """Smart thermostat device with temperature controls"""
    device_type: Literal["thermostat"] = "thermostat"
    target_temp: int = Field(22, ge=16, le=30, description="Target temperature in Celsius")
    current_temp: int = Field(21, ge=-20, le=50, description="Current temperature in Celsius")

class LockDevice(DeviceBase):
    """Smart lock device with security status"""
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
    current_temp: Optional[int] = Field(None, ge=-20, le=50)
    is_locked: Optional[bool] = None

class TelemetryData(BaseModel):
    """Telemetry data for real sensor integration"""
    device_id: str
    sensor_type: str
    value: float
    unit: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class DeviceStats(BaseModel):
    """System statistics"""
    lighting: str
    temperature: str
    security: str
    total_devices: int
    online_devices: int

# ====================
# DEVICE MANAGER (IoT Device Registry)
# ====================

class DeviceManager:
    """
    Production-ready device manager with IoT naming conventions
    Simulates real IoT device registry with in-memory storage
    """
    
    def __init__(self):
        self.devices: Dict[str, Device] = {}
        self.telemetry_history: List[TelemetryData] = []
        self.websocket_connections: List[WebSocket] = []
        self._initialize_demo_devices()
        self._start_simulation()
    
    def _initialize_demo_devices(self):
        """Initialize devices with proper IoT naming and realistic data"""
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
    
    def _start_simulation(self):
        """Start background simulation for realistic IoT behavior"""
        pass  # Placeholder for background task initialization
    
    async def simulate_real_sensors(self):
        """Simulate real sensor behavior with periodic updates"""
        while True:
            try:
                # Simulate temperature drift for thermostats
                for device_id, device in self.devices.items():
                    if isinstance(device, ThermostatDevice):
                        # Gradually approach target temperature
                        temp_diff = device.target_temp - device.current_temp
                        if abs(temp_diff) > 0:
                            change = 1 if temp_diff > 0 else -1
                            device.current_temp += change
                            device.last_updated = "Just now"
                            
                            # Create telemetry data
                            telemetry = TelemetryData(
                                device_id=device_id,
                                sensor_type="temperature",
                                value=float(device.current_temp),
                                unit="celsius"
                            )
                            self.telemetry_history.append(telemetry)
                            
                            # Broadcast to WebSocket connections
                            await self.broadcast_device_update(device_id, device)
                
                await asyncio.sleep(30)  # Update every 30 seconds
                
            except Exception as e:
                logger.error(f"Simulation error: {e}")
                await asyncio.sleep(5)
    
    async def broadcast_device_update(self, device_id: str, device: Device):
        """Broadcast device updates to all connected WebSocket clients"""
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
        """Get all devices"""
        return list(self.devices.values())
    
    def get_device(self, device_id: str) -> Optional[Device]:
        """Get device by ID"""
        return self.devices.get(device_id)
    
    def get_devices_by_room(self, room: str) -> List[Device]:
        """Get devices filtered by room"""
        if room == "all":
            return self.get_all_devices()
        
        room_normalized = room.replace('_', '-')
        return [
            device for device in self.devices.values()
            if device.device_id.split('/')[0] == room_normalized
        ]
    
    def get_devices_by_type(self, device_type: str) -> List[Device]:
        """Get devices filtered by type"""
        return [
            device for device in self.devices.values()
            if device.device_type == device_type
        ]
    
    async def update_device(self, device_id: str, updates: DeviceUpdate) -> Device:
        """Update device with validation and broadcast"""
        device = self.get_device(device_id)
        if not device:
            raise HTTPException(status_code=404, detail="Device not found")
        
        # Update only provided fields
        update_data = updates.dict(exclude_unset=True)
        update_data["last_updated"] = "Just now"
        
        # Validate device-specific constraints
        if isinstance(device, LightDevice):
            if "target_temp" in update_data or "current_temp" in update_data:
                raise HTTPException(status_code=400, detail="Cannot set temperature on light device")
        elif isinstance(device, ThermostatDevice):
            if "brightness" in update_data or "color_temp" in update_data:
                raise HTTPException(status_code=400, detail="Cannot set brightness on thermostat device")
        elif isinstance(device, LockDevice):
            if any(key in update_data for key in ["brightness", "color_temp", "target_temp"]):
                raise HTTPException(status_code=400, detail="Cannot set these properties on lock device")
        
        # Apply updates
        for key, value in update_data.items():
            if hasattr(device, key):
                setattr(device, key, value)
        
        # Broadcast update
        await self.broadcast_device_update(device_id, device)
        
        logger.info(f"Updated device {device_id}: {update_data}")
        return device
    
    def get_system_stats(self) -> DeviceStats:
        """Calculate system statistics"""
        lights = self.get_devices_by_type("light")
        active_lights = sum(1 for light in lights if light.is_on)
        
        thermostats = self.get_devices_by_type("thermostat")
        avg_temp = round(sum(t.current_temp for t in thermostats) / len(thermostats)) if thermostats else 0
        
        locks = self.get_devices_by_type("lock")
        all_locked = all(lock.is_locked for lock in locks) if locks else True
        
        return DeviceStats(
            lighting=f"{active_lights}/{len(lights)} Active",
            temperature=f"{avg_temp}°C Average",
            security="All Locked" if all_locked else "Some Unlocked",
            total_devices=len(self.devices),
            online_devices=len(self.devices)  # All simulated devices are "online"
        )

# ====================
# FASTAPI APPLICATION
# ====================

# Global device manager
device_manager = DeviceManager()

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Manage application lifespan with background tasks"""
    # Startup
    logger.info("Starting Smart Home IoT Backend")
    
    # Start background simulation
    simulation_task = asyncio.create_task(device_manager.simulate_real_sensors())
    
    yield
    
    # Shutdown
    logger.info("Shutting down Smart Home IoT Backend")
    simulation_task.cancel()
    try:
        await simulation_task
    except asyncio.CancelledError:
        pass

# Initialize FastAPI with lifespan management
app = FastAPI(
    title="Smart Home IoT API",
    description="Production-ready IoT device management system",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)

# CORS middleware for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],  # Vite dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ====================
# DEPENDENCY INJECTION
# ====================

async def get_device_manager() -> DeviceManager:
    """Dependency to get device manager"""
    return device_manager

async def validate_device_exists(device_id: str, manager: DeviceManager = Depends(get_device_manager)) -> Device:
    """Validate that device exists"""
    device = manager.get_device(device_id)
    if not device:
        raise HTTPException(status_code=404, detail=f"Device {device_id} not found")
    return device

# ====================
# API ENDPOINTS
# ====================

@app.get("/", tags=["System"])
async def root():
    """Health check endpoint"""
    return {
        "message": "Smart Home IoT API",
        "status": "operational",
        "version": "1.0.0",
        "timestamp": datetime.now(timezone.utc).isoformat()
    }

@app.get("/health", tags=["System"])
async def health_check():
    """Kubernetes health check endpoint"""
    return {
        "status": "healthy",
        "devices_count": len(device_manager.devices),
        "websocket_connections": len(device_manager.websocket_connections)
    }

@app.get("/api/devices", response_model=List[Device], tags=["Devices"])
async def get_devices(
    room: Optional[str] = None,
    device_type: Optional[str] = None,
    manager: DeviceManager = Depends(get_device_manager)
):
    """Get all devices with optional filtering"""
    if room:
        devices = manager.get_devices_by_room(room)
    elif device_type:
        devices = manager.get_devices_by_type(device_type)
    else:
        devices = manager.get_all_devices()
    
    return devices

@app.get("/api/devices/{device_id}", response_model=Device, tags=["Devices"])
async def get_device(device: Device = Depends(validate_device_exists)):
    """Get specific device by ID"""
    return device

@app.patch("/api/devices/{device_id}", response_model=Device, tags=["Devices"])
async def update_device(
    device_id: str,
    updates: DeviceUpdate,
    manager: DeviceManager = Depends(get_device_manager)
):
    """Update device properties"""
    return await manager.update_device(device_id, updates)

@app.get("/api/stats", response_model=DeviceStats, tags=["System"])
async def get_system_stats(manager: DeviceManager = Depends(get_device_manager)):
    """Get system statistics"""
    return manager.get_system_stats()

@app.get("/api/rooms", tags=["System"])
async def get_rooms():
    """Get available rooms"""
    return {
        "rooms": [
            {"id": "all", "name": "All Rooms"},
            {"id": "living-room", "name": "Living Room"},
            {"id": "kitchen", "name": "Kitchen"},
            {"id": "bedroom", "name": "Bedroom"},
            {"id": "bathroom", "name": "Bathroom"}
        ]
    }

@app.post("/api/telemetry", tags=["Telemetry"])
async def ingest_telemetry(
    telemetry: TelemetryData,
    manager: DeviceManager = Depends(get_device_manager)
):
    """Ingest telemetry data from real sensors"""
    # Validate device exists
    device = manager.get_device(telemetry.device_id)
    if not device:
        raise HTTPException(status_code=404, detail="Device not found")
    
    # Store telemetry
    manager.telemetry_history.append(telemetry)
    
    # Update device current state if applicable
    if isinstance(device, ThermostatDevice) and telemetry.sensor_type == "temperature":
        device.current_temp = int(telemetry.value)
        device.last_updated = "Just now"
        await manager.broadcast_device_update(telemetry.device_id, device)
    
    logger.info(f"Telemetry ingested: {telemetry.device_id} - {telemetry.sensor_type}: {telemetry.value}")
    return {"status": "success", "message": "Telemetry data ingested"}

@app.get("/api/telemetry/{device_id}", tags=["Telemetry"])
async def get_device_telemetry(
    device_id: str,
    limit: int = 100,
    manager: DeviceManager = Depends(get_device_manager)
):
    """Get telemetry history for a device"""
    # Validate device exists
    await validate_device_exists(device_id, manager)
    
    # Get telemetry data
    device_telemetry = [
        t for t in manager.telemetry_history 
        if t.device_id == device_id
    ][-limit:]  # Get last N records
    
    return {"device_id": device_id, "telemetry": device_telemetry}

# ====================
# WEBSOCKET ENDPOINTS
# ====================

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    """WebSocket endpoint for real-time device updates"""
    await websocket.accept()
    device_manager.websocket_connections.append(websocket)
    
    try:
        # Send initial device state
        devices = device_manager.get_all_devices()
        await websocket.send_text(json.dumps({
            "type": "initial_state",
            "devices": [device.dict() for device in devices]
        }))
        
        # Keep connection alive and handle incoming messages
        while True:
            try:
                data = await websocket.receive_text()
                message = json.loads(data)
                
                # Handle different message types
                if message.get("type") == "subscribe":
                    # Client wants to subscribe to specific devices
                    await websocket.send_text(json.dumps({
                        "type": "subscribed",
                        "message": "Successfully subscribed to device updates"
                    }))
                
            except WebSocketDisconnect:
                break
            except Exception as e:
                logger.error(f"WebSocket error: {e}")
                break
    
    finally:
        # Remove connection on disconnect
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
        reload=True,
        log_level="info"
    )