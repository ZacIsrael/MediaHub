// Simple layout.

// - Outlet: placeholder where child routes (like ClientsPage) get rendered.
import {
  Outlet,
  Navigate,
  useLocation,
  Link,
  useNavigate,
} from "react-router-dom";
// function for logging a user out
import { useLogout } from "../features/auth/useLogout";

// component for styling purposes
import TopNav from "../components/layout/TopNav";
import { useEffect, useState } from "react";
import { tryRestoreSession } from "../lib/api/auth";

export default function ProtectedLayout() {
  // State to track whether session validity is still being checked
  const [loading, setLoading] = useState(true);
  // State to track if the user currently has a valid access token in localStorage
  const [hasToken, setHasToken] = useState(!!localStorage.getItem("token"));

  // Access current route location (used for redirect if not authenticated)
  const location = useLocation();
  // logout function (clears token + refresh cookie, handles redirect)
  const { logout } = useLogout();

  // On mount or when hasToken changes, attempt to restore session if no token is found
  useEffect(() => {
    if (!hasToken) {
      // Try to hit /auth/refresh; success sets token, failure marks user as logged out
      tryRestoreSession()
        .then(() => setHasToken(true))
        .catch(() => setHasToken(false))
        // Always stop loading after attempt
        .finally(() => setLoading(false));
    } else {
      // If token already exists, no need to refresh, stop loading immediately
      setLoading(false);
    }
  }, [hasToken]);

  // display this message if session validity is still being checked
  if (loading) return <div className="text-white">Loading session...</div>;

  // redirect the user to the login page if they have an invalid session
  if (!hasToken) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return (
    <div className="layout-shell">
      <header style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <TopNav />
        {/* <nav className="nav" style={{ display: "flex", gap: 12 }}> */}
        {/* <Link to="/dashboard/clients">Clients</Link>
        <Link to="/dashboard/bookings">Bookings</Link>
        <Link to="/dashboard/videos">Videos</Link>
        <Link to="/dashboard/social-posts">Social Posts</Link> */}
        {/* button that prompts a user to logout */}
        <button
          // when this button is clicked, the logout function will be executed
          onClick={logout}
          style={{
            marginLeft: "auto",
            padding: "6px 12px",
            borderRadius: "8px",
            border: "1px solid rgba(255,255,255,0.15)",
            background: "transparent",
            color: "#e2e8f0",
          }}
        >
          Logout
        </button>
      </header>
      {/* </nav> */}
      <main className="container">
        <Outlet />
      </main>
    </div>
  );
}
