// Import the express framework to create and manage the web server
import express from "express";

// Middleware to parse form data (e.g., from HTML forms or Postman)
// Parses data in x-www-form-urlencoded format and makes it available in req.body
import bodyParser from "body-parser";

// Enables Cross-Origin Resource Sharing, allowing frontend apps on different ports (like React) to make requests to this backend
import cors from "cors";

// postgreSQL module
import pg from "pg";

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

// PostgreSQL client using the pg library
const db = new pg.Client({
  user: process.env.PG_USERNAME,
  // Host where the PostgreSQL server is running
  host: process.env.PG_HOST,
  // access the Media Hub database in postgreSQL,
  database: process.env.PG_DATABASE,
  password: process.env.PG_PASSWORD,
  port: process.env.PG_PORT,
});
// Initiates the connection to the database using the credentials above
db.connect();

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
async function itemtExistsById(id, tableName) {
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
      item: null
    };
  }
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
  // checks to see if client id, event date, event type, & price are not empty strings (status will be pending by default)
  let status = "pending";
  // checks to see that client id is valid (can't create a booking without a client)
  let { booleanVal, item } = await itemtExistsById(req.body.client_id, clientsTable);
  console.log('\'/api/bookings\' POST route: booleanVal = ', booleanVal, '\nitem = ', item);
  if (booleanVal === true) {
    // sends the booking information to the database
    // return necessary response (status 200 & new booking information if successful)
    res.status(200).json({
      message: "testing",
    });
  } else {
    // client with the specified id does not exist
    res.status(404).json({
      message: `\'/api/bookings\' POST route: Can't add this booking; client with ${req.body.client_id} does not exist.`,
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
  // obtain the id from the route parameter
  // reterieve the specific bookings (SELECT * FROM bookings WHERE id = {id})
  // return the booking in a response
});

// Start the Server
// Start listening on the specified port
app.listen(port, () => {
  // Once the server is up and running, log the port number to the console
  console.log(`Server running on port ${port}.`);
});
