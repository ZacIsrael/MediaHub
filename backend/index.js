// ==========================
// Import Dependencies
// ==========================

// Import the express framework to create and manage the web server
import express from "express";

// Middleware to parse form data (e.g., from HTML forms or Postman)
// Parses data in x-www-form-urlencoded format and makes it available in req.body
import bodyParser from "body-parser";

// Enables Cross-Origin Resource Sharing, allowing frontend apps on different ports (like React) to make requests to this backend
import cors from "cors";

// Loads environment variables from a `.env` file into process.env
// Used for storing sensitive data like database credentials, API keys, etc.
import dotenv from "dotenv";
// Must be called immediately after importing to make env vars available
dotenv.config(); 

// ==========================
// Configuration
// ==========================

// Define the port your Express server will listen on
const port = process.env.PORT;

// ==========================
// Initialize the Express App
// ==========================

// Create an Express application instance
const app = express();

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

// Enables CORS for all incoming requests
// This is necessary if the frontend is running on a different port (e.g., React on localhost:5173)
app.use(cors());

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
// in media-hub-pro PostgreSQL database
app.post("/api/clients", async (req, res) => {
  // retrieves necessary data from the body of the request (name, email, & phone #)

  // checks to see if the fields in the body exist 

  // checks to see that the name & email are not empty strings (phone # is optional)

  // sends the client's information to the database

  // return necessary response (status 200 & new client if successful, return error message otherwise)
});

// retrieves all of the clients from the "clients" table 
// in media-hub-pro PostgreSQL database
app.get("/api/clients", async (req, res) => {
  // reterieve all of the clients (SELECT * FROM clients)

  // return the clients in a response
});

// creates a new booking and stores them it the "bookings" table 
// in media-hub-pro PostgreSQL database
app.post("/api/bookings", async (req, res) => {
  // retrieves necessary data from the body of the request (client id (references an id in the client table), 
  // event date, event type, price, status ('pending', 'confirmed', 'completed', 'cancelled'), )

  // checks to see if the fields in the body exist 

  // checks to see if client id, event date, event type, & price are not empty strings (status will be pending by default)

  // checks to see that client id is valid (can't create a booking without a client)

  // sends the bookinginformation to the database

  // return necessary response (status 200 & new booking information if successful, return error message otherwise)

});

// retrieves all of the bookings from the "bookings" table 
// in media-hub-pro PostgreSQL database
app.get("/api/clients", async (req, res) => {
  // reterieve all of the bookings (SELECT * FROM bookings)

  // return the bookings in a response
});

// retrieves a particular booking from the "bookings" table 
// in media-hub-pro PostgreSQL database given its id 
app.get("/api/clients/:id", async (req, res) => {
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
