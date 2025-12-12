import React, { useState, useEffect } from 'react';
import { X, Save, Image as ImageIcon } from 'lucide-react';
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
    ...initialData
  });

  const [imageInputs, setImageInputs] = useState<string[]>(['', '', '', '', '']);
  const [id, setId] = useState<string>(initialData?.id || newId || '');

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
      setId(initialData.id);
      const existingImages = initialData.images || [];
      const newInputs = ['', '', '', '', ''];
      existingImages.forEach((img, idx) => {
        if (idx < 5) newInputs[idx] = img;
      });
      setImageInputs(newInputs);
    } else if (newId) {
      setFormData(prev => ({ ...prev, title: '', location: '' })); 
      setId(newId);
      setImageInputs(['', '', '', '', '']);
    }
  }, [initialData, newId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validImages = imageInputs.filter(img => img.trim() !== '');
    await onSave({ ...formData, id, images: validImages });
  };

  const handleChange = (field: keyof PropertyFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleImageChange = (index: number, value: string) => {
    const newInputs = [...imageInputs];
    newInputs[index] = value;
    setImageInputs(newInputs);
  };

  const inputClass = "w-full px-4 py-2.5 bg-slate-50 focus:bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all placeholder:text-slate-400";

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-end md:items-center justify-center p-0 md:p-4 z-50">
      <div className="bg-white w-full h-full md:h-auto md:max-h-[90vh] md:max-w-4xl md:rounded-2xl shadow-2xl flex flex-col animate-in slide-in-from-bottom-10 md:fade-in md:zoom-in duration-200">
        
        {/* Header */}
        <div className="px-4 md:px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50 md:rounded-t-2xl shrink-0">
          <div>
            <h2 className="text-lg md:text-xl font-bold text-slate-800">{initialData ? 'Edit Property' : 'Add New Property'}</h2>
            <p className="text-slate-500 text-xs md:text-sm mt-0.5">Fill in the details below to {initialData ? 'update' : 'create'} a listing.</p>
          </div>
          <button onClick={onCancel} className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-200 transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="p-4 md:p-8 overflow-y-auto custom-scrollbar flex-1">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
            
            {/* ID - Read Only */}
            <div className="col-span-1 md:col-span-2">
               <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Property ID</label>
               <div className="bg-slate-200 text-slate-700 px-4 py-2.5 rounded-lg font-mono text-sm border border-slate-300 w-full md:w-1/3 shadow-inner">
                 {id}
               </div>
            </div>

            <div className="col-span-1 md:col-span-2">
               <h3 className="text-sm font-bold text-slate-900 border-b pb-2 mb-4">Basic Information</h3>
            </div>

            <div className="col-span-1 md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Title <span className="text-red-500">*</span></label>
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
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Type</label>
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
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Status</label>
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
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Location <span className="text-red-500">*</span></label>
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
               <h3 className="text-sm font-bold text-slate-900 border-b pb-2 mb-4">Details & Financials</h3>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Price (₹) <span className="text-red-500">*</span></label>
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
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Area (sqft)</label>
              <input
                type="number"
                value={formData.area || ''}
                onChange={(e) => handleChange('area', Number(e.target.value))}
                className={inputClass}
                min="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Bedrooms</label>
              <input
                type="number"
                value={formData.bedrooms || ''}
                onChange={(e) => handleChange('bedrooms', Number(e.target.value))}
                className={inputClass}
                min="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Bathrooms</label>
              <input
                type="number"
                value={formData.bathrooms || ''}
                onChange={(e) => handleChange('bathrooms', Number(e.target.value))}
                className={inputClass}
                min="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Available From</label>
              <input
                type="date"
                value={formData.availableFrom}
                onChange={(e) => handleChange('availableFrom', e.target.value)}
                className={inputClass}
              />
            </div>

             <div className="flex items-end pb-3">
              <label className="flex items-center cursor-pointer select-none bg-slate-50 px-4 py-2.5 rounded-lg border border-slate-200 w-full hover:bg-slate-100 transition-colors">
                <input
                  type="checkbox"
                  checked={formData.isRental}
                  onChange={(e) => handleChange('isRental', e.target.checked)}
                  className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="ml-3 text-sm font-medium text-slate-700">Is this a rental property?</span>
              </label>
            </div>

            <div className="col-span-1 md:col-span-2 mt-2">
               <h3 className="text-sm font-bold text-slate-900 border-b pb-2 mb-4">Property Images (Max 5)</h3>
            </div>

            <div className="col-span-1 md:col-span-2 space-y-3">
              {imageInputs.map((url, idx) => (
                <div key={idx} className="flex gap-2 items-center">
                   <div className="bg-slate-100 p-2 rounded text-slate-500 shrink-0">
                      <ImageIcon size={18} />
                   </div>
                   <input
                      type="text"
                      value={url}
                      onChange={(e) => handleImageChange(idx, e.target.value)}
                      className={inputClass}
                      placeholder={`Image URL ${idx + 1}`}
                   />
                </div>
              ))}
              <p className="text-xs text-slate-500 ml-1">Provide direct links to images</p>
            </div>

             <div className="col-span-1 md:col-span-2 mt-2">
               <h3 className="text-sm font-bold text-slate-900 border-b pb-2 mb-4">Marketing</h3>
            </div>

            <div className="col-span-1 md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                rows={4}
                className={inputClass}
                placeholder="Describe the property highlights..."
              />
            </div>

            <div className="col-span-1 md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Features & Amenities</label>
              <input
                type="text"
                value={formData.features}
                onChange={(e) => handleChange('features', e.target.value)}
                placeholder="Swimming Pool, Gym, Parking, 24/7 Security"
                className={inputClass}
              />
              <p className="text-xs text-slate-500 mt-1">Separate features with commas</p>
            </div>

          </div>
        </form>

        {/* Footer Actions */}
        <div className="px-4 md:px-8 py-4 border-t border-gray-100 bg-gray-50 md:rounded-b-2xl shrink-0 flex gap-3">
           <button
            type="button"
            onClick={onCancel}
            className="flex-1 px-4 md:px-6 py-3 border border-slate-300 text-slate-700 font-semibold rounded-xl hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSaving}
            className={`flex-1 px-4 md:px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-all flex items-center justify-center gap-2 ${isSaving ? 'opacity-70 cursor-not-allowed' : 'shadow-lg shadow-blue-200'}`}
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
