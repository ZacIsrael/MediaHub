// Import the express framework to create and manage the web server
import express from "express";
import { createUser } from "../controllers/user.controller";

const router = express.Router();

// registers a user & stores it in the postgreSQL database
router.post("/register", createUser);

export default router;