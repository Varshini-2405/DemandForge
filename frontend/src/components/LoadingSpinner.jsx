import React from 'react';
import { Sparkles } from 'lucide-react';

const LoadingSpinner = ({ message = "Analyzing store dynamics and running Random Forest predictor..." }) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 space-y-4 animate-pulse">
      {/* Pulsing loading sphere */}
      <div className="relative flex items-center justify-center w-20 h-20">
        {/* Glow halo */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-brand-purple to-brand-cyan opacity-40 blur-lg animate-ping"></div>
        {/* Inner spinner */}
        <div className="w-16 h-16 rounded-full border-4 border-brand-purple/20 border-t-brand-purple animate-spin"></div>
        <Sparkles className="absolute w-6 h-6 text-brand-cyan animate-pulse" />
      </div>
      
      <div className="text-center">
        <h5 className="text-sm font-semibold text-gray-900 dark:text-white">
          Generating AI Forecast
        </h5>
        <p className="mt-1 text-xs text-gray-400 dark:text-gray-500 max-w-xs font-mono">
          {message}
        </p>
      </div>
    </div>
  );
};

export default LoadingSpinner;
