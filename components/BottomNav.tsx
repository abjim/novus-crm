import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, CheckSquare, UserCircle, ShoppingBag } from 'lucide-react';
import { NavItem } from '../types';

const NAV_ITEMS: NavItem[] = [
  { label: 'Home', path: '/dashboard', icon: LayoutDashboard },
  { label: 'Leads', path: '/leads', icon: Users },
  { label: 'Catalog', path: '/products', icon: ShoppingBag },
  { label: 'Tasks', path: '/tasks', icon: CheckSquare },
  { label: 'Profile', path: '/profile', icon: UserCircle },
];

const BottomNav: React.FC = () => {
  return (
    <nav className="bg-white dark:bg-slate-900 border-t border-gray-200 dark:border-slate-800 pb-safe">
      <div className="flex justify-around items-center h-16">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => `
              flex flex-col items-center justify-center w-full h-full space-y-1
              transition-colors duration-200
              ${isActive 
                ? 'text-brand-600 dark:text-brand-400' 
                : 'text-slate-500 dark:text-slate-500 hover:text-slate-900 dark:hover:text-slate-300'
              }
            `}
          >
            <item.icon size={24} strokeWidth={2} />
            <span className="text-[10px] font-medium tracking-wide">
              {item.label}
            </span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
};

export default BottomNav;