// Import React Query to fetch data with caching
import { useQuery } from "@tanstack/react-query";
// API call that retreives all clients
import { getClients } from "../../lib/api/clients";
// structure of a Client
import type { Client } from "../../lib/api/types";

// Expose a hook that returns clients for dropdowns
export function useClientOptions() {
  // Ask React Query to fetch and cache the clients list
  return useQuery<Client[]>({
    // Unique cache key so other components can reuse it
    queryKey: ["client-options"],
    
    queryFn: async () => {
      // retreives all of the clients 
      const res = await getClients();
      // Return ONLY the items field which is array (Client[])
      // listClients() return structure: { items: [], page: 1, limit: 10, total: 0 };
      return res.items;
    },
    // Keep data fresh for one minute before refetching
    staleTime: 60_000,
  });
}
