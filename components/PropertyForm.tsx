import React, { useState, useEffect } from 'react';
import { X, Save, Plus, Trash2, Building, MapPin, Sparkles, LayoutGrid, Image as ImageIcon, Camera, Globe, Minus, RefreshCw } from 'lucide-react';
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
    images: [],
    configurations: initialData?.configurations || [],
    amenities: initialData?.amenities || [],
    documents: initialData?.documents || [],
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

  // Sync state with initial data
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
    if (!num || isNaN(num)) return '';
    if (num >= 10000000) return `${(num / 10000000).toFixed(2)} Crore`;
    if (num >= 100000) return `${(num / 100000).toFixed(2)} Lakh`;
    return num.toLocaleString('en-IN');
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setFormData(prev => {
          const newImages = [...(prev.images || [])];
          newImages[index] = base64;
          return { ...prev, images: newImages };
        });
      };
      reader.readAsDataURL(e.target.files[0]);
    }
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

  const inputClass = "w-full px-4 py-3.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all dark:text-white text-sm font-semibold text-slate-900";

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-[60]">
      <div className="bg-white dark:bg-slate-900 w-full max-w-6xl h-[92vh] rounded-[48px] shadow-3xl flex flex-col overflow-hidden border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-300">
        
        {/* Header */}
        <div className="p-10 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/30 dark:bg-slate-950/30">
          <div>
            <h2 className="text-3xl font-black dark:text-white tracking-tight leading-none">{initialData ? 'Update Asset' : 'Deploy New Project'}</h2>
            <div className="flex items-center gap-4 mt-3">
               <div className="flex items-center gap-2 bg-white dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-200/50 dark:border-slate-700 shadow-sm">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Asset Reference:</span>
                  <span className="text-xs font-mono font-black text-blue-600 dark:text-blue-400">{id}</span>
                  {!initialData && (
                    <button onClick={() => setId(generateUniqueId())} className="ml-1 text-slate-400 hover:text-blue-500 transition-all active:rotate-180" title="Generate New ID">
                       <RefreshCw size={12} />
                    </button>
                  )}
               </div>
               {formData.title && <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest truncate max-w-sm">{formData.title}</span>}
            </div>
          </div>
          <button onClick={onCancel} className="p-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-all active:scale-95 dark:text-white">
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-10 space-y-12 custom-scrollbar pb-32">
           
           {/* Section 1: Market Identification */}
           <section>
              <div className="flex items-center gap-2 mb-8 text-blue-600 dark:text-blue-400">
                 <Building size={20} className="shrink-0" />
                 <h3 className="font-black text-xs uppercase tracking-[0.2em]">Market Identification</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                 <div className="md:col-span-2">
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2.5">Project Nomenclature</label>
                    <input type="text" value={projectName} onChange={e => setProjectName(e.target.value)} placeholder="e.g. Imperial Heritage" className={inputClass} required />
                 </div>
                 <div>
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2.5">Asset Classification</label>
                    <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value as ProjectType})} className={inputClass}>
                       <option value="apartment">Residential Apartment</option>
                       <option value="villa">Luxury Villa</option>
                       <option value="commercial">Commercial Hub</option>
                    </select>
                 </div>
                 <div>
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2.5">Operational City</label>
                    <input type="text" value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} placeholder="e.g. Mumbai" className={inputClass} required />
                 </div>
                 <div>
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2.5">Micro-Location</label>
                    <input type="text" value={formData.microLocation} onChange={e => setFormData({...formData, microLocation: e.target.value})} placeholder="e.g. Lower Parel" className={inputClass} required />
                 </div>
                 <div>
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2.5">Lifecycle Stage</label>
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
              <div className="flex items-center gap-2 mb-8 text-emerald-600 dark:text-emerald-400">
                 <Globe size={20} className="shrink-0" />
                 <h3 className="font-black text-xs uppercase tracking-[0.2em]">Asset Specifications</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-8 p-8 bg-slate-50/50 dark:bg-slate-800/40 rounded-[32px] border border-slate-100 dark:border-slate-800 shadow-inner">
                 <div className="md:col-span-2">
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2.5">Developer Name</label>
                    <input type="text" value={formData.developerName} onChange={e => setFormData({...formData, developerName: e.target.value})} placeholder="e.g. Imperial Group" className={inputClass} />
                 </div>
                 <div>
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2.5">Project Footprint (Size)</label>
                    <input type="text" value={formData.totalProjectSize} onChange={e => setFormData({...formData, totalProjectSize: e.target.value})} placeholder="e.g. 2.4 Million Sqft" className={inputClass} />
                 </div>
                 <div>
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2.5">Target Possession</label>
                    <input type="text" value={formData.timeline} onChange={e => setFormData({...formData, timeline: e.target.value})} placeholder="e.g. Q4 2027" className={inputClass} />
                 </div>
                 <div className="md:col-span-2">
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2.5">RERA Registration</label>
                    <input type="text" value={formData.reraId} onChange={e => setFormData({...formData, reraId: e.target.value})} placeholder="PRM/XX/YYY" className={inputClass} />
                 </div>
                 <div>
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2.5">Tower Count</label>
                    <input type="number" value={formData.towerCount || ''} onChange={e => setFormData({...formData, towerCount: e.target.value ? Number(e.target.value) : undefined})} placeholder="Towers" className={inputClass} />
                 </div>
              </div>
           </section>

           {/* Section 3: Inventory Management */}
           <section>
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
                   <LayoutGrid size={20} className="shrink-0" />
                   <h3 className="font-black text-xs uppercase tracking-[0.2em]">Configuration Matrix</h3>
                </div>
                <button type="button" onClick={addConfiguration} className="px-6 py-3 bg-slate-900 dark:bg-blue-600 text-white text-[10px] font-black rounded-xl flex items-center gap-2 hover:bg-slate-800 transition-all shadow-xl active:scale-95 uppercase tracking-widest">
                  <Plus size={16} /> New Configuration
                </button>
              </div>
              <div className="space-y-6">
                {formData.configurations?.map((config, index) => (
                  <div key={config.id} className="bg-white dark:bg-slate-800/60 p-8 rounded-[40px] border border-slate-100 dark:border-slate-800 shadow-sm relative group hover:border-blue-500/30 transition-all">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8 items-start">
                      <div className="md:col-span-1">
                        <label className="block text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Unit Typology</label>
                        <input type="text" value={config.name} onChange={e => updateConfig(index, 'name', e.target.value)} placeholder="e.g. 4BHK Grand" className={inputClass} />
                      </div>
                      <div>
                        <label className="block text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Base Pricing (₹)</label>
                        <input type="number" value={config.price || ''} onChange={e => updateConfig(index, 'price', Number(e.target.value))} className={inputClass} />
                        <div className="text-[11px] font-black text-emerald-600 dark:text-emerald-400 mt-2 px-1">{toIndianWords(config.price)}</div>
                      </div>
                      
                      <div className="md:col-span-2 flex items-end gap-6">
                        <div className="flex-1 bg-slate-100/50 dark:bg-slate-900/50 p-6 rounded-3xl border border-slate-200/50 dark:border-slate-700/50">
                           <div className="flex justify-between items-center mb-5">
                              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Global Allocation</span>
                              <div className="flex items-center gap-4">
                                <button type="button" onClick={() => handleConfigStep(index, 'totalUnits', -1)} className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg text-slate-900 dark:text-white transition-colors"><Minus size={16} /></button>
                                <span className="font-black text-base text-slate-900 dark:text-white min-w-[2.5rem] text-center">{config.totalUnits || 0}</span>
                                <button type="button" onClick={() => handleConfigStep(index, 'totalUnits', 1)} className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg text-slate-900 dark:text-white transition-colors"><Plus size={16} /></button>
                              </div>
                           </div>
                           <div className="flex justify-between items-center">
                              <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Inventory Sold</span>
                              <div className="flex items-center gap-4">
                                <button type="button" onClick={() => handleConfigStep(index, 'unitsSold', -1)} className="p-1.5 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 rounded-lg text-emerald-700 dark:text-emerald-400 transition-colors"><Minus size={16} /></button>
                                <span className="font-black text-base text-emerald-700 dark:text-emerald-400 min-w-[2.5rem] text-center">{config.unitsSold || 0}</span>
                                <button type="button" onClick={() => handleConfigStep(index, 'unitsSold', 1)} className="p-1.5 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 rounded-lg text-emerald-700 dark:text-emerald-400 transition-colors"><Plus size={16} /></button>
                              </div>
                           </div>
                        </div>
                        <button type="button" onClick={() => setFormData(prev => ({...prev, configurations: prev.configurations?.filter((_, i) => i !== index)}))} className="p-4 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-2xl mb-1 transition-all active:scale-90">
                           <Trash2 size={24} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
           </section>

           {/* Section 4: Visuals */}
           <section>
              <div className="flex items-center gap-2 mb-8 text-purple-600 dark:text-purple-400">
                 <ImageIcon size={20} className="shrink-0" />
                 <h3 className="font-black text-xs uppercase tracking-[0.2em]">Project Visual Gallery</h3>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                 {[0, 1, 2, 3, 4].map((idx) => (
                    <div key={idx} className="relative aspect-video rounded-3xl overflow-hidden border-2 border-dashed border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 group hover:border-blue-400 transition-all flex items-center justify-center">
                       {formData.images?.[idx] ? (
                          <>
                             <img src={formData.images[idx]} className="w-full h-full object-cover" />
                             <button type="button" onClick={() => setFormData(p => ({...p, images: p.images?.filter((_, i) => i !== idx)}))} className="absolute top-3 right-3 p-2 bg-rose-500 text-white rounded-xl opacity-0 group-hover:opacity-100 transition-all shadow-xl hover:scale-110 active:scale-90">
                                <Trash2 size={16} />
                             </button>
                          </>
                       ) : (
                          <label className="cursor-pointer flex flex-col items-center gap-2 group/label">
                             <Camera size={28} className="text-slate-400 group-hover/label:text-blue-500 transition-colors" />
                             <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest group-hover/label:text-blue-500">Asset {idx + 1}</span>
                             <input type="file" className="hidden" accept="image/*" onChange={e => handleImageUpload(e, idx)} />
                          </label>
                       )}
                    </div>
                 ))}
              </div>
           </section>

           {/* Section 5: Narrative & Amenities */}
           <section className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div>
                <div className="flex items-center gap-2 mb-6">
                   <ImageIcon size={20} className="text-purple-600" />
                   <h3 className="font-black text-xs uppercase tracking-[0.2em]">Project Narrative</h3>
                </div>
                <textarea 
                   value={formData.description} 
                   onChange={e => setFormData({...formData, description: e.target.value})}
                   rows={6}
                   placeholder="Describe the architectural vision, luxury amenities, and lifestyle USPs..."
                   className={inputClass + " resize-none h-[220px]"}
                />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-6">
                   <Sparkles size={20} className="text-emerald-500" />
                   <h3 className="font-black text-xs uppercase tracking-[0.2em]">Amenities & Lifestyle</h3>
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
                  <div className="flex flex-wrap gap-2.5 pt-2 max-h-[160px] overflow-y-auto p-1 custom-scrollbar">
                     {formData.amenities?.map(amenity => (
                        <span key={amenity} className="px-4 py-2 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white rounded-xl text-xs font-black border border-slate-200 dark:border-slate-700 flex items-center gap-3 animate-in fade-in zoom-in-95 group transition-all hover:border-blue-400">
                           {amenity}
                           <button type="button" onClick={() => setFormData(prev => ({...prev, amenities: prev.amenities?.filter(a => a !== amenity)}))} className="text-slate-400 hover:text-rose-500 transition-colors">
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
        <div className="p-10 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-6 bg-white dark:bg-slate-900 shrink-0 z-20">
           <button onClick={onCancel} className="px-10 py-4 font-black text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl transition-all text-sm uppercase tracking-widest">Discard</button>
           <button 
             onClick={() => {
                if (!projectName || !formData.city) {
                  alert("Project Name and City are mandatory for deployment.");
                  return;
                }
                onSave({...formData, id} as Property);
             }} 
             disabled={isSaving} 
             className="px-14 py-4 bg-blue-600 text-white font-black rounded-2xl shadow-2xl shadow-blue-500/30 flex items-center gap-3 hover:bg-blue-700 disabled:opacity-50 transition-all active:scale-95 text-sm uppercase tracking-[0.15em]"
           >
              {isSaving ? 'Processing Deployment...' : <><Save size={20} /> Commit to Database</>}
           </button>
        </div>
      </div>
    </div>
  );
};

export default PropertyForm;
