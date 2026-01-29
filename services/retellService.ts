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
    const response = await fetch(`${API_CONFIG.GET_CALLS}?action=get_leads`);
    if (response.ok) {
      const data = await response.json();
      const fetched = Array.isArray(data) ? data : (data.leads || []);
      localLeads = fetched;
      saveStoredLeads(localLeads);
      return localLeads;
    }
  } catch (error) {
    console.warn('Failed to fetch leads from webhook, using cache.');
  }
  return localLeads;
};

export const fetchRetellCalls = async (): Promise<RetellCall[]> => {
  try {
    const response = await fetch(`${API_CONFIG.GET_CALLS}?action=get_calls`);
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

  // Fallback to Retell API directly if webhook fails
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
      localCalls = calls;
      saveStoredCalls(localCalls);
    }
  } catch (error) {
    console.error("Failed to fetch from Retell fallback:", error);
  }

  return localCalls;
};
