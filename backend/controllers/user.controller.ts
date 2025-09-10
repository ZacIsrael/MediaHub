// This file is responsible for handling API requests that come in for the users

import { Request, Response } from "express";
import { CreateUserDTO, LoginUserDTO } from "../dtos/user.dto";
import jwt from "jsonwebtoken";
import { userService } from "../services/user.service";
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
    const result = await userService.createUser(dto);

    res.status(201).json({
      message: `Successfully registered user.`,
      // send the newUser back to the client side (just incase I need it for whatever reason)
      newUser: result.user,
      token: result.token,
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
    const result = await userService.loginUser(dto);

    if (result instanceof Error) {
      // if result is an error, then that means that the login credentials were invalid (see user.service.ts)
      res.status(401).json({
        error: result,
      });
    } else {
      // Build a refresh token (separate secret + longer expiry)
      // Minimal payload: sub = user id (string for consistency)
      const refreshToken = jwt.sign(
        { sub: String((result.user as any).id) },
        process.env.REFRESH_TOKEN_SECRET as string,
        { expiresIn: "1h" }
      );

      // Set refresh token as httpOnly cookie (unreadable by JS)
      // Use secure in prod and scope to your refresh endpoint path
      res.cookie("rt", refreshToken, {
        httpOnly: true,
        sameSite: "strict",
        secure: process.env.NODE_ENV === "production",
        path: "/api/auth/refresh",
      });

      res.status(200).json({
        message: `User has been logged in.`,
        // result is a Promise<IUser, string (jwt token)> (see user.service.ts)
        user: result.user,
        token: result.token,
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

// GET /api/users/refresh -> issues new access token if RT valid
// Frontend calls this when a 401 happens due to AT expiry
export async function refresh(req: Request, res: Response) {
  // Read refresh cookie set during login
  // If missing, user is not “logged in” anymore
  const rt = req.cookies?.rt;
  if (!rt) return res.status(401).json({ message: "Missing refresh token" });

  // Verify refresh token against REFRESH_TOKEN_SECRET
  // On success, mint a fresh short-lived access token
  try {
    const payload = jwt.verify(
      rt,
      process.env.REFRESH_TOKEN_SECRET as string
    ) as { sub: string; tokenVersion?: number };

    // Build a new AT now that RT is valid
    // Keep payload minimal and expiry short
    const newAccessToken = jwt.sign(
      { sub: payload.sub },
      process.env.ACCESS_TOKEN_SECRET as string,
      { expiresIn: "15m" }
    );

    // OPTIONAL: rotate RT cookie here (issue new RT + setCookie again)
    // Rotation reduces replay risk if cookie is ever stolen
    return res.json({ accessToken: newAccessToken });
  } catch {
    // If RT is invalid/expired, force re-login on the client
    // Don’t leak error details; keep message generic
    return res
      .status(401)
      .json({ message: "Invalid or expired refresh token" });
  }
}

export const logoutUser = async (req: Request, res: Response) => {
  // Clear the httpOnly refresh cookie by matching its path
  // This effectively removes server-side “session” capability
  res.clearCookie("rt", { path: "/api/auth/refresh" });

  // Once the front end receives this response, it'll handle everything else
  return res.status(204).end();
};

// POST /api/auth/oauth-login
// export const oauthLoginController = async (req: Request, res: Response) => {};
