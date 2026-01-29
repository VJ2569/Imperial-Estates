import { ApiConfig } from './types';

// Webhook URLs
const PROPERTY_WEBHOOK = 'https://n8n-nikki-j977.onrender.com/webhook/a10b094c-bcb8-493f-b74d-4eed90276286';
const CALLS_WEBHOOK = 'https://n8n-nikki-j977.onrender.com/webhook/ec9d761c-68bd-4f01-b1e1-8886bc4f72df';

export const API_CONFIG: ApiConfig = {
  GET_ALL: PROPERTY_WEBHOOK,
  ADD_PROPERTY: PROPERTY_WEBHOOK,
  UPDATE_PROPERTY: PROPERTY_WEBHOOK,
  DELETE_PROPERTY: PROPERTY_WEBHOOK,
  GET_CALLS: CALLS_WEBHOOK
};

export const AGENT_CONFIG = {
  // Agent API configuration
  API_KEY: 'YOUR_AGENT_API_KEY',
  AGENT_ID: 'YOUR_AGENT_ID'
};
