// Simple layout.

// - Outlet: placeholder where child routes (like ClientsPage) get rendered.
import { Outlet, Navigate, useLocation, Link } from "react-router-dom";

export default function ProtectedLayout() {
  // read token retreived from login
  const token = localStorage.getItem("token");
  const location = useLocation();

  // if not logged in, send to /login and remember where the user came from
  if (!token) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return (
    <div className="layout-shell">
      <nav className="nav">
        <a href="/dashboard/clients">Clients</a>
        <a href="/dashboard/bookings">Bookings</a>
        <a href="/dashboard/videos">Videos</a>
        <a href="/dashboard/social-posts">Social Posts</a>
      </nav>
      <main className="container">
        <Outlet />
      </main>
    </div>
  );
}
