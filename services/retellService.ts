
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
  return calls.filter((c: any) => !deletedIds.includes(c.id || c.call_id));
};

export const getStoredWebhookCalls = (): any[] => {
  const calls = loadStored(STORAGE_KEY_WEBHOOK_CALLS);
  const deletedIds = getDeletedIds();
  return calls.filter((c: any) => !deletedIds.includes(c.id || c.call_id));
};

export const getStoredLeads = (): any[] => loadStored(STORAGE_KEY_LEADS);

/**
 * Fetches enriched call data directly from the Voice AI API.
 */
export const fetchVoiceDirectCalls = async (): Promise<any[]> => {
  try {
    const apiKey = localStorage.getItem('agent_api_key') || AGENT_CONFIG.API_KEY;
    const agentId = localStorage.getItem('agent_id') || AGENT_CONFIG.AGENT_ID;
    
    // Safety check for empty or placeholder keys
    if (!apiKey || apiKey.trim() === '' || apiKey === 'YOUR_AGENT_API_KEY' || apiKey.includes('YOUR_')) {
      return getStoredVoiceCalls();
    }

    // Retell V2 list-calls with explicit sorting and limit
    let url = 'https://api.retellai.com/v2/list-calls?sort_order=descending&sort_by=start_timestamp&limit=100';
    if (agentId && agentId !== 'YOUR_AGENT_ID' && !agentId.includes('YOUR_')) {
      url += `&filter_agent_id=${agentId}`;
    }

    const response = await fetch(url, {
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
        return {
          ...call,
          _source_origin: 'voice_direct_api',
          // Standardization for IST conversion
          start_timestamp: typeof call.start_timestamp === 'string' ? new Date(call.start_timestamp).getTime() : call.start_timestamp,
          end_timestamp: typeof call.end_timestamp === 'string' ? new Date(call.end_timestamp).getTime() : call.end_timestamp,
          duration_display: call.duration_ms ? `${Math.floor(call.duration_ms / 60000)}m ${Math.floor((call.duration_ms % 60000) / 1000)}s` : '---',
          cost_display: call.combined_cost ? `₹${(call.combined_cost * 84).toFixed(2)}` : '---'
        };
      });

      saveStored(STORAGE_KEY_VOICE_CALLS, normalizedData);
      return normalizedData.filter((c: any) => !deletedIds.includes(c.id || c.call_id));
    } else {
      console.error(`Voice API error: ${response.status}`);
    }
  } catch (error) {
    console.error('Critical Failure: Voice Direct API Sync');
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
      const normalizedData = rawData.map((call: any) => ({ ...call, _source_origin: 'webhook_n8n' }));
      saveStored(STORAGE_KEY_WEBHOOK_CALLS, normalizedData);
      return getStoredWebhookCalls();
    }
  } catch (error) {
    console.warn('Webhook call fetch failed');
  }
  return getStoredWebhookCalls();
};

export const fetchLeads = async (): Promise<any[]> => {
  try {
    const response = await fetch(`${API_CONFIG.GET_CALLS}?action=get_leads`);
    if (response.ok) {
      const data = await response.json();
      const rawData = Array.isArray(data) ? data : (data.leads || data.data || []);
      saveStored(STORAGE_KEY_LEADS, rawData);
      return rawData;
    }
  } catch (error) {
    console.warn('Leads fetch failed');
  }
  return getStoredLeads();
};
