// This file validates and sanitizes the data coming from API requests for users (logging in & registering)

import { CreateUserInterface } from "../types/user.interface";

// class for registering a user
export class CreateUserDTO {
  // declare class properties with their expected types
  email: string;

  password_hash?: string;

  provider: string;

  provider_id?: string;

  constructor({
    email,
    password_hash = "",
    provider,
    provider_id = "",
  }: CreateUserInterface) {
    // check for empty strings
    if (typeof email !== "string" || email.trim().length === 0) {
      throw new Error(
        "Error (POST /api/users/): 'email' field must be a non-empty string."
      );
    }

    // check for empty strings
    if (typeof provider !== "string" || provider.trim().length === 0) {
      throw new Error(
        "Error (POST /api/users/): 'provider' field must be a non-empty string of 'local', 'google', or 'github'."
      );
    }

    // check that provider is either local, google, or github
    if (
      provider !== "local" &&
      provider !== "google" &&
      provider !== "github"
    ) {
      throw new Error(
        "Error (POST /api/users/): 'provider' must 'local', 'google', or 'github'."
      );
    }

    // if the provider is 'local', check for a password_hash
    if (provider === "local") {
        if (typeof password_hash !== "string" || password_hash.trim().length === 0) {
            throw new Error(
              "Error (POST /api/users/): provider is 'local'; hashed password field must be a non-empty string."
            );
          }
    }

    // Assign validated and cleaned values to the DTO instance
    this.email = email;
    this.password_hash = password_hash;
    this.provider = provider;
    this.provider_id = provider_id;
  }
}

