
import React, { useEffect, useState } from 'react';
import { 
  Play, 
  FileText, 
  RefreshCcw, 
  X, 
  ChevronRight, 
  Inbox, 
  AlertCircle,
  ExternalLink,
  Database
} from 'lucide-react';
import { fetchRetellCalls, fetchLeads } from '../services/retellService';
import { format, isValid } from 'date-fns';

const CallHistory: React.FC = () => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedLongText, setSelectedLongText] = useState<{title: string, content: string} | null>(null);
  const [activeTab, setActiveTab] = useState<'calls' | 'leads'>('calls');

  useEffect(() => {
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
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Dynamically determine headers from the data keys
  const getDynamicHeaders = () => {
    if (data.length === 0) return [];
    // Get all unique keys from all objects in the array
    const allKeys = Array.from(new Set(data.flatMap(item => Object.keys(item))));
    
    // Filter out internal/clutter keys
    const skipKeys = ['id', 'call_id', 'call_session_id', 'agent_id', 'metadata', 'transcript', 'recording_url', 'call_analysis'];
    return allKeys.filter(key => !skipKeys.includes(key));
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
    if (key.includes('timestamp') || key.includes('date')) {
      const d = new Date(value);
      if (isValid(d)) return format(d, 'MMM d, p');
    }

    // Handle Booleans
    if (typeof value === 'boolean') {
      return value ? (
        <span className="text-emerald-500 font-black">YES</span>
      ) : (
        <span className="text-rose-500 font-black">NO</span>
      );
    }

    // Handle Objects
    if (typeof value === 'object') return JSON.stringify(value).substring(0, 20) + '...';

    return String(value);
  };

  const headers = getDynamicHeaders();

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto w-full">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <div>
          <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">Receptionist Console</h2>
          <div className="flex items-center gap-4 mt-3">
            <button 
              onClick={() => setActiveTab('calls')}
              className={`text-[10px] font-black uppercase tracking-[0.2em] pb-1 border-b-2 transition-all ${activeTab === 'calls' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-400'}`}
            >
              Voice Webhook
            </button>
            <button 
              onClick={() => setActiveTab('leads')}
              className={`text-[10px] font-black uppercase tracking-[0.2em] pb-1 border-b-2 transition-all ${activeTab === 'leads' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-400'}`}
            >
              Leads Webhook
            </button>
          </div>
        </div>

        <button onClick={loadData} className="flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-black uppercase tracking-widest text-slate-600 dark:text-slate-300 hover:bg-slate-50 transition-all shadow-sm">
          <RefreshCcw size={16} className={loading ? 'animate-spin' : ''} />
          Refresh Data
        </button>
      </div>

      {error && (
        <div className="mb-8 p-6 bg-rose-50 dark:bg-rose-900/20 border border-rose-100 dark:border-rose-800 rounded-[32px] flex items-center gap-4 text-rose-600 dark:text-rose-400">
          <AlertCircle size={24} />
          <div>
            <p className="font-black text-sm uppercase tracking-widest">Connection Blocked (CORS)</p>
            <p className="text-xs font-medium opacity-80 mt-1">Your n8n server is rejecting requests from this domain. Please enable CORS in n8n environment variables.</p>
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-slate-900 rounded-[40px] shadow-sm border border-gray-200 dark:border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          {data.length > 0 ? (
            <table className="w-full text-left border-collapse min-w-[1000px]">
              <thead className="bg-gray-50 dark:bg-slate-800/50 text-gray-500 dark:text-gray-400 text-[10px] uppercase font-black tracking-widest">
                <tr>
                  {headers.map(header => (
                    <th key={header} className="px-8 py-5">{formatHeader(header)}</th>
                  ))}
                  <th className="px-8 py-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
                {data.map((item, idx) => (
                  <tr key={item.id || item.call_id || idx} className="hover:bg-gray-50 dark:hover:bg-slate-800/30 transition-colors group">
                    {headers.map(header => (
                      <td key={header} className="px-8 py-6">
                        <span className="text-sm font-bold text-slate-700 dark:text-slate-200">
                          {renderCellValue(header, item[header])}
                        </span>
                      </td>
                    ))}
                    <td className="px-8 py-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {item.recording_url && (
                          <a href={item.recording_url} target="_blank" rel="noreferrer" className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors">
                            <Play size={18} />
                          </a>
                        )}
                        {item.transcript && (
                          <button 
                            onClick={() => setSelectedLongText({title: 'Call Transcript', content: item.transcript})}
                            className="p-2 text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                          >
                            <FileText size={18} />
                          </button>
                        )}
                        {item.call_analysis?.call_summary && (
                          <button 
                            onClick={() => setSelectedLongText({title: 'AI Summary', content: item.call_analysis.call_summary})}
                            className="p-2 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-lg transition-colors"
                          >
                            <Database size={18} />
                          </button>
                        )}
                        <ChevronRight size={18} className="text-slate-300 group-hover:translate-x-1 transition-transform ml-2" />
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
                  <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2 uppercase tracking-tight">No Data Streamed</h3>
                  <p className="text-slate-500 text-sm max-w-xs mx-auto font-medium">Connect your n8n webhook. Columns will generate automatically based on the incoming JSON payload.</p>
                </>
              ) : (
                <div className="flex flex-col items-center gap-4">
                  <RefreshCcw className="animate-spin text-blue-500" size={40} />
                  <p className="text-xs font-black uppercase tracking-widest text-slate-400">Syncing dynamic columns...</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Dynamic Detail Modal for Transcripts/Summaries */}
      {selectedLongText && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-[100]" onClick={() => setSelectedLongText(null)}>
          <div className="bg-white dark:bg-slate-900 rounded-[40px] max-w-2xl w-full p-10 shadow-3xl animate-in zoom-in-95" onClick={e => e.stopPropagation()}>
             <div className="flex justify-between items-center mb-8 pb-4 border-b border-gray-100 dark:border-slate-800">
                <h3 className="font-black text-2xl text-slate-900 dark:text-white uppercase tracking-tight">{selectedLongText.title}</h3>
                <button onClick={() => setSelectedLongText(null)} className="p-3 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-slate-500 transition-all"><X size={24} /></button>
             </div>
             <div className="max-h-[60vh] overflow-y-auto p-8 bg-slate-50 dark:bg-slate-950 rounded-[32px] text-sm leading-relaxed text-slate-700 dark:text-slate-300 whitespace-pre-wrap font-medium border border-slate-100 dark:border-slate-800 custom-scrollbar">
                {selectedLongText.content}
             </div>
             <div className="mt-8 flex justify-end">
                <button onClick={() => setSelectedLongText(null)} className="px-8 py-3 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-2xl font-black text-xs uppercase tracking-widest transition-all active:scale-95">Close View</button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CallHistory;
