// Import the express framework to create and manage the web server
import express from "express";

// Middleware to parse form data (e.g., from HTML forms or Postman)
// Parses data in x-www-form-urlencoded format and makes it available in req.body
import bodyParser from "body-parser";

// Enables Cross-Origin Resource Sharing, allowing frontend apps on different ports (like React) to make requests to this backend
import cors from "cors";

import { SocialPosts } from "../models/social-posts.js";

const router = express.Router();

// route that stores a social post in the mongoDB collection
router.post("/", async (req, res) => {
  // Thoroughly check the body of the request for errors (will create a
  // an auxillary function in helpers.js later on)

  // happy path (for now)
  // extract the necessary fields from the body of the request
  const { platform, url, caption, hashtags, engagement } = req.body;

  try {
    // insert the new video into the mongoDB collection
    const newSocialPost = await SocialPosts.create({
      platform,
      url,
      caption,
      hashtags,
      engagement,
    });

    res.status(201).json({
      message: `Successfully inserted social post into the \'social_posts\' mongoDB collection.`,
      socialPost: newSocialPost,
    });
  } catch (err) {
    // Error inserting the social post into the mongoDB collection
    res.status(500).json({
      error: `Error (\'/api/social-posts/\' POST route): ${err.message}`,
      stack: err.stack,
    });
  }
});

// route that retrieves all social posts from the 'socialposts' mongoDB collection
router.get("/", async (req, res) => {
  try {
    // returns an array of all of the socialposts in the mongoDB collection
    const allSocialPosts = await SocialPosts.find();

    if (allSocialPosts.length === 0) {
      res.status(200).json({
        message: `The \'socialposts\' mongoDB collection is empty.`,
        socialPosts: allSocialPosts,
      });
    } else {
      res.status(200).json({
        message: `Successfully retreived all social posts from the \'socialposts\' mongoDB collection.`,
        socialPosts: allSocialPosts,
      });
    }
  } catch (err) {
    // Error retreiving all social posts from the mongoDB collection
    res.status(500).json({
      error: `Error (\'/api/social-posts/\' GET route): ${err.message}`,
      stack: err.stack,
    });
  }
});

export default router;
