import React, { useState, useEffect } from 'react';
import { FiLock, FiUnlock } from 'react-icons/fi';
import { useDevices } from '../contexts/DeviceContext';
import './DeviceCard.css';

const LockCard = ({ deviceId }) => {
  const { getDeviceById, toggleLock } = useDevices();
  const device = getDeviceById(deviceId);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update current time every minute to refresh relative timestamps
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Update every 60 seconds

    return () => clearInterval(interval);
  }, []);

  if (!device) {
    return <div>Device not found</div>;
  }

  const handleToggleLock = () => {
    toggleLock(deviceId);
  };

  // Simple timestamp formatting that recalculates based on currentTime
  const getRelativeTime = (timestamp) => {
    if (!timestamp) return 'N/A';
    
    try {
      // If it's already a string like "just now", return it
      if (typeof timestamp === 'string' && !timestamp.includes('T') && !timestamp.includes('Z')) {
        return timestamp;
      }

      const date = new Date(timestamp);
      if (isNaN(date.getTime())) {
        return timestamp; // fallback to original
      }

      // Use currentTime state instead of new Date() so it updates when state changes
      const diffInSeconds = Math.floor((currentTime - date) / 1000);
      const diffInMinutes = Math.floor(diffInSeconds / 60);
      const diffInHours = Math.floor(diffInMinutes / 60);

      if (diffInSeconds < 60) {
        return 'Just now';
      } else if (diffInMinutes < 60) {
        return `${diffInMinutes} min ago`;
      } else if (diffInHours < 24) {
        return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
      } else {
        return 'more than a day ago';
      }
    } catch (error) {
      return timestamp || 'N/A';
    }
  };

  return (
    <div className="device-card">
      <div className="device-header">
        <FiLock className="device-icon" />
        <span>{device.name}</span>
        <span className={`lock-status ${device.isLocked ? 'locked' : 'unlocked'}`}>
          {device.isLocked ? 'Locked' : 'Unlocked'}
        </span>
      </div>
      <div className="device-body">
        <div className={`lock-display ${device.isLocked ? 'locked' : 'unlocked'}`}>
          {device.isLocked ? <FiLock /> : <FiUnlock />}
        </div>
        <button
          className={device.isLocked ? 'unlock-btn' : 'lock-btn'}
          onClick={handleToggleLock}
        >
          {device.isLocked ? 'Unlock Door' : 'Lock Door'}
        </button>
      </div>
      <div className="device-footer">
        <span>Last updated: {getRelativeTime(device.lastUpdated)}</span>
      </div>
    </div>
  );
};

export default LockCard;