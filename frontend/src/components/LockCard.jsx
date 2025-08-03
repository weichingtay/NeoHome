import React from 'react';
import { FiLock, FiUnlock } from 'react-icons/fi';
import { useDevices } from '../contexts/DeviceContext';

const LockCard = ({ deviceId }) => {
  const { getDeviceById, toggleLock } = useDevices();
  const device = getDeviceById(deviceId);

  if (!device) {
    return <div>Device not found</div>;
  }

  const handleToggleLock = () => {
    toggleLock(deviceId);
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
        <span>Last updated: {device.lastUpdated}</span>
      </div>
    </div>
  );
};

export default LockCard;