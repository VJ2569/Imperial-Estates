
export type ProjectType = 'apartment' | 'villa' | 'commercial';
export type ProjectStatus = 'pre-launch' | 'under-construction' | 'ready';

export interface Configuration {
  id: string;
  name: string;
  size: number; // Sqft
  totalUnits: number;
  unitsSold: number;
  price: number; // Base price for this specific config
}

export interface Property { // Renamed conceptually but kept name for compatibility
  id: string; // IMP-<CITYCODE>-<PROJECTCODE>
  title: string; // <Project Name> – <Micro-location>, <City>
  type: ProjectType;
  city: string;
  microLocation: string;
  totalProjectSize: string; // e.g., "5 Acres"
  projectStatus: ProjectStatus;
  developerName: string;
  reraId: string;
  timeline: string;
  active: boolean;
  images: string[];
  configurations: Configuration[];
  
  // Legacy/Additional fields for backward compatibility
  description: string;
  features: string;
  status: 'available' | 'sold' | 'rented'; // Kept for logic compatibility
  availableFrom: string;
  location: string; // Full derived location
  price: number; // Derived "Starts From" price
  bedrooms: number; // Derived from configurations
  bathrooms: number; // Derived from configurations
  area: number; // Derived total project size
}

export type PropertyFormData = Partial<Property>;

export interface ApiConfig {
  GET_ALL: string;
  ADD_PROPERTY: string;
  UPDATE_PROPERTY: string;
  DELETE_PROPERTY: string;
}

export interface Assistant {
  id: string;
  name: string;
}

export interface RetellCall {
  call_id: string;
  agent_id: string;
  call_status: string;
  start_timestamp: number;
  end_timestamp: number;
  duration_ms?: number;
  transcript?: string;
  recording_url?: string;
  public_log_url?: string;
  call_analysis?: {
    call_summary?: string;
    call_successful?: boolean;
    user_sentiment?: string;
  };
  customer_number?: string;
  metadata?: any;
}
