import type { NextFunction, Request, RequestHandler, Response } from "express";

/**
 * Wraps async route handlers so rejected promises reach the error
 * middleware instead of becoming unhandled rejections.
 */
export function asyncErrorWrapper(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>
): RequestHandler {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
}
