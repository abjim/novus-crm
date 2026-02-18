import React, { useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Edit2, Save, X, Phone, Mail, 
  Globe, DollarSign, Calendar, Clock, 
  CheckCircle2, MessageSquare, User, FileText,
  Bold, Italic, List, Send
} from 'lucide-react';

// --- Mock Data ---

const LEAD_DATA = {
  id: '1',
  name: 'Rahim Uddin',
  phone: '+8801711223344',
  email: 'rahim@gmail.com',
  source: 'Facebook Campaign',
  value: 50000,
  status: 'New',
  created: '2023-10-15',
  agent: 'Alex Mercer'
};

const INITIAL_TIMELINE = [
  { id: 1, type: 'note', content: 'Customer is interested in the premium package. Requested a callback tomorrow.', date: 'Today, 10:30 AM', author: 'Alex Mercer' },
  { id: 2, type: 'call', content: 'Outbound call - No answer.', date: 'Yesterday, 4:15 PM', author: 'Alex Mercer' },
  { id: 3, type: 'status', content: 'Status changed from "Lead" to "New"', date: 'Oct 15, 2023, 09:00 AM', author: 'System' },
  { id: 4, type: 'create', content: 'Lead created via Facebook Form', date: 'Oct 15, 2023, 08:55 AM', author: 'System' },
];

export default function LeadDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // State
  const [isEditing, setIsEditing] = useState(false);
  const [lead, setLead] = useState(LEAD_DATA);
  const [timeline, setTimeline] = useState(INITIAL_TIMELINE);
  
  // Ref for Rich Text Editor
  const editorRef = useRef<HTMLDivElement>(null);

  // Handlers
  const handleSave = () => {
    setIsEditing(false);
    // Simulate API call
    console.log('Saved:', lead);
  };

  const handleAddNote = () => {
    if (editorRef.current && editorRef.current.innerText.trim()) {
      const newNote = {
        id: Date.now(),
        type: 'note',
        content: editorRef.current.innerHTML, // Use innerHTML to preserve formatting
        date: 'Just now',
        author: 'You'
      };
      setTimeline([newNote, ...timeline]);
      editorRef.current.innerHTML = ''; // Clear editor
    }
  };

  const execCmd = (command: string) => {
    document.execCommand(command, false);
    editorRef.current?.focus();
  };

  const formatBDT = (amount: number) => {
    return new Intl.NumberFormat('en-BD', { style: 'currency', currency: 'BDT', minimumFractionDigits: 0 }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'New': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300';
      case 'Hot': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300';
      case 'Closed': return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300';
      default: return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300';
    }
  };

  // Helper for timeline icons
  const getTimelineIcon = (type: string) => {
    switch (type) {
      case 'call': return <Phone size={14} className="text-white" />;
      case 'note': return <FileText size={14} className="text-white" />;
      case 'status': return <CheckCircle2 size={14} className="text-white" />;
      case 'create': return <User size={14} className="text-white" />;
      default: return <MessageSquare size={14} className="text-white" />;
    }
  };

  const getTimelineColor = (type: string) => {
    switch (type) {
      case 'call': return 'bg-blue-500';
      case 'note': return 'bg-amber-500';
      case 'status': return 'bg-emerald-500';
      case 'create': return 'bg-violet-500';
      default: return 'bg-slate-500';
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      
      {/* --- Header --- */}
      <div className="flex items-center gap-4">
        <button 
          onClick={() => navigate(-1)} 
          className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-slate-800 transition-colors text-slate-600 dark:text-slate-300"
        >
          <ArrowLeft size={24} />
        </button>
        <div className="flex-1">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                {lead.name}
                <span className={`text-sm px-3 py-1 rounded-full font-medium ${getStatusColor(lead.status)}`}>
                    {lead.status}
                </span>
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">Lead ID: #{id} • Created on {lead.created}</p>
        </div>
        <div className="flex gap-2">
            {!isEditing ? (
                <button 
                    onClick={() => setIsEditing(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors text-sm font-medium"
                >
                    <Edit2 size={16} />
                    <span>Edit</span>
                </button>
            ) : (
                <>
                    <button 
                        onClick={() => setIsEditing(false)}
                        className="p-2 text-slate-500 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                    >
                        <X size={20} />
                    </button>
                    <button 
                        onClick={handleSave}
                        className="flex items-center gap-2 px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-colors text-sm font-medium"
                    >
                        <Save size={16} />
                        <span>Save</span>
                    </button>
                </>
            )}
        </div>
      </div>

      {/* --- Main Grid --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Lead Info Card */}
        <div className="lg:col-span-1 space-y-6">
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-gray-200 dark:border-slate-800 shadow-sm">
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 border-b border-gray-100 dark:border-slate-800 pb-3">
                    Lead Details
                </h2>
                
                <div className="space-y-4">
                    {/* Name */}
                    <div>
                        <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">Full Name</label>
                        {isEditing ? (
                            <input 
                                type="text" 
                                value={lead.name} 
                                onChange={(e) => setLead({...lead, name: e.target.value})}
                                className="w-full mt-1 px-3 py-2 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none"
                            />
                        ) : (
                            <p className="text-base font-medium text-slate-900 dark:text-white mt-1">{lead.name}</p>
                        )}
                    </div>

                    {/* Phone */}
                    <div>
                        <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide flex items-center gap-1">
                            Phone
                            {!isEditing && <Phone size={12} className="text-slate-400" />}
                        </label>
                        {isEditing ? (
                            <input 
                                type="text" 
                                value={lead.phone} 
                                onChange={(e) => setLead({...lead, phone: e.target.value})}
                                className="w-full mt-1 px-3 py-2 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none"
                            />
                        ) : (
                            <a href={`tel:${lead.phone}`} className="text-base font-medium text-brand-600 hover:text-brand-700 hover:underline mt-1 inline-block">
                                {lead.phone}
                            </a>
                        )}
                    </div>

                    {/* Email */}
                    <div>
                         <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide flex items-center gap-1">
                            Email
                            {!isEditing && <Mail size={12} className="text-slate-400" />}
                        </label>
                        {isEditing ? (
                            <input 
                                type="email" 
                                value={lead.email} 
                                onChange={(e) => setLead({...lead, email: e.target.value})}
                                className="w-full mt-1 px-3 py-2 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none"
                            />
                        ) : (
                             <a href={`mailto:${lead.email}`} className="text-base font-medium text-slate-900 dark:text-white mt-1 block hover:text-brand-600 transition-colors">
                                {lead.email}
                            </a>
                        )}
                    </div>

                    {/* Lead Source */}
                    <div>
                         <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide flex items-center gap-1">
                            Source
                            {!isEditing && <Globe size={12} className="text-slate-400" />}
                        </label>
                        {isEditing ? (
                            <select 
                                value={lead.source} 
                                onChange={(e) => setLead({...lead, source: e.target.value})}
                                className="w-full mt-1 px-3 py-2 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none"
                            >
                                <option>Facebook Campaign</option>
                                <option>Website</option>
                                <option>Referral</option>
                                <option>Walk-in</option>
                            </select>
                        ) : (
                             <p className="text-base font-medium text-slate-900 dark:text-white mt-1">{lead.source}</p>
                        )}
                    </div>

                    {/* Lead Value */}
                    <div>
                         <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide flex items-center gap-1">
                            Estimated Value
                            {!isEditing && <DollarSign size={12} className="text-slate-400" />}
                        </label>
                        {isEditing ? (
                            <input 
                                type="number" 
                                value={lead.value} 
                                onChange={(e) => setLead({...lead, value: parseInt(e.target.value) || 0})}
                                className="w-full mt-1 px-3 py-2 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none"
                            />
                        ) : (
                             <p className="text-base font-medium text-slate-900 dark:text-white mt-1">{formatBDT(lead.value)}</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Agent Info Small Card */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-gray-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
                 <div className="w-10 h-10 rounded-full bg-brand-100 dark:bg-brand-900 flex items-center justify-center text-brand-700 dark:text-brand-300 font-bold">
                    {lead.agent.charAt(0)}
                 </div>
                 <div>
                     <p className="text-xs text-slate-500 dark:text-slate-400 uppercase font-medium">Assigned Agent</p>
                     <p className="text-sm font-bold text-slate-900 dark:text-white">{lead.agent}</p>
                 </div>
            </div>
        </div>

        {/* Right Column: Timeline & Notes */}
        <div className="lg:col-span-2 space-y-6">
            
            {/* Rich Text Editor for Notes */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-sm overflow-hidden">
                <div className="bg-gray-50 dark:bg-slate-800 px-4 py-2 border-b border-gray-200 dark:border-slate-700 flex gap-2">
                    <button onClick={() => execCmd('bold')} className="p-1.5 rounded hover:bg-gray-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300" title="Bold">
                        <Bold size={16} />
                    </button>
                    <button onClick={() => execCmd('italic')} className="p-1.5 rounded hover:bg-gray-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300" title="Italic">
                        <Italic size={16} />
                    </button>
                    <button onClick={() => execCmd('insertUnorderedList')} className="p-1.5 rounded hover:bg-gray-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300" title="Bullet List">
                        <List size={16} />
                    </button>
                </div>
                <div 
                    ref={editorRef}
                    contentEditable
                    className="p-4 min-h-[120px] outline-none text-slate-800 dark:text-slate-200 text-sm leading-relaxed"
                    data-placeholder="Write a note..."
                />
                <div className="px-4 py-3 bg-white dark:bg-slate-900 border-t border-gray-100 dark:border-slate-800 flex justify-end">
                    <button 
                        onClick={handleAddNote}
                        className="flex items-center gap-2 px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-colors text-sm font-medium"
                    >
                        <Send size={16} />
                        <span>Add Note</span>
                    </button>
                </div>
            </div>

            {/* Activity Timeline */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-gray-200 dark:border-slate-800 shadow-sm">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-6">Activity Timeline</h3>
                
                <div className="relative pl-4 space-y-8">
                    {/* Vertical Line */}
                    <div className="absolute left-8 top-2 bottom-4 w-0.5 bg-gray-200 dark:bg-slate-800"></div>

                    {timeline.map((item) => (
                        <div key={item.id} className="relative flex gap-4">
                            {/* Icon Bubble */}
                            <div className={`
                                relative z-10 w-8 h-8 rounded-full flex items-center justify-center shrink-0 border-4 border-white dark:border-slate-900
                                ${getTimelineColor(item.type)}
                            `}>
                                {getTimelineIcon(item.type)}
                            </div>

                            {/* Content */}
                            <div className="flex-1 bg-gray-50 dark:bg-slate-800/50 rounded-xl p-4 border border-gray-100 dark:border-slate-800">
                                <div className="flex justify-between items-start mb-2">
                                    <div className="flex items-center gap-2">
                                        <span className="font-semibold text-sm text-slate-900 dark:text-white">{item.author}</span>
                                        <span className="text-xs text-slate-400">•</span>
                                        <span className="text-xs text-slate-500 uppercase font-medium">{item.type}</span>
                                    </div>
                                    <div className="flex items-center gap-1 text-xs text-slate-400">
                                        <Clock size={12} />
                                        {item.date}
                                    </div>
                                </div>
                                <div 
                                    className="text-sm text-slate-600 dark:text-slate-300 prose prose-sm dark:prose-invert"
                                    dangerouslySetInnerHTML={{ __html: item.content }}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

        </div>
      </div>
    </div>
  );
}