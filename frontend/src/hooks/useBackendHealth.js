import { useApiHealth } from '../context/ApiHealthContext';

/**
 * @deprecated Prefer useApiHealth — kept for existing imports.
 */
export const useBackendHealth = () => {
  const { online, latency, checking, modelDetails, refresh } = useApiHealth();

  return {
    online,
    latency,
    loading: checking,
    modelDetails,
    triggerCheck: refresh,
  };
};
