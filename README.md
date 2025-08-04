# NeoHome - Smart Control Panel

![Status: Complete](https://img.shields.io/badge/Status-Complete-brightgreen)
![Frontend: React](https://img.shields.io/badge/Frontend-React-61DAFB?logo=react)
![Backend: FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688?logo=fastapi)
![Realtime: WebSockets](https://img.shields.io/badge/Realtime-WebSockets-blue)

## 🏡 Overview

This project is a web application that simulates a Smart Home Control Panel. It allows users to monitor and control various smart devices within a home environment, such as lights, thermostats, and door locks. Built as a take-home engineering challenge, it showcases full-stack development skills, focusing on interactive UI controls, managing device states, and real-time communication between the frontend and backend.

## ✨ Features

*   **User Authentication:** Simple login system with a demo account.
*   **Device Control:**
    *   **Lights:** Turn on/off, adjust brightness with a custom dial, and change color temperature.
    *   **Thermostat:** Turn on/off, set target temperature with a custom dial, and view current room temperature.
    *   **Door Locks:** Lock and unlock doors.
*   **Real-time Updates:** Device statuses update instantly on the dashboard thanks to WebSocket communication.
*   **Dynamic Data Simulation:** Thermostat temperatures change periodically, simulating real-world sensor readings.
*   **Room Filtering:** View devices by specific rooms (Living Room, Kitchen, Bedroom, Bathroom) or all at once.
*   **Home Statistics:** Quick overview of lighting, temperature, and security status across the home.
*   **Responsive Design:** Works well on different screen sizes (desktop, tablet, mobile).

## 🏗️ Architecture

The application follows a client-server architecture with real-time capabilities:

1.  **Frontend (React.js with Vite):**
    *   This is the user interface (UI) that users interact with in their web browser, built using React.js and bundled with Vite.
    *   It sends **commands** (like turning a light on or setting a temperature) to the Backend using standard **HTTP API** requests.
    *   It receives **real-time updates** from the Backend through **WebSockets** to ensure the display always shows the latest status of all devices.
    *   Manages local UI state and user authentication.

2.  **Backend (FastAPI - Python):**
    *   This is the server-side application, built with Python's FastAPI framework.
    *   It acts as the central brain, storing the current state of all simulated smart devices in memory.
    *   It receives commands from the Frontend via **HTTP API** requests.
    *   It sends real-time **updates** back to the Frontend via **WebSockets**.
    *   **Device Simulation:** Includes a `DeviceManager` to handle device states and a `SimpleTemperatureSimulator` that periodically updates thermostat temperatures based on pre-generated data, mimicking real sensor behavior.

3.  **Communication:**
    *   **HTTP (REST API):** Used for sending commands from the frontend to the backend (e.g., when you click a button or drag a dial).
    *   **WebSockets:** Used for real-time, bidirectional communication. The backend pushes instant updates to the frontend whenever a device state changes (either by user action or simulation).

In essence, the Frontend is the control panel, the Backend is the brain that processes commands and manages device information, and they communicate constantly to keep everything synchronized.

## 🚀 Getting Started

Follow these steps to set up and run the project locally.

### Prerequisites

Make sure you have the following installed:

*   **Node.js & npm (or Yarn):** For the React frontend.
    *   [Download Node.js (includes npm)](https://nodejs.org/en/download/)

*   **Python 3.8+ & pip:** For the FastAPI backend.
    *   [Download Python](https://www.python.org/downloads/)
### 1. Clone the Repository

```bash
git clone https://github.com/weichingtay/NeoHome.git
cd NeoHome # Or whatever your project folder is named
```

### 2. Backend Setup

Navigate to the backend directory:

```bash
cd backend
```

a. Install Python Dependencies:

It's recommended to use a virtual environment:

```bash
python -m venv venv
source venv/bin/activate  # On Windows: .\venv\Scripts\activate
pip install -r requirements.txt
```

b. Generate Sensor Data:

This script creates sensor-data.json which the backend uses to simulate temperature changes.

```bash
python generate_thermostat_data.py
```

c. Run the Backend Server:

```bash
uvicorn main:app --reload
```

The backend server will start, usually on http://127.0.0.1:8000. Keep this terminal window open.


### 3. Frontend Setup

Open a new terminal window and navigate to the frontend directory:

```bash
cd ../frontend # If you're still in the backend folder
# Or if you opened a new terminal:
# cd neohome/frontend
```

a. Install Node.js Dependencies:

```bash
npm install
```

b. Run the Frontend Application:

```bash
npm run dev
```

The React application will open in your web browser, usually at http://localhost:5173.


### 4. Access the Application

Once both the backend and frontend are running, open your web browser and go to:

```bash
http://localhost:5173
```

Demo Credentials:

```bash
**Demo Credentials:**
Username: demo
Password: demo123
```

## 📸 Screenshots / Links

<img width="1894" height="912" alt="image" src="https://github.com/user-attachments/assets/f9c047f0-45cb-44b9-8437-8219bfae07e9" />

**Live Demo:** https://neo-smart-home.netlify.app/ (Frontend only)

> **Note:** Backend not deployed to avoid committing generated sensor data (~1.4MB). Run locally for full real-time temperature simulation.

## 💡 Future Improvements

Given more time, here are some areas I would explore to enhance this project:

*   **Data Persistence:** Integrate a database (e.g., SQLite, PostgreSQL) to store device states permanently, so they don't reset when the backend restarts.
*   **More Device Types:** Add support for other smart devices like security cameras (with mock video feeds), smart plugs, or motion sensors.
*   **Advanced Authentication:** Implement a more robust authentication system (e.g., OAuth, JWT) and user management.
*   **Notifications:** Add a notification system for important events (e.g., "Door unlocked," "Temperature reached target").
*   **Customization:** Allow users to rename devices, create custom rooms, or set schedules.
*   **Testing:** Implement unit and integration tests for both frontend and backend components to ensure reliability.
*   **Error Handling UI:** Provide more explicit user feedback for API errors or backend disconnections.

## 🚀 Future Extensions

### Real Sensor Integration

*   Replace mock data with actual IoT device APIs (Philips Hue, Nest, August locks)
*   MQTT broker for real-time sensor data from Arduino/Raspberry Pi devices
*   Physical sensor readings instead of simulated temperature updates

### Mobile Support

*   Progressive Web App features for mobile-first experience
*   React Native app with push notifications for device alerts
*   Responsive breakpoints for tablet and phone layouts

### Notification System

*   Real-time alerts when doors unlock or temperature exceeds thresholds
*   Email/SMS notifications for security events
*   Browser push notifications for device status changes

### Simple Architecture Extensions

Current: React ←→ FastAPI ←→ Mock Data
Future:  Mobile App ←→ API Gateway ←→ Database ←→ Real IoT Devices


## 🚧 Challenges Faced

Developing this application presented several interesting challenges:

*   **Real-time Synchronization:** Ensuring seamless, instant updates across the frontend when device states change (either by user action or backend simulation) required careful implementation of WebSockets and state management.
*   **Custom UI Controls:** Making custom interactive elements like the brightness and temperature dials feel natural and smooth to use was harder than it looked. It required careful thought about how user actions translate into precise digital changes on screen.
*   **Frontend-Backend State Consistency:** Maintaining a single source of truth for device states (the backend) while providing immediate UI feedback on the frontend required a strategy that updates the local state first, then attempts to sync with the backend.
*   **Simulating Realism:** Making the thermostat temperature changes feel natural and dynamic, rather than abrupt, involved creating a simple simulation model that cycles through pre-generated data.
