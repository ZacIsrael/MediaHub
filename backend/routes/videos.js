// Import the express framework to create and manage the web server
import express from "express";

// Middleware to parse form data (e.g., from HTML forms or Postman)
// Parses data in x-www-form-urlencoded format and makes it available in req.body
import bodyParser from "body-parser";

// Enables Cross-Origin Resource Sharing, allowing frontend apps on different ports (like React) to make requests to this backend
import cors from "cors";

import { Videos } from "../models/videos.js";

const router = express.Router();

// route that stores a video in the mongoDB collection
router.post("/", async (req, res) => {
  // Thoroughly check the body of the request for errors (will create a
  // an auxillary function in helpers.js later on)

  // happy path (for now)
  // extract the necessary fields from the body of the request
  const { title, url, tags, viewCount, publishedAt } = req.body;

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
