// This file validates and sanitizes the data coming from API requests for videos
export class CreateVideoDTO {
  constructor({ title, url, tags = [], viewCount, publishedAt }) {
    // Check for empty strings
    if (typeof title !== "string" || title.trim().length === 0) {
      // For some reason, title is not of type string; throw error
      throw new Error(
        `Error (\'/api/videos/\' POST route): \'title\' field must be a non-empty string.`
      );
    }

    if (typeof url !== "string" || url.trim().length === 0) {
      // For some reason, url is not of type string; throw error
      //   res.status(400).json({
      //     error: `Error (\'/api/videos/\' POST route): \'url\' field must be a non-empty string`,
      //   });
      throw new Error(
        `Error (\'/api/videos/\' POST route): \'url\' field must be a non-empty string`
      );
    }

    if (typeof publishedAt !== "string" || publishedAt.trim().length === 0) {
      // For some reason, publishedAt is not of type string; throw error
      //   res.status(400).json({
      //     error: `Error (\'/api/videos/\' POST route): \'publishedAt\'field must be a non-empty string.`,
      //   });
      throw new Error(
        `Error (\'/api/videos/\' POST route): \'publishedAt\'field must be a non-empty string.`
      );
    }

    // Ensure that viewCount is a valid number
    if (typeof viewCount !== "number" || isNaN(viewCount)) {
      // For some reason, viewCount is not of type number; throw error
      //   res.status(400).json({
      //     error: `Error (\'/api/videos/\' POST route): \'viewCount\'field must be of type \'number\'.`,
      //   });
      throw new Error(
        `Error (\'/api/videos/\' POST route): \'viewCount\'field must be of type \'number\'.`
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
