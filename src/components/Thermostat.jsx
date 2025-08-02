// src/components/Thermostat.jsx - Updated with better target/current distinction
import React, { useState, useMemo, useRef, useCallback, useEffect } from 'react';
import './Thermostat.css';

const Thermostat = () => {
  const [targetTemp, setTargetTemp] = useState(22);
  const [currentTemp, setCurrentTemp] = useState(21);
  const [isDragging, setIsDragging] = useState(false);
  const dialRef = useRef(null);
  const minTemp = 16;
  const maxTemp = 30;

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

    const tempRange = maxTemp - minTemp;
    const valuePercentage = (angleDeg + 180) / 180;
    const temp = Math.round(valuePercentage * tempRange) + minTemp;
    setTargetTemp(temp);
  }, [minTemp, maxTemp]);

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
    const percentage = (targetTemp - minTemp) / (maxTemp - minTemp);
    return percentage * 180 - 180;
  }, [targetTemp, minTemp, maxTemp]);

  return (
    <>
      <div className="thermostat-container">
        <div
          ref={dialRef}
          className="thermostat-dial"
          onMouseDown={handleMouseDown}
          onTouchStart={handleMouseDown}
        >
          <div className="thermostat-background" />
          <div className="thermostat-indicator" style={{ transform: `rotate(${rotationDegrees}deg)` }}>
            <div className="thermostat-handle" />
          </div>
          <div className="temp-labels">
            <span className="min-temp">{minTemp}°C</span>
            <span className="max-temp">{maxTemp}°C</span>
          </div>
        </div>
        <div className="thermostat-readout">
          <span className="temperature-value">{targetTemp}°</span>
          <span className="temperature-label">Target</span>
        </div>
      </div>
      <div className="current-temp-display">
        <div className="current-temp-label">Current Temperature</div>
        <div className="current-temp-value">{currentTemp}°C</div>
      </div>
    </>
  );
};

export default Thermostat;