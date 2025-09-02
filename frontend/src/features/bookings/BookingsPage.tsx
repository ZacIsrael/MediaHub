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
import { getBookings, createBooking } from "../../lib/api/bookings";

// structure of a Booking
import { type Booking } from "../../lib/api/types";
import BookingForm, { type BookingFormValues } from "./BookingForm";

import { Link } from "react-router-dom";

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
    onError: (e: any) => {
      // debugging
      console.log("e = ", e);
      // toast.error(e?.response?.data?.message ?? "Failed to create booking")
      const payload = e?.response?.data;
      const msg =
        (typeof payload === "string" && payload) ||
        payload?.message ||
        payload?.error ||
        e?.message ||
        "Failed to create booking";
      toast.error(msg);
    },
  });

  return (
    <>
      {/* Header + “New” button */}
      <header className="page-header">
        <h1 className="page-title">Bookings</h1>
        <div className="toolbar">
          <button
            // open Create modal
            onClick={() => {
              // debugging
              console.log("'New Booking' button clicked.");
              setCreateOpen(true);
            }}
            className="btn btn-primary"
          >
            New Booking
          </button>
        </div>
      </header>

      {/* Search input (future-proof: backend may ignore q today) */}
      {/* Will worry about this once I implement this logic on the backend */}
      {/* <div className="flex items-center gap-2 pb-3">
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
      </div> */}

      {/* Loading & Error states (friendly UX) */}
      {isLoading && (
        <div className="empty">
          <div className="title">Loading...</div>
        </div>
      )}

      {isError && (
        <div className="empty">
          <div className="title">Couldn’t load clients</div>
          {(error as any)?.message ?? "Failed to load bookings"}
        </div>
      )}

      {/* Table (only when loaded without error) */}
      {!isLoading && !isError && (
        <div className="table-wrap">
          <table className="table">
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
                  <td colSpan={5}>
                    <div className="empty">
                      <div className="title">No bookings found</div>
                      <div>Try adjusting your search.</div>
                    </div>
                  </td>
                </tr>
              )}

              {/* Data rows */}
              {items.map((b) => (
                <tr key={b.id} className="border-t">
                  <td className="p-3">{b.client_id}</td>
                  <td className="p-3">{b.event_date}</td>
                  <td className="p-3">{b.event_type}</td>
                  <td className="p-3">{b.price}</td>
                  <td className="p-3">
                    <Link
                      className="underline"
                      to={`/dashboard/bookings/${b.id}`}
                    >
                      View
                    </Link>
                  </td>
                  <td className="p-3">
                    {/* Will come back to this once I implement PUT/PATCH backend request for bookings */}
                    {/* <button
                      className="border rounded px-2 py-1"
                      // open Edit modal with current row
                      onClick={() => setEditing(b)}
                    >
                      Edit
                    </button> */}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      <div className="pagination">
        <button
          disabled={page <= 1}
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          className="btn btn-ghost"
        >
          Prev
        </button>
        <span className="badge" style={{ color: "white" }}>
          Page {page} of {maxPage}
        </span>
        <button
          disabled={page >= maxPage}
          onClick={() => setPage((p) => Math.min(maxPage, p + 1))}
          className="btn btn-ghost"
        >
          Next
        </button>
      </div>

      {/* Create Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-lg relative">
            <h2 className="text-lg font-semibold pb-2">New Booking</h2>
            <p className="text-sm text-gray-600 pb-4">Add a new Booking.</p>
            <BookingForm
              // call mutation
              onSubmit={(v) => createMut.mutate(v)}
              // close modal
              onCancel={() => setCreateOpen(false)}
              submitLabel="Create"
            />
          </div>
        </div>
      )}
    </>
  );
}
