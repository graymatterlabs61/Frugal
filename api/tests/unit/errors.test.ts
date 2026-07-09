import { describe, it, expect, vi } from 'vitest';
import type { Request, Response, NextFunction } from 'express';
import { z, ZodError } from 'zod';
import {
  AppError,
  ValidationError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
  RateLimitError,
} from '../../src/utils/errors.js';
import { asyncErrorWrapper } from '../../src/middleware/asyncErrorWrapper.js';
import { errorHandler } from '../../src/middleware/errorHandler.js';

function mockRes() {
  const res: Partial<Response> = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res as Response & { status: ReturnType<typeof vi.fn>; json: ReturnType<typeof vi.fn> };
}

describe('error classes', () => {
  it.each([
    [new ValidationError('bad'), 400, 'VALIDATION_ERROR'],
    [new UnauthorizedError('no'), 401, 'UNAUTHORIZED'],
    [new ForbiddenError('no'), 403, 'FORBIDDEN'],
    [new NotFoundError('gone'), 404, 'NOT_FOUND'],
    [new ConflictError('dupe'), 409, 'CONFLICT'],
    [new RateLimitError('slow down'), 429, 'RATE_LIMITED'],
  ])('%s carries status %i and code %s', (err, status, code) => {
    expect(err).toBeInstanceOf(AppError);
    expect(err.statusCode).toBe(status);
    expect(err.code).toBe(code);
  });
});

describe('asyncErrorWrapper', () => {
  it('forwards rejections to next()', async () => {
    const boom = new Error('boom');
    const next = vi.fn();
    const handler = asyncErrorWrapper(async () => {
      throw boom;
    });
    await handler({} as Request, {} as Response, next as NextFunction);
    expect(next).toHaveBeenCalledWith(boom);
  });
});

describe('errorHandler', () => {
  const req = {} as Request;
  const next = vi.fn() as NextFunction;

  it('maps AppError to its status and code', () => {
    const res = mockRes();
    errorHandler(new NotFoundError('project not found'), req, res, next);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      error: { code: 'NOT_FOUND', message: 'project not found' },
    });
  });

  it('maps ZodError to 400 VALIDATION_ERROR with details', () => {
    const res = mockRes();
    let zerr: ZodError;
    try {
      z.object({ email: z.string().email() }).parse({ email: 'nope' });
      throw new Error('unreachable');
    } catch (e) {
      zerr = e as ZodError;
    }
    errorHandler(zerr, req, res, next);
    expect(res.status).toHaveBeenCalledWith(400);
    const body = res.json.mock.calls[0]![0];
    expect(body.error.code).toBe('VALIDATION_ERROR');
    expect(Array.isArray(body.error.details)).toBe(true);
  });

  it('maps unknown errors to 500 with a generic message', () => {
    const res = mockRes();
    errorHandler(new Error('secret internals leaked'), req, res, next);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      error: { code: 'INTERNAL_ERROR', message: 'Internal server error' },
    });
  });

  it('includes details on AppError when provided', () => {
    const res = mockRes();
    errorHandler(new ValidationError('bad input', [{ field: 'email' }]), req, res, next);
    expect(res.json).toHaveBeenCalledWith({
      error: { code: 'VALIDATION_ERROR', message: 'bad input', details: [{ field: 'email' }] },
    });
  });

  it('passes through exposable 4xx http-errors (body-parser style)', () => {
    const res = mockRes();
    const err = Object.assign(new Error('request entity too large'), {
      status: 413,
      expose: true,
    });
    errorHandler(err, req, res, next);
    expect(res.status).toHaveBeenCalledWith(413);
    expect(res.json).toHaveBeenCalledWith({
      error: { code: 'REQUEST_ERROR', message: 'request entity too large' },
    });
  });

  it('does not leak message or skip 500 for status-bearing 5xx errors', () => {
    const res = mockRes();
    const err = Object.assign(new Error('db creds invalid at 10.0.0.5'), { status: 500 });
    errorHandler(err, req, res, next);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      error: { code: 'INTERNAL_ERROR', message: 'Internal server error' },
    });
  });

  it('handles non-Error throws without crashing', () => {
    const res = mockRes();
    errorHandler('oops' as unknown as Error, req, res, next);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      error: { code: 'INTERNAL_ERROR', message: 'Internal server error' },
    });
  });
});
