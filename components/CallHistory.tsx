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
  User,
  ShieldCheck,
  Activity,
  DollarSign
} from 'lucide-react';
import { 
  fetchRetellDirectCalls, 
  fetchWebhookCalls, 
  fetchLeads,
  getStoredRetellCalls,
  getStoredWebhookCalls,
  getStoredLeads 
} from '../services/retellService';
import { format, isValid } from 'date-fns';

type ConsoleTab = 'intelligence' | 'webhook' | 'leads';

const CallHistory: React.FC = () => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRecord, setSelectedRecord] = useState<any | null>(null);
  const [activeTab, setActiveTab] = useState<ConsoleTab>('intelligence');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    // Initial cache load to prevent flicker
    const cached = 
      activeTab === 'intelligence' ? getStoredRetellCalls() :
      activeTab === 'webhook' ? getStoredWebhookCalls() :
      getStoredLeads();
    
    setData(cached);
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      let result: any[] = [];
      if (activeTab === 'intelligence') result = await fetchRetellDirectCalls();
      else if (activeTab === 'webhook') result = await fetchWebhookCalls();
      else result = await fetchLeads();
      
      setData(Array.isArray(result) ? result : []);
    } catch (err: any) {
      setError("Sync Failed: Check network connectivity or CORS settings on n8n.");
    } finally {
      setLoading(false);
    }
  };

  // Determine headers based on current data
  const getDynamicHeaders = () => {
    if (data.length === 0) return [];
    
    // Scan all items to find all available keys
    const allKeys = Array.from(new Set(data.slice(0, 10).flatMap(item => Object.keys(item))));
    
    // System fields to exclude from table
    const skipKeys = [
      'id', 'call_id', 'call_session_id', 'agent_id', 'metadata', 
      'transcript', 'recording_url', 'call_analysis', 'summary',
      'webhook_id', 'webhook_source', 'is_deleted', 'public_log_id'
    ];
    
    // Return max 6 keys for table cleanliness
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
    
    // Date formatting
    if (key.toLowerCase().includes('timestamp') || key.toLowerCase().includes('date') || key.toLowerCase().includes('time')) {
      const d = new Date(typeof value === 'number' ? value : value);
      if (isValid(d)) return format(d, 'MMM d, p');
    }

    // Money formatting
    if (key.toLowerCase().includes('cost')) {
      return `$${Number(value).toFixed(2)}`;
    }

    // Duration formatting (ms to mins)
    if (key.toLowerCase().includes('duration') && typeof value === 'number') {
      const mins = Math.floor(value / 1000 / 60);
      const secs = Math.floor((value / 1000) % 60);
      return `${mins}m ${secs}s`;
    }

    // Truncate long strings for standardized row height
    const stringVal = String(value);
    if (stringVal.length > 35) {
      return stringVal.substring(0, 32) + '...';
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
    <div className="p-4 md:p-8 max-w-7xl mx-auto w-full animate-in fade-in duration-700">
      
      {/* Header & Sub-Navigation */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-8 mb-12">
        <div>
          <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Receptionist Console</h2>
          <div className="flex items-center gap-8 mt-5">
            {[
              { id: 'intelligence', label: 'Voice Intelligence', icon: Activity },
              { id: 'webhook', label: 'Data Stream', icon: Database },
              { id: 'leads', label: 'Enquiry Hub', icon: User }
            ].map((tab) => (
              <button 
                key={tab.id}
                onClick={() => setActiveTab(tab.id as ConsoleTab)}
                className={`flex items-center gap-2.5 text-[10px] font-black uppercase tracking-[0.25em] pb-3 border-b-2 transition-all ${activeTab === tab.id ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
              >
                <tab.icon size={14} />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative">
             <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
             <input 
               type="text" 
               placeholder="Filter console..." 
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
               className="pl-12 pr-6 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs font-bold focus:ring-2 focus:ring-blue-500 outline-none w-72 shadow-sm transition-all"
             />
          </div>
          <button onClick={loadData} className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-slate-600 dark:text-slate-300 hover:bg-slate-50 hover:scale-105 transition-all shadow-sm">
            <RefreshCcw size={20} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-8 p-6 bg-rose-50 dark:bg-rose-900/20 border border-rose-100 dark:border-rose-800 rounded-[32px] flex items-center gap-4 text-rose-600 dark:text-rose-400 shadow-sm">
          <AlertCircle size={24} />
          <div>
            <p className="font-black text-sm uppercase tracking-widest leading-none">External Protocol Failure</p>
            <p className="text-xs font-medium opacity-80 mt-1.5">{error}</p>
          </div>
        </div>
      )}

      {/* Main Data View - Standardized Row Heights */}
      <div className="bg-white dark:bg-slate-900 rounded-[48px] shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          {filteredData.length > 0 ? (
            <table className="w-full text-left border-collapse table-fixed min-w-[1000px]">
              <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-400 text-[10px] uppercase font-black tracking-widest">
                <tr>
                  {headers.map(header => (
                    <th key={header} className="px-10 py-6 border-b border-slate-100 dark:border-slate-800">{formatHeader(header)}</th>
                  ))}
                  <th className="px-10 py-6 text-right border-b border-slate-100 dark:border-slate-800 w-40">Inspect</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredData.map((item, idx) => (
                  <tr 
                    key={item.id || item.call_id || idx} 
                    onClick={() => setSelectedRecord(item)}
                    className="hover:bg-blue-50/20 dark:hover:bg-blue-900/10 transition-colors cursor-pointer group h-20"
                  >
                    {headers.map(header => (
                      <td key={header} className="px-10 py-2">
                        <span className="text-sm font-bold text-slate-700 dark:text-slate-200 block truncate">
                          {renderCellValue(header, item[header])}
                        </span>
                      </td>
                    ))}
                    <td className="px-10 py-2 text-right">
                       <div className="inline-flex items-center justify-center p-2.5 bg-slate-50 dark:bg-slate-800 group-hover:bg-blue-600 group-hover:text-white rounded-xl transition-all">
                          <Maximize2 size={16} />
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
                  <Inbox className="mx-auto text-slate-100 dark:text-slate-800 mb-8" size={80} />
                  <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-3 uppercase tracking-tight">No Active Streams</h3>
                  <p className="text-slate-500 text-sm max-w-xs mx-auto font-medium">Verify your API configurations and webhook triggers to begin syncing operational data.</p>
                </>
              ) : (
                <div className="flex flex-col items-center gap-8">
                  <div className="relative w-16 h-16">
                     <div className="absolute inset-0 border-4 border-blue-500/20 rounded-full" />
                     <div className="absolute inset-0 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                  </div>
                  <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">Negotiating External Handshake...</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Record Inspection Modal */}
      {selectedRecord && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-2xl flex items-center justify-center p-6 z-[100] animate-in fade-in duration-300" onClick={() => setSelectedRecord(null)}>
          <div className="bg-white dark:bg-slate-900 rounded-[56px] max-w-5xl w-full max-h-[92vh] flex flex-col shadow-3xl overflow-hidden border border-slate-200 dark:border-slate-800" onClick={e => e.stopPropagation()}>
             
             {/* Modal Header */}
             <div className="p-12 pb-8 flex justify-between items-start border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40">
                <div className="flex items-center gap-7">
                   <div className="w-20 h-20 bg-blue-600 rounded-[30px] flex items-center justify-center text-white shadow-2xl shadow-blue-500/30">
                      {activeTab === 'intelligence' ? <Activity size={36} /> : activeTab === 'leads' ? <User size={36} /> : <Database size={36} />}
                   </div>
                   <div>
                      <h3 className="font-black text-3xl text-slate-900 dark:text-white tracking-tighter uppercase">Operational Asset #{selectedRecord.id?.slice(0,8) || selectedRecord.call_id?.slice(0,8) || 'RAW'}</h3>
                      <div className="flex items-center gap-4 mt-2.5">
                         <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${activeTab === 'intelligence' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'}`}>
                           {activeTab.toUpperCase()} PROTOCOL
                         </span>
                         <span className="text-slate-300">•</span>
                         <span className="text-xs font-bold text-slate-500">{format(new Date(selectedRecord.start_timestamp || selectedRecord.timestamp || Date.now()), 'PPPP p')}</span>
                      </div>
                   </div>
                </div>
                <button onClick={() => setSelectedRecord(null)} className="p-4 bg-white dark:bg-slate-800 hover:bg-rose-50 dark:hover:bg-rose-900/20 hover:text-rose-600 rounded-full border border-slate-100 dark:border-slate-700 transition-all active:scale-90"><X size={24} /></button>
             </div>

             {/* Modal Body */}
             <div className="flex-1 overflow-y-auto p-12 custom-scrollbar">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                   
                   {/* Left Column: Properties */}
                   <div className="space-y-8">
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-6">Asset Key/Value Pairs</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                           {Object.entries(selectedRecord).map(([key, value]) => {
                             // Skip large objects or long strings here
                             if (typeof value === 'object' || String(value).length > 80 || key.includes('url') || key === 'transcript' || key === 'summary') return null;
                             return (
                               <div key={key} className="bg-slate-50 dark:bg-slate-800/40 p-5 rounded-2xl border border-slate-100 dark:border-slate-800">
                                  <span className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">{formatHeader(key)}</span>
                                  <span className="text-sm font-bold text-slate-900 dark:text-white break-words">{String(value)}</span>
                               </div>
                             );
                           })}
                        </div>
                      </div>

                      {/* Enriched Media Actions */}
                      {(selectedRecord.recording_url || selectedRecord.recording) && (
                         <div className="bg-emerald-50 dark:bg-emerald-900/10 p-8 rounded-[40px] border border-emerald-100 dark:border-emerald-800/30">
                            <div className="flex items-center gap-4 mb-6">
                               <div className="p-3 bg-emerald-600 text-white rounded-2xl"><Phone size={24} /></div>
                               <div>
                                  <h4 className="font-black text-slate-900 dark:text-white uppercase text-sm">Media Playback</h4>
                                  <p className="text-xs text-emerald-600 font-bold">Encrypted Session Recording</p>
                               </div>
                            </div>
                            <a 
                              href={selectedRecord.recording_url || selectedRecord.recording} 
                              target="_blank" 
                              rel="noreferrer"
                              className="w-full flex items-center justify-center gap-3 py-4 bg-emerald-600 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-500/20 active:scale-95"
                            >
                               <Play size={18} fill="currentColor" /> Initialize Audio Link
                            </a>
                         </div>
                      )}
                   </div>

                   {/* Right Column: Narrative Data */}
                   <div className="space-y-10">
                      {selectedRecord.transcript && (
                         <div className="flex flex-col">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-5 flex items-center gap-2">
                               <FileText size={14} className="text-blue-500" /> Interaction Log
                            </p>
                            <div className="bg-slate-900 p-8 rounded-[40px] text-sm font-medium leading-relaxed text-slate-300 whitespace-pre-wrap max-h-[350px] overflow-y-auto custom-scrollbar-dark italic border border-slate-800">
                               "{selectedRecord.transcript}"
                            </div>
                         </div>
                      )}
                      
                      {(selectedRecord.summary || selectedRecord.call_analysis?.call_summary) && (
                         <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-5 flex items-center gap-2">
                               <ShieldCheck size={14} className="text-emerald-500" /> AI Semantic Analysis
                            </p>
                            <div className="bg-blue-600 p-8 rounded-[40px] text-sm font-black leading-relaxed text-white shadow-2xl shadow-blue-500/20">
                               {selectedRecord.summary || selectedRecord.call_analysis.call_summary}
                            </div>
                         </div>
                      )}

                      {/* Display any extra long-text fields found dynamically */}
                      {Object.entries(selectedRecord).map(([key, value]) => {
                        if (String(value).length > 80 && key !== 'transcript' && key !== 'summary' && !key.includes('url')) {
                          return (
                            <div key={key}>
                               <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-5">{formatHeader(key)}</p>
                               <div className="bg-slate-50 dark:bg-slate-800 p-8 rounded-[40px] border border-slate-100 dark:border-slate-800 text-sm leading-relaxed text-slate-600 dark:text-slate-400 whitespace-pre-wrap font-medium">
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

             <div className="p-12 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex justify-end">
                <button onClick={() => setSelectedRecord(null)} className="px-12 py-5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-[24px] font-black text-xs uppercase tracking-[0.25em] hover:scale-105 transition-all shadow-2xl">Dismiss Inspection</button>
             </div>
          </div>
        </div>
      )}

      <style>{`
        .custom-scrollbar-dark::-webkit-scrollbar { width: 5px; }
        .custom-scrollbar-dark::-webkit-scrollbar-thumb { background: #334155; border-radius: 10px; }
        .custom-scrollbar-dark::-webkit-scrollbar-thumb:hover { background: #475569; }
      `}</style>
    </div>
  );
};

export default CallHistory;
