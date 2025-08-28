//Purpose: Full clients feature – list, search, pagination, create & edit
import { useMemo, useState } from "react";
import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
} from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import {
  listClients,
  createClient,
  updateClient,
  type Client,
} from "../../lib/api/clients";
import ClientForm, { type ClientFormValues } from "./ClientForm";

function useClientsTable(page: number, q: string) {
  return useQuery({
    queryKey: ["clients", { page, q }],
    queryFn: () => listClients({ page, limit: 10, q }),
    placeholderData: keepPreviousData,
  });
}

export default function ClientsPage() {
  const [page, setPage] = useState(1);
  const [q, setQ] = useState("");
  const [isCreateOpen, setCreateOpen] = useState(false);
  const [editing, setEditing] = useState<Client | null>(null);
  const qc = useQueryClient();

  const { data, isLoading, isError, error } = useClientsTable(page, q);
  const items = data?.items ?? [];
  const total = data?.total ?? 0;
  const limit = data?.limit ?? 10;
  const maxPage = useMemo(
    () => (total ? Math.ceil(total / limit) : 1),
    [total, limit]
  );

  const createMut = useMutation({
    mutationFn: (values: ClientFormValues) => createClient(values),
    onSuccess: () => {
      toast.success("Client created");
      setCreateOpen(false);
      qc.invalidateQueries({ queryKey: ["clients"] });
    },
    onError: (e: any) =>
      toast.error(e?.response?.data?.message ?? "Failed to create client"),
  });

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
    <div className="p-4">
      <div className="flex items-center justify-between gap-3 pb-3">
        <h1 className="text-2xl font-semibold">Clients</h1>
        <button
          onClick={() => setCreateOpen(true)}
          className="bg-black text-white rounded px-3 py-2"
        >
          New Client
        </button>
      </div>
      <div className="flex items-center gap-2 pb-3">
        <input
          className="border rounded px-3 py-2 w-full max-w-md"
          placeholder="Search by name or email…"
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setPage(1);
          }}
        />
      </div>

      {isLoading && <div>Loading...</div>}
      {isError && (
        <div className="text-red-600">
          {(error as any)?.message ?? "Failed to load clients"}
        </div>
      )}

      {!isLoading && !isError && (
        <div className="overflow-x-auto border rounded">
          <table className="min-w-full text-left">
            <thead>
              <tr className="bg-gray-50">
                <th className="p-3">Name</th>
                <th className="p-3">Email</th>
                <th className="p-3">Phone</th>
                <th className="p-3 w-40">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 && (
                <tr>
                  <td className="p-3" colSpan={4}>
                    No clients found
                  </td>
                </tr>
              )}
              {items.map((c) => (
                <tr key={c.id} className="border-t">
                  <td className="p-3">{c.name}</td>
                  <td className="p-3">{c.email}</td>
                  <td className="p-3">{c.phone || "—"}</td>
                  <td className="p-3">
                    <button
                      className="border rounded px-2 py-1"
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

      {/* Pagination */}

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
            <h2 className="text-lg font-semibold pb-2">New Client</h2>
            <ClientForm
              onSubmit={(v) => createMut.mutate(v)}
              onCancel={() => setCreateOpen(false)}
              submitLabel="Create"
            />
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editing && (
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
      )}
    </div>
  );
}
