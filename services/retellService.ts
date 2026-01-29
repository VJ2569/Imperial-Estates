
import { AGENT_CONFIG, API_CONFIG } from '../constants';
import { RetellCall, Lead } from '../types';

const STORAGE_KEY = 'imperial_agent_calls';
const LEADS_STORAGE_KEY = 'imperial_agent_leads';

const loadStoredCalls = (): RetellCall[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    return [];
  }
};

const loadStoredLeads = (): Lead[] => {
  try {
    const stored = localStorage.getItem(LEADS_STORAGE_KEY);
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

const saveStoredLeads = (leads: Lead[]) => {
  try {
    localStorage.setItem(LEADS_STORAGE_KEY, JSON.stringify(leads));
  } catch (error) {
    console.warn('Failed to save leads locally:', error);
  }
};

let localCalls: RetellCall[] = loadStoredCalls();
let localLeads: Lead[] = loadStoredLeads();

export const getStoredRetellCalls = (): RetellCall[] => {
  return localCalls;
};

export const getStoredLeads = (): Lead[] => {
  return localLeads;
};

export const fetchLeads = async (): Promise<Lead[]> => {
  try {
    // Calling n8n webhook with action=get_leads
    const response = await fetch(`${API_CONFIG.GET_CALLS}?action=get_leads`);
    if (response.ok) {
      const data = await response.json();
      const fetched = Array.isArray(data) ? data : (data.leads || data.data || []);
      localLeads = fetched;
      saveStoredLeads(localLeads);
      return localLeads;
    }
  } catch (error) {
    console.warn('Failed to fetch leads from n8n webhook, using cache.');
  }
  return localLeads;
};

export const fetchRetellCalls = async (): Promise<RetellCall[]> => {
  try {
    // Calling n8n webhook with action=get_calls
    const response = await fetch(`${API_CONFIG.GET_CALLS}?action=get_calls`);
    if (response.ok) {
      const data = await response.json();
      const fetched = Array.isArray(data) ? data : (data.calls || data.data || []);
      
      // Ensure data has correct IDs and format
      const mapped = fetched.map((c: any) => ({
        ...c,
        call_id: c.call_id || c.call_session_id || `CALL-${Date.now()}-${Math.random()}`,
        start_timestamp: c.start_timestamp || Date.now()
      }));

      localCalls = mapped.sort((a: any, b: any) => b.start_timestamp - a.start_timestamp);
      saveStoredCalls(localCalls);
      return localCalls;
    }
  } catch (error) {
    console.warn('N8N call fetch failed, using cache.');
  }
  return localCalls;
};
