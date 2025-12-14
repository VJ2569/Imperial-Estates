import React, { useState, useEffect, useRef } from 'react';
import { X, Save, Image as ImageIcon, UploadCloud, FileText, Trash2, Plus } from 'lucide-react';
import { Property, PropertyFormData, PropertyStatus, PropertyType } from '../types';

interface PropertyFormProps {
  initialData?: Property | null;
  newId?: string;
  onSave: (data: Property) => Promise<void>;
  onCancel: () => void;
  isSaving: boolean;
}

const PropertyForm: React.FC<PropertyFormProps> = ({ initialData, newId, onSave, onCancel, isSaving }) => {
  const [formData, setFormData] = useState<PropertyFormData>({
    title: '',
    type: 'apartment',
    location: '',
    price: 0,
    status: 'available',
    bedrooms: 0,
    bathrooms: 0,
    area: 0,
    description: '',
    features: '',
    availableFrom: new Date().toISOString().split('T')[0],
    isRental: false,
    images: [],
    pdfs: [],
    ...initialData
  });

  const [id, setId] = useState<string>(initialData?.id || newId || '');
  const [dragActive, setDragActive] = useState(false);
  const [pdfDragActive, setPdfDragActive] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
      setId(initialData.id);
    } else if (newId) {
      setFormData(prev => ({ ...prev, title: '', location: '', images: [], pdfs: [] })); 
      setId(newId);
    }
  }, [initialData, newId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSave({ ...formData, id });
  };

  const handleChange = (field: keyof PropertyFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'pdf') => {
    if (e.target.files && e.target.files.length > 0) {
      await processFiles(Array.from(e.target.files), type);
    }
  };

  const processFiles = async (files: File[], type: 'image' | 'pdf') => {
    const processedFiles: string[] = [];
    
    // Limits
    const maxFiles = type === 'image' ? 5 : 3;
    const currentCount = type === 'image' ? (formData.images?.length || 0) : (formData.pdfs?.length || 0);
    const remaining = maxFiles - currentCount;
    
    if (remaining <= 0) {
        alert(`Maximum ${maxFiles} ${type}s allowed.`);
        return;
    }

    const filesToProcess = files.slice(0, remaining);

    for (const file of filesToProcess) {
       // Validate types
       if (type === 'image' && !file.type.startsWith('image/')) continue;
       if (type === 'pdf' && file.type !== 'application/pdf') continue;

       // Convert to Base64
       try {
           const base64 = await fileToBase64(file);
           processedFiles.push(base64);
       } catch (err) {
           console.error("Error reading file", err);
       }
    }

    if (processedFiles.length > 0) {
        if (type === 'image') {
            setFormData(prev => ({ ...prev, images: [...(prev.images || []), ...processedFiles] }));
        } else {
            setFormData(prev => ({ ...prev, pdfs: [...(prev.pdfs || []), ...processedFiles] }));
        }
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
      return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.readAsDataURL(file);
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = error => reject(error);
      });
  };

  // Drag and Drop Handlers
  const handleDrag = (e: React.DragEvent, setDrag: (val: boolean) => void) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDrag(true);
    } else if (e.type === "dragleave") {
      setDrag(false);
    }
  };

  const handleDrop = async (e: React.DragEvent, type: 'image' | 'pdf', setDrag: (val: boolean) => void) => {
    e.preventDefault();
    e.stopPropagation();
    setDrag(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        await processFiles(Array.from(e.dataTransfer.files), type);
    }
  };

  const removeFile = (index: number, type: 'image' | 'pdf') => {
      if (type === 'image') {
          setFormData(prev => ({ ...prev, images: (prev.images || []).filter((_, i) => i !== index) }));
      } else {
          setFormData(prev => ({ ...prev, pdfs: (prev.pdfs || []).filter((_, i) => i !== index) }));
      }
  };

  const inputClass = "w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 focus:bg-white dark:focus:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500 text-slate-900 dark:text-white";

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-end md:items-center justify-center p-0 md:p-4 z-50">
      <div className="bg-white dark:bg-slate-900 w-full h-full md:h-auto md:max-h-[90vh] md:max-w-4xl md:rounded-2xl shadow-2xl flex flex-col animate-in slide-in-from-bottom-10 md:fade-in md:zoom-in duration-200 border border-transparent dark:border-slate-800">
        
        {/* Header */}
        <div className="px-4 md:px-6 py-4 border-b border-gray-100 dark:border-slate-800 flex justify-between items-center bg-gray-50 dark:bg-slate-950 md:rounded-t-2xl shrink-0">
          <div>
            <h2 className="text-lg md:text-xl font-bold text-slate-800 dark:text-white">{initialData ? 'Edit Property' : 'Add New Property'}</h2>
            <p className="text-slate-500 dark:text-slate-400 text-xs md:text-sm mt-0.5">Fill in the details below to {initialData ? 'update' : 'create'} a listing.</p>
          </div>
          <button onClick={onCancel} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1 rounded-full hover:bg-gray-200 dark:hover:bg-slate-800 transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="p-4 md:p-8 overflow-y-auto custom-scrollbar flex-1">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
            
            {/* ID - Read Only */}
            <div className="col-span-1 md:col-span-2">
               <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Property ID</label>
               <div className="bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-4 py-2.5 rounded-lg font-mono text-sm border border-slate-300 dark:border-slate-700 w-full md:w-1/3 shadow-inner">
                 {id}
               </div>
            </div>

            <div className="col-span-1 md:col-span-2">
               <h3 className="text-sm font-bold text-slate-900 dark:text-white border-b border-gray-200 dark:border-slate-800 pb-2 mb-4">Basic Information</h3>
            </div>

            <div className="col-span-1 md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Title <span className="text-red-500">*</span></label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleChange('title', e.target.value)}
                className={inputClass}
                placeholder="e.g. Luxury Penthouse in Downtown"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Type</label>
              <select
                value={formData.type}
                onChange={(e) => handleChange('type', e.target.value as PropertyType)}
                className={inputClass}
              >
                <option value="apartment">Apartment</option>
                <option value="villa">Villa</option>
                <option value="commercial">Commercial</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Status</label>
              <select
                value={formData.status}
                onChange={(e) => handleChange('status', e.target.value as PropertyStatus)}
                className={inputClass}
              >
                <option value="available">Available</option>
                <option value="sold">Sold</option>
                <option value="rented">Rented</option>
              </select>
            </div>

            <div className="col-span-1 md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Location <span className="text-red-500">*</span></label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => handleChange('location', e.target.value)}
                className={inputClass}
                placeholder="e.g. Sector 45, Gurugram"
                required
              />
            </div>

             <div className="col-span-1 md:col-span-2 mt-2">
               <h3 className="text-sm font-bold text-slate-900 dark:text-white border-b border-gray-200 dark:border-slate-800 pb-2 mb-4">Details & Financials</h3>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Price (₹) <span className="text-red-500">*</span></label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">₹</span>
                <input
                  type="number"
                  value={formData.price || ''}
                  onChange={(e) => handleChange('price', Number(e.target.value))}
                  className={`${inputClass} pl-8`}
                  required
                  min="0"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Area (sqft)</label>
              <input
                type="number"
                value={formData.area || ''}
                onChange={(e) => handleChange('area', Number(e.target.value))}
                className={inputClass}
                min="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Bedrooms</label>
              <input
                type="number"
                value={formData.bedrooms || ''}
                onChange={(e) => handleChange('bedrooms', Number(e.target.value))}
                className={inputClass}
                min="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Bathrooms</label>
              <input
                type="number"
                value={formData.bathrooms || ''}
                onChange={(e) => handleChange('bathrooms', Number(e.target.value))}
                className={inputClass}
                min="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Available From</label>
              <input
                type="date"
                value={formData.availableFrom}
                onChange={(e) => handleChange('availableFrom', e.target.value)}
                className={inputClass}
              />
            </div>

             <div className="flex items-end pb-3">
              <label className="flex items-center cursor-pointer select-none bg-slate-50 dark:bg-slate-800 px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 w-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                <input
                  type="checkbox"
                  checked={formData.isRental}
                  onChange={(e) => handleChange('isRental', e.target.checked)}
                  className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="ml-3 text-sm font-medium text-slate-700 dark:text-slate-300">Is this a rental property?</span>
              </label>
            </div>

            <div className="col-span-1 md:col-span-2 mt-2">
               <h3 className="text-sm font-bold text-slate-900 dark:text-white border-b border-gray-200 dark:border-slate-800 pb-2 mb-4">Media & Documents</h3>
            </div>

            {/* Image Upload Section */}
            <div className="col-span-1 md:col-span-2 space-y-3">
               <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Property Images (Max 5)</label>
               
               <div 
                 className={`border-2 border-dashed rounded-xl p-6 text-center transition-all ${dragActive ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700'}`}
                 onDragEnter={(e) => handleDrag(e, setDragActive)}
                 onDragLeave={(e) => handleDrag(e, setDragActive)}
                 onDragOver={(e) => handleDrag(e, setDragActive)}
                 onDrop={(e) => handleDrop(e, 'image', setDragActive)}
               >
                  <UploadCloud size={32} className={`mx-auto mb-3 ${dragActive ? 'text-blue-500' : 'text-slate-400'}`} />
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Drag and drop images here, or</p>
                  <label className="cursor-pointer text-blue-600 dark:text-blue-400 hover:text-blue-700 font-semibold text-sm">
                      browse files
                      <input 
                        type="file" 
                        multiple 
                        accept="image/*" 
                        onChange={(e) => handleFileChange(e, 'image')} 
                        className="hidden" 
                      />
                  </label>
                  <p className="text-xs text-slate-400 mt-2">Supports JPG, PNG, WEBP (Max 5MB)</p>
               </div>

               {/* Image Preview List */}
               {formData.images && formData.images.length > 0 && (
                   <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mt-4">
                       {formData.images.map((img, idx) => (
                           <div key={idx} className="relative group aspect-square rounded-lg overflow-hidden border border-gray-200 dark:border-slate-700">
                               <img src={img} alt={`Preview ${idx}`} className="w-full h-full object-cover" />
                               <button 
                                 type="button"
                                 onClick={() => removeFile(idx, 'image')}
                                 className="absolute top-1 right-1 bg-black/60 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-rose-500"
                               >
                                   <X size={14} />
                               </button>
                           </div>
                       ))}
                   </div>
               )}
            </div>

            {/* PDF Upload Section */}
            <div className="col-span-1 md:col-span-2 space-y-3 mt-4">
               <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">PDF Documents (Max 3)</label>
               
               <div 
                 className={`border-2 border-dashed rounded-xl p-6 text-center transition-all ${pdfDragActive ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700'}`}
                 onDragEnter={(e) => handleDrag(e, setPdfDragActive)}
                 onDragLeave={(e) => handleDrag(e, setPdfDragActive)}
                 onDragOver={(e) => handleDrag(e, setPdfDragActive)}
                 onDrop={(e) => handleDrop(e, 'pdf', setPdfDragActive)}
               >
                  <FileText size={32} className={`mx-auto mb-3 ${pdfDragActive ? 'text-blue-500' : 'text-slate-400'}`} />
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Drag and drop PDFs here, or</p>
                  <label className="cursor-pointer text-blue-600 dark:text-blue-400 hover:text-blue-700 font-semibold text-sm">
                      browse files
                      <input 
                        type="file" 
                        multiple 
                        accept="application/pdf" 
                        onChange={(e) => handleFileChange(e, 'pdf')} 
                        className="hidden" 
                      />
                  </label>
                  <p className="text-xs text-slate-400 mt-2">Upload floor plans, brochures etc.</p>
               </div>

               {/* PDF Preview List */}
               {formData.pdfs && formData.pdfs.length > 0 && (
                   <div className="space-y-2 mt-4">
                       {formData.pdfs.map((pdf, idx) => (
                           <div key={idx} className="flex items-center justify-between p-3 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg">
                               <div className="flex items-center gap-3">
                                   <div className="bg-red-50 dark:bg-red-900/20 p-2 rounded text-red-500 dark:text-red-400">
                                       <FileText size={20} />
                                   </div>
                                   <div className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                       Document {idx + 1}
                                   </div>
                               </div>
                               <button 
                                 type="button"
                                 onClick={() => removeFile(idx, 'pdf')}
                                 className="text-slate-400 hover:text-rose-500 transition-colors"
                               >
                                   <Trash2 size={18} />
                               </button>
                           </div>
                       ))}
                   </div>
               )}
            </div>

             <div className="col-span-1 md:col-span-2 mt-2">
               <h3 className="text-sm font-bold text-slate-900 dark:text-white border-b border-gray-200 dark:border-slate-800 pb-2 mb-4">Marketing</h3>
            </div>

            <div className="col-span-1 md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                rows={4}
                className={inputClass}
                placeholder="Describe the property highlights..."
              />
            </div>

            <div className="col-span-1 md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Features & Amenities</label>
              <input
                type="text"
                value={formData.features}
                onChange={(e) => handleChange('features', e.target.value)}
                placeholder="Swimming Pool, Gym, Parking, 24/7 Security"
                className={inputClass}
              />
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Separate features with commas</p>
            </div>

          </div>
        </form>

        {/* Footer Actions */}
        <div className="px-4 md:px-8 py-4 border-t border-gray-100 dark:border-slate-800 bg-gray-50 dark:bg-slate-950 md:rounded-b-2xl shrink-0 flex gap-3">
           <button
            type="button"
            onClick={onCancel}
            className="flex-1 px-4 md:px-6 py-3 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSaving}
            className={`flex-1 px-4 md:px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-all flex items-center justify-center gap-2 ${isSaving ? 'opacity-70 cursor-not-allowed' : 'shadow-lg shadow-blue-200 dark:shadow-blue-900/20'}`}
          >
            {isSaving ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span className="hidden sm:inline">Saving...</span>
              </>
            ) : (
              <>
                <Save size={20} />
                <span>Save Property</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PropertyForm;
