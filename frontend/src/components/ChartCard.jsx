import React from 'react';

const ChartCard = ({ title, subtitle, children, actions }) => {
  return (
    <div className="glass-card p-6 relative overflow-hidden">
      {/* Header Info */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h4 className="text-base font-bold font-sans tracking-tight text-gray-900 dark:text-white md:text-lg">
            {title}
          </h4>
          {subtitle && (
            <p className="text-xs text-gray-400 dark:text-gray-500">
              {subtitle}
            </p>
          )}
        </div>
        
        {/* Dynamic header options */}
        {actions && (
          <div className="flex items-center gap-2">
            {actions}
          </div>
        )}
      </div>

      {/* Chart Canvas Area */}
      <div className="w-full h-80 min-h-[300px]">
        {children}
      </div>
    </div>
  );
};

export default ChartCard;
