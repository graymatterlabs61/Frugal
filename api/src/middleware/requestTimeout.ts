import type { Request, Response, NextFunction } from 'express';

const TIMEOUT_MS = 30_000;

export function requestTimeout(req: Request, res: Response, next: NextFunction): void {
  const timer = setTimeout(() => {
    if (!res.headersSent) {
      res.status(503).json({
        error: { code: 'REQUEST_TIMEOUT', message: 'Request timed out' },
      });
    }
  }, TIMEOUT_MS);

  res.on('finish', () => clearTimeout(timer));
  res.on('close', () => clearTimeout(timer));
  next();
}