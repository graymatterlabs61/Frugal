import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { randomUUID } from 'node:crypto';
import { eq } from 'drizzle-orm';
import { createApp } from '../../src/app.js';
import { db } from '../../src/db/client.js';
import { users } from '../../src/db/authSchema.js';

describe('budget rules routes (requires a real Postgres via DATABASE_URL)', () => {
  const app = createApp();
  let freeCookie: string[];
  let plusCookie: string[];
  let projectId: string;
  let ruleId: string;

  beforeAll(async () => {
    const freeEmail = `budget-rules-free-${randomUUID()}@example.com`;
    const freeSignUp = await request(app)
      .post('/api/auth/sign-up/email')
      .send({ email: freeEmail, password: 'correct-horse-battery', name: 'Free User' });
    freeCookie = freeSignUp.headers['set-cookie'];

    const plusEmail = `budget-rules-plus-${randomUUID()}@example.com`;
    const plusSignUp = await request(app)
      .post('/api/auth/sign-up/email')
      .send({ email: plusEmail, password: 'correct-horse-battery', name: 'Plus User' });
    plusCookie = plusSignUp.headers['set-cookie'];
    // no billing/upgrade endpoint exists yet -- promote directly via the DB, same
    // "arrange via direct write" pattern this plan uses for alert_log/notifications
    await db.update(users).set({ plan: 'plus' }).where(eq(users.id, plusSignUp.body.user.id));

    const projectRes = await request(app)
      .post('/api/v1/projects')
      .set('Cookie', plusCookie)
      .send({ name: 'Budget Rules Project' });
    projectId = projectRes.body.project.id;
  });

  it('rejects unauthenticated requests', async () => {
    const res = await request(app).get(`/api/v1/budget-rules?projectId=${projectId}`);
    expect(res.status).toBe(401);
  });

  it('requires projectId on list', async () => {
    const res = await request(app).get('/api/v1/budget-rules').set('Cookie', plusCookie);
    expect(res.status).toBe(400);
  });

  it('starts with an empty list', async () => {
    const res = await request(app)
      .get(`/api/v1/budget-rules?projectId=${projectId}`)
      .set('Cookie', plusCookie);
    expect(res.status).toBe(200);
    expect(res.body.budgetRules).toEqual([]);
  });

  it('rejects create on the free plan (no budget-rule capability at all)', async () => {
    const res = await request(app)
      .post('/api/v1/budget-rules')
      .set('Cookie', freeCookie)
      .send({ projectId, budgetWindow: 'daily', limitUsd: 100, action: 'alert' });
    expect(res.status).toBe(403);
    expect(res.body.error.code).toBe('FORBIDDEN');
  });

  it("404s creating a rule under a project id that isn't the caller's", async () => {
    const res = await request(app)
      .post('/api/v1/budget-rules')
      .set('Cookie', plusCookie)
      .send({ projectId: randomUUID(), budgetWindow: 'daily', limitUsd: 100, action: 'alert' });
    expect(res.status).toBe(404);
  });

  it('rejects throttle on a plus-plan account', async () => {
    const res = await request(app)
      .post('/api/v1/budget-rules')
      .set('Cookie', plusCookie)
      .send({ projectId, budgetWindow: 'daily', limitUsd: 100, action: 'throttle' });
    expect(res.status).toBe(403);
  });

  it('creates a rule on a plus-plan account with action alert', async () => {
    const res = await request(app)
      .post('/api/v1/budget-rules')
      .set('Cookie', plusCookie)
      .send({ projectId, budgetWindow: 'daily', limitUsd: 100, thresholdPct: 90, action: 'alert' });
    expect(res.status).toBe(201);
    expect(res.body.budgetRule.limitUsd).toBe('100.00');
    expect(res.body.budgetRule.thresholdPct).toBe(90);
    expect(res.body.budgetRule.action).toBe('alert');
    ruleId = res.body.budgetRule.id;
  });

  it('rejects an unknown field on create', async () => {
    const res = await request(app)
      .post('/api/v1/budget-rules')
      .set('Cookie', plusCookie)
      .send({ projectId, budgetWindow: 'daily', limitUsd: 50, action: 'alert', sneaky: true });
    expect(res.status).toBe(400);
  });

  it('updates the rule without touching untouched fields', async () => {
    const res = await request(app)
      .patch(`/api/v1/budget-rules/${ruleId}`)
      .set('Cookie', plusCookie)
      .send({ isActive: false });
    expect(res.status).toBe(200);
    expect(res.body.budgetRule.isActive).toBe(false);
    expect(res.body.budgetRule.budgetWindow).toBe('daily');
    expect(res.body.budgetRule.limitUsd).toBe('100.00');
  });

  it('rejects upgrading the rule to throttle on a plus-plan account', async () => {
    const res = await request(app)
      .patch(`/api/v1/budget-rules/${ruleId}`)
      .set('Cookie', plusCookie)
      .send({ action: 'throttle' });
    expect(res.status).toBe(403);
  });

  it("404s updating another user's rule", async () => {
    const res = await request(app)
      .patch(`/api/v1/budget-rules/${ruleId}`)
      .set('Cookie', freeCookie)
      .send({ isActive: true });
    expect(res.status).toBe(404);
  });

  it('deletes the rule', async () => {
    const res = await request(app)
      .delete(`/api/v1/budget-rules/${ruleId}`)
      .set('Cookie', plusCookie);
    expect(res.status).toBe(204);
  });
});
