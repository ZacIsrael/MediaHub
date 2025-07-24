// JWT library
import jwt, { SignOptions } from "jsonwebtoken";

// Loads environment variables from a `.env` file into process.env
// Used for storing sensitive data like database credentials, JWT, API keys, etc.
import dotenv from "dotenv";
// Must be called immediately after importing to make env vars available
dotenv.config();

// ensures that JWT_SECRET is a string
const JWT_SECRET: jwt.Secret = process.env.JWT_SECRET!;

// how long a jwt is valid for (1d, 45m, 3h, etc.)
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN;

// check if JWT_SECRET exists (avoid runtime errors)
if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is not defined in .env file.");
}
// payload parameter contains the data that will be encoded (the user)
// returns a JWT (string)
export function generateToken(payload: object): string {
  const options: SignOptions = {
    // How long this JWT will last (1h, 30, 5d, etc.)
    // If the JWT_EXPIRES_IN hasn't been set,
    // set default expiration time to an hour upon creation
    // expiresIn: JWT_EXPIRES_IN || "1h",
    expiresIn: "1h",
  };
  return jwt.sign(payload, JWT_SECRET, options);
}

// parameter is a JWT
// returns the decoded object (the user in this case) that was generated in generateToken()
export function verifyToken(token: string): any {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (err) {
    throw new Error("Invalid or expired token.");
  }
}
