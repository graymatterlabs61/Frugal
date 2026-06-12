import type { NextFunction, Request, Response } from "express";
import { randomUUID } from "node:crypto";
import { ZodError } from "zod";
import { Sentry } from "../instrument.js";
import { ApiError } from "../utils/errors.js";
import { logger } from "../utils/logger.js";

/** Attaches a correlation ID to every request. */
export function requestId(req: Request, _res: Response, next: NextFunction): void {
  req.requestId = randomUUID();
  next();
}

/**
 * Last-resort error boundary. Typed ApiErrors map to their status;
 * ZodErrors map to 422; everything else is a 500 captured in Sentry.
 * Messages never echo internals, SQL, or stack traces.
 */
export function errorHandler(
  err: unknown,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  const reqId = req.requestId ?? "unknown";

  if (err instanceof ApiError) {
    res.status(err.status).json({
      error: { code: err.code, message: err.message, requestId: reqId },
    });
    return;
  }

  if (err instanceof ZodError) {
    res.status(422).json({
      error: {
        code: "validation_error",
        message: err.issues
          .map((i) => `${i.path.join(".") || "body"}: ${i.message}`)
          .join("; "),
        requestId: reqId,
      },
    });
    return;
  }

  Sentry.captureException(err, { tags: { requestId: reqId } });
  logger.error("unhandled_error", {
    requestId: reqId,
    path: req.path,
    method: req.method,
    error: err instanceof Error ? err.message : String(err),
  });

  res.status(500).json({
    error: { code: "internal_error", message: "Internal server error", requestId: reqId },
  });
}
