// Import the express framework to create and manage the web server
import express from "express";

import { db } from "../database.js";

// Middleware to parse form data (e.g., from HTML forms or Postman)
// Parses data in x-www-form-urlencoded format and makes it available in req.body
import bodyParser from "body-parser";

// Enables Cross-Origin Resource Sharing, allowing frontend apps on different ports (like React) to make requests to this backend
import cors from "cors";

// auxillary functions
import { itemExistsById, isValidPrice } from "../utils/helpers.js";
import {
  createBooking,
  getAllBookings,
  getBookingById,
} from "../controllers/booking.controller.js";

const router = express.Router();

// constants for tables in the postgreSQL database
const clientsTable = "clients";
const bookingsTable = "bookings";

// creates a new booking and stores it in the "bookings" table
// in MediaHub PostgreSQL database
router.post("/", createBooking);

// retrieves all of the bookings from the "bookings" table
// in MediaHub PostgreSQL database
router.get("/", getAllBookings);

// retrieves a particular booking from the "bookings" table
// in MediaHub PostgreSQL database given its id
router.get("/:id", getBookingById);

export default router;
