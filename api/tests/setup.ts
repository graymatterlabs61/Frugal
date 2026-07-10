process.env.NODE_ENV = 'test';
process.env.DATABASE_URL ??= 'postgres://test:test@localhost:5432/frugal_test';
process.env.REDIS_URL ??= 'rediss://localhost:6379';
process.env.BETTER_AUTH_SECRET ??= 'test-better-auth-secret-32-bytes!';
process.env.BETTER_AUTH_URL ??= 'http://localhost:3000';
process.env.ENCRYPTION_KEY ??=
  '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';
