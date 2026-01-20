import React, { useState, useEffect } from 'react';
import { Search, Plus, Filter, LayoutGrid, Share2, AlertTriangle, Scale, X } from 'lucide-react';
import PropertyCard from './PropertyCard';
import PropertyForm from './PropertyForm';
import PropertyDetails from './PropertyDetails';
import PropertyComparison from './PropertyComparison';
import { fetchProperties, createProperty, updateProperty, deleteProperty, getStoredProperties } from '../services/propertyService';
import { Property, ProjectType } from '../types';

interface PropertyManagerProps {
  readOnly?: boolean;
  onShare?: () => void;
}

const PropertyManager: React.FC<PropertyManagerProps> = ({ readOnly = false, onShare }) => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<ProjectType | 'all'>('all');
  
  // Modal & View States
  const [showForm, setShowForm] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);
  const [deleteConfirmationId, setDeleteConfirmationId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  
  // Comparison States
  const [compareList, setCompareList] = useState<Property[]>([]);
  const [showComparison, setShowComparison] = useState(false);

  useEffect(() => {
    loadProperties();
  }, []);

  const loadProperties = async () => {
    // 1. Optimistic load from local cache
    const cached = getStoredProperties();
    if (cached.length > 0) {
        setProperties(cached);
        setLoading(false);
    } else {
        setLoading(true);
    }

    // 2. Network refresh from webhook
    try {
      const data = await fetchProperties();
      setProperties(data);
    } catch (error) {
      console.error("Failed to refresh properties", error);
    } finally {
      setLoading(false);
    }
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
      alert('Operation failed. Please try again.');
    }
    setIsSaving(false);
  };

  const executeDelete = async () => {
    if (!deleteConfirmationId || readOnly) return;
    const id = deleteConfirmationId;
    
    // Optimistic UI update
    setProperties(prev => prev.filter(p => p.id !== id));
    setDeleteConfirmationId(null);
    if (selectedProperty?.id === id) setSelectedProperty(null);
    
    const success = await deleteProperty(id);
    if (!success) {
      alert('Failed to delete on server, but removed locally.');
      await loadProperties(); // Rollback/Refresh
    }
  };

  const openAddForm = () => {
    if (readOnly) return;
    setEditingProperty(null);
    setShowForm(true);
  };

  const handleEditFromDetails = () => {
    if (selectedProperty) {
      setEditingProperty(selectedProperty);
      setSelectedProperty(null);
      setShowForm(true);
    }
  };

  const toggleCompare = (property: Property) => {
      setCompareList(prev => {
          const exists = prev.find(p => p.id === property.id);
          if (exists) {
              return prev.filter(p => p.id !== property.id);
          } else {
              if (prev.length >= 3) return prev; // Max 3 projects for comparison
              return [...prev, property];
          }
      });
  };

  const filteredProperties = properties.filter(prop => {
    const matchesType = selectedType === 'all' || prop.type === selectedType;
    const matchesSearch = 
      prop.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prop.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prop.microLocation.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prop.id.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto w-full relative">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
         <div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Project Portfolio</h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
              {readOnly ? 'Explore Imperial properties' : 'Enterprise grade real estate asset management'}
            </p>
         </div>
         
         <div className="flex items-center gap-3">
             {compareList.length > 0 && (
                <button
                  onClick={() => setShowComparison(true)}
                  className="bg-emerald-600 text-white px-5 py-2.5 rounded-xl hover:bg-emerald-700 transition-all font-bold shadow-lg shadow-emerald-200 dark:shadow-emerald-900/20 flex items-center gap-2 text-sm"
                >
                  <Scale size={18} />
                  Compare ({compareList.length})
                </button>
             )}
             
             {!readOnly && (
               <>
                 {onShare && (
                    <button
                      onClick={onShare}
                      className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 px-5 py-2.5 rounded-xl hover:bg-slate-200 transition-all font-bold flex items-center gap-2 text-sm"
                    >
                      <Share2 size={18} />
                      Share
                    </button>
                 )}
                 <button
                    onClick={openAddForm}
                    className="bg-blue-600 text-white px-5 py-2.5 rounded-xl hover:bg-blue-700 transition-all font-bold shadow-lg shadow-blue-200 dark:shadow-blue-900/20 flex items-center gap-2 text-sm"
                  >
                    <Plus size={18} />
                    New Project
                  </button>
               </>
             )}
         </div>
      </div>

      {/* Filters & Search */}
      <div className="mb-8 space-y-4 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                placeholder="Search projects by name, city or ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all dark:text-white"
              />
            </div>
            
            <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
               <Filter size={16} className="text-slate-400 mr-2 shrink-0" />
               {(['all', 'apartment', 'villa', 'commercial'] as const).map((type) => (
                  <button
                    key={type}
                    onClick={() => setSelectedType(type)}
                    className={`px-4 py-2 rounded-lg text-xs font-black transition-all uppercase tracking-widest shrink-0 ${
                      selectedType === type 
                        ? 'bg-slate-900 dark:bg-slate-700 text-white shadow-md' 
                        : 'bg-white dark:bg-slate-900 text-slate-500 border border-slate-100 dark:border-slate-800 hover:bg-slate-50'
                    }`}
                  >
                    {type}
                  </button>
               ))}
            </div>
          </div>
      </div>

      {/* Grid Content */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="bg-white dark:bg-slate-900 h-96 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 animate-pulse"></div>
          ))}
        </div>
      ) : filteredProperties.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-32">
          {filteredProperties.map(project => (
            <PropertyCard
              key={project.id}
              property={project}
              onEdit={openEditForm}
              onDelete={requestDelete}
              onViewDetails={setSelectedProperty}
              readOnly={readOnly}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-16 text-center border border-slate-100 dark:border-slate-800 shadow-sm">
           <div className="bg-slate-50 dark:bg-slate-800 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
              <LayoutGrid size={32} className="text-slate-300" />
           </div>
           <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">No Projects Found</h3>
           <p className="text-slate-500 dark:text-slate-400 max-w-sm mx-auto">Try adjusting your filters or search terms to find what you're looking for.</p>
        </div>
      )}

      {/* Modals */}
      {showForm && (
        <PropertyForm
          initialData={editingProperty}
          onSave={handleCreateOrUpdate}
          onCancel={() => {
            setShowForm(false);
            setEditingProperty(null);
          }}
          isSaving={isSaving}
        />
      )}

      {selectedProperty && (
        <PropertyDetails
          property={selectedProperty}
          onClose={() => setSelectedProperty(null)}
          onEdit={handleEditFromDetails}
          readOnly={readOnly}
        />
      )}

      {showComparison && (
        <PropertyComparison
          properties={compareList}
          onClose={() => setShowComparison(false)}
        />
      )}

      {/* Delete Confirmation */}
      {deleteConfirmationId && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 z-[100]">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 max-w-md w-full shadow-2xl border border-slate-200 dark:border-slate-800">
            <div className="bg-rose-50 dark:bg-rose-900/20 w-12 h-12 rounded-2xl flex items-center justify-center text-rose-500 mb-6">
               <AlertTriangle size={24} />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Delete Project?</h3>
            <p className="text-slate-500 dark:text-slate-400 mb-8 leading-relaxed">
              This will permanently remove the project and all its configurations. This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button 
                onClick={() => setDeleteConfirmationId(null)}
                className="flex-1 py-3 font-bold text-slate-500 hover:bg-slate-100 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={executeDelete}
                className="flex-1 py-3 bg-rose-500 text-white font-bold rounded-xl shadow-lg shadow-rose-200 dark:shadow-rose-900/20 hover:bg-rose-600 transition-all"
              >
                Delete Now
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Internal helpers for specific modal triggers inside the card
const requestDelete = (id: string) => {
  // This is handled via state in the main component, the PropertyCard onDelete prop calls this.
};

const openEditForm = (property: Property) => {
  // This is handled via state in the main component.
};

export default PropertyManager;
