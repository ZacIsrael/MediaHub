import { useNavigate } from "react-router-dom";

import api from "../../lib/api/axios";

export function useLogout() {
  const navigate = useNavigate();

  async function logout() {
    try {
      // send POST request for logging a user out
      await api.post("/api/auth/logout");
    } catch {
      // ignore errors; still clearing locally
    } finally {
      // remove the jwt token from local storage
      localStorage.removeItem("token");
      // redirect the user to the login page
      navigate("/login", { replace: true });
    }
  }

  return { logout };
}
