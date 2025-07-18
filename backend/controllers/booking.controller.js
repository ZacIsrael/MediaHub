// This file is responsible for handling API requests that come in for clients

import { db } from "../database.js";
import { CreateBookingDTO } from "../dtos/booking.dto.js";
import { bookingService } from "../services/booking.service.js";
import { itemExistsById } from "../utils/helpers.js";

// constants for tables in the postgreSQL database
const clientsTable = "clients";
const bookingsTable = "bookings";

// called for (POST /api/bookings/) route
export const createBooking = async (req, res) => {
  // data transfer object (object that will contained the processed request)
  let dto;

  // process the body of the request (see client.dto.js)
  try {
    dto = new CreateBookingDTO(req.body);
  } catch (err) {
    // Error stems from client-side/body of the request
    // see (bookings.dto.js) to see all possible error messages
    res.status(400).json({
      error: `Bad Request (POST /api/bookings/): ${err.message}`,
      stack: err.stack,
    });
  }

  // check if a client with id = dto.client_id exists
  try {
    // checks to see that a client with id = client_id exists (can't create a booking without a client)
    let { booleanVal, item } = await itemExistsById(
      dto.client_id,
      clientsTable,
      db
    );
    console.log("(POST /api/bookings/): booleanVal = ", booleanVal, "\nitem = ", item, "\n");
    if (!booleanVal) {
      // There is no client with id = dto.client_id exists
      res.status(404).json({
        error: `Not Found (POST /api/bookings/): Can't add this booking; client with ${dto.client_id} does not exist.`,
      });
    }
  } catch (err) {
    // Error executing query that checks if client exists
    res.status(500).json({
      error: `Server Error (POST /api/bookings/) while checking client existence: ${err.message}`,
      stack: err.stack,
    });
  }

  // insert booking into the bookings table
  try {
    const result = await bookingService.createBooking(dto);

    // Insertion into the bookings table was successful
    // return necessary response (status 200 & new booking information if successful)
    res.status(201).json({
      message: `Successfully inserted booking into the ${bookingsTable} table`,
      // just incase I need the added booking on the frontend for whatever reason
      booking: result.rows[0],
    });
  } catch (err) {
    // error inserting booking into the database
    res.status(500).json({
      error: `Server Error (POST /api/bookings/): ${err.message}`,
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
