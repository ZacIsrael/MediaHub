// This file handles the interaction between the API & the socialposts collection in MongoDB

import { ISocialPost, CreateSocialPostInput } from "../types/socialPost.interface";
import { SocialPosts } from "../models/socialPost.model";

export const socialPostService = {
  async createSocialPost(dto: CreateSocialPostInput): Promise<ISocialPost> {
    // Creates a socialPost MongoDB document with cleaned up parameters passed in
    // from the data transfer object (dto) from socialPost.dto.ts
    const socialPost = new SocialPosts({
      platform: dto.platform,
      url: dto.url,
      caption: dto.caption,
      hashtags: dto.hashtags,
    });

    // save the created social post into the socialposts MongoDB collection
    return await socialPost.save();
  },

  async getAllSocialPosts(): Promise<ISocialPost[]> {
    // retreives all of the social posts from the socialposts MongoDB collection
    return await SocialPosts.find();
  },
};
