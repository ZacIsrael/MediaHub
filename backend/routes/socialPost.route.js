// Import the express framework to create and manage the web server
import express from "express";

// Middleware to parse form data (e.g., from HTML forms or Postman)
// Parses data in x-www-form-urlencoded format and makes it available in req.body
import bodyParser from "body-parser";

// Enables Cross-Origin Resource Sharing, allowing frontend apps on different ports (like React) to make requests to this backend
import cors from "cors";

import { SocialPosts } from "../models/socialPost.model.js";
import {
  createSocialPost,
  getAllSocialPosts,
} from "../controllers/socialPost.controller.js";

const router = express.Router();

// route that stores a social post in the mongoDB collection
router.post("/", createSocialPost);

// route that retrieves all social posts from the 'socialposts' mongoDB collection
router.get("/", getAllSocialPosts);

export default router;
