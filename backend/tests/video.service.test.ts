import { ObjectId } from "mongodb";
import { videoService } from "../services/video.service";
import { CreateVideoDTO } from "../dtos/video.dto";

// Tell jest to mock the Videos model itself so these tests aren't actually
// connecting to the real MongoDB database
jest.mock("../models/video.model", () => {
  return {
    Videos: jest.fn().mockImplementation((doc: any) => ({
      ...doc,
      // mock the save function (save() adds a document to a MongoDB collection)
      save: jest.fn().mockResolvedValue({
        _id: new ObjectId().toString(),
        title: doc.title,
        url: doc.url,
        tags: doc.tags,
        viewCount: doc.viewCount,
        publishedAt: doc.publishedAt,
        __v: 0,
      }),
    })),
  };
});

describe("videoService", () => {
  beforeEach(() => {
    // ensures that each test starts with a clean slate
    jest.clearAllMocks();
  });
  // Reset all modules and mocks after all tests finish
  afterAll(async () => {
    jest.resetModules();
    jest.clearAllMocks();
  });

  // testing createVideo() function
  describe("createVideo", () => {
    it("should create a new video and return it", async () => {
      // Define input for the DTO that creates a video
      const mockDTO: CreateVideoDTO = {
        title: "Test Title",
        url: "https://test.com",
        tags: ["DMV", "Rap"],
        viewCount: 12345,
        publishedAt: new Date("2024-12-03T14:00:00.000Z"),
      };

      // call the createVideo function so that it can be tested
      const result = await videoService.createVideo(mockDTO);

      expect(result).toMatchObject({
        // Structure of what is returned from videoService.createVideo
        // It returns the newly created MongoDB video document
        title: mockDTO.title,
        url: mockDTO.url,
        tags: mockDTO.tags,
        viewCount: mockDTO.viewCount,
        publishedAt: mockDTO.publishedAt,
        _id: expect.any(String),
        __v: 0,
      });
    });
  });
});

/*
// import mongoose from "mongoose";
import { videoService } from "../services/video.service";
import { CreateVideoDTO } from "../dtos/video.dto";

import { mongoose } from "../database";

import { ObjectId } from "mongodb";

// Tell jest to mock the mongoDB database so tests aren't actually connecting to the real database
jest.mock("../database", () => ({
  mongoose: {
    model: jest.fn(() => {
      return function (doc: any) {
        return {
          ...doc,
          save: jest.fn().mockResolvedValue(doc),
        };
      };
    }),

    collection: {
      collection: jest.fn(() => ({
        findOne: jest.fn(),
        insertOne: jest.fn(),
        updateOne: jest.fn(),
        deleteOne: jest.fn(),
        find: jest.fn(() => ({
          toArray: jest.fn(),
        })),
      })),
    },
  },
}));

describe("videoService", () => {
  let service: typeof videoService;
  // Before each test, create a new instance of
  // videoService and reset any previous mocks
  beforeEach(() => {
    service = videoService;
    // ensures that each test starts with a clean slate
    jest.clearAllMocks();
  });

  // testing the createVideo() function
  describe("createVideo", () => {
    it("should create a new video and return it", async () => {
      // Define input for the DTO that creates a video
      const mockDTO: CreateVideoDTO = {
        title: "A Rapper Interview!",
        url: "https://www.youtube.com/watch?",
        tags: ["DMV", "Rap", "Hip-Hop"],
        viewCount: 25000,
        publishedAt: expect.any(Date),
      };

      // Structure of what is returned from videoService.createVideo() (see video.service.ts)
      const mockResult = {
        // the created video document from MongoDB
        title: mockDTO.title,
        url: mockDTO.url,
        tags: mockDTO.tags,
        viewCount: mockDTO.viewCount,
        publishedAt: new Date(),
        _id: expect.any(ObjectId),
        __v: expect.any(Number),
      };

      // mongoose.model.save is the function that needs to be mocked (see video.service.ts)
      (mongoose.model as jest.Mock).mockImplementation(() => {
        return jest.fn().mockImplementation(() => ({
          ...mockResult,
          save: jest.fn().mockResolvedValue(mockResult),
        }));
      });

      // call the createVideo function so that it can be tested
      const result = await service.createVideo(mockDTO);

      // Ensure that createVideo returned an object of the new video document (mockResult)
      expect(result).toEqual(mockResult);
    });
  });
});
*/
