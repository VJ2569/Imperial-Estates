import { ApiConfig } from './types';

export const API_CONFIG: ApiConfig = {
  GET_ALL: 'https://n8n-nikki-j977.onrender.com/webhook/a4fe9fac-7c6d-4ca1-8de0-83c240fa7ec5',
  ADD_PROPERTY: 'https://n8n-nikki-j977.onrender.com/webhook/411ba450-22c1-46e9-8eca-272d1b101d26',
  UPDATE_PROPERTY: 'https://n8n-nikki-j977.onrender.com/webhook/5a94a757-311c-4b99-82c6-6f72b5c1f898',
  DELETE_PROPERTY: 'https://n8n-nikki-j977.onrender.com/webhook/a10b094c-bcb8-493f-b74d-4eed90276286'
};

export const VAPI_CONFIG = {
  // Used for the Voice Button (Browser SDK)
  PUBLIC_KEY: 'YOUR_VAPI_PUBLIC_KEY', 
  ASSISTANT_ID: 'YOUR_VAPI_ASSISTANT_ID',
  
  // Used to fetch call history/analytics
  // TODO: Get this from Vapi Dashboard -> Settings -> API Keys
  PRIVATE_KEY: 'YOUR_VAPI_PRIVATE_KEY_HERE' 
};