import React, { useEffect, useState } from 'react';
import { Play, FileText, CheckCircle2, XCircle, RefreshCcw, User, X, Filter, Settings, Clock, AlertCircle } from 'lucide-react';
import { fetchRetellCalls, getStoredRetellCalls } from '../services/vapiService'; // Reusing file for simplicity
import { RetellCall, Assistant } from '../types';
import { format } from 'date-fns';

const CallHistory: React.FC = () => {
  const [calls, setCalls] = useState<RetellCall[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTranscript, setSelectedTranscript] = useState<string | null>(null);
  
  const [agents, setAgents] = useState<Assistant[]>([]);
  const [selectedAgentId, setSelectedAgentId] = useState<string>('all');

  useEffect(() => {
    loadAgents();
  }, []);

  useEffect(() => {
    loadCalls();
  }, [agents]);

  const loadAgents = () => {
      const storedIds = localStorage.getItem('retell_agent_ids');
      if (storedIds) {
          try {
              const parsed = JSON.parse(storedIds);
              setAgents(Array.isArray(parsed) ? parsed : []);
          } catch (e) { console.error(e); }
      }
      
      if (!storedIds || JSON.parse(storedIds).length === 0) {
          const legacyId = localStorage.getItem('retell_agent_id');
          if (legacyId) {
              setAgents([{ id: legacyId, name: 'Main Agent' }]);
          }
      }
  };

  const loadCalls = async () => {
    const cached = getStoredRetellCalls();
    if (cached.length > 0) {
        setCalls(cached);
        setLoading(false);
    } else {
        setLoading(true);
    }

    const data = await fetchRetellCalls();
    setCalls(data);
    setLoading(false);
  };

  const getCallDuration = (call: RetellCall): number => {
    if (typeof call.duration_ms === 'number') return call.duration_ms / 1000;
    if (call.start_timestamp && call.end_timestamp) {
        return (call.end_timestamp - call.start_timestamp) / 1000;
    }
    return 0;
  };

  const formatDuration = (call: RetellCall) => {
    const seconds = getCallDuration(call);
    if (seconds <= 0) return '0s';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
  };

  const renderStatus = (call: RetellCall) => {
      // Prioritize Success Evaluation from Retell's Analysis
      const isSuccessful = call.call_analysis?.call_successful;

      if (isSuccessful === true) {
          return (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800">
                <CheckCircle2 size={12} />
                Success
            </span>
          );
      }

      if (isSuccessful === false) {
          return (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-rose-50 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400 border border-rose-100 dark:border-rose-800">
                <XCircle size={12} />
                Unsuccessful
            </span>
          );
      }

      // Fallback to technical status
      if (call.call_status === 'completed') {
          return (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                <CheckCircle2 size={12} />
                Completed
            </span>
          );
      }

      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border border-blue-100 dark:border-blue-800 capitalize">
            <AlertCircle size={12} />
            {call.call_status}
        </span>
      );
  };

  const filteredCalls = calls.filter(call => {
      if (selectedAgentId !== 'all') {
          return call.agent_id === selectedAgentId;
      }
      return true;
  });

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto w-full">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 md:mb-8">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">Receptionist Logs (Retell AI)</h2>
          <p className="text-gray-500 dark:text-gray-400 text-xs md:text-sm">Success-evaluated call history</p>
        </div>
        
        <div className="flex items-center gap-3">
            {agents.length > 1 && (
                <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none">
                        <Filter size={16} />
                    </div>
                    <select
                        value={selectedAgentId}
                        onChange={(e) => setSelectedAgentId(e.target.value)}
                        className="pl-9 pr-8 py-2 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-200 outline-none focus:ring-2 focus:ring-blue-500 appearance-none cursor-pointer shadow-sm min-w-[180px]"
                    >
                        <option value="all">All Agents</option>
                        {agents.map(agent => (
                            <option key={agent.id} value={agent.id}>{agent.name}</option>
                        ))}
                    </select>
                </div>
            )}
            
            <button 
              onClick={loadCalls}
              className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm"
            >
              <RefreshCcw size={20} className={loading ? 'animate-spin' : ''} />
            </button>
        </div>
      </div>

      {loading ? (
        <div className="space-y-4 animate-pulse">
           {[1, 2, 3, 4].map(i => (
             <div key={i} className="h-20 bg-white dark:bg-slate-900 rounded-xl border border-gray-100 dark:border-slate-800"></div>
           ))}
        </div>
      ) : filteredCalls.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-xl p-8 md:p-12 text-center border border-gray-200 dark:border-slate-800">
           <User size={32} className="mx-auto mb-4 text-blue-500" />
           <h3 className="text-lg font-bold text-gray-900 dark:text-white">No Calls Found</h3>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-gray-200 dark:border-slate-800 overflow-hidden">
           <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[800px] md:min-w-0">
              <thead className="bg-gray-50 dark:bg-slate-800 text-gray-500 dark:text-gray-400 text-xs uppercase font-semibold">
                <tr>
                  <th className="px-6 py-4">Status / Success</th>
                  <th className="px-6 py-4">Caller</th>
                  <th className="px-6 py-4">Date & Time</th>
                  <th className="px-6 py-4">Duration</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
                {filteredCalls.map((call) => (
                  <tr key={call.call_id} className="hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-6 py-4">
                      {renderStatus(call)}
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                      {call.customer_number || 'Inbound'}
                    </td>
                    <td className="px-6 py-4 text-gray-500 dark:text-gray-400 text-sm">
                      {format(new Date(call.start_timestamp), 'MMM d, h:mm a')}
                    </td>
                    <td className="px-6 py-4 text-gray-600 dark:text-gray-400 text-sm font-mono">
                      {formatDuration(call)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {call.recording_url && (
                          <a href={call.recording_url} target="_blank" className="p-2 text-blue-600"><Play size={18} /></a>
                        )}
                        {call.transcript && (
                          <button onClick={() => setSelectedTranscript(call.transcript || '')} className="p-2 text-slate-600"><FileText size={18} /></button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {selectedTranscript && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50" onClick={() => setSelectedTranscript(null)}>
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-2xl w-full p-6 shadow-2xl" onClick={e => e.stopPropagation()}>
             <div className="flex justify-between items-center mb-4 pb-4 border-b border-gray-100 dark:border-slate-800">
                <h3 className="font-bold text-lg">Call Transcript</h3>
                <button onClick={() => setSelectedTranscript(null)}><X size={24} /></button>
             </div>
             <div className="max-h-[60vh] overflow-y-auto p-4 bg-gray-50 dark:bg-slate-800 rounded-xl text-sm whitespace-pre-wrap font-mono">
                {selectedTranscript}
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CallHistory;
