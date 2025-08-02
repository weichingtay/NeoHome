import React, { createContext, useContext, useState } from 'react';

const DeviceContext = createContext();

// Device factory functions
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

  // Parse deviceId utility
  const parseDeviceId = (deviceId) => {
    const [location, deviceType, instance] = deviceId.split('/');
    return { location, deviceType, instance };
  };

  // Generic device updater
  const updateDevice = (deviceId, updates) => {
    setDevices(prevDevices =>
      prevDevices.map(device =>
        device.deviceId === deviceId
          ? { ...device, ...updates, lastUpdated: "Just now" }
          : device
      )
    );
  };

  // Specific update functions
  const toggleDevice = (deviceId) => {
    const device = getDeviceById(deviceId);
    updateDevice(deviceId, { isOn: !device.isOn });
  };

  const updateBrightness = (deviceId, brightness) => updateDevice(deviceId, { brightness });
  const updateColorTemp = (deviceId, colorTemp) => updateDevice(deviceId, { colorTemp });
  const updateTemperature = (deviceId, targetTemp) => updateDevice(deviceId, { targetTemp });
  
  const toggleLock = (deviceId) => {
    const device = getDeviceById(deviceId);
    updateDevice(deviceId, { isLocked: !device.isLocked });
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
    parseDeviceId
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