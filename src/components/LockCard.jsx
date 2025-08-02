import React, { useState } from 'react';
import { FiLock, FiUnlock } from 'react-icons/fi';

const LockCard = ({ name, room }) => {
  const [isLocked, setIsLocked] = useState(true);

  const handleToggleLock = () => {
    setIsLocked(!isLocked);
  };

  return (
    <div className="device-card">
      <div className="device-header">
        <FiLock className="device-icon" />
        <span>{name}</span>
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
  );
};

export default LockCard;