import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { fetchProperties } from '../services/propertyService';
import { fetchVapiCalls } from '../services/vapiService';
import { Property, VapiCall } from '../types';
import { TrendingUp, Users, Home, Phone, DollarSign } from 'lucide-react';

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

  // Compute Metrics
  const totalValue = properties.reduce((acc, curr) => acc + (curr.isRental ? 0 : curr.price), 0);
  const totalRentals = properties.filter(p => p.isRental).length;
  const totalSales = properties.filter(p => !p.isRental).length;
  
  // Property Status Data for Pie Chart
  const statusData = [
    { name: 'Available', value: properties.filter(p => p.status === 'available').length },
    { name: 'Sold', value: properties.filter(p => p.status === 'sold').length },
    { name: 'Rented', value: properties.filter(p => p.status === 'rented').length },
  ].filter(d => d.value > 0);

  // Property Type Data for Bar Chart
  const typeData = [
    { name: 'Apartment', value: properties.filter(p => p.type === 'apartment').length },
    { name: 'Villa', value: properties.filter(p => p.type === 'villa').length },
    { name: 'Commercial', value: properties.filter(p => p.type === 'commercial').length },
  ];

  const StatCard = ({ icon: Icon, label, value, color }: any) => (
    <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex items-start justify-between">
       <div>
          <p className="text-slate-500 text-sm font-medium mb-1">{label}</p>
          <h4 className="text-2xl font-bold text-slate-900">{value}</h4>
       </div>
       <div className={`p-3 rounded-lg ${color}`}>
          <Icon size={24} className="text-white" />
       </div>
    </div>
  );

  if (loading) return <div className="p-8 flex justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>;

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8">
      <div>
         <h2 className="text-2xl font-bold text-gray-900">Analytics Overview</h2>
         <p className="text-gray-500 text-sm">Key performance indicators for Imperial Estates</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
           label="Receptionist Calls" 
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Type Distribution */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm h-96">
           <h3 className="font-bold text-gray-800 mb-6">Inventory by Type</h3>
           <ResponsiveContainer width="100%" height="80%">
             <BarChart data={typeData}>
               <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
               <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
               <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
               <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
               <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={40} />
             </BarChart>
           </ResponsiveContainer>
        </div>

        {/* Status Distribution */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm h-96">
           <h3 className="font-bold text-gray-800 mb-6">Occupancy Status</h3>
           <ResponsiveContainer width="100%" height="80%">
             <PieChart>
               <Pie
                 data={statusData}
                 cx="50%"
                 cy="50%"
                 innerRadius={60}
                 outerRadius={100}
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
           <div className="flex justify-center gap-4 mt-2">
              {statusData.map((entry, index) => (
                <div key={index} className="flex items-center gap-2 text-sm text-gray-600">
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
