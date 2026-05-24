import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  IndianRupee, 
  ShoppingBag, 
  AlertTriangle, 
  MapPin, 
  Sparkles,
  ArrowRight,
  TrendingUp
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer,
  CartesianGrid
} from 'recharts';
import StatCard from '../components/StatCard';
import AlertBanner from '../components/AlertBanner';
import Table from '../components/Table';
import ChartCard from '../components/ChartCard';
import { GENERAL_STATS, AI_INSIGHTS, LOW_STOCK_PRODUCTS, HISTORICAL_SALES_DEMAND } from '../data/mockData';

const Dashboard = () => {
  const navigate = useNavigate();
  const [activeInsightIdx, setActiveInsightIdx] = useState(0);

  // Auto-scroll AI Insights ticker for dynamic feel
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveInsightIdx((prevIdx) => (prevIdx + 1) % AI_INSIGHTS.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const handleActionToForecast = (product) => {
    // Navigate to Forecast page and pass selected product data as state!
    // A fantastic DX touch so users can click "Foresee Demand" and have the form auto-fill!
    navigate('/forecast', { state: { product } });
  };

  return (
    <div className="space-y-6">
      
      {/* 1. Header Alert Banner (Dynamic seasonal warning) */}
      <AlertBanner 
        type="info"
        message="Upcoming Indian Festival Season: Demand is predicted to surge by 35% across Grocery and Confectionery categories over the next 15 days."
        actionText="Predict Stock Requirements Now"
        onActionClick={() => navigate('/forecast')}
      />

      {/* 2. KPI Metrics Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard 
          title="Monthly Revenue"
          value={GENERAL_STATS.monthlyRevenue.value}
          change={GENERAL_STATS.monthlyRevenue.change}
          isPositive={GENERAL_STATS.monthlyRevenue.isPositive}
          subtext={GENERAL_STATS.monthlyRevenue.subtext}
          icon={<IndianRupee className="w-5 h-5" />}
          gradientBorder={true}
        />
        <StatCard 
          title="Predicted Demand"
          value={GENERAL_STATS.predictedDemand.value}
          change={GENERAL_STATS.predictedDemand.change}
          isPositive={GENERAL_STATS.predictedDemand.isPositive}
          subtext={GENERAL_STATS.predictedDemand.subtext}
          icon={<ShoppingBag className="w-5 h-5" />}
        />
        <StatCard 
          title="Inventory Risk Alert"
          value={GENERAL_STATS.inventoryRisk.value}
          change={GENERAL_STATS.inventoryRisk.change}
          isPositive={GENERAL_STATS.inventoryRisk.isPositive}
          subtext={GENERAL_STATS.inventoryRisk.subtext}
          icon={<AlertTriangle className="w-5 h-5" />}
        />
        <StatCard 
          title="Active Outlets"
          value={GENERAL_STATS.activeStores.value}
          change={GENERAL_STATS.activeStores.change}
          isPositive={GENERAL_STATS.activeStores.isPositive}
          subtext={GENERAL_STATS.activeStores.subtext}
          icon={<MapPin className="w-5 h-5" />}
        />
      </div>

      {/* 3. AI Insights Ticker (Animated Vercel-style component) */}
      <div className="glass-card relative border border-brand-purple/20 p-5 overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-5 bg-brand-cyan blur-2xl"></div>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-brand-purple/10 text-brand-purple flex items-center justify-center animate-bounce">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold uppercase tracking-wider text-brand-purple font-mono">
                KiranaIQ Live AI Insights
              </h4>
              {/* Insight Content */}
              <p className="mt-1 text-sm font-semibold text-gray-900 dark:text-gray-100 transition-all duration-500">
                {AI_INSIGHTS[activeInsightIdx].message}
              </p>
            </div>
          </div>
          
          {/* Timeline Indicators */}
          <div className="flex items-center gap-4 text-xs font-mono text-gray-400">
            <span>{AI_INSIGHTS[activeInsightIdx].timestamp}</span>
            <div className="flex gap-1">
              {AI_INSIGHTS.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveInsightIdx(idx)}
                  className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                    idx === activeInsightIdx ? 'bg-brand-purple scale-110 w-4' : 'bg-gray-300 dark:bg-white/10'
                  }`}
                  aria-label={`Show insight ${idx+1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 4. Sales & Forecast Visualizer Graph */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Graph Canvas Card */}
        <div className="lg:col-span-2">
          <ChartCard 
            title="Weekly Sales Trend vs. AI Demand Forecast" 
            subtitle="Comparing actual transaction volume against predicted retail demand curves"
            actions={
              <button 
                onClick={() => navigate('/analytics')}
                className="text-xs font-bold text-brand-cyan hover:underline flex items-center gap-1 uppercase tracking-wider"
              >
                Full Analytics <ArrowRight className="w-3 h-3" />
              </button>
            }
          >
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={HISTORICAL_SALES_DEMAND} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06B6D4" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#06B6D4" stopOpacity={0.0}/>
                  </linearGradient>
                  <linearGradient id="forecastGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" opacity={0.1}/>
                <XAxis dataKey="day" stroke="#9CA3AF" fontSize={11} fontStyle="italic"/>
                <YAxis stroke="#9CA3AF" fontSize={11}/>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#111827', 
                    border: '1px solid rgba(255, 255, 255, 0.1)', 
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '12px'
                  }}
                />
                <Area type="monotone" dataKey="sales" name="Actual Sales" stroke="#06B6D4" strokeWidth={2.5} fillOpacity={1} fill="url(#salesGrad)" />
                <Area type="monotone" dataKey="forecast" name="AI Predicted Demand" stroke="#8B5CF6" strokeWidth={2.5} fillOpacity={1} fill="url(#forecastGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        {/* Store Performance Insights (Right Grid Card) */}
        <div className="glass-card p-6 flex flex-col justify-between">
          <div className="space-y-4">
            <h4 className="text-base font-bold font-sans tracking-tight text-gray-900 dark:text-white md:text-lg flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-brand-cyan" /> Store Performance Overview
            </h4>
            <p className="text-xs text-gray-400 dark:text-gray-500">
              Analysis of transactions and revenue growth parameters across all 4 operational store locations.
            </p>
            
            <div className="space-y-3 pt-2">
              <div className="flex justify-between items-center text-sm border-b border-gray-200/50 dark:border-white/5 pb-2">
                <span className="text-gray-500 dark:text-gray-400">Total Transactions</span>
                <span className="font-semibold text-gray-900 dark:text-white font-mono">3,250 sales</span>
              </div>
              <div className="flex justify-between items-center text-sm border-b border-gray-200/50 dark:border-white/5 pb-2">
                <span className="text-gray-500 dark:text-gray-400">Average Cart Size</span>
                <span className="font-semibold text-gray-900 dark:text-white font-mono">₹148.40</span>
              </div>
              <div className="flex justify-between items-center text-sm border-b border-gray-200/50 dark:border-white/5 pb-2">
                <span className="text-gray-500 dark:text-gray-400">Out-of-Stock Loss</span>
                <span className="font-semibold text-rose-500 font-mono">-₹18,250</span>
              </div>
              <div className="flex justify-between items-center text-sm pb-2">
                <span className="text-gray-500 dark:text-gray-400">Stock Turn Rate</span>
                <span className="font-semibold text-emerald-500 font-mono">4.2x/mo</span>
              </div>
            </div>
          </div>

          <button 
            onClick={() => navigate('/inventory')}
            className="w-full mt-6 glass-btn-secondary text-xs flex justify-center items-center"
          >
            Review Inventory Health
          </button>
        </div>

      </div>

      {/* 5. Inventory Risk Alert Table Preview */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h4 className="text-base font-bold font-sans tracking-tight text-gray-900 dark:text-white md:text-lg">
              Critical Low Stock & Demand Intersections
            </h4>
            <p className="text-xs text-gray-400 dark:text-gray-500">
              Products with critical stock levels that have active consumer demand patterns.
            </p>
          </div>
          <button 
            onClick={() => navigate('/inventory')}
            className="self-start sm:self-center text-xs font-bold text-brand-purple hover:underline flex items-center gap-1 uppercase tracking-wider"
          >
            Full Inventory List <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        <Table 
          headers={['Product ID', 'Product Name', 'Category', 'Stock Level', 'Current Price', 'Risk Score']} 
          data={LOW_STOCK_PRODUCTS}
          onActionClick={handleActionToForecast}
        />
      </div>

    </div>
  );
};

export default Dashboard;
