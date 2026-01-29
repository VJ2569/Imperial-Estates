
import { API_CONFIG, AGENT_CONFIG } from '../constants';

const STORAGE_KEY_WEBHOOK_CALLS = 'imperial_webhook_calls';
const STORAGE_KEY_VOICE_CALLS = 'imperial_voice_calls';
const STORAGE_KEY_LEADS = 'imperial_leads';

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

export const getStoredVoiceCalls = (): any[] => loadStored(STORAGE_KEY_VOICE_CALLS);
export const getStoredWebhookCalls = (): any[] => loadStored(STORAGE_KEY_WEBHOOK_CALLS);
export const getStoredLeads = (): any[] => loadStored(STORAGE_KEY_LEADS);

/**
 * Fetches enriched call data directly from the Voice AI API.
 * Updated to use POST /v2/list-calls as requested.
 */
export const fetchVoiceDirectCalls = async (): Promise<any[]> => {
  try {
    const apiKey = localStorage.getItem('agent_api_key') || AGENT_CONFIG.API_KEY;
    
    if (!apiKey || apiKey.trim() === '' || apiKey === 'YOUR_AGENT_API_KEY') {
      console.warn('Voice AI API Key not configured. Please visit Settings.');
      return getStoredVoiceCalls();
    }

    // Using POST as explicitly requested
    const response = await fetch('https://api.retellai.com/v2/list-calls', {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      // Some APIs require an empty body for POST requests to list endpoints
      body: JSON.stringify({}) 
    });

    if (response.ok) {
      const data = await response.json();
      // Handle both direct array and wrapped response { calls: [...] }
      const rawData = Array.isArray(data) ? data : (data.calls || data.data || []);
      
      const normalizedData = rawData.map((call: any) => ({
        ...call,
        _source_origin: 'voice_direct_api',
        // Ensure timestamp is a number for reliable sorting/charting
        start_timestamp: typeof call.start_timestamp === 'string' ? new Date(call.start_timestamp).getTime() : call.start_timestamp,
        // Format duration for the table view
        duration_display: call.duration_ms ? `${Math.floor(call.duration_ms / 60000)}m ${Math.floor((call.duration_ms % 60000) / 1000)}s` : '---'
      }));

      saveStored(STORAGE_KEY_VOICE_CALLS, normalizedData);
      return normalizedData;
    } else {
      // If POST fails, fallback to GET to ensure data availability or log the error
      console.error('Voice API POST error:', response.status);
      
      // Attempting GET as a secondary safety measure if POST is rejected by the server
      const getResponse = await fetch('https://api.retellai.com/v2/list-calls', {
        method: 'GET',
        headers: { 
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (getResponse.ok) {
        const getData = await getResponse.json();
        const rawGetData = Array.isArray(getData) ? getData : (getData.calls || getData.data || []);
        const normalizedGetData = rawGetData.map((call: any) => ({
          ...call,
          _source_origin: 'voice_direct_api',
          start_timestamp: typeof call.start_timestamp === 'string' ? new Date(call.start_timestamp).getTime() : call.start_timestamp,
          duration_display: call.duration_ms ? `${Math.floor(call.duration_ms / 60000)}m ${Math.floor((call.duration_ms % 60000) / 1000)}s` : '---'
        }));
        saveStored(STORAGE_KEY_VOICE_CALLS, normalizedGetData);
        return normalizedGetData;
      }
    }
  } catch (error) {
    console.error('Network error reaching Voice AI API:', error);
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
      return normalizedData;
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
