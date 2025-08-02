import React from 'react';
import { FiThermometer } from 'react-icons/fi';
import { useDevices } from '../contexts/DeviceContext';
import Thermostat from './Thermostat';

const ThermostatCard = ({ deviceId }) => {
  const { getDeviceById, toggleDevice } = useDevices();
  const device = getDeviceById(deviceId);

  if (!device) {
    return <div>Device not found</div>;
  }

  const safeName = device.name || 'Smart Thermostat';
  const toggleId = `${safeName.replace(/\s+/g, '-')}-toggle`;

  return (
    <div className="device-card">
      <div className="device-header">
        <FiThermometer className="device-icon" />
        <span>{safeName}</span>
        <div className="toggle-switch">
          <input 
            type="checkbox" 
            id={toggleId}
            checked={device.isOn || false}
            onChange={() => toggleDevice(deviceId)}
          />
          <label htmlFor={toggleId}></label>
        </div>
      </div>
      <div className="device-body">
        <Thermostat deviceId={deviceId} />
      </div>
      <div className="device-footer">
        <span>Last updated: {device.lastUpdated}</span>
      </div>
    </div>
  );
};

export default ThermostatCard;