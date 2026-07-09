import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { createApp } from '../../src/app.js';

describe('app', () => {
  const app = createApp();

  it('GET /health returns 200 with status ok', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(typeof res.body.uptime).toBe('number');
  });

  it('sets an X-Request-Id header on every response', async () => {
    const res = await request(app).get('/health');
    expect(res.headers['x-request-id']).toBeTruthy();
  });

  it('echoes a provided X-Request-Id', async () => {
    const res = await request(app).get('/health').set('X-Request-Id', 'my-trace-1');
    expect(res.headers['x-request-id']).toBe('my-trace-1');
  });

  it('returns spec-shaped 404 for unknown routes', async () => {
    const res = await request(app).get('/nope');
    expect(res.status).toBe(404);
    expect(res.body).toEqual({
      error: { code: 'NOT_FOUND', message: 'Route not found' },
    });
  });

  it('sets security headers via helmet', async () => {
    const res = await request(app).get('/health');
    expect(res.headers['x-content-type-options']).toBe('nosniff');
    expect(res.headers['x-frame-options']).toBeTruthy();
  });

  it('rejects bodies over 256kb', async () => {
    const big = { pad: 'x'.repeat(300 * 1024) };
    const res = await request(app).post('/health').send(big);
    expect(res.status).toBe(413);
  });
});
