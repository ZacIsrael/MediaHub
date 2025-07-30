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
});
