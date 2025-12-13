import React from 'react';
import { X, Check, Minus, Download, Printer } from 'lucide-react';
import { Property } from '../types';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

interface PropertyComparisonProps {
  properties: Property[];
  onClose: () => void;
}

const PropertyComparison: React.FC<PropertyComparisonProps> = ({ properties, onClose }) => {
  const exportPDF = async () => {
    const element = document.getElementById('comparison-table');
    if (!element) return;

    try {
      const canvas = await html2canvas(element, { scale: 2 });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save('property-comparison.pdf');
    } catch (err) {
      console.error("PDF Export failed", err);
      // Fallback to print if library fails or isn't loaded
      window.print();
    }
  };

  const getCheapest = () => {
    return properties.reduce((min, p) => p.price < min.price ? p : min, properties[0]);
  };

  const getLargest = () => {
    return properties.reduce((max, p) => p.area > max.area ? p : max, properties[0]);
  };

  const formatPrice = (price: number) => `₹${(price / 10000000).toFixed(2)} Cr`;

  return (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white w-full max-w-6xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50 rounded-t-2xl">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Property Comparison</h2>
            <p className="text-slate-500 text-sm mt-1">Comparing {properties.length} properties side-by-side</p>
          </div>
          <div className="flex gap-3">
             <button 
                onClick={exportPDF}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm font-medium"
             >
                <Download size={18} />
                Export Comparison
             </button>
             <button 
                onClick={onClose}
                className="p-2 text-gray-500 hover:bg-gray-200 rounded-lg transition-colors"
             >
                <X size={24} />
             </button>
          </div>
        </div>

        {/* Content */}
        <div className="overflow-auto p-6 flex-1 custom-scrollbar">
           <div id="comparison-table" className="bg-white p-4">
              <table className="w-full border-collapse">
                  <thead>
                      <tr>
                          <th className="p-4 text-left min-w-[150px] bg-gray-50 rounded-l-lg border-b border-t border-l border-gray-200">Feature</th>
                          {properties.map(p => (
                              <th key={p.id} className="p-4 text-left min-w-[250px] border-b border-t border-gray-200 bg-gray-50 last:rounded-r-lg last:border-r">
                                  <div className="font-bold text-lg text-slate-800 line-clamp-2">{p.title}</div>
                                  <div className="text-xs text-slate-500 font-mono mt-1">{p.id}</div>
                              </th>
                          ))}
                      </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                      {/* Image Row */}
                      <tr>
                          <td className="p-4 font-semibold text-slate-600">Visual</td>
                          {properties.map(p => (
                              <td key={p.id} className="p-4">
                                  <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
                                      {p.images && p.images.length > 0 ? (
                                          <img src={p.images[0]} alt={p.title} className="w-full h-full object-cover" />
                                      ) : (
                                          <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">No Image</div>
                                      )}
                                  </div>
                              </td>
                          ))}
                      </tr>

                      {/* Price Row */}
                      <tr>
                          <td className="p-4 font-semibold text-slate-600">Price</td>
                          {properties.map(p => (
                              <td key={p.id} className="p-4">
                                  <span className={`font-bold text-lg ${p.id === getCheapest().id ? 'text-emerald-600' : 'text-slate-800'}`}>
                                      {formatPrice(p.price)}
                                  </span>
                                  {p.id === getCheapest().id && (
                                      <span className="block text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-1 rounded w-fit mt-1">Best Price</span>
                                  )}
                              </td>
                          ))}
                      </tr>

                      {/* Location Row */}
                      <tr>
                          <td className="p-4 font-semibold text-slate-600">Location</td>
                          {properties.map(p => (
                              <td key={p.id} className="p-4 text-slate-700">{p.location}</td>
                          ))}
                      </tr>

                      {/* Type & Status Row */}
                      <tr>
                          <td className="p-4 font-semibold text-slate-600">Type & Status</td>
                          {properties.map(p => (
                              <td key={p.id} className="p-4">
                                  <span className="capitalize text-slate-800">{p.type}</span>
                                  <span className="mx-2 text-gray-300">|</span>
                                  <span className={`capitalize px-2 py-0.5 rounded text-xs text-white ${
                                      p.status === 'available' ? 'bg-emerald-500' : p.status === 'sold' ? 'bg-rose-500' : 'bg-amber-500'
                                  }`}>{p.status}</span>
                              </td>
                          ))}
                      </tr>

                      {/* Specs Row */}
                      <tr>
                          <td className="p-4 font-semibold text-slate-600">Specifications</td>
                          {properties.map(p => (
                              <td key={p.id} className="p-4 text-slate-700">
                                  <div className="flex gap-4">
                                      <div><span className="font-bold">{p.bedrooms}</span> Beds</div>
                                      <div><span className="font-bold">{p.bathrooms}</span> Baths</div>
                                      <div className={p.id === getLargest().id ? 'text-blue-600 font-bold' : ''}>
                                          <span className="font-bold">{p.area}</span> sqft
                                      </div>
                                  </div>
                              </td>
                          ))}
                      </tr>

                      {/* Features Row */}
                      <tr>
                          <td className="p-4 font-semibold text-slate-600">Features</td>
                          {properties.map(p => (
                              <td key={p.id} className="p-4">
                                  <div className="flex flex-wrap gap-1">
                                      {p.features.split(',').map((f, i) => (
                                          <span key={i} className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded">{f.trim()}</span>
                                      ))}
                                  </div>
                              </td>
                          ))}
                      </tr>

                      {/* Analysis Row */}
                      <tr className="bg-blue-50/50">
                          <td className="p-4 font-semibold text-blue-800 align-top">Pros</td>
                          {properties.map(p => (
                              <td key={p.id} className="p-4 align-top">
                                  <ul className="space-y-1">
                                      {p.id === getCheapest().id && (
                                          <li className="flex items-center text-sm text-emerald-700 gap-2"><Check size={14} /> Lowest Price</li>
                                      )}
                                      {p.id === getLargest().id && (
                                          <li className="flex items-center text-sm text-blue-700 gap-2"><Check size={14} /> Largest Area</li>
                                      )}
                                      {p.bedrooms === Math.max(...properties.map(pr => pr.bedrooms)) && (
                                          <li className="flex items-center text-sm text-slate-700 gap-2"><Check size={14} /> Most Bedrooms</li>
                                      )}
                                      {p.status === 'available' && (
                                          <li className="flex items-center text-sm text-slate-700 gap-2"><Check size={14} /> Ready to Move</li>
                                      )}
                                  </ul>
                              </td>
                          ))}
                      </tr>
                  </tbody>
              </table>
           </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyComparison;