import { useMemo, useState } from "react";
import {
  // fetch data + cache
  useQuery,
  // create/update actions
  useMutation,
  // cache instance (invalidate/refetch)
  useQueryClient,
  // keeps last page’s data while new page loads
  keepPreviousData,
} from "@tanstack/react-query";
// non-blocking success/error messages
import { toast } from "react-hot-toast";

// Typed API functions for Bookings
import {
  getBookings,
  getBookingById,
  createBooking,
  type Booking,
} from "../../lib/api/bookings";
import BookingForm, { type BookingFormValues } from "./BookingForm";

// Encapsulate the query so the component stays readable.
// - queryKey includes page + q → separate cache entries per search/page
// - placeholderData keeps old page results visible during fetch for smooth UX
function useBookingsTable(page: number, q: string) {
  return useQuery({
    queryKey: ["bookings", { page, q }],
    // backend may ignore q (future-proof)
    queryFn: () => getBookings({ page, limit: 10, q }),
    // smoother pagination UX
    placeholderData: keepPreviousData,
  });
}

export default function BookingsPage() {
  // Local UI state for pagination, search, and modal/edit states
  const [page, setPage] = useState(1);
  const [q, setQ] = useState(""); // optional search keyword (future-proof)
  const [isCreateOpen, setCreateOpen] = useState(false);
  const [editing, setEditing] = useState<Booking | null>(null);

  // Access to React Query cache (for invalidation after mutations)
  const qc = useQueryClient();

  // Fetch table data (cached by page + q)
  const { data, isLoading, isError, error } = useBookingsTable(page, q);

  // Normalize + guard against undefined
  const items = data?.items ?? [];
  const total = data?.total ?? 0;
  const limit = data?.limit ?? 10;

  // Compute max page; memoize so it only recalculates when inputs change
  const maxPage = useMemo(
    () => (total ? Math.ceil(total / limit) : 1),
    [total, limit]
  );

  // CREATE booking
  // - On success: show toast, close modal, and invalidate cache
  const createMut = useMutation({
    // will implement createBooking() later
    mutationFn: (values: BookingFormValues) => createBooking(values),
    onSuccess: () => {
      toast.success("Booking created");
      setCreateOpen(false);
      // refetch list
      qc.invalidateQueries({ queryKey: ["bookings"] });
    },
    onError: (e: any) =>
      toast.error(e?.response?.data?.message ?? "Failed to create booking"),
  });

  return (
    <div className="p-4">
      {/* Header + “New” button */}
      <div className="flex items-center justify-between gap-3 pb-3">
        <h1 className="text-2xl font-semibold">Bookings</h1>
        <button
          // open Create modal
          onClick={() => setCreateOpen(true)}
          className="bg-black text-white rounded px-3 py-2"
        >
          New Booking
        </button>
      </div>

      {/* Search input (future-proof: backend may ignore q today) */}
      <div className="flex items-center gap-2 pb-3">
        <input
          className="border rounded px-3 py-2 w-full max-w-md"
          placeholder="Search by client id"
          value={q}
          onChange={(e) => {
            // update query
            setQ(e.target.value);
            // reset to first page on new search
            setPage(1);
          }}
        />
      </div>

      {/* Loading & Error states (friendly UX) */}
      {isLoading && <div>Loading...</div>}
      {isError && (
        <div className="text-red-600">
          {(error as any)?.message ?? "Failed to load clients"}
        </div>
      )}

      {/* Table (only when loaded without error) */}
      {!isLoading && !isError && (
        <div className="overflow-x-auto border rounded">
          <table className="min-w-full text-left">
            <thead>
              <tr className="bg-gray-50">
                <th className="p-3">Client id</th>
                <th className="p-3">Event Date</th>
                <th className="p-3">Event Type</th>
                <th className="p-3">Price</th>
                <th className="p-3 w-40">Actions</th>
              </tr>
            </thead>
            <tbody>
              {/* Empty-state row */}
              {items.length === 0 && (
                <tr>
                  <td className="p-3" colSpan={4}>
                    No clients found
                  </td>
                </tr>
              )}

              {/* Data rows */}
              {items.map((c) => (
                <tr key={c.id} className="border-t">
                  <td className="p-3">{c.client_id}</td>
                  <td className="p-3">{c.event_date}</td>
                  <td className="p-3">{c.event_type}</td>
                  <td className="p-3">{c.price}</td>
                  <td className="p-3">
                    <button
                      className="border rounded px-2 py-1"
                      // open Edit modal with current row
                      onClick={() => setEditing(c)}
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination controls */}
      <div className="flex items-center gap-2 pt-3">
        <button
          disabled={page <= 1}
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          className="border rounded px-3 py-2 disabled:opacity-50"
        >
          Prev
        </button>
        <span className="text-sm">
          Page {page} of {maxPage}
        </span>
        <button
          disabled={page >= maxPage}
          onClick={() => setPage((p) => Math.min(maxPage, p + 1))}
          className="border rounded px-3 py-2 disabled:opacity-50"
        >
          Next
        </button>
      </div>

      {/* Create Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 bg-black/30 grid place-items-center p-4">
          <div className="bg-white rounded-lg p-4 w-full max-w-md">
            <h2 className="text-lg font-semibold pb-2">New Booking</h2>
            <BookingForm
              onSubmit={(v) => createMut.mutate(v)} // call mutation
              onCancel={() => setCreateOpen(false)} // close modal
              submitLabel="Create"
            />
          </div>
        </div>
      )}
    </div>
  );
}
