// This interface defines the structure of a SocialPost MongoDB Document.
// In other words, it reflects exactly what a document entry
// looks like in the "socialposts" collection in MongoDB.

// MongoDB module
import mongoose, { Document, Schema } from "mongoose";

export interface ISocialPost extends Document {
  // When creating a new social post, _id doesn’t exist yet. But when reading or updating documents, it will.
  _id: string;
  platform: string;
  url: string;
  caption: string;
  // hashtags has a '?' at the end because its optional
  hashtags?: string[];
  engagement?: string
}

// Define a lightweight interface for incoming social post data
export interface CreateSocialPostInput {
  platform: string;
  url: string;
  caption: string;
  hashtags?: string[];
}
