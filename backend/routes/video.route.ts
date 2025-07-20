// Import the express framework to create and manage the web server
import express from "express";

import { createVideo, getAllVideos } from "../controllers/video.controller";

const router = express.Router();

// route that stores a video in the mongoDB collection
router.post("/", createVideo);
// route that retrieves all videos from the 'videos' mongoDB collection
router.get("/", getAllVideos);

export default router;
