import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { randomUUID } from 'node:crypto';
import { createApp } from '../../src/app.js';
import { db } from '../../src/db/client.js';
import { alertLog, projects } from '../../src/db/schema.js';

describe('alerts routes (requires a real Postgres via DATABASE_URL)', () => {
  const app = createApp();
  let cookie: string[];
  let alertId: string;

  beforeAll(async () => {
    const email = `alerts-${randomUUID()}@example.com`;
    const signUpRes = await request(app)
      .post('/api/auth/sign-up/email')
      .send({ email, password: 'correct-horse-battery', name: 'Alerts Test' });
    cookie = signUpRes.headers['set-cookie'];
    const userId = signUpRes.body.user.id as string;

    const [project] = await db
      .insert(projects)
      .values({ userId, name: 'Alerts Project' })
      .returning();
    const [alert] = await db
      .insert(alertLog)
      .values({
        userId,
        projectId: project!.id,
        spendAtTrigger: '85.00',
        limitUsd: '100.00',
        status: 'active',
      })
      .returning();
    alertId = alert!.id;
  });

  it('rejects unauthenticated requests', async () => {
    const res = await request(app).get('/api/v1/alerts');
    expect(res.status).toBe(401);
  });

  it('lists the seeded alert', async () => {
    const res = await request(app).get('/api/v1/alerts').set('Cookie', cookie);
    expect(res.status).toBe(200);
    expect(res.body.alerts).toHaveLength(1);
    expect(res.body.alerts[0].id).toBe(alertId);
    expect(res.body.alerts[0].status).toBe('active');
  });

  it('rejects setting status back to active', async () => {
    const res = await request(app)
      .patch(`/api/v1/alerts/${alertId}`)
      .set('Cookie', cookie)
      .send({ status: 'active' });
    expect(res.status).toBe(400);
  });

  it('rejects an unknown field', async () => {
    const res = await request(app)
      .patch(`/api/v1/alerts/${alertId}`)
      .set('Cookie', cookie)
      .send({ status: 'acknowledged', sneaky: true });
    expect(res.status).toBe(400);
  });

  it('acknowledges the alert', async () => {
    const res = await request(app)
      .patch(`/api/v1/alerts/${alertId}`)
      .set('Cookie', cookie)
      .send({ status: 'acknowledged' });
    expect(res.status).toBe(200);
    expect(res.body.alert.status).toBe('acknowledged');
    expect(res.body.alert.resolvedAt).toBeNull();
  });

  it('resolves the alert and sets resolvedAt', async () => {
    const res = await request(app)
      .patch(`/api/v1/alerts/${alertId}`)
      .set('Cookie', cookie)
      .send({ status: 'resolved' });
    expect(res.status).toBe(200);
    expect(res.body.alert.status).toBe('resolved');
    expect(res.body.alert.resolvedAt).toBeTruthy();
  });

  it("404s updating another user's alert", async () => {
    const otherEmail = `alerts-other-${randomUUID()}@example.com`;
    const otherSignUp = await request(app)
      .post('/api/auth/sign-up/email')
      .send({ email: otherEmail, password: 'correct-horse-battery', name: 'Other User' });
    const otherCookie = otherSignUp.headers['set-cookie'];

    const res = await request(app)
      .patch(`/api/v1/alerts/${alertId}`)
      .set('Cookie', otherCookie)
      .send({ status: 'acknowledged' });
    expect(res.status).toBe(404);
  });
});
