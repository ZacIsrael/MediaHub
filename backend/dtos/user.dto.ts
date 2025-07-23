// This file validates and sanitizes the data coming from API requests for users (logging in & registering)

import {
  CreateUserInterface,
  LoginUserInterface,
} from "../types/user.interface";

// Import bcrypt to hash passwords securely (automatically adds a salt and hashes it)
import bcrypt from "bcrypt";
// Define the number of salt rounds to be used with bcrypt for hashing passwords
const saltRounds = 10;

// class for registering a user
export class CreateUserDTO {
  // declare class properties with their expected types
  email: string;

  name: string;

  password?: string;

  provider: string;

  provider_id?: string;

  constructor({
    email,
    name,
    password = "",
    provider,
    provider_id = "",
  }: CreateUserInterface) {
    // check for empty strings
    if (typeof email !== "string" || email.trim().length === 0) {
      throw new Error(
        "Error (POST /api/auth/register): 'email' field must be a non-empty string."
      );
    }

    // check for empty strings
    if (typeof provider !== "string" || provider.trim().length === 0) {
      throw new Error(
        "Error (POST /api/auth/register): 'provider' field must be a non-empty string of 'local', 'google', or 'github'."
      );
    }

    // check for empty strings
    if (typeof name !== "string" || name.trim().length === 0) {
      throw new Error(
        "Error (POST /api/auth/register): 'provider' field must be a non-empty string of 'local', 'google', or 'github'."
      );
    }

    // Check to see if the name is valid (not less than 2 letters long & only contains
    // letters (if someone is the 2nd, 3rd, etc.), numbers, spaces, apostrophes, or hyphens)
    if (
      !/^[a-zA-Z0-9\s'-]+$/.test(name.trim()) ||
      name.trim().length < 2 // too short
    ) {
      throw new Error(
        "Error (POST /api/auth/register): 'name' must be at least 2 characters long and can only contain letters, numbers, spaces, apostrophes, or hyphens."
      );
    }

    // check that provider is either local, google, or github
    if (
      provider.trim().toLowerCase() !== "local" &&
      provider.trim().toLowerCase() !== "google" &&
      provider.trim().toLowerCase() !== "github"
    ) {
      throw new Error(
        "Error (POST /api/users/): 'provider' must be 'local', 'google', or 'github'."
      );
    }

    let hashedPassword;
    // if the provider is 'local', check for a password
    if (provider === "local") {
      if (typeof password !== "string" || password.trim().length === 0) {
        throw new Error(
          "Error (POST /api/users/): provider is 'local'; hashed password field must be a non-empty string."
        );
      }
    }

    // Assign validated and cleaned values to the DTO instance
    // all of the emails will be stored in the database as lowercase
    this.email = email.trim().toLowerCase();
    this.name = name.trim();
    this.password = password;
    this.provider = provider.trim().toLowerCase();
    this.provider_id = provider_id;
  }

  // async function that hashes the password; will be called in the user controller
  async hashPassword(): Promise<void> {
    // hash password using bcrypt
    // - password: the plain text password input from the user
    // - saltRounds: the cost factor that determines how computationally expensive the hashing process is
    //    • Higher numbers are more secure but take more time (default recommendation is 10)
    //    • bcrypt internally generates a random salt for when you provided a saltRounds number

    const hashedPassword = await bcrypt.hash(this.password || "", saltRounds);
    this.password = hashedPassword;
  }
}

// class for logging a user in will go here
export class LoginUserDTO {
  // declare class properties with their expected types
  email: string;

  password: string;

  provider: string;

  constructor({ email, password, provider }: LoginUserInterface) {
    // check for empty strings
    if (typeof email !== "string" || email.trim().length === 0) {
      throw new Error(
        "Error (POST /api/auth/register): 'email' field must be a non-empty string."
      );
    }

    // check for empty strings
    if (typeof provider !== "string" || provider.trim().length === 0) {
      throw new Error(
        "Error (POST /api/auth/register): 'provider' field must be a non-empty string of 'local', 'google', or 'github'."
      );
    }

    if (
      provider.trim().toLowerCase() !== "local" &&
      provider.trim().toLowerCase() !== "google" &&
      provider.trim().toLowerCase() !== "github"
    ) {
      throw new Error(
        "Error (POST /api/auth/register): 'provider' field must be 'local', 'google', or 'github'."
      );
    }

    // if the provider is 'local', check for a password
    if (provider === "local") {
      if (typeof password !== "string" || password.trim().length === 0) {
        throw new Error(
          "Error (POST /api/users/): provider is 'local'; hashed password field must be a non-empty string."
        );
      }
    }

    this.email = email.trim().toLowerCase();
    this.password = password.trim();
    this.provider = provider.trim().toLowerCase();
  }
}
