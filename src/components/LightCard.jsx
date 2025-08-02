import React, { useState } from 'react';
import { FiSun } from 'react-icons/fi';
import Brightness from './Brightness';

const LightCard = ({ name, room }) => {
  const [selectedColor, setSelectedColor] = useState('white');

  const handleColorSelection = (color) => {
    setSelectedColor(color);
  };

  return (
    <div className="device-card">
      <div className="device-header">
        <FiSun className="device-icon" />
        <span>{name}</span>
        <div className="toggle-switch">
          <input type="checkbox" id={`${name.replace(/\s+/g, '-')}-toggle`} defaultChecked />
          <label htmlFor={`${name.replace(/\s+/g, '-')}-toggle`}></label>
        </div>
      </div>
      <div className="device-body">
        <Brightness />
        <div className="color-temp-container">
          <p>Color Temperature</p>
          <div className="color-palette">
            <div
              className={`color-dot warm ${selectedColor === 'warm' ? 'selected' : ''}`}
              onClick={() => handleColorSelection('warm')}
            ></div>
            <div
              className={`color-dot warm-white ${selectedColor === 'warm-white' ? 'selected' : ''}`}
              onClick={() => handleColorSelection('warm-white')}
            ></div>
            <div
              className={`color-dot white ${selectedColor === 'white' ? 'selected' : ''}`}
              onClick={() => handleColorSelection('white')}
            ></div>
            <div
              className={`color-dot cool-white ${selectedColor === 'cool-white' ? 'selected' : ''}`}
              onClick={() => handleColorSelection('cool-white')}
            ></div>
            <div
              className={`color-dot cool ${selectedColor === 'cool' ? 'selected' : ''}`}
              onClick={() => handleColorSelection('cool')}
            ></div>
          </div>
        </div>
      </div>
      <div className="device-footer">
        <span>Last updated: 2 mins ago</span>
      </div>
    </div>
  );
};

export default LightCard;