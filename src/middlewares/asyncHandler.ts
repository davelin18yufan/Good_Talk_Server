import { Request, Response, NextFunction } from "express"

type AsyncRequestHandler<P = any> = (
  req: Request<P>,
  res: Response,
  next: NextFunction
) => Promise<void>

export const asyncHandler =
  <P = any>(fn: AsyncRequestHandler<P>) =>
  (req: Request<P>, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch(next)
  }
