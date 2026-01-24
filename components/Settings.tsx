import React, { useState, useEffect } from 'react';
import { Save, Key, User, Shield, CheckCircle2, Plus, Trash2, HelpCircle, Moon, Sun, Lock } from 'lucide-react';
import { AGENT_CONFIG } from '../constants';
import { Assistant } from '../types';

const Settings: React.FC = () => {
  const [activeSection, setActiveSection] = useState<'general' | 'integrations' | 'security'>('integrations');
  const [showSuccess, setShowSuccess] = useState(false);

  const [agentConfig, setAgentConfig] = useState({
    publicKey: '',
    assistants: [] as Assistant[],
    privateKey: ''
  });
  
  const [newAssistantId, setNewAssistantId] = useState('');
  const [newAssistantName, setNewAssistantName] = useState('');

  const [generalConfig, setGeneralConfig] = useState({
    companyName: 'Imperial Estates',
    adminName: 'Admin User',
    email: 'admin@imperialestates.com',
    appearance: 'light' // 'light' | 'dark'
  });

  const [securityPin, setSecurityPin] = useState('');
  const [securityEnabled, setSecurityEnabled] = useState(false);

  useEffect(() => {
    const storedPublicKey = localStorage.getItem('agent_public_key') || '';
    const storedPrivateKey = localStorage.getItem('agent_api_key') || AGENT_CONFIG.API_KEY;
    const storedPin = localStorage.getItem('aegisa_security_pin') || '12345';
    const storedSecurityEnabled = localStorage.getItem('aegisa_security_enabled') === 'true';
    
    setSecurityPin(storedPin);
    setSecurityEnabled(storedSecurityEnabled);
    
    let loadedAssistants: Assistant[] = [];
    const storedIdsJson = localStorage.getItem('agent_ids');
    
    if (storedIdsJson) {
        try {
            const parsed = JSON.parse(storedIdsJson);
            if (Array.isArray(parsed)) {
                if (parsed.length > 0 && typeof parsed[0] === 'string') {
                    loadedAssistants = parsed.map((id, idx) => ({ 
                        id, 
                        name: `Agent ${idx + 1}` 
                    }));
                } else {
                    loadedAssistants = parsed;
                }
            }
        } catch (e) {
            console.error('Failed to parse agent IDs', e);
        }
    } else {
        const oldId = localStorage.getItem('agent_id') || AGENT_CONFIG.AGENT_ID;
        if (oldId && !oldId.includes('YOUR_AGENT')) {
            loadedAssistants = [{ id: oldId, name: 'Primary Agent' }];
        }
    }

    setAgentConfig({
        publicKey: storedPublicKey,
        assistants: loadedAssistants,
        privateKey: storedPrivateKey === 'YOUR_AGENT_API_KEY' ? '' : storedPrivateKey
    });

    const storedGeneral = localStorage.getItem('app_general_config');
    if (storedGeneral) {
      setGeneralConfig(prev => ({ ...prev, ...JSON.parse(storedGeneral) }));
    }
  }, []);

  useEffect(() => {
    if (generalConfig.appearance === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [generalConfig.appearance]);

  const handleSave = () => {
    if (agentConfig.publicKey) localStorage.setItem('agent_public_key', agentConfig.publicKey);
    if (agentConfig.privateKey) localStorage.setItem('agent_api_key', agentConfig.privateKey);
    
    localStorage.setItem('agent_ids', JSON.stringify(agentConfig.assistants));
    
    if (agentConfig.assistants.length > 0) {
        localStorage.setItem('agent_id', agentConfig.assistants[0].id);
    } else {
        localStorage.removeItem('agent_id');
    }

    if (securityPin.length === 5 && /^\d+$/.test(securityPin)) {
      localStorage.setItem('aegisa_security_pin', securityPin);
    }
    
    localStorage.setItem('aegisa_security_enabled', securityEnabled.toString());
    localStorage.setItem('app_general_config', JSON.stringify(generalConfig));

    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const addAssistant = () => {
    if (newAssistantId.trim() && newAssistantName.trim()) {
        const id = newAssistantId.trim();
        const name = newAssistantName.trim();
        
        if (!agentConfig.assistants.some(a => a.id === id)) {
            setAgentConfig(prev => ({
                ...prev,
                assistants: [...prev.assistants, { id, name }]
            }));
        }
        setNewAssistantId('');
        setNewAssistantName('');
    }
  };

  const removeAssistant = (idToRemove: string) => {
    setAgentConfig(prev => ({
        ...prev,
        assistants: prev.assistants.filter(a => a.id !== idToRemove)
    }));
  };

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 md:mb-8">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">Settings</h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Application preferences</p>
        </div>
        <button
          onClick={handleSave}
          className="bg-blue-600 text-white px-6 py-2.5 rounded-xl hover:bg-blue-700 transition-colors font-semibold shadow-lg shadow-blue-200 dark:shadow-blue-900/20 flex items-center justify-center gap-2 w-full sm:w-auto"
        >
          {showSuccess ? <CheckCircle2 size={20} /> : <Save size={20} />}
          {showSuccess ? 'Saved!' : 'Save Changes'}
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-6 md:gap-8">
        <div className="w-full md:w-64 space-y-2 flex-shrink-0">
          <button
            onClick={() => setActiveSection('integrations')}
            className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 font-medium transition-colors ${
              activeSection === 'integrations' 
                ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm border border-gray-100 dark:border-slate-700' 
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-800'
            }`}
          >
            <Key size={18} />
            Integrations (Agent API)
          </button>
          <button
            onClick={() => setActiveSection('security')}
            className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 font-medium transition-colors ${
              activeSection === 'security' 
                ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm border border-gray-100 dark:border-slate-700' 
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-800'
            }`}
          >
            <Shield size={18} />
            Aegisa Security
          </button>
          <button
            onClick={() => setActiveSection('general')}
            className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 font-medium transition-colors ${
              activeSection === 'general' 
                ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm border border-gray-100 dark:border-slate-700' 
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-800'
            }`}
          >
            <User size={18} />
            General Profile
          </button>
        </div>

        <div className="flex-1 min-w-0">
          {activeSection === 'integrations' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="bg-white dark:bg-slate-900 p-4 md:p-6 rounded-xl border border-gray-200 dark:border-slate-800 shadow-sm">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Optional Reference Key</label>
                    <input 
                      type="text" 
                      value={agentConfig.publicKey}
                      onChange={(e) => setAgentConfig({...agentConfig, publicKey: e.target.value})}
                      placeholder="Public identifier key..."
                      className="w-full px-4 py-2 border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-950 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-mono text-sm text-gray-900 dark:text-white"
                    />
                    <p className="text-xs text-gray-400 mt-1">Public reference key for the voice SDK.</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">AI Agents</label>
                    
                    <div className="space-y-3 mb-4">
                        {agentConfig.assistants.length === 0 && (
                            <p className="text-sm text-gray-400 italic">No agents configured.</p>
                        )}
                        {agentConfig.assistants.map((assistant, index) => (
                            <div key={assistant.id} className="flex items-center gap-3 bg-gray-50 dark:bg-slate-800 p-3 rounded-lg border border-gray-100 dark:border-slate-700 group">
                                <div className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 w-8 h-8 rounded flex items-center justify-center text-xs font-bold shrink-0">
                                    {index + 1}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="text-sm font-bold text-gray-800 dark:text-gray-200 truncate">{assistant.name}</div>
                                    <div className="text-xs font-mono text-gray-500 dark:text-gray-400 truncate">{assistant.id}</div>
                                </div>
                                <button 
                                    onClick={() => removeAssistant(assistant.id)}
                                    className="p-2 text-gray-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-colors"
                                    title="Remove Agent"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        ))}
                    </div>

                    <div className="flex flex-col md:flex-row gap-2">
                        <input 
                          type="text" 
                          value={newAssistantName}
                          onChange={(e) => setNewAssistantName(e.target.value)}
                          placeholder="Name (e.g. Sales Agent)"
                          className="flex-1 px-4 py-2 border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-950 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm text-gray-900 dark:text-white"
                        />
                        <input 
                          type="text" 
                          value={newAssistantId}
                          onChange={(e) => setNewAssistantId(e.target.value)}
                          placeholder="Agent ID"
                          className="flex-[2] px-4 py-2 border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-950 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-mono text-sm text-gray-900 dark:text-white"
                        />
                        <button 
                            onClick={addAssistant}
                            disabled={!newAssistantId.trim() || !newAssistantName.trim()}
                            className="bg-slate-900 dark:bg-slate-700 text-white px-4 py-2 rounded-lg hover:bg-slate-800 dark:hover:bg-slate-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                        >
                            <Plus size={20} />
                        </button>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-100 dark:border-slate-800">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Agent API Key</label>
                    <div className="relative">
                      <input 
                        type="password" 
                        value={agentConfig.privateKey}
                        onChange={(e) => setAgentConfig({...agentConfig, privateKey: e.target.value})}
                        placeholder="Agent API Secret Key..."
                        className="w-full px-4 py-2 border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-950 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-mono text-sm text-gray-900 dark:text-white"
                      />
                      <Shield className="absolute right-3 top-2.5 text-gray-400" size={16} />
                    </div>
                    <p className="text-xs text-amber-600 dark:text-amber-500 mt-1 flex items-center gap-1">
                      <Shield size={10} />
                      Stored locally. Used to fetch call logs and analytics.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'security' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="bg-white dark:bg-slate-900 p-4 md:p-6 rounded-xl border border-gray-200 dark:border-slate-800 shadow-sm">
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100 dark:border-slate-800">
                   <div className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg">
                      <Lock size={20} />
                   </div>
                   <h3 className="font-bold text-gray-900 dark:text-white">Admin Security Access</h3>
                </div>
                
                <div className="space-y-6">
                  {/* Enable/Disable Toggle */}
                  <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700">
                    <div>
                      <h4 className="text-sm font-bold text-gray-900 dark:text-white">PIN Protection</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Require a PIN to access the admin panel</p>
                    </div>
                    <button 
                      onClick={() => setSecurityEnabled(!securityEnabled)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900 ${securityEnabled ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-700'}`}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${securityEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
                    </button>
                  </div>

                  {securityEnabled && (
                    <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">5-Digit Admin PIN</label>
                      <input 
                        type="password" 
                        maxLength={5}
                        value={securityPin}
                        onChange={(e) => {
                          const val = e.target.value.replace(/\D/g, '');
                          if (val.length <= 5) setSecurityPin(val);
                        }}
                        className="w-full px-4 py-2 border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-950 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-xl font-mono tracking-[1em] text-center"
                        placeholder="*****"
                      />
                      <p className="text-xs text-slate-500 mt-3 flex items-start gap-2">
                        <HelpCircle size={14} className="shrink-0 mt-0.5" />
                        This PIN is required every time the admin panel is accessed. Ensure it is kept confidential. Only numeric digits are permitted.
                      </p>
                    </div>
                  )}

                  <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700">
                     <h4 className="text-xs font-black uppercase tracking-widest text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                        <Shield size={14} className="text-blue-500" /> Security Protocol
                     </h4>
                     <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                        Aegisa Protection ensures that all data remains client-side encrypted and inaccessible to unauthorized crawlers or individuals bypassing URLs.
                     </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'general' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="bg-white dark:bg-slate-900 p-4 md:p-6 rounded-xl border border-gray-200 dark:border-slate-800 shadow-sm">
                <h3 className="font-bold text-gray-900 dark:text-white mb-6 border-b border-gray-100 dark:border-slate-800 pb-4">Profile Information</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Company Name</label>
                    <input 
                      type="text" 
                      value={generalConfig.companyName}
                      onChange={(e) => setGeneralConfig({...generalConfig, companyName: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-950 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Administrator Name</label>
                    <input 
                      type="text" 
                      value={generalConfig.adminName}
                      onChange={(e) => setGeneralConfig({...generalConfig, adminName: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-950 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 dark:text-white"
                    />
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Admin Email</label>
                    <input 
                      type="email" 
                      value={generalConfig.email}
                      onChange={(e) => setGeneralConfig({...generalConfig, email: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-950 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 dark:text-white"
                    />
                  </div>

                  <div className="md:col-span-2 pt-4 border-t border-gray-100 dark:border-slate-800">
                     <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Appearance</label>
                     <div className="flex gap-4">
                        <button
                           onClick={() => setGeneralConfig({ ...generalConfig, appearance: 'light' })}
                           className={`flex-1 p-4 rounded-xl border flex flex-col items-center gap-2 transition-all ${
                             generalConfig.appearance !== 'dark' 
                               ? 'border-blue-500 bg-blue-50 text-blue-700' 
                               : 'border-gray-200 dark:border-slate-700 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-800'
                           }`}
                        >
                           <Sun size={24} />
                           <span className="text-sm font-medium">Light Mode</span>
                        </button>

                        <button
                           onClick={() => setGeneralConfig({ ...generalConfig, appearance: 'dark' })}
                           className={`flex-1 p-4 rounded-xl border flex flex-col items-center gap-2 transition-all ${
                             generalConfig.appearance === 'dark' 
                               ? 'border-blue-500 bg-slate-800 text-blue-400' 
                               : 'border-gray-200 dark:border-slate-700 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-800'
                           }`}
                        >
                           <Moon size={24} />
                           <span className="text-sm font-medium">Dark Mode</span>
                        </button>
                     </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;
