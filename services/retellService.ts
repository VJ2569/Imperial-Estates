
import { API_CONFIG, AGENT_CONFIG } from '../constants';

const STORAGE_KEY_WEBHOOK_CALLS = 'imperial_webhook_calls';
const STORAGE_KEY_VOICE_CALLS = 'imperial_voice_calls';
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

/**
 * Merges new Retell data into existing storage.
 */
const mergeRetellData = (newData: any[]) => {
  const existing = loadStored(STORAGE_KEY_VOICE_CALLS);
  const existingMap = new Map(existing.map(item => [item.call_id || item.id, item]));
  
  newData.forEach(item => {
    const id = item.call_id || item.id;
    if (id) {
      existingMap.set(id, {
        ...item,
        _last_synced: Date.now()
      });
    }
  });

  const merged = Array.from(existingMap.values());
  merged.sort((a, b) => Number(b.start_timestamp || 0) - Number(a.start_timestamp || 0));
  saveStored(STORAGE_KEY_VOICE_CALLS, merged);
  return merged;
};

export const getStoredVoiceCalls = (): any[] => {
  const calls = loadStored(STORAGE_KEY_VOICE_CALLS);
  const deletedIds = getDeletedIds();
  return calls.filter((c: any) => !deletedIds.includes(c.id || c.call_id));
};

export const getStoredWebhookCalls = (): any[] => {
  const calls = loadStored(STORAGE_KEY_WEBHOOK_CALLS);
  const deletedIds = getDeletedIds();
  return calls.filter((c: any) => !deletedIds.includes(c._uid || c.id || c.call_id));
};

/**
 * Fetches enriched call data directly from the Retell API.
 */
export const fetchVoiceDirectCalls = async (): Promise<any[]> => {
  const apiKey = localStorage.getItem('agent_api_key') || AGENT_CONFIG.API_KEY;
  const agentId = localStorage.getItem('agent_id') || AGENT_CONFIG.AGENT_ID;
  const deletedIds = getDeletedIds();

  // If credentials are gone, wipe local cache and return empty
  if (!apiKey || apiKey.trim() === "" || apiKey.includes("YOUR_")) {
    localStorage.removeItem(STORAGE_KEY_VOICE_CALLS);
    return [];
  }

  try {
    const timestamp = Date.now();
    let url = `https://api.retellai.com/v2/list-calls?sort_order=descending&sort_by=start_timestamp&limit=50&_t=${timestamp}`;
    if (agentId && !agentId.includes("YOUR_")) {
      url += `&filter_agent_id=${agentId}`;
    }

    const response = await fetch(url, {
      method: "GET",
      headers: { 
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      }
    });

    if (response.ok) {
      const data = await response.json();
      const rawData = Array.isArray(data) ? data : (data.calls || data.data || []);
      
      const normalizedData = rawData.map((call: any) => ({
        ...call,
        _source_origin: 'voice_direct_api',
        start_timestamp: typeof call.start_timestamp === 'string' ? new Date(call.start_timestamp).getTime() : call.start_timestamp,
        duration_display: call.duration_ms ? `${Math.floor(call.duration_ms / 60000)}m ${Math.floor((call.duration_ms % 60000) / 1000)}s` : "---",
        cost_display: call.combined_cost ? `₹${(call.combined_cost * 84).toFixed(2)}` : "---"
      }));

      const merged = mergeRetellData(normalizedData);
      return merged.filter((c: any) => !deletedIds.includes(c.id || c.call_id));
    }
  } catch (error) {
    console.error("Retell Fetch Failed:", error);
  }
  return getStoredVoiceCalls();
};

/**
 * SNAPSHOT FETCH: Replaces local hub data with exact API response.
 */
export const fetchWebhookCalls = async (): Promise<any[]> => {
  const deletedIds = getDeletedIds();
  try {
    const response = await fetch(`${API_CONFIG.GET_CALLS}?_t=${Date.now()}`, { 
      method: "GET", 
      redirect: "follow" 
    });

    if (response.ok) {
      const data = await response.json();
      const rawData = Array.isArray(data) ? data : (data.calls || data.data || data.leads || []);
      
      // For GAS, we treat the API as a complete snapshot. Replace, don't merge.
      const snapshot = rawData.map((item: any, index: number) => ({ 
        ...item, 
        _source_origin: 'google_apps_script',
        _uid: `gas-${index}-${Date.now()}`, // Ensure React key stability for this session
        start_timestamp: item.timestamp || item.start_timestamp || item.date || Date.now()
      }));

      saveStored(STORAGE_KEY_WEBHOOK_CALLS, snapshot);
      return snapshot.filter((c: any) => !deletedIds.includes(c.id || c.call_id));
    }
  } catch (error) {
    console.warn("GAS Hub Sync Failed:", error);
  }
  return getStoredWebhookCalls();
};

export const fetchLeads = async (): Promise<any[]> => fetchWebhookCalls();
