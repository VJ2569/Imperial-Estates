import React from 'react';
import { MapPin, Bed, Bath, Square, IndianRupee, Edit2, Trash2, ArrowRight } from 'lucide-react';
import { Property } from '../types';

interface PropertyCardProps {
  property: Property;
  onEdit: (property: Property) => void;
  onDelete: (id: string) => void;
  onViewDetails: (property: Property) => void;
  readOnly?: boolean;
  onToggleCompare?: (property: Property) => void;
  isSelectedForCompare?: boolean;
  disableCompare?: boolean;
}

const PropertyCard: React.FC<PropertyCardProps> = ({ 
  property, 
  onEdit, 
  onDelete, 
  onViewDetails, 
  readOnly = false,
  onToggleCompare,
  isSelectedForCompare = false,
  disableCompare = false
}) => {
  const formatPrice = (price: number, isRental: boolean) => {
    if (isRental) {
      return `₹${price.toLocaleString('en-IN')}/mo`;
    }
    return `₹${(price / 10000000).toFixed(2)} Cr`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-emerald-500 text-white';
      case 'sold': return 'bg-rose-500 text-white';
      case 'rented': return 'bg-amber-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };
  
  const hasImage = property.images && property.images.length > 0;
  const headerStyle = hasImage && property.images ? {
    backgroundImage: `linear-gradient(to right, rgba(15, 23, 42, 0.8), rgba(15, 23, 42, 0.4)), url(${property.images[0]})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center'
  } : {};

  return (
    <div className={`bg-white rounded-xl shadow-sm border overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col h-full group ${isSelectedForCompare ? 'ring-2 ring-blue-500 border-blue-500' : 'border-gray-100'}`}>
      <div className={`h-48 p-4 relative overflow-hidden ${hasImage ? '' : 'bg-gradient-to-r from-slate-800 to-slate-900'}`} style={headerStyle}>
        {!hasImage && <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-xl" />}
        <div className="flex justify-between items-start relative z-10">
          <div className="max-w-[70%]">
            <h3 className="text-white font-bold text-lg mb-1 line-clamp-1 drop-shadow-md" title={property.title}>{property.title}</h3>
            <p className="text-slate-200 text-xs font-mono bg-slate-900/50 backdrop-blur-sm inline-block px-2 py-0.5 rounded border border-slate-700/50">{property.id}</p>
          </div>
          <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize shadow-sm ${getStatusColor(property.status)}`}>
            {property.status}
          </span>
        </div>
        
        {/* Compare Checkbox - Moved to bottom right to prevent overlap with ID */}
        <div className="absolute bottom-3 right-3 z-10">
            <label className={`flex items-center gap-2 px-2 py-1 rounded-lg backdrop-blur-md border cursor-pointer transition-colors ${isSelectedForCompare ? 'bg-blue-600/90 text-white border-blue-500' : 'bg-black/40 text-white border-white/20 hover:bg-black/60'}`}>
                <input 
                    type="checkbox" 
                    checked={isSelectedForCompare}
                    disabled={!isSelectedForCompare && disableCompare}
                    onChange={(e) => {
                        e.stopPropagation();
                        if (onToggleCompare) onToggleCompare(property);
                    }}
                    className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer disabled:opacity-50"
                />
                <span className="text-xs font-medium">Compare</span>
            </label>
        </div>
      </div>

      <div className="p-4 md:p-5 flex-1 flex flex-col">
        <div className="flex items-center text-gray-500 mb-4 text-sm">
          <MapPin size={14} className="mr-1.5 text-blue-500 shrink-0" />
          <span className="truncate">{property.location}</span>
        </div>

        <div className="flex items-center text-2xl font-bold text-gray-800 mb-5">
          <IndianRupee size={22} className="text-emerald-600 mr-0.5" />
          <span>{formatPrice(property.price, property.isRental)}</span>
        </div>

        <div className="grid grid-cols-3 gap-2 mb-5 py-3 border-t border-b border-gray-50">
          {property.bedrooms > 0 && (
            <div className="flex flex-col items-center justify-center text-center">
              <span className="text-gray-400 text-[10px] md:text-xs mb-1">Beds</span>
              <div className="flex items-center font-medium text-gray-700 text-sm">
                <Bed size={14} className="mr-1.5 text-slate-400" />
                {property.bedrooms}
              </div>
            </div>
          )}
          <div className="flex flex-col items-center justify-center text-center">
             <span className="text-gray-400 text-[10px] md:text-xs mb-1">Baths</span>
            <div className="flex items-center font-medium text-gray-700 text-sm">
              <Bath size={14} className="mr-1.5 text-slate-400" />
              {property.bathrooms}
            </div>
          </div>
          <div className="flex flex-col items-center justify-center text-center">
             <span className="text-gray-400 text-[10px] md:text-xs mb-1">Area</span>
            <div className="flex items-center font-medium text-gray-700 text-sm">
              <Square size={14} className="mr-1.5 text-slate-400" />
              {property.area}
            </div>
          </div>
        </div>

        <p className="text-gray-500 text-sm mb-6 line-clamp-2 flex-1">{property.description}</p>

        <div className="flex items-center gap-2 mt-auto pt-2">
          <button
            onClick={() => onViewDetails(property)}
            className={`flex-1 bg-slate-100 text-slate-700 py-2 px-3 md:px-4 rounded-lg hover:bg-slate-200 transition-colors text-sm font-medium flex items-center justify-center group-hover:bg-blue-50 group-hover:text-blue-600 ${readOnly ? 'w-full' : ''}`}
          >
            Details <ArrowRight size={14} className="ml-1.5" />
          </button>
          
          {!readOnly && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); onEdit(property); }}
                className="p-2 text-amber-500 hover:bg-amber-50 rounded-lg transition-colors"
                title="Edit"
              >
                <Edit2 size={18} />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); onDelete(property.id); }}
                className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                title="Delete"
              >
                <Trash2 size={18} />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default PropertyCard;
