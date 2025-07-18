// This file is responsible for handling API requests that come in for clients

import { CreateBookingDTO } from "../dtos/booking.dto.js";
import { bookingService } from "../services/booking.service.js";

// constants for tables in the postgreSQL database
const clientsTable = "clients";
const bookingsTable = "bookings";

// called for (POST /api/bookings/) route
export const createBooking = async (req, res) => {
  // data transfer object (object that will contained the processed request)
  let dto;

  // process the body of the request (see client.dto.js)
  try {
    dto = CreateBookingDTO(req.body);
  } catch (err) {
    // Error stems from client-side/body of the request
    // see (bookings.dto.js) to see all possible error messages
    res.status(400).json({
      error: `Bad Request (POST /api/bookings/): ${err.message}`,
      stack: err.stack,
    });
  }
};

// called for (GET /api/bookings/) route
export const getAllBookings = async (req, res) => {
  try {
    // retreive all bookings
    const bookingResults = await bookingService.getAllBookings();

    res.status(200).json({
      message:
        // different message is returned in the response depending on if there are any bookings in the database
        bookingResults.rows.length === 0
          ? `The ${bookingsTable} table is empty`
          : `Successfully retreived all bookings from the ${bookingsTable} table in the postgreSQL database.`,
      // return the clients in the repsonse
      bookings: bookingResults.rows,
    });
  } catch (err) {
    // error occured when retreiving all bookings from the bookings table in the postgreSQL database
    res.status(500).json({
      error: `Server Error (GET /api/bookings/): ${err.message}`,
      stack: err.stack,
    });
  }
};

// called for (GET /api/bookings/:id) route
export const getBookingById = async (req, res) => {
  // obtain the booking's id from the route parameter
  const { id } = req.params;
  try {
    // reterieve the specific booking
    const { booleanVal, item } = await bookingService.getBookingById(id);
    if (booleanVal) {
      // return the booking in a response
      res.status(200).json({
        booking: item,
      });
    } else {
      res.status(200).json({
        message: `There is no booking with id = ${id} in the ${bookingsTable} table.`,
        booking: item,
      });
    }
  } catch (err) {
    // error occured when retreiving bookings with id = id
    res.status(500).json({
      error: `Server Error (GET /api/bookings/:id): ${err.message}`,
      stack: err.stack,
    });
  }
};
