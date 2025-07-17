// MongoDB module
import mongoose from "mongoose";

// schema for the "videos" collection
const videosSchema = new mongoose.Schema({
    // title of the video
    title: {
        type: String,
        required: true,
        // titles of youtube videos will be 100 characters MAX
        maxLength: 100
    },
    // youtube link to the video
    url: {
        type: String,
        required: true,
        maxLength: 200
    },
    tags: {
        // a youtube video can have multiple tags
        type: Array,
        required: false
    },
    // how many views the video earned
    viewCount: {
        type: Number,
        required: true,
    },
    // date the video was published on youtube
    publishedAt: {
        type: Date,
        required: true
    }
});

// create and export this Videos model
export const Videos = mongoose.model("Videos", videosSchema);