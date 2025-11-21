import { useState, useEffect, useCallback } from 'react';

interface LocationState {
  lat: string | null;
  long: string | null;
  address: string | null;
  isLocationAvailable: boolean;
}

/**
 * Custom hook to manage location state and prevent infinite loops
 * when location is not available
 */
export const useLocationState = () => {
  const [locationState, setLocationState] = useState<LocationState>({
    lat: null,
    long: null,
    address: null,
    isLocationAvailable: false,
  });

  const updateLocationState = useCallback(() => {
    const savedLat = localStorage.getItem('selectedLocationLat');
    const savedLong = localStorage.getItem('selectedLocationLong');
    const savedAddress = localStorage.getItem('selectedLocation');

    const isLocationAvailable = !!(savedLat && savedLong);

    setLocationState({
      lat: savedLat,
      long: savedLong,
      address: savedAddress,
      isLocationAvailable,
    });

    console.log('📍 Location state updated:', {
      lat: savedLat ? parseFloat(savedLat) : 'Not available',
      long: savedLong ? parseFloat(savedLong) : 'Not available',
      address: savedAddress || 'Not available',
      isLocationAvailable,
    });
  }, []);

  // Load location state on mount
  useEffect(() => {
    updateLocationState();
  }, [updateLocationState]);

  // Listen for location changes
  useEffect(() => {
    const handleLocationChange = () => {
      updateLocationState();
    };

    window.addEventListener('locationChanged', handleLocationChange);
    window.addEventListener('storage', handleLocationChange);

    return () => {
      window.removeEventListener('locationChanged', handleLocationChange);
      window.removeEventListener('storage', handleLocationChange);
    };
  }, [updateLocationState]);

  return {
    ...locationState,
    updateLocationState,
  };
};
