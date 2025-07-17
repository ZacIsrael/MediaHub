// Import the express framework to create and manage the web server
import express from "express";

// Middleware to parse form data (e.g., from HTML forms or Postman)
// Parses data in x-www-form-urlencoded format and makes it available in req.body
import bodyParser from "body-parser";

// Enables Cross-Origin Resource Sharing, allowing frontend apps on different ports (like React) to make requests to this backend
import cors from "cors";

import { Videos } from "../models/video.model.js";
import { createVideo, getAllVideos } from "../controllers/video.controller.js";

const router = express.Router();

// route that stores a video in the mongoDB collection
router.post("/", createVideo);
// route that retrieves all videos from the 'videos' mongoDB collection
router.get("/", getAllVideos);

export default router;
