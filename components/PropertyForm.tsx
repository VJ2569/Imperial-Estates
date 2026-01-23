import React, { useState, useEffect } from 'react';
import { X, Save, Plus, Trash2, Building, Sparkles, LayoutGrid, Image as ImageIcon, Globe, Minus, RefreshCw } from 'lucide-react';
import { Property, PropertyFormData, Configuration, ProjectStatus, ProjectType } from '../types';
import { generateUniqueId } from '../services/propertyService';

interface PropertyFormProps {
  initialData?: Property | null;
  onSave: (data: Property) => Promise<void>;
  onCancel: () => void;
  isSaving: boolean;
}

const PropertyForm: React.FC<PropertyFormProps> = ({ initialData, onSave, onCancel, isSaving }) => {
  const [id, setId] = useState<string>(initialData?.id || '');
  const [projectName, setProjectName] = useState('');
  const [newAmenity, setNewAmenity] = useState('');

  const [formData, setFormData] = useState<PropertyFormData>({
    title: '',
    type: 'apartment',
    city: '',
    microLocation: '',
    totalProjectSize: '',
    projectStatus: 'under-construction',
    developerName: 'Imperial Group',
    reraId: '',
    timeline: '',
    active: true,
    images: initialData?.images || [],
    configurations: initialData?.configurations || [],
    amenities: initialData?.amenities || [],
    documents: [],
    description: '',
    towerCount: undefined,
    ...initialData
  });

  // Unique ID for new projects
  useEffect(() => {
    if (!initialData && !id) {
      setId(generateUniqueId());
    }
  }, [initialData, id]);

  // Sync state with initial data for title formatting
  useEffect(() => {
    if (initialData?.title) {
        setProjectName(initialData.title.split('–')[0].trim());
    }
  }, [initialData]);

  // Auto-format full title
  useEffect(() => {
    if (projectName && formData.city && formData.microLocation) {
        const formattedTitle = `${projectName} – ${formData.microLocation}, ${formData.city}`;
        setFormData(prev => ({ ...prev, title: formattedTitle }));
    }
  }, [projectName, formData.city, formData.microLocation]);

  const toIndianWords = (num: number | undefined): string => {
    if (!num || isNaN(num) || num === 0) return '';
    if (num >= 10000000) return `${(num / 10000000).toFixed(2)} Crore`;
    if (num >= 100000) return `${(num / 100000).toFixed(2)} Lakh`;
    return num.toLocaleString('en-IN');
  };

  const addConfiguration = () => {
    const newConfig: Configuration = {
      id: `CONFIG-${Date.now()}`,
      name: '',
      size: 0,
      totalUnits: 0,
      unitsSold: 0,
      price: 0
    };
    setFormData(prev => ({
      ...prev,
      configurations: [...(prev.configurations || []), newConfig]
    }));
  };

  const updateConfig = (index: number, field: keyof Configuration, value: any) => {
    const updated = [...(formData.configurations || [])];
    updated[index] = { ...updated[index], [field]: value };
    setFormData(prev => ({ ...prev, configurations: updated }));
  };

  const handleConfigStep = (index: number, field: 'unitsSold' | 'totalUnits', delta: number) => {
    const updated = [...(formData.configurations || [])];
    const current = updated[index][field] || 0;
    updated[index] = { ...updated[index], [field]: Math.max(0, current + delta) };
    setFormData(prev => ({ ...prev, configurations: updated }));
  };

  const handleAddAmenity = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && newAmenity.trim()) {
      e.preventDefault();
      if (!formData.amenities?.includes(newAmenity.trim())) {
        setFormData(prev => ({
          ...prev,
          amenities: [...(prev.amenities || []), newAmenity.trim()]
        }));
      }
      setNewAmenity('');
    }
  };

  // Re-usable high-contrast styles
  const inputClass = "w-full px-4 py-3.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all dark:text-slate-100 text-sm font-bold text-slate-900 placeholder:text-slate-400";
  const labelHeaderClass = "font-black text-sm uppercase tracking-[0.2em] text-slate-900 dark:text-slate-50";
  const subLabelClass = "block text-[10px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-widest mb-2";

  return (
    <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 z-[60]">
      <div className="bg-white dark:bg-slate-900 w-full max-w-6xl h-[94vh] rounded-[48px] shadow-3xl flex flex-col overflow-hidden border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-300">
        
        {/* Header */}
        <div className="p-10 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-950/50">
          <div>
            <h2 className="text-3xl font-black dark:text-white tracking-tight leading-none">Deploy Asset</h2>
            <div className="flex items-center gap-4 mt-3">
               <div className="flex items-center gap-2 bg-slate-900 dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-700 shadow-sm">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Asset Reference:</span>
                  <span className="text-xs font-mono font-black text-blue-400">{id}</span>
                  {!initialData && (
                    <button onClick={() => setId(generateUniqueId())} className="ml-1 text-slate-500 hover:text-blue-400 transition-all active:rotate-180" title="Generate New ID">
                       <RefreshCw size={12} />
                    </button>
                  )}
               </div>
               {formData.title && <span className="text-[10px] font-black text-slate-500 dark:text-slate-300 uppercase tracking-widest truncate max-w-sm">{formData.title}</span>}
            </div>
          </div>
          <button onClick={onCancel} className="p-3 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 rounded-full transition-all active:scale-95 text-slate-900 dark:text-white">
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-10 space-y-12 custom-scrollbar pb-32">
           
           {/* Section 1: Market Identification */}
           <section>
              <div className="flex items-center gap-3 mb-8 text-blue-600 dark:text-blue-400">
                 <Building size={24} className="shrink-0" />
                 <h3 className={labelHeaderClass}>Market Identification</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                 <div className="md:col-span-2">
                    <label className={subLabelClass}>Project Nomenclature</label>
                    <input type="text" value={projectName} onChange={e => setProjectName(e.target.value)} placeholder="e.g. Imperial Skyvistas" className={inputClass} required />
                 </div>
                 <div>
                    <label className={subLabelClass}>Asset Classification</label>
                    <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value as ProjectType})} className={inputClass}>
                       <option value="apartment">Residential Apartment</option>
                       <option value="villa">Luxury Villa</option>
                       <option value="commercial">Commercial Hub</option>
                    </select>
                 </div>
                 <div>
                    <label className={subLabelClass}>Operational City</label>
                    <input type="text" value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} placeholder="e.g. Mumbai" className={inputClass} required />
                 </div>
                 <div>
                    <label className={subLabelClass}>Micro-Location</label>
                    <input type="text" value={formData.microLocation} onChange={e => setFormData({...formData, microLocation: e.target.value})} placeholder="e.g. Worli" className={inputClass} required />
                 </div>
                 <div>
                    <label className={subLabelClass}>Lifecycle Stage</label>
                    <select value={formData.projectStatus} onChange={e => setFormData({...formData, projectStatus: e.target.value as ProjectStatus})} className={inputClass}>
                       <option value="pre-launch">Pre-Launch</option>
                       <option value="under-construction">Active Construction</option>
                       <option value="ready">Ready for Possession</option>
                    </select>
                 </div>
              </div>
           </section>

           {/* Section 2: Technical Specifications */}
           <section>
              <div className="flex items-center gap-3 mb-8 text-emerald-600 dark:text-emerald-400">
                 <Globe size={24} className="shrink-0" />
                 <h3 className={labelHeaderClass}>Asset Specifications</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-8 p-8 bg-slate-50 dark:bg-slate-800/40 rounded-[32px] border border-slate-200 dark:border-slate-800 shadow-inner">
                 <div className="md:col-span-2">
                    <label className={subLabelClass}>Developer Entity</label>
                    <input type="text" value={formData.developerName} onChange={e => setFormData({...formData, developerName: e.target.value})} placeholder="e.g. Imperial Estates Group" className={inputClass} />
                 </div>
                 <div>
                    <label className={subLabelClass}>Project Footprint (Size)</label>
                    <input type="text" value={formData.totalProjectSize} onChange={e => setFormData({...formData, totalProjectSize: e.target.value})} placeholder="e.g. 5.5 Acres" className={inputClass} />
                 </div>
                 <div>
                    <label className={subLabelClass}>Possession Target</label>
                    <input type="text" value={formData.timeline} onChange={e => setFormData({...formData, timeline: e.target.value})} placeholder="e.g. Dec 2026" className={inputClass} />
                 </div>
                 <div className="md:col-span-2">
                    <label className={subLabelClass}>RERA Registration ID</label>
                    <input type="text" value={formData.reraId} onChange={e => setFormData({...formData, reraId: e.target.value})} placeholder="PRM/KA/RERA/..." className={inputClass} />
                 </div>
                 <div>
                    <label className={subLabelClass}>Tower Count</label>
                    <input type="number" value={formData.towerCount ?? ''} onChange={e => setFormData({...formData, towerCount: e.target.value ? Number(e.target.value) : undefined})} placeholder="Total Towers" className={inputClass} />
                 </div>
                 <div>
                    <label className={subLabelClass}>Active Status</label>
                    <div className="flex items-center h-[52px]">
                       <button 
                         type="button"
                         onClick={() => setFormData({...formData, active: !formData.active})}
                         className={`w-full py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${formData.active ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-500 dark:bg-slate-700'}`}
                       >
                         {formData.active ? 'Live on Portal' : 'Draft / Offline'}
                       </button>
                    </div>
                 </div>
              </div>
           </section>

           {/* Section 3: Configuration Matrix */}
           <section>
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3 text-amber-600 dark:text-amber-400">
                   <LayoutGrid size={24} className="shrink-0" />
                   <h3 className={labelHeaderClass}>Configuration Matrix</h3>
                </div>
                <button type="button" onClick={addConfiguration} className="px-6 py-3 bg-slate-900 dark:bg-blue-600 text-white text-[10px] font-black rounded-xl flex items-center gap-2 hover:bg-slate-800 transition-all shadow-xl active:scale-95 uppercase tracking-widest">
                  <Plus size={16} /> Add Typology
                </button>
              </div>
              <div className="space-y-6">
                {formData.configurations?.map((config, index) => (
                  <div key={config.id} className="bg-white dark:bg-slate-800 p-8 rounded-[40px] border border-slate-300 dark:border-slate-700 shadow-sm relative group hover:border-blue-500 transition-all">
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                      <div className="md:col-span-3">
                        <label className={subLabelClass}>Unit Typology</label>
                        <input type="text" value={config.name} onChange={e => updateConfig(index, 'name', e.target.value)} placeholder="e.g. 4.5 BHK Grande" className={inputClass} />
                      </div>
                      <div className="md:col-span-3">
                        <label className={subLabelClass}>Base Pricing (₹)</label>
                        <input type="number" value={config.price || ''} onChange={e => updateConfig(index, 'price', e.target.value ? Number(e.target.value) : undefined)} className={inputClass} placeholder="Investment From" />
                        <div className="text-[11px] font-black text-emerald-600 dark:text-emerald-400 mt-2 px-1">{toIndianWords(config.price)}</div>
                      </div>
                      <div className="md:col-span-2">
                        <label className={subLabelClass}>Carpet Area (Sqft)</label>
                        <input type="number" value={config.size || ''} onChange={e => updateConfig(index, 'size', e.target.value ? Number(e.target.value) : undefined)} className={inputClass} placeholder="Area" />
                      </div>
                      
                      <div className="md:col-span-4 flex items-end gap-4">
                        <div className="flex-1 bg-slate-50 dark:bg-slate-900/50 p-5 rounded-2xl border border-slate-200 dark:border-slate-700">
                           <div className="flex justify-between items-center mb-4">
                              <span className="text-[10px] font-black text-slate-800 dark:text-slate-200 uppercase tracking-widest">Total Inventory</span>
                              <div className="flex items-center gap-4">
                                <button type="button" onClick={() => handleConfigStep(index, 'totalUnits', -1)} className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded text-slate-900 dark:text-white"><Minus size={16} /></button>
                                <span className="font-black text-sm text-slate-900 dark:text-white min-w-[2rem] text-center">{config.totalUnits || 0}</span>
                                <button type="button" onClick={() => handleConfigStep(index, 'totalUnits', 1)} className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded text-slate-900 dark:text-white"><Plus size={16} /></button>
                              </div>
                           </div>
                           <div className="flex justify-between items-center">
                              <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Units Sold</span>
                              <div className="flex items-center gap-4">
                                <button type="button" onClick={() => handleConfigStep(index, 'unitsSold', -1)} className="p-1 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 rounded text-emerald-700 dark:text-emerald-400"><Minus size={16} /></button>
                                <span className="font-black text-sm text-emerald-700 dark:text-emerald-400 min-w-[2rem] text-center">{config.unitsSold || 0}</span>
                                <button type="button" onClick={() => handleConfigStep(index, 'unitsSold', 1)} className="p-1 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 rounded text-emerald-700 dark:text-emerald-400"><Plus size={16} /></button>
                              </div>
                           </div>
                        </div>
                        <button type="button" onClick={() => setFormData(prev => ({...prev, configurations: prev.configurations?.filter((_, i) => i !== index)}))} className="p-3 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-xl mb-1 transition-all">
                           <Trash2 size={24} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
           </section>

           {/* Section 4: Media Assets (URL Based Only) */}
           <section>
              <div className="flex items-center gap-3 mb-8 text-purple-600 dark:text-purple-400">
                 <ImageIcon size={24} className="shrink-0" />
                 <h3 className={labelHeaderClass}>Project Media</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 <div>
                    <label className={subLabelClass}>Primary Asset Image URL</label>
                    <input 
                      type="text" 
                      value={formData.images?.[0] || ''} 
                      onChange={e => setFormData({...formData, images: [e.target.value, ...(formData.images?.slice(1) || [])]})}
                      placeholder="https://images.unsplash.com/..."
                      className={inputClass}
                    />
                    {formData.images?.[0] && (
                       <div className="mt-4 aspect-video rounded-3xl overflow-hidden border border-slate-200 shadow-sm bg-slate-100 flex items-center justify-center">
                          <img src={formData.images[0]} className="w-full h-full object-cover" onError={(e) => e.currentTarget.src = 'https://via.placeholder.com/800x450?text=Invalid+Image+URL'} />
                       </div>
                    )}
                 </div>
                 <div className="space-y-4">
                    <p className="text-[11px] font-black text-slate-500 uppercase italic">Imperial Dashboard v2.5: Image and Document uploading is currently disabled by administrator policy. Please provide public hosting URLs for all project assets.</p>
                 </div>
              </div>
           </section>

           {/* Section 5: Narrative & Lifestyle */}
           <section className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div>
                <div className="flex items-center gap-3 mb-6">
                   <ImageIcon size={24} className="text-purple-600" />
                   <h3 className={labelHeaderClass}>Project Narrative</h3>
                </div>
                <textarea 
                   value={formData.description} 
                   onChange={e => setFormData({...formData, description: e.target.value})}
                   rows={8}
                   placeholder="Describe the architectural vision, location advantages, and luxury nuances..."
                   className={inputClass + " resize-none h-[250px] dark:text-slate-100 font-bold leading-relaxed"}
                />
              </div>
              <div>
                <div className="flex items-center gap-3 mb-6">
                   <Sparkles size={24} className="text-emerald-500" />
                   <h3 className={labelHeaderClass}>Amenities & Lifestyle</h3>
                </div>
                <div className="space-y-4">
                  <input 
                     type="text" 
                     value={newAmenity}
                     onChange={e => setNewAmenity(e.target.value)}
                     onKeyDown={handleAddAmenity}
                     placeholder="Type amenity and press Enter..."
                     className={inputClass}
                  />
                  <div className="flex flex-wrap gap-2.5 pt-2 max-h-[200px] overflow-y-auto p-1 custom-scrollbar">
                     {formData.amenities?.map(amenity => (
                        <span key={amenity} className="px-5 py-2.5 bg-slate-900 text-white dark:bg-slate-800 dark:text-slate-100 rounded-xl text-xs font-black flex items-center gap-3 border border-slate-700 animate-in fade-in zoom-in-95 group shadow-sm">
                           {amenity}
                           <button type="button" onClick={() => setFormData(prev => ({...prev, amenities: prev.amenities?.filter(a => a !== amenity)}))} className="text-slate-400 hover:text-rose-400 transition-colors">
                              <X size={14} />
                           </button>
                        </span>
                     ))}
                  </div>
                </div>
              </div>
           </section>
        </div>

        {/* Action Footer */}
        <div className="p-10 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-6 bg-slate-50/50 dark:bg-slate-900 shrink-0 z-20">
           <button onClick={onCancel} className="px-10 py-4 font-black text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-2xl transition-all text-sm uppercase tracking-widest">Discard Changes</button>
           <button 
             onClick={() => {
                if (!projectName || !formData.city || !formData.microLocation) {
                  alert("Deployment Halted: Name, City, and Location are required.");
                  return;
                }
                onSave({...formData, id} as Property);
             }} 
             disabled={isSaving} 
             className="px-14 py-4 bg-blue-600 text-white font-black rounded-2xl shadow-2xl shadow-blue-500/30 flex items-center gap-3 hover:bg-blue-700 disabled:opacity-50 transition-all active:scale-95 text-sm uppercase tracking-[0.15em]"
           >
              {isSaving ? 'Synchronizing...' : <><Save size={20} /> Commit Deployment</>}
           </button>
        </div>
      </div>
    </div>
  );
};

export default PropertyForm;
