// Import the express framework to create and manage the web server
import express from "express";

import { createVideo, getAllVideos } from "../controllers/video.controller";

// Import middleware that checks for a valid JWT access token in Authorization header
// Ensures only authenticated users can access protected routes
import { verifyAccessToken } from "../middleware/auth.middleware";

const router = express.Router();

// route that stores a video in the mongoDB collection
router.post("/", verifyAccessToken, createVideo);
// route that retrieves all videos from the 'videos' mongoDB collection
router.get("/", verifyAccessToken, getAllVideos);

export default router;
