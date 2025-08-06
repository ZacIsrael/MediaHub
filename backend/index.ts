// Import the express framework to create and manage the web server
import express, { Application, Request, Response } from "express";

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
// postgreSQL
import clientsRouter from "./routes/client.route";
import bookingsRouter from "./routes/booking.route";
import usersRouter from "./routes/user.route";
// mongoDB
import socialPostsRouter from "./routes/socialPost.route";
import videosRouter from "./routes/video.route";

import { db, connectToPostgres, connectToMongoDB } from "./database";

// Loads environment variables from a `.env` file into process.env
// Used for storing sensitive data like database credentials, API keys, etc.
import dotenv from "dotenv";
// Must be called immediately after importing to make env vars available
dotenv.config();

// Create an Express application instance
const app: Application = express();
// Define the port your Express server will listen on
const port: number = parseInt(process.env.PORT || "3000", 10);

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

// debug
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  console.log("req.url = ", req.url);
  console.log("Headers:", req.headers);
  console.log("Body:", req.body);
  next();
});

console.log("INDEX FILE RAN");

// mount the routes
app.use("/api/clients", clientsRouter);
app.use("/api/bookings", bookingsRouter);
app.use("/api/social-posts", socialPostsRouter);
app.use("/api/videos", videosRouter);
app.use("/api/auth", usersRouter);

// test route
app.post("/api/post-test", (req, res): void => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  console.log("req.url = ", req.url);
  console.log("Headers:", req.headers);
  console.log("Body:", req.body);
  res.status(200).json({
    message: 'POST works'
  });
});

// Healthcheck route to verify backend is running
app.get("/api/healthcheck", (_, res) => {
  res.send("I'm alive 🚀");
});


// dfeault GET route
app.get("/", (req: Request, res: Response): void => {
  res.send("Welcome to the Media Hub API!");
});

// Start the Server
// Start listening on the specified port
app.listen(port, () => {
  // Once the server is up and running, log the port number to the console
  console.log(`Server running on port ${port}.`);
});
