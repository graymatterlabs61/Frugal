import { describe, it, expect } from 'vitest';
import { loadConfig } from '../../src/config/unifiedConfig.js';

const validEnv = {
  NODE_ENV: 'test',
  PORT: '4001',
  DATABASE_URL: 'postgres://u:p@host/db',
  REDIS_URL: 'rediss://host:6379',
  JWT_SECRET: 'x'.repeat(32),
  JWT_EXPIRES_IN_SECONDS: '604800',
  ENCRYPTION_KEY: 'ab'.repeat(32),
  CORS_ORIGINS: 'https://app.frugal.dev, https://frugal.dev',
};

describe('loadConfig', () => {
  it('parses a valid env into grouped config', () => {
    const c = loadConfig(validEnv);
    expect(c.env).toBe('test');
    expect(c.port).toBe(4001);
    expect(c.database.url).toBe('postgres://u:p@host/db');
    expect(c.auth.jwtExpiresInSeconds).toBe(604800);
    expect(c.cors.origins).toEqual(['https://app.frugal.dev', 'https://frugal.dev']);
    expect(c.stripe.secretKey).toBeUndefined();
  });

  it('throws when a required var is missing', () => {
    const { DATABASE_URL: _omit, ...rest } = validEnv;
    expect(() => loadConfig(rest)).toThrow(/DATABASE_URL/);
  });

  it('rejects a short JWT_SECRET', () => {
    expect(() => loadConfig({ ...validEnv, JWT_SECRET: 'short' })).toThrow(/JWT_SECRET/);
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
});
