
export type ProjectType = 'apartment' | 'villa' | 'commercial';
export type ProjectStatus = 'pre-launch' | 'under-construction' | 'ready';

export interface Configuration {
  id: string;
  name: string;
  size: number; // Sqft
  totalUnits: number;
  unitsSold: number;
  price: number; // Base price
  description?: string; // Short description for each typology
}

export interface ProjectDocument {
  label: string;
  url: string;
  type: 'brochure' | 'floor_plan' | 'price_list';
}

export interface Property { 
  id: string; 
  title: string; 
  type: ProjectType;
  city: string;
  microLocation: string;
  totalProjectSize: string; 
  projectStatus: ProjectStatus;
  developerName: string;
  reraId: string;
  timeline: string;
  active: boolean;
  images: string[]; 
  configurations: Configuration[];
  
  towerCount?: number;
  amenities: string[];
  documents: ProjectDocument[];
  description: string;
  areaAndConnectivity?: string;
  isRental?: boolean;

  // Legacy fields
  features: string;
  status: 'available' | 'sold' | 'rented';
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
  GET_CALLS: string;
}

export interface Assistant {
  id: string;
  name: string;
}

export interface Lead {
  id: string;
  name: string;
  phone: string;
  email: string;
  project_interested?: string;
  budget?: string;
  timeline?: string;
  message?: string;
  timestamp: string;
  status: 'new' | 'contacted' | 'closed';
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
  call_analysis?: {
    call_summary?: string;
    call_successful?: boolean;
    user_sentiment?: string;
  };
  customer_number?: string;
  metadata?: any;
}
