import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  Download, 
  Plus, 
  Phone, 
  Mail, 
  Calendar, 
  User, 
  MoreHorizontal, 
  ArrowUpRight,
  AlertCircle,
  MessageSquare,
  UploadCloud
} from 'lucide-react';
import { EmailComposerModal, SMSComposerModal, ImportWizardModal } from '../components/ActionModals';

// --- Types & Mock Data Generation ---

interface Lead {
  id: string;
  createdDate: string;
  name: string;
  mobile: string;
  email: string;
  source: string;
  value: number; // BDT
  status: 'New' | 'Contacted' | 'Proposal' | 'Negotiation' | 'Hot' | 'Closed';
  followUpDate: string;
  agent: string;
  lastContacted?: string;
}

// Helper to generate dates relative to today
const getRelativeDate = (days: number) => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().split('T')[0];
};

const TODAY = getRelativeDate(0);

const MOCK_LEADS: Lead[] = [
  { id: '1', createdDate: getRelativeDate(-1), name: 'Rahim Uddin', mobile: '+8801711223344', email: 'rahim@gmail.com', source: 'Facebook', value: 50000, status: 'New', followUpDate: getRelativeDate(1), agent: 'Alex Mercer' },
  { id: '2', createdDate: getRelativeDate(-2), name: 'Karim Ahmed', mobile: '+8801811223344', email: 'karim.ahmed@corp.com', source: 'Website', value: 120000, status: 'Hot', followUpDate: getRelativeDate(0), agent: 'Sarah Khan', lastContacted: TODAY },
  { id: '3', createdDate: getRelativeDate(-5), name: 'Nusrat Jahan', mobile: '+8801911223344', email: 'nusrat.j@design.co', source: 'Referral', value: 75000, status: 'Negotiation', followUpDate: getRelativeDate(-1), agent: 'Alex Mercer', lastContacted: getRelativeDate(-2) },
  { id: '4', createdDate: getRelativeDate(-10), name: 'Tanvir Hasan', mobile: '+8801611223344', email: 'tanvir@tech.bd', source: 'LinkedIn', value: 250000, status: 'Proposal', followUpDate: getRelativeDate(-3), agent: 'John Doe' },
  { id: '5', createdDate: TODAY, name: 'Mehedi Hasan', mobile: '+8801511223344', email: 'mehedi@yahoo.com', source: 'Walk-in', value: 10000, status: 'New', followUpDate: getRelativeDate(2), agent: 'Sarah Khan' },
  { id: '6', createdDate: getRelativeDate(-3), name: 'Ayesha Siddiqua', mobile: '+8801311223344', email: 'ayesha@gmail.com', source: 'Facebook', value: 45000, status: 'Contacted', followUpDate: getRelativeDate(5), agent: 'Alex Mercer', lastContacted: TODAY },
  { id: '7', createdDate: getRelativeDate(-7), name: 'Bashir Uddin', mobile: '+8801722334455', email: 'bashir@export.com', source: 'Website', value: 300000, status: 'Hot', followUpDate: getRelativeDate(1), agent: 'John Doe' },
  { id: '8', createdDate: getRelativeDate(-20), name: 'Farhana Akter', mobile: '+8801822334455', email: 'farhana@creative.net', source: 'Referral', value: 60000, status: 'Closed', followUpDate: getRelativeDate(30), agent: 'Sarah Khan' },
  { id: '9', createdDate: getRelativeDate(-15), name: 'Kamal Hossain', mobile: '+8801922334455', email: 'kamal@trading.bd', source: 'LinkedIn', value: 150000, status: 'Proposal', followUpDate: getRelativeDate(-2), agent: 'Alex Mercer' },
  { id: '10', createdDate: TODAY, name: 'Rafiqul Islam', mobile: '+8801622334455', email: 'rafiq@startup.io', source: 'Facebook', value: 85000, status: 'New', followUpDate: getRelativeDate(2), agent: 'John Doe' },
];

const FILTER_TABS = [
  { id: 'all', label: 'All Leads' },
  { id: 'new', label: 'New Leads' },
  { id: 'contacted', label: 'Contacted Today' },
  { id: 'overdue', label: 'Overdue Follow-ups' },
  { id: 'hot', label: 'Hot Leads' },
];

const MyLeads: React.FC = () => {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modal State
  const [activeModal, setActiveModal] = useState<'email' | 'sms' | 'import' | null>(null);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

  // Format Currency (BDT)
  const formatBDT = (amount: number) => {
    return new Intl.NumberFormat('en-BD', { style: 'currency', currency: 'BDT', minimumFractionDigits: 0 }).format(amount);
  };

  // Derived Filtered State
  const filteredLeads = useMemo(() => {
    return MOCK_LEADS.filter((lead) => {
      // 1. Search Logic
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch = 
        lead.name.toLowerCase().includes(searchLower) ||
        lead.email.toLowerCase().includes(searchLower) ||
        lead.mobile.includes(searchLower);

      if (!matchesSearch) return false;

      // 2. Filter Tab Logic
      switch (activeFilter) {
        case 'new': return lead.status === 'New';
        case 'contacted': return lead.lastContacted === TODAY;
        case 'overdue': return lead.followUpDate < TODAY && lead.status !== 'Closed';
        case 'hot': return lead.status === 'Hot';
        default: return true;
      }
    });
  }, [activeFilter, searchQuery]);

  // Helper to get status styles
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'New': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300';
      case 'Hot': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300';
      case 'Closed': return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300';
      case 'Negotiation': return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300';
      default: return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300';
    }
  };

  const openEmailModal = (e: React.MouseEvent, lead: Lead) => {
    e.stopPropagation();
    setSelectedLead(lead);
    setActiveModal('email');
  };

  const openSMSModal = (e: React.MouseEvent, lead: Lead) => {
    e.stopPropagation();
    setSelectedLead(lead);
    setActiveModal('sms');
  };

  return (
    <div className="space-y-6 min-h-screen">
      
      {/* --- Page Header & Actions --- */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Lead Inbox</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Manage and track your potential opportunities.</p>
        </div>
        <div className="flex gap-3 w-full sm:w-auto">
          <button 
            onClick={() => setActiveModal('import')}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-200 font-medium text-sm hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
          >
            <UploadCloud size={16} />
            <span>Import</span>
          </button>
          <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-200 font-medium text-sm hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors">
            <Download size={16} />
            <span>Export</span>
          </button>
          <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-brand-600 text-white rounded-lg font-medium text-sm hover:bg-brand-700 shadow-md shadow-brand-500/20 transition-all hover:scale-105 active:scale-95">
            <Plus size={18} />
            <span>Add Lead</span>
          </button>
        </div>
      </div>

      {/* --- Controls: Filters & Search --- */}
      <div className="flex flex-col gap-4">
        {/* Mobile: Horizontal Scrollable Filters */}
        <div className="flex overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 sm:pb-0 gap-2 no-scrollbar">
          {FILTER_TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveFilter(tab.id)}
              className={`
                whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 border
                ${activeFilter === tab.id 
                  ? 'bg-brand-600 border-brand-600 text-white shadow-md shadow-brand-500/25' 
                  : 'bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-800'
                }
              `}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search Bar */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-slate-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-3 border border-gray-200 dark:border-slate-700 rounded-xl leading-5 bg-white dark:bg-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 sm:text-sm text-slate-900 dark:text-white transition-shadow shadow-sm"
            placeholder="Search by name, email, or mobile number..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* --- Content Area --- */}
      
      {/* Mobile Card View (Hidden on MD+) */}
      <div className="md:hidden space-y-4">
        {filteredLeads.map((lead) => (
          <div 
            key={lead.id} 
            onClick={() => navigate(`/leads/${lead.id}`)}
            className="bg-white dark:bg-slate-900 p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 flex flex-col gap-4 animate-fade-in cursor-pointer active:scale-[0.98] transition-transform"
          >
            
            {/* Card Header */}
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-3">
                 <div className="w-10 h-10 rounded-full bg-brand-50 dark:bg-brand-900/50 flex items-center justify-center text-brand-600 dark:text-brand-400 font-bold text-sm">
                    {lead.name.charAt(0)}
                 </div>
                 <div>
                   <h3 className="font-semibold text-slate-900 dark:text-white">{lead.name}</h3>
                   <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium mt-1 ${getStatusColor(lead.status)}`}>
                      {lead.status}
                   </span>
                 </div>
              </div>
              <button className="text-slate-400 hover:text-slate-600">
                <MoreHorizontal size={20} />
              </button>
            </div>

            {/* Card Details */}
            <div className="grid grid-cols-2 gap-y-3 gap-x-4 text-sm">
              <div className="col-span-2 flex items-center gap-2 text-slate-600 dark:text-slate-400">
                 <Calendar size={14} />
                 <span>Created: {lead.createdDate}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-slate-400">Value</span>
                <span className="font-semibold text-slate-900 dark:text-white">{formatBDT(lead.value)}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-slate-400">Follow-up</span>
                <span className={`font-medium ${lead.followUpDate < TODAY && lead.status !== 'Closed' ? 'text-red-500 flex items-center gap-1' : 'text-slate-900 dark:text-white'}`}>
                   {lead.followUpDate < TODAY && lead.status !== 'Closed' && <AlertCircle size={12} />}
                   {lead.followUpDate}
                </span>
              </div>
            </div>

            {/* Card Actions */}
            <div className="grid grid-cols-2 gap-3 mt-2 pt-4 border-t border-gray-100 dark:border-slate-800">
              <button onClick={(e) => openSMSModal(e, lead)} className="flex items-center justify-center gap-2 py-2 rounded-lg bg-gray-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-sm font-medium hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors">
                 <MessageSquare size={16} />
                 SMS
              </button>
              <button onClick={(e) => openEmailModal(e, lead)} className="flex items-center justify-center gap-2 py-2 rounded-lg bg-gray-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-sm font-medium hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors">
                 <Mail size={16} />
                 Email
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop Table View (Hidden on Mobile) */}
      <div className="hidden md:block bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 dark:bg-slate-800 border-b border-gray-100 dark:border-slate-800">
              <tr>
                <th className="px-6 py-4 font-semibold text-slate-600 dark:text-slate-400">Lead Name</th>
                <th className="px-6 py-4 font-semibold text-slate-600 dark:text-slate-400">Date</th>
                <th className="px-6 py-4 font-semibold text-slate-600 dark:text-slate-400">Value (BDT)</th>
                <th className="px-6 py-4 font-semibold text-slate-600 dark:text-slate-400">Status</th>
                <th className="px-6 py-4 font-semibold text-slate-600 dark:text-slate-400">Next Follow-up</th>
                <th className="px-6 py-4 font-semibold text-slate-600 dark:text-slate-400">Agent</th>
                <th className="px-6 py-4 font-semibold text-slate-600 dark:text-slate-400 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
              {filteredLeads.map((lead) => (
                <tr 
                  key={lead.id} 
                  onClick={() => navigate(`/leads/${lead.id}`)}
                  className="hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors group cursor-pointer"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-brand-100 to-indigo-100 dark:from-brand-900 dark:to-indigo-900 flex items-center justify-center text-brand-700 dark:text-brand-300 font-bold text-xs">
                        {lead.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-medium text-slate-900 dark:text-white">{lead.name}</div>
                        <div className="text-xs text-slate-500">{lead.source}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-600 dark:text-slate-400 whitespace-nowrap">
                    {lead.createdDate}
                  </td>
                  <td className="px-6 py-4 font-medium text-slate-900 dark:text-white whitespace-nowrap">
                    {formatBDT(lead.value)}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(lead.status)}`}>
                      {lead.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                     <div className={`flex items-center gap-2 ${lead.followUpDate < TODAY && lead.status !== 'Closed' ? 'text-red-600 dark:text-red-400 font-medium' : 'text-slate-600 dark:text-slate-400'}`}>
                        {lead.followUpDate < TODAY && lead.status !== 'Closed' && <AlertCircle size={14} />}
                        {lead.followUpDate}
                     </div>
                  </td>
                  <td className="px-6 py-4 text-slate-600 dark:text-slate-400">
                    <div className="flex items-center gap-2">
                       <User size={14} className="text-slate-400" />
                       {lead.agent}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={(e) => {e.stopPropagation(); /* Call Logic */}} className="p-2 text-slate-400 hover:text-brand-600 hover:bg-brand-50 dark:hover:bg-brand-900/20 rounded-lg transition-colors" title="Call">
                        <Phone size={16} />
                      </button>
                      <button onClick={(e) => openSMSModal(e, lead)} className="p-2 text-slate-400 hover:text-brand-600 hover:bg-brand-50 dark:hover:bg-brand-900/20 rounded-lg transition-colors" title="Send SMS">
                        <MessageSquare size={16} />
                      </button>
                      <button onClick={(e) => openEmailModal(e, lead)} className="p-2 text-slate-400 hover:text-brand-600 hover:bg-brand-50 dark:hover:bg-brand-900/20 rounded-lg transition-colors" title="Send Email">
                        <Mail size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredLeads.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-500 dark:text-slate-400">
                    <div className="flex flex-col items-center gap-2">
                      <Search size={32} className="text-slate-300 dark:text-slate-600" />
                      <p>No leads found matching your search.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination Placeholder */}
        <div className="px-6 py-4 border-t border-gray-100 dark:border-slate-800 flex items-center justify-between text-sm text-slate-500 dark:text-slate-400">
            <span>Showing {filteredLeads.length} of {MOCK_LEADS.length} leads</span>
            <div className="flex gap-2">
                <button className="px-3 py-1 border border-gray-200 dark:border-slate-700 rounded hover:bg-gray-50 dark:hover:bg-slate-800 disabled:opacity-50" disabled>Previous</button>
                <button className="px-3 py-1 border border-gray-200 dark:border-slate-700 rounded hover:bg-gray-50 dark:hover:bg-slate-800">Next</button>
            </div>
        </div>
      </div>

      {/* --- Modals --- */}
      <EmailComposerModal 
        isOpen={activeModal === 'email'} 
        onClose={() => setActiveModal(null)} 
        recipientEmail={selectedLead?.email}
        recipientName={selectedLead?.name}
      />
      <SMSComposerModal 
        isOpen={activeModal === 'sms'} 
        onClose={() => setActiveModal(null)} 
        recipientPhone={selectedLead?.mobile}
      />
      <ImportWizardModal 
        isOpen={activeModal === 'import'} 
        onClose={() => setActiveModal(null)} 
      />

    </div>
  );
};

export default MyLeads;