// Import the express framework to create and manage the web server
import express from "express";
import {
  createUser,
  loginUser,
  logoutUser
//   oauthLoginController,
} from "../controllers/user.controller";

const router = express.Router();

// registers a user & stores it in the postgreSQL database
router.post("/register", createUser);

// logs in a user
router.post("/login", loginUser);

// logs a user out
router.post("/logout", logoutUser);

// Log in or register using Google access token (for Postman testing)
// router.post("/oauth-login", oauthLoginController);

export default router;
