import { useState, useEffect, useCallback } from 'react';
import { checkApiHealth } from '../services/api';

/**
 * Custom React Hook to track FastAPI backend connectivity health and request latency.
 * 
 * @returns {Object} { online, latency, loading, modelDetails, triggerCheck }
 */
export const useBackendHealth = () => {
  const [online, setOnline] = useState(false);
  const [latency, setLatency] = useState(0);
  const [loading, setLoading] = useState(false);
  const [modelDetails, setModelDetails] = useState(null);

  const triggerCheck = useCallback(async () => {
    setLoading(true);
    const health = await checkApiHealth();
    setOnline(health.online);
    setLatency(health.latency);
    setModelDetails(health.data);
    setLoading(false);
    return health;
  }, []);

  // Periodic health check run every 15 seconds
  useEffect(() => {
    triggerCheck();
    const interval = setInterval(triggerCheck, 15000);
    return () => clearInterval(interval);
  }, [triggerCheck]);

  return {
    online,
    latency,
    loading,
    modelDetails,
    triggerCheck
  };
};
