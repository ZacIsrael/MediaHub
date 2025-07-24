// This file is responsible for handling API requests that come in for the users

import { Request, Response } from "express";
import { CreateUserDTO, LoginUserDTO } from "../dtos/user.dto";
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
    console.log("dto = ", dto);
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
      newUser: result.user,
      token: result.token
    });
  } catch (err: any) {
    res.status(500).json({
      error: `Server Error (POST /api/auth/register): ${err.message}`,
      stack: err.stack,
    });
  }
};

// called for (POST /api/auth/login)
export const loginUser = async (req: Request, res: Response) => {
  // data transfer object (object that will hold the processed request)
  let dto: LoginUserDTO;

  // process the body of the request (see user.dto.ts)
  try {
    dto = new LoginUserDTO(req.body);
  } catch (err: any) {
    // Error stems from client-side/body of the request
    // see (users.dto.js) to see all possible error messages
    return res.status(400).json({
      error: `Bad Request (POST /api/auth/register): ${err.message}`,
      stack: err.stack,
    });
  }

  // log user in
  try {
    const result = await usersService.loginUser(dto);

    if(result instanceof Error){
      // if result is an error, then that means that the login credentials were invalid (see user.service.ts)
      res.status(401).json({
        error: result
      })
    } else {
      res.status(200).json({
        message: `User has been logged in.`,
        // result is a Promise<IUser, string (jwt token)> (see user.service.ts)
        user: result.user,
        token: result.token
      });
    }

  } catch (err: any) {
    // error occured executing the query 
    res.status(500).json({
      error: `Server Error (POST /api/auth/register): ${err.message}`,
      stack: err.stack,
    });
  }
};
