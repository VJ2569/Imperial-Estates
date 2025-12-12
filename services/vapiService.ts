import { VAPI_CONFIG } from '../constants';
import { VapiCall } from '../types';

export const fetchVapiCalls = async (): Promise<VapiCall[]> => {
  // Try to get key from Local Storage first (set via Settings page), otherwise use Constant
  const privateKey = localStorage.getItem('vapi_private_key') || VAPI_CONFIG.PRIVATE_KEY;

  if (!privateKey || privateKey.includes('YOUR_VAPI')) {
    console.warn("Vapi Private Key is missing. Please configure it in Settings.");
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
      throw new Error(`Vapi API Error: ${response.statusText}`);
    }

    const data = await response.json();
    return data || [];
  } catch (error) {
    console.error("Failed to fetch Vapi calls:", error);
    return [];
  }
};