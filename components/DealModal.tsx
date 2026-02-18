import React, { useState, useEffect } from 'react';
import { 
  X, 
  Briefcase, 
  User, 
  Package, 
  Calendar, 
  CreditCard, 
  Check, 
  AlertCircle, 
  ChevronDown
} from 'lucide-react';
import DualHeatScore from './DualHeatScore';

// --- Types ---
export type PricingModel = 'Fixed' | 'EMI' | 'Early Bird' | 'Bundle' | 'Subscription';

interface Product {
  id: string;
  name: string;
  price: number;
}

interface Lead {
  id: string;
  name: string;
  company: string;
  engagementScore: number;
  fitScore: number;
}

interface DealModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  initialProductId?: string;
}

// --- Mock Leads ---
const MOCK_LEADS: Lead[] = [
  { id: '1', name: 'Rahim Uddin', company: 'Tech Solutions Ltd', engagementScore: 42, fitScore: 35 },
  { id: '2', name: 'Karim Ahmed', company: 'Global Exports', engagementScore: 15, fitScore: 45 },
  { id: '3', name: 'Nusrat Jahan', company: 'Design Co', engagementScore: 30, fitScore: 20 },
];

export const DealModal: React.FC<DealModalProps> = ({ isOpen, onClose, products, initialProductId }) => {
  // Form State
  const [selectedLeadId, setSelectedLeadId] = useState<string>('');
  const [selectedProductId, setSelectedProductId] = useState<string>(initialProductId || '');
  const [pricingModel, setPricingModel] = useState<PricingModel>('Fixed');
  const [dealValue, setDealValue] = useState<number>(0);
  
  // EMI State
  const [emiMonths, setEmiMonths] = useState<number>(3);
  const [installments, setInstallments] = useState<{date: string, amount: number}[]>([]);

  // Effects
  useEffect(() => {
    if (initialProductId) setSelectedProductId(initialProductId);
  }, [initialProductId]);

  useEffect(() => {
    const product = products.find(p => p.id === selectedProductId);
    if (product) {
      // Adjust base price based on model logic
      let price = product.price;
      if (pricingModel === 'Early Bird') price = price * 0.9;
      if (pricingModel === 'Bundle') price = price * 1.15; // Assuming bundle adds value
      setDealValue(Math.round(price));
    }
  }, [selectedProductId, pricingModel, products]);

  // Recalculate EMI schedule when value or months change
  useEffect(() => {
    if (pricingModel === 'EMI' && dealValue > 0) {
      const amountPerInstallment = Math.ceil(dealValue / emiMonths);
      const newSchedule = Array.from({ length: emiMonths }).map((_, i) => {
        const date = new Date();
        date.setMonth(date.getMonth() + i + 1);
        return {
          date: date.toISOString().split('T')[0],
          amount: amountPerInstallment
        };
      });
      setInstallments(newSchedule);
    }
  }, [pricingModel, dealValue, emiMonths]);

  if (!isOpen) return null;

  const selectedLead = MOCK_LEADS.find(l => l.id === selectedLeadId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Deal Created", { selectedLeadId, selectedProductId, pricingModel, dealValue, installments });
    onClose();
  };

  const formatBDT = (amount: number) => 
    new Intl.NumberFormat('en-BD', { style: 'currency', currency: 'BDT', minimumFractionDigits: 0 }).format(amount);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-slate-900 w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden border border-gray-200 dark:border-slate-800 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg">
              <Briefcase size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Create New Opportunity</h2>
              <p className="text-xs text-slate-500">Configure product details and pricing terms</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <form id="deal-form" onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left Column: Selection */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* 1. Lead Selection */}
              <div className="space-y-3">
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">Select Lead / Customer</label>
                <div className="relative">
                  <select 
                    required
                    value={selectedLeadId} 
                    onChange={(e) => setSelectedLeadId(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white appearance-none focus:ring-2 focus:ring-indigo-500 outline-none transition-shadow"
                  >
                    <option value="">-- Choose a Lead --</option>
                    {MOCK_LEADS.map(lead => (
                      <option key={lead.id} value={lead.id}>{lead.name} ({lead.company})</option>
                    ))}
                  </select>
                  <User className="absolute left-3 top-3.5 text-slate-400" size={18} />
                  <ChevronDown className="absolute right-4 top-4 text-slate-400 pointer-events-none" size={16} />
                </div>
              </div>

              {/* 2. Product Selection */}
              <div className="space-y-3">
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">Product / Service SKU</label>
                <div className="relative">
                  <select 
                    required
                    value={selectedProductId} 
                    onChange={(e) => setSelectedProductId(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white appearance-none focus:ring-2 focus:ring-indigo-500 outline-none transition-shadow"
                  >
                    <option value="">-- Choose Product --</option>
                    {products.map(p => (
                      <option key={p.id} value={p.id}>{p.name} - {formatBDT(p.price)}</option>
                    ))}
                  </select>
                  <Package className="absolute left-3 top-3.5 text-slate-400" size={18} />
                  <ChevronDown className="absolute right-4 top-4 text-slate-400 pointer-events-none" size={16} />
                </div>
              </div>

              {/* 3. Pricing Model */}
              <div className="space-y-3">
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">Pricing Strategy</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {(['Fixed', 'EMI', 'Early Bird', 'Bundle', 'Subscription'] as PricingModel[]).map((model) => (
                    <button
                      key={model}
                      type="button"
                      onClick={() => setPricingModel(model)}
                      className={`
                        py-2.5 px-3 rounded-xl text-sm font-medium border transition-all duration-200
                        ${pricingModel === model 
                          ? 'bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-500/30' 
                          : 'bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-700'
                        }
                      `}
                    >
                      {model}
                    </button>
                  ))}
                </div>
              </div>

              {/* Dynamic EMI Schedule */}
              {pricingModel === 'EMI' && (
                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-5 border border-slate-200 dark:border-slate-700 animate-fade-in space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-2">
                      <CreditCard size={16} />
                      Installment Plan
                    </h3>
                    <div className="flex items-center gap-2">
                       <span className="text-xs text-slate-500">Duration (Months):</span>
                       <input 
                          type="range" 
                          min="2" 
                          max="6" 
                          value={emiMonths}
                          onChange={(e) => setEmiMonths(parseInt(e.target.value))}
                          className="w-24 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                       />
                       <span className="text-sm font-bold w-4">{emiMonths}</span>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                     {installments.map((inst, idx) => (
                       <div key={idx} className="flex gap-3 items-center">
                          <span className="text-xs font-medium text-slate-400 w-6">#{idx+1}</span>
                          <div className="flex-1 relative">
                             <input 
                                type="date" 
                                value={inst.date}
                                onChange={(e) => {
                                  const newInst = [...installments];
                                  newInst[idx].date = e.target.value;
                                  setInstallments(newInst);
                                }}
                                className="w-full pl-8 py-1.5 text-xs bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 rounded-lg outline-none focus:border-indigo-500"
                             />
                             <Calendar className="absolute left-2.5 top-1.5 text-slate-400" size={12} />
                          </div>
                          <div className="w-1/3 relative">
                             <input 
                                type="number" 
                                value={inst.amount}
                                onChange={(e) => {
                                  const newInst = [...installments];
                                  newInst[idx].amount = parseInt(e.target.value);
                                  setInstallments(newInst);
                                }}
                                className="w-full px-2 py-1.5 text-xs bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 rounded-lg outline-none focus:border-indigo-500 text-right"
                             />
                          </div>
                       </div>
                     ))}
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t border-slate-200 dark:border-slate-700">
                     <span className="text-xs font-semibold text-slate-500">Total</span>
                     <span className="text-sm font-bold text-indigo-600">{formatBDT(installments.reduce((sum, i) => sum + i.amount, 0))}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Right Column: Summary & Insights */}
            <div className="space-y-6">
              
              {/* Lead Heat Score Panel */}
              <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-gray-100 dark:border-slate-700 shadow-sm flex flex-col items-center">
                 <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-4">Lead Fit Analysis</h3>
                 {selectedLead ? (
                   <div className="animate-scale-in">
                      <DualHeatScore engagement={selectedLead.engagementScore} fit={selectedLead.fitScore} />
                      <div className="mt-4 flex justify-center gap-6 text-xs text-slate-500">
                          <div className="flex items-center gap-1.5">
                             <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                             <span>Engagement: <b>{selectedLead.engagementScore}/50</b></span>
                          </div>
                          <div className="flex items-center gap-1.5">
                             <div className="w-2 h-2 rounded-full bg-indigo-600"></div>
                             <span>Fit: <b>{selectedLead.fitScore}/50</b></span>
                          </div>
                      </div>
                      <div className="mt-4 text-center">
                          <p className="text-xs text-slate-400">
                            {selectedLead.fitScore + selectedLead.engagementScore > 70 
                              ? "High probability of conversion. Recommend pushing for closing." 
                              : "Moderate fit. Consider nurturing with educational content first."}
                          </p>
                      </div>
                   </div>
                 ) : (
                   <div className="h-[120px] w-full flex flex-col items-center justify-center text-slate-400 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl">
                      <User size={32} className="mb-2 opacity-50" />
                      <p className="text-xs">Select a lead to view scores</p>
                   </div>
                 )}
              </div>

              {/* Deal Value Summary */}
              <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl p-6 border border-indigo-100 dark:border-indigo-900/30">
                 <h3 className="text-sm font-semibold text-indigo-800 dark:text-indigo-300 mb-1">Estimated Deal Value</h3>
                 <p className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">{formatBDT(dealValue)}</p>
                 <div className="mt-3 text-xs text-indigo-600/70 dark:text-indigo-400/70 flex items-start gap-2">
                    <AlertCircle size={14} className="mt-0.5 shrink-0" />
                    <span>Calculated based on {pricingModel} model and base SKU price.</span>
                 </div>
              </div>

            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="p-6 bg-gray-50 dark:bg-slate-900/50 border-t border-gray-100 dark:border-slate-800 flex justify-end gap-3">
          <button 
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-slate-800 dark:hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button 
            type="submit"
            form="deal-form"
            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-xl shadow-lg shadow-indigo-500/25 flex items-center gap-2 transform active:scale-95 transition-all"
          >
            <Check size={18} />
            Confirm & Create
          </button>
        </div>
      </div>
    </div>
  );
};