// Import the express framework to create and manage the web server
import express from "express";

// Middleware to parse form data (e.g., from HTML forms or Postman)
// Parses data in x-www-form-urlencoded format and makes it available in req.body
import bodyParser from "body-parser";

// Enables Cross-Origin Resource Sharing, allowing frontend apps on different ports (like React) to make requests to this backend
import cors from "cors";

import { Videos } from "../models/videoModel.js";

const router = express.Router();

// route that stores a video in the mongoDB collection
router.post("/", async (req, res) => {
  // Thoroughly check the body of the request for errors (will create a
  // an auxillary function in helpers.js later on)
  if (
    req.body.hasOwnProperty("title") &&
    req.body.hasOwnProperty("url") &&
    req.body.hasOwnProperty("viewCount") &&
    req.body.hasOwnProperty("publishedAt")
  ) {
    // extract the necessary fields from the body of the request
    // tags will be set to an empty array if it's not in the body of the request (it's an optional field)
    const { title, url, tags = [], viewCount, publishedAt } = req.body;
    console.log("tags = ", tags);
    if (typeof title !== "string") {
      // For some reason, title is not of type string; throw error
      res.status(400).json({
        error: `Error (\'/api/videos/\' POST route): \'title\'field must be of type \'string\'.`,
      });
    }

    if (typeof url !== "string") {
      // For some reason, url is not of type string; throw error
      res.status(400).json({
        error: `Error (\'/api/videos/\' POST route): \'url\'field must be of type \'string\'.`,
      });
    }

    if (typeof publishedAt !== "string") {
      // For some reason, publishedAt is not of type string; throw error
      res.status(400).json({
        error: `Error (\'/api/videos/\' POST route): \'publishedAt\'field must be of type \'string\'.`,
      });
    }

    if (typeof viewCount !== "number" || isNaN(viewCount)) {
      // For some reason, viewCount is not of type number; throw error
      res.status(400).json({
        error: `Error (\'/api/videos/\' POST route): \'viewCount\'field must be of type \'number\'.`,
      });
    }

    // check for empty strings
    if (title.trim().length === 0) {
      res.status(400).json({
        error: `Error (\'/api/videos/\' POST route): \'title\' field is an empty string.`,
      });
    }

    if (url.trim().length === 0) {
      res.status(400).json({
        error: `Error (\'/api/videos/\' POST route): \'url\' field is an empty string.`,
      });
    }

    if (publishedAt.trim().length === 0) {
      res.status(400).json({
        error: `Error (\'/api/videos/\' POST route): \'publishedAt\' field is an empty string.`,
      });
    }

    try {
      // insert the new video into the mongoDB collection
      const newVideo = await Videos.create({
        title,
        url,
        tags,
        viewCount,
        publishedAt,
      });

      res.status(201).json({
        message: `Successfully inserted video into the \'videos\' mongoDB collection.`,
        video: newVideo,
      });
    } catch (err) {
      // Error inserting the video into the mongoDB collection
      res.status(500).json({
        error: `Error (\'/api/videos/\' POST route): ${err.message}`,
        stack: err.stack,
      });
    }
  } else {
    // video is missing necessary (title, url, viewCount, publishedAt) fields; throw error
    res.status(400).json({
      error: `Error (\'/api/videos/\' POST route): At least 1 of the mandatory fields (\'title\', \'url\', \'viewCount\', & \'publishedAt\') are NOT in the request.`,
    });
  }
});

// route that retrieves all videos from the 'videos' mongoDB collection
router.get("/", async (req, res) => {
  try {
    // returns an array of all of the videos in the mongoDB collection
    const allVideos = await Videos.find();

    if (allVideos.length === 0) {
      res.status(200).json({
        message: `There are no videos in the \'videos\' mongoDB collection.`,
        videos: allVideos,
      });
    } else {
      res.status(200).json({
        message: `Successfully retreived all videos from the \'videos\' mongoDB collection.`,
        videos: allVideos,
      });
    }
  } catch (err) {
    // Error retreiving all videos from the mongoDB collection
    res.status(500).json({
      error: `Error (\'/api/videos/\' GET route): ${err.message}`,
      stack: err.stack,
    });
  }
});

export default router;
