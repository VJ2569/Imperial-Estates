import { AGENT_CONFIG, API_CONFIG } from '../constants';
import { RetellCall } from '../types';

const STORAGE_KEY = 'imperial_agent_calls';

const loadStoredCalls = (): RetellCall[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    return [];
  }
};

const saveStoredCalls = (calls: RetellCall[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(calls));
  } catch (error) {
    console.warn('Failed to save agent calls locally:', error);
  }
};

let localCalls: RetellCall[] = loadStoredCalls();

export const getStoredRetellCalls = (): RetellCall[] => {
  return localCalls;
};

export const fetchRetellCalls = async (): Promise<RetellCall[]> => {
  // Try fetching from the unified database (e.g. n8n or internal DB)
  try {
    const response = await fetch(`${API_CONFIG.GET_CALLS}?action=get_unified_calls`);
    if (response.ok) {
      const data = await response.json();
      const fetched = Array.isArray(data) ? data : (data.calls || []);
      localCalls = fetched;
      saveStoredCalls(localCalls);
      return localCalls;
    }
  } catch (error) {
    console.warn('Unified database fetch failed, attempting Retell fallback or using cache.');
  }

  // Fallback to Retell API if the custom database is unavailable
  const apiKey = localStorage.getItem('agent_api_key') || AGENT_CONFIG.API_KEY;
  if (!apiKey || apiKey === 'YOUR_AGENT_API_KEY') {
    return localCalls;
  }

  try {
    const response = await fetch('https://api.retellai.com/v2/list-calls', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ limit: 50 })
    });

    if (response.ok) {
      const data = await response.json();
      const calls = Array.isArray(data) ? data : (data.calls || []);
      localCalls = calls.map((c: any) => ({
        ...c,
        call_session_id: c.call_id, // Map for consistency
        status: c.call_status === 'completed' ? 'completed' : 'in_progress'
      }));
      saveStoredCalls(localCalls);
    }
  } catch (error) {
    console.error("Failed to fetch from Retell:", error);
  }

  return localCalls;
};
