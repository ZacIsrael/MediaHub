// This file is responsible for handling API requests that come in for social posts

import { CreateSocialPostDTO } from "../dtos/socialPost.dto.js";
import { socialPostService } from "../services/socialPost.service.js";

// called for (POST /api/social-posts/) route
export const createSocialPost = async (req, res) => {
  // data transfer object (object that will contained the processed request)
  let dto;

  // process the body of the request (see socialPost.dto.js)
  try {
    dto = new CreateSocialPostDTO(req.body);
  } catch (err) {
    // Error stems from client-side/body of the request
    // see (socialPost.dto.js) to see all possible error messages
    res.status(400).json({
      error: `Bad Request (POST /api/social-posts/): ${err.message}`,
      stack: err.stack,
    });
  }

  try {
    // Saves the newly created social post with the fields from the body of
    // the request into the socialposts MongoDB collection (see socialPost.dto.js)
    const socialPost = await socialPostService.createSocialPost(dto);

    res.status(201).json({
      message: `Successfully inserted social post into the 'socialposts' mongoDB collection.`,
      socialPost,
    });
  } catch (err) {
    // Error inserting the social post into the mongoDB collection
    res.status(500).json({
      error: `Server Error (POST /api/social-posts/): ${err.message}`,
      stack: err.stack,
    });
  }
};

// called for (GET /api/social-posts/) route
export const getAllSocialPosts = async (req, res) => {
  try {
    // retreive all of the social posts from the MongoDB collection
    const socialPosts = await socialPostService.getAllSocialPosts();

    res.status(200).json({
      message:
        // necessary message gets displayed depending on if the videos collection is empty or not
        socialPosts.lenth === 0
          ? "There are no social posts in the 'socialposts' mongoDB collection."
          : "Successfully retreived all social posts from the 'socialposts' mongoDB collection.",
      // send the returned social posts back to the client side
      socialPosts,
    });
  } catch (err) {
    // Error retreiving all social posts from the mongoDB collection
    res.status(500).json({
      error: `Server Error (GET /api/social-posts/): ${err.message}`,
      stack: err.stack,
    });
  }
};
