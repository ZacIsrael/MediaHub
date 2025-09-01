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
    <>
      {/* Header + “New” button */}
      <header className="page-header">
        <h1 className="page-title">Videos</h1>
        <div className="toolbar">
          <button
            onClick={() => {
              console.log("'New Video' button clicked.");
              setCreateOpen(true);
            }}
            className="btn btn-primary"
          >
            New Video
          </button>
        </div>
      </header>

      {/* Search (future-proof; backend may ignore q today) */}
      {/* Will worry about this once I implement this logic on the backend */}
      {/* <div className="row" style={{ marginBottom: 12 }}>
        <input
          className="input"
          placeholder="Search by title or URL"
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
          <div>Fetching videos from the server.</div>
        </div>
      )}
      {isError && (
        <div className="empty">
          <div className="title">Couldn’t load videos</div>
          <div>{(error as any)?.message ?? "Failed to load videos."}</div>
        </div>
      )}

      {/* Table */}
      {!isLoading && !isError && (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Title</th>
                {/* <th className="p-3">URL</th> */}
                <th>Tags</th>
                <th className="right">Views</th>
                <th className="nowrap">Published</th>
                <th className="nowrap">Actions</th>
              </tr>
            </thead>
            <tbody>
              {/* Empty state */}
              {items.length === 0 && (
                <tr>
                  <td colSpan={5}>
                    <div className="empty">
                      <div className="title">No videos found</div>
                      <div>Try adjusting your search.</div>
                    </div>
                  </td>
                </tr>
              )}

              {/* Data rows */}
              {items.map((v) => (
                <tr key={v._id}>
                  <td className="truncate">{v.title}</td>
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
                  <td>{Array.isArray(v.tags) ? v.tags.join(", ") : ""}</td>
                  <td className="right">{v.viewCount}</td>
                  <td className="nowrap">
                    {v.publishedAt
                      ? new Date(v.publishedAt).toLocaleString()
                      : "—"}
                  </td>
                  <td className="actions nowrap">
                    <a
                      className="link"
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
      {/* {isCreateOpen && (
        <div className="modal-backdrop">
          <div className="modal">
            <h2>New Video</h2>
            <p className="subtitle">Add a new video to your catalog.</p>
            <VideoForm
              onSubmit={(v) => createMut.mutate(v)}
              onCancel={() => setCreateOpen(false)}
              submitLabel="Add"
            />
          </div>
        </div>
      )} */}

      {isCreateOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-lg relative">
            <h2 className="text-lg font-semibold pb-2">New Video</h2>
            <p className="text-sm text-gray-600 pb-4">
              Add a new video to your catalog.
            </p>
            <VideoForm
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
