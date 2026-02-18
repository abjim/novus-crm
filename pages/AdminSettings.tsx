import React, { useState } from 'react';
import { 
  Users, 
  Settings, 
  Plus, 
  Search, 
  Edit, 
  Mail, 
  MessageSquare, 
  Save, 
  Wifi, 
  WifiOff,
  CheckCircle2,
  AlertCircle,
  X,
  Shield
} from 'lucide-react';

// --- Types ---
interface SystemUser {
  id: string;
  name: string;
  email: string;
  role: 'Agent' | 'Manager' | 'Admin';
  brandIds: string[];
  isActive: boolean;
  lastLogin: string;
}

const MOCK_USERS: SystemUser[] = [
  { id: '1', name: 'Alex Mercer', email: 'alex@novus.com', role: 'Admin', brandIds: ['PM', 'LB', 'SP'], isActive: true, lastLogin: 'Today' },
  { id: '2', name: 'Sarah Khan', email: 'sarah@learningbangladesh.com', role: 'Manager', brandIds: ['LB'], isActive: true, lastLogin: 'Yesterday' },
  { id: '3', name: 'John Doe', email: 'john@shehzin.com', role: 'Agent', brandIds: ['SP'], isActive: true, lastLogin: '2 days ago' },
  { id: '4', name: 'Emily Blunt', email: 'emily@pretendmind.com', role: 'Agent', brandIds: ['PM'], isActive: false, lastLogin: '1 month ago' },
];

const BRANDS = [
  { id: 'PM', name: 'PretendMind', color: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400' },
  { id: 'LB', name: 'Learning Bangladesh', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' },
  { id: 'SP', name: 'Shehzin Publications', color: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400' },
];

// --- Components ---

const UserEditModal: React.FC<{
  user: SystemUser | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (user: SystemUser) => void;
}> = ({ user, isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState<SystemUser>(
    user || { 
      id: '', 
      name: '', 
      email: '', 
      role: 'Agent', 
      brandIds: [], 
      isActive: true, 
      lastLogin: '-' 
    }
  );

  React.useEffect(() => {
    if (user) setFormData(user);
  }, [user]);

  if (!isOpen) return null;

  const toggleBrand = (brandId: string) => {
    setFormData(prev => {
      const brands = prev.brandIds.includes(brandId)
        ? prev.brandIds.filter(b => b !== brandId)
        : [...prev.brandIds, brandId];
      return { ...prev, brandIds: brands };
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl shadow-xl overflow-hidden border border-gray-200 dark:border-slate-800">
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-900/50">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            {user ? 'Edit User' : 'Add New User'}
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
            <X size={24} />
          </button>
        </div>
        
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Full Name</label>
            <input 
              type="text" 
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
              className="w-full px-3 py-2 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Email</label>
            <input 
              type="email" 
              value={formData.email}
              readOnly={!!user}
              onChange={e => setFormData({...formData, email: e.target.value})}
              className={`w-full px-3 py-2 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none ${user ? 'cursor-not-allowed opacity-70' : ''}`}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Role</label>
            <select 
              value={formData.role}
              onChange={e => setFormData({...formData, role: e.target.value as any})}
              className="w-full px-3 py-2 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none"
            >
              <option value="Agent">Agent</option>
              <option value="Manager">Manager</option>
              <option value="Admin">Admin</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Assigned Brands</label>
            <div className="space-y-2">
              {BRANDS.map(brand => (
                <label key={brand.id} className="flex items-center gap-3 p-3 border border-gray-200 dark:border-slate-700 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors">
                  <input 
                    type="checkbox"
                    checked={formData.brandIds.includes(brand.id)}
                    onChange={() => toggleBrand(brand.id)}
                    className="w-4 h-4 text-brand-600 rounded border-gray-300 focus:ring-brand-500"
                  />
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-200">{brand.name}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
             <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Account Status</span>
             <button 
               onClick={() => setFormData({...formData, isActive: !formData.isActive})}
               className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${formData.isActive ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-600'}`}
             >
               <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${formData.isActive ? 'translate-x-6' : 'translate-x-1'}`} />
             </button>
          </div>
        </div>

        <div className="p-4 bg-gray-50 dark:bg-slate-900/50 border-t border-gray-100 dark:border-slate-800 flex justify-end gap-3">
           <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-slate-800 dark:hover:text-white transition-colors">Cancel</button>
           <button onClick={() => onSave(formData)} className="px-6 py-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium rounded-lg shadow-sm">Save Changes</button>
        </div>
      </div>
    </div>
  );
};

const AdminSettings: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'users' | 'integrations'>('users');
  const [users, setUsers] = useState<SystemUser[]>(MOCK_USERS);
  const [editingUser, setEditingUser] = useState<SystemUser | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Integrations State
  const [emailEnabled, setEmailEnabled] = useState(true);
  const [smsEnabled, setSmsEnabled] = useState(true);

  const handleEditUser = (user: SystemUser) => {
    setEditingUser(user);
    setIsModalOpen(true);
  };

  const handleSaveUser = (updatedUser: SystemUser) => {
    if (updatedUser.id) {
      setUsers(users.map(u => u.id === updatedUser.id ? updatedUser : u));
    } else {
      // Create new user logic mock
      setUsers([...users, { ...updatedUser, id: Date.now().toString(), lastLogin: 'Never' }]);
    }
    setIsModalOpen(false);
    setEditingUser(null);
  };

  const renderUserTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="relative w-64">
          <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search users..." 
            className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>
        <button 
          onClick={() => { setEditingUser(null); setIsModalOpen(true); }}
          className="flex items-center gap-2 px-4 py-2 bg-brand-600 text-white rounded-lg font-medium text-sm hover:bg-brand-700 transition-colors shadow-sm"
        >
          <Plus size={18} /> Add User
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50 dark:bg-slate-800 border-b border-gray-100 dark:border-slate-800 text-slate-500 dark:text-slate-400">
            <tr>
              <th className="px-6 py-4 font-semibold">User</th>
              <th className="px-6 py-4 font-semibold">Role</th>
              <th className="px-6 py-4 font-semibold">Assigned Brands</th>
              <th className="px-6 py-4 font-semibold">Status</th>
              <th className="px-6 py-4 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
            {users.map(user => (
              <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors">
                <td className="px-6 py-4">
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-white">{user.name}</p>
                    <p className="text-xs text-slate-500">{user.email}</p>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-1.5">
                    <Shield size={14} className="text-slate-400" />
                    <span className="text-slate-700 dark:text-slate-300">{user.role}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-wrap gap-2">
                    {user.brandIds.map(bid => {
                      const brand = BRANDS.find(b => b.id === bid);
                      return (
                        <span key={bid} className={`px-2 py-0.5 rounded-full text-xs font-medium ${brand?.color || 'bg-gray-100'}`}>
                          {brand?.name}
                        </span>
                      );
                    })}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${user.isActive ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'}`}>
                    {user.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <button onClick={() => handleEditUser(user)} className="p-2 text-slate-400 hover:text-brand-600 hover:bg-brand-50 dark:hover:bg-brand-900/20 rounded-lg transition-colors">
                    <Edit size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderIntegrationsTab = () => (
    <div className="space-y-6">
      {/* Email Integration */}
      <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
        <div className="flex justify-between items-start mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg">
              <Mail size={24} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Email Integration</h3>
              <p className="text-sm text-slate-500">Configure cPanel SMTP for sending system emails.</p>
            </div>
          </div>
          <button 
             onClick={() => setEmailEnabled(!emailEnabled)}
             className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${emailEnabled ? 'bg-brand-600' : 'bg-slate-300 dark:bg-slate-700'}`}
           >
             <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${emailEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
           </button>
        </div>

        <div className={`grid grid-cols-1 md:grid-cols-2 gap-6 transition-opacity ${emailEnabled ? 'opacity-100' : 'opacity-50 pointer-events-none'}`}>
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase mb-1.5">SMTP Host</label>
            <input type="text" defaultValue="mail.novuscrm.com" className="w-full px-3 py-2 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white outline-none focus:border-brand-500" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase mb-1.5">SMTP Port</label>
            <input type="text" defaultValue="465" className="w-full px-3 py-2 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white outline-none focus:border-brand-500" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase mb-1.5">Username</label>
            <input type="text" defaultValue="system@novuscrm.com" className="w-full px-3 py-2 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white outline-none focus:border-brand-500" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase mb-1.5">Password</label>
            <input type="password" value="••••••••••••" readOnly className="w-full px-3 py-2 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white outline-none focus:border-brand-500" />
          </div>
        </div>
        <div className="mt-6 pt-4 border-t border-gray-100 dark:border-slate-800 flex justify-end">
           <button className="flex items-center gap-2 px-4 py-2 border border-brand-200 dark:border-brand-900 text-brand-700 dark:text-brand-300 rounded-lg text-sm font-medium hover:bg-brand-50 dark:hover:bg-brand-900/20 transition-colors">
             <Wifi size={16} /> Test Connection
           </button>
        </div>
      </div>

      {/* SMS Integration */}
      <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
        <div className="flex justify-between items-start mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-lg">
              <MessageSquare size={24} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">SMS Gateway</h3>
              <p className="text-sm text-slate-500">Configure BulkSMSBD for transactional messaging.</p>
            </div>
          </div>
          <button 
             onClick={() => setSmsEnabled(!smsEnabled)}
             className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${smsEnabled ? 'bg-brand-600' : 'bg-slate-300 dark:bg-slate-700'}`}
           >
             <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${smsEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
           </button>
        </div>

        <div className={`grid grid-cols-1 md:grid-cols-2 gap-6 transition-opacity ${smsEnabled ? 'opacity-100' : 'opacity-50 pointer-events-none'}`}>
          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-slate-500 uppercase mb-1.5">API Key</label>
            <input type="password" value="r43290...x8329" readOnly className="w-full px-3 py-2 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white outline-none focus:border-brand-500 font-mono" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase mb-1.5">Sender ID</label>
            <input type="text" defaultValue="NOVUS" className="w-full px-3 py-2 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white outline-none focus:border-brand-500" />
          </div>
        </div>
        <div className="mt-6 pt-4 border-t border-gray-100 dark:border-slate-800 flex justify-end gap-3">
           <button className="flex items-center gap-2 px-4 py-2 border border-brand-200 dark:border-brand-900 text-brand-700 dark:text-brand-300 rounded-lg text-sm font-medium hover:bg-brand-50 dark:hover:bg-brand-900/20 transition-colors">
             <Wifi size={16} /> Test SMS
           </button>
           <button className="flex items-center gap-2 px-4 py-2 bg-brand-600 text-white rounded-lg text-sm font-medium hover:bg-brand-700 shadow-sm">
             <Save size={16} /> Save Changes
           </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6 pb-20 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Admin Settings</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Manage users, roles, and system configurations.</p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 dark:border-slate-800">
        <button 
          onClick={() => setActiveTab('users')}
          className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'users' ? 'border-brand-600 text-brand-600 dark:text-brand-400' : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'}`}
        >
          <div className="flex items-center gap-2">
            <Users size={18} />
            User Management
          </div>
        </button>
        <button 
          onClick={() => setActiveTab('integrations')}
          className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'integrations' ? 'border-brand-600 text-brand-600 dark:text-brand-400' : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'}`}
        >
          <div className="flex items-center gap-2">
            <Settings size={18} />
            System Integrations
          </div>
        </button>
      </div>

      {/* Content */}
      <div className="pt-2">
        {activeTab === 'users' && renderUserTab()}
        {activeTab === 'integrations' && renderIntegrationsTab()}
      </div>

      {/* Modals */}
      <UserEditModal 
        isOpen={isModalOpen}
        user={editingUser}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveUser}
      />
    </div>
  );
};

export default AdminSettings;