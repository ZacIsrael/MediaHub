// Simple layout.

// - Link: creates navigation links without reloading the page.
// - Outlet: placeholder where child routes (like ClientsPage) get rendered.
import { Link, Outlet } from "react-router-dom";

export default function ProtectedLayout() {
  return (
    /* <div>: The parent container: 
          - min-h-screen → make it fill full height
          - grid → create a two-column grid
          - grid-cols-[220px_1fr] → sidebar is fixed 220px, content takes the rest */
    <div className="min-h-screen grid grid-cols-[220px_1fr]">
      {/* Left sidebar container:
            - border-r → adds a right border
            - p-4 → padding
            - space-y-2 → vertical spacing between children */}
      <aside className="border-r p-4 space-y-2">
        <div className="font-bold">MediaHub</div>
        {/* Navigation menu (vertical stack of links).
              - grid + gap-1 → stack links with small spacing
              - text-sm → smaller font */}
        <nav className="grid gap-1 text-sm">
          <Link to="/dashboard/clients" className="hover:underline">
            Clients
          </Link>
          <Link to="/dashboard/bookings" className="hover:underline">
            Bookings
          </Link>
          <Link to="/dashboard/videos" className="hover:underline">
            Videos
          </Link>
          <Link to="/dashboard/social-posts" className="hover:underline">
            Social Posts
          </Link>
          {/* These Links update the URL without reloading the page.
              Example: clicking "Clients" navigates to /dashboard/clients
              and React Router will render ClientsPage inside <Outlet /> */}
        </nav>
      </aside>
      <main>
        <Outlet />
      </main>
    </div>
  );
}
