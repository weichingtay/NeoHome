import React from 'react';
import { FiSun } from 'react-icons/fi';
import { useDevices } from '../contexts/DeviceContext';
import Brightness from './Brightness';
import './LockCard.css';

const LightCard = ({ deviceId }) => {
  const { getDeviceById, toggleDevice, updateColorTemp } = useDevices();
  const device = getDeviceById(deviceId);

  if (!device) {
    return <div>Device not found</div>;
  }

  const handleColorSelection = (color) => {
    updateColorTemp(deviceId, color);
  };

  const safeName = device.name || 'Smart Light';
  const toggleId = `${safeName.replace(/\s+/g, '-')}-toggle`;

  return (
    <div className="device-card">
      <div className="device-header">
        <FiSun className="device-icon" />
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
        <Brightness deviceId={deviceId} />
        <div className="color-temp-container">
          <p>Color Temperature</p>
          <div className="color-palette">
            <div
              className={`color-dot warm ${device.colorTemp === 'warm' ? 'selected' : ''}`}
              onClick={() => handleColorSelection('warm')}
            ></div>
            <div
              className={`color-dot warm-white ${device.colorTemp === 'warm-white' ? 'selected' : ''}`}
              onClick={() => handleColorSelection('warm-white')}
            ></div>
            <div
              className={`color-dot white ${device.colorTemp === 'white' ? 'selected' : ''}`}
              onClick={() => handleColorSelection('white')}
            ></div>
            <div
              className={`color-dot cool-white ${device.colorTemp === 'cool-white' ? 'selected' : ''}`}
              onClick={() => handleColorSelection('cool-white')}
            ></div>
            <div
              className={`color-dot cool ${device.colorTemp === 'cool' ? 'selected' : ''}`}
              onClick={() => handleColorSelection('cool')}
            ></div>
          </div>
        </div>
      </div>
      <div className="device-footer">
        <span>Last updated: {device.lastUpdated}</span>
      </div>
    </div>
  );
};

export default LightCard;