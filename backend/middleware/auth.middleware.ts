// Necessary modules for handling requests and verifying JWTs
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

// Custom type that extends Express' Request with a user property
interface AuthRequest extends Request {
  user?: any;
}

// Middleware to verify access tokens for protected routes
export const verifyAccessToken = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  // Extract the Authorization header from the request
  const authHeader = req.headers["authorization"];

  // Ensure the header exists and is in the correct format
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Access token missing or invalid" });
  }

  // Remove the "Bearer " prefix to get the token
  const token = authHeader.split(" ")[1];

  // Verify the token using the secret stored in .env file 
  jwt.verify(
    token,
    process.env.ACCESS_TOKEN_SECRET as string,
    (err, decoded) => {
      // If token verification fails, return unauthorized error
      if (err) {
        return res.status(403).json({ message: "Invalid or expired token" });
      }

      // debugging
      console.log("req = ", req);

      // Attach decoded payload (user info) to request object for later use
      (req as AuthRequest).user = decoded;

      // Move on to the next middleware or route handler
      next();
    }
  );
};
