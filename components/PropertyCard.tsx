import React from 'react';
import { MapPin, IndianRupee, ArrowRight, Building, Hammer, CheckCircle, Edit3, Trash2, Scale } from 'lucide-react';
import { Property } from '../types';

interface PropertyCardProps {
  property: Property;
  onEdit: (property: Property) => void;
  onDelete: (id: string) => void;
  onViewDetails: (property: Property) => void;
  onCompareToggle: (property: Property) => void;
  isCompared: boolean;
  readOnly?: boolean;
}

const PropertyCard: React.FC<PropertyCardProps> = ({ 
  property, 
  onEdit,
  onDelete,
  onViewDetails, 
  onCompareToggle,
  isCompared,
  readOnly = false,
}) => {
  const formatPrice = (price: number) => {
    return `₹${(price / 10000000).toFixed(2)} Cr`;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ready': return <CheckCircle size={14} className="text-emerald-500" />;
      case 'under-construction': return <Hammer size={14} className="text-amber-500" />;
      case 'pre-launch': return <Building size={14} className="text-blue-500" />;
      default: return null;
    }
  };
  
  const hasImage = property.images && property.images.length > 0;
  const imageSrc = hasImage ? property.images[0] : null;

  return (
    <div 
      onClick={() => onViewDetails(property)}
      className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden hover:shadow-2xl hover:-translate-y-1 transition-all duration-500 flex flex-col h-full cursor-pointer group"
    >
      {/* Image Section - Reduced to 1/4 height (h-36) */}
      <div className="relative h-36 overflow-hidden shrink-0">
        {imageSrc ? (
          <img 
            src={imageSrc} 
            alt={property.title} 
            className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
          />
        ) : (
          <div className="w-full h-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
            <Building size={32} className="text-slate-300 dark:text-slate-700" />
          </div>
        )}
        
        {/* Top Badges */}
        <div className="absolute top-3 left-3 flex gap-2">
          <span className="px-2.5 py-1 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md rounded-lg text-[9px] font-black uppercase tracking-widest shadow-sm border border-white/20 dark:border-slate-800 text-slate-900 dark:text-white">
            {property.type}
          </span>
        </div>

        {/* Compare Toggle */}
        <button 
          onClick={(e) => {
            e.stopPropagation();
            onCompareToggle(property);
          }}
          className={`absolute top-3 right-3 p-1.5 rounded-lg backdrop-blur-md transition-all border ${
            isCompared 
              ? 'bg-emerald-500 border-emerald-400 text-white shadow-lg' 
              : 'bg-white/40 dark:bg-slate-900/40 border-white/20 dark:border-slate-800 text-white hover:bg-white/60'
          }`}
          title="Toggle Comparison"
        >
          <Scale size={14} />
        </button>

        {/* Admin Actions Overlay */}
        {!readOnly && (
           <div className="absolute inset-x-0 bottom-0 p-2 translate-y-full group-hover:translate-y-0 transition-transform duration-300 bg-gradient-to-t from-slate-900/90 to-transparent flex justify-end gap-1.5">
              <button 
                onClick={(e) => { e.stopPropagation(); onEdit(property); }}
                className="p-1.5 bg-white/10 hover:bg-blue-600 text-white rounded-lg backdrop-blur-md transition-all border border-white/10"
              >
                <Edit3 size={14} />
              </button>
              <button 
                onClick={(e) => { e.stopPropagation(); onDelete(property.id); }}
                className="p-1.5 bg-white/10 hover:bg-rose-600 text-white rounded-lg backdrop-blur-md transition-all border border-white/10"
              >
                <Trash2 size={14} />
              </button>
           </div>
        )}
      </div>

      <div className="p-5 flex-1 flex flex-col">
        {/* Location & Title */}
        <div className="mb-4">
          <div className="flex items-center gap-1 text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">
             <MapPin size={10} className="text-blue-500" /> {property.city} • {property.microLocation}
          </div>
          <h3 className="font-black text-lg text-slate-900 dark:text-white tracking-tight leading-tight line-clamp-1">
            {property.title.split('–')[0]}
          </h3>
        </div>

        {/* Price & Status */}
        <div className="flex items-center justify-between mb-5 py-3 border-y border-slate-50 dark:border-slate-800/50">
           <div>
              <p className="text-[9px] text-slate-400 uppercase font-black tracking-widest mb-0.5">Starting At</p>
              <div className="flex items-center text-xl font-black text-slate-900 dark:text-white">
                <IndianRupee size={14} className="text-emerald-500 mr-0.5" />
                <span>{formatPrice(property.price)}</span>
              </div>
           </div>
           <div className="text-right">
              <div className="flex items-center justify-end gap-1 text-[10px] font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                {getStatusIcon(property.projectStatus)}
                {property.projectStatus.replace('-', ' ')}
              </div>
           </div>
        </div>

        {/* Key Specs */}
        <div className="grid grid-cols-2 gap-4 mb-5">
          <div>
            <span className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Land Area</span>
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{property.totalProjectSize}</span>
          </div>
          <div>
            <span className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Possession</span>
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{property.timeline}</span>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="mt-auto pt-4 flex items-center justify-between border-t border-slate-50 dark:border-slate-800/50">
            <span className="text-[10px] font-mono text-slate-400">ID: {property.id}</span>
            <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-bold text-xs group-hover:translate-x-1 transition-transform">
               View Details <ArrowRight size={14} />
            </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyCard;
