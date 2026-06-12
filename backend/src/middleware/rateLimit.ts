import type { NextFunction, Request, Response } from "express";
import { authRatelimit } from "../db/redis.js";

export function authRateLimit(req: Request, res: Response, next: NextFunction): void {
  const ip = req.ip ?? req.socket.remoteAddress ?? "unknown";
  authRatelimit
    .limit(ip)
    .then(({ success }) => {
      if (!success) {
        res.status(429).json({
          error: {
            code: "rate_limited",
            message: "Too many requests. Please try again later.",
          },
        });
        return;
      }
      next();
    })
    .catch(() => {
      // Redis unavailable — fail open so auth still works
      next();
    });
}
