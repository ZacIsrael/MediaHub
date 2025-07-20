// This interface defines the structure of a Video MongoDB Document.
// In other words, it reflects exactly what a document entry
// looks like in the "videos" collection in MongoDB.

// MongoDB module
import mongoose, { Document, Schema } from "mongoose";

export interface IVideo extends Document {
  // When creating a new video, _id doesn’t exist yet. But when reading or updating documents, it will.
  _id: string;
  title: string;
  url: string;
  // tags has a '?' at the end because its optional
  tags?: string[];
  viewCount: number;
  publishedAt: Date;
}
