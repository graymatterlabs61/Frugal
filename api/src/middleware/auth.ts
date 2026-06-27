import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '@/config/unifiedConfig';
import { UnauthorizedError, ForbiddenError } from '@/utils/errors';
import type { Plan } from '@/utils/tier';
import { PLAN_LIMITS } from '@/utils/tier';

interface JwtPayload {
  sub: string;
  email: string;
  plan: Plan;
  iat: number;
  exp: number;
}

export function authenticate(req: Request, _res: Response, next: NextFunction): void {
  const token = extractToken(req);
  if (!token) return next(new UnauthorizedError('No token provided'));

  try {
    const payload = jwt.verify(token, config.auth.jwtSecret) as JwtPayload;
    req.user = { id: payload.sub, email: payload.email, plan: payload.plan };
    next();
  } catch {
    next(new UnauthorizedError('Invalid or expired token'));
  }
}

export function requireCorporate(req: Request, _res: Response, next: NextFunction): void {
  if (!req.user) return next(new UnauthorizedError());
  if (!PLAN_LIMITS[req.user.plan].isCorporate) {
    return next(new ForbiddenError('Corporate plan required'));
  }
  next();
}

export function requirePro(req: Request, _res: Response, next: NextFunction): void {
  if (!req.user) return next(new UnauthorizedError());
  if (!PLAN_LIMITS[req.user.plan].programmaticApi) {
    return next(new ForbiddenError('Pro plan or higher required'));
  }
  next();
}

function extractToken(req: Request): string | null {
  // httpOnly cookie takes priority
  const cookieToken = req.cookies?.token as string | undefined;
  if (cookieToken) return cookieToken;

  // Bearer token fallback (programmatic API)
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith('Bearer ')) return authHeader.slice(7);

  return null;
}

export function signToken(payload: { sub: string; email: string; plan: Plan }): string {
  return jwt.sign(payload, config.auth.jwtSecret, {
    expiresIn: config.auth.jwtExpiresInSeconds,
    algorithm: 'HS256',
  });
}