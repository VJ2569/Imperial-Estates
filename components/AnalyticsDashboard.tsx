
import React, { useEffect, useState } from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  BarChart, Bar, LineChart, Line, Legend, ComposedChart, ReferenceLine 
} from 'recharts';
import { fetchRetellDirectCalls, getStoredRetellCalls } from '../services/retellService';
import { fetchProperties, getStoredProperties } from '../services/propertyService';
import { Property, RetellCall } from '../types';
import { TrendingUp, Home, Phone, DollarSign, Clock, AlertTriangle, Activity, Zap, RefreshCcw } from 'lucide-react';
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
    loadAllData();
  }, []);

  const loadAllData = async () => {
    // 1. Instant load from local cache to avoid empty screen
    const cachedProps = getStoredProperties();
    const cachedCalls = getStoredRetellCalls();
    
    setProperties(cachedProps);
    setCalls(cachedCalls);
    
    if (cachedProps.length === 0 && cachedCalls.length === 0) {
        setLoading(true);
    } else {
        setLoading(false);
    }

    // 2. Refresh from network (Direct API & Webhooks)
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
      console.error('Telemetry Sync Failed', err);
      setSyncStatus('error');
    } finally {
      setLoading(false);
    }
  };

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
    <div className="bg-white dark:bg-slate-900 p-6 rounded-[32px] border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col justify-between h-full relative overflow-hidden group hover:shadow-2xl hover:-translate-y-1 transition-all duration-500">
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
          <div className="flex flex-col items-center gap-8">
            <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
            <p className="text-xs font-black uppercase tracking-[0.4em] text-slate-400 animate-pulse">Initializing Global Telemetry...</p>
          </div>
      </div>
  );

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-12 w-full pb-32 animate-in fade-in duration-700">
      
      {/* Dashboard Top Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
         <div>
            <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight uppercase">Operational Intelligence</h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1 font-medium italic">Advanced portfolio analytics & voice communication metrics</p>
         </div>
         <div className="flex items-center gap-4">
           {syncStatus === 'syncing' ? (
             <div className="flex items-center gap-2 px-5 py-2.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-2xl border border-blue-100 dark:border-blue-800/50">
                <RefreshCcw size={14} className="animate-spin" />
                <span className="text-[10px] font-black uppercase tracking-widest">Live API Syncing</span>
             </div>
           ) : syncStatus === 'error' ? (
             <div className="flex items-center gap-2 px-5 py-2.5 bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 rounded-2xl border border-rose-100 dark:border-rose-800/50">
                <AlertTriangle size={14} />
                <span className="text-[10px] font-black uppercase tracking-widest">Sync Error</span>
             </div>
           ) : (
             <button onClick={loadAllData} className="flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 rounded-2xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 transition-all active:scale-95">
                <RefreshCcw size={14} />
                <span className="text-[10px] font-black uppercase tracking-widest">Refresh Intel</span>
             </button>
           )}
         </div>
      </div>

      {/* Main Analytical Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
         <div className="bg-white dark:bg-slate-900 p-10 rounded-[48px] border border-slate-100 dark:border-slate-800 shadow-sm transition-all hover:shadow-xl">
            <div className="flex items-center justify-between mb-8">
               <div>
                  <h3 className="font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center gap-3">
                      <Activity size={22} className="text-blue-500"/>
                      Voice Traffic (Retell)
                  </h3>
                  <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">Daily interaction load (30 Days)</p>
               </div>
               <div className="text-right">
                  <span className="text-2xl font-black text-blue-600">{calls.length}</span>
                  <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest">Logs Found</p>
               </div>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={getCallsOverTime()}>
                      <defs>
                          <linearGradient id="colorCalls" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor={COLORS.primary} stopOpacity={0.25}/>
                              <stop offset="95%" stopColor={COLORS.primary} stopOpacity={0}/>
                          </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" opacity={0.3} />
                      <XAxis dataKey="date" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} minTickGap={30} />
                      <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                      <Tooltip 
                        contentStyle={{borderRadius: '24px', border: 'none', backgroundColor: '#0f172a', color: '#fff', fontSize: '11px', padding: '12px 16px', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)'}} 
                        itemStyle={{fontWeight: '900', textTransform: 'uppercase'}}
                      />
                      <Area type="monotone" dataKey="calls" stroke={COLORS.primary} fillOpacity={1} fill="url(#colorCalls)" strokeWidth={4} />
                  </AreaChart>
              </ResponsiveContainer>
            </div>
         </div>

         <div className="bg-white dark:bg-slate-900 p-10 rounded-[48px] border border-slate-100 dark:border-slate-800 shadow-sm transition-all hover:shadow-xl">
            <div className="flex items-center justify-between mb-8">
               <div>
                  <h3 className="font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center gap-3">
                      <TrendingUp size={22} className="text-emerald-500"/>
                      Deployment Trends
                  </h3>
                  <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">Inventory distribution over time</p>
               </div>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={getInventoryTrends()}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" opacity={0.3} />
                      <XAxis dataKey="month" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                      <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                      <Tooltip cursor={{fill: '#f8fafc', opacity: 0.1}} contentStyle={{borderRadius: '24px', border: 'none', backgroundColor: '#0f172a', color: '#fff', fontSize: '11px', padding: '12px 16px'}} />
                      <Legend iconType="circle" wrapperStyle={{fontSize: '9px', paddingTop: '24px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.1em'}} />
                      <Bar dataKey="apartment" stackId="a" fill={COLORS.primary} radius={[4, 4, 0, 0]} name="Apts" />
                      <Bar dataKey="villa" stackId="a" fill={COLORS.purple} name="Villas" />
                      <Bar dataKey="commercial" stackId="a" fill={COLORS.tertiary} name="Comm" />
                  </BarChart>
              </ResponsiveContainer>
            </div>
         </div>
      </div>

      {/* Grid Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
          <StatCard icon={AlertTriangle} label="Vacancy Risk" value={vacancyRiskScore} subtext="/ 100" colorClass={getRiskColor(vacancyRiskScore).replace('text-', 'bg-')} />
          <StatCard icon={Clock} label="Avg Velocity" value={`${avgVacancyDuration}d`} colorClass="bg-blue-500" />
          <StatCard icon={Zap} label="Weekly Leads" value={recentCalls} subtext="Direct API" colorClass="bg-emerald-500" />
          <StatCard icon={Phone} label="Voice Matrix" value={calls.length} colorClass="bg-purple-500" />
          <StatCard icon={DollarSign} label="Portfolio Val" value={`₹${(totalValue / 10000000).toFixed(1)}Cr`} colorClass="bg-amber-500" />
          <StatCard icon={Home} label="Live Projects" value={properties.length} colorClass="bg-slate-500" />
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
