import { Request } from "express"
import { IMessages } from "./Base"

/**
 * Extended Request interface to include authenticated user information.
 */
export interface AuthenticatedRequest extends Request {
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
    }
  | IMessages

/**
 * Response Data Transfer Object for user login.
 */
export type LoginResponseDto =
  | {
      user: {
        id: string
        name: string
        email: string
      }
      token: string
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
