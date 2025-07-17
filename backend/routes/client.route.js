// Import the express framework to create and manage the web server
import express from "express";

// Middleware to parse form data (e.g., from HTML forms or Postman)
// Parses data in x-www-form-urlencoded format and makes it available in req.body
import bodyParser from "body-parser";

// Enables Cross-Origin Resource Sharing, allowing frontend apps on different ports (like React) to make requests to this backend
import cors from "cors";

import { db } from "../database.js";
import {
  createClient,
  getAllClients,
} from "../controllers/client.controller.js";

const router = express.Router();

// constants for tables in the postgreSQL database
const clientsTable = "clients";
const bookingsTable = "bookings";

// creates a new client and stores them in the "clients" table
// in MediaHub PostgreSQL database
router.post("/", createClient);

// retrieves all of the clients from the "clients" table
// in MediaHub PostgreSQL database
router.get("/", getAllClients);

export default router;
