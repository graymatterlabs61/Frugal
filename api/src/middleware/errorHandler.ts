import type { ErrorRequestHandler } from 'express';
import { ZodError } from 'zod';
import * as Sentry from '@sentry/node';
import { AppError } from '../utils/errors.js';

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  if (err instanceof AppError) {
    const body: { code: string; message: string; details?: unknown } = {
      code: err.code,
      message: err.message,
    };
    if (err.details !== undefined) body.details = err.details;
    res.status(err.statusCode).json({ error: body });
    return;
  }

  if (err instanceof ZodError) {
    res.status(400).json({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Request validation failed',
        details: err.issues.map((i) => ({ path: i.path.join('.'), message: i.message })),
      },
    });
    return;
  }

  if (
    err instanceof Error &&
    'status' in err &&
    typeof (err as { status?: unknown }).status === 'number'
  ) {
    const status = (err as { status: number }).status;
    const expose = (err as { expose?: unknown }).expose === true;
    if (status >= 400 && status < 500 && expose) {
      res.status(status).json({
        error: { code: 'REQUEST_ERROR', message: err.message || 'Request error' },
      });
      return;
    }
  }

  Sentry.captureException(err);
  res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } });
};
