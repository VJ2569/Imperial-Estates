
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

export interface ProjectDocument {
  label: string;
  url: string;
  type: 'brochure' | 'floor_plan' | 'price_list';
}

export interface Property { 
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
  
  // New Fields
  towerCount?: number;
  amenities: string[];
  documents: ProjectDocument[];
  description: string;

  // Legacy/Additional fields for backward compatibility
  features: string;
  status: 'available' | 'sold' | 'rented';
  isRental?: boolean;
  availableFrom: string;
  location: string;
  price: number;
  bedrooms: number;
  bathrooms: number;
  area: number;
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
