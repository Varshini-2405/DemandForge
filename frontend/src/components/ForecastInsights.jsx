import React from 'react';
import { TrendingUp, TrendingDown, Minus, BrainCircuit, BarChart3, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';

const ForecastInsights = ({ insights, productName, storeName }) => {
  if (!insights) return null;

  const TrendIcon =
    insights.trend_direction === 'up'
      ? TrendingUp
      : insights.trend_direction === 'down'
      ? TrendingDown
      : Minus;

  const trendColor =
    insights.trend_direction === 'up'
      ? 'text-emerald-500'
      : insights.trend_direction === 'down'
      ? 'text-rose-500'
      : 'text-brand-cyan';

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-5 border border-brand-purple/20 bg-gradient-to-br from-brand-purple/5 to-brand-cyan/5"
    >
      <div className="flex items-center gap-2 mb-4">
        <BrainCircuit className="w-5 h-5 text-brand-purple" />
        <h4 className="text-sm font-bold text-gray-900 dark:text-white">AI Trend Analysis</h4>
        <span className="ml-auto text-[10px] font-mono text-gray-400 uppercase">
          Auto-computed from history
        </span>
      </div>

      {(productName || storeName) && (
        <p className="text-xs text-gray-500 mb-4">
          {productName && <span className="font-semibold text-gray-700 dark:text-gray-300">{productName}</span>}
          {storeName && <span> · {storeName}</span>}
        </p>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3 rounded-xl bg-white/50 dark:bg-brand-navy/40 border border-gray-200/50 dark:border-white/5">
          <p className="text-[10px] text-gray-400 uppercase font-mono">Yesterday</p>
          <p className="text-lg font-bold text-gray-900 dark:text-white">{insights.yesterday_sales}</p>
          <p className="text-[10px] text-gray-500">units sold</p>
        </div>
        <div className="p-3 rounded-xl bg-white/50 dark:bg-brand-navy/40 border border-gray-200/50 dark:border-white/5">
          <p className="text-[10px] text-gray-400 uppercase font-mono">Last week</p>
          <p className="text-lg font-bold text-gray-900 dark:text-white">{insights.last_week_sales}</p>
          <p className="text-[10px] text-gray-500">units sold</p>
        </div>
        <div className="p-3 rounded-xl bg-white/50 dark:bg-brand-navy/40 border border-gray-200/50 dark:border-white/5">
          <p className="text-[10px] text-gray-400 uppercase font-mono flex items-center gap-1">
            <BarChart3 className="w-3 h-3" /> 7-day avg
          </p>
          <p className="text-lg font-bold text-brand-cyan">{insights.weekly_avg_demand}</p>
        </div>
        <div className="p-3 rounded-xl bg-white/50 dark:bg-brand-navy/40 border border-gray-200/50 dark:border-white/5">
          <p className="text-[10px] text-gray-400 uppercase font-mono">14-day avg</p>
          <p className="text-lg font-bold text-gray-900 dark:text-white">{insights.fortnight_avg_demand}</p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${trendColor} bg-current/10`}>
          <TrendIcon className="w-3.5 h-3.5" />
          Trend: {insights.trend_direction}
        </span>
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
            insights.stock_risk_level === 'High'
              ? 'text-amber-500 bg-amber-500/10'
              : 'text-emerald-500 bg-emerald-500/10'
          }`}
        >
          {insights.stock_risk_level === 'High' && <AlertTriangle className="w-3.5 h-3.5" />}
          Stock risk: {insights.stock_risk_level}
        </span>
        <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-mono text-gray-500 bg-gray-100 dark:bg-white/5">
          {insights.data_points_used} history records
        </span>
      </div>
    </motion.div>
  );
};

export default ForecastInsights;
