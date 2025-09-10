// Import the express framework to create and manage the web server
import express from "express";

import {
  createBooking,
  getAllBookings,
  getBookingById,
} from "../controllers/booking.controller";

// Import middleware that checks for a valid JWT access token in Authorization header
// Ensures only authenticated users can access protected routes
import { verifyAccessToken } from "../middleware/auth.middleware";

const router = express.Router();

// creates a new booking and stores it in the "bookings" table
// in MediaHub PostgreSQL database
router.post("/", verifyAccessToken, createBooking);

// retrieves all of the bookings from the "bookings" table
// in MediaHub PostgreSQL database
router.get("/", verifyAccessToken, getAllBookings);

// retrieves a particular booking from the "bookings" table
// in MediaHub PostgreSQL database given its id
router.get("/:id", verifyAccessToken, getBookingById);

export default router;
