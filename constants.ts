import { ApiConfig } from './types';

// Consolidated single webhook URL for n8n
const BASE_WEBHOOK_URL = 'https://n8n-nikki-j977.onrender.com/webhook/a10b094c-bcb8-493f-b74d-4eed90276286';

export const API_CONFIG: ApiConfig = {
  GET_ALL: BASE_WEBHOOK_URL,
  ADD_PROPERTY: BASE_WEBHOOK_URL,
  UPDATE_PROPERTY: BASE_WEBHOOK_URL,
  DELETE_PROPERTY: BASE_WEBHOOK_URL
};

export const AGENT_CONFIG = {
  // Agent API configuration
  API_KEY: 'YOUR_AGENT_API_KEY',
  AGENT_ID: 'YOUR_AGENT_ID'
};
