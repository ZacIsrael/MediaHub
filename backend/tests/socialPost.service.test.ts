import { ObjectId } from "mongodb";
import { SocialPosts } from "../models/socialPost.model";
import { socialPostService } from "../services/socialPost.service";
import { CreateSocialPostDTO } from "../dtos/socialPost.dto";
import { platform } from "os";

// Tell jest to mock the Social Post model itself so these tests
// aren't actually connecting to the real MongoDB database
jest.mock("../models/socialPost.model", () => {
  return {
    SocialPosts: Object.assign(
      jest.fn().mockImplementation((doc: any) => ({
        // mock the save function (save() adds a document to a MongoDB collection)
        save: jest.fn().mockResolvedValue({
          _id: new ObjectId().toString(),
          platform: doc.platform,
          url: doc.url,
          hashtags: doc.hashtags,
          caption: doc.caption,
          publishedAt: doc.publishedAt,
          __v: 0,
        }),
      })),
      {
        // mock the find function  (find() retreives all of the documents from a MongoDB collection)
        find: jest.fn().mockResolvedValue([
          {
            _id: "6883e3f2837c683090b9c86a",
            platform: "Instagram",
            url: "https://www.instagram.com/",
            caption: "Caption for an instagram post",
            hashtags: ["#Rap", "#DC", "#Life"],
            __v: 0,
          },
        ]),
      }
    ),
  };
});

describe("socialPostService", () => {
  let service: typeof socialPostService;
  // Before each test, create a new instance of
  // videoService and reset any previous mocks
  beforeEach(() => {
    service = socialPostService;
    // ensures that each test starts with a clean slate
    jest.clearAllMocks();
  });

  // Reset all modules and mocks after all tests finish
  afterAll(async () => {
    jest.resetModules();
    jest.clearAllMocks();
  });

  // testing createSocialPost() function
  describe("createSocialPost", () => {
    it("should create a new social post and return it", async () => {
      // Define input for the DTO that creates a social post
      const mockDTO: CreateSocialPostDTO = {
        platform: "Instagram",
        url: "https://www.instagram.com/",
        caption: "Caption for an instagram post",
        hashtags: ["#Rap", "#DC", "#Life"],
      };

      // call the createSocialPost function so that it can be tested
      const result = await service.createSocialPost(mockDTO);

      expect(result).toMatchObject({
        // Structure of what is returned from socialPostService.createSocialPost
        // It returns the newly created MongoDB social post document
        platform: mockDTO.platform,
        url: mockDTO.url,
        hashtags: mockDTO.hashtags,
        caption: mockDTO.caption,
        // MongoDB documents have an auto-generated id and a version field
        _id: expect.any(String),
        __v: 0,
      });
    });
  });
});
