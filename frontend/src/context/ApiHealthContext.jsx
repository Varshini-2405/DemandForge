import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { checkApiHealth, warmUpApiConnection } from '../services/api';

const ApiHealthContext = createContext(null);

const KEEPALIVE_MS = 10 * 60 * 1000;
const POLL_MS = 45 * 1000;

export function ApiHealthProvider({ children }) {
  const [checking, setChecking] = useState(true);
  const [online, setOnline] = useState(false);
  const [ready, setReady] = useState(false);
  const [latency, setLatency] = useState(0);
  const [modelDetails, setModelDetails] = useState(null);
  const warmedRef = useRef(false);
  const failStreakRef = useRef(0);

  const applyHealth = useCallback((health) => {
    if (health.online) {
      failStreakRef.current = 0;
      setOnline(true);
      setReady(health.ready ?? health.data?.model_loaded === true);
      setLatency(health.latency);
      setModelDetails(health.data);
      return;
    }
    failStreakRef.current += 1;
    if (failStreakRef.current >= 3) {
      setOnline(false);
      setReady(false);
    }
  }, []);

  const runCheck = useCallback(
    async (opts = {}) => {
      const health = await checkApiHealth(
        opts.fullWarmup ? { maxAttempts: 7 } : { maxAttempts: 2 }
      );
      applyHealth(health);
      return health;
    },
    [applyHealth]
  );

  useEffect(() => {
    let cancelled = false;

    const bootstrap = async () => {
      setChecking(true);
      const health = warmedRef.current
        ? await runCheck()
        : await warmUpApiConnection();

      if (cancelled) return;

      warmedRef.current = true;
      applyHealth(health);
      setChecking(false);
    };

    bootstrap();

    const poll = setInterval(() => {
      if (document.visibilityState === 'visible') {
        runCheck();
      }
    }, POLL_MS);

    const keepAlive = setInterval(() => {
      if (document.visibilityState === 'visible') {
        checkApiHealth({ maxAttempts: 1 }).then(applyHealth);
      }
    }, KEEPALIVE_MS);

    const onVisible = () => {
      if (document.visibilityState === 'visible') {
        runCheck({ fullWarmup: !online });
      }
    };
    document.addEventListener('visibilitychange', onVisible);

    return () => {
      cancelled = true;
      clearInterval(poll);
      clearInterval(keepAlive);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [applyHealth, runCheck]);

  const value = {
    checking,
    online,
    ready,
    latency,
    modelDetails,
    /** True when safe to show "connected" in UI (checking or online). */
    showConnected: checking || online,
    refresh: () => runCheck({ fullWarmup: true }),
  };

  return (
    <ApiHealthContext.Provider value={value}>{children}</ApiHealthContext.Provider>
  );
}

export function useApiHealth() {
  const ctx = useContext(ApiHealthContext);
  if (!ctx) {
    throw new Error('useApiHealth must be used within ApiHealthProvider');
  }
  return ctx;
}
