
import React, { useState, useEffect } from 'react';
import { Save, Key, User, Shield, CheckCircle2, Plus, Trash2, HelpCircle, Moon, Sun } from 'lucide-react';
// Use RETELL_CONFIG instead of missing VAPI_CONFIG
import { RETELL_CONFIG } from '../constants';
import { Assistant } from '../types';

const Settings: React.FC = () => {
  const [activeSection, setActiveSection] = useState<'general' | 'integrations'>('integrations');
  const [showSuccess, setShowSuccess] = useState(false);

  // Rename config state to retellConfig for consistency
  const [retellConfig, setRetellConfig] = useState({
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

  useEffect(() => {
    // Load Retell Config from localStorage or RETELL_CONFIG constants
    const storedPublicKey = localStorage.getItem('retell_public_key') || '';
    const storedPrivateKey = localStorage.getItem('retell_api_key') || RETELL_CONFIG.API_KEY;
    
    // Load Assistant (Agent) IDs
    let loadedAssistants: Assistant[] = [];
    const storedIdsJson = localStorage.getItem('retell_agent_ids');
    
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
        const oldId = localStorage.getItem('retell_agent_id') || RETELL_CONFIG.AGENT_ID;
        if (oldId && !oldId.includes('YOUR_RETELL')) {
            loadedAssistants = [{ id: oldId, name: 'Primary Agent' }];
        }
    }

    setRetellConfig({
        publicKey: storedPublicKey,
        assistants: loadedAssistants,
        privateKey: storedPrivateKey === 'YOUR_RETELL_API_KEY' ? '' : storedPrivateKey
    });

    const storedGeneral = localStorage.getItem('app_general_config');
    if (storedGeneral) {
      setGeneralConfig(prev => ({ ...prev, ...JSON.parse(storedGeneral) }));
    }
  }, []);

  // Effect to apply theme immediately when state changes
  useEffect(() => {
    if (generalConfig.appearance === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [generalConfig.appearance]);

  const handleSave = () => {
    if (retellConfig.publicKey) localStorage.setItem('retell_public_key', retellConfig.publicKey);
    if (retellConfig.privateKey) localStorage.setItem('retell_api_key', retellConfig.privateKey);
    
    localStorage.setItem('retell_agent_ids', JSON.stringify(retellConfig.assistants));
    
    if (retellConfig.assistants.length > 0) {
        localStorage.setItem('retell_agent_id', retellConfig.assistants[0].id);
    } else {
        localStorage.removeItem('retell_agent_id');
    }

    localStorage.setItem('app_general_config', JSON.stringify(generalConfig));

    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const addAssistant = () => {
    if (newAssistantId.trim() && newAssistantName.trim()) {
        const id = newAssistantId.trim();
        const name = newAssistantName.trim();
        
        if (!retellConfig.assistants.some(a => a.id === id)) {
            setRetellConfig(prev => ({
                ...prev,
                assistants: [...prev.assistants, { id, name }]
            }));
        }
        setNewAssistantId('');
        setNewAssistantName('');
    }
  };

  const removeAssistant = (idToRemove: string) => {
    setRetellConfig(prev => ({
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
        {/* Settings Sidebar */}
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
            Integrations (Retell)
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

        {/* Content Area */}
        <div className="flex-1 min-w-0">
          {activeSection === 'integrations' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="bg-white dark:bg-slate-900 p-4 md:p-6 rounded-xl border border-gray-200 dark:border-slate-800 shadow-sm">
                <div className="space-y-4">
                  {/* Keep the field for flexibility, although Retell primarily uses Agent ID */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Optional Reference Key</label>
                    <input 
                      type="text" 
                      value={retellConfig.publicKey}
                      onChange={(e) => setRetellConfig({...retellConfig, publicKey: e.target.value})}
                      placeholder="e.g. Reference identifier..."
                      className="w-full px-4 py-2 border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-950 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-mono text-sm text-gray-900 dark:text-white"
                    />
                    <p className="text-xs text-gray-400 mt-1">Generic reference for external tracking.</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Retell Agents</label>
                    
                    <div className="space-y-3 mb-4">
                        {retellConfig.assistants.length === 0 && (
                            <p className="text-sm text-gray-400 italic">No agents configured.</p>
                        )}
                        {retellConfig.assistants.map((assistant, index) => (
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
                          placeholder="Agent ID (from Retell dashboard)"
                          className="flex-[2] px-4 py-2 border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-950 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-mono text-sm text-gray-900 dark:text-white"
                        />
                        <button 
                            onClick={addAssistant}
                            disabled={!newAssistantId.trim() || !newAssistantName.trim()}
                            className="bg-slate-900 dark:bg-slate-700 text-white px-4 py-2 rounded-lg hover:bg-slate-800 dark:hover:bg-slate-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                            title="Add Agent"
                        >
                            <Plus size={20} />
                        </button>
                    </div>
                    <p className="text-xs text-gray-400 mt-2 flex items-center gap-1">
                        <HelpCircle size={12} />
                        The first agent in the list is used for the "Call Agent" button.
                    </p>
                  </div>

                  <div className="pt-4 border-t border-gray-100 dark:border-slate-800">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Retell API Key</label>
                    <div className="relative">
                      <input 
                        type="password" 
                        value={retellConfig.privateKey}
                        onChange={(e) => setRetellConfig({...retellConfig, privateKey: e.target.value})}
                        placeholder="Retell API Key..."
                        className="w-full px-4 py-2 border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-950 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-mono text-sm text-gray-900 dark:text-white"
                      />
                      <Shield className="absolute right-3 top-2.5 text-gray-400" size={16} />
                    </div>
                    <p className="text-xs text-amber-600 dark:text-amber-500 mt-1 flex items-center gap-1">
                      <Shield size={10} />
                      Stored locally. Used to fetch logs from Retell AI.
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

                  {/* Appearance Settings */}
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
