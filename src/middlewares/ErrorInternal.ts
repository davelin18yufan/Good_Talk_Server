import { Request, Response, NextFunction } from "express"

export class AppError extends Error {
  status: number

  constructor(message: string, status: number = 500) {
    super(message)
    this.status = status
    Error.captureStackTrace(this, this.constructor)
  }
}

export const ErrorInternal = (
  err: AppError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  console.error(err.stack)

  const status = err.status || 500
  const message = err.message || "Server Internal Error!"

  res.status(status).json({
    status: "error",
    message,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  })
}
