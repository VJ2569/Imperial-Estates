
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

export interface VapiCall {
  id: string;
  createdAt: string;
  updatedAt: string;
  startedAt?: string;
  endedAt?: string;
  type: string;
  status: string;
  endedReason?: string;
  transcript?: string;
  recordingUrl?: string;
  summary?: string;
  analysis?: {
    summary?: string;
    successEvaluation?: string | boolean; // Vapi returns this as string "true"/"false" or boolean
  };
  customer?: {
    number?: string;
    name?: string;
  };
  cost?: number;
  duration?: number; 
  durationSeconds?: number; // Specific field often returned by Vapi
  assistantId?: string;
}
