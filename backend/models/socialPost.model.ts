// MongoDB module
import mongoose, {Schema, Document} from "mongoose";

import { ISocialPost } from "../types/socialPost.interface";

// schema for the "social-posts" collection
const socialPostsSchema: Schema<ISocialPost> = new mongoose.Schema({
  // platform that the content was posted on (instagram, tiktok, youtube, etc.)
  platform: {
    type: String,
    required: true,
    maxLength: 100,
  },
  // url of the post
  url: {
    type: String,
    required: true
  },
  // caption of the post
  caption: {
    type: String,
    required: true,
    // captions on instagram can be a bit lengthy depending on the platform (doubt it'll ever be 300 characters though)
    maxLength: 500,
  },
  // hashtags applied to the content
  hashtags: {
    // Array of strings; there can be multiple hashtags for a post
    type: [String],
    // not every piece of content will have hashtags
    required: false,
  },
  // engagement
  engagement: {
    type: String,
    required: false,
  },
});

// create and export this Social Posts model
export const SocialPosts = mongoose.model<ISocialPost>("SocialPosts", socialPostsSchema);
