import api from "./axios";

// Send login request with email, password, and provider info
// On success, store the access token in localStorage
export async function login(email: string, password: string, provider: string) {
  const res = await api.post("/api/auth/login", {
    email,
    password,
    // This route expects a provider field.
    // For now, it'll always be local but in the future,
    // OAuth will be implemented, so this value will depend
    // on if the user logs in locally or uses OAuth.
    // provider: "local",
    provider,
  });

  // Save short-lived access token to localStorage (refresh token is in httpOnly cookie)
  localStorage.setItem("token", res.data.token);

  // return full response for navigation or extra data if needed
  return res.data;
}

// Clear stored access token when logging out
// Also notify backend so it can clear refresh token cookie
export async function logout() {
  localStorage.removeItem("token");
  await api.post("/api/auth/logout");
}

// Try to restore session using refresh token cookie
// If valid, save new access token and return it; if not, return null
export async function tryRestoreSession() {
  try {
    const res = await api.get("/api/auth/refresh");
    const newToken = res.data.accessToken;

    // Store fresh access token for subsequent requests
    localStorage.setItem("token", newToken);

    return newToken;
  } catch {
    // Refresh failed; user must log in again
    localStorage.removeItem("token");
    return null;
  }
}
