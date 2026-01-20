import React, { useEffect, useState, useRef } from 'react';
import { RetellWebClient } from 'retell-client-js-sdk';
import { Mic, MicOff, X, Loader2, Volume2 } from 'lucide-react';
import { AGENT_CONFIG } from '../constants';

const VoiceAssistant: React.FC = () => {
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [, setVolumeLevel] = useState(0);
  const retellClientRef = useRef<RetellWebClient | null>(null);

  const getAgentId = () => {
    return localStorage.getItem('agent_id') || AGENT_CONFIG.AGENT_ID;
  };

  useEffect(() => {
    const retellClient = new RetellWebClient();
    retellClientRef.current = retellClient;

    retellClient.on('call_started', () => {
      setIsSessionActive(true);
      setIsConnecting(false);
    });

    retellClient.on('call_ended', () => {
      setIsSessionActive(false);
      setIsConnecting(false);
      setVolumeLevel(0);
    });

    retellClient.on('error', (error: any) => {
      console.error('Agent Error:', error);
      setIsConnecting(false);
      setIsSessionActive(false);
    });

    return () => {
      retellClient.stopCall();
    };
  }, []);

  const toggleCall = async () => {
    if (!retellClientRef.current) return;
    const agentId = getAgentId();

    if (!agentId || agentId.includes('YOUR_AGENT')) {
       alert("Please configure your AI Agent ID in Settings first.");
       return;
    }

    if (isSessionActive) {
      retellClientRef.current.stopCall();
    } else {
      setIsConnecting(true);
      try {
          await retellClientRef.current.startCall({
              accessToken: agentId,
          });
      } catch (err) {
          console.error("Failed to start agent call", err);
          setIsConnecting(false);
      }
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end">
      {(isSessionActive || isConnecting) && (
        <div className="mb-4 bg-slate-900 text-white p-4 rounded-2xl shadow-2xl w-64 border border-slate-700">
          <div className="flex justify-between items-center mb-3">
            <div className="flex items-center gap-2">
              <span className={`relative flex h-3 w-3 rounded-full ${isConnecting ? 'bg-amber-500' : 'bg-emerald-500'}`}>
                {isConnecting && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>}
              </span>
              <span className="font-semibold text-sm">AI Voice Agent</span>
            </div>
            <button onClick={() => retellClientRef.current?.stopCall()} className="text-slate-400 hover:text-white"><X size={16} /></button>
          </div>
          <div className="h-10 bg-slate-800/50 rounded-lg flex items-center justify-center">
            {isConnecting ? <Loader2 className="animate-spin text-slate-400" /> : <Volume2 size={20} className="text-blue-500" />}
          </div>
        </div>
      )}

      <button
        onClick={toggleCall}
        className={`h-16 w-16 rounded-full shadow-xl flex items-center justify-center transition-all ${
          isSessionActive ? 'bg-rose-500 scale-110' : 'bg-slate-900 hover:bg-slate-800'
        }`}
      >
        {isSessionActive ? <MicOff className="text-white" size={28} /> : <Mic className="text-white" size={28} />}
      </button>
    </div>
  );
};

export default VoiceAssistant;
