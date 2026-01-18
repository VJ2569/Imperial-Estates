export type PropertyType = 'apartment' | 'villa' | 'commercial';
export type PropertyStatus = 'available' | 'sold' | 'rented';

export interface Property {
  id: string;
  title: string;
  type: PropertyType;
  location: string;
  price: number;
  status: PropertyStatus;
  bedrooms: number;
  bathrooms: number;
  area: number;
  description: string;
  features: string;
  availableFrom: string;
  isRental: boolean;
  images?: string[];
  pdfs?: string[];
}

export type PropertyFormData = Omit<Property, 'id'> & { id?: string };

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
