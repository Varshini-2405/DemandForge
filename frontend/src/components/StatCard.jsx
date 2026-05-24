import React from 'react';

const StatCard = ({ title, value, change, isPositive, subtext, icon, gradientBorder }) => {
  return (
    <div className={`glass-card glass-card-hover relative overflow-hidden group p-6 ${
      gradientBorder ? 'before:absolute before:inset-x-0 before:top-0 before:h-[2px] before:bg-gradient-to-r before:from-brand-purple before:to-brand-cyan' : ''
    }`}>
      {/* Dynamic Background Hover Glow */}
      <div className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-10 bg-brand-purple blur-3xl group-hover:scale-150 transition-transform duration-500"></div>

      <div className="flex items-start justify-between">
        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
            {title}
          </p>
          <h3 className="text-2xl font-bold font-sans tracking-tight text-gray-900 dark:text-white md:text-3xl">
            {value}
          </h3>
        </div>

        {/* Dynamic Icon */}
        <div className="p-3 text-brand-purple bg-brand-purple/10 dark:bg-brand-purple/10 dark:text-brand-purple-light rounded-xl group-hover:bg-brand-purple group-hover:text-white transition-all duration-300">
          {icon}
        </div>
      </div>

      <div className="flex items-center gap-2 mt-4 text-sm">
        <span className={`font-semibold px-2 py-0.5 rounded-md ${
          isPositive 
            ? 'text-emerald-600 bg-emerald-500/10 dark:text-emerald-400' 
            : 'text-amber-600 bg-amber-500/10 dark:text-amber-400'
        }`}>
          {change}
        </span>
        <span className="text-xs text-gray-400 dark:text-gray-500 font-mono">
          {subtext}
        </span>
      </div>
    </div>
  );
};

export default StatCard;
