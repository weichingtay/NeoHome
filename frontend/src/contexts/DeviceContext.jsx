import React, { createContext, useContext, useState, useEffect } from 'react';

const DeviceContext = createContext();

// Device factory functions (keeping frontend format for internal use)
const createDevice = (location, type, instance, name, typeSpecificProps = {}) => ({
  deviceId: `${location}/${type}/${instance}`,
  name,
  type,
  isOn: true,
  lastUpdated: "2 mins ago",
  ...typeSpecificProps
});

const createLight = (location, instance, name, overrides = {}) => 
  createDevice(location, "light", instance, name, {
    brightness: 65,
    colorTemp: "white",
    ...overrides
  });

const createThermostat = (location, instance, name, overrides = {}) => 
  createDevice(location, "thermostat", instance, name, {
    targetTemp: 22,
    currentTemp: 21,
    ...overrides
  });

const createLock = (location, instance, name, overrides = {}) => 
  createDevice(location, "lock", instance, name, {
    isLocked: true,
    ...overrides
  });

export const DeviceProvider = ({ children }) => {
  const [devices, setDevices] = useState([
    createLock("living-room", "front-door-01", "Front Door Lock"),
    createLight("living-room", "ceiling-01", "Living Room Light"),
    createThermostat("living-room", "wall-01", "Smart Thermostat"),
    createLight("kitchen", "ceiling-01", "Kitchen Ceiling Light", { brightness: 80, colorTemp: "warm-white" }),
    createLight("kitchen", "under-cabinet-01", "Under-Cabinet Lights", { isOn: false, brightness: 45, colorTemp: "cool-white" }),
    createLight("bedroom", "ceiling-01", "Bedroom Main Light", { isOn: false, brightness: 30, colorTemp: "warm" }),
    createLight("bedroom", "bedside-01", "Bedside Lamp", { brightness: 25, colorTemp: "warm" }),
    createThermostat("bedroom", "wall-01", "Bedroom Thermostat", { targetTemp: 20, currentTemp: 19 }),
    createLight("bathroom", "vanity-01", "Bathroom Vanity Light", { brightness: 90, colorTemp: "cool" }),
    createLight("bathroom", "shower-01", "Shower Light", { isOn: false, brightness: 70 })
  ]);

  const [backendConnected, setBackendConnected] = useState(false);

  // Convert backend device format to frontend format
  const convertBackendToFrontend = (backendDevice) => ({
    deviceId: backendDevice.device_id,
    name: backendDevice.name,
    type: backendDevice.device_type,
    isOn: backendDevice.is_on,
    lastUpdated: backendDevice.last_updated,
    brightness: backendDevice.brightness,
    colorTemp: backendDevice.color_temp,
    targetTemp: backendDevice.target_temp,
    currentTemp: backendDevice.current_temp,
    isLocked: backendDevice.is_locked
  });

  // Convert frontend updates to backend format
  const convertFrontendToBackend = (frontendUpdates) => {
    const backendUpdates = {};
    if ('isOn' in frontendUpdates) backendUpdates.is_on = frontendUpdates.isOn;
    if ('brightness' in frontendUpdates) backendUpdates.brightness = frontendUpdates.brightness;
    if ('colorTemp' in frontendUpdates) backendUpdates.color_temp = frontendUpdates.colorTemp;
    if ('targetTemp' in frontendUpdates) backendUpdates.target_temp = frontendUpdates.targetTemp;
    if ('isLocked' in frontendUpdates) backendUpdates.is_locked = frontendUpdates.isLocked;
    return backendUpdates;
  };

  // WebSocket connection that gracefully handles backend being down
  useEffect(() => {
    let ws = null;
    let reconnectTimeout = null;

    const connectWebSocket = () => {
      try {
        ws = new WebSocket('ws://localhost:8000/ws');
        
        ws.onopen = () => {
          console.log('🔌 WebSocket connected to backend');
          setBackendConnected(true);
        };
        
        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            console.log('🔄 Real-time update received:', data);
            
            if (data.type === 'initial_state' && data.devices) {
              console.log('📥 Loading initial devices from backend');
              const frontendDevices = data.devices.map(convertBackendToFrontend);
              setDevices(frontendDevices);
            } else if (data.type === 'device_update') {
              console.log('🔄 Device update from backend:', data.device_id);
              const frontendDevice = convertBackendToFrontend(data.device);
              setDevices(prevDevices =>
                prevDevices.map(device =>
                  device.deviceId === data.device_id
                    ? { ...device, ...frontendDevice }
                    : device
                )
              );
            }
          } catch (error) {
            console.error('❌ Error parsing WebSocket message:', error);
          }
        };
        
        ws.onclose = () => {
          console.log('🔌 WebSocket disconnected');
          setBackendConnected(false);
          
          // Try to reconnect after 3 seconds
          reconnectTimeout = setTimeout(() => {
            console.log('🔄 Attempting to reconnect...');
            connectWebSocket();
          }, 3000);
        };
        
        ws.onerror = (error) => {
          console.log('⚠️ WebSocket error, backend may not be running');
          setBackendConnected(false);
        };
      } catch (error) {
        console.log('⚠️ Cannot connect to backend, using local mode');
        setBackendConnected(false);
      }
    };

    // Initial connection attempt
    connectWebSocket();
    
    return () => {
      if (reconnectTimeout) {
        clearTimeout(reconnectTimeout);
      }
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
    };
  }, []);

  // API call to backend (with proper error handling)
  const updateDeviceAPI = async (deviceId, frontendUpdates) => {
    if (!backendConnected) {
      console.log('⚠️ Backend not connected, skipping API call');
      return;
    }

    try {
      const backendUpdates = convertFrontendToBackend(frontendUpdates);
      console.log('🔵 API Call:', deviceId, 'Updates:', backendUpdates);
      
      const response = await fetch(`http://localhost:8000/api/devices/${encodeURIComponent(deviceId)}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(backendUpdates),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ API Error:', response.status, errorText);
        throw new Error(`API Error: ${response.status}`);
      }
      
      const updatedDevice = await response.json();
      console.log('✅ Device updated via API:', updatedDevice);
      
    } catch (error) {
      console.error('❌ Failed to update device via API:', error);
      setBackendConnected(false); // Mark backend as disconnected
    }
  };

  // Parse deviceId utility
  const parseDeviceId = (deviceId) => {
    const [location, deviceType, instance] = deviceId.split('/');
    return { location, deviceType, instance };
  };

  // Generic device updater (always updates local state immediately)
  const updateDevice = (deviceId, updates) => {
    // Update local state immediately for responsive UI
    setDevices(prevDevices =>
      prevDevices.map(device =>
        device.deviceId === deviceId
          ? { ...device, ...updates, lastUpdated: "Just now" }
          : device
      )
    );

    // Also try to update backend (non-blocking)
    updateDeviceAPI(deviceId, updates);
  };

  // Specific update functions
  const toggleDevice = (deviceId) => {
    const device = getDeviceById(deviceId);
    if (device) {
      updateDevice(deviceId, { isOn: !device.isOn });
    }
  };

  const updateBrightness = (deviceId, brightness) => updateDevice(deviceId, { brightness });
  const updateColorTemp = (deviceId, colorTemp) => updateDevice(deviceId, { colorTemp });
  const updateTemperature = (deviceId, targetTemp) => updateDevice(deviceId, { targetTemp });
  
  const toggleLock = (deviceId) => {
    const device = getDeviceById(deviceId);
    if (device) {
      updateDevice(deviceId, { isLocked: !device.isLocked });
    }
  };

  // Helper functions
  const getDeviceById = (deviceId) => devices.find(device => device.deviceId === deviceId);
  const getDevicesByType = (type) => devices.filter(device => device.type === type);
  
  const getDevicesByRoom = (room) => {
    if (room === 'all') return devices;
    const roomFormat = room.replace(/_/g, '-');
    return devices.filter(device => {
      const { location } = parseDeviceId(device.deviceId);
      return location === roomFormat;
    });
  };

  const getStats = () => {
    const lights = getDevicesByType('light');
    const activeLights = lights.filter(light => light.isOn).length;
    
    const thermostats = getDevicesByType('thermostat');
    const avgTemp = thermostats.length > 0 
      ? Math.round(thermostats.reduce((sum, t) => sum + t.currentTemp, 0) / thermostats.length)
      : 0;
    
    const locks = getDevicesByType('lock');
    const allLocked = locks.every(lock => lock.isLocked);

    return {
      lighting: `${activeLights}/${lights.length} Active`,
      temperature: `${avgTemp}°C Average`,
      security: allLocked ? 'All Locked' : 'Some Unlocked'
    };
  };

  const value = {
    devices,
    updateDevice,
    toggleDevice,
    updateBrightness,
    updateColorTemp,
    updateTemperature,
    toggleLock,
    getDevicesByRoom,
    getDeviceById,
    getDevicesByType,
    getStats,
    parseDeviceId,
    backendConnected
  };

  return (
    <DeviceContext.Provider value={value}>
      {children}
    </DeviceContext.Provider>
  );
};

export function useDevices() {
  const context = useContext(DeviceContext);
  if (!context) {
    throw new Error('useDevices must be used within a DeviceProvider');
  }
  return context;
}