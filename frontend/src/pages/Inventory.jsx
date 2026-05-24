import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Package, 
  AlertOctagon, 
  CheckCircle2, 
  Search,
  SlidersHorizontal
} from 'lucide-react';
import StatCard from '../components/StatCard';
import Table from '../components/Table';
import { ALL_PRODUCTS } from '../data/mockData';

const Inventory = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRisk, setFilterRisk] = useState('All');

  const handleActionToForecast = (product) => {
    navigate('/forecast', { state: { product } });
  };

  // Search and risk filter handlers
  const filteredProducts = ALL_PRODUCTS.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          product.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          product.category.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRisk = filterRisk === 'All' ? true : product.risk === filterRisk;
    
    return matchesSearch && matchesRisk;
  });

  // Calculate statistics dynamically based on product database
  const totalSkus = ALL_PRODUCTS.length;
  const criticalCount = ALL_PRODUCTS.filter(p => p.risk === 'Critical').length;
  const highMediumCount = ALL_PRODUCTS.filter(p => p.risk === 'High' || p.risk === 'Medium').length;
  const safeCount = ALL_PRODUCTS.filter(p => p.risk === 'Safe').length;
  
  const stockHealthScore = Math.round(((safeCount + (highMediumCount * 0.5)) / totalSkus) * 100);

  return (
    <div className="space-y-6">
      
      {/* 1. Inventory Status Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard 
          title="Total Stock Keeping Units (SKUs)"
          value={`${totalSkus} Products`}
          change="100% cataloged"
          isPositive={true}
          subtext="across 5 major categories"
          icon={<Package className="w-5 h-5" />}
        />
        <StatCard 
          title="Critical Shortages"
          value={`${criticalCount} Products`}
          change="Requires reorder"
          isPositive={false}
          subtext="estimated loss ₹8,420/day"
          icon={<AlertOctagon className="w-5 h-5 text-rose-500" />}
          gradientBorder={criticalCount > 0}
        />
        <StatCard 
          title="Stock Health Rating"
          value={`${stockHealthScore}%`}
          change={stockHealthScore > 80 ? "Optimal turnover" : "Suboptimal turnover"}
          isPositive={stockHealthScore > 80}
          subtext="based on sales-to-stock ratio"
          icon={<CheckCircle2 className="w-5 h-5 text-emerald-500" />}
        />
      </div>

      {/* 2. Interactive Search & Filters Toolbar */}
      <div className="glass-card p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        {/* Search Bar Input */}
        <div className="relative flex-1">
          <Search className="absolute left-4 top-3 w-4.5 h-4.5 text-gray-400 dark:text-gray-500" />
          <input
            type="text"
            placeholder="Search by Product Name, ID, or Category..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 glass-input text-sm"
          />
        </div>

        {/* Risk Status Filter Dropdown */}
        <div className="flex items-center gap-3">
          <label className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5 font-mono">
            <SlidersHorizontal className="w-3.5 h-3.5" /> Filter Risk
          </label>
          <select
            value={filterRisk}
            onChange={(e) => setFilterRisk(e.target.value)}
            className="glass-input py-2 text-sm"
          >
            <option value="All">All Items ({totalSkus})</option>
            <option value="Critical">Critical Risk ({criticalCount})</option>
            <option value="High">High Risk</option>
            <option value="Medium">Medium Risk</option>
            <option value="Safe">Safe Stock</option>
          </select>
        </div>
      </div>

      {/* 3. Products Stock Table */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-base font-bold font-sans tracking-tight text-gray-900 dark:text-white md:text-lg">
              Stock Levels & Forecast Triggers
            </h4>
            <p className="text-xs text-gray-400 dark:text-gray-500">
              Interactive database showing stock volumes. Click 'Foresee Demand' to open a sandbox prediction pre-filled with that SKU's parameters.
            </p>
          </div>
          <span className="text-xs font-mono text-gray-400 bg-gray-100 dark:bg-white/5 border border-gray-200/50 dark:border-white/5 px-2.5 py-1 rounded-lg">
            Showing {filteredProducts.length} of {totalSkus} SKUs
          </span>
        </div>

        {filteredProducts.length > 0 ? (
          <Table
            headers={['Product ID', 'Product Name', 'Category', 'Stock Level', 'Current Price', 'Risk Score']}
            data={filteredProducts}
            onActionClick={handleActionToForecast}
          />
        ) : (
          <div className="glass-card py-16 text-center text-sm text-gray-500 dark:text-gray-400">
            No products match your search or filters. Try adjusting your query or resetting the risk dropdown.
          </div>
        )}
      </div>

    </div>
  );
};

export default Inventory;
