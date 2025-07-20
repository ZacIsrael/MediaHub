// This file handles the interaction between the API & the videos collection in MongoDB

import { CreateVideoDTO } from "../dtos/video.dto";
import { Videos } from "../models/video.model";
import { IVideo } from "../types/video.interface";

export const videoService = {
    // dto parameter is of type CreateVideoDTO (see video.dto.ts)
    // this function returns a promise that has the structure of IVideo (video interface)
    async createVideo(dto: CreateVideoDTO): Promise<IVideo> {
        // creates a video MongoDB document with cleaned up parameters passed in 
        // from the data transfer object (dto) from video.dto.ts
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

    // returns a promise that has an array of elements with the IVideo structure
    async getAllVideos(): Promise<IVideo[]>{
        // retreives all of the video documents from the videos MongoDB collection
        return await Videos.find();
    }
}