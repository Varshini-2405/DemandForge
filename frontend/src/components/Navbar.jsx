import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import {
  Sun,
  Moon,
  Wifi,
  WifiOff,
  Menu,
  X,
  BrainCircuit,
  LayoutDashboard,
  BarChart3,
  PackageCheck,
  Settings2,
  History,
  Loader2,
} from 'lucide-react';
import { useApiHealth } from '../context/ApiHealthContext';

const Navbar = () => {
  const [theme, setTheme] = useState('dark');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { checking, online, showConnected } = useApiHealth();
  const location = useLocation();

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') root.classList.add('dark');
    else root.classList.remove('dark');
  }, [theme]);

  const getPageTitle = () => {
    switch (location.pathname) {
      case '/': return 'Overview Dashboard';
      case '/forecast': return 'AI Demand Forecasting';
      case '/analytics': return 'Retail Analytics Trend';
      case '/inventory': return 'Inventory & Stock Risk';
      case '/history': return 'Prediction History';
      case '/settings': return 'System configurations';
      default: return 'KiranaIQ Analytics';
    }
  };

  const navLinks = [
    { name: 'Dashboard', path: '/', icon: <LayoutDashboard className="w-4 h-4" /> },
    { name: 'Forecast', path: '/forecast', icon: <BrainCircuit className="w-4 h-4" /> },
    { name: 'Analytics', path: '/analytics', icon: <BarChart3 className="w-4 h-4" /> },
    { name: 'Inventory', path: '/inventory', icon: <PackageCheck className="w-4 h-4" /> },
    { name: 'History', path: '/history', icon: <History className="w-4 h-4" /> },
    { name: 'Settings', path: '/settings', icon: <Settings2 className="w-4 h-4" /> },
  ];

  const statusPill = (compact = false) => {
    if (checking && !online) {
      return (
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold border bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-400">
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
          <span>{compact ? 'Connecting' : 'Connecting to AI engine…'}</span>
        </div>
      );
    }

    if (showConnected) {
      return (
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold border bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <Wifi className="w-3.5 h-3.5" />
          <span>{compact ? 'Connected' : 'AI Forecast Engine Connected'}</span>
        </div>
      );
    }

    return (
      <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold border bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-400">
        <Loader2 className="w-3.5 h-3.5 animate-spin" />
        <span>{compact ? 'Reconnecting' : 'Reconnecting to API…'}</span>
      </div>
    );
  };

  return (
    <header className="sticky top-0 z-30 w-full border-b border-gray-200/50 bg-white/80 dark:bg-brand-navy-deep/80 dark:border-white/5 backdrop-blur-md">
      <div className="flex items-center justify-between h-16 px-4 md:px-8">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-gray-500 rounded-xl hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-white/5 md:hidden"
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
          <h1 className="text-lg font-bold font-sans md:text-xl tracking-tight text-gray-900 dark:text-white">
            {getPageTitle()}
          </h1>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden sm:block">{statusPill()}</div>
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="p-2.5 text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-brand-navy-light border border-gray-200 dark:border-white/5 rounded-xl hover:bg-gray-200 dark:hover:bg-brand-navy-lighter/60 transition-all duration-200"
            title="Toggle Light/Dark Theme"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-brand-cyan" /> : <Moon className="w-4 h-4 text-brand-purple" />}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden border-b border-gray-200/50 dark:border-white/5 bg-white/95 dark:bg-brand-navy-light/95 backdrop-blur-md">
          <nav className="flex flex-col p-4 space-y-2">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.name}
                  to={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-brand-purple/10 text-brand-purple'
                      : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5'
                  }`}
                >
                  {link.icon}
                  <span>{link.name}</span>
                </Link>
              );
            })}
            <div className="mt-4 flex justify-center">{statusPill(true)}</div>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Navbar;
