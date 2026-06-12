import type { Response } from "express";
import { Sentry } from "../instrument.js";
import { ApiError } from "../utils/errors.js";
import { logger } from "../utils/logger.js";

/**
 * All controllers extend BaseController. No raw res.json outside
 * these helpers. Errors funnel to Sentry via handleError or the
 * global errorHandler.
 */
export abstract class BaseController {
  protected handleSuccess<T>(res: Response, data: T, status = 200): void {
    res.status(status).json({ data });
  }

  protected handleCreated<T>(res: Response, data: T): void {
    this.handleSuccess(res, data, 201);
  }

  protected handleNoContent(res: Response): void {
    res.status(204).end();
  }

  protected handleError(error: unknown, res: Response, context: string): void {
    const requestId = res.req?.requestId ?? "unknown";

    if (error instanceof ApiError) {
      res.status(error.status).json({
        error: { code: error.code, message: error.message, requestId },
      });
      return;
    }

    Sentry.captureException(error, { tags: { requestId, context } });
    logger.error("controller_error", {
      requestId,
      context,
      error: error instanceof Error ? error.message : String(error),
    });

    res.status(500).json({
      error: { code: "internal_error", message: "Internal server error", requestId },
    });
  }
}
