import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import {
  Sparkles,
  Trash2,
  Store,
  Package,
  Calendar,
  PartyPopper,
  History,
  Activity,
  Wand2,
} from 'lucide-react';
import { motion } from 'framer-motion';
import LoadingSpinner from '../components/LoadingSpinner';
import PredictionCard from '../components/PredictionCard';
import ForecastInsights from '../components/ForecastInsights';
import AlertBanner from '../components/AlertBanner';
import { usePrediction } from '../hooks/usePrediction';
import { useApiHealth } from '../context/ApiHealthContext';
import { useToast } from '../App';
import { getProducts, getStores } from '../services/api';

const today = () => new Date().toISOString().split('T')[0];

const Forecast = () => {
  const location = useLocation();
  const { addToast } = useToast();
  const { online, showConnected, latency: currentHealthLatency, modelDetails } = useApiHealth();
  const {
    predict,
    prediction,
    baselinePrediction,
    insights,
    forecastMeta,
    loading,
    error,
    latency: predictionLatency,
    history,
    clearHistory,
  } = usePrediction();

  const [stores, setStores] = useState([]);
  const [products, setProducts] = useState([]);
  const [catalogLoading, setCatalogLoading] = useState(true);

  const [formData, setFormData] = useState({
    store_id: '',
    product_id: '',
    category_id: '',
    category_name: '',
    price: '',
    base_price: '',
    stock_available: '',
    is_weekend: 0,
    is_festival_near: 0,
    festival_type: 'None',
    forecast_date: today(),
  });

  const [activeFestivalType, setActiveFestivalType] = useState('None');

  useEffect(() => {
    const loadCatalog = async () => {
      try {
        const [s, p] = await Promise.all([getStores(), getProducts()]);
        setStores(s);
        setProducts(p);
        if (s.length && !formData.store_id) {
          setFormData((prev) => ({ ...prev, store_id: String(s[0].store_id) }));
        }
      } catch {
        addToast('Could not load store catalog. Is the backend running?', 'error');
      } finally {
        setCatalogLoading(false);
      }
    };
    loadCatalog();
  }, [addToast]);

  useEffect(() => {
    if (location.state?.product) {
      const product = location.state.product;
      const numericId = parseInt(String(product.id).replace(/\D/g, ''), 10) || 1;
      setFormData((prev) => ({
        ...prev,
        product_id: String(numericId),
        store_id: prev.store_id || '1',
        price: product.price ?? '',
        base_price: product.base_price ?? '',
        stock_available: product.stock ?? '',
        is_festival_near: 0,
        festival_type: 'None',
      }));
      addToast(`Loaded ${product.name} from dashboard`, 'success');
    }
  }, [location.state, addToast]);

  const selectedProduct = products.find((p) => String(p.product_id) === String(formData.product_id));

  const handleProductChange = (productId) => {
    const prod = products.find((p) => String(p.product_id) === productId);
    setFormData((prev) => ({
      ...prev,
      product_id: productId,
      category_id: prod ? String(prod.category_id) : '',
      category_name: prod?.category_name || '',
      base_price: prod ? String(prod.base_price) : prev.base_price,
      price: prod ? String(Math.round(prod.base_price * 0.95 * 100) / 100) : prev.price,
    }));
  };

  const handleFestivalChange = (value) => {
    setFormData((prev) => ({
      ...prev,
      festival_type: value,
      is_festival_near: value !== 'None' ? 1 : 0,
    }));
  };

  const handlePreFill = () => {
    const prod = products[0];
    const store = stores[0];
    if (!prod || !store) {
      addToast('Catalog not loaded yet', 'warning');
      return;
    }
    setFormData({
      store_id: String(store.store_id),
      product_id: String(prod.product_id),
      category_id: String(prod.category_id),
      category_name: prod.category_name,
      price: String(Math.round(prod.base_price * 0.92 * 100) / 100),
      base_price: String(prod.base_price),
      stock_available: '85',
      is_weekend: new Date().getDay() === 0 || new Date().getDay() === 6 ? 1 : 0,
      is_festival_near: 0,
      festival_type: 'None',
      forecast_date: today(),
    });
    addToast('Sample retail scenario loaded', 'success');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const required = ['store_id', 'product_id', 'price', 'base_price', 'stock_available'];
    if (required.some((k) => formData[k] === '' || formData[k] === null)) {
      addToast('Please complete all business fields', 'warning');
      return;
    }

    const payload = {
      store_id: parseInt(formData.store_id, 10),
      product_id: parseInt(formData.product_id, 10),
      category_id: formData.category_id ? parseInt(formData.category_id, 10) : undefined,
      price: parseFloat(formData.price),
      base_price: parseFloat(formData.base_price),
      stock_available: parseInt(formData.stock_available, 10),
      is_weekend: parseInt(formData.is_weekend, 10),
      is_festival_near: parseInt(formData.is_festival_near, 10),
      festival_type: formData.festival_type,
      forecast_date: formData.forecast_date,
    };

    try {
      setActiveFestivalType(formData.festival_type);
      await predict(payload, formData.festival_type);
      addToast('AI demand forecast generated successfully', 'success');
    } catch (err) {
      addToast(err.message || 'Forecast failed', 'error');
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 12 },
    visible: { opacity: 1, y: 0 },
  };

  const displayInput = {
    ...formData,
    discount_percent: insights?.discount_percent ?? 0,
    rolling_7_day_avg: insights?.weekly_avg_demand ?? 0,
  };

  return (
    <motion.div className="space-y-6" initial="hidden" animate="visible" variants={containerVariants}>
      <motion.div variants={itemVariants} className="glass-card p-6 flex flex-col sm:flex-row justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white md:text-xl">
            AI Demand Forecast
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            Enter retail details only — KiranaIQ auto-computes sales trends and runs the ML engine.
          </p>
        </div>
        <div className="flex gap-2">
          <button type="button" onClick={handlePreFill} className="glass-btn-secondary text-xs flex items-center gap-1.5">
            <Wand2 className="w-3.5 h-3.5" /> Smart sample
          </button>
          <button
            type="button"
            onClick={() =>
              setFormData({
                store_id: stores[0] ? String(stores[0].store_id) : '',
                product_id: '',
                category_id: '',
                category_name: '',
                price: '',
                base_price: '',
                stock_available: '',
                is_weekend: 0,
                is_festival_near: 0,
                festival_type: 'None',
                forecast_date: today(),
              })
            }
            className="p-2.5 rounded-xl border border-gray-200 dark:border-white/10 hover:text-rose-500"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </motion.div>

      {error && (
        <motion.div variants={itemVariants}>
          <AlertBanner type="warning" message={error} />
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        <div className="lg:col-span-2 space-y-6">
          <motion.form variants={itemVariants} onSubmit={handleSubmit} className="glass-card p-6 space-y-6 relative">
            {loading && (
              <div className="absolute inset-0 bg-white/30 dark:bg-brand-navy-deep/50 backdrop-blur-sm z-10 flex items-center justify-center rounded-2xl">
                <LoadingSpinner message="Analyzing sales history and generating forecast..." />
              </div>
            )}

            <div>
              <h4 className="text-xs font-bold text-brand-cyan uppercase tracking-wider mb-4 flex items-center gap-2">
                <Store className="w-4 h-4" /> Store & product
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-gray-500">Store</label>
                  <select
                    value={formData.store_id}
                    onChange={(e) => setFormData((p) => ({ ...p, store_id: e.target.value }))}
                    className="glass-input"
                    disabled={catalogLoading || loading}
                    required
                  >
                    <option value="">Select store</option>
                    {stores.map((s) => (
                      <option key={s.store_id} value={s.store_id}>
                        {s.store_name} — {s.location}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-gray-500">Product</label>
                  <select
                    value={formData.product_id}
                    onChange={(e) => handleProductChange(e.target.value)}
                    className="glass-input"
                    disabled={catalogLoading || loading}
                    required
                  >
                    <option value="">Select product</option>
                    {products.map((p) => (
                      <option key={p.product_id} value={p.product_id}>
                        {p.product_name} ({p.category_name})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col gap-1.5 sm:col-span-2">
                  <label className="text-xs font-semibold text-gray-500">Category</label>
                  <input
                    readOnly
                    value={formData.category_name || selectedProduct?.category_name || '—'}
                    className="glass-input bg-gray-50 dark:bg-brand-navy/40 cursor-not-allowed"
                  />
                </div>
              </div>
            </div>

            <hr className="border-gray-200/50 dark:border-white/5" />

            <div>
              <h4 className="text-xs font-bold text-brand-cyan uppercase tracking-wider mb-4 flex items-center gap-2">
                <Package className="w-4 h-4" /> Pricing & inventory
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-gray-500">Selling price (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.price}
                    onChange={(e) => setFormData((p) => ({ ...p, price: e.target.value }))}
                    className="glass-input"
                    disabled={loading}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-gray-500">Base price (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.base_price}
                    onChange={(e) => setFormData((p) => ({ ...p, base_price: e.target.value }))}
                    className="glass-input"
                    disabled={loading}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-gray-500">Stock on hand (units)</label>
                  <input
                    type="number"
                    required
                    value={formData.stock_available}
                    onChange={(e) => setFormData((p) => ({ ...p, stock_available: e.target.value }))}
                    className="glass-input"
                    disabled={loading}
                  />
                </div>
              </div>
            </div>

            <hr className="border-gray-200/50 dark:border-white/5" />

            <div>
              <h4 className="text-xs font-bold text-brand-cyan uppercase tracking-wider mb-4 flex items-center gap-2">
                <Calendar className="w-4 h-4" /> When to forecast
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-gray-500">Forecast date</label>
                  <input
                    type="date"
                    value={formData.forecast_date}
                    onChange={(e) => setFormData((p) => ({ ...p, forecast_date: e.target.value }))}
                    className="glass-input"
                    disabled={loading}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-gray-500">Weekend?</label>
                  <select
                    value={formData.is_weekend}
                    onChange={(e) => setFormData((p) => ({ ...p, is_weekend: parseInt(e.target.value, 10) }))}
                    className="glass-input"
                    disabled={loading}
                  >
                    <option value={0}>Weekday</option>
                    <option value={1}>Weekend</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-gray-500 flex items-center gap-1">
                    <PartyPopper className="w-3 h-3 text-brand-purple" /> Festival
                  </label>
                  <select
                    value={formData.festival_type}
                    onChange={(e) => handleFestivalChange(e.target.value)}
                    className="glass-input border-brand-purple/30"
                    disabled={loading}
                  >
                    <option value="None">No festival</option>
                    <option value="Diwali">Diwali</option>
                    <option value="Holi">Holi</option>
                    <option value="Eid">Eid</option>
                    <option value="Christmas">Christmas</option>
                    <option value="Pongal">Pongal</option>
                    <option value="Navratri">Navratri</option>
                  </select>
                </div>
              </div>
            </div>

            <button type="submit" disabled={loading} className="w-full glass-btn-primary py-4 text-sm font-bold uppercase tracking-wide flex items-center justify-center gap-2">
              <Sparkles className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
              {loading ? 'Running AI Forecast...' : 'Generate Demand Forecast'}
            </button>
          </motion.form>

          {insights && <ForecastInsights insights={insights} productName={forecastMeta?.product_name} storeName={forecastMeta?.store_name} />}

          {prediction !== null && !loading && (
            <PredictionCard
              prediction={prediction}
              baselinePrediction={baselinePrediction}
              inputData={displayInput}
              latency={predictionLatency}
              festivalType={activeFestivalType}
              insights={insights}
            />
          )}
        </div>

        <div className="space-y-6">
          <motion.div variants={itemVariants} className="glass-card p-5 space-y-3">
            <h4 className="text-xs font-bold uppercase flex items-center gap-2">
              <Activity className="w-4 h-4 text-brand-cyan" /> Engine status
            </h4>
            <div className="flex justify-between text-xs">
              <span className="text-gray-400">API</span>
              <span className={showConnected ? 'text-emerald-500 font-bold' : 'text-amber-500'}>
                {showConnected ? 'AI Forecast Engine Connected' : 'Connecting…'}
              </span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-gray-400">Latency</span>
              <span className="font-mono">{showConnected && currentHealthLatency ? `${currentHealthLatency}ms` : '—'}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-gray-400">Model</span>
              <span className={modelDetails?.model_loaded ? 'text-emerald-500' : 'text-amber-500'}>
                {modelDetails?.model_loaded ? 'Ready' : 'Unavailable'}
              </span>
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="glass-card p-5">
            <div className="flex justify-between items-center mb-3">
              <h4 className="text-xs font-bold uppercase flex items-center gap-2">
                <History className="w-4 h-4 text-brand-purple" /> Recent ({history.length})
              </h4>
              {history.length > 0 && (
                <button onClick={clearHistory} className="text-[10px] text-rose-500 font-bold uppercase">
                  Clear
                </button>
              )}
            </div>
            {history.length === 0 ? (
              <p className="text-xs text-gray-400 text-center py-8">No forecasts yet</p>
            ) : (
              <div className="space-y-2 max-h-80 overflow-y-auto">
                {history.map((item) => (
                  <div key={item.id} className="p-3 rounded-lg bg-gray-50 dark:bg-brand-navy/50 text-xs border border-gray-200/30 dark:border-white/5">
                    <div className="flex justify-between font-bold">
                      <span>{item.label || `Product #${item.input?.product_id}`}</span>
                      <span className="text-brand-cyan">{Number(item.prediction).toFixed(0)} units</span>
                    </div>
                    <p className="text-gray-400 mt-1">{item.timestamp}</p>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default Forecast;
