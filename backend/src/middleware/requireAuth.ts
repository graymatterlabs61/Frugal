import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { config } from "../config/unifiedConfig.js";
import { UnauthorizedError } from "../utils/errors.js";

const jwtPayloadSchema = z.object({
  sub: z.string().uuid(),
});

/**
 * Bearer JWT gate. Sets req.userId on success.
 * Every protected route must pass through this — no exceptions.
 */
export function requireAuth(req: Request, _res: Response, next: NextFunction): void {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    next(new UnauthorizedError());
    return;
  }

  const token = header.slice("Bearer ".length);
  try {
    const decoded = jwt.verify(token, config.auth.jwtSecret);
    const payload = jwtPayloadSchema.parse(decoded);
    req.userId = payload.sub;
    next();
  } catch {
    next(new UnauthorizedError("Invalid or expired token"));
  }
}

/** Helper for controllers: returns the authenticated userId or throws. */
export function getUserId(req: Request): string {
  if (!req.userId) throw new UnauthorizedError();
  return req.userId;
}
