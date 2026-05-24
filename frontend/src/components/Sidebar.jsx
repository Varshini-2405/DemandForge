import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  BrainCircuit,
  BarChart3,
  PackageCheck,
  Settings2,
  TrendingUp,
  History,
  LogOut,
  UserCircle,
} from 'lucide-react';
const Sidebar = () => {
  const location = useLocation();
  const currentPath = location.pathname;

  const menuItems = [
    { name: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" />, path: '/' },
    { name: 'Demand Forecast', icon: <BrainCircuit className="w-5 h-5" />, path: '/forecast' },
    { name: 'Retail Analytics', icon: <BarChart3 className="w-5 h-5" />, path: '/analytics' },
    { name: 'Inventory Health', icon: <PackageCheck className="w-5 h-5" />, path: '/inventory' },
    { name: 'Prediction History', icon: <History className="w-5 h-5" />, path: '/history' },
    { name: 'System Settings', icon: <Settings2 className="w-5 h-5" />, path: '/settings' },
  ];

  return (
    <aside className="fixed inset-y-0 left-0 z-20 flex-col hidden w-64 border-r border-gray-200/50 bg-white/95 dark:bg-brand-navy-light/95 dark:border-white/10 md:flex backdrop-blur-md">
      <div className="flex items-center gap-3 px-6 py-5 border-b border-gray-200/50 dark:border-white/5">
        <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-brand-purple to-brand-cyan shadow-md text-white">
          <TrendingUp className="w-5 h-5" />
        </div>
        <div>
          <span className="text-xl font-bold font-sans tracking-tight text-gray-900 dark:text-white">
            Kirana<span className="text-brand-purple">IQ</span>
          </span>
          <span className="block text-[10px] text-brand-cyan font-mono tracking-widest uppercase">AI ENGINE</span>
        </div>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
        {menuItems.map((item) => {
          const isActive = currentPath === item.path;
          return (
            <Link
              key={item.name}
              to={item.path}
              className={`flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group ${
                isActive
                  ? 'bg-gradient-to-r from-brand-purple/15 to-brand-cyan/5 text-brand-purple dark:text-brand-purple-light border-l-4 border-brand-purple shadow-sm'
                  : 'text-gray-500 hover:text-gray-950 dark:text-gray-400 dark:hover:text-white hover:bg-gray-100/50 dark:hover:bg-white/5 border-l-4 border-transparent'
              }`}
            >
              <span className={`transition-all duration-200 ${isActive ? 'scale-105 text-brand-purple' : 'group-hover:scale-105'}`}>
                {item.icon}
              </span>
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-gray-200/50 dark:border-white/5">
        <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 font-medium mb-4 px-2">
        <UserCircle className="w-5 h-5 text-brand-purple" />
        <span className="truncate max-w-[100px]">Guest Session</span>
      </div>
        <div className="text-center">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-brand-cyan/10 border border-brand-cyan/20">
            <span className="w-2 h-2 rounded-full bg-brand-cyan animate-pulse" />
            <span className="text-[10px] font-semibold text-brand-cyan uppercase tracking-wider">PROD ACTIVE</span>
          </div>
          <p className="mt-2 text-xs text-gray-400 dark:text-gray-500">KiranaIQ Suite v2.0.0</p>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
