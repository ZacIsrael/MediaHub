// this file serves as the composition root for app-wide contexts/providers; single place to set up "global wrappers"

import type { ReactNode } from "react";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";

// Create a new QueryClient instance.
// This controls React Query's caching behavior and request lifecycle.
const queryClient = new QueryClient();

export default function Providers({ children }: { children: ReactNode }) {
  return (
    // Make the queryClient available throughout the ap
    <QueryClientProvider client={queryClient}>
      {/* Enable client-side routing */}
      <BrowserRouter>
        <Toaster />
        {children}
      </BrowserRouter>
    </QueryClientProvider>
  );
}
