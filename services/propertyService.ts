
import { API_CONFIG } from '../constants';
import { Property } from '../types';

const STORAGE_KEY = 'imperial_estates_db';

const loadStoredProperties = (): Property[] | null => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch (error) {
    return null;
  }
};

const saveStoredProperties = (properties: Property[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(properties));
  } catch (error) {}
};

let localProperties: Property[] = loadStoredProperties() || [];

export const getStoredProperties = (): Property[] => {
  return localProperties;
};

const fetchWithTimeout = async (url: string, options: RequestInit = {}, timeout = 15000) => {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  try {
    const response = await fetch(url, { ...options, signal: controller.signal });
    clearTimeout(id);
    return response;
  } catch (error) {
    clearTimeout(id);
    throw error;
  }
};

export const fetchProperties = async (): Promise<Property[]> => {
  try {
    // action=get_all tells n8n to return the property list
    const url = `${API_CONFIG.GET_ALL}?action=get_all`;
    const response = await fetchWithTimeout(url);
    if (response.ok) {
      const data = await response.json();
      const fetched = Array.isArray(data) ? data : (data.properties || []);
      localProperties = fetched;
      saveStoredProperties(localProperties);
      return localProperties;
    }
  } catch (error) {
    console.warn('API fetch failed, using cache.');
  }
  return localProperties;
};

export const createProperty = async (property: Property): Promise<boolean> => {
  const url = `${API_CONFIG.ADD_PROPERTY}?action=add`;
  try {
    localProperties = [...localProperties, property];
    saveStoredProperties(localProperties);
    await fetchWithTimeout(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...property, action: 'add' })
    });
    return true;
  } catch (error) {
    console.error('Create property webhook failed:', error);
    return true; // Optimistic update
  }
};

export const updateProperty = async (property: Property): Promise<boolean> => {
  const url = `${API_CONFIG.UPDATE_PROPERTY}?action=update`;
  try {
    localProperties = localProperties.map(p => p.id === property.id ? property : p);
    saveStoredProperties(localProperties);
    await fetchWithTimeout(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...property, action: 'update' })
    });
    return true;
  } catch (error) {
    console.error('Update property webhook failed:', error);
    return true;
  }
};

export const deleteProperty = async (id: string): Promise<boolean> => {
  // Use a POST request for deletion as well, as n8n webhooks often prefer POST for all actions
  const url = `${API_CONFIG.DELETE_PROPERTY}?action=delete`;
  try {
    // Update local state first (Optimistic)
    localProperties = localProperties.filter(p => p.id !== id);
    saveStoredProperties(localProperties);

    // Send the deletion request
    const response = await fetchWithTimeout(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      // Include both the ID and the action in the body for better compatibility with n8n branched workflows
      body: JSON.stringify({ id, action: 'delete' })
    });

    if (!response.ok) {
      console.warn(`Delete webhook responded with status: ${response.status}`);
    }
    
    return true;
  } catch (error) {
    console.error('Delete property webhook failed:', error);
    return true; // Return true to keep the optimistic UI update
  }
};
