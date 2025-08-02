import React from 'react';
import { FiThermometer } from 'react-icons/fi';
import Thermostat from './Thermostat';

const ThermostatCard = ({ name, room }) => {
  return (
    <div className="device-card">
      <div className="device-header">
        <FiThermometer className="device-icon" />
        <span>{name}</span>
        <div className="toggle-switch">
          <input type="checkbox" id={`${name.replace(/\s+/g, '-')}-toggle`} defaultChecked />
          <label htmlFor={`${name.replace(/\s+/g, '-')}-toggle`}></label>
        </div>
      </div>
      <div className="device-body">
        <Thermostat />
      </div>
      <div className="device-footer">
        <span>Last updated: 1 min ago</span>
      </div>
    </div>
  );
};

export default ThermostatCard;