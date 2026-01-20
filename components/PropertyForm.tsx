import React, { useState, useEffect } from 'react';
import { X, Save, Plus, Trash2, Building, MapPin, Calculator, FileText, Sparkles, LayoutGrid, Image as ImageIcon, Camera, Globe } from 'lucide-react';
import { Property, PropertyFormData, Configuration, ProjectStatus, ProjectType, ProjectDocument } from '../types';

interface PropertyFormProps {
  initialData?: Property | null;
  newId?: string;
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
    configurations: [],
    amenities: [],
    documents: [],
    description: '',
    towerCount: undefined,
    ...initialData
  });

  const [projectName, setProjectName] = useState('');
  const [id, setId] = useState(initialData?.id || '');
  const [newAmenity, setNewAmenity] = useState('');

  useEffect(() => {
    if (initialData?.title) {
        setProjectName(initialData.title.split('–')[0].trim());
    }
  }, [initialData]);

  useEffect(() => {
    if (!initialData && formData.city && projectName && formData.microLocation) {
      const cityCode = (formData.city.slice(0, 3)).toUpperCase();
      const projCode = (projectName.slice(0, 3)).toUpperCase();
      setId(`IMP-${cityCode}-${projCode}`);
      
      const formattedTitle = `${projectName} – ${formData.microLocation}, ${formData.city}`;
      setFormData(prev => ({ ...prev, title: formattedTitle }));
    }
  }, [projectName, formData.city, formData.microLocation, initialData]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setFormData(prev => {
          const newImages = [...(prev.images || [])];
          newImages[index] = base64;
          return { ...prev, images: newImages };
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = (index: number) => {
    setFormData(prev => {
      const newImages = [...(prev.images || [])];
      newImages.splice(index, 1);
      return { ...prev, images: newImages.filter(Boolean) };
    });
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

  const removeAmenity = (amenity: string) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities?.filter(a => a !== amenity)
    }));
  };

  const handleDocUpload = (e: React.ChangeEvent<HTMLInputElement>, type: ProjectDocument['type'], label: string) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        const newDoc: ProjectDocument = { label, type, url: reader.result as string };
        setFormData(prev => {
          const filteredDocs = (prev.documents || []).filter(d => d.type !== type);
          return { ...prev, documents: [...filteredDocs, newDoc] };
        });
      };
      reader.readAsDataURL(file);
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

  const removeConfig = (index: number) => {
    setFormData(prev => ({
      ...prev,
      configurations: (prev.configurations || []).filter((_, i) => i !== index)
    }));
  };

  const inputClass = "w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all dark:text-white text-sm";

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 z-[60]">
      <div className="bg-white dark:bg-slate-900 w-full max-w-5xl h-[90vh] rounded-[40px] shadow-2xl flex flex-col overflow-hidden border border-slate-800">
        
        {/* Header */}
        <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-950/50">
          <div>
            <h2 className="text-2xl font-black dark:text-white tracking-tight">{initialData ? 'Edit Asset' : 'New Project Deployment'}</h2>
            <div className="flex items-center gap-2 mt-1">
               <span className="text-xs font-mono text-slate-500 bg-slate-200 dark:bg-slate-800 px-2 py-0.5 rounded uppercase tracking-wider">{id || 'Draft'}</span>
               {formData.title && <span className="text-xs text-slate-400 font-medium truncate max-w-xs">{formData.title}</span>}
            </div>
          </div>
          <button onClick={onCancel} className="p-3 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full transition-colors dark:text-white">
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 space-y-10 custom-scrollbar pb-32">
           
           {/* Section 1: Core Identity */}
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

           {/* Section 2: Technical Specs (Card Parity) */}
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
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">RERA Registration ID</label>
                    <input type="text" value={formData.reraId} onChange={e => setFormData({...formData, reraId: e.target.value})} placeholder="PRM/KA/RERA..." className={inputClass} />
                 </div>
                 {formData.type === 'apartment' && (
                    <div className="animate-in slide-in-from-top-2">
                       <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Phase/Tower Count</label>
                       <input type="number" value={formData.towerCount || ''} onChange={e => setFormData({...formData, towerCount: Number(e.target.value)})} placeholder="Number of towers" className={inputClass} />
                    </div>
                 )}
                 <div className="md:col-span-2">
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Developer Name</label>
                    <input type="text" value={formData.developerName} onChange={e => setFormData({...formData, developerName: e.target.value})} className={inputClass} />
                 </div>
              </div>
           </section>

           {/* Section 3: Visuals */}
           <section>
              <div className="flex items-center gap-2 mb-6 text-purple-600 dark:text-purple-400">
                 <ImageIcon size={20} className="shrink-0" />
                 <h3 className="font-black text-sm uppercase tracking-widest">Project Visual Gallery</h3>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                 {[0, 1, 2, 3, 4].map((index) => {
                    const img = formData.images?.[index];
                    return (
                      <div key={index} className="relative aspect-video rounded-2xl overflow-hidden border-2 border-dashed border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 flex items-center justify-center group transition-all hover:border-blue-400">
                         {img ? (
                            <>
                               <img src={img} className="w-full h-full object-cover" />
                               <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                  <button onClick={() => removeImage(index)} className="p-2 bg-rose-500 text-white rounded-full shadow-lg transform scale-90 group-hover:scale-100 transition-transform">
                                     <Trash2 size={16} />
                                  </button>
                               </div>
                            </>
                         ) : (
                            <label className="w-full h-full flex flex-col items-center justify-center cursor-pointer group">
                               <Camera className="text-slate-400 group-hover:text-blue-500 transition-colors" size={24} />
                               <span className="text-[9px] font-black text-slate-500 uppercase mt-1">Slot {index + 1}</span>
                               <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, index)} />
                            </label>
                         )}
                      </div>
                    );
                 })}
              </div>
           </section>

           {/* Section 4: Narrative & Amenities */}
           <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                 <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Project Narrative</h3>
                 <textarea 
                    value={formData.description} 
                    onChange={e => setFormData({...formData, description: e.target.value})}
                    rows={5}
                    placeholder="Craft a compelling story for this luxury development..."
                    className={inputClass + " resize-none h-[180px]"}
                 />
              </div>
              <div>
                 <div className="flex items-center gap-2 mb-4">
                    <Sparkles size={16} className="text-emerald-500" />
                    <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Amenities & Lifestyle</h3>
                 </div>
                 <div className="space-y-4">
                    <input 
                       type="text" 
                       value={newAmenity}
                       onChange={e => setNewAmenity(e.target.value)}
                       onKeyDown={handleAddAmenity}
                       placeholder="Type and press Enter (e.g. Zen Garden)"
                       className={inputClass}
                    />
                    <div className="flex flex-wrap gap-2 max-h-[120px] overflow-y-auto p-1">
                       {formData.amenities?.map(amenity => (
                          <span key={amenity} className="px-3 py-1.5 bg-white dark:bg-slate-800 text-slate-700 dark:text-white rounded-xl text-xs font-bold border border-slate-200 dark:border-slate-700 flex items-center gap-2 group animate-in zoom-in-90">
                             {amenity}
                             <button onClick={() => removeAmenity(amenity)} className="text-slate-400 hover:text-rose-500 transition-colors">
                                <X size={14} />
                             </button>
                          </span>
                       ))}
                    </div>
                 </div>
              </div>
           </section>

           {/* Section 5: Inventory Configuration */}
           <section>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
                   <LayoutGrid size={20} className="shrink-0" />
                   <h3 className="font-black text-sm uppercase tracking-widest">Unit Inventory</h3>
                </div>
                <button type="button" onClick={addConfiguration} className="px-4 py-2 bg-slate-900 dark:bg-blue-600 text-white text-xs font-black rounded-xl flex items-center gap-2 hover:bg-slate-800 transition-all shadow-lg">
                  <Plus size={16} /> Add Configuration
                </button>
              </div>
              <div className="space-y-4">
                {(formData.configurations || []).map((config, index) => (
                  <div key={config.id} className="bg-white dark:bg-slate-800/50 p-6 rounded-[32px] border border-slate-100 dark:border-slate-800 flex flex-wrap gap-6 items-end shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex-1 min-w-[240px]">
                      <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Config Type</label>
                      <input type="text" value={config.name} onChange={e => updateConfig(index, 'name', e.target.value)} placeholder="e.g. 4.5 BHK Grande" className={inputClass} />
                    </div>
                    <div className="w-28">
                      <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Area (Sqft)</label>
                      <input type="number" value={config.size} onChange={e => updateConfig(index, 'size', Number(e.target.value))} className={inputClass} />
                    </div>
                    <div className="w-32">
                      <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Starting (₹)</label>
                      <input type="number" value={config.price} onChange={e => updateConfig(index, 'price', Number(e.target.value))} placeholder="Total Cr" className={inputClass} />
                    </div>
                    <div className="w-28">
                      <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Units</label>
                      <input type="number" value={config.totalUnits} onChange={e => updateConfig(index, 'totalUnits', Number(e.target.value))} className={inputClass} />
                    </div>
                    <button onClick={() => removeConfig(index)} className="p-3 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950 rounded-2xl transition-colors"><Trash2 size={20} /></button>
                  </div>
                ))}
                {(!formData.configurations || formData.configurations.length === 0) && (
                   <div className="py-10 text-center border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-[32px] text-slate-400 text-sm italic">
                      No configurations defined for this project.
                   </div>
                )}
              </div>
           </section>
        </div>

        {/* Action Footer */}
        <div className="p-8 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-4 bg-white dark:bg-slate-900 shrink-0 z-20 shadow-[0_-10px_20px_-15px_rgba(0,0,0,0.1)]">
           <button onClick={onCancel} className="px-8 py-3.5 font-black text-slate-500 hover:bg-slate-100 rounded-2xl transition-colors text-sm">Dismiss</button>
           <button onClick={() => onSave({...formData, id} as Property)} disabled={isSaving} className="px-12 py-3.5 bg-blue-600 text-white font-black rounded-2xl shadow-xl shadow-blue-500/20 flex items-center gap-3 hover:bg-blue-700 disabled:opacity-50 transition-all hover:-translate-y-0.5 active:translate-y-0 text-sm">
              {isSaving ? 'Processing...' : <><Save size={20} /> Commit Project</>}
           </button>
        </div>
      </div>
    </div>
  );
};

export default PropertyForm;
