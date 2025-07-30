import { ObjectId } from "mongodb";
import { videoService } from "../services/video.service";
import { CreateVideoDTO } from "../dtos/video.dto";
import { Videos } from "../models/video.model";

// Tell jest to mock the Videos model itself so these tests aren't actually
// connecting to the real MongoDB database
/*
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
*/

jest.mock("../models/video.model", () => {
  return {
    Videos: Object.assign(
      jest.fn().mockImplementation((doc: any) => ({
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
      {
        // mock the find function  (find() retreives all of the documents from a MongoDB collection)
        find: jest.fn().mockResolvedValue([
          {
            _id: "6883e33f837c683090b9c861",
            title: "Rapper Interview 0",
            url: "https://www.youtube.com",
            tags: ["DMV", "Rap", "Hip-Hop", "Producer"],
            viewCount: 20255,
            publishedAt: "2024-03-19T14:00:00.000Z",
            __v: 0,
          },
        ]),
      }
    ),
  };
});

describe("videoService", () => {
  let service: typeof videoService;
  // Before each test, create a new instance of
  // videoService and reset any previous mocks
  beforeEach(() => {
    service = videoService;
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
      const result = await service.createVideo(mockDTO);

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

  // testing getAllVideos() function
  describe("getAllVideos", () => {
    it("should return all videos", async () => {
      const mockVideos = [
        {
          _id: "6883e33f837c683090b9c861",
          title: "Rapper Interview 0",
          url: "https://www.youtube.com",
          tags: ["DMV", "Rap", "Hip-Hop", "Producer"],
          viewCount: 20255,
          publishedAt: "2024-03-19T14:00:00.000Z",
          __v: 0,
        },
        {
          _id: "6883e3b0837c683090b9c864",
          title: "Rapper Interview 1",
          url: "https://www.youtube.com",
          tags: ["DMV", "Rap", "Hip-Hop"],
          viewCount: 77272,
          publishedAt: "2024-02-06T14:00:00.000Z",
          __v: 0,
        },
        {
          _id: "6883e3e4837c683090b9c866",
          title: "Rapper Interview 2",
          url: "https://www.youtube.com",
          tags: ["DMV", "Rap", "Hip-Hop"],
          viewCount: 22410,
          publishedAt: "2024-04-17T14:00:00.000Z",
          __v: 0,
        },
      ];

      // Ensure the mocked find() returns all of mockVideos
      (Videos.find as jest.Mock).mockResolvedValue(mockVideos);

      // call the getAllVideos() function so that it can be tested
      const result = await service.getAllVideos();
      // console.log("result = ", result, "\nmockVideos = ", mockVideos);

      // result from getAllVideos() should have the same structure as the mockVideos array
      expect(result).toEqual(mockVideos);
    });
  });
});
