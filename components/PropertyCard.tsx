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
      case 'ready': return <span className="flex items-center gap-2 px-4 py-1.5 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-xl text-[10px] font-black uppercase tracking-widest border border-emerald-100/50 dark:border-emerald-800/50"><CheckCircle size={12}/> Ready</span>;
      case 'under-construction': return <span className="flex items-center gap-2 px-4 py-1.5 bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-xl text-[10px] font-black uppercase tracking-widest border border-amber-100/50 dark:border-amber-800/50"><Hammer size={12}/> Active</span>;
      case 'pre-launch': return <span className="flex items-center gap-2 px-4 py-1.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl text-[10px] font-black uppercase tracking-widest border border-blue-100/50 dark:border-blue-800/50"><Building size={12}/> Upcoming</span>;
      default: return null;
    }
  };
  
  const imageSrc = property.images && property.images.length > 0 ? property.images[0] : null;

  return (
    <div 
      onClick={() => onViewDetails(property)}
      className="bg-white dark:bg-slate-900 rounded-[44px] shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden hover:shadow-3xl hover:-translate-y-2 transition-all duration-700 flex flex-col h-full cursor-pointer group"
    >
      {/* Visual Component */}
      <div className="relative h-56 overflow-hidden shrink-0">
        {imageSrc ? (
          <img 
            src={imageSrc} 
            alt={property.title} 
            className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
          />
        ) : (
          <div className="w-full h-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center">
            <Building size={40} className="text-slate-200 dark:text-slate-700" />
          </div>
        )}
        
        {/* Type Overlay */}
        <div className="absolute top-6 left-6">
          <span className="px-4 py-1.5 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl border border-white/20 dark:border-slate-800 text-slate-900 dark:text-white">
            {property.type}
          </span>
        </div>

        {/* Comparison Toggle */}
        <button 
          onClick={(e) => {
            e.stopPropagation();
            onCompareToggle(property);
          }}
          className={`absolute top-6 right-6 p-3 rounded-2xl backdrop-blur-xl transition-all border ${
            isCompared 
              ? 'bg-emerald-500 border-emerald-400 text-white shadow-2xl scale-110' 
              : 'bg-white/40 dark:bg-slate-900/40 border-white/20 dark:border-slate-800 text-white hover:bg-white/60 active:scale-90'
          }`}
        >
          <Scale size={18} />
        </button>

        {/* Management Actions */}
        {!readOnly && (
           <div className="absolute inset-x-0 bottom-0 p-5 translate-y-full group-hover:translate-y-0 transition-transform duration-500 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent flex justify-end gap-3">
              <button 
                onClick={(e) => { e.stopPropagation(); onEdit(property); }}
                className="p-3 bg-white/10 hover:bg-blue-600 text-white rounded-2xl backdrop-blur-xl transition-all border border-white/10 active:scale-90"
              >
                <Edit3 size={18} />
              </button>
              <button 
                onClick={(e) => { e.stopPropagation(); onDelete(property.id); }}
                className="p-3 bg-white/10 hover:bg-rose-600 text-white rounded-2xl backdrop-blur-xl transition-all border border-white/10 active:scale-90"
              >
                <Trash2 size={18} />
              </button>
           </div>
        )}
      </div>

      <div className="p-8 flex-1 flex flex-col">
        <div className="mb-6">
          <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2.5">
             <MapPin size={12} className="text-blue-500" /> {property.city} • {property.microLocation}
          </div>
          <h3 className="font-black text-2xl text-slate-900 dark:text-white tracking-tight leading-none group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
            {property.title.split('–')[0]}
          </h3>
        </div>

        <div className="flex items-center justify-between mb-6 py-6 border-y border-slate-50 dark:border-slate-800/50">
           <div>
              <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest mb-1">Asset Value From</p>
              <div className="flex items-center text-3xl font-black text-slate-900 dark:text-white tracking-tighter">
                <IndianRupee size={20} className="text-emerald-500 mr-1" />
                <span>{formatPrice(property.price)}</span>
              </div>
           </div>
           <div className="text-right">
              {getStatusBadge(property.projectStatus)}
           </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-slate-50/50 dark:bg-slate-800/50 p-4 rounded-3xl border border-slate-100 dark:border-slate-800 transition-colors group-hover:bg-white dark:group-hover:bg-slate-800">
            <span className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Total Scope</span>
            <span className="text-xs font-black text-slate-900 dark:text-slate-200">{property.totalProjectSize}</span>
          </div>
          <div className="bg-slate-50/50 dark:bg-slate-800/50 p-4 rounded-3xl border border-slate-100 dark:border-slate-800 transition-colors group-hover:bg-white dark:group-hover:bg-slate-800">
            <span className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Handover</span>
            <span className="text-xs font-black text-slate-900 dark:text-slate-200">{property.timeline}</span>
          </div>
        </div>

        <div className="mt-auto pt-6 flex items-center justify-between border-t border-slate-50 dark:border-slate-800/50">
            <span className="text-[10px] font-mono font-black text-slate-400 tracking-widest">REF: {property.id}</span>
            <div className="flex items-center gap-3 text-blue-600 dark:text-blue-400 font-black text-xs group-hover:translate-x-2 transition-transform uppercase tracking-widest">
               Explore <ArrowRight size={16} />
            </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyCard;
