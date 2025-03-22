import { Request, Response, NextFunction } from "express"
import jwt from "jsonwebtoken"
import { AuthenticatedRequest } from "../types"
import { AppError } from "./ErrorInternal"
import { validate as uuidValidate } from "uuid"
import { JWT_SECRET } from "../constants/config"

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
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Check if Authorization header exists
    const authHeader = req.header("Authorization")
    if (!authHeader) {
      throw new AppError("No authorization header", 401)
    }

    // Validate Authorization header format
    if (!authHeader.startsWith("Bearer ")) {
      throw new AppError("Invalid authorization format. Use Bearer scheme", 401)
    }

    // Extract token from Authorization header
    const token = req.header("Authorization")?.replace("Bearer ", "")

    if (!token) {
      res.status(401).json({ message: "Authentication required" })
      return
    }

    try {
      // Verify and decode.
      const decoded = jwt.verify(token, JWT_SECRET) as {
        id: string
        email: string
      }

      // Validate decoded token structure
      if (!decoded.id || !decoded.email) {
        throw new AppError("Invalid token payload", 401)
      }

      // Validate UUID format
      if (!uuidValidate(decoded.id)) {
        throw new AppError("Invalid UUID format", 400)
      }

      req.user = decoded
      next()
    } catch (jwtError) {
      if (jwtError instanceof jwt.TokenExpiredError) {
        throw new AppError("Token has expired", 401)
      } else if (jwtError instanceof jwt.JsonWebTokenError) {
        throw new AppError("Invalid token", 401)
      } else {
        throw new AppError("Token validation failed", 401)
      }
    }
  } catch (error) {
    if (error instanceof AppError) {
      res.status(error.status).json({
        status: "error",
        message: error.message,
      })
    } else {
      next(error)
    }
  }
}

// Middleware for specific roles or permissions
// export const requireRole = (role: string) => {
//   return async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
//     try {
//       if (!req.user) {
//         throw new AppError('Authentication required', 401);
//       }

//       // Here you would typically check the user's role from the database
//       const result = await pool.query(
//         'SELECT role FROM users WHERE id = $1',
//         [req.user.id]
//       );

//       if (result.rows.length === 0 || result.rows[0].role !== role) {
//         throw new AppError('Insufficient permissions', 403);
//       }

//       next();
//     } catch (error) {
//       if (error instanceof AppError) {
//         res.status(error.status).json({ 
//           status: 'error',
//           message: error.message 
//         });
//       } else {
//         next(error);
//       }
//     }
//   };
// };
