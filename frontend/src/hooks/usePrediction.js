import { useState, useEffect, useCallback } from 'react';
import { predictDemand } from '../services/api';

export const usePrediction = () => {
  const [prediction, setPrediction] = useState(null);
  const [baselinePrediction, setBaselinePrediction] = useState(null);
  const [insights, setInsights] = useState(null);
  const [forecastMeta, setForecastMeta] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [latency, setLatency] = useState(0);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const saved = localStorage.getItem('kiranaiq_prediction_history');
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch {
        setHistory([]);
      }
    }
  }, []);

  const saveToHistory = useCallback((inputData, result, festivalType) => {
    const item = {
      id: `HST-${Date.now()}`,
      timestamp: new Date().toLocaleString(),
      prediction: result.predicted_units_sold,
      baseline: result.baselinePrediction,
      latency: result.latency,
      festivalType: festivalType || 'None',
      label: result.meta?.product_name,
      input: inputData,
    };
    setHistory((prev) => {
      const updated = [item, ...prev].slice(0, 10);
      localStorage.setItem('kiranaiq_prediction_history', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const predict = useCallback(
    async (formData, festivalType = 'None') => {
      setLoading(true);
      setError(null);
      setPrediction(null);
      setBaselinePrediction(null);
      setInsights(null);
      setForecastMeta(null);

      try {
        const result = await predictDemand(formData);
        setPrediction(result.predicted_units_sold);
        setLatency(result.latency);
        setInsights(result.insights);
        setForecastMeta(result.meta);

        let baselineRes = null;
        if (formData.is_festival_near === 1) {
          try {
            const baseResult = await predictDemand({ ...formData, is_festival_near: 0, festival_type: 'None' });
            baselineRes = baseResult.predicted_units_sold;
            setBaselinePrediction(baselineRes);
          } catch {
            /* optional comparison */
          }
        }

        const full = { ...result, baselinePrediction: baselineRes };
        saveToHistory(formData, full, festivalType);
        return full;
      } catch (err) {
        const msg =
          err.response?.data?.detail ||
          (err.message === 'Network Error'
            ? 'Cannot reach backend. Ensure API is running on http://127.0.0.1:8000'
            : err.message) ||
          'Prediction failed';
        setError(typeof msg === 'string' ? msg : JSON.stringify(msg));
        throw new Error(typeof msg === 'string' ? msg : 'Prediction failed');
      } finally {
        setLoading(false);
      }
    },
    [saveToHistory]
  );

  const clearHistory = useCallback(() => {
    localStorage.removeItem('kiranaiq_prediction_history');
    setHistory([]);
  }, []);

  return {
    predict,
    prediction,
    baselinePrediction,
    insights,
    forecastMeta,
    loading,
    error,
    latency,
    history,
    clearHistory,
  };
};

export default usePrediction;
