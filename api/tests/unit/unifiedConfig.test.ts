import { describe, it, expect } from 'vitest';
import { loadConfig } from '../../src/config/unifiedConfig.js';

const validEnv = {
  NODE_ENV: 'test',
  PORT: '4001',
  DATABASE_URL: 'postgres://u:p@host/db',
  REDIS_URL: 'rediss://host:6379',
  BETTER_AUTH_SECRET: 'x'.repeat(32),
  BETTER_AUTH_URL: 'http://localhost:3000',
  ENCRYPTION_KEY: 'ab'.repeat(32),
  CORS_ORIGINS: 'https://app.frugal.dev, https://frugal.dev',
};

describe('loadConfig', () => {
  it('parses a valid env into grouped config', () => {
    const c = loadConfig(validEnv);
    expect(c.env).toBe('test');
    expect(c.port).toBe(4001);
    expect(c.database.url).toBe('postgres://u:p@host/db');
    expect(c.betterAuth.secret).toBe('x'.repeat(32));
    expect(c.betterAuth.url).toBe('http://localhost:3000');
    expect(c.cors.origins).toEqual(['https://app.frugal.dev', 'https://frugal.dev']);
    expect(c.stripe.secretKey).toBeUndefined();
  });

  it('throws when a required var is missing', () => {
    const { DATABASE_URL: _omit, ...rest } = validEnv;
    expect(() => loadConfig(rest)).toThrow(/DATABASE_URL/);
  });

  it('rejects a short BETTER_AUTH_SECRET', () => {
    expect(() => loadConfig({ ...validEnv, BETTER_AUTH_SECRET: 'short' })).toThrow(
      /BETTER_AUTH_SECRET/,
    );
  });

  it('rejects a non-64-hex ENCRYPTION_KEY', () => {
    expect(() => loadConfig({ ...validEnv, ENCRYPTION_KEY: 'nothex' })).toThrow(/ENCRYPTION_KEY/);
  });

  it('defaults PORT to 3000 and CORS origins to empty', () => {
    const { PORT: _p, CORS_ORIGINS: _c, ...rest } = validEnv;
    const c = loadConfig(rest);
    expect(c.port).toBe(3000);
    expect(c.cors.origins).toEqual([]);
  });

  it('leaves all social-provider fields undefined when their env vars are absent', () => {
    const c = loadConfig(validEnv);
    expect(c.google.clientId).toBeUndefined();
    expect(c.google.clientSecret).toBeUndefined();
    expect(c.github.clientId).toBeUndefined();
    expect(c.apple.clientId).toBeUndefined();
    expect(c.apple.privateKey).toBeUndefined();
  });

  it('picks up social-provider env vars when present', () => {
    const c = loadConfig({
      ...validEnv,
      GOOGLE_CLIENT_ID: 'g-id',
      GOOGLE_CLIENT_SECRET: 'g-secret',
      GITHUB_CLIENT_ID: 'h-id',
      GITHUB_CLIENT_SECRET: 'h-secret',
      APPLE_CLIENT_ID: 'a-id',
      APPLE_TEAM_ID: 'a-team',
      APPLE_KEY_ID: 'a-key',
      APPLE_PRIVATE_KEY: 'a-pk',
      APPLE_APP_BUNDLE_IDENTIFIER: 'com.frugal.app',
    });
    expect(c.google).toEqual({ clientId: 'g-id', clientSecret: 'g-secret' });
    expect(c.github).toEqual({ clientId: 'h-id', clientSecret: 'h-secret' });
    expect(c.apple).toEqual({
      clientId: 'a-id',
      teamId: 'a-team',
      keyId: 'a-key',
      privateKey: 'a-pk',
      appBundleIdentifier: 'com.frugal.app',
    });
  });
});
