import { VAPI_CONFIG } from '../constants';
import { VapiCall } from '../types';

const STORAGE_KEY = 'imperial_vapi_calls';

const loadStoredCalls = (): VapiCall[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    return [];
  }
};

const saveStoredCalls = (calls: VapiCall[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(calls));
  } catch (error) {
    console.warn('Failed to save calls locally:', error);
  }
};

// Initialize with cached data
let localCalls: VapiCall[] = loadStoredCalls();

export const getStoredVapiCalls = (): VapiCall[] => {
  return localCalls;
};

export const fetchVapiCalls = async (): Promise<VapiCall[]> => {
  // Try to get key from Local Storage first (set via Settings page), otherwise use Constant
  const privateKey = localStorage.getItem('vapi_private_key') || VAPI_CONFIG.PRIVATE_KEY;

  if (!privateKey || privateKey.includes('YOUR_VAPI')) {
    console.warn("Private Key is missing. Please configure it in Settings.");
    return [];
  }

  try {
    const response = await fetch('https://api.vapi.ai/call?limit=50', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${privateKey}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
       console.warn(`Vapi API Error: ${response.statusText}`);
       // Return cached data on error to maintain UI state
       return localCalls;
    }

    const data = await response.json();
    const calls = data || [];
    
    // Update local cache
    localCalls = calls;
    saveStoredCalls(localCalls);
    
    return localCalls;
  } catch (error) {
    console.error("Failed to fetch Vapi calls:", error);
    // Return cached data on network failure
    return localCalls;
  }
};
