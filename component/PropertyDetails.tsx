import React from 'react';
import { X, MapPin, Bed, Bath, Square, Calendar, Tag, CheckCircle2, DollarSign } from 'lucide-react';
import { Property } from '../types';

interface PropertyDetailsProps {
  property: Property;
  onClose: () => void;
  onEdit: () => void;
  readOnly?: boolean;
}

const PropertyDetails: React.FC<PropertyDetailsProps> = ({ property, onClose, onEdit, readOnly = false }) => {
  const formatPrice = (price: number, isRental: boolean) => {
    if (isRental) {
      return `₹${price.toLocaleString('en-IN')}/month`;
    }
    return `₹${(price / 10000000).toFixed(2)} Cr`;
  };

  const features = property.features ? property.features.split(',').map(f => f.trim()).filter(f => f) : [];
  const hasImages = property.images && property.images.length > 0;
  
  // Use first image as hero background if available
  const heroStyle = hasImages && property.images ? {
    backgroundImage: `linear-gradient(to right, rgba(15, 23, 42, 0.9), rgba(15, 23, 42, 0.7)), url(${property.images[0]})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center'
  } : {};

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50" onClick={onClose}>
      <div 
        className="bg-white rounded-2xl max-w-4xl w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Banner Header */}
        <div className="relative h-48 md:h-56 bg-gradient-to-r from-slate-800 to-slate-900 p-8 flex flex-col justify-end shrink-0" style={heroStyle}>
          <div className="absolute top-0 right-0 p-4 z-20">
             <button 
                onClick={onClose}
                className="bg-white/10 hover:bg-white/20 text-white p-2 rounded-full backdrop-blur-md transition-colors"
             >
               <X size={20} />
             </button>
          </div>
          
          <div className="relative z-10">
             <div className="flex items-center gap-3 mb-2">
                <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-white text-xs font-semibold tracking-wide uppercase border border-white/10">
                    {property.status}
                </span>
                <span className="text-slate-300 text-sm font-mono">{property.id}</span>
             </div>
             <h2 className="text-3xl font-bold text-white shadow-sm">{property.title}</h2>
          </div>
          {!hasImages && (
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/20 rounded-full mix-blend-overlay filter blur-3xl -mr-16 -mt-16"></div>
          )}
        </div>

        <div className="p-8 overflow-y-auto">
          {/* Key Stats Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8 pb-8 border-b border-gray-100">
            <div>
              <p className="text-sm text-gray-500 mb-1">Price</p>
              <p className="text-xl font-bold text-emerald-600">{formatPrice(property.price, property.isRental)}</p>
            </div>
             <div>
              <p className="text-sm text-gray-500 mb-1">Type</p>
              <p className="text-lg font-semibold text-gray-800 capitalize">{property.type}</p>
            </div>
             <div>
              <p className="text-sm text-gray-500 mb-1">Area</p>
              <p className="text-lg font-semibold text-gray-800 flex items-center">
                 <Square size={16} className="mr-1 text-blue-500"/> {property.area} sqft
              </p>
            </div>
             <div>
              <p className="text-sm text-gray-500 mb-1">Availability</p>
              <p className="text-lg font-semibold text-gray-800 flex items-center">
                 <Calendar size={16} className="mr-1 text-blue-500"/> {property.availableFrom}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2 space-y-8">
               
               {/* Image Gallery */}
               {hasImages && property.images && property.images.length > 0 && (
                 <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-3">Gallery</h3>
                    <div className="grid grid-cols-2 gap-2">
                       {property.images.map((img, idx) => (
                         <div key={idx} className={`rounded-lg overflow-hidden border border-gray-200 aspect-video group relative ${idx === 0 && property.images && property.images.length % 2 !== 0 ? 'col-span-2' : ''}`}>
                            <img src={img} alt={`Property view ${idx + 1}`} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                         </div>
                       ))}
                    </div>
                 </div>
               )}

               {/* Location */}
               <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center">
                    <MapPin className="mr-2 text-blue-500" size={20}/> Location
                  </h3>
                  <p className="text-gray-700 bg-gray-50 p-4 rounded-lg border border-gray-100">
                    {property.location}
                  </p>
               </div>

               {/* Description */}
               <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-3">Description</h3>
                  <p className="text-gray-600 leading-relaxed whitespace-pre-line">
                    {property.description || "No description provided."}
                  </p>
               </div>

               {/* Amenities */}
               {features.length > 0 && (
                <div>
                   <h3 className="text-lg font-bold text-gray-900 mb-3">Features & Amenities</h3>
                   <div className="flex flex-wrap gap-2">
                      {features.map((feature, idx) => (
                        <span key={idx} className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-blue-50 text-blue-700 border border-blue-100">
                          <CheckCircle2 size={14} className="mr-1.5" />
                          {feature}
                        </span>
                      ))}
                   </div>
                </div>
               )}
            </div>

            {/* Sidebar Stats */}
            <div className="md:col-span-1 space-y-4">
              <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
                <h4 className="font-semibold text-gray-900 mb-4">Property Config</h4>
                <div className="space-y-3">
                   {property.bedrooms > 0 && (
                     <div className="flex justify-between items-center text-sm">
                       <span className="text-gray-500 flex items-center"><Bed size={16} className="mr-2"/> Bedrooms</span>
                       <span className="font-medium">{property.bedrooms}</span>
                     </div>
                   )}
                   <div className="flex justify-between items-center text-sm">
                       <span className="text-gray-500 flex items-center"><Bath size={16} className="mr-2"/> Bathrooms</span>
                       <span className="font-medium">{property.bathrooms}</span>
                   </div>
                   <div className="flex justify-between items-center text-sm pt-3 border-t border-gray-200 mt-2">
                       <span className="text-gray-500">Rental?</span>
                       <span className={`px-2 py-0.5 rounded text-xs font-semibold ${property.isRental ? 'bg-blue-100 text-blue-700' : 'bg-gray-200 text-gray-600'}`}>
                         {property.isRental ? 'Yes' : 'No'}
                       </span>
                   </div>
                </div>
              </div>

               {!readOnly && (
                 <button 
                  onClick={onEdit}
                  className="w-full bg-amber-400 hover:bg-amber-500 text-amber-950 font-semibold py-3 px-4 rounded-xl transition-colors shadow-lg shadow-amber-100"
                 >
                   Edit Property
                 </button>
               )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyDetails;