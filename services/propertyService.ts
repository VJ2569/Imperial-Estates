import { API_CONFIG } from '../constants';
import { Property } from '../types';

const STORAGE_KEY = 'imperial_estates_db';

// --- Local Storage Helpers ---

const loadStoredProperties = (): Property[] | null => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch (error) {
    console.warn('Failed to load from local storage:', error);
    return null;
  }
};

const saveStoredProperties = (properties: Property[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(properties));
  } catch (error) {
    console.warn('Failed to save to local storage:', error);
  }
};

// --- Initialization ---

// Initialize local state: Try LocalStorage first, then fall back to empty array.
let localProperties: Property[] = loadStoredProperties() || [];

// --- API Helpers ---

// Increased timeout to 30000ms (30s) to allow n8n on Render time to wake up from cold start
const fetchWithTimeout = async (url: string, options: RequestInit = {}, timeout = 30000) => {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(id);
    return response;
  } catch (error) {
    clearTimeout(id);
    throw error;
  }
};

// --- Service Methods ---

export const fetchProperties = async (): Promise<Property[]> => {
  try {
    const response = await fetchWithTimeout(API_CONFIG.GET_ALL);
    if (response.ok) {
      const data = await response.json();
      
      let fetchedProperties: Property[] | null = null;
      
      if (Array.isArray(data)) {
        fetchedProperties = data;
      } else if (data && data.properties && Array.isArray(data.properties)) {
        fetchedProperties = data.properties;
      }

      if (fetchedProperties) {
        localProperties = fetchedProperties;
        saveStoredProperties(localProperties);
        return localProperties;
      }
    }
  } catch (error) {
    console.warn('API unavailable or timed out, utilizing local storage cache.');
  }
  
  return localProperties;
};

export const createProperty = async (property: Property): Promise<boolean> => {
  localProperties = [...localProperties, property];
  saveStoredProperties(localProperties);

  try {
    // Attempt standard JSON POST first
    await fetchWithTimeout(API_CONFIG.ADD_PROPERTY, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(property)
    });
    return true;
  } catch (error) {
    console.warn('API unavailable, saved locally:', error);
    
    // Retry with no-cors simple request if the first failed (likely CORS)
    try {
        await fetch(API_CONFIG.ADD_PROPERTY, {
            method: 'POST',
            mode: 'no-cors',
            headers: { 'Content-Type': 'text/plain' },
            body: JSON.stringify(property),
            keepalive: true
        });
    } catch (e) { console.error('Backup sync failed', e); }
    
    return true;
  }
};

export const updateProperty = async (property: Property): Promise<boolean> => {
  localProperties = localProperties.map(p => p.id === property.id ? property : p);
  saveStoredProperties(localProperties);

  try {
    await fetchWithTimeout(API_CONFIG.UPDATE_PROPERTY, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(property)
    });
    return true;
  } catch (error) {
    console.warn('Error updating property, updated locally:', error);
    
    try {
        await fetch(API_CONFIG.UPDATE_PROPERTY, {
            method: 'POST',
            mode: 'no-cors',
            headers: { 'Content-Type': 'text/plain' },
            body: JSON.stringify(property),
            keepalive: true
        });
    } catch (e) { console.error('Backup sync failed', e); }

    return true;
  }
};

export const deleteProperty = async (id: string): Promise<boolean> => {
  localProperties = localProperties.filter(p => p.id !== id);
  saveStoredProperties(localProperties);

  // Strategy for Delete:
  // 1. Try standard JSON POST (best for properly configured servers)
  // 2. Fallback to 'no-cors' simple POST (bypasses Preflight OPTIONS check)
  //    This is crucial for n8n on Render which often blocks OPTIONS requests from browsers.
  
  const payload = JSON.stringify({ id });

  try {
    console.log(`Sending delete request for ID: ${id}`);
    
    // First attempt: Standard
    const response = await fetchWithTimeout(API_CONFIG.DELETE_PROPERTY, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: payload
    }, 5000); // Short timeout for first attempt

    if (!response.ok) throw new Error('Standard fetch failed');
    
    return true;
  } catch (error) {
    console.warn('Standard delete failed, attempting fallback (no-cors)...', error);
    
    try {
        // Fallback: Simple Request (No Preflight)
        // Note: Response will be opaque (status 0), so we can't check .ok
        await fetch(API_CONFIG.DELETE_PROPERTY, {
            method: 'POST',
            mode: 'no-cors', 
            headers: { 
                'Content-Type': 'text/plain' 
            },
            body: payload,
            keepalive: true 
        });
        console.log('Fallback delete request sent');
        return true;
    } catch (e) {
        console.error('All delete attempts failed', e);
        return true; // Still return true as local delete succeeded
    }
  }
};
