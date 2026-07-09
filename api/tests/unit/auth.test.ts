import { describe, it, expect, vi } from 'vitest';
import type { Request, Response, NextFunction } from 'express';
import { signToken, authenticate } from '../../src/middleware/auth.js';
import { UnauthorizedError } from '../../src/utils/errors.js';

function mockReq(overrides: Partial<Request> = {}): Request {
  return { headers: {}, cookies: {}, ...overrides } as Request;
}

describe('signToken / authenticate', () => {
  it('signs a token that authenticate accepts via the Bearer header', () => {
    const token = signToken({ sub: 'user-1', email: 'a@b.com', plan: 'free' });
    const req = mockReq({ headers: { authorization: `Bearer ${token}` } });
    const next = vi.fn() as NextFunction;

    authenticate(req, {} as Response, next);

    expect(next).toHaveBeenCalledWith();
    expect(req.userId).toBe('user-1');
  });

  it('accepts a token from an httpOnly cookie', () => {
    const token = signToken({ sub: 'user-2', email: 'c@d.com', plan: 'free' });
    const req = mockReq({ cookies: { token } });
    const next = vi.fn() as NextFunction;

    authenticate(req, {} as Response, next);

    expect(req.userId).toBe('user-2');
  });

  it('rejects a missing token', () => {
    const req = mockReq();
    const next = vi.fn() as NextFunction;

    authenticate(req, {} as Response, next);

    expect(next).toHaveBeenCalledWith(expect.any(UnauthorizedError));
  });

  it('rejects a malformed token', () => {
    const req = mockReq({ headers: { authorization: 'Bearer not-a-real-jwt' } });
    const next = vi.fn() as NextFunction;

    authenticate(req, {} as Response, next);

    expect(next).toHaveBeenCalledWith(expect.any(UnauthorizedError));
  });
});
