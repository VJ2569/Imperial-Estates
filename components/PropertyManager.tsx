import React, { useState, useEffect } from 'react';
import { Search, Plus, LayoutGrid, Filter, AlertTriangle, Share2, Scale } from 'lucide-react';
import PropertyCard from './PropertyCard';
import PropertyForm from './PropertyForm';
import PropertyDetails from './PropertyDetails';
import PropertyComparison from './PropertyComparison';
import { fetchProperties, createProperty, updateProperty, deleteProperty, getStoredProperties } from '../services/propertyService';
import { Property, PropertyType } from '../types';

interface PropertyManagerProps {
  readOnly?: boolean;
  onShare?: () => void;
}

const PropertyManager: React.FC<PropertyManagerProps> = ({ readOnly = false, onShare }) => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<PropertyType | 'all'>('all');
  
  // Modal States
  const [showForm, setShowForm] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);
  const [deleteConfirmationId, setDeleteConfirmationId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  
  // Comparison States
  const [compareList, setCompareList] = useState<Property[]>([]);
  const [showComparison, setShowComparison] = useState(false);
  
  // State for generated ID to ensure it remains stable during form interaction
  const [generatedId, setGeneratedId] = useState('');

  useEffect(() => {
    loadProperties();
  }, []);

  const loadProperties = async () => {
    // 1. Optimistic load from cache
    const cached = getStoredProperties();
    if (cached.length > 0) {
        setProperties(cached);
        setLoading(false);
    } else {
        // Only set loading true if we don't have cached data to show
        setLoading(true);
    }

    // 2. Network refresh
    const data = await fetchProperties();
    setProperties(data);
    setLoading(false);
  };

  const handleCreateOrUpdate = async (data: Property) => {
    setIsSaving(true);
    let success = false;
    
    if (editingProperty) {
      success = await updateProperty(data);
    } else {
      success = await createProperty(data);
    }

    if (success) {
      await loadProperties();
      setShowForm(false);
      setEditingProperty(null);
      if (selectedProperty && selectedProperty.id === data.id) {
        setSelectedProperty(data);
      }
    } else {
      console.error('Operation failed');
    }
    setIsSaving(false);
  };

  const requestDelete = (id: string) => {
    if (readOnly) return;
    setDeleteConfirmationId(id);
  };

  const executeDelete = async () => {
    if (!deleteConfirmationId || readOnly) return;
    const id = deleteConfirmationId;
    setProperties(prev => prev.filter(p => p.id !== id));
    if (selectedProperty?.id === id) setSelectedProperty(null);
    setDeleteConfirmationId(null);
    await deleteProperty(id);
  };

  const openAddForm = () => {
    if (readOnly) return;
    setEditingProperty(null);
    // Generate a robust unique ID
    const uniqueId = `PROP-${Date.now().toString().slice(-6)}${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;
    setGeneratedId(uniqueId);
    setShowForm(true);
  };

  const openEditForm = (property: Property) => {
    if (readOnly) return;
    setEditingProperty(property);
    setSelectedProperty(null);
    setShowForm(true);
  };

  const toggleCompare = (property: Property) => {
      setCompareList(prev => {
          const exists = prev.find(p => p.id === property.id);
          if (exists) {
              return prev.filter(p => p.id !== property.id);
          } else {
              if (prev.length >= 3) return prev; // Max 3
              return [...prev, property];
          }
      });
  };

  const filteredProperties = properties.filter(prop => {
    const matchesType = selectedType === 'all' || prop.type === selectedType;
    const matchesSearch = 
      prop.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prop.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prop.id.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto w-full relative">
      {/* Header Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 md:mb-8">
         <div>
            <h2 className="text-xl md:text-2xl font-bold text-gray-900">Property Inventory</h2>
            <p className="text-gray-500 text-xs md:text-sm mt-1">
              {readOnly ? 'Viewing listings available for clients' : 'Manage your listings and availability'}
            </p>
         </div>
         
         {!readOnly && (
           <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
             {onShare && (
                <button
                  onClick={onShare}
                  className="bg-blue-600 text-white px-5 py-2.5 rounded-xl hover:bg-blue-700 transition-colors font-semibold shadow-lg shadow-blue-200 flex items-center justify-center gap-2 text-sm w-full sm:w-auto"
                >
                  <Share2 size={18} />
                  Share
                </button>
             )}
             <button
                onClick={openAddForm}
                className="bg-blue-600 text-white px-5 py-2.5 rounded-xl hover:bg-blue-700 transition-colors font-semibold shadow-lg shadow-blue-200 flex items-center justify-center gap-2 text-sm w-full sm:w-auto"
              >
                <Plus size={18} />
                Add Property
              </button>
           </div>
         )}
      </div>

      {/* Filters */}
      <div className="mb-6 md:mb-8 space-y-4 bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="relative flex-1 group">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" size={20} />
              <input
                type="text"
                placeholder="Search properties..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              />
            </div>
            
            <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 custom-scrollbar hide-scrollbar-mobile">
               <Filter size={18} className="text-gray-400 shrink-0 hidden md:block" />
               {(['all', 'apartment', 'villa', 'commercial'] as const).map((type) => (
                  <button
                    key={type}
                    onClick={() => setSelectedType(type)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap capitalize shrink-0 ${
                      selectedType === type 
                        ? 'bg-slate-800 text-white' 
                        : 'bg-white text-slate-600 border border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    {type}
                  </button>
               ))}
            </div>
          </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white h-96 rounded-xl shadow-sm border border-gray-100"></div>
          ))}
        </div>
      ) : filteredProperties.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 pb-24">
          {filteredProperties.map(property => (
            <PropertyCard
              key={property.id}
              property={property}
              onEdit={openEditForm}
              onDelete={requestDelete}
              onViewDetails={setSelectedProperty}
              readOnly={readOnly}
              onToggleCompare={toggleCompare}
              isSelectedForCompare={compareList.some(p => p.id === property.id)}
              disableCompare={compareList.length >= 3}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 md:p-16 text-center flex flex-col items-center justify-center">
          <div className="bg-gray-50 p-4 rounded-full mb-4">
             <LayoutGrid size={48} className="text-gray-300" />
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">No properties found</h3>
          <p className="text-gray-500 max-w-md mx-auto text-sm md:text-base">
            We couldn't find any properties matching your search.
          </p>
          <button 
            onClick={() => { setSearchQuery(''); setSelectedType('all'); }}
            className="mt-6 text-blue-600 font-medium hover:underline"
          >
            Clear all filters
          </button>
        </div>
      )}

      {/* Floating Compare Button */}
      {compareList.length > 0 && (
          <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-40 animate-in slide-in-from-bottom-10 fade-in">
              <button
                  onClick={() => setShowComparison(true)}
                  className="bg-slate-900 text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 hover:bg-slate-800 transition-transform hover:scale-105 active:scale-95"
              >
                  <Scale size={20} />
                  <span className="font-bold">Compare ({compareList.length})</span>
              </button>
          </div>
      )}

      {/* Modals */}
      {showForm && !readOnly && (
        <PropertyForm
          key={editingProperty ? editingProperty.id : generatedId}
          initialData={editingProperty}
          newId={generatedId}
          onSave={handleCreateOrUpdate}
          onCancel={() => setShowForm(false)}
          isSaving={isSaving}
        />
      )}

      {selectedProperty && (
        <PropertyDetails
          property={selectedProperty}
          onClose={() => setSelectedProperty(null)}
          onEdit={() => openEditForm(selectedProperty)}
          readOnly={readOnly}
        />
      )}

      {showComparison && (
          <PropertyComparison 
              properties={compareList} 
              onClose={() => {
                  setShowComparison(false);
                  setCompareList([]);
              }} 
          />
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmationId && !readOnly && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-sm w-full shadow-2xl p-6 animate-in fade-in zoom-in duration-200">
             <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 bg-rose-100 rounded-full flex items-center justify-center mb-4">
                  <AlertTriangle className="text-rose-600" size={24} />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">Delete Property?</h3>
                <p className="text-slate-600 mb-6 text-sm">
                  Are you sure you want to delete this property? This action cannot be undone.
                </p>
                <div className="flex gap-3 w-full">
                  <button 
                    onClick={() => setDeleteConfirmationId(null)} 
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={executeDelete} 
                    className="flex-1 px-4 py-2 bg-rose-600 text-white rounded-lg font-medium hover:bg-rose-700 transition-colors shadow-lg shadow-rose-200"
                  >
                    Delete
                  </button>
                </div>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PropertyManager;
