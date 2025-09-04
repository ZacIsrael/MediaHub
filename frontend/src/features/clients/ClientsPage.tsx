// Purpose: Full clients feature page — list, search, pagination, and create/edit modals.
// Tech used: React Query (queries/mutations/cache), react-hot-toast (UX), minimal Tailwind classes.

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

// Typed API functions for Client
import { getClients, createClient, updateClient } from "../../lib/api/clients";

import { type Client } from "../../lib/api/types";

// Reusable form (validates + gathers values)
import ClientForm, { type ClientFormValues } from "./ClientForm";

// Used for reading custom error messages from backend API
import { getApiErrorMessage } from "../../lib/api/getApiErrorMessage";


// Encapsulate the query so the component stays readable.
// - queryKey includes page + q → separate cache entries per search/page
// - placeholderData keeps old page results visible during fetch for smooth UX
function useClientsTable(page: number, q: string) {
  return useQuery({
    queryKey: ["clients", { page, q }],
    // backend may ignore q (future-proof)
    queryFn: () => getClients({ page, limit: 10, q }),
    // smoother pagination UX
    placeholderData: keepPreviousData,
  });
}

export default function ClientsPage() {
  // Local UI state for pagination, search, and modal/edit states
  const [page, setPage] = useState(1);
  const [q, setQ] = useState(""); // optional search keyword (future-proof)
  const [isCreateOpen, setCreateOpen] = useState(false);
  const [editing, setEditing] = useState<Client | null>(null);

  // Access to React Query cache (for invalidation after mutations)
  const qc = useQueryClient();

  // Fetch table data (cached by page + q)
  const { data, isLoading, isError, error } = useClientsTable(page, q);

  // Normalize + guard against undefined
  const items = data?.items ?? [];
  const total = data?.total ?? 0;
  const limit = data?.limit ?? 10;

  // Compute max page; memoize so it only recalculates when inputs change
  const maxPage = useMemo(
    () => (total ? Math.ceil(total / limit) : 1),
    [total, limit]
  );

  // CREATE mutation
  // - On success: show toast, close modal, and invalidate cache
  const createMut = useMutation({
    mutationFn: (values: ClientFormValues) => createClient(values),
    onSuccess: () => {
      toast.success("Client created");
      setCreateOpen(false);
      // refetch list
      qc.invalidateQueries({ queryKey: ["clients"] });
    },
    onError: (e: any) => {
      // debugging
      console.log("e = ", e);
      // Used for reading custom error messages from backend API
      toast.error(getApiErrorMessage(e));
    },
  });

  // UPDATE mutation
  // - On success: show toast, close editor, invalidate cache
  const updateMut = useMutation({
    mutationFn: ({ id, values }: { id: number; values: ClientFormValues }) =>
      updateClient(id, values),
    onSuccess: () => {
      toast.success("Client updated");
      setEditing(null);
      qc.invalidateQueries({ queryKey: ["clients"] });
    },
    onError: (e: any) =>
      toast.error(e?.response?.data?.message ?? "Failed to update client"),
  });

  return (
    <>
      {/* Header + “New” button */}
      <header className="page-header">
        <h1 className="page-title">Clients</h1>
        <div className="toolbar">
          <button
            // open Create modal
            onClick={() => {
              // debugging
              console.log("'New Client' button clicked.");
              setCreateOpen(true);
            }}
            className="btn btn-primary"
          >
            New Client
          </button>
        </div>
      </header>


      {/* Search input (future-proof: backend may ignore q today) */}
      {/* Will worry about this once I implement this logic on the backend */}
      {/* <div className="row" style={{ marginBottom: 12 }}>
        <input
          className="input"
          placeholder="Search by name or email…"
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
          {(error as any)?.message ?? "Failed to load clients"}
        </div>
      )}

      {/* Table (only when loaded without error) */}
      {!isLoading && !isError && (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr className="bg-gray-50">
                <th className="p-3">Name</th>
                <th className="p-3">Email</th>
                <th className="p-3">Phone</th>
                {/* <th className="p-3 w-40">Actions</th> */}
              </tr>
            </thead>
            <tbody>
              {/* Empty-state row */}
              {items.length === 0 && (
                <tr>
                  <td colSpan={5}>
                    <div className="empty">
                      <div className="title">No clients found</div>
                      <div>Try adjusting your search.</div>
                    </div>
                  </td>
                </tr>
              )}

              {/* Data rows */}
              {items.map((c) => (
                <tr key={c.id} className="border-t">
                  <td className="p-3">{c.name}</td>
                  <td className="p-3">{c.email}</td>
                  <td className="p-3">{c.phone || "—"}</td>
                  <td className="p-3">
                    {/* Will come back to this later once I implement PATCH/PUT backend requests for clients */}
                    {/* <button
                      className="border rounded px-2 py-1"
                      // open Edit modal with current row
                      onClick={() => setEditing(c)} 
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
            <h2 className="text-lg font-semibold pb-2">New Client</h2>
            <p className="text-sm text-gray-600 pb-4">Add a new Client.</p>
            <ClientForm
              // call mutation
              onSubmit={(v) => createMut.mutate(v)}
              // close modal
              onCancel={() => setCreateOpen(false)}
              submitLabel="Create"
            />
          </div>
        </div>
      )}

      {/* Will come back to this once I've implemented a PATCH/PUT route to the Clients backend api */}
      {/* Edit Modal */}
      {/* {editing && (
        <div className="fixed inset-0 bg-black/30 grid place-items-center p-4">
          <div className="bg-white rounded-lg p-4 w-full max-w-md">
            <h2 className="text-lg font-semibold pb-2">Edit Client</h2>
            <ClientForm
              defaultValues={{
                name: editing.name,
                email: editing.email,
                phone: editing.phone,
              }}
              onSubmit={(v) => updateMut.mutate({ id: editing.id, values: v })}
              onCancel={() => setEditing(null)}
              submitLabel="Update"
            />
          </div>
        </div>
      )} */}
    </>
  );
}
