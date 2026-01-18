
import React, { useEffect, useState } from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  BarChart, Bar, LineChart, Line, Legend, ComposedChart, ReferenceLine 
} from 'recharts';
import { fetchRetellCalls, getStoredRetellCalls } from '../services/retellService';
import { fetchProperties, getStoredProperties } from '../services/propertyService';
import { Property, RetellCall } from '../types';
import { TrendingUp, Home, Phone, DollarSign, Clock, AlertTriangle, Activity } from 'lucide-react';
import { format, subMonths, eachDayOfInterval, subDays, isSameDay, differenceInDays } from 'date-fns';

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

  useEffect(() => {
    const loadData = async () => {
      const cachedProps = getStoredProperties();
      const cachedCalls = getStoredRetellCalls();
      
      if (cachedProps.length > 0 || cachedCalls.length > 0) {
          setProperties(cachedProps);
          setCalls(cachedCalls);
          setLoading(false);
      } else {
          setLoading(true);
      }

      const [propData, callData] = await Promise.all([
        fetchProperties(),
        fetchRetellCalls()
      ]);
      setProperties(propData);
      setCalls(callData);
      setLoading(false);
    };
    loadData();
  }, []);

  const getCallsOverTime = () => {
    const end = new Date();
    const start = subDays(end, 30);
    const days = eachDayOfInterval({ start, end });

    return days.map(day => {
      const dayCalls = calls.filter(c => isSameDay(new Date(c.start_timestamp), day));
      return {
        date: format(day, 'MMM dd'),
        calls: dayCalls.length,
        duration: Math.floor(dayCalls.reduce((acc, c) => acc + (c.duration_ms ? c.duration_ms / 1000 : 0), 0) / 60)
      };
    });
  };

  const getInventoryTrends = () => {
    const end = new Date();
    const start = subMonths(end, 5);
    const months = [5, 4, 3, 2, 1, 0].map(i => {
       const d = subMonths(end, i);
       return { 
         month: format(d, 'MMM'),
         dateObj: d 
       };
    });

    return months.map(({ month, dateObj }) => {
       const activeProps = properties.filter(p => new Date(p.availableFrom) <= dateObj);
       return {
         name: month,
         apartment: activeProps.filter(p => p.type === 'apartment').length,
         villa: activeProps.filter(p => p.type === 'villa').length,
         commercial: activeProps.filter(p => p.type === 'commercial').length,
       };
    });
  };

  const getMarketBalance = () => {
    const detectIntent = (call: RetellCall) => {
        const text = (call.transcript || call.call_analysis?.call_summary || '').toLowerCase();
        if (text.includes('villa')) return 'villa';
        if (text.includes('apartment') || text.includes('flat')) return 'apartment';
        if (text.includes('commercial') || text.includes('office') || text.includes('shop')) return 'commercial';
        return 'general';
    };

    const demandCounts = { apartment: 0, villa: 0, commercial: 0 };
    calls.forEach(c => {
        const intent = detectIntent(c);
        if (intent in demandCounts) {
            demandCounts[intent as keyof typeof demandCounts]++;
        }
    });

    const inventoryCounts = {
        apartment: properties.filter(p => p.type === 'apartment').length,
        villa: properties.filter(p => p.type === 'villa').length,
        commercial: properties.filter(p => p.type === 'commercial').length,
    };

    return [
        { name: 'Apartment', inventory: inventoryCounts.apartment, demand: demandCounts.apartment },
        { name: 'Villa', inventory: inventoryCounts.villa, demand: demandCounts.villa },
        { name: 'Commercial', inventory: inventoryCounts.commercial, demand: demandCounts.commercial },
    ];
  };

  const getOccupancyTrend = () => {
     const total = properties.length;
     if (total === 0) return [];
     const currentOccupied = properties.filter(p => p.status !== 'available').length;
     const currentRate = (currentOccupied / total) * 100;
     return [5, 4, 3, 2, 1, 0].map(i => {
        const volatility = Math.sin(i) * 5;
        const trend = currentRate - (i * 1.5) + volatility;
        return {
           month: format(subMonths(new Date(), i), 'MMM'),
           rate: Math.max(0, Math.min(100, Math.round(trend)))
        };
     });
  };

  const totalValue = properties.reduce((acc, curr) => acc + (curr.isRental ? 0 : curr.price), 0);
  const availableProps = properties.filter(p => p.status === 'available');
  const totalVacancyDays = availableProps.reduce((acc, p) => {
      const days = differenceInDays(new Date(), new Date(p.availableFrom));
      return acc + (days > 0 ? days : 0);
  }, 0);
  const avgVacancyDuration = availableProps.length ? Math.round(totalVacancyDays / availableProps.length) : 0;
  const recentCalls = calls.filter(c => differenceInDays(new Date(), new Date(c.start_timestamp)) < 7).length;
  const durationRisk = Math.min(100, (avgVacancyDuration / 90) * 100);
  const demandRisk = Math.max(0, 100 - (recentCalls * 5));
  const vacancyRiskScore = Math.round((durationRisk * 0.6) + (demandRisk * 0.4));

  const getRiskColor = (score: number) => {
     if (score < 30) return 'text-emerald-500';
     if (score < 70) return 'text-amber-500';
     return 'text-rose-500';
  };

  const StatCard = ({ icon: Icon, label, value, subtext, colorClass }: any) => (
    <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-gray-100 dark:border-slate-800 shadow-sm flex flex-col justify-between h-full relative overflow-hidden group hover:shadow-md transition-shadow">
       <div className="flex justify-between items-start mb-4">
          <div className={`p-2.5 rounded-lg ${colorClass} bg-opacity-10 dark:bg-opacity-20`}>
             <Icon size={20} className={colorClass.replace('bg-', 'text-')} />
          </div>
          {subtext && <span className="text-xs font-medium text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-slate-800 px-2 py-1 rounded-full">{subtext}</span>}
       </div>
       <div>
          <h4 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">{value}</h4>
          <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">{label}</p>
       </div>
    </div>
  );

  if (loading) return (
      <div className="h-96 w-full flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="text-slate-400 text-sm">Loading analytics...</p>
          </div>
      </div>
  );

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8 w-full pb-20">
      <div className="flex justify-between items-end">
         <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Operational Intelligence</h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Real-time market analysis and portfolio performance</p>
         </div>
         <div className="text-right hidden sm:block">
            <p className="text-xs text-slate-400 font-mono">Last updated: {format(new Date(), 'HH:mm')}</p>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
         <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-gray-200 dark:border-slate-800 shadow-sm h-80">
            <h3 className="font-bold text-gray-800 dark:text-white mb-1 flex items-center gap-2">
                <Activity size={18} className="text-blue-500"/>
                Engagement Volume
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">Daily inbound call traffic (30 Days)</p>
            <ResponsiveContainer width="100%" height="85%">
                <AreaChart data={getCallsOverTime()}>
                    <defs>
                        <linearGradient id="colorCalls" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={COLORS.primary} stopOpacity={0.1}/>
                            <stop offset="95%" stopColor={COLORS.primary} stopOpacity={0}/>
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" opacity={0.3} />
                    <XAxis dataKey="date" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} minTickGap={30} />
                    <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                    <Tooltip contentStyle={{borderRadius: '8px', border: 'none', backgroundColor: '#1e293b', color: '#fff'}} />
                    <Area type="monotone" dataKey="calls" stroke={COLORS.primary} fillOpacity={1} fill="url(#colorCalls)" strokeWidth={2} />
                </AreaChart>
            </ResponsiveContainer>
         </div>

         <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-gray-200 dark:border-slate-800 shadow-sm h-80">
            <h3 className="font-bold text-gray-800 dark:text-white mb-1 flex items-center gap-2">
                <TrendingUp size={18} className="text-emerald-500"/>
                Inventory Trends
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">Portfolio composition over last 6 months</p>
            <ResponsiveContainer width="100%" height="85%">
                <BarChart data={getInventoryTrends()}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" opacity={0.3} />
                    <XAxis dataKey="month" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                    <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                    <Tooltip contentStyle={{borderRadius: '8px', border: 'none', backgroundColor: '#1e293b', color: '#fff'}} />
                    <Legend iconType="circle" wrapperStyle={{fontSize: '12px'}} />
                    <Bar dataKey="apartment" stackId="a" fill={COLORS.primary} name="Apartments" />
                    <Bar dataKey="villa" stackId="a" fill={COLORS.purple} name="Villas" />
                    <Bar dataKey="commercial" stackId="a" fill={COLORS.tertiary} name="Commercial" />
                </BarChart>
            </ResponsiveContainer>
         </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          <StatCard icon={AlertTriangle} label="Vacancy Risk" value={vacancyRiskScore} subtext="/ 100" colorClass={getRiskColor(vacancyRiskScore).replace('text-', 'bg-')} />
          <StatCard icon={Clock} label="Avg Vacancy" value={`${avgVacancyDuration}d`} colorClass="bg-blue-500" />
          <StatCard icon={TrendingUp} label="Active" value={availableProps.length} colorClass="bg-emerald-500" />
          <StatCard icon={Phone} label="Calls" value={calls.length} colorClass="bg-purple-500" />
          <StatCard icon={DollarSign} label="Portfolio" value={`₹${(totalValue / 10000000).toFixed(1)}Cr`} colorClass="bg-amber-500" />
          <StatCard icon={Home} label="Properties" value={properties.length} colorClass="bg-slate-500" />
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
