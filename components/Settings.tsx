
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
    appearance: 'light'
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
                loadedAssistants = parsed;
            }
        } catch (e) {
            console.error('Failed to parse agent IDs', e);
        }
    }

    setAgentConfig({
        publicKey: storedPublicKey,
        assistants: loadedAssistants,
        privateKey: (storedPrivateKey === 'YOUR_AGENT_API_KEY' || !storedPrivateKey) ? '' : storedPrivateKey
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
    localStorage.setItem('agent_public_key', agentConfig.publicKey);
    localStorage.setItem('agent_api_key', agentConfig.privateKey);
    localStorage.setItem('agent_ids', JSON.stringify(agentConfig.assistants));
    
    if (agentConfig.assistants.length > 0) {
        localStorage.setItem('agent_id', agentConfig.assistants[0].id);
    } else {
        localStorage.removeItem('agent_id');
    }

    localStorage.setItem('aegisa_security_pin', securityPin);
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
          <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white uppercase tracking-tight">System Configuration</h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm italic">Local security and communication protocols</p>
        </div>
        <button
          onClick={handleSave}
          className="bg-blue-600 text-white px-6 py-2.5 rounded-xl hover:bg-blue-700 transition-colors font-semibold shadow-lg flex items-center justify-center gap-2 w-full sm:w-auto"
        >
          {showSuccess ? <CheckCircle2 size={20} /> : <Save size={20} />}
          {showSuccess ? 'SYNCED' : 'COMMIT CHANGES'}
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
            Voice Intelligence
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
            Aegisa Access
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
            Imperial Profile
          </button>
        </div>

        <div className="flex-1 min-w-0">
          {activeSection === 'integrations' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="bg-white dark:bg-slate-900 p-4 md:p-6 rounded-xl border border-gray-200 dark:border-slate-800 shadow-sm">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Deployed Intelligence Units</label>
                    <div className="space-y-3 mb-4">
                        {agentConfig.assistants.length === 0 && (
                            <p className="text-sm text-gray-400 italic">No AI units active.</p>
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
                          placeholder="Unit Identifier"
                          className="flex-1 px-4 py-2 border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-950 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm text-gray-900 dark:text-white"
                        />
                        <input 
                          type="text" 
                          value={newAssistantId}
                          onChange={(e) => setNewAssistantId(e.target.value)}
                          placeholder="Project ID"
                          className="flex-[2] px-4 py-2 border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-950 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-mono text-sm text-gray-900 dark:text-white"
                        />
                        <button 
                            onClick={addAssistant}
                            disabled={!newAssistantId.trim() || !newAssistantName.trim()}
                            className="bg-slate-900 dark:bg-slate-700 text-white px-4 py-2 rounded-lg hover:bg-slate-800 transition-colors disabled:opacity-50"
                        >
                            <Plus size={20} />
                        </button>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-100 dark:border-slate-800 space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Public API Key</label>
                      <input 
                        type="text" 
                        value={agentConfig.publicKey}
                        onChange={(e) => setAgentConfig({...agentConfig, publicKey: e.target.value})}
                        placeholder="Public Key (Optional)..."
                        className="w-full px-4 py-2 border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-950 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-mono text-sm text-gray-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Private API Key (Access Token)</label>
                      <div className="relative">
                        <input 
                          type="password" 
                          value={agentConfig.privateKey}
                          onChange={(e) => setAgentConfig({...agentConfig, privateKey: e.target.value})}
                          placeholder="Secure API Token..."
                          className="w-full px-4 py-2 border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-950 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-mono text-sm text-gray-900 dark:text-white"
                        />
                        <Shield className="absolute right-3 top-2.5 text-gray-400" size={16} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          {activeSection === 'security' && (
             <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
               <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-gray-200 dark:border-slate-800 shadow-sm">
                 <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100 dark:border-slate-800">
                    <Lock size={20} className="text-blue-600" />
                    <h3 className="font-bold text-gray-900 dark:text-white uppercase tracking-tight">Access Control</h3>
                 </div>
                 <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700">
                    <div>
                      <h4 className="text-sm font-bold text-gray-900 dark:text-white">Encrypted PIN</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Secure admin gateway</p>
                    </div>
                    <button 
                      onClick={() => setSecurityEnabled(!securityEnabled)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${securityEnabled ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-700'}`}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${securityEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
                    </button>
                  </div>
                  {securityEnabled && (
                    <div className="mt-4 animate-in fade-in slide-in-from-top-2">
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
                    </div>
                  )}
               </div>
             </div>
          )}
          {activeSection === 'general' && (
             <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
               <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-gray-200 dark:border-slate-800 shadow-sm">
                 <h3 className="font-bold text-gray-900 dark:text-white mb-6 border-b border-gray-100 dark:border-slate-800 pb-4 uppercase tracking-tight">Asset Profile</h3>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Organization</label>
                      <input type="text" value={generalConfig.companyName} onChange={(e) => setGeneralConfig({...generalConfig, companyName: e.target.value})} className="w-full px-4 py-2 border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-950 rounded-lg text-gray-900 dark:text-white" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Principal</label>
                      <input type="text" value={generalConfig.adminName} onChange={(e) => setGeneralConfig({...generalConfig, adminName: e.target.value})} className="w-full px-4 py-2 border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-950 rounded-lg text-gray-900 dark:text-white" />
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
