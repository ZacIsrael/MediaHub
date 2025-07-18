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
  getAllBookings,
  getBookingById,
} from "../controllers/booking.controller.js";

const router = express.Router();

// constants for tables in the postgreSQL database
const clientsTable = "clients";
const bookingsTable = "bookings";

// creates a new booking and stores it in the "bookings" table
// in MediaHub PostgreSQL database
router.post("/", async (req, res) => {
  // Retrieves necessary data from the body of the request (client id (references an id in the client table),
  // event date, event type, & price)
  console.log("'/api/bookings' POST route: req.body = ", req.body);
  // checks to see if the fields in the body exist
  if (
    req.body.hasOwnProperty("client_id") &&
    req.body.hasOwnProperty("event_date") &&
    req.body.hasOwnProperty("event_type") &&
    req.body.hasOwnProperty("price")
  ) {
    let { client_id, event_date, event_type, price } = req.body;

    // checks to see that a client with id = client_id exists (can't create a booking without a client)
    let { booleanVal, item } = await itemExistsById(
      client_id,
      clientsTable,
      db
    );

    if (booleanVal === true) {
      // checks to see if event date & event type are strings
      if (typeof event_date === "string" && typeof event_type === "string") {
        // checks to see if event date & event type are not empty strings
        if (event_date.trim().length === 0) {
          res.status(400).json({
            error: `Error (\'/api/bookings\' POST route): \'event_date\' field is an empty string.`,
          });
        }
        if (event_type.trim().length === 0) {
          res.status(400).json({
            error: `Error (\'/api/bookings\' POST route): \'event_type\' field is an empty string.`,
          });
        }

        // check to see if the price is valid
        if (!isValidPrice(price)) {
          res.status(400).json({
            error: `Error (\'/api/bookings\' POST route): \'price\' must be a valid dollar amount. Re-enter it with no more than 10 digits in front of the decimal and only 2 digits after the decimal.`,
          });
        }

        // check to see if the date is valid
        // - construct a JavaScript Date object from event_date string
        // - .getTime() returns timestamp in milliseconds if the date is valid,
        // or NaN if the date is invalid or malformed (e.g., "not-a-date")
        // - isNaN(...) returns true if the result is NOT a number, meaning the date is invalid
        // - Negate that with !isNaN(...) so:
        //     → isValid === true  → the date is valid and safe to insert
        //     → isValid === false → the date is invalid and should trigger a 400 error
        const isValid = !isNaN(new Date(event_date).getTime());
        if (isValid) {
          // send the booking information to the database
          const dateToBeAdded = new Date(event_date);
          // status will be pending by default
          let status = "pending";
          try {
            const result = await db.query(
              `INSERT INTO ${bookingsTable} (client_id, event_date, event_type, price, status) VALUES ($1, $2, $3, $4, $5) RETURNING *`,
              [client_id, dateToBeAdded, event_type, price, status]
            );

            // Check to see if the insertion was successful
            if (result.rowCount === 1) {
              // Insertion into the bookings table was successful
              console.log(
                `Successfully inserted booking into the ${bookingsTable} table: `,
                result.rows[0]
              );
              // return necessary response (status 200 & new booking information if successful)
              res.status(201).json({
                message: `Successfully inserted booking into the ${bookingsTable} table`,
                // just incase I need the added booking on the frontend for whatever reason
                client: result.rows[0],
              });
            } else {
              // Insertion into the bookings table failed
              console.error("Insert failed");
              res.status(500).json({ error: `Failed to insert booking` });
            }
          } catch (err) {
            // error inserting booking into the database
            res.status(500).json({
              error: `Error (\'/api/bookings\' POST route): ${err.message}`,
              stack: err.stack,
            });
          }
        } else {
          // event_date is not in the correct format
          res.status(400).json({
            error: `Error (\'/api/bookings\' POST route): \'event_date\' string is incorrectly formatted. Please use ISO format like \'YYYY-MM-DDTHH:mm:ssZ\'`,
          });
        }
      } else {
        // event_date OR event_type are NOT of type string
        res.status(400).json({
          error: `Error (\'/api/bookings\' POST route): \'event_date\' & \'event_type\' must be of type \'string\'.`,
        });
      }
    } else {
      // client with the specified id does not exist
      res.status(404).json({
        message: `\'/api/bookings\' POST route: Can't add this booking; client with ${client_id} does not exist.`,
      });
    }
  } else {
    // booking is missing necessary (client_id, event_date, event_type, & price) fields; throw error
    res.status(400).json({
      error: `Error (\'/api/bookings\' POST route): At least 1 of the following mandatory fields are not in the request:\n- \'client_id\' \n- \'event_date\' \n- \'event_type\' \n- \'price\'`,
    });
  }
});

// retrieves all of the bookings from the "bookings" table
// in MediaHub PostgreSQL database
router.get("/", getAllBookings);

// retrieves a particular booking from the "bookings" table
// in MediaHub PostgreSQL database given its id
router.get("/:id", getBookingById);

export default router;
