import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';

const AppLayout = () => {
  return (
    <>
      <Sidebar />
      <div className="flex flex-col flex-1 md:pl-64 min-w-0 transition-all duration-200">
        <Navbar />
        <main className="flex-1 p-4 md:p-8 overflow-y-auto">
          <div className="mx-auto max-w-7xl space-y-6">
            <Outlet />
          </div>
        </main>
      </div>
    </>
  );
};

export default AppLayout;
