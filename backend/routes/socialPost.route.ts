// Import the express framework to create and manage the web server
import express from "express";

import {
  createSocialPost,
  getAllSocialPosts,
} from "../controllers/socialPost.controller";

const router = express.Router();

// route that stores a social post in the mongoDB collection
router.post("/", createSocialPost);

// route that retrieves all social posts from the 'socialposts' mongoDB collection
router.get("/", getAllSocialPosts);

export default router;
