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
import { getApiErrorMessage } from "../../lib/api/getApiErrorMessage";

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
    onError: (e: any) => {
      // debugging
      console.log("e = ", e);
      // Used for reading custom error messages from backend API
      toast.error(getApiErrorMessage(e));
    },
  });

  return (
    <>
      {/* Header + “New” button */}
      <header className="page-header">
        <h1 className="page-title">Social Posts</h1>
        <div className="toolbar">
          <button
            onClick={() => {
              console.log("'Add New Post' button clicked.");
              setCreateOpen(true);
            }}
            className="bg-black text-white rounded px-3 py-2"
          >
            Add New Post
          </button>
        </div>
      </header>

      {/* Search (future-proof; backend may ignore q today) */}
      {/* Not needed for now; will come back to this once I implement search bar logic */}
      {/* <div className="flex items-center gap-2 pb-3">
        <input
          className="border rounded px-3 py-2 w-full max-w-md"
          placeholder="Search by caption or URL"
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setPage(1);
          }}
        />
      </div> */}

      {/* Loading & Error states */}
      {isLoading && (
        <div className="empty">
          <div className="title">Loading…</div>
          <div>Fetching social posts from the server.</div>
        </div>
      )}
      {isError && (
        <div className="empty">
          <div className="title">Couldn’t load videos</div>
          <div>{(error as any)?.message ?? "Failed to load social posts."}</div>
        </div>
      )}

      {/* Table */}
      {!isLoading && !isError && (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr className="bg-gray-50">
                <th>Platform</th>
                <th className="right">Caption</th>
                <th className="nowrap">Hashtags</th>
                <th className="nowrap">Actions</th>
              </tr>
            </thead>
            <tbody>
              {/* Empty state */}
              {items.length === 0 && (
                <tr>
                  <td colSpan={5}>
                    <div className="empty">
                      <div className="title">No social posts found</div>
                      <div>Try adjusting your search.</div>
                    </div>
                  </td>
                </tr>
              )}

              {/* Data rows */}
              {items.map((p) => (
                <tr key={p._id} className="border-t">
                  <td>{p.platform}</td>
                  <td className="truncate" title={p.caption}>
                    {p.caption}
                  </td>
                  <td>
                    {Array.isArray(p.hashtags) ? p.hashtags.join(", ") : ""}
                  </td>
                  <td className="actions nowrap">
                    {/* Open the post in a new tab */}
                    <a
                      className="underline"
                      href={p.url}
                      target="_blank"
                      rel="noreferrer"
                    >
                      View Post
                    </a>

                    {/* Quick copy link; just incase I don't want to necessarily open the post in a new tab */}
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
            <h2 className="text-lg font-semibold pb-2">New Social Post</h2>
            <SocialPostForm
              onSubmit={(v) => createMut.mutate(v)}
              onCancel={() => setCreateOpen(false)}
              submitLabel="Add"
            />
          </div>
        </div>
      )}
    </>
  );
}
