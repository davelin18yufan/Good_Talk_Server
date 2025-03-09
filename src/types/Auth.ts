import { Request } from "express"
import { IMessages } from "./Base"

/**
 * Extended Request interface to include authenticated user information.
 * 
 * @template P - Type for route parameters.
 * @template B - Type for request body.
 * @template Q - Type for query parameters.
 * @extends {Request<P, any, B, Q>}
 * @property {Object} [user] - Authenticated user information.
 * @property {string} user.id - User's unique identifier.
 * @property {string} user.email - User's email address.
 */
export interface AuthenticatedRequest<
  P = any, // router
  B = any, // request
  Q = any // params
> extends Request<P, any, B, Q> {
  user?: {
    id: string
    email: string
  }
}

/**
 * Data Transfer Object for user registration request.
 */
export interface RegisterRequestDto {
  username: string
  email: string
  password: string
}

/**
 * Data Transfer Object for user login request.
 */
export interface LoginRequestDto {
  email: string
  password: string
}

/**
 * Response Data Transfer Object for user registration.
 */
export type RegisterResponseDto =
  | {
      user: {
        id: string
        username: string
        email: string
      }
      token: string
      success: boolean
    }
  | IMessages

/**
 * Response Data Transfer Object for user login.
 */
export type LoginResponseDto =
  | {
      user: {
        id: string
        username: string
        email: string
      }
      token: string
      success: boolean
    }
  | IMessages

/**
 * Payload structure for JWT token.
 */
export interface JwtPayloadDto {
  id: string
  email: string
}

/**
 * Response Data Transfer Object for refreshing token.
 */
export type RefreshTokenResponseDto =
  | {
      token: string
    }
  | IMessages
