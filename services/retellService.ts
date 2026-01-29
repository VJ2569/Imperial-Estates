
import { API_CONFIG } from '../constants';

const STORAGE_KEY_CALLS = 'imperial_dynamic_calls';
const STORAGE_KEY_LEADS = 'imperial_dynamic_leads';

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

export const getStoredRetellCalls = (): any[] => loadStored(STORAGE_KEY_CALLS);
export const getStoredLeads = (): any[] => loadStored(STORAGE_KEY_LEADS);

/**
 * Fetches data from the dynamic n8n webhook.
 * We return raw objects to allow the UI to generate columns dynamically.
 */
export const fetchRetellCalls = async (): Promise<any[]> => {
  try {
    const response = await fetch(`${API_CONFIG.GET_CALLS}?action=get_calls`);
    if (response.ok) {
      const data = await response.json();
      const rawData = Array.isArray(data) ? data : (data.calls || data.data || []);
      saveStored(STORAGE_KEY_CALLS, rawData);
      return rawData;
    }
  } catch (error) {
    console.warn('Call fetch failed, using cache.');
  }
  return getStoredRetellCalls();
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
    console.warn('Leads fetch failed, using cache.');
  }
  return getStoredLeads();
};
