import { Request, Response, NextFunction } from "express"
import jwt from "jsonwebtoken"
import { AuthRequest } from "../types/index.js"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"

/**
 * Middleware to authenticate a user using a JWT token.
 * 
 * @param req - The request object, extended to include user information.
 * @param res - The response object.
 * @param next - The next middleware function in the stack.
 * @returns 
 * 
 * @throws Will respond with a 401 status code if the token is missing or invalid.
 */
export const auth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "")

    if (!token) {
      res.status(401).json({ message: "Authentication required" })
      return
    }

    const decoded = jwt.verify(token, JWT_SECRET) as {
      id: string
      email: string
    }
    req.user = decoded
    next()
  } catch (error) {
    res.status(401).json({ message: "Invalid token" })
  }
}
