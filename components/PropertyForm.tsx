
import React, { useState, useEffect } from 'react';
import { X, Save, Plus, Trash2, Building, MapPin, Calculator } from 'lucide-react';
import { Property, PropertyFormData, Configuration, ProjectStatus, ProjectType } from '../types';

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
    ...initialData
  });

  const [projectName, setProjectName] = useState('');
  const [id, setId] = useState(initialData?.id || '');

  useEffect(() => {
    if (initialData?.title) {
        setProjectName(initialData.title.split('–')[0].trim());
    }
  }, [initialData]);

  // Generate ID and Format Title
  useEffect(() => {
    if (!initialData && formData.city && projectName && formData.microLocation) {
      const cityCode = (formData.city.slice(0, 3)).toUpperCase();
      const projCode = (projectName.slice(0, 3)).toUpperCase();
      setId(`IMP-${cityCode}-${projCode}`);
      
      const formattedTitle = `${projectName} – ${formData.microLocation}, ${formData.city}`;
      setFormData(prev => ({ ...prev, title: formattedTitle }));
    }
  }, [projectName, formData.city, formData.microLocation, initialData]);

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

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      Array.from(e.target.files).forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setFormData(prev => ({
            ...prev,
            images: [...(prev.images || []), reader.result as string]
          }));
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const inputClass = "w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all dark:text-white";

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-slate-900 w-full max-w-5xl h-[90vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-slate-800">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center shrink-0 bg-slate-50/50 dark:bg-slate-950/50">
          <div>
            <h2 className="text-xl font-bold dark:text-white">{initialData ? 'Update Project' : 'New Real Estate Project'}</h2>
            <p className="text-xs text-slate-500 font-mono">{id || 'Drafting...'}</p>
          </div>
          <button onClick={onCancel} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors dark:text-white">
            <X size={20} />
          </button>
        </div>

        {/* Form Body */}
        <div className="flex-1 overflow-y-auto p-8 space-y-10 custom-scrollbar">
           
           {/* Section 1: Project Identity */}
           <section>
              <div className="flex items-center gap-2 mb-6 text-blue-600 dark:text-blue-400">
                 <Building size={20} />
                 <h3 className="font-bold text-sm uppercase tracking-widest">Project Identity</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                 <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Project Name</label>
                    <input 
                      type="text" 
                      value={projectName} 
                      onChange={e => setProjectName(e.target.value)} 
                      placeholder="e.g. Imperial Skyvistas"
                      className={inputClass}
                      required
                    />
                 </div>
                 <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Developer</label>
                    <input 
                      type="text" 
                      value={formData.developerName} 
                      onChange={e => setFormData({...formData, developerName: e.target.value})} 
                      className={inputClass}
                    />
                 </div>
                 <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">City</label>
                    <input 
                      type="text" 
                      value={formData.city} 
                      onChange={e => setFormData({...formData, city: e.target.value})} 
                      placeholder="Pune"
                      className={inputClass}
                      required
                    />
                 </div>
                 <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Micro-Location</label>
                    <input 
                      type="text" 
                      value={formData.microLocation} 
                      onChange={e => setFormData({...formData, microLocation: e.target.value})} 
                      placeholder="Baner"
                      className={inputClass}
                      required
                    />
                 </div>
                 <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Property Type</label>
                    <select 
                      value={formData.type} 
                      onChange={e => setFormData({...formData, type: e.target.value as ProjectType})}
                      className={inputClass}
                    >
                       <option value="apartment">Apartment</option>
                       <option value="villa">Villa</option>
                       <option value="commercial">Commercial</option>
                    </select>
                 </div>
              </div>
           </section>

           {/* Section 2: Technicals */}
           <section>
              <div className="flex items-center gap-2 mb-6 text-emerald-600 dark:text-emerald-400">
                 <MapPin size={20} />
                 <h3 className="font-bold text-sm uppercase tracking-widest">Project Scope & Status</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                 <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Status</label>
                    <select 
                      value={formData.projectStatus} 
                      onChange={e => setFormData({...formData, projectStatus: e.target.value as ProjectStatus})}
                      className={inputClass}
                    >
                       <option value="pre-launch">Pre-launch</option>
                       <option value="under-construction">Under Construction</option>
                       <option value="ready">Ready to Move</option>
                    </select>
                 </div>
                 <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Total Size (Acres/Sqft)</label>
                    <input type="text" value={formData.totalProjectSize} onChange={e => setFormData({...formData, totalProjectSize: e.target.value})} className={inputClass} placeholder="5 Acres" />
                 </div>
                 <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Timeline / Possession</label>
                    <input type="text" value={formData.timeline} onChange={e => setFormData({...formData, timeline: e.target.value})} className={inputClass} placeholder="Dec 2026" />
                 </div>
                 <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">RERA ID</label>
                    <input type="text" value={formData.reraId} onChange={e => setFormData({...formData, reraId: e.target.value})} className={inputClass} placeholder="P521000..." />
                 </div>
              </div>
           </section>

           {/* Section 3: Configurations */}
           <section>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
                   <Calculator size={20} />
                   <h3 className="font-bold text-sm uppercase tracking-widest">Inventory Configurations</h3>
                </div>
                <button 
                  type="button" 
                  onClick={addConfiguration}
                  className="px-3 py-1.5 bg-slate-900 dark:bg-slate-700 text-white text-xs font-bold rounded-lg flex items-center gap-2 hover:bg-slate-800 transition-colors"
                >
                  <Plus size={14} /> Add Unit Type
                </button>
              </div>

              <div className="space-y-4">
                {(formData.configurations || []).map((config, index) => (
                  <div key={config.id} className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-wrap gap-4 items-end animate-in fade-in slide-in-from-top-2">
                    <div className="flex-1 min-w-[200px]">
                      <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5">Config Name</label>
                      <input type="text" value={config.name} onChange={e => updateConfig(index, 'name', e.target.value)} placeholder="3 BHK – Type A" className={inputClass} />
                    </div>
                    <div className="w-24">
                      <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5">Size (Sqft)</label>
                      <input type="number" value={config.size} onChange={e => updateConfig(index, 'size', Number(e.target.value))} className={inputClass} />
                    </div>
                    <div className="w-24">
                      <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5">Price (₹)</label>
                      <input type="number" value={config.price} onChange={e => updateConfig(index, 'price', Number(e.target.value))} className={inputClass} />
                    </div>
                    <div className="w-24">
                      <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5">Total Units</label>
                      <input type="number" value={config.totalUnits} onChange={e => updateConfig(index, 'totalUnits', Number(e.target.value))} className={inputClass} />
                    </div>
                    <button onClick={() => removeConfig(index)} className="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg">
                      <Trash2 size={20} />
                    </button>
                  </div>
                ))}
              </div>
           </section>

           {/* Section 4: Images */}
           <section>
              <h3 className="font-bold text-sm uppercase tracking-widest text-slate-600 mb-4">Project Visuals</h3>
              <div className="flex gap-4 items-center">
                 <label className="w-32 h-32 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 transition-colors">
                    <Plus className="text-slate-400" />
                    <span className="text-[10px] font-bold text-slate-400 mt-2">Upload</span>
                    <input type="file" multiple accept="image/*" onChange={handleImageUpload} className="hidden" />
                 </label>
                 <div className="flex gap-2 overflow-x-auto pb-2 flex-1">
                    {formData.images?.map((img, idx) => (
                      <div key={idx} className="relative w-32 h-32 rounded-2xl overflow-hidden shrink-0 group">
                         <img src={img} className="w-full h-full object-cover" />
                         <button 
                           onClick={() => setFormData({...formData, images: formData.images?.filter((_, i) => i !== idx)})}
                           className="absolute inset-0 bg-rose-500/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white"
                         >
                            <Trash2 size={20} />
                         </button>
                      </div>
                    ))}
                 </div>
              </div>
           </section>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3 bg-white dark:bg-slate-900 shrink-0">
           <button onClick={onCancel} className="px-6 py-2.5 font-bold text-slate-500 hover:bg-slate-100 rounded-xl">Cancel</button>
           <button 
             onClick={() => onSave({...formData, id} as Property)}
             disabled={isSaving}
             className="px-8 py-2.5 bg-blue-600 text-white font-bold rounded-xl shadow-lg shadow-blue-200 flex items-center gap-2 hover:bg-blue-700 disabled:opacity-50"
           >
              {isSaving ? 'Processing...' : <><Save size={20} /> Save Project</>}
           </button>
        </div>
      </div>
    </div>
  );
};

export default PropertyForm;
