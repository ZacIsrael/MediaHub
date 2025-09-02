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

export default function ProtectedLayout() {
  // read token retreived from login
  const token = localStorage.getItem("token");
  const location = useLocation();

  const navigate = useNavigate();
  const { logout } = useLogout();

  // if not logged in, send to /login and remember where the user came from
  if (!token) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return (
    <div className="layout-shell">
      <nav className="nav" style={{ display: "flex", gap: 12 }}>
        <Link to="/dashboard/clients">Clients</Link>
        <Link to="/dashboard/bookings">Bookings</Link>
        <Link to="/dashboard/videos">Videos</Link>
        <Link to="/dashboard/social-posts">Social Posts</Link>
        {/* button that prompts a user to logout */}
        <button
          // when this button is clicked, the logout function will be executed
          onClick={logout}
          className="rounded-md px-3 py-1 border border-gray-300 hover:bg-gray-100"
          style={{ marginLeft: "auto" }}
        >
          Logout
        </button>
      </nav>
      <main className="container">
        <Outlet />
      </main>
    </div>
  );
}
