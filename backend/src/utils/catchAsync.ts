import type { NextFunction, Request, Response } from "express";

type AsyncRequestHandler = (req: Request, res: Response, next: NextFunction) => Promise<void>;

// Express does not forward a rejected promise from an async handler to the
// error middleware on its own — this wrapper does that, so every route can
// just `await` and throw AppError without a repeated try/catch block.
export function catchAsync(handler: AsyncRequestHandler) {
  return (req: Request, res: Response, next: NextFunction): void => {
    handler(req, res, next).catch(next);
  };
}
