
import { API_CONFIG, AGENT_CONFIG } from '../constants';

const STORAGE_KEY_WEBHOOK_CALLS = 'imperial_webhook_calls';
const STORAGE_KEY_VOICE_CALLS = 'imperial_voice_calls';
const STORAGE_KEY_LEADS = 'imperial_leads';
const STORAGE_KEY_DELETED_IDS = 'imperial_deleted_session_ids';

const loadStored = (key: string): any[] => {
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    return [];
  }
};

const saveStored = (key: string, data: any[]) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {}
};

export const getDeletedIds = (): string[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY_DELETED_IDS);
    return stored ? JSON.parse(stored) : [];
  } catch (e) {
    return [];
  }
};

export const markIdAsDeleted = (id: string) => {
  const deleted = getDeletedIds();
  if (!deleted.includes(id)) {
    const updated = [...deleted, id];
    localStorage.setItem(STORAGE_KEY_DELETED_IDS, JSON.stringify(updated));
  }
};

export const getStoredVoiceCalls = (): any[] => {
  const calls = loadStored(STORAGE_KEY_VOICE_CALLS);
  const deletedIds = getDeletedIds();
  return calls.filter(c => !deletedIds.includes(c.id || c.call_id));
};

export const getStoredWebhookCalls = (): any[] => {
  const calls = loadStored(STORAGE_KEY_WEBHOOK_CALLS);
  const deletedIds = getDeletedIds();
  return calls.filter(c => !deletedIds.includes(c.id || c.call_id));
};

export const getStoredLeads = (): any[] => loadStored(STORAGE_KEY_LEADS);

/**
 * Fetches enriched call data directly from the Voice AI API.
 */
export const fetchVoiceDirectCalls = async (): Promise<any[]> => {
  try {
    const apiKey = localStorage.getItem('agent_api_key') || AGENT_CONFIG.API_KEY;
    
    if (!apiKey || apiKey.trim() === '' || apiKey === 'YOUR_AGENT_API_KEY') {
      return getStoredVoiceCalls();
    }

    const response = await fetch('https://api.retellai.com/v2/list-calls', {
      method: 'GET',
      headers: { 
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    });

    if (response.ok) {
      const data = await response.json();
      const rawData = Array.isArray(data) ? data : (data.calls || data.data || []);
      const deletedIds = getDeletedIds();
      
      const normalizedData = rawData.map((call: any) => {
        // Extract Name and Enquiry Type from analysis or metadata
        const analysis = call.call_analysis || {};
        const customData = analysis.custom_analysis_data || {};
        
        return {
          ...call,
          _source_origin: 'voice_direct_api',
          customer_name: customData.name || call.metadata?.name || '---',
          enquiry_type: customData.enquiry_type || call.metadata?.enquiry_type || '---',
          // IST logic handled in UI component
          start_timestamp: typeof call.start_timestamp === 'string' ? new Date(call.start_timestamp).getTime() : call.start_timestamp,
          end_timestamp: typeof call.end_timestamp === 'string' ? new Date(call.end_timestamp).getTime() : call.end_timestamp,
          duration_display: call.duration_ms ? `${Math.floor(call.duration_ms / 60000)}m ${Math.floor((call.duration_ms % 60000) / 1000)}s` : '---',
          cost_display: call.combined_cost ? `₹${(call.combined_cost * 83).toFixed(2)}` : '---'
        };
      });

      saveStored(STORAGE_KEY_VOICE_CALLS, normalizedData);
      return normalizedData.filter(c => !deletedIds.includes(c.id || c.call_id));
    }
  } catch (error) {
    console.error('Network sync failure');
  }
  return getStoredVoiceCalls();
};

/**
 * Fetches raw dynamic data from the n8n Webhook.
 */
export const fetchWebhookCalls = async (): Promise<any[]> => {
  try {
    const response = await fetch(`${API_CONFIG.GET_CALLS}?action=get_calls`);
    if (response.ok) {
      const data = await response.json();
      const rawData = Array.isArray(data) ? data : (data.calls || data.data || []);
      const deletedIds = getDeletedIds();
      const normalizedData = rawData.map((call: any) => ({ ...call, _source_origin: 'webhook_n8n' }));
      saveStored(STORAGE_KEY_WEBHOOK_CALLS, normalizedData);
      return normalizedData.filter(c => !deletedIds.includes(c.id || c.call_id));
    }
  } catch (error) {
    console.warn('Webhook sync failure');
  }
  return getStoredWebhookCalls();
};
