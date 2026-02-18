import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  CheckSquare, 
  UserCircle, 
  LogOut, 
  ChevronLeft, 
  ChevronRight,
  Sun,
  Moon,
  Hexagon,
  ShoppingBag,
  Settings
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { NavItem } from '../types';

const NAV_ITEMS: NavItem[] = [
  { label: 'Home', path: '/dashboard', icon: LayoutDashboard },
  { label: 'My Leads', path: '/leads', icon: Users },
  { label: 'Catalog', path: '/products', icon: ShoppingBag },
  { label: 'Tasks', path: '/tasks', icon: CheckSquare },
  { label: 'Settings', path: '/admin', icon: Settings },
];

const Sidebar: React.FC = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  // Collapsed by default on tablet (handled via media queries in width), 
  // but we also want a manual toggle state.
  const [isCollapsed, setIsCollapsed] = useState(false);

  const toggleCollapse = () => setIsCollapsed(!isCollapsed);

  return (
    <aside 
      className={`
        h-full bg-white dark:bg-slate-900 border-r border-gray-200 dark:border-slate-800
        flex flex-col transition-all duration-300 ease-in-out relative
        ${isCollapsed ? 'w-20' : 'w-64'}
      `}
    >
      {/* Toggle Button */}
      <button 
        onClick={toggleCollapse}
        className="absolute -right-3 top-9 bg-brand-600 hover:bg-brand-700 text-white p-1 rounded-full shadow-lg z-10 hidden lg:flex items-center justify-center transition-transform hover:scale-110"
        aria-label="Toggle Sidebar"
      >
        {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </button>

      {/* Header / Logo */}
      <div className="h-20 flex items-center px-6 border-b border-gray-100 dark:border-slate-800">
        <div className="flex items-center gap-3 text-brand-600 dark:text-brand-400">
          <Hexagon className="fill-current" size={32} />
          <span className={`font-bold text-xl tracking-tight text-slate-900 dark:text-white transition-opacity duration-200 ${isCollapsed ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100'}`}>
            NOVUS
          </span>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 py-6 px-3 space-y-2 overflow-y-auto">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => `
              flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group
              ${isActive 
                ? 'bg-brand-50 dark:bg-brand-900/20 text-brand-600 dark:text-brand-400 font-medium shadow-sm' 
                : 'text-slate-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-200'
              }
            `}
          >
            <item.icon size={22} className="min-w-[22px]" />
            <span className={`whitespace-nowrap transition-all duration-200 ${isCollapsed ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100'}`}>
              {item.label}
            </span>
            
            {/* Tooltip for collapsed state */}
            {isCollapsed && (
              <div className="absolute left-16 bg-slate-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 ml-2 whitespace-nowrap">
                {item.label}
              </div>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Footer Actions */}
      <div className="p-4 border-t border-gray-200 dark:border-slate-800 space-y-4">
        
        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors ${isCollapsed ? 'justify-center' : ''}`}
        >
          {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          <span className={`whitespace-nowrap transition-all duration-200 ${isCollapsed ? 'hidden' : 'block'}`}>
            {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
          </span>
        </button>

        {/* User Profile */}
        <div className={`flex items-center gap-3 px-2 transition-all duration-200 ${isCollapsed ? 'justify-center' : ''}`}>
          <img 
            src={user?.avatarUrl || `https://ui-avatars.com/api/?name=${user?.name}`} 
            alt={user?.name} 
            className="w-8 h-8 rounded-full ring-2 ring-brand-100 dark:ring-brand-900"
          />
          <div className={`flex-1 min-w-0 transition-all duration-200 ${isCollapsed ? 'hidden' : 'block'}`}>
            <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
              {user?.name}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-500 truncate">
              {user?.role}
            </p>
          </div>
          <button 
            onClick={logout}
            className={`text-slate-400 hover:text-red-500 transition-colors ${isCollapsed ? 'hidden' : 'block'}`}
            title="Logout"
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;