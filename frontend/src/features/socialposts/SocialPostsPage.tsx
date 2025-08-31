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

// Typed API functions for Social Posts
import { getSocialPosts, addSocialPost } from "../../lib/api/socialposts";

// structure of a Social Post
import { type SocialPost } from "../../lib/api/types";
import SocialPostForm, { type SocialPostFormValues } from "./SocialPostForm";

import { Link } from "react-router-dom";

// Encapsulate the query so the component stays readable.
// - queryKey includes page + q → separate cache entries per search/page
// - placeholderData keeps old page results visible during fetch for smooth UX
function useSocialPostsTable(page: number, q: string) {
  return useQuery({
    queryKey: ["socialposts", { page, q }],
    // backend may ignore q (future-proof)
    queryFn: () => getSocialPosts({ page, limit: 10, q }),
    // smoother pagination UX
    placeholderData: keepPreviousData,
  });
}

export default function SocialPostsPage() {
  // Local UI state for pagination, search, and modal/edit states
  const [page, setPage] = useState(1);
  // optional search keyword (future-proof)
  const [q, setQ] = useState("");
  const [isCreateOpen, setCreateOpen] = useState(false);
  const [editing, setEditing] = useState<SocialPost | null>(null);

  // Access to React Query cache (for invalidation after mutations)
  const qc = useQueryClient();

  // Fetch table data (cached by page + q)
  const { data, isLoading, isError, error } = useSocialPostsTable(page, q);

  // Normalize + guard against undefined
  const items = data?.items ?? [];
  const total = data?.total ?? 0;
  const limit = data?.limit ?? 10;

  // Compute max page; memoize so it only recalculates when inputs change
  const maxPage = useMemo(
    () => (total ? Math.ceil(total / limit) : 1),
    [total, limit]
  );

  // Add social post
  // - On success: show toast, close modal, and invalidate cache
  const createMut = useMutation({
    mutationFn: (values: SocialPostFormValues) => addSocialPost(values),
    onSuccess: () => {
      toast.success("Social Post added");
      setCreateOpen(false);
      // refetch list
      qc.invalidateQueries({ queryKey: ["socialposts"] });
    },
    onError: (e: any) =>
      toast.error(e?.response?.data?.message ?? "Failed to add social post"),
  });

  return (
    <div className="p-4">
      {/* Header + “New” button */}
      <div className="flex items-center justify-between gap-3 pb-3">
        <h1 className="text-2xl font-semibold">Social Posts</h1>
        <button
          onClick={() => setCreateOpen(true)}
          className="bg-black text-white rounded px-3 py-2"
        >
          New Post
        </button>
      </div>

      {/* Search (future-proof; backend may ignore q today) */}
      <div className="flex items-center gap-2 pb-3">
        <input
          className="border rounded px-3 py-2 w-full max-w-md"
          placeholder="Search by caption or URL"
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setPage(1);
          }}
        />
      </div>

      {/* Loading & Error states */}
      {isLoading && <div>Loading...</div>}
      {isError && (
        <div className="text-red-600">
          {(error as any)?.message ?? "Failed to load social posts"}
        </div>
      )}

      {/* Table */}
      {!isLoading && !isError && (
        <div className="overflow-x-auto border rounded">
          <table className="min-w-full text-left">
            <thead>
              <tr className="bg-gray-50">
                <th className="p-3">Platform</th>
                <th className="p-3">Caption</th>
                <th className="p-3">Hashtags</th>
                <th className="p-3 w-40">Actions</th>
              </tr>
            </thead>
            <tbody>
              {/* Empty state */}
              {items.length === 0 && (
                <tr>
                  <td className="p-3" colSpan={4}>
                    No social posts found
                  </td>
                </tr>
              )}

              {/* Data rows */}
              {items.map((p) => (
                <tr key={p._id} className="border-t">
                  <td className="p-3">{p.platform}</td>
                  <td className="p-3 truncate max-w-[420px]" title={p.caption}>
                    {p.caption}
                  </td>
                  <td className="p-3">
                    {Array.isArray(p.hashtags) ? p.hashtags.join(", ") : ""}
                  </td>
                  <td className="p-3 flex gap-3">
                    {/* Open the post in a new tab */}
                    <a
                      className="underline"
                      href={p.url}
                      target="_blank"
                      rel="noreferrer"
                    >
                      View Post
                    </a>

                    {/* Optional: quick copy link */}
                    <button
                      type="button"
                      className="border rounded px-2 py-1"
                      onClick={() => navigator.clipboard.writeText(p.url)}
                      title="Copy link"
                    >
                      Copy
                    </button>

                    {/* Edit can be added later once PATCH/PUT backend requests is implemented */}
                    {/* <button
                      className="border rounded px-2 py-1"
                      onClick={() => setEditing(p)}
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
            <h2 className="text-lg font-semibold pb-2">New Social Post</h2>
            <SocialPostForm
              onSubmit={(v) => createMut.mutate(v)}
              onCancel={() => setCreateOpen(false)}
              submitLabel="Add"
            />
          </div>
        </div>
      )}
    </div>
  );
}
