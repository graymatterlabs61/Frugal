import type { Request, Response, NextFunction } from 'express';
import { fromNodeHeaders } from 'better-auth/node';
import { auth } from '../auth.js';
import { UnauthorizedError } from '../utils/errors.js';

export async function requireAuth(req: Request, _res: Response, next: NextFunction): Promise<void> {
  const session = await auth.api.getSession({ headers: fromNodeHeaders(req.headers) });
  if (!session) {
    next(new UnauthorizedError());
    return;
  }
  req.userId = session.user.id;
  next();
}
