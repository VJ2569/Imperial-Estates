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
      body: JSON.stringify(property)
    });
    return true;
  } catch (error) {
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
      body: JSON.stringify(property)
    });
    return true;
  } catch (error) {
    return true;
  }
};

export const deleteProperty = async (id: string): Promise<boolean> => {
  const url = `${API_CONFIG.DELETE_PROPERTY}?action=delete`;
  try {
    localProperties = localProperties.filter(p => p.id !== id);
    saveStoredProperties(localProperties);
    await fetchWithTimeout(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id })
    });
    return true;
  } catch (error) {
    return true;
  }
};
