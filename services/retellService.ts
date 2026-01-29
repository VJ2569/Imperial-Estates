
import { API_CONFIG, AGENT_CONFIG } from '../constants';

const STORAGE_KEY_WEBHOOK_CALLS = 'imperial_webhook_calls';
const STORAGE_KEY_RETELL_CALLS = 'imperial_retell_calls';
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

export const getStoredRetellCalls = (): any[] => loadStored(STORAGE_KEY_RETELL_CALLS);
export const getStoredWebhookCalls = (): any[] => loadStored(STORAGE_KEY_WEBHOOK_CALLS);
export const getStoredLeads = (): any[] => loadStored(STORAGE_KEY_LEADS);

/**
 * Fetches enriched call data directly from Retell AI API.
 * This provides the "Intelligence" view (transcripts, cost, recording).
 */
export const fetchRetellDirectCalls = async (): Promise<any[]> => {
  try {
    const apiKey = localStorage.getItem('agent_api_key') || AGENT_CONFIG.API_KEY;
    
    if (!apiKey || apiKey === 'YOUR_AGENT_API_KEY' || apiKey.trim() === '') {
      console.warn('Retell API Key not configured.');
      return getStoredRetellCalls();
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
      // Handle array or wrapped response
      const rawData = Array.isArray(data) ? data : (data.calls || data.data || []);
      
      const normalizedData = rawData.map((call: any) => ({
        ...call,
        _source: 'retell_api',
        start_timestamp: typeof call.start_timestamp === 'string' ? new Date(call.start_timestamp).getTime() : call.start_timestamp,
        duration_formatted: call.duration_ms ? `${Math.floor(call.duration_ms / 60000)}m ${Math.floor((call.duration_ms % 60000) / 1000)}s` : '---'
      }));

      saveStored(STORAGE_KEY_RETELL_CALLS, normalizedData);
      return normalizedData;
    } else {
      console.error('Retell API Error:', response.status);
    }
  } catch (error) {
    console.error('Network error reaching Retell API. Check CORS settings.');
  }
  return getStoredRetellCalls();
};

/**
 * Fetches raw dynamic data from the n8n Call Webhook.
 * This provides the "Raw Webhook" view.
 */
export const fetchWebhookCalls = async (): Promise<any[]> => {
  try {
    const response = await fetch(`${API_CONFIG.GET_CALLS}?action=get_calls`);
    if (response.ok) {
      const data = await response.json();
      const rawData = Array.isArray(data) ? data : (data.calls || data.data || []);
      const normalizedData = rawData.map((call: any) => ({ ...call, _source: 'webhook' }));
      saveStored(STORAGE_KEY_WEBHOOK_CALLS, normalizedData);
      return normalizedData;
    }
  } catch (error) {
    console.warn('Webhook call fetch failed');
  }
  return getStoredWebhookCalls();
};

/**
 * Fetches lead data from the n8n Lead Webhook.
 */
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
