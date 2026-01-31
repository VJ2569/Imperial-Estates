
import React, { useEffect, useState, useCallback } from 'react';
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
  ShieldCheck,
  Activity,
  Trash2,
  Clock,
  ArrowRightLeft,
  DollarSign
} from 'lucide-react';
import { 
  fetchVoiceDirectCalls, 
  fetchWebhookCalls, 
  getStoredVoiceCalls,
  getStoredWebhookCalls,
  markIdAsDeleted,
  getDeletedIds
} from '../services/retellService';
import { isValid } from 'date-fns';

type ConsoleTab = 'voice' | 'enquiry';

const CallHistory: React.FC = () => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRecord, setSelectedRecord] = useState<any | null>(null);
  const [activeTab, setActiveTab] = useState<ConsoleTab>('voice');
  const [searchTerm, setSearchTerm] = useState('');

  // Whitelist for metadata display
  const VOICE_WHITELIST = [
    'call_status',
    'start_timestamp',
    'end_timestamp',
    'disconnection_reason',
    'to_number',
    'direction',
    'duration_display'
  ];

  const loadData = useCallback(async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    setError(null);
    try {
      const deletedIds = getDeletedIds();
      let result: any[] = [];
      
      // Pull latest snapshot from centralized GAS endpoint
      result = await fetchWebhookCalls();
      
      // If GAS fails or returns empty, and we are in Voice tab, try Retell directly as fallback
      if (result.length === 0 && activeTab === 'voice') {
          result = await fetchVoiceDirectCalls();
      }
      
      const filtered = result.filter(item => !deletedIds.includes(item.id || item.call_id));
      setData(filtered);
    } catch (err: any) {
      setError("Cloud Sync Standby: Connectivity to Intelligence Hub interrupted.");
    } finally {
      if (!isSilent) setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    loadData();
    
    // Auto-refresh when the browser tab gains focus
    const handleFocus = () => loadData(true);
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [loadData]);

  const handleDeleteRecord = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("Are you sure you want to permanently remove this record?")) {
      markIdAsDeleted(id);
      setData(prev => prev.filter(item => (item.id || item.call_id) !== id));
      if (selectedRecord && (selectedRecord.id === id || selectedRecord.call_id === id)) {
        setSelectedRecord(null);
      }
    }
  };

  const getISTString = (val: any) => {
    if (!val) return '---';
    const d = new Date(val);
    if (!isValid(d)) return String(val);
    return d.toLocaleString('en-IN', { 
        timeZone: 'Asia/Kolkata',
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
    });
  };

  const getHeaders = (): string[] => {
    if (data.length === 0) return [];
    if (activeTab === 'voice') {
      return ['call_status', 'start_timestamp', 'duration_display', 'cost_display'];
    }
    const allKeys = Array.from(new Set(data.slice(0, 5).flatMap(item => Object.keys(item || {})))) as string[];
    const skip = ['id', 'call_id', 'agent_id', 'metadata', 'transcript', 'recording_url', 'summary', 'call_analysis', '_source_origin'];
    return allKeys.filter(k => !skip.includes(k.toLowerCase())).slice(0, 5);
  };

  const formatHeader = (key: string) => key.replace(/_/g, ' ').toUpperCase();

  const renderCellValue = (key: string, value: any) => {
    if (value === null || value === undefined) return '---';
    if (key.toLowerCase().includes('timestamp') || key.toLowerCase().includes('date')) return getISTString(value);
    if (key === 'call_status') {
      return (
        <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${
          value === 'completed' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'
        }`}>
          {value}
        </span>
      );
    }
    const stringVal = String(value);
    return stringVal.length > 30 ? stringVal.substring(0, 27) + '...' : stringVal;
  };

  const headers = getHeaders();
  const filteredData = data.filter(item => {
    if (!searchTerm) return true;
    return Object.values(item).some(val => String(val).toLowerCase().includes(searchTerm.toLowerCase()));
  });

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto w-full animate-in fade-in duration-700 min-h-screen pb-32">
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-8 mb-12">
        <div>
          <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight uppercase">Receptionist Console</h2>
          <div className="flex items-center gap-10 mt-5 overflow-x-auto no-scrollbar pb-2">
            {[
              { id: 'voice', label: 'Intelligence Stream', icon: Activity },
              { id: 'enquiry', label: 'Google Hub Sync', icon: Database }
            ].map((tab) => (
              <button 
                key={tab.id}
                onClick={() => setActiveTab(tab.id as ConsoleTab)}
                className={`flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.25em] pb-3 border-b-2 transition-all whitespace-nowrap ${activeTab === tab.id ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
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
               placeholder="Search snapshot logs..." 
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
               className="pl-12 pr-6 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs font-bold focus:ring-2 focus:ring-blue-500 outline-none w-full sm:w-72 shadow-sm transition-all"
             />
          </div>
          <button onClick={() => loadData()} className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-slate-600 dark:text-slate-300 hover:bg-slate-50 transition-all shadow-sm active:scale-95">
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

      <div className="bg-white dark:bg-slate-900 rounded-[48px] shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          {filteredData.length > 0 ? (
            <table className="w-full text-left border-collapse table-fixed min-w-[1000px]">
              <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-400 text-[10px] uppercase font-black tracking-[0.25em]">
                <tr>
                  {headers.map(header => (
                    <th key={header} className="px-10 py-6 border-b border-slate-100 dark:border-slate-800">{formatHeader(header)}</th>
                  ))}
                  <th className="px-10 py-6 text-right border-b border-slate-100 dark:border-slate-800 w-44">Operations</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredData.map((item, idx) => {
                  const id = item.id || item.call_id || `idx-${idx}`;
                  return (
                    <tr key={id} onClick={() => setSelectedRecord(item)} className="hover:bg-blue-50/20 dark:hover:bg-blue-900/10 transition-colors cursor-pointer group h-20">
                      {headers.map(header => (
                        <td key={header} className="px-10 py-2">
                          <span className="text-sm font-bold text-slate-700 dark:text-slate-200 block truncate">
                            {renderCellValue(header, item[header])}
                          </span>
                        </td>
                      ))}
                      <td className="px-10 py-2 text-right">
                         <div className="inline-flex items-center gap-3">
                            <div className="inline-flex items-center justify-center p-3 bg-slate-50 dark:bg-slate-800 group-hover:bg-blue-600 group-hover:text-white rounded-xl transition-all shadow-sm">
                               <Maximize2 size={16} />
                            </div>
                            <button onClick={(e) => handleDeleteRecord(id, e)} className="p-3 bg-slate-50 dark:bg-slate-800 hover:bg-rose-500 hover:text-white rounded-xl transition-all shadow-sm">
                               <Trash2 size={16} />
                            </button>
                         </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <div className="p-32 text-center">
              {!loading ? (
                <>
                  <Inbox className="mx-auto text-slate-100 dark:text-slate-800 mb-8" size={80} />
                  <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-3 uppercase tracking-tight">Stream Standby</h3>
                  <p className="text-slate-500 text-sm max-w-sm mx-auto font-medium">No records synced from Google Hub. Tap refresh to update.</p>
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

      {selectedRecord && (
        <div className="fixed inset-0 bg-slate-950/95 backdrop-blur-2xl flex items-center justify-center p-6 z-[100] animate-in fade-in duration-300" onClick={() => setSelectedRecord(null)}>
          <div className="bg-white dark:bg-slate-900 rounded-[56px] max-w-6xl w-full max-h-[92vh] flex flex-col shadow-3xl overflow-hidden border border-slate-200 dark:border-slate-800" onClick={e => e.stopPropagation()}>
             <div className="p-10 pb-8 flex justify-between items-start border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40">
                <div className="flex items-center gap-7">
                   <div className="w-16 h-16 bg-blue-600 rounded-[24px] flex items-center justify-center text-white shadow-2xl shadow-blue-500/30">
                      {activeTab === 'voice' ? <Activity size={28} /> : <Database size={28} />}
                   </div>
                   <div>
                      <h3 className="font-black text-2xl text-slate-900 dark:text-white tracking-tighter uppercase leading-none">Intelligence Inspection</h3>
                      <div className="flex items-center gap-4 mt-3">
                         <span className="px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest bg-blue-100 text-blue-700">Unified Snapshot</span>
                         <span className="text-slate-300">•</span>
                         <span className="text-xs font-bold text-slate-500">REF: {selectedRecord.id || selectedRecord.call_id || '---'}</span>
                      </div>
                   </div>
                </div>
                <button onClick={() => setSelectedRecord(null)} className="p-3 bg-white dark:bg-slate-800 hover:bg-rose-50 dark:hover:bg-rose-900/20 hover:text-rose-600 rounded-full border border-slate-100 dark:border-slate-700 shadow-sm transition-all"><X size={20} /></button>
             </div>

             <div className="flex-1 overflow-y-auto p-10 custom-scrollbar">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                   <div className="space-y-8">
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-6">Standard Telemetry (IST)</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                           {Object.entries(selectedRecord as Record<string, any>).map(([key, value]) => {
                             if (activeTab === 'voice' && !VOICE_WHITELIST.includes(key) && !key.toLowerCase().includes('status')) return null;
                             if (typeof value === 'object' || Array.isArray(value) || key.startsWith('_') || ['transcript', 'summary', 'recording_url', 'recording'].includes(key)) return null;
                             return (
                               <div key={key} className="bg-slate-50 dark:bg-slate-800/40 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 group hover:border-blue-500/50 transition-colors">
                                  <span className="flex items-center gap-1.5 text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">{formatHeader(key)}</span>
                                  <span className="text-sm font-bold text-slate-900 dark:text-white break-words">{key.toLowerCase().includes('timestamp') ? getISTString(value) : String(value)}</span>
                               </div>
                             );
                           })}
                        </div>
                      </div>
                   </div>

                   <div className="space-y-10">
                      {(selectedRecord.transcript) && (
                         <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-5 flex items-center gap-2"><FileText size={14} className="text-blue-500" /> Session Transcript</p>
                            <div className="bg-slate-950 p-8 rounded-[40px] text-sm font-medium leading-relaxed text-slate-300 whitespace-pre-wrap max-h-[350px] overflow-y-auto custom-scrollbar-dark italic border border-slate-800 shadow-inner">"{selectedRecord.transcript}"</div>
                         </div>
                      )}
                      {(selectedRecord.summary || selectedRecord.call_analysis?.call_summary) && (
                         <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-5 flex items-center gap-2"><ShieldCheck size={14} className="text-emerald-500" /> AI Insights</p>
                            <div className="bg-blue-600 p-8 rounded-[40px] text-sm font-black leading-relaxed text-white shadow-2xl shadow-blue-500/20">{selectedRecord.summary || selectedRecord.call_analysis?.call_summary}</div>
                         </div>
                      )}
                   </div>
                </div>
             </div>

             <div className="p-10 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex justify-end">
                <button onClick={() => setSelectedRecord(null)} className="px-12 py-5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-[24px] font-black text-[10px] uppercase tracking-[0.25em] transition-all hover:scale-105 shadow-2xl">Return to Stream</button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CallHistory;
