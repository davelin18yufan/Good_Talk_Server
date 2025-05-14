import type { Response } from "express"

export const ErrorNotFound = (res: Response): void => {
  res.status(404).json({
    status: "error",
    message: "Not Found!",
  })
}
