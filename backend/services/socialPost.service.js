// This file handles the interaction between the API & the socialposts collection in MongoDB

import { SocialPosts } from "../models/socialPost.model.js";

export const socialPostService = {
  async createSocialPost(dto) {
    // Creates a socialPost MongoDB document with cleaned up parameters passed in
    // from the data transfer object (dto) from socialPost.dto.js
    const socialPost = new SocialPosts({
      platform: dto.platform,
      url: dto.url,
      caption: dto.caption,
      hashtags: dto.hashtags,
      engagement: this.engagement,
    });

    // saved the created social post into the socialposts MongoDB collection
    return await socialPost.save();
  },

  async getAllSocialPosts(){
    // retreives all of the social posts from the socialposts MongoDB collection
    return await SocialPosts.find();
  }
};
