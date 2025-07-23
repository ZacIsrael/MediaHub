// This file is responsible for handling API requests that come in for the users

import { Request, Response } from "express";
import { CreateUserDTO } from "../dtos/user.dto";
import { usersService } from "../services/user.service";
// constant(s) for the necessary table(s) in the postgreSQL database
const usersTable = "users";

// called for (POST /api/auth/register)
export const createUser = async (req: Request, res: Response) => {
  // data transfer object (object that will hold the processed request)
  let dto: CreateUserDTO;

  // process the body of the request (see user.dto.ts)
  try {
    dto = new CreateUserDTO(req.body);
    // hash the password
    await dto.hashPassword();
    console.log('dto = ', dto);
  } catch (err: any) {
    // Error stems from client-side/body of the request
    // see (users.dto.js) to see all possible error messages
    return res.status(400).json({
      error: `Bad Request (POST /api/auth/register): ${err.message}`,
      stack: err.stack,
    });
  }

  // register/store the user in the users table in postgreSQL
  try {
    const result = await usersService.createUser(dto);

    res.status(201).json({
      message: `Successfully registered user.`,
      // send the newUser back to the client side (just incase I need it for whatever reason)
      newUser: result.rows[0],
    });
  } catch (err: any) {
    res.status(500).json({
      error: `Server Error (POST /api/auth/register): ${err.message}`,
      stack: err.stack,
    });
  }
};

// called for (POST /api/auth/login)
