import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { fetchProperties } from '../services/propertyService';
import { fetchVapiCalls } from '../services/vapiService';
import { Property, VapiCall } from '../types';
import { TrendingUp, Home, Phone, DollarSign } from 'lucide-react';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

const AnalyticsDashboard: React.FC = () => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [calls, setCalls] = useState<VapiCall[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      const [propData, callData] = await Promise.all([
        fetchProperties(),
        fetchVapiCalls()
      ]);
      setProperties(propData);
      setCalls(callData);
      setLoading(false);
    };
    loadData();
  }, []);

  const totalValue = properties.reduce((acc, curr) => acc + (curr.isRental ? 0 : curr.price), 0);
  
  const statusData = [
    { name: 'Available', value: properties.filter(p => p.status === 'available').length },
    { name: 'Sold', value: properties.filter(p => p.status === 'sold').length },
    { name: 'Rented', value: properties.filter(p => p.status === 'rented').length },
  ].filter(d => d.value > 0);

  const typeData = [
    { name: 'Apt', value: properties.filter(p => p.type === 'apartment').length },
    { name: 'Villa', value: properties.filter(p => p.type === 'villa').length },
    { name: 'Comm', value: properties.filter(p => p.type === 'commercial').length },
  ];

  const StatCard = ({ icon: Icon, label, value, color }: any) => (
    <div className="bg-white p-5 md:p-6 rounded-xl border border-gray-100 shadow-sm flex items-start justify-between">
       <div>
          <p className="text-slate-500 text-sm font-medium mb-1">{label}</p>
          <h4 className="text-xl md:text-2xl font-bold text-slate-900">{value}</h4>
       </div>
       <div className={`p-3 rounded-lg ${color}`}>
          <Icon size={24} className="text-white" />
       </div>
    </div>
  );

  if (loading) return <div className="p-8 flex justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>;

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6 md:space-y-8 w-full">
      <div>
         <h2 className="text-xl md:text-2xl font-bold text-gray-900">Analytics Overview</h2>
         <p className="text-gray-500 text-sm">Key performance indicators</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <StatCard 
           icon={Home} 
           label="Total Properties" 
           value={properties.length} 
           color="bg-blue-500" 
        />
        <StatCard 
           icon={DollarSign} 
           label="Portfolio Value" 
           value={`₹${(totalValue / 10000000).toFixed(1)} Cr`} 
           color="bg-emerald-500" 
        />
        <StatCard 
           icon={Phone} 
           label="Calls" 
           value={calls.length} 
           color="bg-purple-500" 
        />
        <StatCard 
           icon={TrendingUp} 
           label="Active Listings" 
           value={properties.filter(p => p.status === 'available').length} 
           color="bg-amber-500" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
        <div className="bg-white p-4 md:p-6 rounded-xl border border-gray-200 shadow-sm h-80 md:h-96">
           <h3 className="font-bold text-gray-800 mb-4 md:mb-6">Inventory by Type</h3>
           <ResponsiveContainer width="100%" height="85%">
             <BarChart data={typeData}>
               <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
               <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
               <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
               <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
               <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={40} />
             </BarChart>
           </ResponsiveContainer>
        </div>

        <div className="bg-white p-4 md:p-6 rounded-xl border border-gray-200 shadow-sm h-80 md:h-96">
           <h3 className="font-bold text-gray-800 mb-4 md:mb-6">Occupancy Status</h3>
           <ResponsiveContainer width="100%" height="80%">
             <PieChart>
               <Pie
                 data={statusData}
                 cx="50%"
                 cy="50%"
                 innerRadius={60}
                 outerRadius={80}
                 fill="#8884d8"
                 paddingAngle={5}
                 dataKey="value"
               >
                 {statusData.map((entry, index) => (
                   <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                 ))}
               </Pie>
               <Tooltip contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
             </PieChart>
           </ResponsiveContainer>
           <div className="flex flex-wrap justify-center gap-4 mt-2">
              {statusData.map((entry, index) => (
                <div key={index} className="flex items-center gap-2 text-xs md:text-sm text-gray-600">
                   <div className="w-3 h-3 rounded-full" style={{backgroundColor: COLORS[index % COLORS.length]}} />
                   {entry.name}
                </div>
              ))}
           </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;