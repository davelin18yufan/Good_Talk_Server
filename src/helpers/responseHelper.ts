import { Response } from "express"

/**
 * Sends a standardized error response.
 *
 * @param res - The Express response object.
 * @param statusCode - The HTTP status code to send.(error)
 * @param message - The error message to include in the response.
 * @param error - Optional error details.
 */
export const sendErrorResponse = (
  res: Response,
  statusCode: number = 500,
  message: string,
  error?: unknown
): void => {
  res.status(statusCode).json({
    success: false,
    message,
    error: error instanceof Error ? error.message : error,
  })
}
