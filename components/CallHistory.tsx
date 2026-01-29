
import React, { useEffect, useState } from 'react';
import { 
  Play, 
  FileText, 
  RefreshCcw, 
  X, 
  Inbox, 
  AlertCircle,
  Database,
  Search,
  Maximize2,
  Phone,
  User,
  ShieldCheck,
  Activity,
  Zap,
  Clock,
  DollarSign
} from 'lucide-react';
import { 
  fetchRetellDirectCalls, 
  fetchWebhookCalls, 
  getStoredRetellCalls,
  getStoredWebhookCalls 
} from '../services/retellService';
import { format, isValid } from 'date-fns';

type ConsoleTab = 'voice' | 'enquiry';

const CallHistory: React.FC = () => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRecord, setSelectedRecord] = useState<any | null>(null);
  const [activeTab, setActiveTab] = useState<ConsoleTab>('voice');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    // Immediate cache load
    const cached = activeTab === 'voice' ? getStoredRetellCalls() : getStoredWebhookCalls();
    setData(cached);
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      let result: any[] = [];
      if (activeTab === 'voice') {
        result = await fetchRetellDirectCalls();
      } else {
        result = await fetchWebhookCalls();
      }
      setData(Array.isArray(result) ? result : []);
    } catch (err: any) {
      setError("Protocol Sync Interrupted: Check your API Keys and Webhook availability.");
    } finally {
      setLoading(false);
    }
  };

  // Determine headers dynamically based on current source
  const getHeaders = () => {
    if (data.length === 0) return [];
    
    if (activeTab === 'voice') {
      // Direct API has fixed high-priority fields
      return ['call_status', 'start_timestamp', 'customer_number', 'duration_display'];
    }

    // Webhook leads are fully dynamic
    const allKeys = Array.from(new Set(data.slice(0, 5).flatMap(item => Object.keys(item))));
    const skip = ['id', 'call_id', 'agent_id', 'metadata', 'transcript', 'recording_url', 'summary', 'call_analysis', '_source_origin'];
    return allKeys.filter(k => !skip.includes(k)).slice(0, 5);
  };

  const formatHeader = (key: string) => {
    return key.replace(/_/g, ' ').toUpperCase();
  };

  const renderCellValue = (key: string, value: any) => {
    if (value === null || value === undefined) return '---';
    
    // Dates
    if (key.toLowerCase().includes('timestamp') || key.toLowerCase().includes('date')) {
      const d = new Date(value);
      return isValid(d) ? format(d, 'MMM d, p') : String(value);
    }

    // Status colors
    if (key === 'call_status') {
      return <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${value === 'completed' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'}`}>{value}</span>;
    }

    const stringVal = String(value);
    return stringVal.length > 35 ? stringVal.substring(0, 32) + '...' : stringVal;
  };

  const headers = getHeaders();
  const filteredData = data.filter(item => {
    if (!searchTerm) return true;
    return Object.values(item).some(val => 
      String(val).toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto w-full animate-in fade-in duration-700">
      
      {/* Console Header */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-8 mb-12">
        <div>
          <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight uppercase">Receptionist Console</h2>
          <div className="flex items-center gap-10 mt-5">
            {[
              { id: 'voice', label: 'Voice Stream (Retell API)', icon: Activity },
              { id: 'enquiry', label: 'Enquiry Hub (Webhook)', icon: Database }
            ].map((tab) => (
              <button 
                key={tab.id}
                onClick={() => setActiveTab(tab.id as ConsoleTab)}
                className={`flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.25em] pb-3 border-b-2 transition-all ${activeTab === tab.id ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
              >
                <tab.icon size={16} />
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
               placeholder="Filter session logs..." 
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
               className="pl-12 pr-6 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs font-bold focus:ring-2 focus:ring-blue-500 outline-none w-72 shadow-sm transition-all"
             />
          </div>
          <button onClick={loadData} className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-slate-600 dark:text-slate-300 hover:bg-slate-50 transition-all shadow-sm active:scale-95">
            <RefreshCcw size={20} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-8 p-6 bg-rose-50 dark:bg-rose-900/20 border border-rose-100 dark:border-rose-800 rounded-3xl flex items-center gap-4 text-rose-600 dark:text-rose-400">
          <AlertCircle size={24} />
          <p className="text-[11px] font-black uppercase tracking-widest leading-none">{error}</p>
        </div>
      )}

      {/* Main Stream Table */}
      <div className="bg-white dark:bg-slate-900 rounded-[48px] shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          {filteredData.length > 0 ? (
            <table className="w-full text-left border-collapse table-fixed min-w-[1000px]">
              <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-400 text-[10px] uppercase font-black tracking-[0.25em]">
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
                       <div className="inline-flex items-center justify-center p-3 bg-slate-50 dark:bg-slate-800 group-hover:bg-blue-600 group-hover:text-white rounded-xl transition-all shadow-sm">
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
                  <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-3 uppercase tracking-tight">Stream Standby</h3>
                  <p className="text-slate-500 text-sm max-w-sm mx-auto font-medium">No records matching your search or configured APIs were found. Adjust your settings to sync data.</p>
                </>
              ) : (
                <div className="flex flex-col items-center gap-8">
                  <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                  <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">Syncing Intelligence Engine...</p>
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
                      {activeTab === 'voice' ? <Activity size={36} /> : <Database size={36} />}
                   </div>
                   <div>
                      <h3 className="font-black text-3xl text-slate-900 dark:text-white tracking-tighter uppercase leading-none">Record Inspection</h3>
                      <div className="flex items-center gap-4 mt-4">
                         <span className="px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-blue-100 text-blue-700">
                           {activeTab === 'voice' ? 'Direct Retell API' : 'Operational Webhook'}
                         </span>
                         <span className="text-slate-300">•</span>
                         <span className="text-xs font-bold text-slate-500">REF: {selectedRecord.call_id || selectedRecord.id || '---'}</span>
                      </div>
                   </div>
                </div>
                <button onClick={() => setSelectedRecord(null)} className="p-4 bg-white dark:bg-slate-800 hover:bg-rose-50 dark:hover:bg-rose-900/20 hover:text-rose-600 rounded-full border border-slate-100 dark:border-slate-700 transition-all active:scale-90"><X size={24} /></button>
             </div>

             {/* Modal Body */}
             <div className="flex-1 overflow-y-auto p-12 custom-scrollbar">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                   
                   <div className="space-y-8">
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-6">Core Telemetry</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                           {Object.entries(selectedRecord).map(([key, value]) => {
                             if (typeof value === 'object' || String(value).length > 80 || key.includes('url') || key === 'transcript' || key === 'summary' || key.startsWith('_')) return null;
                             return (
                               <div key={key} className="bg-slate-50 dark:bg-slate-800/40 p-5 rounded-2xl border border-slate-100 dark:border-slate-800">
                                  <span className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">{formatHeader(key)}</span>
                                  <span className="text-sm font-bold text-slate-900 dark:text-white break-words">{String(value)}</span>
                               </div>
                             );
                           })}
                        </div>
                      </div>

                      {(selectedRecord.recording_url || selectedRecord.recording) && (
                         <div className="bg-emerald-50 dark:bg-emerald-900/10 p-8 rounded-[40px] border border-emerald-100 dark:border-emerald-800/30">
                            <div className="flex items-center gap-4 mb-6">
                               <div className="p-3 bg-emerald-600 text-white rounded-2xl shadow-lg shadow-emerald-500/30"><Phone size={24} /></div>
                               <div>
                                  <h4 className="font-black text-slate-900 dark:text-white uppercase text-sm">Media Vault</h4>
                                  <p className="text-xs text-emerald-600 font-bold uppercase tracking-widest">Recording Active</p>
                               </div>
                            </div>
                            <a 
                              href={selectedRecord.recording_url || selectedRecord.recording} 
                              target="_blank" 
                              rel="noreferrer"
                              className="w-full flex items-center justify-center gap-3 py-4 bg-emerald-600 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-500/20 active:scale-95"
                            >
                               <Play size={18} fill="currentColor" /> Play Session
                            </a>
                         </div>
                      )}
                   </div>

                   <div className="space-y-10">
                      {selectedRecord.transcript && (
                         <div className="flex flex-col">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-5 flex items-center gap-2">
                               <FileText size={14} className="text-blue-500" /> Session Transcript
                            </p>
                            <div className="bg-slate-950 p-8 rounded-[40px] text-sm font-medium leading-relaxed text-slate-300 whitespace-pre-wrap max-h-[350px] overflow-y-auto custom-scrollbar-dark italic border border-slate-800 shadow-inner">
                               "{selectedRecord.transcript}"
                            </div>
                         </div>
                      )}
                      
                      {(selectedRecord.summary || selectedRecord.call_analysis?.call_summary) && (
                         <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-5 flex items-center gap-2">
                               <ShieldCheck size={14} className="text-emerald-500" /> AI Insights
                            </p>
                            <div className="bg-blue-600 p-8 rounded-[40px] text-sm font-black leading-relaxed text-white shadow-2xl shadow-blue-500/20">
                               {selectedRecord.summary || selectedRecord.call_analysis.call_summary}
                            </div>
                         </div>
                      )}

                      {/* Display any extra long text fields dynamically */}
                      {Object.entries(selectedRecord).map(([key, value]) => {
                        if (String(value).length > 80 && !key.startsWith('_') && key !== 'transcript' && key !== 'summary' && !key.includes('url')) {
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
                <button onClick={() => setSelectedRecord(null)} className="px-12 py-5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-[24px] font-black text-xs uppercase tracking-[0.25em] transition-all hover:scale-105 active:scale-95 shadow-2xl">Return to Stream</button>
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
