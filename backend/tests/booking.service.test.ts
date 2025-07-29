

import { now } from "mongoose";
import { db } from "../database";
import { CreateBookingDTO } from "../dtos/booking.dto";
import { bookingService } from "../services/booking.service";
import { mock } from "node:test";
import * as helper from "../utils/helpers";

import { itemExistsById } from "../utils/helpers";
import { getBookingById } from "../controllers/booking.controller";

// Tell jest to mock the postgreSQL database so tests aren't actually connecting to the real database
jest.mock("../database", () => ({
  db: {
    // mock query function used to interact with the PostgreSQL database
    query: jest.fn(),
  },
}));

// needed for retreiving a booking by its id (see booking.service.ts)
jest.mock("../utils/helpers", () => ({
  ...jest.requireActual("../utils/helpers"), 
  itemExistsById: jest.fn(),
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
        [
          mockDTO.client_id,
          mockDTO.event_date,
          mockDTO.event_type,
          mockDTO.price,
          mockDTO.status,
        ]
      );

      // Ensure that createBooking returned the result object
      expect(result).toEqual(mockResult);
    });
  });

  // testing getAllBookings() function
  describe("getAllBookings", () => {
    it("should return all bookings", async () => {
      const mockBookings = {
        rows: [
          {
            id: 1,
            client_id: 3,
            event_date: "2025-09-16T14:00:00.000Z",
            event_type: "Drake Concert (4 Hours)",
            price: "700.00",
            status: "pending",
            created_at: "2025-07-25T19:59:44.359Z",
            updated_at: "2025-07-25T19:59:44.359Z",
          },
          {
            id: 2,
            client_id: 1,
            event_date: "2026-03-19T14:00:00.000Z",
            event_type: "1 year-old birthday party",
            price: "250.00",
            status: "pending",
            created_at: "2025-07-25T19:59:48.602Z",
            updated_at: "2025-07-25T19:59:48.602Z",
          },
          {
            id: 3,
            client_id: 2,
            event_date: "2027-01-28T14:00:00.000Z",
            event_type: "Networking Event",
            price: "400.00",
            status: "pending",
            created_at: "2025-07-25T19:59:52.924Z",
            updated_at: "2025-07-25T19:59:52.924Z",
          },
          {
            id: 4,
            client_id: 2,
            event_date: "2025-11-02T14:00:00.000Z",
            event_type: "Pictures for Instagram",
            price: "180.00",
            status: "pending",
            created_at: "2025-07-25T20:00:34.596Z",
            updated_at: "2025-07-25T20:00:34.596Z",
          },
          {
            id: 5,
            client_id: 1,
            event_date: "2025-10-31T14:00:00.000Z",
            event_type: "Halloween Photoshoot",
            price: "150.00",
            status: "pending",
            created_at: "2025-07-28T15:52:24.006Z",
            updated_at: "2025-07-28T15:52:24.006Z",
          },
        ],
      };

      // Mock db.query to resolve with the mock list of bookings
      (db.query as jest.Mock).mockResolvedValue(mockBookings);

      // call the method
      const result = await service.getAllBookings();

      // verify that the expected query was executed
      expect(db.query).toHaveBeenCalledWith("SELECT * FROM bookings");

      // verify that the query returned the mock bookings
      expect(result).toEqual(mockBookings);
    });
  });

  // test getByBookingId() function

  describe("getBookingById", () => {
    it("should return the booking with the specified id", async () => {
      const bookingId = 1;
      const expectedBooking = {
        id: bookingId,
        client_id: 2,
        event_date: "2025-11-02T14:00:00.000Z",
        event_type: "Pictures for Instagram",
        price: "180.00",
        status: "pending",
        created_at: "2025-07-25T20:00:34.596Z",
        updated_at: "2025-07-25T20:00:34.596Z",
      };

      // Set up mock return value for itemExistsById
      (helper.itemExistsById as jest.Mock).mockResolvedValue({
        // expected return value for when a booking with a given id exists
        booleanVal: true,
        item: expectedBooking,
      });

      // call the function
      const result = await service.getBookingById(bookingId);
      // verify that result returned from getBookingId matches up with the expected result
      expect(result).toEqual({ booleanVal: true, item: expectedBooking });
    });

    it("should return false and null when the booking is not found", async () => {
      // fake id (no booking in the PostgreSQL database will have an id of -1)
      const fakeId = -1;

      // Set up mock return value for itemExistsById
      (helper.itemExistsById as jest.Mock).mockResolvedValue({
        // expected returned value when a booking with a given id does not exist
        booleanVal: false,
        item: null,
      });

      // call the function
      const result = await service.getBookingById(fakeId);
      // verify that result returned from getBookingId matches up with the expected result
      expect(result).toEqual({ booleanVal: false, item: null });
    });
  });
});
