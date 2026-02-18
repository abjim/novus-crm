import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import BottomNav from './BottomNav';

const Layout: React.FC = () => {
  return (
    <div className="flex h-screen w-full bg-gray-50 dark:bg-slate-950 overflow-hidden">
      {/* Desktop & Tablet Sidebar - Hidden on Mobile */}
      <div className="hidden md:block h-full shrink-0">
        <Sidebar />
      </div>

      {/* Main Content Area */}
      <main className="flex-1 h-full overflow-y-auto overflow-x-hidden pb-16 md:pb-0 relative">
        <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
           <Outlet />
        </div>
      </main>

      {/* Mobile Bottom Navigation - Hidden on Tablet/Desktop */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50">
        <BottomNav />
      </div>
    </div>
  );
};

export default Layout;