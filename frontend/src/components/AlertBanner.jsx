import React from 'react';
import { AlertCircle, X, Sparkles, TrendingUp } from 'lucide-react';

const AlertBanner = ({ type = "warning", message, actionText, onActionClick, onClose }) => {
  const isWarning = type === 'warning';
  const isPositive = type === 'positive';

  return (
    <div className={`glass-card border-l-4 relative p-4 pr-12 animate-slide-down ${
      isWarning 
        ? 'border-l-amber-500 bg-amber-500/5 text-amber-900 dark:text-amber-300 dark:border-l-amber-400' 
        : isPositive
        ? 'border-l-brand-purple bg-brand-purple/5 text-brand-purple dark:text-brand-purple-light dark:border-l-brand-purple'
        : 'border-l-brand-cyan bg-brand-cyan/5 text-brand-cyan dark:text-brand-cyan-light dark:border-l-brand-cyan'
    }`}>
      
      <div className="flex items-start gap-3">
        {/* Dynamic Icon */}
        <div className="mt-0.5">
          {isWarning ? (
            <AlertCircle className="w-5 h-5 text-amber-500" />
          ) : isPositive ? (
            <Sparkles className="w-5 h-5 text-brand-purple" />
          ) : (
            <TrendingUp className="w-5 h-5 text-brand-cyan" />
          )}
        </div>
        
        {/* Text */}
        <div className="text-sm">
          <p className="font-medium">{message}</p>
          {actionText && (
            <button 
              onClick={onActionClick}
              className="mt-2 text-xs font-bold underline uppercase hover:opacity-85 transition-opacity"
            >
              {actionText}
            </button>
          )}
        </div>
      </div>

      {/* Close button */}
      {onClose && (
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
          aria-label="Dismiss Alert"
        >
          <X className="w-4 h-4" />
        </button>
      )}

    </div>
  );
};

export default AlertBanner;
