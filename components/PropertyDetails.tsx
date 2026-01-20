
import React, { useState } from 'react';
import { X, MapPin, Building, Calendar, Shield, Plus, Minus, LayoutGrid, CheckCircle, Download, FileText, Sparkles } from 'lucide-react';
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

  const formatCurrency = (val: number) => `₹${(val / 10000000).toFixed(2)} Cr`;

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xl flex items-center justify-center p-4 z-50 animate-in fade-in duration-300">
      <div className="bg-white dark:bg-slate-900 w-full max-w-6xl h-[90vh] rounded-[40px] shadow-3xl flex flex-col overflow-hidden border border-slate-200 dark:border-slate-800">
        
        <div className="relative h-72 shrink-0 overflow-hidden">
          {property.images && property.images.length > 0 ? (
            <img src={property.images[0]} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-slate-900" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent" />
          <div className="absolute top-8 left-8 right-8 flex justify-between items-start">
             <div className="flex gap-2">
                <span className="bg-white/20 backdrop-blur-md px-4 py-1.5 rounded-full text-white text-[10px] font-black uppercase tracking-widest border border-white/10">{property.type}</span>
                <span className="bg-blue-600 px-4 py-1.5 rounded-full text-white text-[10px] font-black uppercase tracking-widest">{property.projectStatus.replace('-', ' ')}</span>
             </div>
             <button onClick={onClose} className="bg-white/10 hover:bg-white/20 p-3 rounded-full text-white backdrop-blur-md transition-all"><X size={24} /></button>
          </div>
          <div className="absolute bottom-10 left-10 right-10">
             <div className="flex items-center gap-2 text-blue-400 font-mono text-sm mb-2"><MapPin size={16} /> {property.city}</div>
             <h2 className="text-4xl font-black text-white tracking-tight">{property.title}</h2>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-10">
           <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 pb-20">
              
              <div className="lg:col-span-8 space-y-12">
                 
                 <div className="grid grid-cols-2 md:grid-cols-4 gap-6 bg-slate-50 dark:bg-slate-800/50 p-8 rounded-[32px] border border-slate-100 dark:border-slate-800">
                    <div>
                       <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Timeline</p>
                       <p className="font-bold text-slate-800 dark:text-white flex items-center gap-2">{property.timeline}</p>
                    </div>
                    <div>
                       <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Architecture</p>
                       <p className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
                          {property.towerCount ? `${property.towerCount} Phases` : property.developerName}
                       </p>
                    </div>
                    <div>
                       <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Land Parcel</p>
                       <p className="font-bold text-slate-800 dark:text-white flex items-center gap-2">{property.totalProjectSize}</p>
                    </div>
                    <div>
                       <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">RERA ID</p>
                       <p className="font-bold text-slate-800 dark:text-white flex items-center gap-2 truncate max-w-full">{property.reraId}</p>
                    </div>
                 </div>

                 <div>
                    <div className="flex items-center gap-3 mb-6">
                       <Sparkles size={24} className="text-blue-600" />
                       <h3 className="text-2xl font-black text-slate-800 dark:text-white">Amenities & Features</h3>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                       {property.amenities?.length > 0 ? property.amenities.map(amenity => (
                          <div key={amenity} className="flex items-center gap-3 p-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700">
                             <div className="bg-blue-50 dark:bg-blue-900/30 p-2 rounded-xl text-blue-600"><CheckCircle size={16} /></div>
                             <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{amenity}</span>
                          </div>
                       )) : (
                          <p className="text-slate-400 text-sm italic col-span-full">High-end lifestyle features included.</p>
                       )}
                    </div>
                 </div>

                 <div>
                    <div className="flex items-center gap-3 mb-6">
                       <LayoutGrid size={24} className="text-blue-600" />
                       <h3 className="text-2xl font-black text-slate-800 dark:text-white">Configurations</h3>
                    </div>
                    <div className="bg-white dark:bg-slate-900 rounded-[32px] border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xl">
                       <table className="w-full text-left">
                          <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 text-[10px] font-black uppercase tracking-widest">
                             <tr>
                                <th className="px-8 py-5">Configuration</th>
                                <th className="px-8 py-5">Size (Sqft)</th>
                                <th className="px-8 py-5">Total Units</th>
                                <th className="px-8 py-5">Inventory Sold</th>
                             </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                             {property.configurations.map(config => {
                                const progress = (config.unitsSold / config.totalUnits) * 100;
                                return (
                                  <tr key={config.id} className="group">
                                     <td className="px-8 py-6">
                                        <div className="font-bold text-slate-900 dark:text-white">{config.name}</div>
                                        <div className="text-emerald-500 font-bold text-xs">{formatCurrency(config.price)}</div>
                                     </td>
                                     <td className="px-8 py-6">
                                        <span className="bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 px-3 py-1 rounded-lg text-xs font-black">{config.size} Sqft</span>
                                     </td>
                                     <td className="px-8 py-6 font-bold text-slate-600 dark:text-slate-400">{config.totalUnits} Units</td>
                                     <td className="px-8 py-6">
                                        <div className="flex items-center gap-4">
                                           <div className="flex-1">
                                              <div className="flex justify-between text-[10px] font-bold text-slate-400 mb-1">
                                                 <span>{config.unitsSold} Sold</span>
                                                 <span>{Math.round(progress)}%</span>
                                              </div>
                                              <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                                 <div className="h-full bg-emerald-500 transition-all duration-500" style={{ width: `${progress}%` }} />
                                              </div>
                                           </div>
                                           {!readOnly && (
                                              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                 <button onClick={() => handleUnitSoldUpdate(config.id, false)} className="p-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg hover:bg-rose-500 hover:text-white"><Minus size={14} /></button>
                                                 <button onClick={() => handleUnitSoldUpdate(config.id, true)} className="p-1.5 bg-slate-900 dark:bg-slate-700 text-white rounded-lg hover:bg-emerald-500"><Plus size={14} /></button>
                                              </div>
                                           )}
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
                    <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-4">About the Project</h3>
                    <p className="text-slate-500 dark:text-slate-400 leading-relaxed max-w-2xl whitespace-pre-wrap">
                       {property.description || "A flagship development characterized by unmatched architectural finesse and strategic urban positioning."}
                    </p>
                 </div>
              </div>

              <div className="lg:col-span-4 space-y-6">
                 <div className="bg-slate-900 dark:bg-slate-800 p-8 rounded-[40px] text-white shadow-2xl sticky top-0">
                    <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-2">Location Profile</p>
                    <h4 className="text-2xl font-bold mb-6">{property.microLocation}</h4>
                    
                    <div className="space-y-6 mb-10">
                       <div className="flex items-start gap-4">
                          <div className="bg-white/10 p-2 rounded-xl"><MapPin size={20} /></div>
                          <div><p className="text-xs font-bold text-slate-400 mb-0.5">Micro-market</p><p className="text-sm">{property.microLocation}</p></div>
                       </div>
                       <div className="flex items-start gap-4">
                          <div className="bg-white/10 p-2 rounded-xl"><Building size={20} /></div>
                          <div><p className="text-xs font-bold text-slate-400 mb-0.5">Asset Type</p><p className="text-sm capitalize">{property.type}</p></div>
                       </div>
                    </div>

                    <div className="mb-10">
                       <p className="text-[10px] font-black text-amber-400 uppercase tracking-widest mb-4">Resource Center</p>
                       <div className="space-y-3">
                          {property.documents?.map(doc => (
                             <a 
                                key={doc.type} 
                                href={doc.url} 
                                download={`${property.title.split('–')[0]}_${doc.label}`}
                                className="w-full bg-white/5 hover:bg-white/10 p-4 rounded-2xl flex items-center justify-between group transition-all"
                             >
                                <div className="flex items-center gap-3">
                                   <div className="bg-white/10 p-2 rounded-lg text-white group-hover:scale-110 transition-transform"><FileText size={16} /></div>
                                   <span className="text-xs font-bold">{doc.label}</span>
                                </div>
                                <Download size={14} className="text-slate-500 group-hover:text-white" />
                             </a>
                          ))}
                          {(!property.documents || property.documents.length === 0) && (
                             <p className="text-xs text-slate-500 italic">No resources available for download.</p>
                          )}
                       </div>
                    </div>

                    {!readOnly && (
                       <button onClick={onEdit} className="w-full bg-blue-600 hover:bg-blue-700 py-4 rounded-2xl font-black text-sm transition-all shadow-lg shadow-blue-900/40 flex items-center justify-center gap-2">
                          Edit Project File
                       </button>
                    )}
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyDetails;
