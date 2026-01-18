
import { RETELL_CONFIG } from '../constants';
import { RetellCall } from '../types';

const STORAGE_KEY = 'imperial_retell_calls';

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
    console.warn('Failed to save calls locally:', error);
  }
};

let localCalls: RetellCall[] = loadStoredCalls();

export const getStoredRetellCalls = (): RetellCall[] => {
  return localCalls;
};

export const fetchRetellCalls = async (): Promise<RetellCall[]> => {
  const apiKey = localStorage.getItem('retell_api_key') || RETELL_CONFIG.API_KEY;

  if (!apiKey || apiKey.includes('YOUR_RETELL')) {
    console.warn("Retell API Key is missing.");
    return [];
  }

  try {
    const response = await fetch('https://api.retellai.com/list-calls?limit=50', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
       return localCalls;
    }

    const data = await response.json();
    const calls = Array.isArray(data) ? data : (data.calls || []);
    
    localCalls = calls;
    saveStoredCalls(localCalls);
    
    return localCalls;
  } catch (error) {
    console.error("Failed to fetch Retell calls:", error);
    return localCalls;
  }
};
