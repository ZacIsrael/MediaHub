// Simple layout.

// - Outlet: placeholder where child routes (like ClientsPage) get rendered.
import { Outlet } from "react-router-dom";

export default function ProtectedLayout() {
  return (
    <div className="app-shell">
      <nav className="top-nav">
        <a href="/dashboard/clients">Clients</a>
        <a href="/dashboard/bookings">Bookings</a>
        <a href="/dashboard/videos">Videos</a>
        <a href="/dashboard/social-posts">Social Posts</a>
      </nav>
      <div className="page">
        <Outlet />
      </div>
    </div>
  );
}
