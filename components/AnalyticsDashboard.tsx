
import React, { useEffect, useState } from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  BarChart, Bar, LineChart, Line, Legend, ComposedChart, ReferenceLine 
} from 'recharts';
import { fetchRetellDirectCalls, getStoredRetellCalls } from '../services/retellService';
import { fetchProperties, getStoredProperties } from '../services/propertyService';
import { Property, RetellCall } from '../types';
import { TrendingUp, Home, Phone, DollarSign, Clock, AlertTriangle, Activity, Zap } from 'lucide-react';
import { format, subMonths, eachDayOfInterval, subDays, isSameDay, differenceInDays, isValid } from 'date-fns';

const COLORS = {
  primary: '#3b82f6',
  secondary: '#10b981', 
  tertiary: '#f59e0b',
  danger: '#ef4444',
  slate: '#64748b',
  purple: '#8b5cf6'
};

const AnalyticsDashboard: React.FC = () => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [calls, setCalls] = useState<RetellCall[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'error'>('idle');

  useEffect(() => {
    const loadData = async () => {
      // 1. Instant load from persistent cache
      const cachedProps = getStoredProperties();
      const cachedCalls = getStoredRetellCalls();
      
      setProperties(cachedProps);
      setCalls(cachedCalls);
      
      if (cachedProps.length === 0 && cachedCalls.length === 0) {
          setLoading(true);
      } else {
          setLoading(false);
      }

      // 2. Background sync
      setSyncStatus('syncing');
      try {
        const [propData, callData] = await Promise.all([
          fetchProperties(),
          fetchRetellDirectCalls()
        ]);
        
        if (propData) setProperties(propData);
        if (callData) setCalls(callData);
        setSyncStatus('idle');
      } catch (err) {
        setSyncStatus('error');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const getCallsOverTime = () => {
    const end = new Date();
    const start = subDays(end, 30);
    const days = eachDayOfInterval({ start, end });

    return days.map(day => {
      const dayCalls = calls.filter(c => {
        const cDate = new Date(c.start_timestamp);
        return isValid(cDate) && isSameDay(cDate, day);
      });
      
      return {
        date: format(day, 'MMM dd'),
        calls: dayCalls.length,
        duration: Math.floor(dayCalls.reduce((acc, c) => acc + (c.duration_ms ? c.duration_ms / 1000 : 0), 0) / 60)
      };
    });
  };

  const getInventoryTrends = () => {
    const end = new Date();
    const months = [5, 4, 3, 2, 1, 0].map(i => {
       const d = subMonths(end, i);
       return { 
         month: format(d, 'MMM'),
         dateObj: d 
       };
    });

    return months.map(({ month, dateObj }) => {
       const activeProps = properties.filter(p => {
          const availDate = new Date(p.availableFrom || p.timeline || Date.now());
          return isValid(availDate) && availDate <= dateObj;
       });
       
       return {
         name: month,
         apartment: activeProps.filter(p => p.type === 'apartment').length,
         villa: activeProps.filter(p => p.type === 'villa').length,
         commercial: activeProps.filter(p => p.type === 'commercial').length,
       };
    });
  };

  const totalValue = properties.reduce((acc, curr) => acc + (curr.isRental ? 0 : (curr.price || 0)), 0);
  const availableProps = properties.filter(p => p.status === 'available');
  
  const totalVacancyDays = availableProps.reduce((acc, p) => {
      const availDate = new Date(p.availableFrom || p.timeline || Date.now());
      const days = isValid(availDate) ? differenceInDays(new Date(), availDate) : 0;
      return acc + (days > 0 ? days : 0);
  }, 0);

  const avgVacancyDuration = availableProps.length ? Math.round(totalVacancyDays / availableProps.length) : 0;
  const recentCalls = calls.filter(c => {
      const cDate = new Date(c.start_timestamp);
      return isValid(cDate) && differenceInDays(new Date(), cDate) < 7;
  }).length;

  const durationRisk = Math.min(100, (avgVacancyDuration / 90) * 100);
  const demandRisk = Math.max(0, 100 - (recentCalls * 5));
  const vacancyRiskScore = Math.round((durationRisk * 0.6) + (demandRisk * 0.4));

  const getRiskColor = (score: number) => {
     if (score < 30) return 'text-emerald-500';
     if (score < 70) return 'text-amber-500';
     return 'text-rose-500';
  };

  const StatCard = ({ icon: Icon, label, value, subtext, colorClass }: any) => (
    <div className="bg-white dark:bg-slate-900 p-6 rounded-[32px] border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col justify-between h-full relative overflow-hidden group hover:shadow-xl hover:-translate-y-1 transition-all duration-500">
       <div className="flex justify-between items-start mb-6">
          <div className={`p-3 rounded-2xl ${colorClass} bg-opacity-10 dark:bg-opacity-20`}>
             <Icon size={24} className={colorClass.replace('bg-', 'text-')} />
          </div>
          {subtext && <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-slate-800 px-3 py-1 rounded-full uppercase tracking-widest">{subtext}</span>}
       </div>
       <div>
          <h4 className="text-3xl font-black text-slate-900 dark:text-white mb-1 tracking-tight">{value}</h4>
          <p className="text-slate-400 dark:text-slate-500 text-[10px] font-black uppercase tracking-widest">{label}</p>
       </div>
    </div>
  );

  if (loading) return (
      <div className="h-96 w-full flex items-center justify-center">
          <div className="flex flex-col items-center gap-6">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-xs font-black uppercase tracking-[0.3em] text-slate-400">Initializing Operational Data...</p>
          </div>
      </div>
  );

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-10 w-full pb-32 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
         <div>
            <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight uppercase">Operational Intelligence</h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1 font-medium italic">Portfolio velocity and communication metrics</p>
         </div>
         {syncStatus === 'syncing' && (
           <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-xl border border-blue-100 dark:border-blue-800/50 animate-pulse">
              <RefreshCcw size={14} className="animate-spin" />
              <span className="text-[10px] font-black uppercase tracking-widest">Live Sync Active</span>
           </div>
         )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
         <div className="bg-white dark:bg-slate-900 p-10 rounded-[48px] border border-slate-100 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between mb-8">
               <div>
                  <h3 className="font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center gap-3">
                      <Activity size={20} className="text-blue-500"/>
                      Voice Traffic
                  </h3>
                  <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">Daily interaction volume (30D)</p>
               </div>
               <div className="text-right">
                  <span className="text-2xl font-black text-blue-600">{calls.length}</span>
                  <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest">Total Sessions</p>
               </div>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={getCallsOverTime()}>
                      <defs>
                          <linearGradient id="colorCalls" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor={COLORS.primary} stopOpacity={0.2}/>
                              <stop offset="95%" stopColor={COLORS.primary} stopOpacity={0}/>
                          </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" opacity={0.3} />
                      <XAxis dataKey="date" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} minTickGap={30} />
                      <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                      <Tooltip contentStyle={{borderRadius: '20px', border: 'none', backgroundColor: '#0f172a', color: '#fff', fontSize: '12px'}} />
                      <Area type="monotone" dataKey="calls" stroke={COLORS.primary} fillOpacity={1} fill="url(#colorCalls)" strokeWidth={4} />
                  </AreaChart>
              </ResponsiveContainer>
            </div>
         </div>

         <div className="bg-white dark:bg-slate-900 p-10 rounded-[48px] border border-slate-100 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between mb-8">
               <div>
                  <h3 className="font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center gap-3">
                      <TrendingUp size={20} className="text-emerald-500"/>
                      Asset Deployment
                  </h3>
                  <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">Portfolio diversification trends</p>
               </div>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={getInventoryTrends()}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" opacity={0.3} />
                      <XAxis dataKey="month" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                      <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                      <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '20px', border: 'none', backgroundColor: '#0f172a', color: '#fff', fontSize: '12px'}} />
                      <Legend iconType="circle" wrapperStyle={{fontSize: '10px', paddingTop: '20px', fontWeight: 'bold', textTransform: 'uppercase'}} />
                      <Bar dataKey="apartment" stackId="a" fill={COLORS.primary} radius={[4, 4, 0, 0]} name="Apts" />
                      <Bar dataKey="villa" stackId="a" fill={COLORS.purple} name="Villas" />
                      <Bar dataKey="commercial" stackId="a" fill={COLORS.tertiary} name="Comm" />
                  </BarChart>
              </ResponsiveContainer>
            </div>
         </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
          <StatCard icon={AlertTriangle} label="Vacancy Risk" value={vacancyRiskScore} subtext="/ 100" colorClass={getRiskColor(vacancyRiskScore).replace('text-', 'bg-')} />
          <StatCard icon={Clock} label="Avg Turnaround" value={`${avgVacancyDuration}d`} colorClass="bg-blue-500" />
          <StatCard icon={Zap} label="Market Pull" value={recentCalls} subtext="L7D" colorClass="bg-emerald-500" />
          <StatCard icon={Phone} label="Voice Log" value={calls.length} colorClass="bg-purple-500" />
          <StatCard icon={DollarSign} label="Asset Value" value={`₹${(totalValue / 10000000).toFixed(1)}Cr`} colorClass="bg-amber-500" />
          <StatCard icon={Home} label="Total Assets" value={properties.length} colorClass="bg-slate-500" />
      </div>
    </div>
  );
};

// Simple Refresh icon for the status badge
const RefreshCcw = ({ size, className }: { size: number, className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8" />
    <path d="M21 3v5h-5" />
  </svg>
);

export default AnalyticsDashboard;
