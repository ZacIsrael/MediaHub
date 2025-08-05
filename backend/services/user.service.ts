// This file handles the interaction between the API & the users table in the postgreSQL database

import { emit } from "process";
import { db } from "../database";
import { CreateUserDTO, LoginUserDTO } from "../dtos/user.dto";
import { IUser } from "../types/user.interface";
import axios from "axios";

// Import bcrypt to hash passwords securely (automatically adds a salt and hashes it)
import bcrypt from "bcrypt";
import { generateToken } from "../utils/jwt";
// Define the number of salt rounds to be used with bcrypt for hashing passwords
const saltRounds = 10;

// constants for tables in the postgreSQL database
const usersTable = "users";

export const userService = {
  // ts ensure that this dto parameter passed in is of type CreateUserDTO (see users.dto.ts)
  // returns a promise of row(s) of type IUser (see IUser interface user.interface.t)
  async createUser(
    dto: CreateUserDTO
  ): Promise<{ user: IUser; token: string }> {
    // insert a user into the users table with cleaned up parameters passed in
    // from the data transfer object (dto) from user.dto.ts
    // RETURNING * includes the inserted user in the result
    const result = await db.query(
      `INSERT INTO ${usersTable} (email, name, password_hash, provider, provider_id) VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [dto.email, dto.name, dto.password, dto.provider, dto.provider_id]
    );

    const user = result.rows[0];
    // generate token using the user's email & id
    const json_web_token = generateToken({ email: user.email, id: user.id });

    return {
      user: user,
      token: json_web_token,
    };
  },

  // loginUser will go here
  async loginUser(dto: LoginUserDTO): Promise<{ user: IUser; token: string }> {
    let result = { rows: [] }; // Initialize result with a default value
    try {
      // see if the user with specified email exists
      result = await db.query(`SELECT * FROM ${usersTable} WHERE email = $1`, [
        dto.email,
      ]);
      // user was found
      if (result.rows.length === 1) {
        const loggedInUser: IUser = result.rows[0];

        // null check, password_hash is undefined for some reason
        if (!loggedInUser.password_hash) {
          throw new Error("User does not have a password hash.");
        }
        let userHashedPW = loggedInUser.password_hash;

        // compare password entered to user's password in the database
        const isMatch = await bcrypt.compare(dto.password, userHashedPW);
        if (!isMatch) {
          throw new Error("Invalid password.");
        }

        // generate token using the user's email & id
        const json_web_token = generateToken({
          email: loggedInUser.email,
          id: loggedInUser.id,
        });
        return {
          user: loggedInUser,
          // jwt token
          token: json_web_token,
        };
      } else if (result.rows.length === 0) {
        throw new Error(`User with email = ${dto.email} not found`);
      } else {
        throw new Error(`Error: More than 1 user has email = ${dto.email}`);
      }
    } catch (err: any) {
      // error retrieving user with specified email
      throw new Error(err.message);
    }
  },

  // Log in or register a user using a Google access token
  // async oauthLogin(provider: string, access_token: string) {},
};
