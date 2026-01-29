
import React, { useEffect, useState } from 'react';
import { 
  Play, 
  FileText, 
  RefreshCcw, 
  X, 
  ChevronRight, 
  Inbox, 
  AlertCircle,
  Database,
  Search,
  Maximize2,
  Clock,
  Phone,
  User
} from 'lucide-react';
import { fetchRetellCalls, fetchLeads, getStoredRetellCalls, getStoredLeads } from '../services/retellService';
import { format, isValid } from 'date-fns';

const CallHistory: React.FC = () => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRecord, setSelectedRecord] = useState<any | null>(null);
  const [activeTab, setActiveTab] = useState<'calls' | 'leads'>('calls');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    // Immediate load from cache to avoid empty screen
    const cached = activeTab === 'calls' ? getStoredRetellCalls() : getStoredLeads();
    setData(cached);
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = activeTab === 'calls' ? await fetchRetellCalls() : await fetchLeads();
      setData(Array.isArray(result) ? result : []);
    } catch (err: any) {
      setError("CORS or Network Error: Please ensure n8n has 'Access-Control-Allow-Origin' enabled.");
    } finally {
      setLoading(false);
    }
  };

  // Dynamically determine headers from the keys present in the current data set
  const getDynamicHeaders = () => {
    if (data.length === 0) return [];
    
    // Aggregate all unique keys from the first 10 objects to be safe
    const allKeys = Array.from(new Set(data.slice(0, 10).flatMap(item => Object.keys(item))));
    
    // Filter out internal system keys that shouldn't be in the main table
    const skipKeys = [
      'id', 'call_id', 'call_session_id', 'agent_id', 'metadata', 
      'transcript', 'recording_url', 'call_analysis', 'summary',
      'webhook_id', 'webhook_source', 'is_deleted'
    ];
    
    // Limit to first 6 keys for table readability
    return allKeys.filter(key => !skipKeys.includes(key)).slice(0, 6);
  };

  const formatHeader = (key: string) => {
    return key
      .replace(/_/g, ' ')
      .replace(/([A-Z])/g, ' $1')
      .trim()
      .toUpperCase();
  };

  const renderCellValue = (key: string, value: any) => {
    if (value === null || value === undefined) return '---';
    
    // Handle Timestamps
    if (key.toLowerCase().includes('timestamp') || key.toLowerCase().includes('date')) {
      const d = new Date(value);
      if (isValid(d)) return format(d, 'MMM d, p');
    }

    // Handle Booleans
    if (typeof value === 'boolean') {
      return value ? 'YES' : 'NO';
    }

    // Handle long text (Standardize row height)
    const stringVal = String(value);
    if (stringVal.length > 40) {
      return stringVal.substring(0, 37) + '...';
    }

    return stringVal;
  };

  const headers = getDynamicHeaders();
  
  const filteredData = data.filter(item => {
    if (!searchTerm) return true;
    return Object.values(item).some(val => 
      String(val).toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto w-full animate-in fade-in duration-500">
      {/* Header section with Toggles & Refresh */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-10">
        <div>
          <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Receptionist Console</h2>
          <div className="flex items-center gap-6 mt-4">
            <button 
              onClick={() => setActiveTab('calls')}
              className={`text-[10px] font-black uppercase tracking-[0.25em] pb-2 border-b-2 transition-all ${activeTab === 'calls' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
            >
              Voice Stream
            </button>
            <button 
              onClick={() => setActiveTab('leads')}
              className={`text-[10px] font-black uppercase tracking-[0.25em] pb-2 border-b-2 transition-all ${activeTab === 'leads' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
            >
              Enquiry Stream
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
             <input 
               type="text" 
               placeholder="Filter records..." 
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
               className="pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold focus:ring-2 focus:ring-blue-500 outline-none w-64 shadow-sm"
             />
          </div>
          <button onClick={loadData} className="p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-50 transition-all shadow-sm">
            <RefreshCcw size={20} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-8 p-6 bg-rose-50 dark:bg-rose-900/20 border border-rose-100 dark:border-rose-800 rounded-[32px] flex items-center gap-4 text-rose-600 dark:text-rose-400 shadow-sm animate-in slide-in-from-top-4">
          <AlertCircle size={24} />
          <div>
            <p className="font-black text-sm uppercase tracking-widest leading-none">CORS Connectivity Blocked</p>
            <p className="text-xs font-medium opacity-80 mt-1.5">Your n8n server rejected the request. Please enable Access-Control-Allow-Origin in your environment.</p>
          </div>
        </div>
      )}

      {/* Dynamic Table with Standardized Heights */}
      <div className="bg-white dark:bg-slate-900 rounded-[44px] shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          {filteredData.length > 0 ? (
            <table className="w-full text-left border-collapse table-fixed min-w-[1000px]">
              <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 text-[10px] uppercase font-black tracking-widest">
                <tr>
                  {headers.map(header => (
                    <th key={header} className="px-8 py-5 border-b border-slate-100 dark:border-slate-800">{formatHeader(header)}</th>
                  ))}
                  <th className="px-8 py-5 text-right border-b border-slate-100 dark:border-slate-800 w-32">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredData.map((item, idx) => (
                  <tr 
                    key={item.id || item.call_id || idx} 
                    onClick={() => setSelectedRecord(item)}
                    className="hover:bg-blue-50/30 dark:hover:bg-blue-900/10 transition-colors cursor-pointer group"
                  >
                    {headers.map(header => (
                      <td key={header} className="px-8 py-5 h-16">
                        <span className="text-sm font-bold text-slate-700 dark:text-slate-200 block truncate">
                          {renderCellValue(header, item[header])}
                        </span>
                      </td>
                    ))}
                    <td className="px-8 py-5 text-right">
                       <div className="flex items-center justify-end gap-2">
                          <Maximize2 size={16} className="text-slate-300 group-hover:text-blue-500 group-hover:scale-110 transition-all" />
                       </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="p-32 text-center">
              {!loading ? (
                <>
                  <Inbox className="mx-auto text-slate-200 dark:text-slate-800 mb-6" size={64} />
                  <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2 uppercase tracking-tight">Empty Feed</h3>
                  <p className="text-slate-500 text-sm max-w-xs mx-auto font-medium">No records found for this webhook. Ensure your n8n workflow is pushing data correctly.</p>
                </>
              ) : (
                <div className="flex flex-col items-center gap-6">
                  <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                  <p className="text-xs font-black uppercase tracking-[0.3em] text-slate-400">Syncing dynamic data...</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Record Detail Modal - Shows ALL info including long text */}
      {selectedRecord && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xl flex items-center justify-center p-4 z-[100] animate-in fade-in duration-300" onClick={() => setSelectedRecord(null)}>
          <div className="bg-white dark:bg-slate-900 rounded-[50px] max-w-4xl w-full max-h-[90vh] flex flex-col shadow-3xl overflow-hidden border border-slate-200 dark:border-slate-800" onClick={e => e.stopPropagation()}>
             
             {/* Modal Header */}
             <div className="p-10 pb-6 flex justify-between items-start border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40">
                <div className="flex items-center gap-5">
                   <div className="w-16 h-16 bg-blue-600 rounded-[24px] flex items-center justify-center text-white shadow-xl shadow-blue-500/20">
                      {activeTab === 'calls' ? <Phone size={32} /> : <User size={32} />}
                   </div>
                   <div>
                      <h3 className="font-black text-2xl text-slate-900 dark:text-white tracking-tight uppercase">Record Inspection</h3>
                      <div className="flex items-center gap-3 mt-1.5">
                         <span className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest">{activeTab === 'calls' ? 'Voice Session' : 'Lead Generation'}</span>
                         <span className="text-slate-300 text-xs">•</span>
                         <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">REF: {selectedRecord.id || selectedRecord.call_id || '---'}</span>
                      </div>
                   </div>
                </div>
                <button onClick={() => setSelectedRecord(null)} className="p-3 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full text-slate-500 border border-slate-100 dark:border-slate-700 transition-all active:scale-90"><X size={24} /></button>
             </div>

             {/* Modal Body with All Key-Value Pairs */}
             <div className="flex-1 overflow-y-auto p-10 custom-scrollbar">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                   
                   {/* Full Field List */}
                   <div className="space-y-6">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Core Attributes</p>
                      <div className="grid grid-cols-1 gap-4">
                         {Object.entries(selectedRecord).map(([key, value]) => {
                           if (typeof value === 'object' || String(value).length > 100 || key.includes('url') || key === 'transcript') return null;
                           return (
                             <div key={key} className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-100 dark:border-slate-700">
                                <span className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{formatHeader(key)}</span>
                                <span className="text-sm font-bold text-slate-800 dark:text-slate-200 break-words">{String(value)}</span>
                             </div>
                           );
                         })}
                      </div>

                      {/* Special Actions if URLs exist */}
                      {(selectedRecord.recording_url || selectedRecord.recording) && (
                         <div className="pt-6">
                            <a 
                              href={selectedRecord.recording_url || selectedRecord.recording} 
                              target="_blank" 
                              rel="noreferrer"
                              className="w-full flex items-center justify-center gap-3 py-4 bg-emerald-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-500/20"
                            >
                               <Play size={16} /> Play Session Audio
                            </a>
                         </div>
                      )}
                   </div>

                   {/* Long Text Areas (Transcript / Summary) */}
                   <div className="space-y-8">
                      {selectedRecord.transcript && (
                         <div className="flex flex-col h-full">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                               <FileText size={14} className="text-blue-500" /> Full Transcript
                            </p>
                            <div className="flex-1 bg-slate-900 dark:bg-slate-950 p-6 rounded-[32px] border border-slate-800 text-sm font-medium leading-relaxed text-slate-300 whitespace-pre-wrap max-h-[300px] overflow-y-auto custom-scrollbar-dark italic">
                               "{selectedRecord.transcript}"
                            </div>
                         </div>
                      )}
                      
                      {(selectedRecord.summary || selectedRecord.call_analysis?.call_summary) && (
                         <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                               <Database size={14} className="text-emerald-500" /> AI Insights
                            </p>
                            <div className="bg-blue-50 dark:bg-blue-900/10 p-6 rounded-[32px] border border-blue-100 dark:border-blue-900/30 text-sm font-bold leading-relaxed text-slate-700 dark:text-slate-300">
                               {selectedRecord.summary || selectedRecord.call_analysis.call_summary}
                            </div>
                         </div>
                      )}

                      {/* Catch-all for any other long text fields */}
                      {Object.entries(selectedRecord).map(([key, value]) => {
                        if (String(value).length > 100 && key !== 'transcript' && key !== 'summary' && !key.includes('url')) {
                          return (
                            <div key={key}>
                               <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">{formatHeader(key)}</p>
                               <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-[32px] border border-slate-100 dark:border-slate-700 text-sm leading-relaxed text-slate-600 dark:text-slate-400 whitespace-pre-wrap">
                                  {String(value)}
                               </div>
                            </div>
                          );
                        }
                        return null;
                      })}
                   </div>
                </div>
             </div>

             <div className="p-10 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex justify-end">
                <button onClick={() => setSelectedRecord(null)} className="px-10 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black text-xs uppercase tracking-widest transition-all active:scale-95 shadow-2xl">Close Asset File</button>
             </div>
          </div>
        </div>
      )}

      {/* Styles for the darker custom scrollbar in transcript */}
      <style>{`
        .custom-scrollbar-dark::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar-dark::-webkit-scrollbar-thumb {
          background: #334155;
          border-radius: 10px;
        }
        .custom-scrollbar-dark::-webkit-scrollbar-thumb:hover {
          background: #475569;
        }
      `}</style>
    </div>
  );
};

export default CallHistory;
