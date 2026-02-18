import React, { useState, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  Phone, 
  PhoneCall, 
  Flame, 
  CheckCircle2, 
  Banknote, 
  TrendingUp, 
  Calendar, 
  Users, 
  FileText,
  Save,
  ArrowDownRight,
  ArrowUpRight
} from 'lucide-react';

// --- Types & Mock Data ---

type Timeframe = 'Daily' | 'Weekly' | 'Monthly';

interface MetricData {
  calls: number;
  connected: number;
  hotLeads: number;
  sales: number;
  revenue: number;
  trend: number[]; // For the chart
  labels: string[]; // For chart x-axis
}

const MOCK_DATA: Record<Timeframe, MetricData> = {
  Daily: {
    calls: 48,
    connected: 32,
    hotLeads: 5,
    sales: 2,
    revenue: 25000,
    trend: [0, 5, 12, 18, 22, 35, 40, 38, 48], // Hourly accumulation or similar
    labels: ['9am', '10am', '11am', '12pm', '1pm', '2pm', '3pm', '4pm', '5pm']
  },
  Weekly: {
    calls: 245,
    connected: 156,
    hotLeads: 28,
    sales: 12,
    revenue: 180000,
    trend: [20, 35, 45, 30, 55, 60, 48], // Daily
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  },
  Monthly: {
    calls: 980,
    connected: 650,
    hotLeads: 120,
    sales: 45,
    revenue: 650000,
    trend: [120, 150, 180, 140, 200, 220, 210, 250, 280, 300], // ~3 day intervals
    labels: ['W1', 'W1.5', 'W2', 'W2.5', 'W3', 'W3.5', 'W4', 'End']
  }
};

const AGENT_PERFORMANCE = [
  { id: 1, name: 'Alex Mercer', calls: 245, connected: '64%', hot: 28, sales: 12, revenue: 180000, avatar: 'https://ui-avatars.com/api/?name=Alex+Mercer&background=c7d2fe&color=3730a3' },
  { id: 2, name: 'Sarah Khan', calls: 210, connected: '58%', hot: 22, sales: 9, revenue: 135000, avatar: 'https://ui-avatars.com/api/?name=Sarah+Khan&background=fecaca&color=991b1b' },
  { id: 3, name: 'John Doe', calls: 185, connected: '52%', hot: 15, sales: 7, revenue: 95000, avatar: 'https://ui-avatars.com/api/?name=John+Doe&background=bbf7d0&color=166534' },
  { id: 4, name: 'Emily Blunt', calls: 195, connected: '61%', hot: 18, sales: 8, revenue: 110000, avatar: 'https://ui-avatars.com/api/?name=Emily+Blunt&background=fde68a&color=854d0e' },
  { id: 5, name: 'Michael Scott', calls: 120, connected: '45%', hot: 8, sales: 3, revenue: 45000, avatar: 'https://ui-avatars.com/api/?name=Michael+Scott&background=e2e8f0&color=475569' },
];

// --- Components ---

const MetricCard: React.FC<{ 
  title: string; 
  value: string | number; 
  subValue?: string;
  icon: React.ElementType; 
  color: string; 
  trend?: 'up' | 'down';
}> = ({ title, value, subValue, icon: Icon, color, trend = 'up' }) => (
  <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm relative overflow-hidden group hover:shadow-md transition-shadow">
    {/* Background Pattern */}
    <div className={`absolute -right-4 -top-4 opacity-5 group-hover:opacity-10 transition-opacity transform group-hover:scale-110 duration-500 ${color.replace('text-', 'text-')}`}>
      <Icon size={100} className="fill-current" />
    </div>

    <div className="flex justify-between items-start mb-2 relative z-10">
      <div className={`p-2.5 rounded-xl ${color} bg-opacity-10 dark:bg-opacity-20`}>
        <Icon className={color.replace('bg-', 'text-')} size={20} />
      </div>
      {trend === 'up' ? (
        <div className="flex items-center text-emerald-500 text-xs font-medium bg-emerald-50 dark:bg-emerald-900/20 px-2 py-1 rounded-full">
            <TrendingUp size={12} className="mr-1" /> +12%
        </div>
      ) : (
         <div className="flex items-center text-rose-500 text-xs font-medium bg-rose-50 dark:bg-rose-900/20 px-2 py-1 rounded-full">
            <ArrowDownRight size={12} className="mr-1" /> -5%
        </div>
      )}
    </div>
    
    <div className="relative z-10">
      <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{title}</p>
      <div className="flex items-baseline gap-2 mt-1">
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">{value}</h3>
          {subValue && <span className="text-xs text-slate-400 font-medium">{subValue}</span>}
      </div>
    </div>
  </div>
);

// Lightweight SVG Line Chart
const SimpleChart: React.FC<{ data: number[]; labels: string[]; colorClass: string }> = ({ data, labels, colorClass }) => {
  const height = 200;
  const width = 800;
  const max = Math.max(...data) * 1.1; // Add 10% padding
  const min = 0;
  
  // Calculate points
  const points = data.map((val, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((val - min) / (max - min)) * height;
    return `${x},${y}`;
  }).join(' ');

  // Area path (closed loop)
  const areaPath = `${points} ${width},${height} 0,${height}`;

  return (
    <div className="w-full h-64 flex flex-col">
       <div className="flex-1 w-full relative">
         <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible" preserveAspectRatio="none">
            {/* Grid Lines */}
            {[0, 0.25, 0.5, 0.75, 1].map((tick) => (
                <line 
                    key={tick} 
                    x1="0" 
                    y1={height * tick} 
                    x2={width} 
                    y2={height * tick} 
                    stroke="currentColor" 
                    strokeOpacity="0.1" 
                    className="text-slate-400"
                    strokeDasharray="4"
                />
            ))}

            {/* Area Fill */}
            <path d={`M ${areaPath}`} className={`${colorClass} fill-current opacity-10`} stroke="none" />
            
            {/* Line Stroke */}
            <polyline 
                points={points} 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="3" 
                strokeLinecap="round" 
                strokeLinejoin="round"
                className={colorClass}
            />

            {/* Data Points */}
            {data.map((val, i) => {
                const x = (i / (data.length - 1)) * width;
                const y = height - ((val - min) / (max - min)) * height;
                return (
                    <circle 
                        key={i} 
                        cx={x} 
                        cy={y} 
                        r="4" 
                        className={`${colorClass} fill-white dark:fill-slate-900 stroke-current`} 
                        strokeWidth="2" 
                    />
                );
            })}
         </svg>
       </div>
       {/* X-Axis Labels */}
       <div className="flex justify-between mt-2 px-2">
            {labels.map((label, i) => (
                <span key={i} className="text-xs text-slate-400">{label}</span>
            ))}
       </div>
    </div>
  );
};

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [timeframe, setTimeframe] = useState<Timeframe>('Daily');
  const [remarks, setRemarks] = useState('');

  // Get current data based on selection
  const currentData = MOCK_DATA[timeframe];

  // Helper formatting
  const formatBDT = (amount: number) => {
    return new Intl.NumberFormat('en-BD', { style: 'currency', currency: 'BDT', minimumFractionDigits: 0 }).format(amount);
  };

  const getDayGreeting = () => {
    const hours = new Date().getHours();
    if (hours < 12) return 'Good morning';
    if (hours < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      
      {/* --- Top Bar: Greeting & Timeframe Toggle --- */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            {getDayGreeting()}, {user?.name.split(' ')[0]}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1 flex items-center gap-2">
            <Calendar size={14} />
            {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>

        {/* Timeframe Tabs */}
        <div className="bg-white dark:bg-slate-900 p-1 rounded-xl border border-gray-200 dark:border-slate-800 flex shadow-sm self-start md:self-auto">
            {(['Daily', 'Weekly', 'Monthly'] as Timeframe[]).map((tf) => (
                <button
                    key={tf}
                    onClick={() => setTimeframe(tf)}
                    className={`
                        px-4 py-1.5 rounded-lg text-sm font-medium transition-all duration-200
                        ${timeframe === tf 
                            ? 'bg-brand-600 text-white shadow-md shadow-brand-500/20' 
                            : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-800'
                        }
                    `}
                >
                    {tf}
                </button>
            ))}
        </div>
      </div>

      {/* --- Metric Cards Grid --- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
         <MetricCard 
            title="Calls Made" 
            value={currentData.calls} 
            icon={Phone} 
            color="text-blue-500" 
         />
         <MetricCard 
            title="Connected" 
            value={currentData.connected} 
            subValue={`(${Math.round((currentData.connected / currentData.calls) * 100)}%)`}
            icon={PhoneCall} 
            color="text-indigo-500" 
         />
         <MetricCard 
            title="Hot Leads" 
            value={currentData.hotLeads} 
            icon={Flame} 
            color="text-orange-500" 
         />
         <MetricCard 
            title="Sales Count" 
            value={currentData.sales} 
            icon={CheckCircle2} 
            color="text-emerald-500" 
         />
         <MetricCard 
            title="Revenue" 
            value={formatBDT(currentData.revenue)} 
            icon={Banknote} 
            color="text-violet-500" 
         />
      </div>

      {/* --- Charts & Remarks Split --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart Section */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl p-6 border border-gray-100 dark:border-slate-800 shadow-sm">
             <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <TrendingUp size={20} className="text-brand-500" />
                    Performance Trend
                </h3>
                <span className="text-xs font-medium px-2 py-1 bg-gray-100 dark:bg-slate-800 text-slate-500 rounded">
                    {timeframe} View
                </span>
             </div>
             
             {/* Custom SVG Chart */}
             <SimpleChart 
                data={currentData.trend} 
                labels={currentData.labels} 
                colorClass={timeframe === 'Daily' ? 'text-blue-500' : timeframe === 'Weekly' ? 'text-violet-500' : 'text-emerald-500'} 
             />
        </div>

        {/* Remarks Section */}
        <div className="lg:col-span-1 bg-white dark:bg-slate-900 rounded-2xl p-6 border border-gray-100 dark:border-slate-800 shadow-sm flex flex-col">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-4">
                <FileText size={20} className="text-slate-400" />
                Daily Remarks
            </h3>
            <textarea
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder="Write your daily summary, blockers, or notes here..."
                className="flex-1 w-full p-4 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl resize-none outline-none focus:ring-2 focus:ring-brand-500 text-sm text-slate-700 dark:text-slate-200 placeholder-slate-400"
            />
            <div className="mt-4 flex justify-end">
                <button className="flex items-center gap-2 px-4 py-2 bg-brand-600 text-white rounded-lg text-sm font-medium hover:bg-brand-700 transition-colors shadow-sm">
                    <Save size={16} />
                    Save Note
                </button>
            </div>
        </div>
      </div>

      {/* --- Agent Comparison Table (Manager View) --- */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100 dark:border-slate-800 flex justify-between items-center">
             <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Users size={20} className="text-slate-400" />
                Agent Leaderboard
             </h3>
             <button className="text-sm text-brand-600 font-medium hover:underline">View Full Report</button>
        </div>
        <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-medium border-b border-gray-100 dark:border-slate-800">
                    <tr>
                        <th className="px-6 py-4">Agent Name</th>
                        <th className="px-6 py-4 text-center">Calls</th>
                        <th className="px-6 py-4 text-center">Connected</th>
                        <th className="px-6 py-4 text-center">Hot Leads</th>
                        <th className="px-6 py-4 text-center">Sales</th>
                        <th className="px-6 py-4 text-right">Revenue</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
                    {AGENT_PERFORMANCE.map((agent, index) => (
                        <tr key={agent.id} className="hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors">
                            <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                    <span className={`text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full ${index < 3 ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' : 'text-slate-400'}`}>
                                        {index + 1}
                                    </span>
                                    <img src={agent.avatar} alt={agent.name} className="w-8 h-8 rounded-full bg-slate-200" />
                                    <span className="font-medium text-slate-900 dark:text-white">{agent.name}</span>
                                    {index === 0 && <span className="text-xs px-2 py-0.5 bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 rounded-full font-medium">Top</span>}
                                </div>
                            </td>
                            <td className="px-6 py-4 text-center text-slate-600 dark:text-slate-400">{agent.calls}</td>
                            <td className="px-6 py-4 text-center">
                                <span className="text-slate-900 dark:text-white font-medium">{agent.connected}</span>
                            </td>
                            <td className="px-6 py-4 text-center">
                                <div className="inline-flex items-center gap-1 text-orange-600 dark:text-orange-400 font-medium bg-orange-50 dark:bg-orange-900/20 px-2 py-0.5 rounded-full text-xs">
                                    <Flame size={12} /> {agent.hot}
                                </div>
                            </td>
                            <td className="px-6 py-4 text-center text-slate-900 dark:text-white font-medium">{agent.sales}</td>
                            <td className="px-6 py-4 text-right font-bold text-slate-900 dark:text-white">{formatBDT(agent.revenue)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;