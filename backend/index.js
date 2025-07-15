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

// import routes
import clientsRouter from "./routes/clients.js";
import bookingsRouter from "./routes/bookings.js";

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

// routes
app.use("/api/clients", clientsRouter);
app.use("/api/bookings", bookingsRouter);

// Start the Server
// Start listening on the specified port
app.listen(port, () => {
  // Once the server is up and running, log the port number to the console
  console.log(`Server running on port ${port}.`);
});
