
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
    const divisor = property.isRental ? 100000 : 10000000;
    const unit = property.isRental ? 'L' : 'Cr';
    const val = `₹${(price / divisor).toFixed(2)} ${unit}`;
    return property.isRental ? `${val} / Month` : val;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ready': return <span className="flex items-center gap-2 px-4 py-1.5 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-xl text-[10px] font-black uppercase tracking-widest border border-emerald-100/50 dark:border-emerald-800/50"><CheckCircle size={12}/> Ready</span>;
      case 'under-construction': return <span className="flex items-center gap-2 px-4 py-1.5 bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-xl text-[10px] font-black uppercase tracking-widest border border-amber-100/50 dark:border-amber-800/50"><Hammer size={12}/> Active</span>;
      case 'pre-launch': return <span className="flex items-center gap-2 px-4 py-1.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl text-[10px] font-black uppercase tracking-widest border border-blue-100/50 dark:border-blue-800/50"><Building size={12}/> Upcoming</span>;
      default: return null;
    }
  };
  
  // Image hidden as per request to remove image options entirely
  return (
    <div 
      onClick={() => onViewDetails(property)}
      className="bg-white dark:bg-slate-900 rounded-[44px] shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden hover:shadow-3xl hover:-translate-y-2 transition-all duration-700 flex flex-col h-full cursor-pointer group"
    >
      <div className="p-8 flex-1 flex flex-col">
        <div className="mb-6 flex justify-between items-start">
          <div className="flex-1">
             <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2.5">
                <MapPin size={12} className="text-blue-500" /> {property.city} • {property.microLocation}
             </div>
             <h3 className="font-black text-2xl text-slate-900 dark:text-white tracking-tight leading-none group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
               {property.title.split('–')[0]}
             </h3>
          </div>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onCompareToggle(property);
            }}
            className={`p-3 rounded-2xl transition-all border shrink-0 ${
              isCompared 
                ? 'bg-emerald-500 border-emerald-400 text-white shadow-lg' 
                : 'bg-slate-50 dark:bg-slate-800 border-slate-100 dark:border-slate-700 text-slate-400 hover:bg-slate-100 active:scale-90'
            }`}
          >
            <Scale size={18} />
          </button>
        </div>

        <div className="flex items-center justify-between mb-6 py-6 border-y border-slate-50 dark:border-slate-800/50">
           <div>
              <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest mb-1">
                {property.isRental ? 'Monthly Rental From' : 'Asset Value From'}
              </p>
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
            <div className="flex items-center gap-2">
               <span className="text-[10px] font-mono font-black text-slate-400 tracking-widest">REF: {property.id}</span>
               {property.isRental && (
                 <span className="bg-amber-100 text-amber-700 text-[8px] px-2 py-0.5 rounded font-black uppercase">Rental</span>
               )}
            </div>
            
            {!readOnly ? (
               <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={(e) => { e.stopPropagation(); onEdit(property); }}
                    className="p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all"
                  >
                    <Edit3 size={16} />
                  </button>
                  <button 
                    onClick={(e) => { e.stopPropagation(); onDelete(property.id); }}
                    className="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-all"
                  >
                    <Trash2 size={16} />
                  </button>
               </div>
            ) : (
              <div className="flex items-center gap-3 text-blue-600 dark:text-blue-400 font-black text-xs group-hover:translate-x-2 transition-transform uppercase tracking-widest">
                 Explore <ArrowRight size={16} />
              </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default PropertyCard;
