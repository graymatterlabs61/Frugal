import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { randomUUID } from 'node:crypto';
import { eq } from 'drizzle-orm';
import { createApp } from '../../src/app.js';
import { db } from '../../src/db/client.js';
import { users } from '../../src/db/authSchema.js';

describe('ingest route (requires a real Postgres via DATABASE_URL)', () => {
  const app = createApp();
  let cookie: string[];
  let userId: string;
  let projectId: string;

  beforeAll(async () => {
    const email = `ingest-${randomUUID()}@example.com`;
    const signUpRes = await request(app)
      .post('/api/auth/sign-up/email')
      .send({ email, password: 'correct-horse-battery', name: 'Ingest Test' });
    cookie = signUpRes.headers['set-cookie'];
    userId = signUpRes.body.user.id;

    const projectRes = await request(app)
      .post('/api/v1/projects')
      .set('Cookie', cookie)
      .send({ name: 'Ingest Project' });
    projectId = projectRes.body.project.id;
  });

  it('rejects unauthenticated requests', async () => {
    const res = await request(app)
      .post('/api/v1/ingest')
      .send({ endUserId: 'end-user-1', projectId, tokensInput: 10, tokensOutput: 5, costUsd: 0.01 });
    expect(res.status).toBe(401);
  });

  it('rejects a free-plan caller with 403', async () => {
    const res = await request(app)
      .post('/api/v1/ingest')
      .set('Cookie', cookie)
      .send({ endUserId: 'end-user-1', projectId, tokensInput: 10, tokensOutput: 5, costUsd: 0.01 });
    expect(res.status).toBe(403);
  });

  it('rejects an invalid body even for a free-plan caller (tier gate does not short-circuit validation)', async () => {
    const res = await request(app)
      .post('/api/v1/ingest')
      .set('Cookie', cookie)
      .send({ endUserId: 'end-user-1', projectId, costUsd: 'not-a-number' });
    expect(res.status).toBe(400);
  });

  describe('as a pro-plan caller', () => {
    beforeAll(async () => {
      await db.update(users).set({ plan: 'pro' }).where(eq(users.id, userId));
    });

    it('creates an ingest event', async () => {
      const res = await request(app)
        .post('/api/v1/ingest')
        .set('Cookie', cookie)
        .send({
          endUserId: 'end-user-42',
          projectId,
          provider: 'openai',
          model: 'gpt-4.1',
          tokensInput: 1000,
          tokensOutput: 200,
          costUsd: 0.0036,
          metadata: { requestId: 'req_123' },
        });
      expect(res.status).toBe(201);
      expect(res.body.event.endUserId).toBe('end-user-42');
      expect(res.body.event.projectId).toBe(projectId);
      expect(Number(res.body.event.costUsd)).toBeCloseTo(0.0036, 5);
    });

    it('404s for a project id that is not the caller\'s', async () => {
      const res = await request(app)
        .post('/api/v1/ingest')
        .set('Cookie', cookie)
        .send({ endUserId: 'end-user-1', projectId: randomUUID(), tokensInput: 1, tokensOutput: 1, costUsd: 0.001 });
      expect(res.status).toBe(404);
    });

    it('rejects an unknown field', async () => {
      const res = await request(app)
        .post('/api/v1/ingest')
        .set('Cookie', cookie)
        .send({ endUserId: 'end-user-1', projectId, tokensInput: 1, tokensOutput: 1, costUsd: 0.001, sneaky: true });
      expect(res.status).toBe(400);
    });
  });
});
