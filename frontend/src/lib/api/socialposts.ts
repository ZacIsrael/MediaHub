// This file contains the API functions for the social posts (CRUD); interacts with the backend

// Import the axios library, a promise-based HTTP client
import api from "./axios";

// define the structure of a Social Post document
import { type SocialPost, type AddSocialPostInput } from "./types";

// structure for basic pagination
export type Paginated<T> = {
  items: T[];
  page: number;
  limit: number;
  total: number;
};

export type ListSocialPostsQuery = {
  page?: number;
  limit?: number;
  q?: string;
};

async function getSocialPosts(
  params: ListSocialPostsQuery = {}
): Promise<Paginated<SocialPost>> {
  // data retreived from GET request sent to the backend API
  const { data } = await api.get("/api/social-posts", { params });

  // Response structure: { message: string, socialPosts: SocialPost[] }
  if (Array.isArray(data.socialPosts)) {
    const items = data.socialPosts;
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

export async function addSocialPost(payload: AddSocialPostInput): Promise<SocialPost>{
    const { data } = await api.post("/api/social-posts", payload);
    console.log('addSocialPost(): data = ', data);
    return data;
}
