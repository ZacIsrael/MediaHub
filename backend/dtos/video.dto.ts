import { IVideo } from "../types/video.interface";

// This file validates and sanitizes the data coming from API requests for videos
export class CreateVideoDTO {
  title: string;
  url: string;
  tags: string[];
  viewCount: number;
  publishedAt: Date;

  // Ensure that the object passed to this constructor matches the shape of IVideo (the video interface)
  constructor({ title, url, tags = [], viewCount, publishedAt }: IVideo & { publishedAt: string }) {
    // Check for empty strings
    if (typeof title !== "string" || title.trim().length === 0) {
      // For some reason, title is not of type string; throw error
      throw new Error(
        `Error (POST /api/videos/): title field must be a non-empty string.`
      );
    }

    if (typeof url !== "string" || url.trim().length === 0) {
      // For some reason, url is not of type string; throw error
      throw new Error(
        `Error (POST /api/videos/): \'url\' field must be a non-empty string`
      );
    }

    // ensure that publishedAt contains a valid date
    // const parsedDate = new Date(publishedAt);
    // if (isNaN(parsedDate.getTime())) {
    //   throw new Error(
    //     `Error (POST /api/videos/): publishedAt field must be a valid date.`
    //   );
    // }
    if (typeof publishedAt !== "string" || publishedAt.trim().length === 0) {
      // For some reason, publishedAt is not of type string; throw error
      throw new Error(
        `Error (POST /api/videos/): \'publishedAt\'field must be a non-empty string.`
      );
    }

    // ensure that the tags array is valid if it does exist
    if (!Array.isArray(tags)) {
      throw new Error("Error (POST /api/videos/): The tags field must be an array of strings.");
    }
    for (const tag of tags) {
      if (typeof tag !== "string") {
        throw new Error("Error (POST /api/videos/): Each tag in the 'tags' array must be a string.");
      }
    }
    // Ensure that viewCount is a valid number
    if (typeof viewCount !== "number" || isNaN(viewCount)) {
      // For some reason, viewCount is not of type number; throw error
      throw new Error(
        `Error (POST /api/videos/): \'viewCount\'field must be of type \'number\'.`
      );
    }

    // Assign validated and cleaned values to the DTO instance
    this.title = title.trim();
    this.url = url.trim();
    // Ensure 'tags' is an array; if not provided (it's optional) or invalid, default to an empty array
    this.tags = Array.isArray(tags) ? tags : [];
    this.viewCount = viewCount;
    // convert publishedAt string to a javascript Date object
    this.publishedAt = new Date(publishedAt);
  }
}
