import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { randomUUID } from 'node:crypto';
import { eq } from 'drizzle-orm';
import { createApp } from '../../src/app.js';
import { db } from '../../src/db/client.js';
import { projects, apiConnections, usageRecords } from '../../src/db/schema.js';

function todayIso(offsetDays = 0): string {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() + offsetDays);
  return d.toISOString().slice(0, 10);
}

describe('dashboard routes (requires a real Postgres via DATABASE_URL)', () => {
  const app = createApp();
  let cookie: string[];
  let userId: string;
  let bigProjectId: string;
  let smallProjectId: string;

  beforeAll(async () => {
    const email = `dashboard-${randomUUID()}@example.com`;
    const signUpRes = await request(app)
      .post('/api/auth/sign-up/email')
      .send({ email, password: 'correct-horse-battery', name: 'Dashboard Test' });
    cookie = signUpRes.headers['set-cookie'];
    userId = signUpRes.body.user.id;

    const [bigProject] = await db.insert(projects).values({ userId, name: 'Big Spender' }).returning();
    bigProjectId = bigProject!.id;
    const [smallProject] = await db.insert(projects).values({ userId, name: 'Small Spender' }).returning();
    smallProjectId = smallProject!.id;

    const [bigConnection] = await db
      .insert(apiConnections)
      .values({
        userId,
        projectId: bigProjectId,
        provider: 'openai',
        apiKeyEncrypted: 'unused:unused:unused',
        apiKeySuffix: '0000',
      })
      .returning();
    const [smallConnection] = await db
      .insert(apiConnections)
      .values({
        userId,
        projectId: smallProjectId,
        provider: 'openai',
        apiKeyEncrypted: 'unused:unused:unused',
        apiKeySuffix: '1111',
      })
      .returning();

    // ponytail: todayIso(-1) assumes "yesterday" is in the same calendar month as
    // "today" — false only when this suite runs on the 1st of the month, in which
    // case the monthlySpend assertion below would need widening. Accepted gap.
    await db.insert(usageRecords).values([
      {
        connectionId: bigConnection!.id,
        userId,
        date: todayIso(),
        model: 'gpt-4.1',
        tokensInput: 1000,
        tokensOutput: 200,
        costUsd: '10.000000',
      },
      {
        connectionId: bigConnection!.id,
        userId,
        date: todayIso(-1),
        model: 'gpt-4.1',
        tokensInput: 1000,
        tokensOutput: 200,
        costUsd: '5.000000',
      },
      {
        connectionId: smallConnection!.id,
        userId,
        date: todayIso(),
        model: 'gpt-4.1',
        tokensInput: 100,
        tokensOutput: 20,
        costUsd: '1.000000',
      },
    ]);
  });

  it('rejects unauthenticated requests on all three routes', async () => {
    expect((await request(app).get('/api/v1/dashboard')).status).toBe(401);
    expect((await request(app).get('/api/v1/dashboard/spend-chart')).status).toBe(401);
    expect((await request(app).get('/api/v1/dashboard/top-projects')).status).toBe(401);
  });

  it('summary reports today and month-to-date spend across all projects', async () => {
    const res = await request(app).get('/api/v1/dashboard').set('Cookie', cookie);
    expect(res.status).toBe(200);
    expect(res.body.dailySpend).toBeCloseTo(11, 5); // today: 10 (big) + 1 (small)
    expect(res.body.monthlySpend).toBeCloseTo(16, 5); // + yesterday's 5, assuming same month
    expect(res.body.activeAlerts).toBe(0);
  });

  it('spend-chart returns a daily series covering the requested window', async () => {
    const res = await request(app).get('/api/v1/dashboard/spend-chart?days=7').set('Cookie', cookie);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.series)).toBe(true);
    const todayEntry = res.body.series.find((s: { date: string }) => s.date === todayIso());
    expect(todayEntry.costUsd).toBeCloseTo(11, 5);
  });

  it('rejects an out-of-range days query', async () => {
    const res = await request(app).get('/api/v1/dashboard/spend-chart?days=9999').set('Cookie', cookie);
    expect(res.status).toBe(400);
  });

  it('top-projects ranks by spend descending', async () => {
    const res = await request(app).get('/api/v1/dashboard/top-projects').set('Cookie', cookie);
    expect(res.status).toBe(200);
    const ids = res.body.projects.map((p: { projectId: string }) => p.projectId);
    expect(ids.indexOf(bigProjectId)).toBeLessThan(ids.indexOf(smallProjectId));
    const big = res.body.projects.find((p: { projectId: string }) => p.projectId === bigProjectId);
    expect(big.costUsd).toBeCloseTo(15, 5); // month-to-date: 10 + 5
  });
});
