// This file is responsible for handling API requests that come in for videos

import { Request, Response } from "express";
import { CreateVideoDTO } from "../dtos/video.dto";
import { videoService } from "../services/video.service";

// called for (POST /api/videos/) route
export const createVideo = async (req: Request, res: Response): Promise<void> => {
  
  console.log('(POST /api/videos/): req.body = ', req.body)
  
  // data transfer object (object that will contained the processed request)
  let dto: CreateVideoDTO;

  // process the body of the request (see video.dto.js)
  try {
    dto = new CreateVideoDTO(req.body);
    console.log('(POST /api/videos/): dto = ', dto);
  } catch (err: any) {
    // Error stems from client-side/body of the request
    // see (video.dto.js) to see all possible error messages
    res.status(400).json({
      error: `Bad Request (POST /api/videos/): ${err.message}`,
      stack: err.stack,
    });
    return;
  }

  
  try {
    // Saves the newly created video with the fields from the body of
    // the request into the videos MongoDB collection (see video.service.js)
    const video = await videoService.createVideo(dto);

    res.status(201).json({
      message: `Successfully inserted video into the \'videos\' mongoDB collection.`,
      video,
    });
  } catch (err: any) {
    // Error inserting the video into the mongoDB collection
    res.status(500).json({
      error: `Server Error (POST /api/videos/): ${err.message}`,
      stack: err.stack,
    });
  }
};

// called for (GET /api/videos/) route
export const getAllVideos = async (req: Request, res: Response): Promise<void> => {
  try {
    const videos = await videoService.getAllVideos();

    res.status(200).json({
      message:
        // necessary message gets displayed depending on if the videos collection is empty or not
        videos.length === 0
          ? "There are no videos in the 'videos' mongoDB collection."
          : "Successfully retreived all videos from the 'videos' mongoDB collection.",
      // send the returned videos back to the client side
      videos,
    });
  } catch (err: any) {
    // error occured when retreiving all video documents from the videos MongoDB collection
    res.status(500).json({
      error: `Server Error (GET /api/videos/): ${err.message}`,
      stack: err.stack,
    });
  }
};
