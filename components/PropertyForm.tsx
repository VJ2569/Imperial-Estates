import React, { useState, useEffect } from 'react';
import { X, Save, Plus, Trash2, Building, MapPin, Calculator, FileText, Sparkles, LayoutGrid, Image as ImageIcon, Camera, Globe, Minus, RefreshCw } from 'lucide-react';
import { Property, PropertyFormData, Configuration, ProjectStatus, ProjectType, ProjectDocument } from '../types';
import { generateUniqueId } from '../services/propertyService';

interface PropertyFormProps {
  initialData?: Property | null;
  onSave: (data: Property) => Promise<void>;
  onCancel: () => void;
  isSaving: boolean;
}

const PropertyForm: React.FC<PropertyFormProps> = ({ initialData, onSave, onCancel, isSaving }) => {
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

  const [projectName, setProjectName] = useState('');
  const [id, setId] = useState(initialData?.id || '');
  const [newAmenity, setNewAmenity] = useState('');

  // Effect: Generate unique ID for NEW properties only
  useEffect(() => {
    if (!initialData && !id) {
      setId(generateUniqueId());
    }
  }, [initialData, id]);

  // Handle Title Formatting (Separate from ID generation)
  useEffect(() => {
    if (projectName && formData.city && formData.microLocation) {
        const formattedTitle = `${projectName} – ${formData.microLocation}, ${formData.city}`;
        setFormData(prev => ({ ...prev, title: formattedTitle }));
    }
  }, [projectName, formData.city, formData.microLocation]);

  useEffect(() => {
    if (initialData?.title) {
        setProjectName(initialData.title.split('–')[0].trim());
    }
  }, [initialData]);

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

  const inputClass = "w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all dark:text-white text-sm font-medium";

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 z-[60]">
      <div className="bg-white dark:bg-slate-900 w-full max-w-5xl h-[90vh] rounded-[40px] shadow-2xl flex flex-col overflow-hidden border border-slate-200 dark:border-slate-800">
        
        {/* Header */}
        <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-950/50">
          <div>
            <h2 className="text-2xl font-black dark:text-white tracking-tight">{initialData ? 'Update Asset' : 'New Project Deployment'}</h2>
            <div className="flex items-center gap-3 mt-1">
               <div className="flex items-center gap-2 bg-slate-200 dark:bg-slate-800 px-3 py-1 rounded-lg">
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Asset ID:</span>
                  <span className="text-xs font-mono font-bold text-blue-600 dark:text-blue-400">{id}</span>
                  {!initialData && (
                    <button onClick={() => setId(generateUniqueId())} className="text-slate-400 hover:text-blue-500 transition-colors" title="Regenerate ID">
                       <RefreshCw size={12} />
                    </button>
                  )}
               </div>
               {formData.title && <span className="text-xs text-slate-400 font-medium truncate max-w-xs">{formData.title}</span>}
            </div>
          </div>
          <button onClick={onCancel} className="p-3 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full transition-colors dark:text-white">
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 space-y-10 custom-scrollbar pb-32">
           
           {/* Section 1: Identity */}
           <section>
              <div className="flex items-center gap-2 mb-6 text-blue-600 dark:text-blue-400">
                 <Building size={20} className="shrink-0" />
                 <h3 className="font-black text-sm uppercase tracking-widest">Identity & Market</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                 <div className="md:col-span-2">
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Project Display Name</label>
                    <input type="text" value={projectName} onChange={e => setProjectName(e.target.value)} placeholder="e.g. Imperial Skyvistas" className={inputClass} required />
                 </div>
                 <div>
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Asset Modality</label>
                    <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value as ProjectType})} className={inputClass}>
                       <option value="apartment">Apartment</option>
                       <option value="villa">Villa</option>
                       <option value="commercial">Commercial</option>
                    </select>
                 </div>
                 <div>
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Primary City</label>
                    <input type="text" value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} placeholder="e.g. Mumbai" className={inputClass} required />
                 </div>
                 <div>
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Micro-Location</label>
                    <input type="text" value={formData.microLocation} onChange={e => setFormData({...formData, microLocation: e.target.value})} placeholder="e.g. Worli" className={inputClass} required />
                 </div>
                 <div>
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Project Status</label>
                    <select value={formData.projectStatus} onChange={e => setFormData({...formData, projectStatus: e.target.value as ProjectStatus})} className={inputClass}>
                       <option value="pre-launch">Pre-Launch</option>
                       <option value="under-construction">Under-Construction</option>
                       <option value="ready">Ready to Move</option>
                    </select>
                 </div>
              </div>
           </section>

           {/* Section 2: Technical Specs */}
           <section>
              <div className="flex items-center gap-2 mb-6 text-emerald-600 dark:text-emerald-400">
                 <Globe size={20} className="shrink-0" />
                 <h3 className="font-black text-sm uppercase tracking-widest">Asset Specifications</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6 bg-slate-50 dark:bg-slate-800/50 rounded-3xl border border-slate-100 dark:border-slate-800">
                 <div>
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Land Area / Size</label>
                    <input type="text" value={formData.totalProjectSize} onChange={e => setFormData({...formData, totalProjectSize: e.target.value})} placeholder="e.g. 15.5 Acres" className={inputClass} />
                 </div>
                 <div>
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Possession Timeline</label>
                    <input type="text" value={formData.timeline} onChange={e => setFormData({...formData, timeline: e.target.value})} placeholder="e.g. Dec 2026" className={inputClass} />
                 </div>
                 <div>
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">RERA ID</label>
                    <input type="text" value={formData.reraId} onChange={e => setFormData({...formData, reraId: e.target.value})} placeholder="PRM/KA/RERA..." className={inputClass} />
                 </div>
              </div>
           </section>

           {/* Section 3: Inventory */}
           <section>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
                   <LayoutGrid size={20} className="shrink-0" />
                   <h3 className="font-black text-sm uppercase tracking-widest">Unit Inventory</h3>
                </div>
                <button type="button" onClick={addConfiguration} className="px-5 py-2.5 bg-slate-900 dark:bg-blue-600 text-white text-xs font-black rounded-xl flex items-center gap-2 hover:bg-slate-800 transition-all shadow-xl">
                  <Plus size={16} /> Add Configuration
                </button>
              </div>
              <div className="space-y-6">
                {formData.configurations?.map((config, index) => (
                  <div key={config.id} className="bg-white dark:bg-slate-800/60 p-6 rounded-[32px] border border-slate-100 dark:border-slate-800 shadow-sm relative group">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-start">
                      <div className="md:col-span-1">
                        <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Config Type</label>
                        <input type="text" value={config.name} onChange={e => updateConfig(index, 'name', e.target.value)} placeholder="e.g. 4.5 BHK" className={inputClass} />
                      </div>
                      <div>
                        <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Starting (₹)</label>
                        <input type="number" value={config.price || ''} onChange={e => updateConfig(index, 'price', Number(e.target.value))} className={inputClass} />
                        <div className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 mt-1">{toIndianWords(config.price)}</div>
                      </div>
                      
                      <div className="md:col-span-2 flex items-end gap-4">
                        <div className="flex-1 bg-slate-50 dark:bg-slate-900/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-700">
                           <div className="flex justify-between items-center mb-3">
                              <span className="text-[10px] font-black text-slate-500 uppercase">Total Inventory</span>
                              <div className="flex items-center gap-3">
                                <button type="button" onClick={() => handleConfigStep(index, 'totalUnits', -1)} className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-md text-slate-900 dark:text-white"><Minus size={14} /></button>
                                <span className="font-black text-sm text-slate-900 dark:text-white min-w-[2rem] text-center">{config.totalUnits || 0}</span>
                                <button type="button" onClick={() => handleConfigStep(index, 'totalUnits', 1)} className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-md text-slate-900 dark:text-white"><Plus size={14} /></button>
                              </div>
                           </div>
                           <div className="flex justify-between items-center">
                              <span className="text-[10px] font-black text-emerald-600 uppercase">Units Sold</span>
                              <div className="flex items-center gap-3">
                                <button type="button" onClick={() => handleConfigStep(index, 'unitsSold', -1)} className="p-1 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 rounded-md text-emerald-700 dark:text-emerald-400"><Minus size={14} /></button>
                                <span className="font-black text-sm text-emerald-700 dark:text-emerald-400 min-w-[2rem] text-center">{config.unitsSold || 0}</span>
                                <button type="button" onClick={() => handleConfigStep(index, 'unitsSold', 1)} className="p-1 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 rounded-md text-emerald-700 dark:text-emerald-400"><Plus size={14} /></button>
                              </div>
                           </div>
                        </div>
                        <button type="button" onClick={() => setFormData(prev => ({...prev, configurations: prev.configurations?.filter((_, i) => i !== index)}))} className="p-3 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-xl mb-1">
                           <Trash2 size={20} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
           </section>

           {/* Visuals */}
           <section>
              <div className="flex items-center gap-2 mb-6 text-purple-600 dark:text-purple-400">
                 <ImageIcon size={20} className="shrink-0" />
                 <h3 className="font-black text-sm uppercase tracking-widest">Asset Gallery</h3>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                 {[0, 1, 2, 3, 4].map((idx) => (
                    <div key={idx} className="relative aspect-video rounded-2xl overflow-hidden border-2 border-dashed border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 group hover:border-blue-400 transition-all flex items-center justify-center">
                       {formData.images?.[idx] ? (
                          <>
                             <img src={formData.images[idx]} className="w-full h-full object-cover" />
                             <button type="button" onClick={() => setFormData(p => ({...p, images: p.images?.filter((_, i) => i !== idx)}))} className="absolute top-2 right-2 p-1.5 bg-rose-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                                <Trash2 size={12} />
                             </button>
                          </>
                       ) : (
                          <label className="cursor-pointer flex flex-col items-center gap-1">
                             <Camera size={24} className="text-slate-400" />
                             <span className="text-[10px] font-black text-slate-400 uppercase">Upload {idx + 1}</span>
                             <input type="file" className="hidden" accept="image/*" onChange={e => handleImageUpload(e, idx)} />
                          </label>
                       )}
                    </div>
                 ))}
              </div>
           </section>

           {/* Description */}
           <section>
              <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Project Narrative</h3>
              <textarea 
                 value={formData.description} 
                 onChange={e => setFormData({...formData, description: e.target.value})}
                 rows={4}
                 placeholder="Describe the luxury details, architecture, and USP..."
                 className={inputClass + " resize-none"}
              />
           </section>
        </div>

        {/* Action Footer */}
        <div className="p-8 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-4 bg-white dark:bg-slate-900 shrink-0">
           <button onClick={onCancel} className="px-8 py-3.5 font-black text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl transition-colors text-sm">Cancel</button>
           <button 
             onClick={() => {
                if (!projectName || !formData.city) {
                  alert("Project Name and City are required.");
                  return;
                }
                onSave({...formData, id} as Property);
             }} 
             disabled={isSaving} 
             className="px-12 py-3.5 bg-blue-600 text-white font-black rounded-2xl shadow-xl shadow-blue-500/20 flex items-center gap-3 hover:bg-blue-700 disabled:opacity-50 transition-all text-sm"
           >
              {isSaving ? 'Processing...' : <><Save size={20} /> Commit Deployment</>}
           </button>
        </div>
      </div>
    </div>
  );
};

export default PropertyForm;
