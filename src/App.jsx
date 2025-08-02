import React, { useState } from 'react';
import { FiHome, FiBell, FiPlus, FiThermometer, FiLock, FiSun } from 'react-icons/fi';
import { DeviceProvider, useDevices } from './contexts/DeviceContext';
import LightCard from './components/LightCard';
import ThermostatCard from './components/ThermostatCard';
import LockCard from './components/LockCard';
import './App.css';

// Dashboard component that uses the context
const Dashboard = () => {
  const [selectedRoom, setSelectedRoom] = useState('all');
  const { getDevicesByRoom, getStats } = useDevices();

  const filteredDevices = getDevicesByRoom(selectedRoom);
  const stats = getStats();

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
              <h3>Lighting</h3>
              <p>{stats.lighting}</p>
            </div>
          </div>
          <div className="card">
            <div className="card-icon climate">
              <FiThermometer />
            </div>
            <div className="card-content">
              <h3>Home Temperature</h3>
              <p>{stats.temperature}</p>
            </div>
          </div>
          <div className="card">
            <div className="card-icon security">
              <FiLock />
            </div>
            <div className="card-content">
              <h3>Door Locks</h3>
              <p>{stats.security}</p>
            </div>
          </div>
        </section>

        <section className="room-filters">
          <button 
            className={`filter-btn ${selectedRoom === 'all' ? 'active' : ''}`}
            onClick={() => setSelectedRoom('all')}
          >
            All Rooms
          </button>
          <button 
            className={`filter-btn ${selectedRoom === 'living_room' ? 'active' : ''}`}
            onClick={() => setSelectedRoom('living_room')}
          >
            Living Room
          </button>
          <button 
            className={`filter-btn ${selectedRoom === 'kitchen' ? 'active' : ''}`}
            onClick={() => setSelectedRoom('kitchen')}
          >
            Kitchen
          </button>
          <button 
            className={`filter-btn ${selectedRoom === 'bedroom' ? 'active' : ''}`}
            onClick={() => setSelectedRoom('bedroom')}
          >
            Bedroom
          </button>
          <button 
            className={`filter-btn ${selectedRoom === 'bathroom' ? 'active' : ''}`}
            onClick={() => setSelectedRoom('bathroom')}
          >
            Bathroom
          </button>
        </section>

        <section className="devices">
          <h2>Devices</h2>
          <div className="device-cards">
            {filteredDevices.map(device => {
              if (device.type === 'light') {
                return <LightCard key={device.deviceId} deviceId={device.deviceId} />;
              } else if (device.type === 'thermostat') {
                return <ThermostatCard key={device.deviceId} deviceId={device.deviceId} />;
              } else if (device.type === 'lock') {
                return <LockCard key={device.deviceId} deviceId={device.deviceId} />;
              }
              return null;
            })}
          </div>
        </section>
      </main>
    </div>
  );
};

// App component with provider
const App = () => {
  return (
    <DeviceProvider>
      <Dashboard />
    </DeviceProvider>
  );
};

export default App;