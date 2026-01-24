
import React, { useState } from 'react';
import { X, MapPin, Building, Calendar, Shield, Plus, Minus, LayoutGrid, CheckCircle, Download, FileText, Sparkles, Map } from 'lucide-react';
import { Property, Configuration } from '../types';
import { updateProperty } from '../services/propertyService';

interface PropertyDetailsProps {
  property: Property;
  onClose: () => void;
  onEdit: () => void;
  readOnly?: boolean;
}

const PropertyDetails: React.FC<PropertyDetailsProps> = ({ property: initialProperty, onClose, onEdit, readOnly = false }) => {
  const [property, setProperty] = useState(initialProperty);

  const formatCurrency = (val: number) => {
    const divisor = property.isRental ? 100000 : 10000000;
    const unit = property.isRental ? 'L' : 'Cr';
    const suffix = property.isRental ? ' / Month' : '';
    const formatted = (val / divisor).toFixed(2);
    return `₹${formatted} ${unit}${suffix}`;
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xl flex items-center justify-center p-4 z-50 animate-in fade-in duration-300">
      <div className="bg-white dark:bg-slate-900 w-full max-w-6xl h-[90vh] rounded-[40px] shadow-3xl flex flex-col overflow-hidden border border-slate-200 dark:border-slate-800">
        
        {/* Header Overlay */}
        <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-950/40">
           <div>
              <div className="flex gap-2 mb-2">
                  <span className="bg-blue-600 px-4 py-1.5 rounded-full text-white text-[10px] font-black uppercase tracking-widest">{property.projectStatus.replace('-', ' ')}</span>
                  <span className="bg-slate-200 dark:bg-slate-800 px-4 py-1.5 rounded-full text-slate-700 dark:text-slate-300 text-[10px] font-black uppercase tracking-widest">{property.type}</span>
                  {property.isRental && <span className="bg-amber-500 px-4 py-1.5 rounded-full text-white text-[10px] font-black uppercase tracking-widest">Rental Asset</span>}
              </div>
              <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">{property.title}</h2>
              <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 font-mono text-sm mt-1"><MapPin size={16} /> {property.city} • {property.microLocation}</div>
           </div>
           <button onClick={onClose} className="p-3 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 shadow-sm transition-all"><X size={24} /></button>
        </div>

        {/* Scrollable Container */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-10 space-y-12 pb-20">
           
           <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
              
              <div className="lg:col-span-8 space-y-12">
                 
                 <div className="grid grid-cols-2 md:grid-cols-4 gap-6 bg-slate-50 dark:bg-slate-800/50 p-8 rounded-[32px] border border-slate-100 dark:border-slate-800">
                    <div>
                       <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Handover</p>
                       <p className="font-bold text-slate-800 dark:text-white flex items-center gap-2">{property.timeline}</p>
                    </div>
                    <div>
                       <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Developer</p>
                       <p className="font-bold text-slate-800 dark:text-white">
                          {property.developerName}
                       </p>
                    </div>
                    <div>
                       <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Total Scale</p>
                       <p className="font-bold text-slate-800 dark:text-white">{property.totalProjectSize}</p>
                    </div>
                    <div>
                       <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">RERA ID</p>
                       <p className="font-bold text-slate-800 dark:text-white truncate max-w-full">{property.reraId}</p>
                    </div>
                 </div>

                 {/* Area & Connectivity Display (NEW) */}
                 {property.areaAndConnectivity && (
                    <div className="bg-indigo-50/50 dark:bg-indigo-900/10 p-8 rounded-[32px] border border-indigo-100 dark:border-indigo-800/50">
                      <div className="flex items-center gap-3 mb-4">
                         <Map size={24} className="text-indigo-600" />
                         <h3 className="text-xl font-black text-slate-800 dark:text-white">Connectivity & Proximity</h3>
                      </div>
                      <p className="text-slate-600 dark:text-slate-400 leading-relaxed whitespace-pre-wrap">
                         {property.areaAndConnectivity}
                      </p>
                    </div>
                 )}

                 <div>
                    <div className="flex items-center gap-3 mb-6">
                       <LayoutGrid size={24} className="text-blue-600" />
                       <h3 className="text-2xl font-black text-slate-800 dark:text-white">Unit Configurations</h3>
                    </div>
                    <div className="bg-white dark:bg-slate-900 rounded-[32px] border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xl">
                       <table className="w-full text-left">
                          <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 text-[10px] font-black uppercase tracking-widest">
                             <tr>
                                <th className="px-8 py-5">Unit Detail</th>
                                <th className="px-8 py-5">Inventory</th>
                                <th className="px-8 py-5">Market Velocity</th>
                             </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                             {property.configurations.map(config => {
                                const progress = config.totalUnits > 0 ? (config.unitsSold / config.totalUnits) * 100 : 0;
                                return (
                                  <tr key={config.id} className="group">
                                     <td className="px-8 py-6">
                                        <div className="font-bold text-slate-900 dark:text-white">{config.name}</div>
                                        <div className="flex items-center gap-3 mt-1">
                                          <div className="text-emerald-500 font-bold text-sm">{formatCurrency(config.price)}</div>
                                          <span className="text-slate-400 text-xs">|</span>
                                          <span className="text-blue-600 dark:text-blue-400 text-xs font-black">{config.size} Sqft</span>
                                        </div>
                                        {config.description && (
                                          <p className="text-[11px] text-slate-400 italic mt-1.5 leading-tight">{config.description}</p>
                                        )}
                                     </td>
                                     <td className="px-8 py-6 font-bold text-slate-600 dark:text-slate-400">{config.totalUnits} Units</td>
                                     <td className="px-8 py-6">
                                        <div className="flex items-center gap-4">
                                           <div className="flex-1">
                                              <div className="flex justify-between text-[10px] font-bold text-slate-400 mb-1">
                                                 <span>{config.unitsSold} Booked</span>
                                                 <span>{Math.round(progress)}%</span>
                                              </div>
                                              <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                                 <div className="h-full bg-emerald-500 transition-all duration-500" style={{ width: `${progress}%` }} />
                                              </div>
                                           </div>
                                        </div>
                                     </td>
                                  </tr>
                                );
                             })}
                          </tbody>
                       </table>
                    </div>
                 </div>

                 <div>
                    <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-4">Project Overview</h3>
                    <p className="text-slate-500 dark:text-slate-400 leading-relaxed max-w-3xl whitespace-pre-wrap">
                       {property.description}
                    </p>
                 </div>
              </div>

              <div className="lg:col-span-4 space-y-6">
                 <div className="bg-slate-900 dark:bg-slate-800 p-8 rounded-[40px] text-white shadow-2xl">
                    <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-2">Location Context</p>
                    <h4 className="text-2xl font-bold mb-6">{property.microLocation}</h4>
                    
                    <div className="space-y-6 mb-10">
                       <div className="flex items-start gap-4">
                          <div className="bg-white/10 p-2 rounded-xl"><MapPin size={20} /></div>
                          <div><p className="text-xs font-bold text-slate-400 mb-0.5">District</p><p className="text-sm">{property.city}</p></div>
                       </div>
                       <div className="flex items-start gap-4">
                          <div className="bg-white/10 p-2 rounded-xl"><Building size={20} /></div>
                          <div><p className="text-xs font-bold text-slate-400 mb-0.5">Classification</p><p className="text-sm capitalize">{property.type}</p></div>
                       </div>
                    </div>

                    {!readOnly && (
                       <button onClick={onEdit} className="w-full bg-blue-600 hover:bg-blue-700 py-4 rounded-2xl font-black text-sm transition-all shadow-lg shadow-blue-900/40 flex items-center justify-center gap-2">
                          Update Asset File
                       </button>
                    )}
                 </div>

                 <div className="bg-white dark:bg-slate-900 p-8 rounded-[40px] border border-slate-100 dark:border-slate-800 shadow-sm">
                    <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Amenities</h5>
                    <div className="flex flex-wrap gap-2">
                       {property.amenities.map(a => (
                         <span key={a} className="px-4 py-2 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl text-xs font-bold border border-slate-100 dark:border-slate-700">{a}</span>
                       ))}
                    </div>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyDetails;
