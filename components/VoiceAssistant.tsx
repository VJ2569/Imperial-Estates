import React, { useEffect, useState, useRef } from 'react';
import { RetellWebClient } from 'retell-client-js-sdk';
import { Mic, MicOff, X, Loader2, Volume2 } from 'lucide-react';
import { AGENT_CONFIG } from '../constants';

const VoiceAssistant: React.FC = () => {
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const retellClientRef = useRef<RetellWebClient | null>(null);

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

    const apiKey = localStorage.getItem('agent_api_key') || AGENT_CONFIG.API_KEY;
    const agentId = localStorage.getItem('agent_id') || AGENT_CONFIG.AGENT_ID;

    if (!apiKey || apiKey === 'YOUR_AGENT_API_KEY' || !agentId || agentId === 'YOUR_AGENT_ID') {
       alert("Please configure your Retell API Key and Agent ID in Settings first.");
       return;
    }

    if (isSessionActive) {
      retellClientRef.current.stopCall();
    } else {
      setIsConnecting(true);
      try {
          // Retell V2 flow: Create a web call session to get an access token
          const response = await fetch('https://api.retellai.com/v2/create-web-call', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${apiKey}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              agent_id: agentId
            })
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to create web call session');
          }

          const data = await response.json();
          const accessToken = data.access_token;

          await retellClientRef.current.startCall({
              accessToken: accessToken,
          });
      } catch (err: any) {
          console.error("Failed to start agent call:", err);
          alert(`Connection Error: ${err.message || 'Check your API Key and Agent ID settings.'}`);
          setIsConnecting(false);
      }
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end">
      {(isSessionActive || isConnecting) && (
        <div className="mb-4 bg-slate-900 text-white p-4 rounded-2xl shadow-2xl w-64 border border-slate-700 animate-in slide-in-from-bottom-4">
          <div className="flex justify-between items-center mb-3">
            <div className="flex items-center gap-2">
              <span className={`relative flex h-3 w-3 rounded-full ${isConnecting ? 'bg-amber-500' : 'bg-emerald-500'}`}>
                {isConnecting && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>}
              </span>
              <span className="font-semibold text-sm">Imperial Voice Agent</span>
            </div>
            <button onClick={() => retellClientRef.current?.stopCall()} className="text-slate-400 hover:text-white"><X size={16} /></button>
          </div>
          <div className="h-10 bg-slate-800/50 rounded-lg flex items-center justify-center">
            {isConnecting ? (
              <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase tracking-widest">
                <Loader2 className="animate-spin" size={14} /> Initializing
              </div>
            ) : (
              <div className="flex items-center gap-2 text-blue-400 text-xs font-bold uppercase tracking-widest">
                <Volume2 size={18} className="animate-pulse" /> Live Session
              </div>
            )}
          </div>
        </div>
      )}

      <button
        onClick={toggleCall}
        disabled={isConnecting}
        className={`h-16 w-16 rounded-full shadow-2xl flex items-center justify-center transition-all ${
          isSessionActive ? 'bg-rose-500 scale-110 hover:bg-rose-600' : 'bg-slate-900 hover:bg-slate-800'
        } ${isConnecting ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        {isSessionActive ? <MicOff className="text-white" size={28} /> : <Mic className="text-white" size={28} />}
      </button>
    </div>
  );
};

export default VoiceAssistant;
