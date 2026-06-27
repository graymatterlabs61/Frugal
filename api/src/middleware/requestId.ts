import type { Request, Response, NextFunction } from 'express';
import { randomUUID } from 'crypto';
import * as Sentry from '@sentry/node';

declare global {
  namespace Express {
    interface Request {
      id: string;
    }
  }
}

export function requestId(req: Request, _res: Response, next: NextFunction): void {
  req.id = (req.headers['x-request-id'] as string | undefined) ?? randomUUID();
  Sentry.setTag('request_id', req.id);
  next();
}