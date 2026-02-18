import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { Mail, Briefcase, MapPin, Shield, Sun, Moon } from 'lucide-react';

const Profile: React.FC = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  if (!user) return null;

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {/* Profile Header */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 border border-gray-200 dark:border-slate-800 shadow-sm flex flex-col items-center text-center">
        <div className="w-24 h-24 rounded-full p-1 bg-gradient-to-tr from-brand-400 to-indigo-600 mb-4">
          <img 
            src={user.avatarUrl} 
            alt={user.name} 
            className="w-full h-full rounded-full object-cover border-4 border-white dark:border-slate-900" 
          />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{user.name}</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">{user.role} at NOVUS CRM</p>
        
        <div className="flex gap-4 mt-6">
            <button className="px-6 py-2 bg-brand-600 text-white rounded-full text-sm font-medium hover:bg-brand-700 transition-colors">
                Edit Profile
            </button>
            <button onClick={logout} className="px-6 py-2 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-full text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                Sign Out
            </button>
        </div>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-gray-200 dark:border-slate-800 shadow-sm">
            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">Contact Info</h3>
            <ul className="space-y-4">
                <li className="flex items-center gap-3 text-slate-700 dark:text-slate-300">
                    <Mail size={18} className="text-brand-500" />
                    <span>{user.email}</span>
                </li>
                 <li className="flex items-center gap-3 text-slate-700 dark:text-slate-300">
                    <Briefcase size={18} className="text-brand-500" />
                    <span>Sales Department</span>
                </li>
                 <li className="flex items-center gap-3 text-slate-700 dark:text-slate-300">
                    <MapPin size={18} className="text-brand-500" />
                    <span>San Francisco, CA</span>
                </li>
            </ul>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-gray-200 dark:border-slate-800 shadow-sm">
             <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">Preferences</h3>
             <div className="flex items-center justify-between py-2">
                <div className="flex items-center gap-3">
                    {theme === 'dark' ? <Moon size={18} className="text-violet-500" /> : <Sun size={18} className="text-amber-500" />}
                    <span className="text-slate-700 dark:text-slate-300 font-medium">Dark Mode</span>
                </div>
                <button 
                    onClick={toggleTheme}
                    className={`
                        w-12 h-6 rounded-full p-1 transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-brand-500
                        ${theme === 'dark' ? 'bg-brand-600' : 'bg-slate-200'}
                    `}
                >
                    <div className={`w-4 h-4 rounded-full bg-white shadow-sm transform transition-transform duration-200 ${theme === 'dark' ? 'translate-x-6' : 'translate-x-0'}`} />
                </button>
             </div>
             <div className="flex items-center gap-3 py-3 mt-2 text-slate-700 dark:text-slate-300">
                <Shield size={18} className="text-slate-400" />
                <span>Role: <span className="font-semibold text-brand-600 dark:text-brand-400">{user.role}</span></span>
             </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;