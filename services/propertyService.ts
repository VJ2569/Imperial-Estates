import { API_CONFIG } from '../constants';
import { Property, Configuration } from '../types';

const STORAGE_KEY = 'imperial_estates_db';

const normalizeProperty = (p: any): Property => {
  const configurations = p.configurations || [
    {
      id: `CONFIG-${p.id || Date.now()}`,
      name: 'Standard Unit',
      size: p.area || 0,
      totalUnits: 100,
      unitsSold: p.status === 'sold' ? 100 : 0,
      price: p.price || 0
    }
  ];

  const minPrice = configurations.length > 0 
    ? Math.min(...configurations.map((c: Configuration) => c.price))
    : (p.price || 0);

  return {
    ...p,
    id: p.id || `IMP-GEN-${Date.now().toString().slice(-3)}`,
    title: p.title || 'Untitled Project',
    type: p.type || 'apartment',
    city: p.city || 'Unknown',
    microLocation: p.microLocation || 'Unknown',
    totalProjectSize: p.totalProjectSize || `${p.area || 0} Sqft`,
    projectStatus: p.projectStatus || (p.status === 'available' ? 'ready' : 'under-construction'),
    developerName: p.developerName || 'Imperial Group',
    reraId: p.reraId || 'NOT-APPLICABLE',
    timeline: p.timeline || p.availableFrom || 'TBD',
    active: p.active !== undefined ? p.active : true,
    images: p.images || [],
    configurations: configurations,
    amenities: p.amenities || [],
    documents: p.documents || [],
    description: p.description || '',
    towerCount: p.towerCount || undefined,
    price: minPrice,
    location: p.location || `${p.microLocation || 'Unknown'}, ${p.city || 'Unknown'}`,
    area: p.area || 0,
    status: p.status || 'available',
    isRental: p.isRental || false
  };
};

const loadStoredProperties = (): Property[] | null => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;
    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed.map(normalizeProperty) : null;
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
  return localProperties.filter(p => p.active);
};

/**
 * Sends property updates to the webhook.
 * Restored: Includes full payload (images/docs) and standard JSON headers.
 */
const fireWebhook = async (url: string, data: any) => {
  try {
    await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });
  } catch (e) {
    console.warn('Webhook delivery failed:', e);
  }
};

export const fetchProperties = async (): Promise<Property[]> => {
  try {
    const response = await fetch(`${API_CONFIG.GET_ALL}?action=get_all`);
    if (response.ok) {
      const data = await response.json();
      const fetched = Array.isArray(data) ? data : (data.properties || []);
      localProperties = fetched.map(normalizeProperty);
      saveStoredProperties(localProperties);
      return localProperties.filter(p => p.active);
    }
  } catch (error) {
    console.warn('Sync failed, using local.');
  }
  return localProperties.filter(p => p.active);
};

export const createProperty = async (property: Property): Promise<boolean> => {
  const normalized = normalizeProperty(property);
  localProperties = [...localProperties, normalized];
  saveStoredProperties(localProperties);
  await fireWebhook(API_CONFIG.ADD_PROPERTY, { ...normalized, action: 'add' });
  return true;
};

export const updateProperty = async (property: Property): Promise<boolean> => {
  const normalized = normalizeProperty(property);
  localProperties = localProperties.map(p => p.id === normalized.id ? normalized : p);
  saveStoredProperties(localProperties);
  await fireWebhook(API_CONFIG.UPDATE_PROPERTY, { ...normalized, action: 'update' });
  return true;
};

export const deleteProperty = async (id: string): Promise<boolean> => {
  localProperties = localProperties.filter(p => p.id !== id);
  saveStoredProperties(localProperties);
  await fireWebhook(API_CONFIG.DELETE_PROPERTY, { id, action: 'delete' });
  return true;
};
