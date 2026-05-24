import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Download, History, Search, Filter } from 'lucide-react';
import { getPredictionHistory } from '../services/api';
import { useToast } from '../App';
import LoadingSpinner from '../components/LoadingSpinner';

const PredictionHistory = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const { addToast } = useToast();

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const data = await getPredictionHistory();
        setHistory(data);
      } catch (err) {
        addToast('Failed to load prediction history', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, [addToast]);

  const handleExportCSV = () => {
    if (history.length === 0) {
      addToast('No data to export', 'warning');
      return;
    }
    
    const headers = ['Date', 'Product ID', 'Festival Type', 'Predicted Demand', 'Selling Price', 'Available Stock'];
    const csvContent = [
      headers.join(','),
      ...history.map(row => [
        new Date(row.created_at).toLocaleString(),
        row.product_id,
        row.festival_type || 'None',
        row.predicted_demand,
        row.price,
        row.stock_available
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `kiranaiq_predictions_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addToast('Report exported successfully!', 'success');
  };

  const filteredHistory = history.filter(item => 
    item.product_id.toString().includes(search) || 
    (item.festival_type && item.festival_type.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 glass-card p-6">
        <div>
          <h3 className="text-xl font-bold font-sans tracking-tight text-gray-900 dark:text-white flex items-center gap-2">
            <History className="w-5 h-5 text-brand-purple" />
            Prediction History
          </h3>
          <p className="text-sm text-gray-500 mt-1">Review and export your past AI forecasts.</p>
        </div>
        <button 
          onClick={handleExportCSV}
          className="glass-btn-secondary flex items-center gap-2"
        >
          <Download className="w-4 h-4" /> Export CSV
        </button>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="p-4 border-b border-gray-200/50 dark:border-white/5 flex gap-4 items-center">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search by Product ID or Festival..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="glass-input w-full pl-9"
            />
          </div>
          <button className="p-2 border border-gray-200/50 dark:border-white/10 rounded-xl text-gray-500 hover:bg-gray-100 dark:hover:bg-white/5">
            <Filter className="w-4 h-4" />
          </button>
        </div>

        {loading ? (
          <div className="p-12 flex justify-center">
            <LoadingSpinner />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-500 dark:text-gray-400">
              <thead className="text-xs uppercase bg-gray-50/50 dark:bg-brand-navy-light/50 text-gray-700 dark:text-gray-300 border-b border-gray-200/50 dark:border-white/5">
                <tr>
                  <th className="px-6 py-4">Date / Time</th>
                  <th className="px-6 py-4">Product ID</th>
                  <th className="px-6 py-4">Context</th>
                  <th className="px-6 py-4">Prediction</th>
                  <th className="px-6 py-4">Price</th>
                  <th className="px-6 py-4">Current Stock</th>
                </tr>
              </thead>
              <tbody>
                {filteredHistory.length > 0 ? (
                  filteredHistory.map((item) => (
                    <tr key={item.id} className="border-b border-gray-200/50 dark:border-white/5 hover:bg-gray-50/30 dark:hover:bg-white-[0.02]">
                      <td className="px-6 py-4 font-mono text-xs">
                        {new Date(item.created_at).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 font-bold text-gray-900 dark:text-white">
                        #{item.product_id}
                      </td>
                      <td className="px-6 py-4">
                        {item.festival_type && item.festival_type !== 'None' ? (
                          <span className="px-2 py-1 rounded text-[10px] bg-brand-purple/10 text-brand-purple border border-brand-purple/20 uppercase">
                            {item.festival_type}
                          </span>
                        ) : (
                          <span className="text-gray-400 text-xs italic">Baseline</span>
                        )}
                      </td>
                      <td className="px-6 py-4 font-bold text-brand-cyan">
                        {item.predicted_demand} units
                      </td>
                      <td className="px-6 py-4">
                        ₹{item.price}
                      </td>
                      <td className="px-6 py-4">
                        {item.stock_available} units
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                      No prediction records found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default PredictionHistory;
