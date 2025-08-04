import { useState, useEffect } from 'react';
import { formatDistanceToNow } from 'date-fns';

export const useRelativeTime = (timestamp, updateInterval = 60000) => {
  const [relativeTime, setRelativeTime] = useState('');

  useEffect(() => {
    if (!timestamp) {
      setRelativeTime('N/A');
      return;
    }

    const updateRelativeTime = () => {
      try {
        // Check if timestamp is already a relative string (like "Just now", "2 mins ago")
        if (typeof timestamp === 'string' && !timestamp.includes('T') && !timestamp.includes('Z')) {
          // If it's already a relative string, just use it as-is
          setRelativeTime(timestamp);
          return;
        }

        const date = new Date(timestamp);
        
        // Check if the date is valid
        if (isNaN(date.getTime())) {
          console.warn('Invalid timestamp:', timestamp);
          setRelativeTime(timestamp); // Fallback to original string
          return;
        }

        const now = new Date();
        const diffInSeconds = Math.floor((now - date) / 1000);
        const diffInMinutes = Math.floor(diffInSeconds / 60);
        const diffInHours = Math.floor(diffInMinutes / 60);

        // Show "just now" for very recent updates (less than 60 seconds)
        if (diffInSeconds < 60) {
          setRelativeTime('Just now');
        } else if (diffInMinutes < 60) {
          // Show in minute blocks: "1 min ago", "2 min ago", etc.
          setRelativeTime(`${diffInMinutes} min ago`);
        } else if (diffInHours < 24) {
          // Show in hour blocks: "1 hour ago", "2 hours ago", etc.
          const hourText = diffInHours === 1 ? 'hour' : 'hours';
          setRelativeTime(`${diffInHours} ${hourText} ago`);
        } else {
          // For longer periods, use date-fns formatting
          setRelativeTime(formatDistanceToNow(date, { addSuffix: true }));
        }
      } catch (error) {
        console.warn('Error formatting timestamp:', error);
        setRelativeTime(timestamp || 'N/A'); // Fallback to original string
      }
    };

    // Update immediately
    updateRelativeTime();

    // Set up interval to update every minute
    const interval = setInterval(updateRelativeTime, updateInterval);

    return () => clearInterval(interval);
  }, [timestamp, updateInterval]);

  return relativeTime;
};