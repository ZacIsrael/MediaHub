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

// Typed API functions for Videos
import { getVideos, addVideo } from "../../lib/api/videos";

// structure of a Video
import { type Video } from "../../lib/api/types";
import VideoForm, { type VideoFormValues } from "./VideoForm";

import { Link } from "react-router-dom";

// Encapsulate the query so the component stays readable.
// - queryKey includes page + q → separate cache entries per search/page
// - placeholderData keeps old page results visible during fetch for smooth UX
function useVideosTable(page: number, q: string) {
  return useQuery({
    queryKey: ["videos", { page, q }],
    // backend may ignore q (future-proof)
    queryFn: () => getVideos({ page, limit: 10, q }),
    // smoother pagination UX
    placeholderData: keepPreviousData,
  });
}

export default function VideosPage() {
  // Local UI state for pagination, search, and modal/edit states
  const [page, setPage] = useState(1);
  const [q, setQ] = useState(""); // optional search keyword (future-proof)
  const [isCreateOpen, setCreateOpen] = useState(false);
  const [editing, setEditing] = useState<Video | null>(null);

  // Access to React Query cache (for invalidation after mutations)
  const qc = useQueryClient();

  // Fetch table data (cached by page + q)
  const { data, isLoading, isError, error } = useVideosTable(page, q);

  // Normalize + guard against undefined
  const items = data?.items ?? [];
  const total = data?.total ?? 0;
  const limit = data?.limit ?? 10;

  // Compute max page; memoize so it only recalculates when inputs change
  const maxPage = useMemo(
    () => (total ? Math.ceil(total / limit) : 1),
    [total, limit]
  );

  // Add video
  // - On success: show toast, close modal, and invalidate cache
  const createMut = useMutation({
    mutationFn: (values: VideoFormValues) => addVideo(values),
    onSuccess: () => {
      toast.success("Video added");
      setCreateOpen(false);
      // refetch list
      qc.invalidateQueries({ queryKey: ["videos"] });
    },
    onError: (e: any) =>
      toast.error(e?.response?.data?.message ?? "Failed to add video"),
  });

  return (
    <div className="p-4">
      {/* Header + “New” button */}
      <div className="flex items-center justify-between gap-3 pb-3">
        <h1 className="text-2xl font-semibold">Videos</h1>
        <button
          onClick={() => setCreateOpen(true)}
          className="bg-black text-white rounded px-3 py-2"
        >
          New Video
        </button>
      </div>

      {/* Search (future-proof; backend may ignore q today) */}
      <div className="flex items-center gap-2 pb-3">
        <input
          className="border rounded px-3 py-2 w-full max-w-md"
          placeholder="Search by title or URL"
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
          {(error as any)?.message ?? "Failed to load videos"}
        </div>
      )}

      {/* Table */}
      {!isLoading && !isError && (
        <div className="overflow-x-auto border rounded">
          <table className="min-w-full text-left">
            <thead>
              <tr className="bg-gray-50">
                <th className="p-3">Title</th>
                {/* <th className="p-3">URL</th> */}
                <th className="p-3">Tags</th>
                <th className="p-3">Views</th>
                <th className="p-3">Published</th>
                <th className="p-3 w-40">Actions</th>
              </tr>
            </thead>
            <tbody>
              {/* Empty state */}
              {items.length === 0 && (
                <tr>
                  <td className="p-3" colSpan={6}>
                    No videos found
                  </td>
                </tr>
              )}

              {/* Data rows */}
              {items.map((v) => (
                <tr key={v._id} className="border-t">
                  <td className="p-3">{v.title}</td>
                  {/* Redundant; "View Video" button opens the video in a new tab for the user;
                  There's no need for the user to see the full url on this page. */}
                  {/* <td className="p-3 truncate max-w-[280px]">
                    <a
                      className="underline"
                      href={v.url}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {v.url}
                    </a>
                  </td> */}
                  <td className="p-3">
                    {Array.isArray(v.tags) ? v.tags.join(", ") : ""}
                  </td>
                  <td className="p-3">{v.viewCount}</td>
                  <td className="p-3">
                    {v.publishedAt
                      ? new Date(v.publishedAt).toLocaleString()
                      : "—"}
                  </td>
                  <td className="p-3 flex gap-3">
                    <a
                      className="underline"
                      href={v.url}
                      target="_blank"
                      rel="noreferrer"
                    >
                      View Video
                    </a>

                    {/* Will get back to this whenever I implement the PATCH method (backend) */}
                    {/* <button
                      className="border rounded px-2 py-1"
                      onClick={() => setEditing(v)}
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
            <h2 className="text-lg font-semibold pb-2">New Video</h2>
            <VideoForm
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
