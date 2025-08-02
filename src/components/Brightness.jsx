import React, { useState, useMemo, useRef, useCallback, useEffect } from 'react';
import { useDevices } from '../contexts/DeviceContext';
import './Brightness.css';

const Brightness = ({ deviceId }) => {
  const { getDeviceById, updateBrightness } = useDevices();
  const device = getDeviceById(deviceId);
  const [isDragging, setIsDragging] = useState(false);
  const dialRef = useRef(null);

  const brightness = device?.brightness || 0;

  const handleUpdate = useCallback((e) => {
    if (!dialRef.current) return;
    const rect = dialRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height;

    const clientX = e.type.includes('touch') ? e.changedTouches[0].clientX : e.clientX;
    const clientY = e.type.includes('touch') ? e.changedTouches[0].clientY : e.clientY;

    const angleRad = Math.atan2(clientY - centerY, clientX - centerX);
    let angleDeg = angleRad * (180 / Math.PI);

    angleDeg = Math.max(-180, Math.min(0, angleDeg));

    const bright = Math.round(((angleDeg + 180) / 180) * 100);
    updateBrightness(deviceId, bright);
  }, [deviceId, updateBrightness]);

  const handleMouseDown = (e) => {
    e.preventDefault();
    setIsDragging(true);
    handleUpdate(e);
  };

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleMouseMove = useCallback((e) => {
    if (isDragging) {
      handleUpdate(e);
    }
  }, [isDragging, handleUpdate]);

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('touchmove', handleMouseMove);
    window.addEventListener('touchend', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleMouseMove);
      window.removeEventListener('touchend', handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp]);

  const rotationDegrees = useMemo(() => {
    return (brightness / 100) * 180 - 180;
  }, [brightness]);

  return (
    <div className="brightness-container">
      <div
        ref={dialRef}
        className="brightness-dial"
        onMouseDown={handleMouseDown}
        onTouchStart={handleMouseDown}
      >
        <div className="brightness-background" />
        <div className="brightness-indicator" style={{ transform: `rotate(${rotationDegrees}deg)` }}>
          <div className="brightness-handle" />
        </div>
        <div className="brightness-labels">
          <span className="min-brightness">0%</span>
          <span className="max-brightness">100%</span>
        </div>
      </div>
      <div className="brightness-readout">
        <span className="brightness-value">{brightness}%</span>
        <span className="brightness-label">Intensity</span>
      </div>
    </div>
  );
};

export default Brightness;