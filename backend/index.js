// Import the express framework to create and manage the web server
import express from "express";

// Middleware to parse form data (e.g., from HTML forms or Postman)
// Parses data in x-www-form-urlencoded format and makes it available in req.body
import bodyParser from "body-parser";

// Enables Cross-Origin Resource Sharing, allowing frontend apps on different ports (like React) to make requests to this backend
import cors from "cors";

// postgreSQL module
import pg from "pg";

// MongoDB module
import mongoose from "mongoose";

import { db, connectToPostgres, connectToMongoDB } from "./database.js";

// Loads environment variables from a `.env` file into process.env
// Used for storing sensitive data like database credentials, API keys, etc.
import dotenv from "dotenv";
// Must be called immediately after importing to make env vars available
dotenv.config();

// Create an Express application instance
const app = express();
// Define the port your Express server will listen on
const port = process.env.PORT;



// constants for tables in the postgreSQL database
const clientsTable = "clients";
const bookingsTable = "bookings";

// connect to mongoDB database
connectToMongoDB();

// connect to postgreSQL database 
connectToPostgres();

// ==========================
// Middleware
// ==========================

// Registers middleware that parses URL-encoded data from incoming HTTP requests
// This is especially useful for handling form submissions (e.g., login, registration)
app.use(
  bodyParser.urlencoded({
    // `extended: true` tells body-parser to use the `qs` library, allowing nested objects
    extended: true,
  })
);

// Parses JSON data (from Postman or frontend apps sending JSON)
app.use(bodyParser.json());

// Enables CORS for all incoming requests
// This is necessary if the frontend is running on a different port (e.g., React on localhost:5173)
app.use(cors());

// ==========================
// Auxillary Functions
// ==========================

// Checks to see if an item with specified id exists in a given table
// returns an object with a boolean value and the item (if it exists)
async function itemExistsById(id, tableName) {
  try {
    const result = await db.query(
      `SELECT * FROM ${tableName} WHERE id = ($1)`,
      [id]
    );
    if (result.rowCount === 1) {
      console.log("itemExistsById(): item = ", result.rows[0]);
      return {
        booleanVal: true,
        item: result.rows[0],
      };
    } else if (result.rowCount > 1) {
      console.error(
        `There is more than one item in the ${tableName} table with id = ${id}`
      );
      return {
        booleanVal: false,
        item: null,
      };
    } else {
      console.error(
        `There is no item in the ${tableName} table with id = ${id}`
      );
      return {
        booleanVal: false,
        item: null,
      };
    }
  } catch (err) {
    console.error("Error: ", err.message);
    return {
      booleanVal: false,
      item: null,
    };
  }
}

// checks to see if a number is in the correct format for $
async function isValidPrice(price) {
  // check to see if price is actually a number
  if (isNaN(price)) {
    return false;
  }

  // Convert to string and split into whole/decimal parts
  const [integerPart, decimalPart = ""] = price.toString().split(".");

  // Calculate the total number of digits in the price value (excluding the decimal point and any negative sign)
  // - integerPart: the whole number portion of the price (e.g., "1234" from "1234.56")
  // - decimalPart: the fractional portion after the decimal (e.g., "56")
  // - .replace("-", "") removes the minus sign if it's a negative value (we only want to count digits)
  // - .length on each part counts the number of characters (digits)
  // This is used to ensure the total number of digits (both before and after the decimal)
  // does not exceed the allowed precision of NUMERIC(10,2) in PostgreSQL
  const totalDigits = integerPart.replace("-", "").length + decimalPart.length;

  // returns true if there are 10 or less digits in front of the decimal AND there are no more than 2 digits after the decimal
  return totalDigits <= 10 && decimalPart.length <= 2;
}

// ==========================
// Routes
// ==========================

// Default root route
// If a client sends a GET request to "/", respond with a JSON message
app.get("/", (req, res) => {
  res.status(200).send({
    message: "Hello World.",
  });
});

// creates a new client and stores them in the "clients" table
// in MediaHub PostgreSQL database
app.post("/api/clients", async (req, res) => {
  // retrieves necessary data from the body of the request (name, email, & phone #)
  // console.log("req = ", req);
  console.log("req.body = ", req.body);
  // null check

  // checks to see if the fields in the body exist
  if (req.body.hasOwnProperty("name") && req.body.hasOwnProperty("email")) {
    // checks to see that the name & email are not empty strings (phone # is optional)
    const { name, email } = req.body;
    // ensures that both the name and email are strings
    if (typeof name === "string" && typeof email === "string") {
      if (name.trim().length === 0) {
        res.status(400).json({
          error: `Error (\'/api/clients\' POST route): \'name\' field is an empty string.`,
        });
      }
      if (email.trim().length === 0) {
        res.status(400).json({
          error: `Error (\'/api/clients\' POST route): \'email\' field is an empty string.`,
        });
      }
      // sends the client's information to the database
      try {
        let result;
        // check to see if the phone # exists; checking for it at this point in the code because it's an optional field
        if (req.body.hasOwnProperty("phone")) {
          if (typeof req.body.phone === "string") {
            if (req.body.phone.trim().length === 10) {
              result = await db.query(
                `INSERT INTO ${clientsTable} (name, email, phone) VALUES ($1, $2, $3) RETURNING *`,
                [name, email, req.body.phone]
              );
            } else {
              // phone # must be a string of 10 digits (well characters lol)
              res.status(400).json({
                error: `Error (\'/api/clients\' POST route): \'phone\'field must be 10 digits.`,
              });
            }
          } else {
            // For some reason, phone # is not of type string; throw error
            res.status(400).json({
              error: `Error (\'/api/clients\' POST route): \'phone\'field must be of type \'string\'.`,
            });
          }
        } else {
          result = await db.query(
            `INSERT INTO ${clientsTable} (name, email) VALUES ($1, $2) RETURNING *`,
            [name, email]
          );
        }
        // Check to see if the insertion was successful
        if (result.rowCount === 1) {
          // Insertion into the clients table was successful
          console.log(
            `Successfully inserted client into the ${clientsTable} table: `,
            result.rows[0]
          );
          res.status(201).json({
            message: `Successfully inserted client into the ${clientsTable} table`,
            // just incase I need the added client on the frontend for whatever reason
            client: result.rows[0],
          });
        } else {
          // Insertion into the clients table failed
          console.error("Insert failed");
          res.status(500).json({ error: `Failed to insert client` });
        }
      } catch (err) {
        // error inserting client into the database
        res.status(500).json({
          error: `Error (\'/api/clients\' POST route): ${err.message}`,
          stack: err.stack,
        });
      }

      // return necessary response (status 200 & new client if successful, return error message otherwise)
    } else {
      // For some reason, name & email are not of type string; throw error
      res.status(400).json({
        error: `Error (\'/api/clients\' POST route): \'email\' & \'name\' fields must be of type \'string\'.`,
      });
    }
  } else {
    // client is missing necessary (name & email) fields; throw error
    res.status(400).json({
      error: `Error (\'/api/clients\' POST route): \'email\' & \'name\' fields are NOT in the request.`,
    });
  }
});

// retrieves all of the clients from the "clients" table
// in MediaHub PostgreSQL database
app.get("/api/clients", async (req, res) => {
  try {
    // reterieve all of the clients (SELECT * FROM clients)
    const result = await db.query(`SELECT * FROM ${clientsTable}`);

    // Clients table is empty
    if (result.rowCount === 0) {
      res.status(200).json({
        message: `The ${clientsTable} table is empty`,
        clients: [],
      });
    } else {
      // return the clients in a response
      res.status(200).json({
        clients: result.rows,
      });
    }
  } catch (err) {
    // error retrieving all clients
    res.status(500).json({
      error: `Error (\'/api/clients\' GET route): ${err.message}`,
      stack: err.stack,
    });
  }
});

// creates a new booking and stores them it the "bookings" table
// in MediaHub PostgreSQL database
app.post("/api/bookings", async (req, res) => {
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

    // checks to see that a cleint with id = client_id exists (can't create a booking without a client)
    let { booleanVal, item } = await itemExistsById(client_id, clientsTable);

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
app.get("/api/bookings", async (req, res) => {
  try {
    // reterieve all of the bookings (SELECT * FROM bookings)
    const result = await db.query(`SELECT * FROM ${bookingsTable}`);

    // Bookings table is empty
    if (result.rowCount === 0) {
      res.status(200).json({
        message: `The ${bookingsTable} table is empty`,
        bookings: [],
      });
    } else {
      // return the bookings in a response
      res.status(200).json({
        bookings: result.rows,
      });
    }
  } catch (err) {
    // error retrieving all clients
    res.status(500).json({
      error: `Error (\'/api/bookings\' GET route): ${err.message}`,
      stack: err.stack,
    });
  }
});

// retrieves a particular booking from the "bookings" table
// in MediaHub PostgreSQL database given its id
app.get("/api/bookings/:id", async (req, res) => {
  // obtain the booking's id from the route parameter
  const { id } = req.params;
  // reterieve the specific booking
  const { booleanVal, item } = await itemExistsById(id, bookingsTable);
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
});

// Start the Server
// Start listening on the specified port
app.listen(port, () => {
  // Once the server is up and running, log the port number to the console
  console.log(`Server running on port ${port}.`);
});
