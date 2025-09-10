// Import the express framework to create and manage the web server
import express from "express";

import {
  createSocialPost,
  getAllSocialPosts,
} from "../controllers/socialPost.controller";

// Import middleware that checks for a valid JWT access token in Authorization header  
// Ensures only authenticated users can access protected routes
import { verifyAccessToken } from "../middleware/auth.middleware";

const router = express.Router();

// route that stores a social post in the mongoDB collection
router.post("/", verifyAccessToken, createSocialPost);

// route that retrieves all social posts from the 'socialposts' mongoDB collection
router.get("/", verifyAccessToken, getAllSocialPosts);

export default router;
