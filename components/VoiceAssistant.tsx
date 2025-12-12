import React, { useEffect, useState, useRef } from "react";
import Vapi from "@vapi-ai/web";
import { Mic, MicOff, X, Loader2 } from "lucide-react";
import { VAPI_CONFIG } from "../constants";

const VoiceAssistant: React.FC = () => {
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [volumeLevel, setVolumeLevel] = useState(0);
  const [configError, setConfigError] = useState(false);
  const vapiRef = useRef<any>(null);

  const getKeys = () => {
    const publicKey =
      localStorage.getItem("vapi_public_key") || VAPI_CONFIG.PUBLIC_KEY;

    let assistantId = "";
    const storedIdsJson = localStorage.getItem("vapi_assistant_ids");
    if (storedIdsJson) {
      try {
        const ids = JSON.parse(storedIdsJson);
        if (Array.isArray(ids) && ids.length > 0) {
          assistantId = ids[0];
        }
      } catch (e) {
        console.error(e);
      }
    }

    if (!assistantId) {
      assistantId =
        localStorage.getItem("vapi_assistant_id") || VAPI_CONFIG.ASSISTANT_ID;
    }

    return { publicKey, assistantId };
  };

  useEffect(() => {
    const { publicKey } = getKeys();

    if (!publicKey || publicKey.includes("YOUR_VAPI")) {
      setConfigError(true);
      return;
    }

    try {
      const vapi = new Vapi(publicKey);
      vapiRef.current = vapi;

      vapi.on("call-start", () => {
        setIsSessionActive(true);
        setIsConnecting(false);
      });

      vapi.on("call-end", () => {
        setIsSessionActive(false);
        setIsConnecting(false);
        setVolumeLevel(0);
      });

      vapi.on("volume-level", (volume: number) => {
        setVolumeLevel(volume);
      });

      vapi.on("error", (e: any) => {
        console.error("Vapi Error:", e);
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

    if (!assistantId || assistantId.includes("YOUR_VAPI")) {
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

  if (configError) return null;

  return (
    <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end">

      {(isSessionActive || isConnecting) && (
        <div className="mb-4 bg-slate-900 text-white p-4 rounded-2xl shadow-2xl w-64 border border-slate-700">
          <div className="flex justify-between items-center mb-3">
            <div className="flex items-center gap-2">
              <span className="relative flex h-3 w-3">
                <span
                  className={`animate-ping absolute inline-flex h-full w-full rounded-full ${
                    isConnecting ? "bg-amber-400" : "bg-emerald-400"
                  } opacity-75`}
                ></span>
                <span
                  className={`relative inline-flex rounded-full h-3 w-3 ${
                    isConnecting ? "bg-amber-500" : "bg-emerald-500"
                  }`}
                ></span>
              </span>
              <span className="font-semibold text-sm">
                {isConnecting ? "Connecting..." : "Imperial AI Agent"}
              </span>
            </div>

            <button
              onClick={toggleCall}
              className="text-slate-400 hover:text-white transition-colors"
            >
              <X size={16} />
            </button>
          </div>

          <div className="h-12 bg-slate-800/50 rounded-lg flex items-center justify-center">
            {isConnecting ? (
              <Loader2 className="animate-spin text-slate-400" />
            ) : (
              <div className="flex items-center gap-1 h-full">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className="w-1.5 bg-blue-500 rounded-full transition-all duration-75"
                    style={{
                      height: `${Math.max(
                        4,
                        volumeLevel * 100 * (Math.random() + 0.5)
                      )}px`,
                      opacity: volumeLevel > 0.05 ? 1 : 0.3,
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

      <button
        onClick={toggleCall}
        className={`relative h-16 w-16 rounded-full shadow-xl flex items-center justify-center transition-all duration-300 hover:scale-105 ${
          isSessionActive
            ? "bg-rose-500 hover:bg-rose-600 animate-pulse-slow"
            : "bg-slate-900 hover:bg-slate-800"
        }`}
      >
        {isSessionActive ? (
          <MicOff className="text-white" size={28} />
        ) : (
          <Mic className="text-white" size={28} />
        )}

        {!isSessionActive && !isConnecting && (
          <span className="absolute -top-1 -right-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
          </span>
        )}
      </button>
    </div>
  );
};

export default VoiceAssistant;
