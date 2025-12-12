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
// We no longer use demo data to prevent "default properties" from reappearing unexpectedly.
let localProperties: Property[] = loadStoredProperties() || [];

// --- API Helpers ---

// Increased timeout to 10000ms (10s) to allow n8n on Render time to wake up from cold start
const fetchWithTimeout = async (url: string, options: RequestInit = {}, timeout = 10000) => {
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
  // Always try to fetch fresh data from the API (Google Sheets/n8n) first.
  // This ensures the app stays in sync with the spreadsheet.
  try {
    const response = await fetchWithTimeout(API_CONFIG.GET_ALL);
    if (response.ok) {
      const data = await response.json();
      
      // Handle both { properties: [...] } and direct array [...] formats from n8n
      let fetchedProperties: Property[] | null = null;
      
      if (Array.isArray(data)) {
        fetchedProperties = data;
      } else if (data && data.properties && Array.isArray(data.properties)) {
        fetchedProperties = data.properties;
      }

      if (fetchedProperties) {
        // Server is the source of truth - update local cache
        localProperties = fetchedProperties;
        saveStoredProperties(localProperties);
        return localProperties;
      }
    }
  } catch (error) {
    console.warn('API unavailable or timed out, utilizing local storage cache.');
  }
  
  // Fallback to local data if API fails or returns invalid data
  return localProperties;
};

export const createProperty = async (property: Property): Promise<boolean> => {
  // 1. Update In-Memory State & Local Storage (Optimistic UI Update)
  localProperties = [...localProperties, property];
  saveStoredProperties(localProperties);

  // 2. Try API to sync with Google Sheets
  try {
    await fetchWithTimeout(API_CONFIG.ADD_PROPERTY, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(property)
    });
    return true;
  } catch (error) {
    console.warn('API unavailable, saved locally:', error);
    // Return true because we successfully saved it locally
    return true;
  }
};

export const updateProperty = async (property: Property): Promise<boolean> => {
  // 1. Update In-Memory State & Local Storage (Optimistic UI Update)
  localProperties = localProperties.map(p => p.id === property.id ? property : p);
  saveStoredProperties(localProperties);

  // 2. Try API to sync with Google Sheets
  try {
    await fetchWithTimeout(API_CONFIG.UPDATE_PROPERTY, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(property)
    });
    return true;
  } catch (error) {
    console.warn('Error updating property, updated locally:', error);
    return true;
  }
};

export const deleteProperty = async (id: string): Promise<boolean> => {
  // 1. Update In-Memory State & Local Storage (Optimistic UI Update)
  localProperties = localProperties.filter(p => p.id !== id);
  saveStoredProperties(localProperties);

  // 2. Try API to sync with Google Sheets
  try {
    await fetchWithTimeout(API_CONFIG.DELETE_PROPERTY, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id })
    });
    return true;
  } catch (error) {
    console.warn('Error deleting property, deleted locally:', error);
    return true;
  }
};
