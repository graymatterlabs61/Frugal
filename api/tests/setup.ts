process.env.NODE_ENV = 'test';
process.env.DATABASE_URL ??= 'postgres://test:test@localhost:5432/frugal_test';
process.env.REDIS_URL ??= 'rediss://localhost:6379';
process.env.BETTER_AUTH_SECRET ??= 'test-better-auth-secret-32-bytes!';
process.env.BETTER_AUTH_URL ??= 'http://localhost:3000';
process.env.ENCRYPTION_KEY ??=
  '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';
// `||=` (not `??=`) — api/.env defines these as empty-string placeholders (no
// real Stripe test account wired up yet), and Billing tests mock the Stripe SDK
// entirely, so an empty string from .env must still fall back to the fake below.
process.env.STRIPE_SECRET_KEY ||= 'sk_test_fake_key_for_tests';
process.env.STRIPE_WEBHOOK_SECRET ||= 'whsec_fake_test_secret';
process.env.STRIPE_PRICE_PLUS_MONTHLY ||= 'price_plus_monthly_test';
process.env.STRIPE_PRICE_PLUS_YEARLY ||= 'price_plus_yearly_test';
process.env.STRIPE_PRICE_PRO_MONTHLY ||= 'price_pro_monthly_test';
process.env.STRIPE_PRICE_PRO_YEARLY ||= 'price_pro_yearly_test';
