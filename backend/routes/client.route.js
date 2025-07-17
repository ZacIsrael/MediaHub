// Import the express framework to create and manage the web server
import express from "express";

// Middleware to parse form data (e.g., from HTML forms or Postman)
// Parses data in x-www-form-urlencoded format and makes it available in req.body
import bodyParser from "body-parser";

// Enables Cross-Origin Resource Sharing, allowing frontend apps on different ports (like React) to make requests to this backend
import cors from "cors";

import { db } from "../database.js";

const router = express.Router();

// constants for tables in the postgreSQL database
const clientsTable = "clients";
const bookingsTable = "bookings";

// creates a new client and stores them in the "clients" table
// in MediaHub PostgreSQL database
router.post("/", async (req, res) => {
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
router.get("/", async (req, res) => {
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

export default router;
