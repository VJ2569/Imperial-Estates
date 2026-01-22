import { API_CONFIG } from '../constants';
import { Property, Configuration } from '../types';

const STORAGE_KEY = 'imperial_estates_db';

/**
 * Generates a truly unique, professional asset ID.
 * Format: IMP-XXXX-XXXX
 */
export const generateUniqueId = (): string => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Safe alphanumeric set
  const part1 = Array.from({ length: 4 }, () => chars.charAt(Math.floor(Math.random() * chars.length))).join('');
  const part2 = Array.from({ length: 4 }, () => chars.charAt(Math.floor(Math.random() * chars.length))).join('');
  return `IMP-${part1}-${part2}`;
};

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
    id: p.id || generateUniqueId(),
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

const fireWebhook = async (url: string, data: any) => {
  try {
    const payload = {
      ...data,
      webhook_id: `WEB-${Date.now()}`,
      webhook_source: 'imperial_dashboard_v2',
      timestamp: new Date().toISOString()
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Cache-Control': 'no-cache'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      console.error(`Sync Error: ${response.status} ${response.statusText}`);
    }
  } catch (e) {
    console.warn('Network sync offline - modifications saved locally.');
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
    console.warn('API unavailable, serving from local cache.');
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
  const target = localProperties.find(p => p.id === id);
  if (!target) return false;

  localProperties = localProperties.filter(p => p.id !== id);
  saveStoredProperties(localProperties);
  
  // Robust delete payload to ensure n8n can process it
  await fireWebhook(API_CONFIG.DELETE_PROPERTY, { 
    id, 
    action: 'delete',
    title: target.title,
    city: target.city,
    delete_verification: true
  });
  return true;
};
