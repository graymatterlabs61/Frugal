import type { Request, Response } from 'express';
import * as Sentry from '@sentry/node';
import { ZodError } from 'zod';
import { isAppError } from '@/utils/errors';
import { logger } from '@/utils/logger';

export abstract class BaseController {
  protected param(req: Request, key: string): string {
    const val = req.params[key];
    return Array.isArray(val) ? val[0]! : (val as string);
  }

  protected handleSuccess<T>(res: Response, data: T, statusCode = 200): void {
    res.status(statusCode).json(data);
  }

  protected handleCreated<T>(res: Response, data: T): void {
    res.status(201).json(data);
  }

  protected handleNoContent(res: Response): void {
    res.status(204).end();
  }

  protected handleError(error: unknown, res: Response, context: string): void {
    if (error instanceof ZodError) {
      res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid request parameters',
          details: error.flatten().fieldErrors,
        },
      });
      return;
    }

    if (isAppError(error)) {
      if (error.statusCode >= 500) {
        Sentry.captureException(error, { extra: { context } });
        logger.error({ err: error, context }, error.message);
      }
      res.status(error.statusCode).json({
        error: {
          code: error.code,
          message: error.message,
          ...(error.details !== undefined ? { details: error.details } : {}),
        },
      });
      return;
    }

    Sentry.captureException(error, { extra: { context } });
    logger.error({ err: error, context }, 'Unexpected controller error');
    res.status(500).json({
      error: { code: 'INTERNAL_ERROR', message: 'An unexpected error occurred' },
    });
  }
}