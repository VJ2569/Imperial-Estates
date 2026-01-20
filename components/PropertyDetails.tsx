import React, { useState } from 'react';
import { X, MapPin, Building, Calendar, Shield, Plus, Minus, LayoutGrid, CheckCircle, Download, FileText, Sparkles, Image as ImageIcon } from 'lucide-react';
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

  const formatCurrency = (val: number) => `₹${(val / 10000000).toFixed(2)} Cr`;

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xl flex items-center justify-center p-4 z-50 animate-in fade-in duration-300">
      <div className="bg-white dark:bg-slate-900 w-full max-w-6xl h-[90vh] rounded-[40px] shadow-3xl flex flex-col overflow-hidden border border-slate-200 dark:border-slate-800">
        
        {/* Sticky Close Header */}
        <div className="absolute top-6 right-6 z-30">
           <button onClick={onClose} className="bg-white/10 hover:bg-white/20 p-3 rounded-full text-white backdrop-blur-md transition-all border border-white/10"><X size={24} /></button>
        </div>

        {/* Scrollable Container - Everything inside scrolls now */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          
          {/* Hero Section - Now part of the scroll flow */}
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
               </div>
               <div className="flex items-center gap-2 text-blue-400 font-mono text-sm mb-2"><MapPin size={16} /> {property.city} • {property.microLocation}</div>
               <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight">{property.title}</h2>
            </div>

            {/* Image Navigation Bar */}
            {property.images && property.images.length > 1 && (
              <div className="absolute top-10 left-10 flex gap-2 p-2 bg-black/40 backdrop-blur-md rounded-2xl z-20">
                {property.images.map((img, idx) => (
                  <button 
                    key={idx} 
                    onClick={() => setActiveImageIndex(idx)}
                    className={`w-12 h-12 rounded-lg overflow-hidden border-2 transition-all ${activeImageIndex === idx ? 'border-blue-500 scale-110' : 'border-transparent opacity-60 hover:opacity-100'}`}
                  >
                    <img src={img} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="p-10">
             <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 pb-20">
                
                <div className="lg:col-span-8 space-y-12">
                   
                   <div className="grid grid-cols-2 md:grid-cols-4 gap-6 bg-slate-50 dark:bg-slate-800/50 p-8 rounded-[32px] border border-slate-100 dark:border-slate-800">
                      <div>
                         <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Possession</p>
                         <p className="font-bold text-slate-800 dark:text-white flex items-center gap-2">{property.timeline}</p>
                      </div>
                      <div>
                         <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Phases</p>
                         <p className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
                            {property.towerCount ? `${property.towerCount} Towers` : property.developerName}
                         </p>
                      </div>
                      <div>
                         <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Land Area</p>
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
                         <h3 className="text-2xl font-black text-slate-800 dark:text-white">Lifestyle Amenities</h3>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                         {property.amenities?.length > 0 ? property.amenities.map(amenity => (
                            <div key={amenity} className="flex items-center gap-3 p-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700">
                               <div className="bg-blue-50 dark:bg-blue-900/30 p-2 rounded-xl text-blue-600"><CheckCircle size={16} /></div>
                               <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{amenity}</span>
                            </div>
                         )) : (
                            <p className="text-slate-400 text-sm italic col-span-full">Premium lifestyle amenities curated for excellence.</p>
                         )}
                      </div>
                   </div>

                   <div>
                      <div className="flex items-center gap-3 mb-6">
                         <LayoutGrid size={24} className="text-blue-600" />
                         <h3 className="text-2xl font-black text-slate-800 dark:text-white">Unit Configurations</h3>
                      </div>
                      <div className="bg-white dark:bg-slate-900 rounded-[32px] border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xl">
                         <table className="w-full text-left">
                            <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 text-[10px] font-black uppercase tracking-widest">
                               <tr>
                                  <th className="px-8 py-5">Unit Type</th>
                                  <th className="px-8 py-5">Area</th>
                                  <th className="px-8 py-5">Inventory</th>
                                  <th className="px-8 py-5">Sales Velocity</th>
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
                                                   <span>{config.unitsSold} Booked</span>
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
                            <div><p className="text-xs font-bold text-slate-400 mb-0.5">Development</p><p className="text-sm capitalize">{property.type}</p></div>
                         </div>
                      </div>

                      <div className="mb-10">
                         <p className="text-[10px] font-black text-amber-400 uppercase tracking-widest mb-4">Marketing Assets</p>
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
