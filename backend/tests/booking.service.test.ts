// Tell jest to mock the postgreSQL database so tests aren't

import { now } from "mongoose";
import { db } from "../database";
import { CreateBookingDTO } from "../dtos/booking.dto";
import { bookingService } from "../services/booking.service";
import { mock } from "node:test";

// actually connecting to the real database
jest.mock("../database", () => ({
  db: {
    // mock query function used to interact with the PostgreSQL database
    query: jest.fn(),
  },
}));

describe("bookingService", () => {
  let service: typeof bookingService;

  // Before each test, create a new instance of
  // bookingService and reset any previous mocks

  beforeEach(() => {
    service = bookingService;
    // ensure that each test starts with a clean slate
    jest.clearAllMocks();
  });

  // testing the createBooking() function
  describe("createBooking", () => {
    it("should create a new booking and return the created booking", async () => {
      // Define the input for the DTO that creates a booking
      const mockDTO: CreateBookingDTO = {
        client_id: 1,
        event_date: "2025-09-16T14:00:00Z",
        event_type: "18th Birthday Photoshoot",
        price: 300.0,
        status: "pending",
      };

      // Mock result that PostgreSQL returns (the created user)
      const mockResult = {
        // returns the result object that has an array with 1 row (see booking.service.ts)
        // this row should have an id and whatever was pased in mockDTO
        rows: [
          {
            id: 5,
            client_id: mockDTO.client_id,
            event_date: mockDTO.event_date,
            event_type: mockDTO.event_type,
            price: mockDTO.price,
            status: mockDTO.status,
            created_at: "2025-07-28T15:52:24.006Z",
            updated_at: "2025-07-28T15:52:24.006Z",
          },
        ],
      };

      // mock db.query to resolve with mockResult when called
      (db.query as jest.Mock).mockResolvedValue(mockResult);

      // call the createBooking function so that it can be tested
      const result = await service.createBooking(mockDTO);

      // Esnure that the db.query was called with the correct SQL query and parameters
      expect(db.query).toHaveBeenCalledWith(
        "INSERT INTO bookings (client_id, event_date, event_type, price, status) VALUES ($1, $2, $3, $4, $5) RETURNING *",
        [mockDTO.client_id, mockDTO.event_date, mockDTO.event_type, mockDTO.price, mockDTO.status]
      );

      // Ensure that createBooking returned the result object
      expect(result).toEqual(mockResult); 
    });
  });
});
