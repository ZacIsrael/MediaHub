// MongoDB module
import mongoose from "mongoose";

// schema for the "social-posts" collection
const socialPostsSchema = new mongoose.Schema({
  // platform that the content was posted on (instagram, tiktok, youtube, etc.)
  platform: {
    type: String,
    required: true,
    maxLength: 100,
  },
  // caption of the post
  caption: {
    type: String,
    required: true,
    // captions can be a bit lengthy depending on the platform (doubt it'll ever be 300 characters though)
    maxLength: 300,
  },
  // hashtags applied to the content
  hashtags: {
    // there can be multiple hashtags for a post
    type: Array,
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
export const SocialPosts = mongoose.model("SocialPosts", socialPostsSchema);
