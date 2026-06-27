import { describe, it, expect } from 'vitest';
import {
  AppError,
  ValidationError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
  RateLimitError,
  isAppError,
} from '@/utils/errors';

describe('error classes', () => {
  it.each([
    [new ValidationError('bad input'), 400, 'VALIDATION_ERROR'],
    [new UnauthorizedError(), 401, 'UNAUTHORIZED'],
    [new ForbiddenError(), 403, 'FORBIDDEN'],
    [new NotFoundError(), 404, 'NOT_FOUND'],
    [new ConflictError('dupe'), 409, 'CONFLICT'],
    [new RateLimitError(), 429, 'RATE_LIMIT_EXCEEDED'],
    [new AppError('CUSTOM', 'custom', 500), 500, 'CUSTOM'],
  ])('%s has correct status and code', (err, status, code) => {
    expect(err.statusCode).toBe(status);
    expect(err.code).toBe(code);
  });

  it('isAppError returns true for AppError subclasses', () => {
    expect(isAppError(new NotFoundError())).toBe(true);
  });

  it('isAppError returns false for plain Error', () => {
    expect(isAppError(new Error('plain'))).toBe(false);
  });
});