
export type PropertyType = 'apartment' | 'villa' | 'commercial';
export type PropertyStatus = 'available' | 'sold' | 'rented';

export interface Property {
  id: string;
  title: string;
  type: PropertyType;
  location: string;
  price: number;
  status: PropertyStatus;
  bedrooms: number;<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Imperial Estates - Property Database</title>
  <script type="importmap">
{
  "imports": {
    "react/": "https://esm.sh/react@^19.2.3/",
    "react": "https://esm.sh/react@^19.2.3",
    "lucide-react": "https://esm.sh/lucide-react@^0.560.0",
    "react-dom/": "https://esm.sh/react-dom@^19.2.3/",
    "@vitejs/plugin-react": "https://esm.sh/@vitejs/plugin-react@^5.1.2",
    "vite": "https://esm.sh/vite@^7.2.7",
    "date-fns": "https://esm.sh/date-fns@^4.1.0",
    "recharts": "https://esm.sh/recharts@^3.5.1",
    "@vapi-ai/web": "https://esm.sh/@vapi-ai/web@^2.5.2",
    "html2canvas": "https://esm.sh/html2canvas@^1.4.1",
    "jspdf": "https://esm.sh/jspdf@^2.5.1"
  }
}
</script>
</head>
  <body class="bg-gray-50 text-gray-900 font-sans antialiased">
    <div id="root"></div>
    <script type="module" src="/index.tsx"></script>
  </body>
</html>
  features: string;
  availableFrom: string;
  isRental: boolean;
  images?: string[];
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
  type: string;
  status: string;
  endedReason?: string;
  transcript?: string;
  recordingUrl?: string;
  summary?: string;
  analysis?: {
    summary?: string;
    successEvaluation?: string; // often 'true' or 'false' as string or boolean
  };
  customer?: {
    number?: string;
    name?: string;
  };
  cost?: number;
  duration?: number; // in seconds usually
  assistantId?: string;
}
