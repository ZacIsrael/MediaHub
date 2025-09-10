// This file contains the base URL for all api requests

// Import the axios library, a promise-based HTTP client
import axios from "axios";

// Build the base URL for all requests.
// "import.meta.env" is how Vite gives access to environment variables.
// VITE_API_URL comes from the `.env.local` file.
// `.replace(/\/$/, '')` removes a trailing slash, if present (so there are no double slashed when requests are made).
const BASE_URL = (import.meta.env.VITE_API_URL ?? "").replace(/\/$/, "");
// debugging
console.log("API baseURL =", BASE_URL);

// api variable serves as a constant.
// Instead of writing axios.get('https://....') in each feature (which is extremely
// redundant & can lead to erros), I'm just exporting this api as a BASE do in each feature,
// I can just call, api.get({endpoint}).
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:4000",
  // needed so the browser sends/receives the httpOnly refresh cookie on /api/auth/refresh
  withCredentials: true,
});

// login
api.interceptors.request.use((config) => {
  const t = localStorage.getItem("token");
  if (t) config.headers.Authorization = `Bearer ${t}`;
  return config;
});

// If a protected route is hit with an expired/missing token, try to refresh once.
// If refresh succeeds, store the new token and retry the original request.
// If it fails, clear auth and redirect to /login.
api.interceptors.response.use(
  // First callback: if the response is successful, it just gets returned unchanged
  (r) => r,
  // Second callback: an error occured during the request/response
  async (err) => {
    // Extract the HTTP status code from the error response
    const status = err?.response?.status;
    // Reference to the original request config (URL, headers, etc.)
    const orig = err?.config;
    if (status === 401 && !orig?.__retry) {
      try {
        // mark this request so it doesn't get retried in a loop
        orig.__retry = true;

        // use the refresh cookie automatically (withCredentials: true)
        const { data } = await api.get("/api/auth/refresh");
        const newToken = data?.accessToken ?? data?.token;
        // If a new access token was returned from the refresh endpoint
        if (newToken) {
          // Save the new token to localStorage for future requests
          localStorage.setItem("token", newToken);

          // Ensure the original request has headers initialized
          orig.headers = orig.headers || {};

          // Attach the new token to the original request’s Authorization header
          orig.headers.Authorization = `Bearer ${newToken}`;

          // Retry the original request with the refreshed token
          return api.request(orig);
        }
      } catch (error) {
        // If refresh failed, clear stored token and force re-login
        localStorage.removeItem("token");
        // redirect to login or bubble error up
        return Promise.reject(error);
      }

      // hard logout on refresh failure (keeps your original UX)
      if (window.location.pathname !== "/login") {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.replace("/login");
      }
    }
    return Promise.reject(err);
  }
);

// export this constant so that it can be used in each feature
export default api;
