import React, { useState } from 'react';
import { FiHome, FiBell, FiPlus, FiThermometer, FiLock, FiSun, FiUnlock } from 'react-icons/fi';
import Thermostat from './components/Thermostat';
import Brightness from './components/Brightness';
import './App.css';

const App = () => {
  const [selectedColor, setSelectedColor] = useState('white');
  const [isLocked, setIsLocked] = useState(true);

  const handleColorSelection = (color) => {
    setSelectedColor(color);
  };

  const handleToggleLock = () => {
    setIsLocked(!isLocked);
  };

  return (
    <div className="container">
      <header>
        <div className="logo">
          <FiHome />
          <div className="logo-text">
            <h1>NeoHome</h1>
            <p>Smart Control Panel</p>
          </div>
        </div>
        <div className="header-icons">
          <FiBell />
          <div className="user-profile"></div>
        </div>
      </header>

      <main>
        <section className="dashboard-header">
          <div>
            <h2>Smart Home Dashboard</h2>
            <p>Monitor and control your connected devices</p>
          </div>
          <button className="add-device-btn">
            <FiPlus />
            Add Device
          </button>
        </section>

        <section className="status-cards">
          <div className="card">
            <div className="card-icon lights">
              <FiSun />
            </div>
            <div className="card-content">
              <h3>Lights</h3>
              <p>4/6 Active</p>
            </div>
          </div>
          <div className="card">
            <div className="card-icon climate">
              <FiThermometer />
            </div>
            <div className="card-content">
              <h3>Climate</h3>
              <p>22°C Average</p>
            </div>
          </div>
          <div className="card">
            <div className="card-icon security">
              <FiLock />
            </div>
            <div className="card-content">
              <h3>Security</h3>
              <p>Secure All locked</p>
            </div>
          </div>
        </section>

        <section className="room-filters">
          <button className="filter-btn active">All Rooms</button>
          <button className="filter-btn">Living Room</button>
          <button className="filter-btn">Kitchen</button>
          <button className="filter-btn">Bedroom</button>
          <button className="filter-btn">Bathroom</button>
        </section>

        <section className="devices">
          <h2>Devices</h2>
          <div className="device-cards">
            <div className="device-card">
              <div className="device-header">
                <FiSun className="device-icon" />
                <span>Living Room Light</span>
                <div className="toggle-switch">
                  <input type="checkbox" id="light-toggle" defaultChecked />
                  <label htmlFor="light-toggle"></label>
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

            <div className="device-card">
              <div className="device-header">
                <FiThermometer className="device-icon" />
                <span>Smart Thermostat</span>
                <div className="toggle-switch">
                  <input type="checkbox" id="thermostat-toggle" defaultChecked />
                  <label htmlFor="thermostat-toggle"></label>
                </div>
              </div>
              <div className="device-body">
                <Thermostat />
              </div>
              <div className="device-footer">
                <span>Last updated: 1 min ago</span>
              </div>
            </div>

            <div className="device-card">
              <div className="device-header">
                <FiLock className="device-icon" />
                <span>Front Door Lock</span>
                <span className={`lock-status ${isLocked ? 'locked' : 'unlocked'}`}>
                  {isLocked ? 'Locked' : 'Unlocked'}
                </span>
              </div>
              <div className="device-body">
                <div className={`lock-display ${isLocked ? 'locked' : 'unlocked'}`}>
                  {isLocked ? <FiLock /> : <FiUnlock />}
                </div>
                <button
                  className={isLocked ? 'unlock-btn' : 'lock-btn'}
                  onClick={handleToggleLock}
                >
                  {isLocked ? 'Unlock Door' : 'Lock Door'}
                </button>
              </div>
              <div className="device-footer">
                <span>Last updated: 3 hours ago</span>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default App;
