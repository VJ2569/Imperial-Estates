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
      {/* Image Section */}
      <div className="relative h-60 overflow-hidden">
        {imageSrc ? (
          <img 
            src={imageSrc} 
            alt={property.title} 
            className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
          />
        ) : (
          <div className="w-full h-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
            <Building size={48} className="text-slate-300 dark:text-slate-700" />
          </div>
        )}
        
        {/* Top Badges */}
        <div className="absolute top-4 left-4 flex gap-2">
          <span className="px-3 py-1 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm border border-white/20 dark:border-slate-800 text-slate-900 dark:text-white">
            {property.type}
          </span>
        </div>

        {/* Compare Toggle */}
        <button 
          onClick={(e) => {
            e.stopPropagation();
            onCompareToggle(property);
          }}
          className={`absolute top-4 right-4 p-2 rounded-xl backdrop-blur-md transition-all border ${
            isCompared 
              ? 'bg-emerald-500 border-emerald-400 text-white shadow-lg' 
              : 'bg-white/40 dark:bg-slate-900/40 border-white/20 dark:border-slate-800 text-white hover:bg-white/60'
          }`}
          title="Toggle Comparison"
        >
          <Scale size={18} />
        </button>

        {/* Admin Actions Overlay */}
        {!readOnly && (
           <div className="absolute inset-x-0 bottom-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300 bg-gradient-to-t from-slate-900/90 to-transparent flex justify-end gap-2">
              <button 
                onClick={(e) => { e.stopPropagation(); onEdit(property); }}
                className="p-2.5 bg-white/10 hover:bg-blue-600 text-white rounded-xl backdrop-blur-md transition-all border border-white/10"
              >
                <Edit3 size={18} />
              </button>
              <button 
                onClick={(e) => { e.stopPropagation(); onDelete(property.id); }}
                className="p-2.5 bg-white/10 hover:bg-rose-600 text-white rounded-xl backdrop-blur-md transition-all border border-white/10"
              >
                <Trash2 size={18} />
              </button>
           </div>
        )}

        <div className="absolute bottom-4 left-4 right-4 pointer-events-none group-hover:opacity-0 transition-opacity">
          <div className="flex items-center gap-1 text-[10px] font-bold text-white/90 uppercase tracking-widest mb-1 shadow-black/20">
             <MapPin size={10} className="text-blue-400" /> {property.city}
          </div>
          <h3 className="font-black text-xl text-white tracking-tight drop-shadow-md">{property.title.split('–')[0]}</h3>
        </div>
      </div>

      <div className="p-6 flex-1 flex flex-col">
        <div className="flex items-center justify-between mb-6">
           <div>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-black tracking-widest mb-1">Starting From</p>
              <div className="flex items-center text-2xl font-black text-slate-900 dark:text-white">
                <IndianRupee size={18} className="text-emerald-500 mr-0.5" />
                <span>{formatPrice(property.price)}</span>
              </div>
           </div>
           <div className="text-right">
              <div className="flex items-center justify-end gap-1.5 text-[11px] font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-1">
                {getStatusIcon(property.projectStatus)}
                {property.projectStatus.replace('-', ' ')}
              </div>
              <p className="text-[10px] text-slate-400 font-mono tracking-tighter">{property.id}</p>
           </div>
        </div>

        <div className="grid grid-cols-2 gap-6 py-4 border-t border-slate-100 dark:border-slate-800 mb-6">
          <div>
            <span className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Project Size</span>
            <span className="text-sm font-bold text-slate-800 dark:text-slate-200">{property.totalProjectSize}</span>
          </div>
          <div>
            <span className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Possession</span>
            <span className="text-sm font-bold text-slate-800 dark:text-slate-200">{property.timeline}</span>
          </div>
        </div>

        <div className="mt-auto flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center gap-2">
               <div className="w-6 h-6 rounded-lg bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center">
                  <MapPin size={12} className="text-blue-600 dark:text-blue-400" />
               </div>
               {property.microLocation}
            </span>
            <div className="bg-slate-900 dark:bg-blue-600 p-2.5 rounded-xl text-white shadow-lg group-hover:scale-110 group-hover:bg-blue-600 transition-all">
               <ArrowRight size={18} />
            </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyCard;
