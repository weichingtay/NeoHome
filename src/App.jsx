import React, { useState } from 'react';
import { FiHome, FiBell, FiPlus, FiThermometer, FiLock, FiSun } from 'react-icons/fi';
import LightCard from './components/LightCard';
import ThermostatCard from './components/ThermostatCard';
import LockCard from './components/LockCard';
import './App.css';

const App = () => {
  const [selectedRoom, setSelectedRoom] = useState('all');

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
              <p>6/8 Active</p>
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
              <p>All Locked</p>
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
            
            {/* Living Room - Show when 'all' or 'living_room' selected */}
            {(selectedRoom === 'all' || selectedRoom === 'living_room') && (
              <>
                <LockCard name="Front Door Lock" room="Living Room" />
                <LightCard name="Living Room Light" room="Living Room" />
                <ThermostatCard name="Smart Thermostat" room="Living Room" />
              </>
            )}

            {/* Kitchen - Show when 'all' or 'kitchen' selected */}
            {(selectedRoom === 'all' || selectedRoom === 'kitchen') && (
              <>
                <LightCard name="Kitchen Ceiling Light" room="Kitchen" />
                <LightCard name="Under-Cabinet Lights" room="Kitchen" />
              </>
            )}

            {/* Bedroom - Show when 'all' or 'bedroom' selected */}
            {(selectedRoom === 'all' || selectedRoom === 'bedroom') && (
              <>
                <LightCard name="Bedroom Main Light" room="Bedroom" />
                <LightCard name="Bedside Lamp" room="Bedroom" />
                <ThermostatCard name="Bedroom Thermostat" room="Bedroom" />
              </>
            )}

            {/* Bathroom - Show when 'all' or 'bathroom' selected */}
            {(selectedRoom === 'all' || selectedRoom === 'bathroom') && (
              <>
                <LightCard name="Bathroom Vanity Light" room="Bathroom" />
                <LightCard name="Shower Light" room="Bathroom" />
              </>
            )}

          </div>
        </section>
      </main>
    </div>
  );
};

export default App;