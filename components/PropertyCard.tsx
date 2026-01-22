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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ready': return <span className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-lg text-[10px] font-black uppercase"><CheckCircle size={12}/> Ready</span>;
      case 'under-construction': return <span className="flex items-center gap-1.5 px-3 py-1 bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-lg text-[10px] font-black uppercase"><Hammer size={12}/> Building</span>;
      case 'pre-launch': return <span className="flex items-center gap-1.5 px-3 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg text-[10px] font-black uppercase"><Building size={12}/> Launching</span>;
      default: return null;
    }
  };
  
  const hasImage = property.images && property.images.length > 0;
  const imageSrc = hasImage ? property.images[0] : null;

  return (
    <div 
      onClick={() => onViewDetails(property)}
      className="bg-white dark:bg-slate-900 rounded-[32px] shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden hover:shadow-2xl hover:-translate-y-1 transition-all duration-500 flex flex-col h-full cursor-pointer group"
    >
      {/* Image Section */}
      <div className="relative h-48 overflow-hidden shrink-0">
        {imageSrc ? (
          <img 
            src={imageSrc} 
            alt={property.title} 
            className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center">
            <Building size={32} className="text-slate-200 dark:text-slate-700" />
          </div>
        )}
        
        {/* Top Badges */}
        <div className="absolute top-4 left-4">
          <span className="px-3 py-1 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md rounded-xl text-[10px] font-black uppercase tracking-widest shadow-sm border border-white/20 dark:border-slate-800 text-slate-900 dark:text-white">
            {property.type}
          </span>
        </div>

        {/* Compare Toggle */}
        <button 
          onClick={(e) => {
            e.stopPropagation();
            onCompareToggle(property);
          }}
          className={`absolute top-4 right-4 p-2.5 rounded-xl backdrop-blur-md transition-all border ${
            isCompared 
              ? 'bg-emerald-500 border-emerald-400 text-white shadow-lg' 
              : 'bg-white/40 dark:bg-slate-900/40 border-white/20 dark:border-slate-800 text-white hover:bg-white/60'
          }`}
        >
          <Scale size={16} />
        </button>

        {/* Admin Actions Overlay */}
        {!readOnly && (
           <div className="absolute inset-x-0 bottom-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300 bg-gradient-to-t from-slate-900/95 via-slate-900/20 to-transparent flex justify-end gap-2">
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
      </div>

      <div className="p-6 flex-1 flex flex-col">
        <div className="mb-4">
          <div className="flex items-center gap-1.5 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">
             <MapPin size={12} className="text-blue-500" /> {property.city} • {property.microLocation}
          </div>
          <h3 className="font-black text-xl text-slate-900 dark:text-white tracking-tight leading-tight line-clamp-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
            {property.title.split('–')[0]}
          </h3>
        </div>

        <div className="flex items-center justify-between mb-5 py-4 border-y border-slate-50 dark:border-slate-800/50">
           <div>
              <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest mb-0.5">Investment From</p>
              <div className="flex items-center text-2xl font-black text-slate-900 dark:text-white tracking-tighter">
                <IndianRupee size={16} className="text-emerald-500 mr-0.5" />
                <span>{formatPrice(property.price)}</span>
              </div>
           </div>
           <div className="text-right">
              {getStatusBadge(property.projectStatus)}
           </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="bg-slate-50 dark:bg-slate-800/30 p-3 rounded-2xl border border-slate-50 dark:border-slate-800">
            <span className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Asset Scope</span>
            <span className="text-xs font-black text-slate-800 dark:text-slate-200">{property.totalProjectSize}</span>
          </div>
          <div className="bg-slate-50 dark:bg-slate-800/30 p-3 rounded-2xl border border-slate-50 dark:border-slate-800">
            <span className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Handover</span>
            <span className="text-xs font-black text-slate-800 dark:text-slate-200">{property.timeline}</span>
          </div>
        </div>

        <div className="mt-auto pt-4 flex items-center justify-between border-t border-slate-50 dark:border-slate-800/50">
            <span className="text-[10px] font-mono font-bold text-slate-400 tracking-wider">REF: {property.id}</span>
            <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-black text-xs group-hover:translate-x-1 transition-transform uppercase tracking-widest">
               Details <ArrowRight size={14} />
            </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyCard;
