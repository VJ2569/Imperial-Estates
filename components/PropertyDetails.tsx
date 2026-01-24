import React, { useState } from 'react';
import { X, MapPin, Building, Calendar, Shield, Plus, Minus, LayoutGrid, CheckCircle, Download, FileText, Sparkles, Image as ImageIcon, Map } from 'lucide-react';
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
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const handleUnitSoldUpdate = async (configId: string, increment: boolean) => {
    if (readOnly) return;
    
    const updatedConfigs = property.configurations.map(c => {
      if (c.id === configId) {
        const delta = increment ? 5 : -5;
        const newVal = Math.max(0, Math.min(c.totalUnits, c.unitsSold + delta));
        return { ...c, unitsSold: newVal };
      }
      return c;
    });

    const updatedProperty = { ...property, configurations: updatedConfigs };
    setProperty(updatedProperty);
    await updateProperty(updatedProperty);
  };

  const formatCurrency = (val: number) => {
    const suffix = property.isRental ? ' / Month' : ' Cr';
    const divisor = property.isRental ? 100000 : 10000000;
    const formatted = (val / divisor).toFixed(2);
    return `₹${formatted}${suffix}`;
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xl flex items-center justify-center p-4 z-50 animate-in fade-in duration-300">
      <div className="bg-white dark:bg-slate-900 w-full max-w-6xl h-[90vh] rounded-[40px] shadow-3xl flex flex-col overflow-hidden border border-slate-200 dark:border-slate-800">
        
        {/* Sticky Close Header */}
        <div className="absolute top-6 right-6 z-30">
           <button onClick={onClose} className="bg-white/10 hover:bg-white/20 p-3 rounded-full text-white backdrop-blur-md transition-all border border-white/10"><X size={24} /></button>
        </div>

        {/* Scrollable Container */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          
          {/* Hero Section */}
          <div className="relative h-[50vh] min-h-[400px] overflow-hidden">
            {property.images && property.images.length > 0 ? (
              <img src={property.images[activeImageIndex]} className="w-full h-full object-cover transition-all duration-700" />
            ) : (
              <div className="w-full h-full bg-slate-900 flex items-center justify-center text-slate-700">
                <ImageIcon size={64} />
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/30 to-transparent" />
            
            <div className="absolute bottom-10 left-10 right-10 z-10">
               <div className="flex gap-2 mb-4">
                  <span className="bg-blue-600 px-4 py-1.5 rounded-full text-white text-[10px] font-black uppercase tracking-widest">{property.projectStatus.replace('-', ' ')}</span>
                  <span className="bg-white/10 backdrop-blur-md px-4 py-1.5 rounded-full text-white text-[10px] font-black uppercase tracking-widest border border-white/10">{property.type}</span>
                  {property.isRental && <span className="bg-amber-500 px-4 py-1.5 rounded-full text-white text-[10px] font-black uppercase tracking-widest">Rental Asset</span>}
               </div>
               <div className="flex items-center gap-2 text-blue-400 font-mono text-sm mb-2"><MapPin size={16} /> {property.city} • {property.microLocation}</div>
               <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight">{property.title}</h2>
            </div>
          </div>

          <div className="p-10">
             <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 pb-20">
                
                <div className="lg:col-span-8 space-y-12">
                   
                   <div className="grid grid-cols-2 md:grid-cols-4 gap-6 bg-slate-50 dark:bg-slate-800/50 p-8 rounded-[32px] border border-slate-100 dark:border-slate-800">
                      <div>
                         <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Handover</p>
                         <p className="font-bold text-slate-800 dark:text-white flex items-center gap-2">{property.timeline}</p>
                      </div>
                      <div>
                         <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Developer</p>
                         <p className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
                            {property.towerCount ? `${property.towerCount} Towers` : property.developerName}
                         </p>
                      </div>
                      <div>
                         <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Total Scale</p>
                         <p className="font-bold text-slate-800 dark:text-white flex items-center gap-2">{property.totalProjectSize}</p>
                      </div>
                      <div>
                         <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">RERA ID</p>
                         <p className="font-bold text-slate-800 dark:text-white flex items-center gap-2 truncate max-w-full">{property.reraId}</p>
                      </div>
                   </div>

                   {/* Area & Connectivity Display */}
                   {property.areaAndConnectivity && (
                      <div>
                        <div className="flex items-center gap-3 mb-6">
                           <Map size={24} className="text-blue-600" />
                           <h3 className="text-2xl font-black text-slate-800 dark:text-white">Connectivity & Proximity</h3>
                        </div>
                        <p className="text-slate-500 dark:text-slate-400 leading-relaxed text-lg whitespace-pre-wrap">
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
                                  const progress = (config.unitsSold / config.totalUnits) * 100;
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
                                            <p className="text-[11px] text-slate-400 italic mt-2 leading-tight max-w-sm">{config.description}</p>
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
                      <p className="text-slate-500 dark:text-slate-400 leading-relaxed max-w-3xl whitespace-pre-wrap text-lg">
                         {property.description || "A flagship development characterized by unmatched architectural finesse and strategic urban positioning."}
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
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyDetails;
