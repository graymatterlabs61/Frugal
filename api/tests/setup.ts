import { vi } from 'vitest';

// Mock Sentry globally — don't call real DSN in tests
vi.mock('@sentry/node', () => ({
  init: vi.fn(),
  captureException: vi.fn(),
  withScope: vi.fn(),
}));

// Set test env vars
process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = 'postgresql://test:test@localhost/frugal_test';
process.env.REDIS_URL = 'redis://localhost:6379';
process.env.JWT_SECRET = 'test-secret-minimum-32-characters-long';
process.env.ENCRYPTION_KEY = 'a'.repeat(64);
process.env.STRIPE_SECRET_KEY = 'sk_test_fake';
process.env.STRIPE_WEBHOOK_SECRET = 'whsec_fake';
process.env.STRIPE_PRICE_PLUS_MONTHLY = 'price_plus_mo';
process.env.STRIPE_PRICE_PLUS_YEARLY = 'price_plus_yr';
process.env.STRIPE_PRICE_PRO_MONTHLY = 'price_pro_mo';
process.env.STRIPE_PRICE_PRO_YEARLY = 'price_pro_yr';
process.env.RESEND_API_KEY = 're_fake';
process.env.RESEND_FROM_ADDRESS = 'test@frugal.dev';
process.env.CORS_ORIGINS = 'http://localhost:5173';