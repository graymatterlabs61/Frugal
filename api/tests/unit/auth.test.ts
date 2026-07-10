import { describe, it, expect } from 'vitest';
import { auth } from '../../src/auth.js';

describe('auth (better-auth instance)', () => {
  it('constructs without throwing when social-provider env vars are unset', () => {
    expect(auth).toBeDefined();
    expect(auth.api).toBeDefined();
  });

  it('exposes the email-otp plugin endpoints', () => {
    expect(typeof auth.api.sendVerificationOTP).toBe('function');
    expect(typeof auth.api.checkVerificationOTP).toBe('function');
  });
});
