import { describe, it, expect } from 'vitest';
import {
  registerSchema,
  loginSchema,
  googleAuthSchema,
  changePasswordSchema,
  updateProfileSchema,
} from '../../src/validators/auth.schema.js';

describe('auth.schema', () => {
  it('registerSchema accepts a valid payload and lowercases email', () => {
    const result = registerSchema.parse({ email: 'A@B.COM', password: 'longenough', fullName: 'A' });
    expect(result.email).toBe('a@b.com');
  });

  it('registerSchema rejects a short password', () => {
    expect(() => registerSchema.parse({ email: 'a@b.com', password: 'short' })).toThrow();
  });

  it('registerSchema rejects unknown fields', () => {
    expect(() =>
      registerSchema.parse({ email: 'a@b.com', password: 'longenough', extra: 'nope' }),
    ).toThrow();
  });

  it('loginSchema requires both fields', () => {
    expect(() => loginSchema.parse({ email: 'a@b.com' })).toThrow();
  });

  it('googleAuthSchema requires a non-empty idToken', () => {
    expect(() => googleAuthSchema.parse({ idToken: '' })).toThrow();
    expect(googleAuthSchema.parse({ idToken: 'x' }).idToken).toBe('x');
  });

  it('changePasswordSchema enforces new password length', () => {
    expect(() =>
      changePasswordSchema.parse({ currentPassword: 'x', newPassword: 'short' }),
    ).toThrow();
  });

  it('updateProfileSchema allows an empty object (fullName optional)', () => {
    expect(updateProfileSchema.parse({})).toEqual({});
  });
});
