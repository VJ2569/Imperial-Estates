
import { ApiConfig } from './types';

// Webhook URLs
const PROPERTY_WEBHOOK = 'https://n8n-production-177a.up.railway.app/webhook/a10b094c-bcb8-493f-b74d-4eed90276286'; //Database_control
const CALLS_WEBHOOK = 'https://n8n-production-177a.up.railway.app/webhook/ec9d761c-68bd-4f01-b1e1-8886bc4f72df'; //form_to_dashboard

export const API_CONFIG: ApiConfig = {
  GET_ALL: PROPERTY_WEBHOOK,
  ADD_PROPERTY: PROPERTY_WEBHOOK,
  UPDATE_PROPERTY: PROPERTY_WEBHOOK,
  DELETE_PROPERTY: PROPERTY_WEBHOOK,
  GET_CALLS: CALLS_WEBHOOK
};

export const AGENT_CONFIG = {
  // Agent API configuration - Placeholder values for local override via Settings
  API_KEY: '', 
  AGENT_ID: ''
};
