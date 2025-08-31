// This file contains the API functions for the videos (CRUD); interacts with the backend

// Import the axios library, a promise-based HTTP client
import api from "./axios";

// define the structure of a Video document
import { type Video, type AddVideoInput } from "./types";

// structure for basic pagination
export type Paginated<T> = {
  items: T[];
  page: number;
  limit: number;
  total: number;
};

export type ListVideosQuery = { page?: number; limit?: number; q?: string };

export async function getVideos(
  params: ListVideosQuery = {}
): Promise<Paginated<Video>> {
  // data retreived from GET request sent to the backend API
  const { data } = await api.get("/api/videos", { params });

  // Response structure: { message: string, videos: Video[] }
  if (Array.isArray(data.videos)) {
    const items = data.videos;
    return {
      items,
      page: params.page ?? 1,
      limit: params.limit ?? items.length,
      total: items.length,
    };
  }

  // fallback in case shape changes
  return { items: [], page: 1, limit: 10, total: 0 };
}

export async function addVideo(payload: AddVideoInput): Promise<Video> {
  const { data } = await api.post("/api/videos", payload);
  console.log("addVideo(): data = ", data);
  return data;
}
