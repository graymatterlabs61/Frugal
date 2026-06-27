import type { Request, Response, NextFunction } from 'express';
import * as Sentry from '@sentry/node';
import { ZodError } from 'zod';
import { isAppError, ValidationError } from '@/utils/errors';
import { logger } from '@/utils/logger';

interface ErrorResponse {
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}

export function errorHandler(
  err: unknown,
  req: Request,
  res: Response,
  _next: NextFunction,
): void {
  // Zod validation errors → 400
  if (err instanceof ZodError) {
    const validationError = new ValidationError('Validation failed', err.flatten());
    res.status(400).json(formatError(validationError));
    return;
  }

  // Known AppError subclasses
  if (isAppError(err)) {
    if (err.statusCode >= 500) {
      Sentry.captureException(err);
      logger.error({ err, req: { method: req.method, url: req.url } }, err.message);
    }
    res.status(err.statusCode).json(formatError(err));
    return;
  }

  // Unknown errors → 500
  Sentry.captureException(err);
  logger.error({ err, req: { method: req.method, url: req.url } }, 'Unhandled error');
  res.status(500).json({
    error: { code: 'INTERNAL_ERROR', message: 'An unexpected error occurred' },
  } satisfies ErrorResponse);
}

function formatError(err: { code: string; message: string; details?: unknown }): ErrorResponse {
  return {
    error: {
      code: err.code,
      message: err.message,
      ...(err.details !== undefined ? { details: err.details } : {}),
    },
  };
}