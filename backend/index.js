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

// creates a new clients and stores them in the "clients" table 
// in media-hub-pro PostgreSQL database
app.post("/api/clients", async (req, res) => {
  // retrieves necessary data from the body of the request (name, email, & phone #)

  // checks to see if the fields in the body exist 

  // checks to see that the name & email are not empty strings (phone # is optional)

  // sends the client's information to the data

  // return necessary response (status 200 & new client if successful, return error message otherwise)
})

// Start the Server
// Start listening on the specified port
app.listen(port, () => {
  // Once the server is up and running, log the port number to the console
  console.log(`Server running on port ${port}.`);
});
