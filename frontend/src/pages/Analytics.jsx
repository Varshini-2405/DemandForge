import React from 'react';
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  CartesianGrid
} from 'recharts';
import ChartCard from '../components/ChartCard';
import { 
  HISTORICAL_SALES_DEMAND, 
  STORE_PERFORMANCE, 
  CATEGORY_DISTRIBUTION 
} from '../data/mockData';

const Analytics = () => {
  
  // Custom Tooltip component for dark theme charts
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-brand-navy-light/95 border border-white/10 p-3 rounded-xl shadow-lg text-xs">
          <p className="font-bold text-gray-300 mb-1.5 font-mono">{label}</p>
          {payload.map((item, idx) => (
            <p key={idx} style={{ color: item.color }} className="font-semibold">
              {item.name}: {typeof item.value === 'number' && item.name.includes('Revenue') ? `₹${item.value.toLocaleString()}` : item.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      
      {/* Upper Grid: Trend Analysis & Store Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Area Chart: Sales vs Forecast */}
        <ChartCard 
          title="Sales Velocity vs. AI Forecast Comparison"
          subtitle="Analysis of forecasting accuracy against actual retail transaction logs"
        >
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={HISTORICAL_SALES_DEMAND} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="salesGrad2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06B6D4" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#06B6D4" stopOpacity={0.0}/>
                </linearGradient>
                <linearGradient id="forecastGrad2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0.0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="day" stroke="#9CA3AF" fontSize={11} />
              <YAxis stroke="#9CA3AF" fontSize={11} />
              <Tooltip content={<CustomTooltip />} />
              <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: '12px' }} />
              <Area type="monotone" dataKey="sales" name="Actual Sales" stroke="#06B6D4" strokeWidth={2} fill="url(#salesGrad2)" />
              <Area type="monotone" dataKey="forecast" name="AI Projections" stroke="#8B5CF6" strokeWidth={2} fill="url(#forecastGrad2)" />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Bar Chart: Revenue by Outlet */}
        <ChartCard 
          title="Gross Revenue & Transactions by Store Outlet"
          subtitle="Top performing branches evaluated by sales totals and customer traffic"
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={STORE_PERFORMANCE} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="name" stroke="#9CA3AF" fontSize={10} />
              <YAxis stroke="#9CA3AF" fontSize={11} />
              <Tooltip content={<CustomTooltip />} />
              <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: '12px' }} />
              <Bar dataKey="revenue" name="Monthly Revenue (₹)" fill="#8B5CF6" radius={[6, 6, 0, 0]} />
              <Bar dataKey="transactions" name="Transactions Count" fill="#06B6D4" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

      </div>

      {/* Lower Grid: Category Splits & Inventory Depletion */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Pie Chart: Product Distribution (1/3 Width) */}
        <ChartCard 
          title="Sales Share by Category" 
          subtitle="Percentage distribution of gross transaction volumes across categories"
        >
          <div className="flex flex-col items-center justify-center h-full">
            <div className="w-full h-56">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={CATEGORY_DISTRIBUTION}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={75}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {CATEGORY_DISTRIBUTION.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#111827', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '12px', fontSize: '11px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            
            {/* Category Labels Indicators */}
            <div className="grid grid-cols-2 gap-x-6 gap-y-2 mt-4 text-xs">
              {CATEGORY_DISTRIBUTION.map((item, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }}></span>
                  <span className="text-gray-600 dark:text-gray-400 font-medium">{item.name}</span>
                  <span className="font-mono font-bold text-gray-900 dark:text-white">({item.value}%)</span>
                </div>
              ))}
            </div>
          </div>
        </ChartCard>

        {/* Line Chart: Inventory Levels (2/3 Width) */}
        <div className="lg:col-span-2">
          <ChartCard 
            title="Weekly Stock Depletion Velocity"
            subtitle="Correlating items depletion logs against predicted sales speed"
          >
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={HISTORICAL_SALES_DEMAND} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="day" stroke="#9CA3AF" fontSize={11} />
                <YAxis stroke="#9CA3AF" fontSize={11} />
                <Tooltip content={<CustomTooltip />} />
                <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: '12px' }} />
                <Line type="monotone" dataKey="inventory" name="Available Stock Levels" stroke="#EC4899" strokeWidth={2.5} activeDot={{ r: 6 }} />
                <Line type="monotone" dataKey="sales" name="Depletion Velocity (Sales)" stroke="#06B6D4" strokeWidth={2} strokeDasharray="5 5" />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

      </div>

    </div>
  );
};

export default Analytics;
