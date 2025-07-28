

import { db } from "../database";
import { CreateClientDTO } from "../dtos/client.dto";
import { clientService } from "../services/client.service";

// Tell jest to mock the postgreSQL database so tests aren't 
// actually connecting to the real database
jest.mock("../database", () => ({
  db: {
    // mock query function used to interact with the PostgreSQL database
    query: jest.fn(),
  },
}));

describe("clientService", () => {
  let service: typeof clientService;
  // Before each test, create a new instance of
  // clientService and reset any previous mocks
  beforeEach(() => {
    service = clientService;
    // ensures that each test starts with a clean slate
    jest.clearAllMocks();
  });

  // testing the createClient() function
  describe("createClient", () => {
    it("should create a new client and return the created client", async () => {
      // Define input for the DTO that creates a client
      const mockDTO: CreateClientDTO = {
        name: "Test Name",
        email: "test123@email.com",
        phone: "2708934412",
      };

      // Mock result that PostgreSQL returns (the created user)
      const mockResult = {
        // returns the result object that has an array with 1 row (see client.service.ts)
        // this row should have an id and whatever was pased in mockDTO
        rows: [
          {
            id: 1,
            name: mockDTO.name,
            email: mockDTO.email,
            phone: mockDTO.phone,
          },
        ],
      };

      // mock db.query to resolve with mockResult when called
      (db.query as jest.Mock).mockResolvedValue(mockResult);

      // call the createClient function so that it can be tested
      const result = await service.createClient(mockDTO);

      // Ensure that db.query was called with the correct SQL query and parameters
      expect(db.query).toHaveBeenCalledWith(
        "INSERT INTO clients (name, email, phone) VALUES ($1, $2, $3) RETURNING *",
        [mockDTO.name, mockDTO.email, mockDTO.phone]
      );

      // Ensure that createClient returned the result object 
      expect(result).toEqual(mockResult);
    });
  });

  // testing the getAllClients() function
  describe("getAllClients", () => {
    it("should return all clients", async () => {
      // Define a mock list of clients
      const mockClients = {
        rows: [
          { id: 1, name: "Alice", email: "alice@example.com", phone: "123" },
          { id: 2, name: "Bob", email: "bob@example.com", phone: "456" },
        ],
      };

      // Mock db.query to resolve with the mock list of clients
      (db.query as jest.Mock).mockResolvedValueOnce(mockClients);

      // Call the method
      const result = await service.getAllClients();

      // Verify the query sent to the database
      expect(db.query).toHaveBeenCalledWith("SELECT * FROM clients");

      // Verify that the service returned the mock clients
      expect(result).toEqual(mockClients);
    });
  });
});
