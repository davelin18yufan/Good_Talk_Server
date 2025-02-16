import { Request, Response, NextFunction } from "express"

export const ErrorNotFound = (request: Request, response: Response, next: NextFunction) => {
  return response.status(404).json({
    status: "error",
    message: `Route not found - ${request.url}`,
  });
}