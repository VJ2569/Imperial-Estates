
import React, { useState, useEffect } from 'react';
import { X, Save, Plus, Trash2, Building, MapPin, Calculator, FileText, Sparkles, LayoutGrid, Image as ImageIcon, Camera } from 'lucide-react';
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

  const inputClass = "w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all dark:text-white";

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-slate-900 w-full max-w-5xl h-[90vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-slate-800">
        
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center shrink-0 bg-slate-50/50 dark:bg-slate-950/50">
          <div>
            <h2 className="text-xl font-bold dark:text-white">{initialData ? 'Update Project' : 'New Real Estate Project'}</h2>
            <p className="text-xs text-slate-500 font-mono">{id || 'Drafting...'}</p>
          </div>
          <button onClick={onCancel} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors dark:text-white">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 space-y-12 custom-scrollbar pb-24">
           
           <section>
              <div className="flex items-center gap-2 mb-6 text-blue-600 dark:text-blue-400">
                 <Building size={20} />
                 <h3 className="font-bold text-sm uppercase tracking-widest">Project Identity</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                 <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Project Name</label>
                    <input type="text" value={projectName} onChange={e => setProjectName(e.target.value)} placeholder="e.g. Imperial Skyvistas" className={inputClass} required />
                 </div>
                 <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Property Type</label>
                    <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value as ProjectType})} className={inputClass}>
                       <option value="apartment">Apartment</option>
                       <option value="villa">Villa</option>
                       <option value="commercial">Commercial</option>
                    </select>
                 </div>
                 <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">City</label>
                    <input type="text" value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} className={inputClass} required />
                 </div>
                 <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Micro-Location</label>
                    <input type="text" value={formData.microLocation} onChange={e => setFormData({...formData, microLocation: e.target.value})} className={inputClass} required />
                 </div>
                 <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Land Area / Project Size</label>
                    <input type="text" value={formData.totalProjectSize} onChange={e => setFormData({...formData, totalProjectSize: e.target.value})} placeholder="e.g. 10 Acres" className={inputClass} required />
                 </div>
                 {formData.type === 'apartment' && (
                    <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                       <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Towers / Phases</label>
                       <input type="number" value={formData.towerCount || ''} onChange={e => setFormData({...formData, towerCount: Number(e.target.value)})} placeholder="e.g. 4 Towers" className={inputClass} />
                    </div>
                 )}
              </div>
           </section>

           <section>
              <div className="flex items-center gap-2 mb-6 text-blue-600 dark:text-blue-400">
                 <ImageIcon size={20} />
                 <h3 className="font-bold text-sm uppercase tracking-widest">Project Visuals (Up to 5 Images)</h3>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                 {[0, 1, 2, 3, 4].map((index) => {
                    const img = formData.images?.[index];
                    return (
                      <div key={index} className="relative aspect-video rounded-xl overflow-hidden border-2 border-dashed border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 flex items-center justify-center group">
                         {img ? (
                            <>
                               <img src={img} className="w-full h-full object-cover" />
                               <button 
                                 onClick={() => removeImage(index)}
                                 className="absolute top-2 right-2 p-1.5 bg-rose-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                               >
                                  <X size={12} />
                               </button>
                            </>
                         ) : (
                            <label className="w-full h-full flex flex-col items-center justify-center cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                               <Camera className="text-slate-400 mb-1" size={24} />
                               <span className="text-[10px] font-bold text-slate-500 uppercase">Slot {index + 1}</span>
                               <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, index)} />
                            </label>
                         )}
                      </div>
                    );
                 })}
              </div>
           </section>

           <section>
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Project Narrative</h3>
              <textarea 
                 value={formData.description} 
                 onChange={e => setFormData({...formData, description: e.target.value})}
                 rows={4}
                 placeholder="Craft a compelling story for this development..."
                 className={inputClass + " resize-none"}
              />
           </section>

           <section>
              <div className="flex items-center gap-2 mb-6 text-emerald-600 dark:text-emerald-400">
                 <Sparkles size={20} />
                 <h3 className="font-bold text-sm uppercase tracking-widest">Amenities & Highlights</h3>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
                 <input 
                    type="text" 
                    value={newAmenity}
                    onChange={e => setNewAmenity(e.target.value)}
                    onKeyDown={handleAddAmenity}
                    placeholder="Type amenity and press Enter (e.g. Swimming Pool, Yoga Deck)"
                    className={inputClass}
                 />
                 <div className="flex flex-wrap gap-2 mt-4">
                    {formData.amenities?.map(amenity => (
                       <span key={amenity} className="px-3 py-1.5 bg-white dark:bg-slate-700 text-slate-800 dark:text-white rounded-xl text-xs font-bold border border-slate-200 dark:border-slate-600 flex items-center gap-2 group">
                          {amenity}
                          <button onClick={() => removeAmenity(amenity)} className="text-slate-400 hover:text-rose-500 transition-colors">
                             <X size={14} />
                          </button>
                       </span>
                    ))}
                 </div>
              </div>
           </section>

           <section>
              <div className="flex items-center gap-2 mb-6 text-rose-600 dark:text-rose-400">
                 <FileText size={20} />
                 <h3 className="font-bold text-sm uppercase tracking-widest">Project Documents</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                 {[
                   { id: 'brochure', label: 'E-Brochure', type: 'brochure' },
                   { id: 'floor_plan', label: 'Floor Plans', type: 'floor_plan' },
                   { id: 'price_list', label: 'Price List', type: 'price_list' }
                 ].map(docSlot => {
                    const existing = formData.documents?.find(d => d.type === docSlot.type);
                    return (
                      <div key={docSlot.id} className="relative group">
                         <label className={`w-full h-32 border-2 border-dashed ${existing ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/10' : 'border-slate-300 dark:border-slate-700'} rounded-2xl flex flex-col items-center justify-center cursor-pointer transition-all hover:border-blue-400`}>
                            <FileText className={existing ? 'text-emerald-500' : 'text-slate-400'} size={24} />
                            <span className="text-[10px] font-bold text-slate-500 mt-2 uppercase">{docSlot.label}</span>
                            {existing && <span className="text-[9px] text-emerald-600 font-bold mt-1">Uploaded</span>}
                            <input type="file" className="hidden" onChange={e => handleDocUpload(e, docSlot.type as any, docSlot.label)} />
                         </label>
                      </div>
                    );
                 })}
              </div>
           </section>

           <section>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
                   <LayoutGrid size={20} />
                   <h3 className="font-bold text-sm uppercase tracking-widest">Inventory Configurations</h3>
                </div>
                <button type="button" onClick={addConfiguration} className="px-3 py-1.5 bg-slate-900 dark:bg-slate-700 text-white text-xs font-bold rounded-lg flex items-center gap-2">
                  <Plus size={14} /> Add Unit Type
                </button>
              </div>
              <div className="space-y-4">
                {(formData.configurations || []).map((config, index) => (
                  <div key={config.id} className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-wrap gap-4 items-end">
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
                    <button onClick={() => removeConfig(index)} className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg"><Trash2 size={20} /></button>
                  </div>
                ))}
              </div>
           </section>
        </div>

        <div className="p-6 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3 bg-white dark:bg-slate-900 shrink-0">
           <button onClick={onCancel} className="px-6 py-2.5 font-bold text-slate-500 hover:bg-slate-100 rounded-xl">Cancel</button>
           <button onClick={() => onSave({...formData, id} as Property)} disabled={isSaving} className="px-8 py-2.5 bg-blue-600 text-white font-bold rounded-xl shadow-lg flex items-center gap-2 hover:bg-blue-700 disabled:opacity-50">
              {isSaving ? 'Processing...' : <><Save size={20} /> Save Project</>}
           </button>
        </div>
      </div>
    </div>
  );
};

export default PropertyForm;
