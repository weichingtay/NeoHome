#!/usr/bin/env python3
"""
Simple Temperature Data Generator for Two Thermostats
Generates realistic temperature readings for Living Room and Bedroom thermostats
"""

import json
import random
import math
from datetime import datetime, timedelta, timezone
from pathlib import Path

def generate_thermostat_data(hours: int = 24):
    """Generate temperature data for two thermostats"""
    
    # Your two thermostat devices
    devices = [
        {
            "deviceId": "living-room/thermostat/wall-01",
            "name": "Living Room Thermostat", 
            "baseTemp": 22.0,  # Warmer room
            "targetTemp": 22.0
        },
        {
            "deviceId": "bedroom/thermostat/wall-01",
            "name": "Bedroom Thermostat",
            "baseTemp": 20.0,  # Cooler room
            "targetTemp": 20.0
        }
    ]
    
    start_time = datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0)
    readings = []
    
    print(f"🌡️ Generating {hours} hours of temperature data for 2 thermostats...")
    
    for minute in range(hours * 60):  # Each minute
        current_time = start_time + timedelta(minutes=minute)
        hour_of_day = current_time.hour + current_time.minute / 60.0
        
        for device in devices:
            # Daily temperature variation (cooler at night, warmer in evening)
            daily_cycle = math.sin((hour_of_day - 6) * math.pi / 12) * 1.2  # ±1.2°C variation
            
            # Random fluctuation (realistic sensor noise)
            noise = random.uniform(-0.3, 0.3)
            
            # HVAC effect (gradually approach target temperature)
            current_temp = device["baseTemp"] + daily_cycle + noise
            
            # Simulate thermostat trying to reach target
            temp_diff = device["targetTemp"] - current_temp
            if abs(temp_diff) > 0.5:
                # HVAC working - move toward target
                hvac_effect = temp_diff * 0.02  # 2% adjustment per minute
                current_temp += hvac_effect
            
            # Occasional target temperature changes (user adjustments)
            if random.random() < 0.001:  # 0.1% chance per minute
                device["targetTemp"] = device["baseTemp"] + random.uniform(-2, 2)
            
            # Create reading
            reading = {
                "timestamp": current_time.isoformat(),
                "deviceId": device["deviceId"],
                "name": device["name"],
                "currentTemp": round(current_temp, 1),
                "targetTemp": round(device["targetTemp"], 1),
                "humidity": 45 + random.randint(-10, 10)  # Realistic humidity
            }
            
            readings.append(reading)
    
    # Create final dataset
    dataset = {
        "metadata": {
            "generated_at": datetime.now(timezone.utc).isoformat(),
            "duration_hours": hours,
            "total_readings": len(readings),
            "devices": len(devices),
            "description": "Temperature readings for Living Room and Bedroom thermostats"
        },
        "temperatureReadings": readings
    }
    
    print(f"✅ Generated {len(readings)} temperature readings")
    return dataset

def save_sensor_data(dataset, filename="sensor-data.json"):
    """Save temperature data to JSON file"""
    with open(filename, 'w') as f:
        json.dump(dataset, f, indent=2)
    
    file_size = Path(filename).stat().st_size / 1024  # KB
    print(f"💾 Saved to {filename} ({file_size:.1f} KB)")

if __name__ == "__main__":
    print("🏠 Simple Thermostat Data Generator")
    print("=" * 40)
    
    # Generate 24 hours of data
    data = generate_thermostat_data(24)
    
    # Save to file
    save_sensor_data(data)
    
    print("\n🎉 Temperature data generation complete!")
    print("📄 File: sensor-data.json") 
    print("🌡️ Contains realistic temperature readings for 2 thermostats")
    print("🔄 Run your FastAPI backend to see periodic updates!")