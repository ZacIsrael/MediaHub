// This file handles the interaction between the API & the videos collection in MongoDB

import { Videos } from "../models/video.model.js";

export const videoService = {
    async createVideo(dto) {
        // creates a video MongoDB document with cleaned up parameters passed in from video.dto.js
        const video = new Videos({
            title: dto.title,
            url: dto.url,
            tags: dto.tags,
            viewCount: dto.viewCount,
            publishedAt: dto.publishedAt
        });

        // saves the created video into the videos MongoDB collection
        return await video.save();
    },

    async getAllVideos(){
        // retrieves all of the video documents from the videos MongoDB collection
        return await Videos.find();
    }
}