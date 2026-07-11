import { describe, it, expect, beforeAll, afterEach, vi } from 'vitest';
import request from 'supertest';
import { randomUUID } from 'node:crypto';
import { eq, and } from 'drizzle-orm';
import { createApp } from '../../src/app.js';
import { db } from '../../src/db/client.js';
import { usageRecords, apiConnections } from '../../src/db/schema.js';
import { users } from '../../src/db/authSchema.js';

afterEach(() => {
  vi.unstubAllGlobals();
});

function stubOpenAiUsage(results: Array<{ model: string; input_tokens: number; output_tokens: number }>) {
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ data: [{ results }] }),
    }),
  );
}

describe('poll route (requires a real Postgres via DATABASE_URL)', () => {
  const app = createApp();
  let cookie: string[];
  let projectId: string;
  let connectionId: string;

  beforeAll(async () => {
    const email = `poll-${randomUUID()}@example.com`;
    const signUpRes = await request(app)
      .post('/api/auth/sign-up/email')
      .send({ email, password: 'correct-horse-battery', name: 'Poll Test' });
    cookie = signUpRes.headers['set-cookie'];
    // plus plan so this suite's later replicate-connection test doesn't trip the
    // free-plan 1-connection limit (Plan 3) — not testing tier limits here, Plan 3 already does
    await db.update(users).set({ plan: 'plus' }).where(eq(users.id, signUpRes.body.user.id));

    const projectRes = await request(app)
      .post('/api/v1/projects')
      .set('Cookie', cookie)
      .send({ name: 'Poll Project' });
    projectId = projectRes.body.project.id;

    const connectionRes = await request(app)
      .post('/api/v1/connections')
      .set('Cookie', cookie)
      .send({ projectId, provider: 'openai', label: 'Admin key', apiKey: 'sk-admin-fake-test-key' });
    connectionId = connectionRes.body.connection.id;
  });

  it('rejects unauthenticated requests', async () => {
    const res = await request(app).post('/api/v1/poll');
    expect(res.status).toBe(401);
  });

  it('polls the connection and writes a usage_records row', async () => {
    stubOpenAiUsage([{ model: 'gpt-4.1', input_tokens: 1000, output_tokens: 200 }]);

    const res = await request(app).post('/api/v1/poll').set('Cookie', cookie);
    expect(res.status).toBe(200);
    expect(res.body.results).toHaveLength(1);
    expect(res.body.results[0]).toMatchObject({
      connectionId,
      provider: 'openai',
      status: 'polled',
      modelsUpdated: 1,
    });

    const rows = await db
      .select()
      .from(usageRecords)
      .where(and(eq(usageRecords.connectionId, connectionId), eq(usageRecords.model, 'gpt-4.1')));
    expect(rows).toHaveLength(1);
    expect(rows[0]!.tokensInput).toBe(1000);
    expect(rows[0]!.tokensOutput).toBe(200);
    expect(Number(rows[0]!.costUsd)).toBeCloseTo(0.002 + 0.0016, 5);

    const [connection] = await db
      .select()
      .from(apiConnections)
      .where(eq(apiConnections.id, connectionId));
    expect(connection!.status).toBe('active');
    expect(connection!.lastPolledAt).toBeTruthy();
  });

  it('re-polling the same day upserts instead of inserting a second row', async () => {
    stubOpenAiUsage([{ model: 'gpt-4.1', input_tokens: 2000, output_tokens: 400 }]);

    const res = await request(app).post('/api/v1/poll').set('Cookie', cookie);
    expect(res.status).toBe(200);

    const rows = await db
      .select()
      .from(usageRecords)
      .where(and(eq(usageRecords.connectionId, connectionId), eq(usageRecords.model, 'gpt-4.1')));
    expect(rows).toHaveLength(1);
    expect(rows[0]!.tokensInput).toBe(2000);
    expect(rows[0]!.tokensOutput).toBe(400);
  });

  it('marks the connection invalid on a 401 and excludes it from later results', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ ok: false, status: 401, json: async () => ({}) }),
    );

    const res = await request(app).post('/api/v1/poll').set('Cookie', cookie);
    expect(res.status).toBe(200);
    expect(res.body.results[0]).toMatchObject({ connectionId, status: 'auth_error', modelsUpdated: 0 });

    const [connection] = await db
      .select()
      .from(apiConnections)
      .where(eq(apiConnections.id, connectionId));
    expect(connection!.status).toBe('invalid');

    // fetch must not be called again for a now-invalid connection
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
    await request(app).post('/api/v1/poll').set('Cookie', cookie);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('never calls fetch for a replicate connection and reports no results for it', async () => {
    const otherRes = await request(app)
      .post('/api/v1/connections')
      .set('Cookie', cookie)
      .send({ projectId, provider: 'replicate', apiKey: 'r8-fake-test-key' });
    expect(otherRes.status).toBe(201);

    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);

    const res = await request(app).post('/api/v1/poll').set('Cookie', cookie);
    expect(res.status).toBe(200);
    expect(res.body.results.some((r: { connectionId: string }) => r.connectionId === otherRes.body.connection.id)).toBe(false);
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
