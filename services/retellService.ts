import { AGENT_CONFIG, API_CONFIG } from '../constants';
import { RetellCall, Lead } from '../types';

const STORAGE_KEY = 'imperial_agent_calls';
const LEADS_STORAGE_KEY = 'imperial_agent_leads';

const loadStored = <T>(key: string): T[] => {
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    return [];
  }
};

const saveStored = (key: string, data: any) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {}
};

export const getStoredRetellCalls = (): RetellCall[] => loadStored<RetellCall>(STORAGE_KEY);
export const getStoredLeads = (): Lead[] => loadStored<Lead>(LEADS_STORAGE_KEY);

export const fetchLeads = async (): Promise<Lead[]> => {
  try {
    const response = await fetch(`${API_CONFIG.GET_CALLS}?action=get_leads`);
    if (response.ok) {
      const data = await response.json();
      const rawLeads = Array.isArray(data) ? data : (data.leads || data.data || []);
      
      // Sanitize leads to prevent UI crashes
      const sanitized: Lead[] = rawLeads.map((l: any) => ({
        id: l.id || `LEAD-${Math.random()}`,
        name: l.name || 'Anonymous Lead',
        phone: l.phone || l.customer_number || '---',
        email: l.email || '---',
        project_interested: l.project_interested || 'General',
        budget: l.budget || 'TBD',
        timeline: l.timeline || 'Immediate',
        message: l.message || '',
        timestamp: l.timestamp || new Date().toISOString(),
        status: l.status || 'new'
      }));

      saveStored(LEADS_STORAGE_KEY, sanitized);
      return sanitized;
    }
  } catch (error) {
    console.warn('Lead fetch failed, using cache.');
  }
  return getStoredLeads();
};

export const fetchRetellCalls = async (): Promise<RetellCall[]> => {
  try {
    const response = await fetch(`${API_CONFIG.GET_CALLS}?action=get_calls`);
    if (response.ok) {
      const data = await response.json();
      const rawCalls = Array.isArray(data) ? data : (data.calls || data.data || []);
      
      const sanitized: RetellCall[] = rawCalls.map((c: any) => ({
        ...c,
        call_id: c.call_id || c.call_session_id || `CALL-${Math.random()}`,
        start_timestamp: c.start_timestamp || Date.now(),
        customer_number: c.customer_number || 'Inbound'
      }));

      const sorted = sanitized.sort((a, b) => b.start_timestamp - a.start_timestamp);
      saveStored(STORAGE_KEY, sorted);
      return sorted;
    }
  } catch (error) {
    console.warn('Call fetch failed, using cache.');
  }
  return getStoredRetellCalls();
};
