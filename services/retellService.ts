
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
 * Generates a stable unique ID for a data object if one doesn't exist.
 * This prevents rows in Google Sheets from overwriting each other.
 */
const ensureUniqueId = (item: any, prefix: string): string => {
  if (item.id || item.call_id) return String(item.id || item.call_id);
  // Create a hash-like string from values to identify unique rows
  const fingerprint = Object.values(item).filter(v => typeof v !== 'object').join('|');
  return `${prefix}-${btoa(fingerprint).substring(0, 16)}`;
};

/**
 * Merges new data into existing storage, preventing overwrites of unique records.
 */
const mergeAndPersist = (storageKey: string, newData: any[], idPrefix: string) => {
  const existing = loadStored(storageKey);
  const existingMap = new Map(existing.map(item => [item._uid || item.id || item.call_id, item]));
  
  newData.forEach(item => {
    const uid = ensureUniqueId(item, idPrefix);
    const normalized = {
      ...item,
      _uid: uid,
      _last_synced: Date.now()
    };
    // Merge: New data for the same ID overwrites existing
    existingMap.set(uid, normalized);
  });

  const merged = Array.from(existingMap.values());
  // Sort by timestamp if available
  merged.sort((a, b) => {
    const timeA = a.start_timestamp || a.timestamp || 0;
    const timeB = b.start_timestamp || b.timestamp || 0;
    return Number(timeB) - Number(timeA);
  });

  saveStored(storageKey, merged);
  return merged;
};

export const getStoredVoiceCalls = (): any[] => {
  const calls = loadStored(STORAGE_KEY_VOICE_CALLS);
  const deletedIds = getDeletedIds();
  return calls.filter((c: any) => !deletedIds.includes(c._uid || c.id || c.call_id));
};

export const getStoredWebhookCalls = (): any[] => {
  const calls = loadStored(STORAGE_KEY_WEBHOOK_CALLS);
  const deletedIds = getDeletedIds();
  return calls.filter((c: any) => !deletedIds.includes(c._uid || c.id || c.call_id));
};

/**
 * Fetches enriched call data directly from the Voice AI API (Retell).
 */
export const fetchVoiceDirectCalls = async (): Promise<any[]> => {
  const apiKey = localStorage.getItem('agent_api_key') || AGENT_CONFIG.API_KEY;
  const agentId = localStorage.getItem('agent_id') || AGENT_CONFIG.AGENT_ID;
  const deletedIds = getDeletedIds();

  // If credentials are deleted/missing, clear the cache and return empty
  if (!apiKey || apiKey.trim() === '' || apiKey === 'YOUR_AGENT_API_KEY' || apiKey.includes('YOUR_')) {
    localStorage.removeItem(STORAGE_KEY_VOICE_CALLS);
    return [];
  }

  try {
    // Cache busting with timestamp
    let url = `https://api.retellai.com/v2/list-calls?sort_order=descending&sort_by=start_timestamp&limit=50&_t=${Date.now()}`;
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
      
      const normalizedData = rawData.map((call: any) => ({
        ...call,
        _source_origin: 'voice_direct_api',
        start_timestamp: typeof call.start_timestamp === 'string' ? new Date(call.start_timestamp).getTime() : call.start_timestamp,
        duration_display: call.duration_ms ? `${Math.floor(call.duration_ms / 60000)}m ${Math.floor((call.duration_ms % 60000) / 1000)}s` : '---',
        }));

      const merged = mergeAndPersist(STORAGE_KEY_VOICE_CALLS, normalizedData, 'retell');
      return merged.filter((c: any) => !deletedIds.includes(c._uid || c.id || c.call_id));
    }
  } catch (error) {
    console.error('Retell Direct Sync failed:', error);
  }
  return getStoredVoiceCalls();
};

/**
 * Primary Fetcher for Snapshot data from Google Apps Script.
 */
export const fetchWebhookCalls = async (): Promise<any[]> => {
  const deletedIds = getDeletedIds();
  try {
    // Single GET endpoint for all snapshot data from Google Sheets with cache busting
    const response = await fetch(`${API_CONFIG.GET_CALLS}?_t=${Date.now()}`, { 
      method: 'GET', 
      redirect: 'follow' 
    });

    if (response.ok) {
      const data = await response.json();
      const rawData = Array.isArray(data) ? data : (data.calls || data.data || data.leads || []);
      
      const normalizedData = rawData.map((item: any) => ({ 
        ...item, 
        _source_origin: 'google_apps_script',
        start_timestamp: item.timestamp || item.start_timestamp || item.date || Date.now()
      }));

      const merged = mergeAndPersist(STORAGE_KEY_WEBHOOK_CALLS, normalizedData, 'gas');
      return merged.filter((c: any) => !deletedIds.includes(c._uid || c.id || c.call_id));
    }
  } catch (error) {
    console.warn('GAS Hub Fetch Failed:', error);
  }
  return getStoredWebhookCalls();
};

export const fetchLeads = async (): Promise<any[]> => {
  return fetchWebhookCalls();
};
