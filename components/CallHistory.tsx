import React, { useEffect, useState } from 'react';
import { Play, FileText, CheckCircle2, XCircle, RefreshCcw, User, X, Filter } from 'lucide-react';
import { fetchVapiCalls } from '../services/vapiService';
import { VapiCall, Assistant } from '../types';
import { format } from 'date-fns';

const CallHistory: React.FC = () => {
  const [calls, setCalls] = useState<VapiCall[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTranscript, setSelectedTranscript] = useState<string | null>(null);
  
  // Filtering
  const [assistants, setAssistants] = useState<Assistant[]>([]);
  const [selectedAssistantId, setSelectedAssistantId] = useState<string>('all');

  useEffect(() => {
    loadCalls();
    loadAssistants();
  }, []);

  const loadAssistants = () => {
      const storedIds = localStorage.getItem('vapi_assistant_ids');
      if (storedIds) {
          try {
              const parsed = JSON.parse(storedIds);
              // Handle legacy string[] or new Assistant[]
              if (Array.isArray(parsed)) {
                  if (parsed.length > 0 && typeof parsed[0] === 'string') {
                       setAssistants(parsed.map((id, idx) => ({ id, name: `Assistant ${idx+1}` })));
                  } else {
                       setAssistants(parsed);
                  }
              }
          } catch (e) { console.error(e); }
      }
  };

  const loadCalls = async () => {
    setLoading(true);
    const data = await fetchVapiCalls();
    setCalls(data);
    setLoading(false);
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return '0s';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}m ${secs}s`;
  };

  // Helper to get assistant name
  const getAssistantName = (id: string) => {
      const assistant = assistants.find(a => a.id === id);
      return assistant ? assistant.name : `${id.substring(0, 8)}...`;
  };

  // Filter calls based on selected assistant
  const filteredCalls = selectedAssistantId === 'all' 
    ? calls 
    : calls.filter(call => call.assistantId === selectedAssistantId);

  // If there are multiple assistants configured OR if the call history contains different assistants, show filter
  const uniqueAssistantIdsInCalls = Array.from(new Set(calls.map(c => c.assistantId).filter(Boolean)));
  const showAssistantFilter = assistants.length > 1 || uniqueAssistantIdsInCalls.length > 1;

  // Merge configured IDs with IDs found in data for the dropdown options
  const dropdownIds = Array.from(new Set([
      ...assistants.map(a => a.id), 
      ...uniqueAssistantIdsInCalls
  ]));

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto w-full">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 md:mb-8">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-gray-900">Receptionist Logs</h2>
          <p className="text-gray-500 text-xs md:text-sm">Inbound call history</p>
        </div>
        
        <div className="flex items-center gap-3">
            {showAssistantFilter && (
                <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none">
                        <Filter size={16} />
                    </div>
                    <select
                        value={selectedAssistantId}
                        onChange={(e) => setSelectedAssistantId(e.target.value)}
                        className="pl-9 pr-8 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 outline-none focus:ring-2 focus:ring-blue-500 appearance-none cursor-pointer shadow-sm min-w-[180px]"
                    >
                        <option value="all">All Assistants</option>
                        {dropdownIds.map(id => {
                            if (!id) return null;
                            const name = getAssistantName(id as string);
                            const isPrimary = assistants.length > 0 && id === assistants[0].id;
                            return (
                                <option key={id as string} value={id as string}>
                                    {name} {isPrimary ? '(Primary)' : ''}
                                </option>
                            );
                        })}
                    </select>
                </div>
            )}
            
            <button 
              onClick={loadCalls}
              className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors border border-gray-200 bg-white shadow-sm"
              title="Refresh Logs"
            >
              <RefreshCcw size={20} className={loading ? 'animate-spin' : ''} />
            </button>
        </div>
      </div>

      {loading ? (
        <div className="space-y-4 animate-pulse">
           {[1, 2, 3, 4].map(i => (
             <div key={i} className="h-20 bg-white rounded-xl border border-gray-100"></div>
           ))}
        </div>
      ) : filteredCalls.length === 0 ? (
        <div className="bg-white rounded-xl p-8 md:p-12 text-center border border-gray-200">
           <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <User size={32} />
           </div>
           <h3 className="text-lg font-bold text-gray-900">No Calls Found</h3>
           <p className="text-gray-500 max-w-md mx-auto mt-2 text-sm">
             {selectedAssistantId !== 'all' 
                ? "No calls found for this specific assistant." 
                : "Check if your Private Key is configured correctly in Settings or if there are any calls in your history."}
           </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
           <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[800px] md:min-w-0">
              <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-semibold">
                <tr>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Caller</th>
                  <th className="px-6 py-4">Date & Time</th>
                  {showAssistantFilter && <th className="px-6 py-4">Assistant</th>}
                  <th className="px-6 py-4">Duration</th>
                  <th className="px-6 py-4">Cost</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredCalls.map((call) => (
                  <tr key={call.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      {call.analysis?.successEvaluation === 'true' || call.status === 'ended' ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-100">
                          <CheckCircle2 size={12} />
                          Success
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-100">
                          <XCircle size={12} />
                          {call.endedReason || 'Failed'}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-900">
                      {call.customer?.number || 'Unknown Number'}
                    </td>
                    <td className="px-6 py-4 text-gray-500 text-sm">
                      <div className="flex flex-col">
                        <span className="font-medium text-gray-700">{format(new Date(call.createdAt), 'MMM d, yyyy')}</span>
                        <span className="text-xs">{format(new Date(call.createdAt), 'h:mm a')}</span>
                      </div>
                    </td>
                    {showAssistantFilter && (
                        <td className="px-6 py-4 text-gray-500 text-xs font-medium">
                            {call.assistantId ? getAssistantName(call.assistantId) : '-'}
                        </td>
                    )}
                    <td className="px-6 py-4 text-gray-600 text-sm font-mono">
                      {formatDuration(call.duration)}
                    </td>
                    <td className="px-6 py-4 text-gray-600 text-sm">
                      ${call.cost?.toFixed(4) || '0.00'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {call.recordingUrl && (
                          <a 
                            href={call.recordingUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Play Recording"
                          >
                            <Play size={18} />
                          </a>
                        )}
                        {call.transcript && (
                          <button 
                            onClick={() => setSelectedTranscript(call.transcript || '')}
                            className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                            title="View Transcript"
                          >
                            <FileText size={18} />
                          </button>
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

      {/* Transcript Modal */}
      {selectedTranscript && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-end md:items-center justify-center p-0 md:p-4 z-50" onClick={() => setSelectedTranscript(null)}>
          <div className="bg-white w-full md:w-auto rounded-t-2xl md:rounded-2xl max-w-2xl shadow-2xl p-6 animate-in slide-in-from-bottom-10 md:fade-in md:zoom-in duration-200" onClick={e => e.stopPropagation()}>
             <div className="flex justify-between items-center mb-4 border-b border-gray-100 pb-4">
                <h3 className="font-bold text-lg text-gray-900 flex items-center gap-2">
                  <FileText className="text-blue-500" />
                  Call Transcript
                </h3>
                <button onClick={() => setSelectedTranscript(null)} className="text-gray-400 hover:text-gray-600">
                  <X size={24} />
                </button>
             </div>
             <div className="max-h-[60vh] overflow-y-auto p-4 bg-gray-50 rounded-xl text-sm leading-relaxed text-gray-700 whitespace-pre-wrap font-mono">
                {selectedTranscript}
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CallHistory;
