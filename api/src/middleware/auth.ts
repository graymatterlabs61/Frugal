import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/unifiedConfig.js';
import { UnauthorizedError } from '../utils/errors.js';

export interface AuthTokenPayload {
  sub: string;
  email: string;
  plan: string;
}

export function signToken(payload: AuthTokenPayload): string {
  return jwt.sign(payload, config.auth.jwtSecret, {
    expiresIn: config.auth.jwtExpiresInSeconds,
    algorithm: 'HS256',
  });
}

function extractToken(req: Request): string | null {
  const cookieToken = req.cookies?.token as string | undefined;
  if (cookieToken) return cookieToken;

  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith('Bearer ')) return authHeader.slice(7);

  return null;
}

export function authenticate(req: Request, _res: Response, next: NextFunction): void {
  const token = extractToken(req);
  if (!token) {
    next(new UnauthorizedError('No token provided'));
    return;
  }

  try {
    const payload = jwt.verify(token, config.auth.jwtSecret) as AuthTokenPayload;
    req.userId = payload.sub;
    next();
  } catch {
    next(new UnauthorizedError('Invalid or expired token'));
  }
}
