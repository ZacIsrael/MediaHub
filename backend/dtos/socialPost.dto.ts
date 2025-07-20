// A DTO (Data Transfer Object) for social posts - responsible for sanitizing and validating data from requests

import { ISocialPost, CreateSocialPostInput } from "../types/socialPost.interface";



// CreateSocialPostDTO now implements ISocialPost to ensure alignment with the MongoDB model
export class CreateSocialPostDTO implements CreateSocialPostInput {
  platform: string;
  url: string;
  caption: string;
  hashtags?: string[]; // optional field

  // Ensure that the object passed to this constructor matches the shape of ISocialPost
  constructor({ platform, url, caption, hashtags }: CreateSocialPostInput) {
    // validation - make sure that platform is provided

    // Check for empty strings
    if (!platform || platform.trim() === "") {
      throw new Error(
        "Error (POST /api/social-posts/): 'platform' field must be a non-empty string."
      );
    }

    // validation - make sure that url is provided
    if (!url || url.trim() === "") {
      throw new Error(
        "Error (POST /api/social-posts/): 'url' field must be a non-empty string."
      );
    }

    // validation - make sure that caption is provided
    if (!caption || caption.trim() === "") {
      throw new Error(
        "Error (POST /api/social-posts/): 'caption' field must be a non-empty string."
      );
    }

    console.log(`This caption has ${caption.length} characters.`);

    // If hashtags is provided, validate that it's an array of strings
    if (hashtags && !Array.isArray(hashtags)) {
      throw new Error(
        "Error (POST /api/social-posts/): 'hashtags' must be an array."
      );
    }

    // assign the values to the instance
    this.platform = platform;
    this.url = url;
    this.caption = caption;
    this.hashtags = hashtags;
  }
}
