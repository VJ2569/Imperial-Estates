import React, { useState, useEffect, useRef } from 'react';
import { Shield, Lock, AlertCircle, Fingerprint } from 'lucide-react';

interface AdminGuardProps {
  children: React.ReactNode;
}

const AdminGuard: React.FC<AdminGuardProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pin, setPin] = useState(['', '', '', '', '']);
  const [error, setError] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const inputRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];

  useEffect(() => {
    // Check if security is even enabled
    const isSecurityEnabled = localStorage.getItem('aegisa_security_enabled') === 'true';
    
    if (!isSecurityEnabled) {
      setIsAuthenticated(true);
      setIsChecking(false);
      return;
    }

    // Check session authentication if security is enabled
    const authSession = sessionStorage.getItem('aegisa_admin_auth');
    if (authSession === 'true') {
      setIsAuthenticated(true);
    }
    setIsChecking(false);
  }, []);

  const handlePinChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newPin = [...pin];
    newPin[index] = value.slice(-1);
    setPin(newPin);
    setError(false);

    // Auto-focus next
    if (value && index < 4) {
      inputRefs[index + 1].current?.focus();
    }

    // Check if complete
    if (newPin.every(digit => digit !== '')) {
      validatePin(newPin.join(''));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !pin[index] && index > 0) {
      inputRefs[index - 1].current?.focus();
    }
  };

  const validatePin = (enteredPin: string) => {
    const savedPin = localStorage.getItem('aegisa_security_pin') || '12345'; // Default pin
    
    if (enteredPin === savedPin) {
      sessionStorage.setItem('aegisa_admin_auth', 'true');
      setIsAuthenticated(true);
    } else {
      setError(true);
      setPin(['', '', '', '', '']);
      inputRefs[0].current?.focus();
      if (navigator.vibrate) navigator.vibrate(200);
    }
  };

  if (isChecking) return null;

  if (!isAuthenticated) {
    return (
      <div className="fixed inset-0 bg-slate-950 flex items-center justify-center z-[1000] overflow-hidden">
        {/* Abstract Security Background */}
        <div className="absolute inset-0 opacity-20 pointer-events-none">
           <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600 rounded-full blur-[120px]" />
           <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-600 rounded-full blur-[120px]" />
        </div>

        <div className="max-w-md w-full px-6 relative animate-in fade-in zoom-in-95 duration-500">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl mb-6 relative group">
              <Shield className="text-blue-500 group-hover:scale-110 transition-transform" size={40} />
              <div className="absolute inset-0 border border-blue-500/30 rounded-3xl animate-pulse" />
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight uppercase">Aegisa Admin Security</h1>
            <p className="text-slate-500 text-sm mt-2 font-medium">Access Restricted: Enter 5-Digit PIN</p>
          </div>

          <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 p-10 rounded-[40px] shadow-3xl">
            <div className={`flex justify-center gap-3 mb-8 ${error ? 'animate-shake' : ''}`}>
              {pin.map((digit, idx) => (
                <input
                  key={idx}
                  ref={inputRefs[idx]}
                  type="password"
                  inputMode="numeric"
                  value={digit}
                  onChange={(e) => handlePinChange(idx, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(idx, e)}
                  className={`w-12 h-16 text-center text-3xl font-black rounded-2xl border transition-all outline-none ${
                    error 
                    ? 'border-rose-500 bg-rose-500/10 text-rose-500' 
                    : 'border-slate-700 bg-slate-800 text-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10'
                  }`}
                />
              ))}
            </div>

            {error && (
              <div className="flex items-center justify-center gap-2 text-rose-500 text-xs font-black uppercase tracking-widest mb-6 animate-in slide-in-from-top-2">
                <AlertCircle size={14} />
                Access Denied. Verification Failed.
              </div>
            )}

            <div className="space-y-4">
               <div className="flex items-center gap-3 p-4 bg-slate-800/50 rounded-2xl border border-slate-700/50">
                  <Fingerprint className="text-slate-500" size={20} />
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-relaxed">
                    IP Address Tracked & Logged for Security Auditing
                  </p>
               </div>
            </div>
          </div>

          <p className="text-center mt-8 text-slate-600 text-[10px] font-black uppercase tracking-[0.3em]">
            Imperial Estates Digital Assets Protection
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default AdminGuard;
