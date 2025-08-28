// This file contains the base URL for all api requests

// Import the axios library, a promise-based HTTP client
import axios from "axios";

// Build the base URL for all requests.
// "import.meta.env" is how Vite gives access to environment variables.
// VITE_API_URL comes from the `.env.local` file.
// `.replace(/\/$/, '')` removes a trailing slash, if present (so there are no double slashed when requests are made).
const BASE_URL = (import.meta.env.VITE_API_URL ?? '').replace(/\/$/, '');
// debugging
console.log('API baseURL =', BASE_URL); 

// api variable serves as a constant.
// Instead of writing axios.get('https://....') in each feature (which is extremely
// redundant & can lead to erros), I'm just exporting this api as a BASE do in each feature,
// I can just call, api.get({endpoint}).
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:4000",
});

// export this constant so that it can be used in each feature
export default api;