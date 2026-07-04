import { useState, useEffect, useCallback } from 'react';

/**
 * Custom hook to manage browser geolocation
 */
export const useGeolocation = () => {
  const [location, setLocation] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isEnabled, setIsEnabled] = useState(() => {
    // Persist preference
    return localStorage.getItem('locationEnabled') === 'true';
  });

  const getLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      return;
    }

    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: position.timestamp,
        };
        setLocation(coords);
        setError(null);
        setLoading(false);
      },
      (err) => {
        let errorMsg = 'Failed to get location';
        if (err.code === 1) errorMsg = 'Location permission denied';
        else if (err.code === 2) errorMsg = 'Location unavailable';
        else if (err.code === 3) errorMsg = 'Location timeout';
        
        setError(errorMsg);
        setLoading(false);
        if (err.code === 1) setIsEnabled(false);
      },
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 60000 }
    );
  }, []);

  useEffect(() => {
    if (isEnabled) {
      getLocation();
      // Update location every 5 minutes if enabled
      const interval = setInterval(getLocation, 300000);
      return () => clearInterval(interval);
    } else {
      setLocation(null);
    }
    localStorage.setItem('locationEnabled', isEnabled);
  }, [isEnabled, getLocation]);

  const toggleLocation = useCallback(() => {
    setIsEnabled(prev => !prev);
  }, []);

  return { location, error, loading, isEnabled, toggleLocation, refreshLocation: getLocation };
};

export default useGeolocation;
