// Purpose: Route definitions – ensure ClientsPage is wired

import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedLayout from "../layout/ProtectedLayout";
import ClientsPage from "../features/clients/ClientsPage";
// import LoginPage from "../features/auth/LoginPage";
import BookingsPage from "../features/bookings/BookingsPage";
import BookingDetailPage from "../features/bookings/BookingDetailPage";
import VideosPage from "../features/videos/VideosPage";
// import SocialPostsPage from "../features/socialposts/SocialPostsPage";

export default function AppRoutes() {
  return (
    <Routes>
      {/* <Route path="/login" element={<LoginPage />} /> */}
      <Route path="/dashboard" element={<ProtectedLayout />}>
        {/* If a user visits /dashboard with no child path, automatically redirect them to /dashboard/clients. */}
        <Route index element={<Navigate to="clients" replace />} />
        <Route path="clients" element={<ClientsPage />} />
        <Route path="bookings" element={<BookingsPage />} />
        {/* page that displays a specific booking given its id */}
        <Route path="bookings/:id" element={<BookingDetailPage />} />
        <Route path="videos" element={<VideosPage />} />
        {/* <Route path="social-posts" element={<SocialPostsPage />} /> */}
      </Route>
      {/* Catch-all route: if no path matches, redirect user back to /dashboard. */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
