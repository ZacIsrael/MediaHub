// Router type helps TypeScript understand what kind of object this app is creating.
import { Router } from "express";

import { createClient, getAllClients } from "../controllers/client.controller";

// Explicitly define the type of the router as an Express Router instance.
const router: Router = Router();

// constants for tables in the postgreSQL database
const clientsTable = "clients";
const bookingsTable = "bookings";

console.log("🚨 POST /api/clients. Reached client.route.ts.\n");
// creates a new client and stores them in the "clients" table
// in MediaHub PostgreSQL database
router.post("/", createClient);

// retrieves all of the clients from the "clients" table
// in MediaHub PostgreSQL database
router.get("/", getAllClients);

export default router;
