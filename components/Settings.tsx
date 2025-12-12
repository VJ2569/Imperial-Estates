import React, { useState, useEffect } from 'react';
import { Save, Key, User, Shield, CheckCircle2, Plus, Trash2, HelpCircle } from 'lucide-react';
import { VAPI_CONFIG } from '../constants';
import { Assistant } from '../types';

const Settings: React.FC = () => {
  const [activeSection, setActiveSection] = useState<'general' | 'integrations'>('integrations');
  const [showSuccess, setShowSuccess] = useState(false);

  const [vapiConfig, setVapiConfig] = useState({
    publicKey: '',
    assistants: [] as Assistant[],
    privateKey: ''
  });
  
  const [newAssistantId, setNewAssistantId] = useState('');
  const [newAssistantName, setNewAssistantName] = useState('');

  const [generalConfig, setGeneralConfig] = useState({
    companyName: 'Imperial Estates',
    adminName: 'Admin User',
    email: 'admin@imperialestates.com'
  });

  useEffect(() => {
    // Load Vapi Config
    const storedPublicKey = localStorage.getItem('vapi_public_key') || VAPI_CONFIG.PUBLIC_KEY;
    const storedPrivateKey = localStorage.getItem('vapi_private_key') || VAPI_CONFIG.PRIVATE_KEY;
    
    // Load Assistant IDs (Migration logic: handle both string[] and Assistant[])
    let loadedAssistants: Assistant[] = [];
    const storedIdsJson = localStorage.getItem('vapi_assistant_ids');
    
    if (storedIdsJson) {
        try {
            const parsed = JSON.parse(storedIdsJson);
            if (Array.isArray(parsed)) {
                // Check if it's the old string array format
                if (parsed.length > 0 && typeof parsed[0] === 'string') {
                    loadedAssistants = parsed.map((id, idx) => ({ 
                        id, 
                        name: `Assistant ${idx + 1}` 
                    }));
                } else {
                    // Assume it's the new Assistant[] format
                    loadedAssistants = parsed;
                }
            }
        } catch (e) {
            console.error('Failed to parse assistant IDs', e);
        }
    } else {
        // Fallback migration for very old single ID key
        const oldId = localStorage.getItem('vapi_assistant_id') || VAPI_CONFIG.ASSISTANT_ID;
        if (oldId && !oldId.includes('YOUR_VAPI')) {
            loadedAssistants = [{ id: oldId, name: 'Primary Assistant' }];
        }
    }

    setVapiConfig({
        publicKey: storedPublicKey === 'YOUR_VAPI_PUBLIC_KEY' ? '' : storedPublicKey,
        assistants: loadedAssistants,
        privateKey: storedPrivateKey === 'YOUR_VAPI_PRIVATE_KEY_HERE' ? '' : storedPrivateKey
    });

    const storedGeneral = localStorage.getItem('app_general_config');
    if (storedGeneral) {
      setGeneralConfig(JSON.parse(storedGeneral));
    }
  }, []);

  const handleSave = () => {
    if (vapiConfig.publicKey) localStorage.setItem('vapi_public_key', vapiConfig.publicKey);
    if (vapiConfig.privateKey) localStorage.setItem('vapi_private_key', vapiConfig.privateKey);
    
    // Save IDs as JSON array of objects
    localStorage.setItem('vapi_assistant_ids', JSON.stringify(vapiConfig.assistants));
    
    // Update the legacy single key for backward compatibility
    if (vapiConfig.assistants.length > 0) {
        localStorage.setItem('vapi_assistant_id', vapiConfig.assistants[0].id);
    } else {
        localStorage.removeItem('vapi_assistant_id');
    }

    localStorage.setItem('app_general_config', JSON.stringify(generalConfig));

    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const addAssistant = () => {
    if (newAssistantId.trim() && newAssistantName.trim()) {
        const id = newAssistantId.trim();
        const name = newAssistantName.trim();
        
        // Check for duplicate IDs
        if (!vapiConfig.assistants.some(a => a.id === id)) {
            setVapiConfig(prev => ({
                ...prev,
                assistants: [...prev.assistants, { id, name }]
            }));
        }
        setNewAssistantId('');
        setNewAssistantName('');
    }
  };

  const removeAssistant = (idToRemove: string) => {
    setVapiConfig(prev => ({
        ...prev,
        assistants: prev.assistants.filter(a => a.id !== idToRemove)
    }));
  };

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 md:mb-8">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-gray-900">Settings</h2>
          <p className="text-gray-500 text-sm">Application preferences</p>
        </div>
        <button
          onClick={handleSave}
          className="bg-blue-600 text-white px-6 py-2.5 rounded-xl hover:bg-blue-700 transition-colors font-semibold shadow-lg shadow-blue-200 flex items-center justify-center gap-2 w-full sm:w-auto"
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
                ? 'bg-white text-blue-600 shadow-sm border border-gray-100' 
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Key size={18} />
            Integrations
          </button>
          <button
            onClick={() => setActiveSection('general')}
            className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 font-medium transition-colors ${
              activeSection === 'general' 
                ? 'bg-white text-blue-600 shadow-sm border border-gray-100' 
                : 'text-gray-600 hover:bg-gray-50'
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
              <div className="bg-white p-4 md:p-6 rounded-xl border border-gray-200 shadow-sm">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Public Key</label>
                    <input 
                      type="text" 
                      value={vapiConfig.publicKey}
                      onChange={(e) => setVapiConfig({...vapiConfig, publicKey: e.target.value})}
                      placeholder="e.g. 1234-abcd-..."
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none font-mono text-sm"
                    />
                    <p className="text-xs text-gray-400 mt-1">Used for the browser microphone client.</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Assistants</label>
                    
                    <div className="space-y-3 mb-4">
                        {vapiConfig.assistants.length === 0 && (
                            <p className="text-sm text-gray-400 italic">No assistants configured.</p>
                        )}
                        {vapiConfig.assistants.map((assistant, index) => (
                            <div key={assistant.id} className="flex items-center gap-3 bg-gray-50 p-3 rounded-lg border border-gray-100 group">
                                <div className="bg-purple-100 text-purple-700 w-8 h-8 rounded flex items-center justify-center text-xs font-bold shrink-0">
                                    {index + 1}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="text-sm font-bold text-gray-800 truncate">{assistant.name}</div>
                                    <div className="text-xs font-mono text-gray-500 truncate">{assistant.id}</div>
                                </div>
                                <button 
                                    onClick={() => removeAssistant(assistant.id)}
                                    className="p-2 text-gray-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                                    title="Remove Assistant"
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
                          className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none text-sm"
                        />
                        <input 
                          type="text" 
                          value={newAssistantId}
                          onChange={(e) => setNewAssistantId(e.target.value)}
                          placeholder="ID (e.g. 5678-efgh...)"
                          className="flex-[2] px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none font-mono text-sm"
                        />
                        <button 
                            onClick={addAssistant}
                            disabled={!newAssistantId.trim() || !newAssistantName.trim()}
                            className="bg-slate-900 text-white px-4 py-2 rounded-lg hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                            title="Add Assistant"
                        >
                            <Plus size={20} />
                        </button>
                    </div>
                    <p className="text-xs text-gray-400 mt-2 flex items-center gap-1">
                        <HelpCircle size={12} />
                        The first assistant in the list is used for the "Call Agent" button.
                    </p>
                  </div>

                  <div className="pt-4 border-t border-gray-100">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Private API Key</label>
                    <div className="relative">
                      <input 
                        type="password" 
                        value={vapiConfig.privateKey}
                        onChange={(e) => setVapiConfig({...vapiConfig, privateKey: e.target.value})}
                        placeholder="sk-..."
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none font-mono text-sm"
                      />
                      <Shield className="absolute right-3 top-2.5 text-gray-400" size={16} />
                    </div>
                    <p className="text-xs text-amber-600 mt-1 flex items-center gap-1">
                      <Shield size={10} />
                      Stored locally. Used to fetch logs.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'general' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="bg-white p-4 md:p-6 rounded-xl border border-gray-200 shadow-sm">
                <h3 className="font-bold text-gray-900 mb-6 border-b border-gray-100 pb-4">Profile Information</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
                    <input 
                      type="text" 
                      value={generalConfig.companyName}
                      onChange={(e) => setGeneralConfig({...generalConfig, companyName: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Administrator Name</label>
                    <input 
                      type="text" 
                      value={generalConfig.adminName}
                      onChange={(e) => setGeneralConfig({...generalConfig, adminName: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Admin Email</label>
                    <input 
                      type="email" 
                      value={generalConfig.email}
                      onChange={(e) => setGeneralConfig({...generalConfig, email: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    />
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
