import React, { useEffect, useState, useRef } from 'react';
import Vapi from '@vapi-ai/web';
import { Mic, MicOff, X, Loader2, Volume2, Settings } from 'lucide-react';
import { VAPI_CONFIG } from '../constants';

const VoiceAssistant: React.FC = () => {
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [volumeLevel, setVolumeLevel] = useState(0);
  const [configError, setConfigError] = useState(false);
  const vapiRef = useRef<any>(null);

  // Helper to get keys
  const getKeys = () => {
    const publicKey = localStorage.getItem('vapi_public_key') || VAPI_CONFIG.PUBLIC_KEY;
    
    // Logic to determine active assistant ID
    // 1. Check for the new list format
    let assistantId = '';
    const storedIdsJson = localStorage.getItem('vapi_assistant_ids');
    if (storedIdsJson) {
        try {
            const ids = JSON.parse(storedIdsJson);
            if (Array.isArray(ids) && ids.length > 0) {
                assistantId = ids[0]; // Use the first one as primary
            }
        } catch (e) {
            console.error(e);
        }
    }
    
    // 2. Fallback to old single key if no list or empty list
    if (!assistantId) {
        assistantId = localStorage.getItem('vapi_assistant_id') || VAPI_CONFIG.ASSISTANT_ID;
    }
    
    return { publicKey, assistantId };
  };

  useEffect(() => {
    const { publicKey } = getKeys();

    if (!publicKey || publicKey.includes('YOUR_VAPI')) {
      setConfigError(true);
      return;
    }

    try {
      // Initialize Vapi instance
      const vapi = new Vapi(publicKey);
      vapiRef.current = vapi;

      // Event Listeners
      vapi.on('call-start', () => {
        setIsSessionActive(true);
        setIsConnecting(false);
      });

      vapi.on('call-end', () => {
        setIsSessionActive(false);
        setIsConnecting(false);
        setVolumeLevel(0);
      });

      vapi.on('volume-level', (volume: number) => {
        setVolumeLevel(volume);
      });

      vapi.on('error', (e: any) => {
        console.error('Vapi Error:', e);
        setIsConnecting(false);
        setIsSessionActive(false);
      });

      return () => {
        vapi.stop();
      };
    } catch (err) {
      console.error("Failed to initialize Vapi", err);
      setConfigError(true);
    }
  }, []);

  const toggleCall = () => {
    if (!vapiRef.current) return;
    const { assistantId } = getKeys();

    if (!assistantId || assistantId.includes('YOUR_VAPI')) {
       alert("Please configure your Assistant ID in Settings first.");
       return;
    }

    if (isSessionActive) {
      vapiRef.current.stop();
    } else {
      setIsConnecting(true);
      vapiRef.current.start(assistantId);
    }
  };

  // If keys aren't configured and we are in error state, render nothing (or maybe a small indicator)
  if (configError) {
    return null;
  }

  return (
    <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end">
      
      {/* Call Status Card - Only visible when connected/connecting */}
      {(isSessionActive || isConnecting) && (
        <div className="mb-4 bg-slate-900 text-white p-4 rounded-2xl shadow-2xl w-64 animate-in slide-in-from-bottom-5 duration-300 border border-slate-700">
          <div className="flex justify-between items-center mb-3">
            <div className="flex items-center gap-2">
              <span className="relative flex h-3 w-3">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 ${isConnecting ? 'bg-amber-400' : ''}`}></span>
                <span className={`relative inline-flex rounded-full h-3 w-3 bg-emerald-500 ${isConnecting ? 'bg-amber-500' : ''}`}></span>
              </span>
              <span className="font-semibold text-sm">
                {isConnecting ? 'Connecting...' : 'Imperial AI Agent'}
              </span>
            </div>
            <button 
              onClick={toggleCall}
              className="text-slate-400 hover:text-white transition-colors"
            >
              <X size={16} />
            </button>
          </div>
          
          <div className="h-12 bg-slate-800/50 rounded-lg flex items-center justify-center overflow-hidden relative">
            {isConnecting ? (
               <Loader2 className="animate-spin text-slate-400" />
            ) : (
               <div className="flex items-center gap-1 h-full">
                  {/* Visualizer bars */}
                  {[...Array(5)].map((_, i) => (
                    <div 
                      key={i}
                      className="w-1.5 bg-blue-500 rounded-full transition-all duration-75"
                      style={{ 
                        height: `${Math.max(4, volumeLevel * 100 * (Math.random() + 0.5))}px`,
                        opacity: volumeLevel > 0.05 ? 1 : 0.3
                      }}
                    />
                  ))}
               </div>
            )}
          </div>
          <p className="text-xs text-slate-400 mt-2 text-center">
            {isSessionActive ? "Listening..." : "Establishing secure line..."}
          </p>
        </div>
      )}

      {/* Main Floating Action Button */}
      <button
        onClick={toggleCall}
        className={`h-16 w-16 rounded-full shadow-xl flex items-center justify-center transition-all duration-300 transform hover:scale-105 ${
          isSessionActive 
            ? 'bg-rose-500 hover:bg-rose-600 animate-pulse-slow' 
            : 'bg-slate-900 hover:bg-slate-800'
        }`}
      >
        {isSessionActive ? (
          <MicOff className="text-white" size={28} />
        text-white" size={28} />
            {!isSessionActive && !isConnecting && (
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
              </span>
            )}
          </div>
        )}
      </button>
    </div>
  );
};

export default VoiceAssistant;