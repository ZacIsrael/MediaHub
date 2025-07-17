// This file is responsible for handling API requests that come in for videos

import { CreateVideoDTO } from "../dtos/video.dto.js";
import { videoService } from "../services/video.service.js";

// called for (POST /api/videos/) route
export const createVideo = async (req, res) => {
  // data transfer object (object that will contained the processed request)
  let dto;

  // process the body of the request (see video.dto.js)
  try {
    dto = new CreateVideoDTO(req.body);
  } catch (err) {
    // Error stems from client-side/body of the request
    // see (video.dto.js) to see all possible error messages
    res.status(400).json({
      error: `Bad Request (POST /api/videos/): ${err.message}`,
      stack: err.stack,
    });
  }
  try {
    // Saves the newly created video with the fields from the body of
    // the request into the videos MongoDB collection (see video.service.js)
    const video = await videoService.createVideo(dto);

    res.status(201).json({
      message: `Successfully inserted video into the \'videos\' mongoDB collection.`,
      video: newVideo,
    });
  } catch (err) {
    // Error inserting the video into the mongoDB collection
    res.status(500).json({
      error: `Server Error (POST /api/videos/): ${err.message}`,
      stack: err.stack,
    });
  }
};

// called for (GET /api/videos/) route
export const getAllVideos = async (req, res) => {
  try {
    const videos = await videoService.getAllVideos();

    res.status(200).json({
      message:
        // necessary message gets displayed depending on if the videos collection is empty or not
        videos.lenth === 0
          ? "There are no videos in the 'videos' mongoDB collection."
          : "Successfully retreived all videos from the 'videos' mongoDB collection.",
      videos,
    });
  } catch (err) {
    // error occured when retreiving all video documents from the videos MongoDB collection
    res.status(500).json({
      error: `Server Error (GET /api/videos/): ${err.message}`,
      stack: err.stack,
    });
  }
};
