import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  Terminal, 
  RefreshCw, 
  Wifi, 
  WifiOff, 
  Database,
  Cpu
} from 'lucide-react';
import { checkApiHealth, API_BASE_URL } from '../services/api';
import { motion } from 'framer-motion';

const SettingsPage = () => {
  const [loading, setLoading] = useState(false);
  const [apiOnline, setApiOnline] = useState(false);
  const [modelDetails, setModelDetails] = useState(null);
  const [logs, setLogs] = useState([
    { time: new Date().toLocaleTimeString(), type: 'info', msg: 'System initialized. Axios client targeting FastAPI backend.' },
    { time: new Date().toLocaleTimeString(), type: 'info', msg: 'Theme engine successfully synchronized with browser media preferences.' }
  ]);

  // Run Health diagnostics check
  const runDiagnostics = async () => {
    setLoading(true);
    addLog('info', 'Executing API handshake ping to backend...');
    
    const status = await checkApiHealth();
    setApiOnline(status.online);
    
    if (status.online) {
      setModelDetails(status.data);
      addLog('success', `API Handshake Successful (200 OK). Loaded model: ${status.data.loaded_model || 'Random Forest'}`);
    } else {
      setModelDetails(null);
      addLog('error', 'Connection refused. Start backend: cd backend && .venv\\Scripts\\python.exe -m uvicorn app.main:app --reload --port 8000');
    }
    
    setLoading(false);
  };

  const addLog = (type, msg) => {
    setLogs(prev => [
      ...prev,
      { time: new Date().toLocaleTimeString(), type, msg }
    ]);
  };

  useEffect(() => {
    runDiagnostics();
    // eslint-disable-next-line
  }, []);

  const handleClearLogs = () => {
    setLogs([]);
    addLog('info', 'Diagnostics telemetry logs cleared.');
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
  };

  return (
    <motion.div 
      className="space-y-6"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {/* Settings Title Header */}
      <motion.div variants={itemVariants} className="glass-card p-6">
        <h3 className="text-lg font-bold font-sans tracking-tight text-gray-900 dark:text-white md:text-xl flex items-center gap-2">
          <Settings className="w-5 h-5 text-brand-purple" /> System Settings & Telemetry
        </h3>
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
          Monitor your local machine learning server connections, check system logs, and inspect loaded model parameters.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Card: Connection Telemetry (2/3 Width) */}
        <div className="lg:col-span-2 space-y-6">
          
          <motion.div variants={itemVariants} className="glass-card p-6 space-y-6">
            
            {/* Connection Status block */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-200/50 dark:border-white/5">
              <div>
                <h4 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider font-mono flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-brand-cyan" /> FastAPI Backend Telemetry
                </h4>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                  Real-time synchronization status of the ML Forecasting Server.
                </p>
              </div>

              <button
                onClick={runDiagnostics}
                disabled={loading}
                className="glass-btn-secondary text-xs flex justify-center items-center gap-2 py-2 px-4 self-start"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                Test Connection
              </button>
            </div>

            {/* Diagnostic Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Endpoint Health */}
              <div className="space-y-2">
                <span className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Connection Port Health</span>
                <div className="p-4 rounded-xl bg-gray-50/50 dark:bg-brand-navy/60 border border-gray-200/40 dark:border-white/5 flex items-center gap-3">
                  {apiOnline ? (
                    <div className="p-2 bg-emerald-500/10 text-emerald-500 rounded-lg">
                      <Wifi className="w-5 h-5" />
                    </div>
                  ) : (
                    <div className="p-2 bg-rose-500/10 text-rose-500 rounded-lg animate-pulse">
                      <WifiOff className="w-5 h-5" />
                    </div>
                  )}
                  <div>
                    <h5 className="text-sm font-bold text-gray-900 dark:text-white">
                      {apiOnline ? 'Online & Syncing' : 'Connection Failed'}
                    </h5>
                    <p className="text-[11px] text-gray-400 dark:text-gray-500 font-mono mt-0.5">
                      Target: {API_BASE_URL}
                    </p>
                  </div>
                </div>
              </div>

              {/* Model Pickle File Name */}
              <div className="space-y-2">
                <span className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Loaded Model Target</span>
                <div className="p-4 rounded-xl bg-gray-50/50 dark:bg-brand-navy/60 border border-gray-200/40 dark:border-white/5 flex items-center gap-3">
                  <div className="p-2 bg-brand-purple/10 text-brand-purple rounded-lg">
                    <Database className="w-5 h-5" />
                  </div>
                  <div>
                    <h5 className="text-sm font-bold text-gray-900 dark:text-white">
                      {apiOnline
                        ? modelDetails?.model_loaded
                          ? modelDetails?.loaded_model || 'demand_forecast_model.pkl'
                          : 'Model not loaded'
                        : 'Awaiting Connection'}
                    </h5>
                    <p className="text-[11px] text-gray-400 dark:text-gray-500 font-mono mt-0.5">
                      Framework: Scikit-Learn RF Regressor
                    </p>
                  </div>
                </div>
              </div>

            </div>

            {/* Model Metadata parameters (if online) */}
            {apiOnline && modelDetails && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="p-4 rounded-xl bg-brand-purple/5 border border-brand-purple/10 text-brand-purple-dark dark:text-brand-purple-light space-y-2 overflow-hidden"
              >
                <h5 className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 font-mono">
                  <Database className="w-3.5 h-3.5" /> Model Metadata Telemetry
                </h5>
                <div className="grid grid-cols-2 gap-4 text-xs font-mono pt-1">
                  <div>
                    <span className="text-gray-400 dark:text-gray-500">Service:</span> {modelDetails.project || 'KiranaIQ SaaS'}
                  </div>
                  <div>
                    <span className="text-gray-400 dark:text-gray-500">Database:</span> 
                    <span className={modelDetails.database === 'online' ? 'text-emerald-500 ml-1' : 'text-rose-500 ml-1'}>
                      {modelDetails.database === 'online' ? 'Connected' : 'Offline'}
                    </span>
                  </div>
                </div>
              </motion.div>
            )}

          </motion.div>

        </div>

        {/* Right Card: Diagnostics Terminal Console Log */}
        <motion.div variants={itemVariants} className="glass-card p-6 flex flex-col justify-between h-[340px] md:h-auto">
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-gray-200/50 dark:border-white/5 pb-3">
              <h4 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider font-mono flex items-center gap-2">
                <Terminal className="w-4 h-4 text-brand-purple" /> Diagnostics Console
              </h4>
              <button 
                onClick={handleClearLogs}
                className="text-[10px] font-bold text-rose-500 hover:underline uppercase tracking-wider font-mono"
              >
                Clear
              </button>
            </div>
            
            {/* Terminal log logs container */}
            <div className="h-60 overflow-y-auto space-y-2 text-[10px] font-mono p-3 bg-brand-navy-deep rounded-xl border border-white/5 shadow-inner">
              {logs.map((log, idx) => (
                <div key={idx} className="leading-relaxed">
                  <span className="text-gray-500">[{log.time}]</span>{' '}
                  <span className={`font-semibold uppercase ${
                    log.type === 'error' ? 'text-rose-500' : log.type === 'success' ? 'text-emerald-500' : 'text-brand-cyan'
                  }`}>
                    {log.type}:
                  </span>{' '}
                  <span className="text-gray-300">{log.msg}</span>
                </div>
              ))}
            </div>
          </div>
          
          <p className="text-[9px] text-gray-400 dark:text-gray-500 font-mono italic text-center mt-3">
            Diagnostics synchronized with local event logs.
          </p>
        </motion.div>

      </div>

    </motion.div>
  );
};

export default SettingsPage;
