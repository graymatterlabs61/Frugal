import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import app from '@/app';

// Integration tests require a real Neon test DB.
// Run with: DATABASE_URL=<test_db> vitest run tests/integration

describe('POST /api/v1/auth/register', () => {
  it('returns 201 with user and sets cookie', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({ email: 'int-test@frugal.dev', password: 'SecurePass123!' });

    expect(res.status).toBe(201);
    expect(res.body.user).toBeDefined();
    expect(res.body.user.email).toBe('int-test@frugal.dev');
    expect(res.headers['set-cookie']).toBeDefined();
  });

  it('returns 409 for duplicate email', async () => {
    await request(app)
      .post('/api/v1/auth/register')
      .send({ email: 'dupe@frugal.dev', password: 'SecurePass123!' });

    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({ email: 'dupe@frugal.dev', password: 'SecurePass123!' });

    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe('CONFLICT');
  });

  it('returns 400 for invalid email', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({ email: 'not-an-email', password: 'SecurePass123!' });

    expect(res.status).toBe(400);
  });

  it('returns 400 for short password', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({ email: 'valid@frugal.dev', password: 'short' });

    expect(res.status).toBe(400);
  });
});

describe('GET /api/v1/health', () => {
  it('returns 200 with status ok', async () => {
    const res = await request(app).get('/api/v1/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });
});