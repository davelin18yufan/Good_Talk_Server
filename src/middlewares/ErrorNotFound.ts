import { Request, Response, NextFunction } from "express"

export const ErrorNotFound = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  res.status(404).json({
    status: "error",
    message: "Not Found!",
  })
}
