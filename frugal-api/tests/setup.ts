process.env.NODE_ENV = 'test';
process.env.DATABASE_URL ??= 'postgres://test:test@localhost:5432/frugal_test';
process.env.REDIS_URL ??= 'rediss://localhost:6379';
process.env.JWT_SECRET ??= 'test-jwt-secret-test-jwt-secret-32b';
process.env.ENCRYPTION_KEY ??=
  '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';
