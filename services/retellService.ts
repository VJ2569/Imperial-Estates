import { AGENT_CONFIG } from '../constants';
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
  const apiKey = localStorage.getItem('agent_api_key') || AGENT_CONFIG.API_KEY;

  if (!apiKey || apiKey === 'YOUR_AGENT_API_KEY') {
    console.warn("Agent API Key is missing.");
    return [];
  }

  try {
    // User requirement: Must use POST /v2/list-calls
    const response = await fetch('https://api.retellai.com/v2/list-calls', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      // Optional: limit to 50 calls for performance
      body: JSON.stringify({
        limit: 50
      })
    });

    if (!response.ok) {
       console.error(`Retell fetch failed: ${response.status}`);
       return localCalls;
    }

    const data = await response.json();
    // The response might be the array directly or an object containing the array
    const calls = Array.isArray(data) ? data : (data.calls || []);
    
    localCalls = calls;
    saveStoredCalls(localCalls);
    
    return localCalls;
  } catch (error) {
    console.error("Failed to fetch agent calls:", error);
    return localCalls;
  }
};
