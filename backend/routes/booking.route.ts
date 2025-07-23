// Import the express framework to create and manage the web server
import express from "express";

import {
  createBooking,
  getAllBookings,
  getBookingById,
} from "../controllers/booking.controller";

const router = express.Router();

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
