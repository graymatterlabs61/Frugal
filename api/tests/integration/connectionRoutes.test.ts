import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { randomUUID } from 'node:crypto';
import { createApp } from '../../src/app.js';

describe('connections routes (requires a real Postgres via DATABASE_URL)', () => {
  const app = createApp();
  let cookie: string[];
  let projectId: string;
  let connectionId: string;

  beforeAll(async () => {
    const email = `connections-${randomUUID()}@example.com`;
    const signUpRes = await request(app)
      .post('/api/auth/sign-up/email')
      .send({ email, password: 'correct-horse-battery', name: 'Connections Test' });
    cookie = signUpRes.headers['set-cookie'];

    const projectRes = await request(app)
      .post('/api/v1/projects')
      .set('Cookie', cookie)
      .send({ name: 'Connections Project' });
    projectId = projectRes.body.project.id;
  });

  it('rejects unauthenticated requests', async () => {
    const res = await request(app).get('/api/v1/connections');
    expect(res.status).toBe(401);
  });

  it('starts with an empty connection list', async () => {
    const res = await request(app).get('/api/v1/connections').set('Cookie', cookie);
    expect(res.status).toBe(200);
    expect(res.body.connections).toEqual([]);
  });

  it("404s creating a connection under a project id that doesn't belong to the caller", async () => {
    const res = await request(app)
      .post('/api/v1/connections')
      .set('Cookie', cookie)
      .send({ projectId: randomUUID(), provider: 'openai', apiKey: 'sk-test-123' });
    expect(res.status).toBe(404);
  });

  it('rejects an invalid provider', async () => {
    const res = await request(app)
      .post('/api/v1/connections')
      .set('Cookie', cookie)
      .send({ projectId, provider: 'not-a-provider', apiKey: 'sk-test-123' });
    expect(res.status).toBe(400);
  });

  it('creates a connection and never echoes the key or its ciphertext', async () => {
    const res = await request(app)
      .post('/api/v1/connections')
      .set('Cookie', cookie)
      .send({ projectId, provider: 'openai', label: 'Prod key', apiKey: 'sk-test-1234567890' });
    expect(res.status).toBe(201);
    expect(res.body.connection.provider).toBe('openai');
    expect(res.body.connection.apiKeySuffix).toBe('7890');
    expect(JSON.stringify(res.body)).not.toContain('sk-test-1234567890');
    expect(res.body.connection.apiKeyEncrypted).toBeUndefined();
    connectionId = res.body.connection.id;
  });

  it('rejects create beyond the free-plan connection limit (1)', async () => {
    const res = await request(app)
      .post('/api/v1/connections')
      .set('Cookie', cookie)
      .send({ projectId, provider: 'anthropic', apiKey: 'sk-ant-test' });
    expect(res.status).toBe(403);
    expect(res.body.error.code).toBe('FORBIDDEN');
  });

  it('updates label and isActive', async () => {
    const res = await request(app)
      .patch(`/api/v1/connections/${connectionId}`)
      .set('Cookie', cookie)
      .send({ label: 'Renamed', isActive: false });
    expect(res.status).toBe(200);
    expect(res.body.connection.label).toBe('Renamed');
    expect(res.body.connection.isActive).toBe(false);
    expect(res.body.connection.apiKeyEncrypted).toBeUndefined();
    expect(JSON.stringify(res.body)).not.toContain('sk-test-1234567890');
  });

  it('lists connections without leaking the key or its ciphertext', async () => {
    const res = await request(app).get('/api/v1/connections').set('Cookie', cookie);
    expect(res.status).toBe(200);
    expect(res.body.connections.length).toBeGreaterThan(0);
    expect(JSON.stringify(res.body)).not.toContain('apiKeyEncrypted');
    expect(JSON.stringify(res.body)).not.toContain('sk-test-1234567890');
  });

  it("404s updating another user's connection", async () => {
    const otherEmail = `connections-other-${randomUUID()}@example.com`;
    const otherSignUp = await request(app)
      .post('/api/auth/sign-up/email')
      .send({ email: otherEmail, password: 'correct-horse-battery', name: 'Other User' });
    const otherCookie = otherSignUp.headers['set-cookie'];

    const res = await request(app)
      .patch(`/api/v1/connections/${connectionId}`)
      .set('Cookie', otherCookie)
      .send({ label: 'Hijacked' });
    expect(res.status).toBe(404);
  });

  it('deletes the connection', async () => {
    const res = await request(app)
      .delete(`/api/v1/connections/${connectionId}`)
      .set('Cookie', cookie);
    expect(res.status).toBe(204);
  });
});
