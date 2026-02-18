import React, { useState, useEffect } from 'react';
import { 
  X, 
  Upload, 
  FileText, 
  ArrowRight, 
  Check, 
  AlertCircle, 
  Mail, 
  MessageSquare, 
  ChevronRight,
  ChevronLeft,
  FileSpreadsheet
} from 'lucide-react';

// --- Shared Modal Wrapper ---
const ModalWrapper: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  title: string;
  icon?: React.ElementType;
  children: React.ReactNode;
  maxWidth?: string;
}> = ({ isOpen, onClose, title, icon: Icon, children, maxWidth = 'max-w-lg' }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className={`bg-white dark:bg-slate-900 w-full ${maxWidth} rounded-2xl shadow-2xl overflow-hidden border border-gray-200 dark:border-slate-800 flex flex-col max-h-[90vh]`}>
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-3">
            {Icon && <div className="p-2 bg-brand-100 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400 rounded-lg"><Icon size={20} /></div>}
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">{title}</h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
            <X size={24} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
};

// --- 1. Email Composer Modal ---

interface EmailModalProps {
  isOpen: boolean;
  onClose: () => void;
  recipientEmail?: string;
  recipientName?: string;
}

export const EmailComposerModal: React.FC<EmailModalProps> = ({ isOpen, onClose, recipientEmail = '', recipientName = '' }) => {
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [template, setTemplate] = useState('');

  const templates: Record<string, { subject: string, body: string }> = {
    'intro': { subject: 'Introduction to NOVUS Services', body: `Hi ${recipientName},\n\nI hope this email finds you well. I wanted to reach out and introduce you to our latest offerings...` },
    'followup': { subject: 'Following up on our conversation', body: `Hi ${recipientName},\n\nJust wanted to circle back on our last discussion regarding...` },
    'quote': { subject: 'Your requested quotation', body: `Dear ${recipientName},\n\nPlease find attached the quotation as requested...` }
  };

  const handleTemplateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const key = e.target.value;
    setTemplate(key);
    if (key && templates[key]) {
      setSubject(templates[key].subject);
      setBody(templates[key].body);
    }
  };

  return (
    <ModalWrapper isOpen={isOpen} onClose={onClose} title="Compose Email" icon={Mail} maxWidth="max-w-2xl">
      <div className="p-6 space-y-4">
        <div className="grid grid-cols-1 gap-4">
            <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">To</label>
                <input 
                    type="text" 
                    value={recipientEmail} 
                    readOnly
                    className="w-full px-3 py-2 bg-gray-100 dark:bg-slate-800/50 border border-gray-200 dark:border-slate-700 rounded-lg text-sm text-slate-500 cursor-not-allowed"
                />
            </div>
            
            <div className="flex gap-4">
                <div className="flex-1">
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Template</label>
                    <select 
                        value={template} 
                        onChange={handleTemplateChange}
                        className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none"
                    >
                        <option value="">Select a template...</option>
                        <option value="intro">Introduction</option>
                        <option value="followup">Follow-up</option>
                        <option value="quote">Quotation</option>
                    </select>
                </div>
            </div>

            <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Subject</label>
                <input 
                    type="text" 
                    value={subject} 
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="Enter email subject"
                    className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none"
                />
            </div>

            <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Message Body</label>
                <textarea 
                    rows={8}
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none resize-none font-mono"
                />
            </div>
        </div>
      </div>
      <div className="p-4 bg-gray-50 dark:bg-slate-900/50 border-t border-gray-100 dark:border-slate-800 flex justify-end gap-3">
         <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-slate-800 dark:hover:text-white transition-colors">Cancel</button>
         <button onClick={onClose} className="px-6 py-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium rounded-lg shadow-sm flex items-center gap-2">
            <Mail size={16} /> Send Email
         </button>
      </div>
    </ModalWrapper>
  );
};

// --- 2. SMS Composer Modal ---

interface SMSModalProps {
  isOpen: boolean;
  onClose: () => void;
  recipientPhone?: string;
}

export const SMSComposerModal: React.FC<SMSModalProps> = ({ isOpen, onClose, recipientPhone = '' }) => {
  const [message, setMessage] = useState('');
  const [template, setTemplate] = useState('');
  const MAX_CHARS = 160;

  const templates: Record<string, string> = {
    'callback': "Hi, this is Alex from NOVUS CRM. I tried reaching you earlier. Please call me back when free.",
    'confirm': "Your appointment with NOVUS CRM is confirmed for tomorrow at 10 AM.",
    'promo': "Exclusive offer: Get 20% off on your next subscription renewal. Valid until Friday."
  };

  const handleTemplateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const key = e.target.value;
    setTemplate(key);
    if (key && templates[key]) {
      setMessage(templates[key]);
    }
  };

  const isOverLimit = message.length > MAX_CHARS;

  return (
    <ModalWrapper isOpen={isOpen} onClose={onClose} title="Send SMS" icon={MessageSquare} maxWidth="max-w-md">
      <div className="p-6 space-y-4">
        <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">To</label>
            <input 
                type="text" 
                value={recipientPhone} 
                readOnly
                className="w-full px-3 py-2 bg-gray-100 dark:bg-slate-800/50 border border-gray-200 dark:border-slate-700 rounded-lg text-sm text-slate-500 cursor-not-allowed"
            />
        </div>

        <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Quick Template</label>
            <select 
                value={template} 
                onChange={handleTemplateChange}
                className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none"
            >
                <option value="">Select a message...</option>
                <option value="callback">Callback Request</option>
                <option value="confirm">Meeting Confirmation</option>
                <option value="promo">Promo Offer</option>
            </select>
        </div>

        <div>
            <div className="flex justify-between items-center mb-1.5">
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide">Message</label>
                <span className={`text-xs font-medium ${isOverLimit ? 'text-red-500' : 'text-slate-400'}`}>
                    {message.length} / {MAX_CHARS}
                </span>
            </div>
            <textarea 
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className={`w-full px-3 py-2 bg-white dark:bg-slate-800 border rounded-lg text-sm text-slate-900 dark:text-white focus:ring-2 outline-none resize-none ${isOverLimit ? 'border-red-300 focus:ring-red-200' : 'border-gray-200 dark:border-slate-700 focus:ring-brand-500'}`}
            />
             {isOverLimit && (
                <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                    <AlertCircle size={12} /> Message exceeds single SMS limit (will be split).
                </p>
            )}
        </div>
      </div>
      <div className="p-4 bg-gray-50 dark:bg-slate-900/50 border-t border-gray-100 dark:border-slate-800 flex justify-end gap-3">
         <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-slate-800 dark:hover:text-white transition-colors">Cancel</button>
         <button onClick={onClose} className="px-6 py-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium rounded-lg shadow-sm flex items-center gap-2">
            <MessageSquare size={16} /> Send SMS
         </button>
      </div>
    </ModalWrapper>
  );
};

// --- 3. Import Wizard Modal ---

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ImportWizardModal: React.FC<ImportModalProps> = ({ isOpen, onClose }) => {
  const [step, setStep] = useState(1);
  const [file, setFile] = useState<File | null>(null);

  const reset = () => {
    setStep(1);
    setFile(null);
    onClose();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  // Step 1: File Upload
  const renderStep1 = () => (
    <div className="space-y-6">
      <div 
        className="border-2 border-dashed border-gray-300 dark:border-slate-700 rounded-2xl p-10 flex flex-col items-center justify-center text-center bg-gray-50 dark:bg-slate-800/30 hover:bg-gray-100 dark:hover:bg-slate-800/50 transition-colors cursor-pointer"
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        onClick={() => setFile({ name: 'leads_import_v2.csv' } as File)} // Simulate file select
      >
        <div className="w-16 h-16 bg-brand-100 dark:bg-brand-900/50 text-brand-600 dark:text-brand-400 rounded-full flex items-center justify-center mb-4">
           {file ? <Check size={32} /> : <Upload size={32} />}
        </div>
        {file ? (
            <div>
                <p className="text-lg font-medium text-slate-900 dark:text-white">{file.name}</p>
                <p className="text-sm text-slate-500 mt-1">File ready for processing</p>
                <button onClick={(e) => {e.stopPropagation(); setFile(null);}} className="text-red-500 text-sm font-medium mt-2 hover:underline">Remove</button>
            </div>
        ) : (
            <div>
                <p className="text-lg font-medium text-slate-900 dark:text-white">Click or drag file to this area to upload</p>
                <p className="text-sm text-slate-500 mt-1">Support for a single or bulk upload. Strictly CSV or Excel files.</p>
            </div>
        )}
      </div>
      <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl flex items-start gap-3 border border-blue-100 dark:border-blue-900/30">
        <FileSpreadsheet className="text-blue-600 dark:text-blue-400 mt-0.5" size={20} />
        <div>
            <h4 className="text-sm font-bold text-blue-800 dark:text-blue-300">Download Template</h4>
            <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">Use our standard template to ensure smooth data mapping.</p>
        </div>
      </div>
    </div>
  );

  // Step 2: Mapping
  const renderStep2 = () => (
    <div className="space-y-4">
        <p className="text-sm text-slate-500 dark:text-slate-400">Map the columns from your CSV file to the fields in NOVUS CRM.</p>
        <div className="border border-gray-200 dark:border-slate-800 rounded-xl overflow-hidden">
            <table className="w-full text-sm">
                <thead className="bg-gray-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-b border-gray-200 dark:border-slate-800">
                    <tr>
                        <th className="px-4 py-3 text-left font-medium">Your Column (CSV)</th>
                        <th className="px-4 py-3 text-center w-8"></th>
                        <th className="px-4 py-3 text-left font-medium">NOVUS Field</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-slate-800 bg-white dark:bg-slate-900">
                    {[
                        { csv: 'Full Name', sys: 'name' },
                        { csv: 'Phone Num', sys: 'mobile' },
                        { csv: 'Email Addr', sys: 'email' },
                        { csv: 'Lead Source', sys: 'source' },
                        { csv: 'Est. Value', sys: 'value' },
                    ].map((row, i) => (
                        <tr key={i}>
                            <td className="px-4 py-3 text-slate-700 dark:text-slate-300">{row.csv}</td>
                            <td className="px-4 py-3 text-slate-400"><ArrowRight size={16} className="mx-auto" /></td>
                            <td className="px-4 py-3">
                                <select className="w-full px-2 py-1.5 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded text-slate-900 dark:text-white text-xs outline-none focus:ring-1 focus:ring-brand-500">
                                    <option value={row.sys}>Matched: {row.sys.charAt(0).toUpperCase() + row.sys.slice(1)}</option>
                                    <option>Do Not Import</option>
                                </select>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    </div>
  );

  // Step 3: Validation
  const renderStep3 = () => (
    <div className="space-y-4">
        <div className="flex items-center gap-2 p-3 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 rounded-lg text-sm border border-emerald-100 dark:border-emerald-900/30">
            <CheckCircle2 size={18} />
            <span>Ready to import <b>254</b> valid records.</span>
        </div>
        <div className="border border-gray-200 dark:border-slate-800 rounded-xl overflow-hidden">
            <table className="w-full text-xs text-left">
                <thead className="bg-gray-50 dark:bg-slate-800 border-b border-gray-200 dark:border-slate-800">
                    <tr>
                         <th className="px-3 py-2 text-slate-500">Row</th>
                         <th className="px-3 py-2 text-slate-500">Name</th>
                         <th className="px-3 py-2 text-slate-500">Email</th>
                         <th className="px-3 py-2 text-slate-500">Status</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
                    <tr><td className="px-3 py-2 text-slate-400">1</td><td className="px-3 py-2 dark:text-slate-300">John Smith</td><td className="px-3 py-2 dark:text-slate-300">john@example.com</td><td className="px-3 py-2 text-emerald-500">Valid</td></tr>
                    <tr><td className="px-3 py-2 text-slate-400">2</td><td className="px-3 py-2 dark:text-slate-300">Alice Doe</td><td className="px-3 py-2 dark:text-slate-300">alice.doe@test</td><td className="px-3 py-2 text-red-500">Invalid Email</td></tr>
                    <tr><td className="px-3 py-2 text-slate-400">3</td><td className="px-3 py-2 dark:text-slate-300">Bob Brown</td><td className="px-3 py-2 dark:text-slate-300">bob@gmail.com</td><td className="px-3 py-2 text-emerald-500">Valid</td></tr>
                </tbody>
            </table>
        </div>
    </div>
  );

  const CheckCircle2 = ({size}: {size: number}) => <Check size={size} />; // Local helper

  return (
    <ModalWrapper isOpen={isOpen} onClose={reset} title="Import Leads Wizard" maxWidth="max-w-2xl">
      <div className="flex flex-col h-[500px]">
        {/* Wizard Steps Indicator */}
        <div className="px-6 pt-2 pb-6">
            <div className="flex items-center justify-between relative">
                <div className="absolute left-0 right-0 top-1/2 h-0.5 bg-gray-200 dark:bg-slate-700 -z-10"></div>
                {[1, 2, 3].map((s) => (
                    <div key={s} className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${step >= s ? 'bg-brand-600 text-white' : 'bg-gray-200 dark:bg-slate-700 text-slate-500'}`}>
                        {s}
                    </div>
                ))}
            </div>
            <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 mt-2 font-medium">
                <span>Upload</span>
                <span>Map Columns</span>
                <span>Preview</span>
            </div>
        </div>

        {/* Content */}
        <div className="flex-1 px-6 overflow-y-auto">
            {step === 1 && renderStep1()}
            {step === 2 && renderStep2()}
            {step === 3 && renderStep3()}
        </div>

        {/* Footer */}
        <div className="p-4 bg-gray-50 dark:bg-slate-900/50 border-t border-gray-100 dark:border-slate-800 flex justify-between mt-auto">
             <button 
                onClick={step === 1 ? reset : () => setStep(step - 1)} 
                className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-slate-800 dark:hover:text-white transition-colors"
             >
                {step === 1 ? 'Cancel' : 'Back'}
             </button>
             <button 
                onClick={() => {
                    if (step < 3) setStep(step + 1);
                    else reset();
                }}
                disabled={step === 1 && !file}
                className="px-6 py-2 bg-brand-600 hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg shadow-sm flex items-center gap-2"
             >
                {step === 3 ? 'Finish Import' : 'Next Step'}
                {step < 3 && <ChevronRight size={16} />}
             </button>
        </div>
      </div>
    </ModalWrapper>
  );
};
