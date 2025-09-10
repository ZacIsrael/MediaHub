// Router type helps TypeScript understand what kind of object this app is creating.
import { Router } from "express";

import { createClient, getAllClients } from "../controllers/client.controller";

// Import middleware that checks for a valid JWT access token in Authorization header  
// Ensures only authenticated users can access protected routes
import { verifyAccessToken } from "../middleware/auth.middleware";

// Explicitly define the type of the router as an Express Router instance.
const router: Router = Router();

// constants for tables in the postgreSQL database
const clientsTable = "clients";
const bookingsTable = "bookings";

console.log("🚨 POST /api/clients. Reached client.route.ts.\n");
// creates a new client and stores them in the "clients" table
// in MediaHub PostgreSQL database
router.post("/", verifyAccessToken, createClient);

// retrieves all of the clients from the "clients" table
// in MediaHub PostgreSQL database
router.get("/", verifyAccessToken, getAllClients);

export default router;
