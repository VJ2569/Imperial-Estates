
import React from 'react';
import { MapPin, IndianRupee, ArrowRight, Building, Hammer, CheckCircle } from 'lucide-react';
import { Property } from '../types';

interface PropertyCardProps {
  property: Property;
  onEdit: (property: Property) => void;
  onDelete: (id: string) => void;
  onViewDetails: (property: Property) => void;
  readOnly?: boolean;
}

const PropertyCard: React.FC<PropertyCardProps> = ({ 
  property, 
  onViewDetails, 
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
      className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 overflow-hidden hover:shadow-2xl transition-all duration-500 flex flex-col h-full cursor-pointer group"
    >
      {/* Image Section - 2/4th of the card roughly via aspect ratio */}
      <div className="relative h-56 overflow-hidden">
        {imageSrc ? (
          <img 
            src={imageSrc} 
            alt={property.title} 
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
        ) : (
          <div className="w-full h-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
            <Building size={48} className="text-slate-300 dark:text-slate-700" />
          </div>
        )}
        <div className="absolute top-4 left-4">
          <span className="px-3 py-1 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md rounded-full text-[10px] font-bold uppercase tracking-wider shadow-sm border border-white/20 dark:border-slate-800">
            {property.type}
          </span>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black/80 to-transparent" />
        <div className="absolute bottom-4 left-4 right-4 text-white">
          <div className="flex items-center gap-1 text-[10px] font-medium opacity-90 uppercase tracking-widest mb-1">
             <MapPin size={10} /> {property.city}
          </div>
          <h3 className="font-bold text-lg line-clamp-1 leading-tight">{property.title.split('–')[0]}</h3>
        </div>
      </div>

      <div className="p-5 flex-1 flex flex-col">
        <div className="flex items-center justify-between mb-4">
           <div>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-bold tracking-tight mb-0.5">Starting From</p>
              <div className="flex items-center text-xl font-black text-slate-900 dark:text-white">
                <IndianRupee size={16} className="text-emerald-500 mr-0.5" />
                <span>{formatPrice(property.price)}</span>
              </div>
           </div>
           <div className="text-right">
              <div className="flex items-center justify-end gap-1 text-xs font-semibold text-slate-700 dark:text-slate-300 capitalize mb-1">
                {getStatusIcon(property.projectStatus)}
                {property.projectStatus.replace('-', ' ')}
              </div>
              <p className="text-[10px] text-slate-400 font-mono">{property.id}</p>
           </div>
        </div>

        <div className="grid grid-cols-2 gap-4 py-3 border-t border-slate-100 dark:border-slate-800 mb-4">
          <div>
            <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-tighter mb-0.5">Project Size</span>
            <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">{property.totalProjectSize}</span>
          </div>
          <div>
            <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-tighter mb-0.5">Possession</span>
            <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">{property.timeline}</span>
          </div>
        </div>

        <div className="mt-auto flex items-center justify-between">
            <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
               <MapPin size={12} className="text-blue-500" />
               {property.microLocation}
            </span>
            <div className="bg-blue-600 p-2 rounded-xl text-white group-hover:translate-x-1 transition-transform">
               <ArrowRight size={16} />
            </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyCard;
