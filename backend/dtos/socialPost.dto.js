// This file validates and sanitizes the data coming from API requests for social posts
export class CreateSocialPostDTO {

    constructor({ platform, url, caption, hashtags = [], engagement }){
        // check for empty strings
        if (typeof platform !== "string" || platform.trim().length === 0) {
            throw new Error("Error (POST /api/social-posts/): 'platform' field must be a non-empty string.")
        }

        if (typeof url !== "string" || url.trim().length === 0) {
            throw new Error("Error (POST /api/social-posts/): 'url' field must be a non-empty string.")
        }

        if (typeof caption !== "string" || caption.trim().length === 0) {
            throw new Error("Error (POST /api/social-posts/): 'caption' field must be a non-empty string.")
        }


         // Assign validated and cleaned values to the DTO instance
         this.platform = platform;
         this.url = url;
         this.caption = caption;
         // Ensure 'hashtags' is an array; if not provided (it's optional) or invalid, default to an empty array
         this.hashtags = Array.isArray(hashtags) ? hashtags : [];
         this.engagement = engagement;
    }
}