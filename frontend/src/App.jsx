import React, { createContext, useContext, useState, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { X, CheckCircle2, AlertTriangle, AlertCircle } from 'lucide-react';
import AppLayout from './layouts/AppLayout';
import Dashboard from './pages/Dashboard';
import Forecast from './pages/Forecast';
import Analytics from './pages/Analytics';
import Inventory from './pages/Inventory';
import Settings from './pages/Settings';
import PredictionHistory from './pages/PredictionHistory';
import { ApiHealthProvider } from './context/ApiHealthContext';

export const ToastContext = createContext();
export const useToast = () => useContext(ToastContext);

const AppContent = () => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'success') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, 4000);
  }, []);

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  return (
    <ApiHealthProvider>
    <ToastContext.Provider value={{ addToast }}>
      <Router>
        <div className="flex min-h-screen bg-gray-50 text-gray-900 dark:bg-brand-navy-deep dark:text-gray-100 font-sans antialiased">
          <Routes>
            <Route element={<AppLayout />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/forecast" element={<Forecast />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/inventory" element={<Inventory />} />
              <Route path="/history" element={<PredictionHistory />} />
              <Route path="/settings" element={<Settings />} />
            </Route>
          </Routes>

            <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 max-w-sm w-full px-4 sm:px-0 pointer-events-none">
              {toasts.map((toast) => (
                <div
                  key={toast.id}
                  className={`glass-card pointer-events-auto p-4 shadow-lg border-l-4 flex justify-between items-start gap-3 animate-slide-in-right ${
                    toast.type === 'success'
                      ? 'border-l-emerald-500 bg-emerald-500/10 dark:bg-emerald-500/5 text-emerald-950 dark:text-emerald-300'
                      : toast.type === 'error'
                      ? 'border-l-rose-500 bg-rose-500/10 dark:bg-rose-500/5 text-rose-950 dark:text-rose-300'
                      : 'border-l-amber-500 bg-amber-500/10 dark:bg-amber-500/5 text-amber-950 dark:text-amber-300'
                  }`}
                >
                  <div className="mt-0.5 flex-shrink-0">
                    {toast.type === 'success' ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    ) : toast.type === 'error' ? (
                      <AlertCircle className="w-4 h-4 text-rose-500" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-amber-500" />
                    )}
                  </div>
                  <div className="flex-1 text-xs font-semibold leading-relaxed">{toast.message}</div>
                  <button
                    onClick={() => removeToast(toast.id)}
                    className="text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </Router>
      </ToastContext.Provider>
    </ApiHealthProvider>
  );
};

export default AppContent;
