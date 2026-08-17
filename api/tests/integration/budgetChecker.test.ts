import { describe, it, expect, beforeAll, afterEach, vi } from 'vitest';
import request from 'supertest';
import { randomUUID } from 'node:crypto';
import { eq } from 'drizzle-orm';
import { createApp } from '../../src/app.js';
import { db } from '../../src/db/client.js';
import { users } from '../../src/db/authSchema.js';
import { budgetRules, alertLog, notifications, projects } from '../../src/db/schema.js';

afterEach(() => {
  vi.unstubAllGlobals();
});

/**
 * Every POST /api/v1/poll call polls ALL of the caller's eligible connections at once,
 * so once a test adds a second (e.g. anthropic) connection, every later poll in this file
 * hits both providers — the stub must shape its response by request URL, not assume only
 * one connection exists.
 */
function stubProviderFetch(options: {
  openai?: Array<{ model: string; input_tokens: number; output_tokens: number }>;
  anthropic?: Array<{
    model: string;
    uncached_input_tokens: number;
    cache_read_input_tokens: number;
    output_tokens: number;
  }>;
}) {
  const fetchMock = vi.fn(async (input: string | URL) => {
    const url = String(input);
    if (url.includes('api.openai.com')) {
      return { ok: true, status: 200, json: async () => ({ data: [{ results: options.openai ?? [] }] }) };
    }
    if (url.includes('api.anthropic.com')) {
      return {
        ok: true,
        status: 200,
        json: async () => ({ data: [{ results: options.anthropic ?? [] }] }),
      };
    }
    // anything else is a webhook call (slack/custom) — always succeed
    return { ok: true, status: 200, json: async () => ({}) };
  });
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}

describe('budgetChecker + alertDispatcher (requires a real Postgres via DATABASE_URL)', () => {
  const app = createApp();
  let cookie: string[];
  let userId: string;
  let projectId: string;
  let ruleId: string;

  beforeAll(async () => {
    const email = `budget-checker-${randomUUID()}@example.com`;
    const signUpRes = await request(app)
      .post('/api/auth/sign-up/email')
      .send({ email, password: 'correct-horse-battery', name: 'Budget Checker Test' });
    cookie = signUpRes.headers['set-cookie'];
    userId = signUpRes.body.user.id;
    // plus plan: allows both budget-rule creation (Plan 4 gate) and the slack alert channel
    await db.update(users).set({ plan: 'plus' }).where(eq(users.id, userId));

    const projectRes = await request(app)
      .post('/api/v1/projects')
      .set('Cookie', cookie)
      .send({ name: 'Budget Checker Project' });
    projectId = projectRes.body.project.id;
    // no API exposes slackWebhookUrl/customWebhookUrl yet (Plan 3 deferred it) — direct write
    await db
      .update(projects)
      .set({ slackWebhookUrl: 'https://hooks.slack.test/budget-checker' })
      .where(eq(projects.id, projectId));

    await request(app)
      .post('/api/v1/connections')
      .set('Cookie', cookie)
      .send({ projectId, provider: 'openai', apiKey: 'sk-admin-budget-checker-test' });

    // threshold trivially low so a single poll's usage always crosses it
    const [rule] = await db
      .insert(budgetRules)
      .values({
        projectId,
        userId,
        budgetWindow: 'daily',
        limitUsd: '0.01',
        thresholdPct: 1,
        action: 'alert',
      })
      .returning();
    ruleId = rule!.id;
  });

  // ponytail: 15s — each of these tests does a poll (provider fetch + upsert) plus a full
  // budgetChecker pass (rule lookup, 2 spend-sum queries, dedup check, alert+notification
  // insert, dispatch's 2 lookups) — more DB round trips than the default 5s timeout allows.
  it('poll crossing the threshold writes alert_log + notifications and dispatches email + slack', async () => {
    // large, round-number token counts — alert_log.spend_at_trigger is numeric(10,2),
    // so the resulting cost must already be clean to 2 decimals or the DB rounds it
    stubProviderFetch({ openai: [{ model: 'gpt-4.1', input_tokens: 500_000, output_tokens: 100_000 }] });

    const res = await request(app).post('/api/v1/poll').set('Cookie', cookie);
    expect(res.status).toBe(200);

    const alerts = await db.select().from(alertLog).where(eq(alertLog.ruleId, ruleId));
    expect(alerts).toHaveLength(1);
    expect(alerts[0]!.status).toBe('active');
    expect(Number(alerts[0]!.spendAtTrigger)).toBeCloseTo(1.8, 5);
    expect(alerts[0]!.notifiedVia).toEqual(expect.arrayContaining(['email', 'slack']));
    expect((alerts[0]!.deliveryStatus as Record<string, { ok: boolean }>).slack.ok).toBe(true);

    const notes = await db.select().from(notifications).where(eq(notifications.userId, userId));
    expect(notes.some((n) => n.type === 'budget_alert')).toBe(true);
  }, 15000);

  it('re-polling within the dedup window does not create a second alert', async () => {
    // large, round-number token counts — alert_log.spend_at_trigger is numeric(10,2),
    // so the resulting cost must already be clean to 2 decimals or the DB rounds it
    stubProviderFetch({ openai: [{ model: 'gpt-4.1', input_tokens: 500_000, output_tokens: 100_000 }] });

    const res = await request(app).post('/api/v1/poll').set('Cookie', cookie);
    expect(res.status).toBe(200);

    const alerts = await db.select().from(alertLog).where(eq(alertLog.ruleId, ruleId));
    expect(alerts).toHaveLength(1);
  }, 15000);

  it('does not alert a rule whose threshold is not crossed', async () => {
    const [otherProject] = await db
      .insert(projects)
      .values({ userId, name: 'Under Budget Project' })
      .returning();
    const [otherRule] = await db
      .insert(budgetRules)
      .values({
        projectId: otherProject!.id,
        userId,
        budgetWindow: 'daily',
        limitUsd: '1000.00',
        thresholdPct: 80,
        action: 'alert',
      })
      .returning();

    const otherConnectionRes = await request(app)
      .post('/api/v1/connections')
      .set('Cookie', cookie)
      .send({ projectId: otherProject!.id, provider: 'anthropic', apiKey: 'sk-ant-admin-test' });

    stubProviderFetch({
      openai: [{ model: 'gpt-4.1', input_tokens: 1000, output_tokens: 200 }],
      anthropic: [
        { model: 'claude-haiku-4-5', uncached_input_tokens: 100, cache_read_input_tokens: 0, output_tokens: 20 },
      ],
    });

    const res = await request(app).post('/api/v1/poll').set('Cookie', cookie);
    expect(res.status).toBe(200);
    expect(
      res.body.results.some(
        (r: { connectionId: string }) => r.connectionId === otherConnectionRes.body.connection.id,
      ),
    ).toBe(true);

    const alerts = await db.select().from(alertLog).where(eq(alertLog.ruleId, otherRule!.id));
    expect(alerts).toHaveLength(0);
  }, 15000);

  it('deactivated rules are never evaluated', async () => {
    await db.update(budgetRules).set({ isActive: false }).where(eq(budgetRules.id, ruleId));
    const alertsBefore = await db.select().from(alertLog).where(eq(alertLog.ruleId, ruleId));

    stubProviderFetch({
      openai: [{ model: 'gpt-4.1', input_tokens: 5000, output_tokens: 1000 }],
      anthropic: [
        { model: 'claude-haiku-4-5', uncached_input_tokens: 100, cache_read_input_tokens: 0, output_tokens: 20 },
      ],
    });
    await request(app).post('/api/v1/poll').set('Cookie', cookie);

    const alertsAfter = await db.select().from(alertLog).where(eq(alertLog.ruleId, ruleId));
    expect(alertsAfter).toHaveLength(alertsBefore.length);
  }, 15000);
});
