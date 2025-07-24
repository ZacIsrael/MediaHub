// Import the express framework to create and manage the web server
import express from "express";
import { createUser, loginUser } from "../controllers/user.controller";

const router = express.Router();

// registers a user & stores it in the postgreSQL database
router.post("/register", createUser);

// logs in a user
router.post("/login", loginUser);

export default router;