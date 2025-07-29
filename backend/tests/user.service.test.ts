import { mock } from "node:test";
import { db } from "../database";
import { CreateUserDTO } from "../dtos/user.dto";
import { userService } from "../services/user.service";

// Tell jest to mock the postgreSQL database so tests aren't actually connecting to the real database
jest.mock("../database", () => ({
  db: {
    // mock query function used to interact with the PostgreSQL database
    query: jest.fn(),
  },
}));

describe("userService", () => {
  let service: typeof userService;
  // Before each test, create a new instance of
  // clientService and reset any previous mocks
  beforeEach(() => {
    service = userService;
    // ensures that each test starts with a clean slate
    jest.clearAllMocks();
  });

  // testing createUser() function
  describe("createUser", () => {
    it("should create a new user and return the created user and a jwt token", async () => {
      // Define input for the DTO that creates a user
      const mockDTO: CreateUserDTO = {
        email: "test123@email.com",
        name: "Test Name",
        password: "Password123!",
        provider: "local",
        provider_id: "",
        // hashPassword function is part of the CreateUserDTO class
        // so it needs to be here
        hashPassword: jest.fn(),
      };

      // Structure of what is returned from usersService.createUser() (see users.service.ts)
      const mockResult = {
        // the created user from PostgreSQL
        user: {
          id: 5,
          name: mockDTO.name,
          email: mockDTO.email,
          password_hash:
            "$6b$34$xnPoYvylaCdHmL8YDDBwdOzJYk7EOh0yC6bPHMAZGFPmYTlQCzEzM",
          provider: mockDTO.provider,
          provider_id: mockDTO.provider_id,
          created_at: "2025-07-29T13:03:40.176Z",
          updated_at: "2025-07-29T13:03:40.176Z",
        },
        // jwtoken
        // expect any string for the token; this is just the structure of the result
        token: expect.any(String),
      };

      // The actual query in createUser returns an array (rows) of obejects
      // The first and inly object in the array is the created user
      (db.query as jest.Mock).mockResolvedValue({ rows: [mockResult.user] });
      // call the createClient function so that it can be tested
      const result = await service.createUser(mockDTO);

      // Ensure that db.query was called with the correct SQL query and parameters
      expect(db.query).toHaveBeenCalledWith(
        "INSERT INTO users (email, name, password_hash, provider, provider_id) VALUES ($1, $2, $3, $4, $5) RETURNING *",
        [
          mockDTO.email,
          mockDTO.name,
          mockDTO.password,
          mockDTO.provider,
          mockDTO.provider_id,
        ]
      );

      // Ensure that createUser returned an object that contains the
      // user returned from PostgreSQL AND a jwtoken
      expect(result).toEqual(mockResult);
    });
  });
});
