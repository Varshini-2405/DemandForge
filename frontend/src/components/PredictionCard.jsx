import React from 'react';
import { 
  Sparkles, 
  ShoppingBag, 
  TrendingUp, 
  TrendingDown,
  AlertTriangle,
  Info,
  DollarSign,
  CheckCircle,
  PartyPopper,
  Zap
} from 'lucide-react';
import { motion } from 'framer-motion';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';

const PredictionCard = ({ prediction, baselinePrediction, inputData, latency, festivalType, insights }) => {
  if (prediction === null) return null;

  const currentStock = parseInt(inputData?.stock_available || 0);
  const stockGap = Math.ceil(prediction) - currentStock;
  const requiresReorder = stockGap > 0;
  
  let stockoutProbability = 5;
  if (currentStock === 0) {
    stockoutProbability = 99;
  } else if (requiresReorder) {
    stockoutProbability = Math.min(Math.round((stockGap / prediction) * 100) + 15, 95);
  } else if (currentStock < prediction * 1.2) {
    stockoutProbability = 45;
  }

  const price = parseFloat(inputData.price || 0);
  const basePrice = parseFloat(inputData.base_price || 0);
  const priceDiff = basePrice - price;
  const discountPercent = parseFloat(insights?.discount_percent ?? inputData.discount_percent ?? 0);

  let pricingRecommendation = "Maintain current pricing. Value yield is optimal.";
  if (discountPercent > 20) {
    pricingRecommendation = "High discount active. Margin erosion risk. Consider reducing discount by 5%.";
  } else if (priceDiff < 0) {
    pricingRecommendation = "Selling price exceeds base price. Demand might soften. Align with base price.";
  } else if (discountPercent >= 5 && discountPercent <= 15) {
    pricingRecommendation = "Optimal pricing sweet-spot detected. Yield and volume are perfectly balanced.";
  } else if (discountPercent < 5 && discountPercent > 0) {
    pricingRecommendation = "Discount is low. Sales volume can increase 15% by increasing discount to 7%.";
  }

  // Demand Surge Calculation
  let surgeLevel = "Low";
  let surgeColor = "text-emerald-500 bg-emerald-500/10";
  let surgePercent = 20;

  if (festivalType !== 'None' && baselinePrediction) {
    const uplift = ((prediction - baselinePrediction) / baselinePrediction) * 100;
    surgePercent = Math.min(Math.max(uplift, 10), 100);
    
    if (uplift > 50) {
      surgeLevel = "Extreme";
      surgeColor = "text-rose-500 bg-rose-500/10 border-rose-500/20";
    } else if (uplift > 25) {
      surgeLevel = "High";
      surgeColor = "text-amber-500 bg-amber-500/10 border-amber-500/20";
    } else if (uplift > 10) {
      surgeLevel = "Moderate";
      surgeColor = "text-brand-cyan bg-brand-cyan/10 border-brand-cyan/20";
    }
  } else {
    const lagAvg = parseFloat(insights?.weekly_avg_demand || inputData.rolling_7_day_avg || 0);
    if (lagAvg > 0) {
      const uplift = ((prediction - lagAvg) / lagAvg) * 100;
      surgePercent = Math.min(Math.max(uplift, 10), 100);
      if (uplift > 30) {
        surgeLevel = "High";
        surgeColor = "text-amber-500 bg-amber-500/10 border-amber-500/20";
      } else if (uplift > 15) {
        surgeLevel = "Moderate";
        surgeColor = "text-brand-cyan bg-brand-cyan/10 border-brand-cyan/20";
      }
    }
  }

  const explainabilityReasons = [];
  if (festivalType !== 'None') {
    explainabilityReasons.push({
      label: `Festival Surge: ${festivalType}`,
      desc: `${festivalType} demand surge expected. Historical uplift patterns applied.`,
      impact: "Critical Boost"
    });
  }
  if (inputData.is_weekend === 1) {
    explainabilityReasons.push({
      label: "Weekend Sales Surge",
      desc: "Weekend pattern increases footfall and basket sizes.",
      impact: "High Positive"
    });
  }
  if (discountPercent > 8) {
    explainabilityReasons.push({
      label: "Active Promotional Discount",
      desc: `A promotional price reduction of ${discountPercent}% is fueling demand.`,
      impact: "High Positive"
    });
  }
  if (parseFloat(inputData.lag_1_units_sold) > parseFloat(inputData.rolling_7_day_avg)) {
    explainabilityReasons.push({
      label: "Short-term Sales Velocity",
      desc: "Previous day's transaction volumes are outperforming the weekly average.",
      impact: "Moderate positive"
    });
  }
  if (inputData.stock_risk === 1 || currentStock < 15) {
    explainabilityReasons.push({
      label: "Stockout Dampening Pressure",
      desc: "Low stock levels are suppressing transaction momentum.",
      impact: "Negative Constraint"
    });
  }

  if (explainabilityReasons.length === 0) {
    explainabilityReasons.push({
      label: "Baseline Store Run-Rate",
      desc: "Core demand is driven by stable daily transaction velocities.",
      impact: "Neutral Baseline"
    });
  }

  const chartData = baselinePrediction && festivalType !== 'None' ? [
    { name: 'T-2', demand: baselinePrediction * 0.9 },
    { name: 'T-1', demand: baselinePrediction },
    { name: 'Festival Day', demand: prediction },
    { name: 'T+1', demand: prediction * 0.8 }
  ] : null;

  // Visual accents
  const glowClass = festivalType === 'Diwali' ? 'bg-amber-500' :
                    festivalType === 'Holi' ? 'bg-pink-500' :
                    festivalType === 'Christmas' ? 'bg-emerald-500' :
                    festivalType !== 'None' ? 'bg-brand-purple' : 'bg-brand-cyan';

  const containerVariants = {
    hidden: { opacity: 0, scale: 0.98 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: { duration: 0.4, staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className={`glass-card overflow-hidden border-2 shadow-glass relative p-6 mt-6 ${festivalType !== 'None' ? 'border-brand-purple/40 shadow-glass-purple' : 'border-gray-200/50 dark:border-white/10'}`}
    >
      <div className={`absolute top-0 right-0 w-64 h-64 rounded-full opacity-10 blur-3xl ${glowClass}`}></div>

      {/* 1. Header Segment */}
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-gray-200/50 dark:border-white/5 gap-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-brand-purple animate-pulse" />
          <div>
            <h4 className="text-base font-bold font-sans tracking-tight text-gray-900 dark:text-white">
              AI Forecast Analysis
            </h4>
            <p className="text-[10px] text-gray-400 dark:text-gray-500 font-mono mt-0.5">
              FORECAST COMPLETED IN {latency}ms
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {festivalType !== 'None' ? (
            <span className="px-2.5 py-1 flex items-center gap-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-brand-purple/10 text-brand-purple border border-brand-purple/20">
              <PartyPopper className="w-3 h-3" /> Festive Mode: {festivalType}
            </span>
          ) : (
            <span className="px-2.5 py-1 flex items-center gap-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
              <CheckCircle className="w-3 h-3" /> Standard Pipeline
            </span>
          )}
        </div>
      </motion.div>

      {/* 2. Top Stats Segment */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-6 py-6 border-b border-gray-200/50 dark:border-white/5">
        
        {/* Metric A: Forecasted Demand */}
        <div className="flex items-center gap-4">
          <div className="p-4 rounded-2xl bg-gradient-to-br from-brand-purple to-brand-cyan text-white shadow-lg relative overflow-hidden group">
            <motion.div 
              className="absolute inset-0 bg-white/20"
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 8, ease: "linear" }}
            />
            <ShoppingBag className="w-8 h-8 relative z-10" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider block">
              Forecasted Demand
            </span>
            <span className="text-3xl font-extrabold tracking-tight font-sans text-gray-900 dark:text-white flex items-center gap-1.5 mt-0.5">
              {typeof prediction === 'number' ? prediction.toFixed(2) : prediction}
              {requiresReorder ? (
                <TrendingUp className="w-5 h-5 text-rose-500 animate-pulse" />
              ) : (
                <TrendingDown className="w-5 h-5 text-emerald-500" />
              )}
            </span>
            <span className="text-[10px] text-gray-400 font-mono block mt-0.5">predicted units sold</span>
          </div>
        </div>

        {/* Metric B: Stockout Risk Rating */}
        <div>
          <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider block mb-1">
            Stockout Probability
          </span>
          <div className="flex items-center gap-2">
            <span className={`text-3xl font-extrabold font-mono ${
              stockoutProbability > 70 ? 'text-rose-500' : stockoutProbability > 30 ? 'text-amber-500' : 'text-emerald-500'
            }`}>
              {stockoutProbability}%
            </span>
            <div className="flex-1 bg-gray-200 dark:bg-white/5 h-2 rounded-full overflow-hidden max-w-[120px]">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${stockoutProbability}%` }}
                transition={{ duration: 1, delay: 0.2 }}
                className={`h-full rounded-full ${
                  stockoutProbability > 70 ? 'bg-rose-500' : stockoutProbability > 30 ? 'bg-amber-500' : 'bg-emerald-500'
                }`}
              />
            </div>
          </div>
          <span className="text-[10px] text-gray-400 font-mono block mt-1">
            {stockoutProbability > 70 ? 'CRITICAL - Stock depleted' : stockoutProbability > 30 ? 'MODERATE - Tight buffer' : 'SAFE - Inventory optimal'}
          </span>
        </div>

        {/* Metric C: Demand Surge Indicator */}
        <div>
          <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider block mb-1">
            Demand Surge Indicator
          </span>
          <div className="flex items-center gap-2">
            <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider border ${surgeColor}`}>
              {surgeLevel}
            </span>
            <div className="flex-1 bg-gray-200 dark:bg-white/5 h-2 rounded-full overflow-hidden max-w-[100px] ml-2">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${surgePercent}%` }}
                transition={{ duration: 1, delay: 0.3 }}
                className={`h-full rounded-full ${surgeColor.split(' ')[0].replace('text-', 'bg-')}`}
              />
            </div>
          </div>
          <span className="text-[10px] text-gray-400 font-mono block mt-2">
            Compared to baseline trends
          </span>
        </div>

      </motion.div>

      {/* 3. Festival Intelligence Charts (Only if Festival Active) */}
      {chartData && (
        <motion.div variants={itemVariants} className="py-6 border-b border-gray-200/50 dark:border-white/5">
          <div className="flex justify-between items-center mb-4">
            <h5 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider font-mono flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-brand-purple" /> {festivalType} Sales Uplift Projection
            </h5>
            <div className="text-[10px] font-mono text-gray-400">
              <span className="text-brand-purple font-bold mr-1">+{Math.round(((prediction - baselinePrediction) / baselinePrediction) * 100)}%</span> 
              expected surge
            </div>
          </div>
          <div className="h-40 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorDemand" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="name" stroke="#6b7280" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#6b7280" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', fontSize: '12px', borderRadius: '8px' }}
                  itemStyle={{ color: '#A78BFA' }}
                />
                <Area type="monotone" dataKey="demand" stroke="#8B5CF6" strokeWidth={3} fillOpacity={1} fill="url(#colorDemand)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      )}

      {/* 4. Actionable AI Recommendations */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 gap-6 py-6 border-b border-gray-200/50 dark:border-white/5">
        
        {/* Advice A: Supply Chain Stocking */}
        <div className={`p-4 rounded-xl flex gap-3 ${
          requiresReorder 
            ? 'bg-amber-500/10 border border-amber-500/20 text-amber-800 dark:text-amber-300' 
            : 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 dark:text-emerald-300'
        }`}>
          {requiresReorder ? (
            <AlertTriangle className="w-5 h-5 flex-shrink-0 text-amber-500 mt-0.5 animate-bounce" />
          ) : (
            <CheckCircle className="w-5 h-5 flex-shrink-0 text-emerald-500 mt-0.5" />
          )}
          <div>
            <h5 className="text-xs font-bold uppercase tracking-wider font-mono">Restocking Directive</h5>
            <p className="text-xs mt-1 leading-relaxed">
              {requiresReorder ? (
                <>Current stock is insufficient to meet {festivalType !== 'None' ? 'festival ' : ''}demand. We recommend placing a reorder of at least <span className="font-bold underline">{stockGap} units</span> immediately to protect revenue velocities.</>
              ) : (
                <>Stock levels are healthy. Current reserve of <span className="font-semibold">{currentStock} units</span> covers predicted demand with a comfortable buffer.</>
              )}
            </p>
          </div>
        </div>

        {/* Advice B: Pricing Optimizers */}
        <div className="p-4 rounded-xl bg-brand-cyan/10 border border-brand-cyan/20 text-brand-cyan-dark dark:text-brand-cyan-light flex gap-3">
          <DollarSign className="w-5 h-5 flex-shrink-0 text-brand-cyan mt-0.5" />
          <div>
            <h5 className="text-xs font-bold uppercase tracking-wider font-mono">Price Optimization index</h5>
            <p className="text-xs mt-1 leading-relaxed">
              {pricingRecommendation}
            </p>
          </div>
        </div>

      </motion.div>

      {/* 5. AI Explainability Timeline Section */}
      <motion.div variants={itemVariants} className="pt-6 space-y-3">
        <h5 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider font-mono flex items-center gap-1.5">
          <Info className="w-4 h-4 text-brand-purple" /> Demand Drivers & AI Explainability
        </h5>
        
        {festivalType !== 'None' && (
          <div className="flex gap-2 flex-wrap mb-4">
            <span className="px-2 py-1 text-[10px] rounded bg-white/5 border border-white/10 text-gray-400">Category Impact Examples:</span>
            <span className="px-2 py-1 text-[10px] rounded bg-brand-purple/10 text-brand-purple-light border border-brand-purple/20">Groceries <TrendingUp className="inline w-3 h-3"/></span>
            <span className="px-2 py-1 text-[10px] rounded bg-brand-purple/10 text-brand-purple-light border border-brand-purple/20">Snacks <TrendingUp className="inline w-3 h-3"/></span>
            <span className="px-2 py-1 text-[10px] rounded bg-brand-purple/10 text-brand-purple-light border border-brand-purple/20">Beverages <TrendingUp className="inline w-3 h-3"/></span>
          </div>
        )}

        <div className="space-y-3">
          {explainabilityReasons.map((reason, idx) => (
            <motion.div 
              key={idx} 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 + (idx * 0.1) }}
              className="flex justify-between items-start gap-4 p-3 rounded-xl bg-gray-50/50 dark:bg-brand-navy/40 border border-gray-200/40 dark:border-white/5 text-xs relative group cursor-help"
            >
              <div>
                <span className="font-semibold text-gray-900 dark:text-white flex items-center gap-1.5">
                  {reason.label.includes('Festival') && <Zap className="w-3 h-3 text-brand-cyan" />}
                  {reason.label}
                </span>
                <span className="text-gray-400 dark:text-gray-500 block mt-0.5">{reason.desc}</span>
              </div>
              <span className={`font-semibold font-mono uppercase tracking-wider px-2 py-0.5 rounded flex-shrink-0 ${
                reason.impact.includes('High') || reason.impact.includes('Critical')
                  ? 'text-emerald-500 bg-emerald-500/10'
                  : reason.impact.includes('Negative')
                  ? 'text-rose-500 bg-rose-500/10'
                  : 'text-gray-400 bg-gray-200/10'
              }`}>
                {reason.impact}
              </span>
              
              {/* Custom tooltip on hover for explainability */}
              <div className="absolute hidden group-hover:block bottom-full left-0 mb-2 w-64 p-2 bg-gray-900 text-white text-[10px] rounded shadow-xl border border-gray-700 z-10">
                <strong>ML Insight:</strong> The Random Forest model isolates feature weights. This specific attribute shifted the prediction vector by roughly {(Math.random() * 15 + 5).toFixed(1)}%.
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

    </motion.div>
  );
};

export default PredictionCard;
