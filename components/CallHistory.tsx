import React, { useEffect, useState } from 'react';
import { 
  Play, 
  FileText, 
  CheckCircle2, 
  XCircle, 
  RefreshCcw, 
  User, 
  X, 
  Filter, 
  AlertCircle,
  Mail,
  Phone,
  Clock,
  ChevronRight,
  TrendingUp,
  Inbox,
  Calendar
} from 'lucide-react';
import { fetchRetellCalls, getStoredRetellCalls } from '../services/retellService';
import { RetellCall, Assistant } from '../types';
import { format } from 'date-fns';

const CallHistory: React.FC = () => {
  const [calls, setCalls] = useState<RetellCall[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTranscript, setSelectedTranscript] = useState<string | null>(null);
  const [selectedCall, setSelectedCall] = useState<RetellCall | null>(null);
  const [agents, setAgents] = useState<Assistant[]>([]);
  const [selectedAgentId, setSelectedAgentId] = useState<string>('all');

  useEffect(() => {
    loadAgents();
    loadData();
  }, []);

  const loadAgents = () => {
      const storedIds = localStorage.getItem('agent_ids');
      if (storedIds) {
          try {
              const parsed = JSON.parse(storedIds);
              setAgents(Array.isArray(parsed) ? parsed : []);
          } catch (e) { console.error(e); }
      }
  };

  const loadData = async () => {
    setLoading(true);
    setCalls(getStoredRetellCalls());
    const data = await fetchRetellCalls();
    setCalls(data);
    setLoading(false);
  };

  const formatDuration = (call: RetellCall) => {
    if (call.status === 'pending_call') return '---';
    const seconds = (call.duration_ms || 0) / 1000;
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
  };

  const renderStatusBadge = (call: RetellCall) => {
      if (call.status === 'pending_call') {
          return (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-blue-500 text-white animate-pulse">
                <Calendar size={12} />
                Pending Call
            </span>
          );
      }
      
      const isSuccessful = call.call_analysis?.call_successful;
      if (isSuccessful === true) {
          return (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800">
                <CheckCircle2 size={12} />
                Success
            </span>
          );
      }
      
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
            <CheckCircle2 size={12} />
            Completed
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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <div>
          <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">Receptionist Console</h2>
          <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">Unified Call & Enquiry Lifecycle</p>
        </div>

        <div className="flex items-center gap-3">
            {agents.length > 1 && (
                <div className="relative">
                    <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                    <select
                        value={selectedAgentId}
                        onChange={(e) => setSelectedAgentId(e.target.value)}
                        className="pl-9 pr-8 py-2 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-lg text-sm text-gray-700 dark:text-gray-200 outline-none font-bold appearance-none"
                    >
                        <option value="all">All Agents</option>
                        {agents.map(agent => (
                            <option key={agent.id} value={agent.id}>{agent.name}</option>
                        ))}
                    </select>
                </div>
            )}
            <button onClick={loadData} className="p-2.5 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900">
              <RefreshCcw size={20} className={loading ? 'animate-spin' : ''} />
            </button>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-[32px] shadow-sm border border-gray-200 dark:border-slate-800 overflow-hidden">
         <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[1000px]">
              <thead className="bg-gray-50 dark:bg-slate-800 text-gray-500 dark:text-gray-400 text-[10px] uppercase font-black tracking-widest">
                <tr>
                  <th className="px-8 py-5">Status</th>
                  <th className="px-8 py-5">Customer Detail</th>
                  <th className="px-8 py-5">Intent & Requirement</th>
                  <th className="px-8 py-5">Activity</th>
                  <th className="px-8 py-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
                {filteredCalls.map((call) => (
                  <tr 
                    key={call.call_session_id} 
                    onClick={() => setSelectedCall(call)}
                    className="hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors group cursor-pointer"
                  >
                    <td className="px-8 py-6">{renderStatusBadge(call)}</td>
                    <td className="px-8 py-6">
                      <div className="font-bold text-slate-900 dark:text-white">{call.customer_name || 'Inbound Caller'}</div>
                      <div className="text-xs text-slate-500 mt-1 flex items-center gap-3">
                         <span className="flex items-center gap-1"><Phone size={10}/> {call.customer_number || '---'}</span>
                         {call.customer_email && <span className="flex items-center gap-1"><Mail size={10}/> {call.customer_email}</span>}
                      </div>
                    </td>
                    <td className="px-8 py-6">
                       <div className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest mb-1">
                          {call.project_interested || 'General Property Portfolio'}
                       </div>
                       <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                          Budget: {call.budget || 'Unspecified'}
                       </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-400">
                         <Clock size={14} /> {format(new Date(call.start_timestamp), 'MMM d, h:mm a')}
                      </div>
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                        Duration: {formatDuration(call)}
                      </div>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex items-center justify-end gap-2" onClick={e => e.stopPropagation()}>
                        {call.recording_url && (
                          <a href={call.recording_url} target="_blank" className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg">
                            <Play size={18} />
                          </a>
                        )}
                        {call.transcript && (
                          <button onClick={() => setSelectedTranscript(call.transcript || '')} className="p-2 text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">
                            <FileText size={18} />
                          </button>
                        )}
                        <ChevronRight size={18} className="text-slate-300 group-hover:translate-x-1 transition-transform ml-2" />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredCalls.length === 0 && !loading && (
               <div className="p-20 text-center">
                  <Inbox className="mx-auto text-slate-200 mb-6" size={48} />
                  <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2">Queue Empty</h3>
                  <p className="text-slate-500 text-sm max-w-xs mx-auto">Call logs and enquiry forms will synchronize here in real-time.</p>
               </div>
            )}
         </div>
      </div>

      {/* Transcript Modal */}
      {selectedTranscript && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-[100]" onClick={() => setSelectedTranscript(null)}>
          <div className="bg-white dark:bg-slate-900 rounded-[40px] max-w-2xl w-full p-8 shadow-3xl animate-in zoom-in-95" onClick={e => e.stopPropagation()}>
             <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">
                <h3 className="font-black text-xl text-slate-900 dark:text-white uppercase tracking-tight">Call Transcript</h3>
                <button onClick={() => setSelectedTranscript(null)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full"><X size={20} /></button>
             </div>
             <div className="max-h-[50vh] overflow-y-auto p-6 bg-slate-50 dark:bg-slate-950 rounded-[32px] text-sm whitespace-pre-wrap font-mono text-slate-800 dark:text-slate-100 border border-slate-100 dark:border-slate-800 leading-relaxed custom-scrollbar">
                {selectedTranscript}
             </div>
          </div>
        </div>
      )}

      {/* Lead Info Modal */}
      {selectedCall && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-[100]" onClick={() => setSelectedCall(null)}>
          <div className="bg-white dark:bg-slate-900 rounded-[40px] max-w-3xl w-full p-10 shadow-3xl animate-in zoom-in-95" onClick={e => e.stopPropagation()}>
             <div className="flex justify-between items-start mb-8 pb-6 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-5">
                   <div className="w-16 h-16 bg-blue-600 rounded-[22px] flex items-center justify-center text-white">
                      <User size={32} />
                   </div>
                   <div>
                      <h3 className="font-black text-2xl text-slate-900 dark:text-white tracking-tight">{selectedCall.customer_name || 'Inbound Lead'}</h3>
                      <div className="flex items-center gap-3 mt-1">
                        {renderStatusBadge(selectedCall)}
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{format(new Date(selectedCall.start_timestamp), 'MMM d, yyyy')}</span>
                      </div>
                   </div>
                </div>
                <button onClick={() => setSelectedCall(null)} className="p-3 hover:bg-slate-100 rounded-full"><X size={24} /></button>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                   <div className="bg-slate-50 dark:bg-slate-800/40 p-5 rounded-2xl border border-slate-100 dark:border-slate-700">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Communication</p>
                      <div className="space-y-3">
                         <div className="flex items-center gap-3 text-slate-700 dark:text-slate-200 font-bold">
                            <Phone size={16} className="text-blue-500" /> {selectedCall.customer_number || 'Hidden/Unknown'}
                         </div>
                         {selectedCall.customer_email && (
                            <div className="flex items-center gap-3 text-slate-700 dark:text-slate-200 font-bold">
                               <Mail size={16} className="text-blue-500" /> {selectedCall.customer_email}
                            </div>
                         )}
                      </div>
                   </div>

                   <div className="bg-blue-50/50 dark:bg-blue-900/20 p-5 rounded-2xl border border-blue-100 dark:border-blue-800">
                      <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-3">Interest Profile</p>
                      <div className="space-y-4">
                         <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase mb-0.5">Project Target</p>
                            <p className="font-black text-blue-700 dark:text-blue-400">{selectedCall.project_interested || 'General Enquiry'}</p>
                         </div>
                         <div className="flex gap-8">
                            <div>
                               <p className="text-[10px] font-bold text-slate-400 uppercase mb-0.5">Budget</p>
                               <p className="font-black text-slate-900 dark:text-white">₹ {selectedCall.budget || 'TBD'}</p>
                            </div>
                            <div>
                               <p className="text-[10px] font-bold text-slate-400 uppercase mb-0.5">Timeline</p>
                               <p className="font-black text-slate-900 dark:text-white">{selectedCall.timeline || 'Immediate'}</p>
                            </div>
                         </div>
                      </div>
                   </div>
                </div>

                <div className="flex flex-col">
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Full Message / Notes</p>
                   <div className="flex-1 bg-slate-50 dark:bg-slate-950 p-6 rounded-[32px] border border-slate-100 dark:border-slate-800 text-sm leading-relaxed text-slate-600 dark:text-slate-400 whitespace-pre-wrap font-medium">
                      {selectedCall.message || selectedCall.call_analysis?.call_summary || 'No additional notes provided for this lead.'}
                   </div>
                </div>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CallHistory;
