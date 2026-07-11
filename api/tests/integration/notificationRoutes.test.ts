import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { randomUUID } from 'node:crypto';
import { createApp } from '../../src/app.js';
import { db } from '../../src/db/client.js';
import { notifications } from '../../src/db/schema.js';

describe('notifications routes (requires a real Postgres via DATABASE_URL)', () => {
  const app = createApp();
  let cookie: string[];
  let userId: string;
  let notificationId: string;

  beforeAll(async () => {
    const email = `notifications-${randomUUID()}@example.com`;
    const signUpRes = await request(app)
      .post('/api/auth/sign-up/email')
      .send({ email, password: 'correct-horse-battery', name: 'Notifications Test' });
    cookie = signUpRes.headers['set-cookie'];
    userId = signUpRes.body.user.id;

    const [notification] = await db
      .insert(notifications)
      .values({ userId, type: 'budget_alert', title: 'Over budget', message: 'You are over budget' })
      .returning();
    notificationId = notification!.id;
  });

  it('rejects unauthenticated requests', async () => {
    const res = await request(app).get('/api/v1/notifications');
    expect(res.status).toBe(401);
  });

  it('lists the seeded notification as unread', async () => {
    const res = await request(app).get('/api/v1/notifications').set('Cookie', cookie);
    expect(res.status).toBe(200);
    expect(res.body.notifications).toHaveLength(1);
    expect(res.body.notifications[0].readAt).toBeNull();
  });

  it("404s marking another user's notification read", async () => {
    const otherEmail = `notifications-other-${randomUUID()}@example.com`;
    const otherSignUp = await request(app)
      .post('/api/auth/sign-up/email')
      .send({ email: otherEmail, password: 'correct-horse-battery', name: 'Other User' });
    const otherCookie = otherSignUp.headers['set-cookie'];

    const res = await request(app)
      .patch(`/api/v1/notifications/${notificationId}/read`)
      .set('Cookie', otherCookie);
    expect(res.status).toBe(404);
  });

  it('marks the notification read', async () => {
    const res = await request(app)
      .patch(`/api/v1/notifications/${notificationId}/read`)
      .set('Cookie', cookie);
    expect(res.status).toBe(200);
    expect(res.body.notification.readAt).toBeTruthy();
  });

  it('marks all remaining unread notifications read', async () => {
    await db.insert(notifications).values([
      { userId, type: 'system', title: 'Second', message: 'second message' },
      { userId, type: 'system', title: 'Third', message: 'third message' },
    ]);

    const res = await request(app).patch('/api/v1/notifications/read-all').set('Cookie', cookie);
    expect(res.status).toBe(204);

    const listRes = await request(app).get('/api/v1/notifications').set('Cookie', cookie);
    expect(
      (listRes.body.notifications as Array<{ readAt: string | null }>).every((n) => n.readAt !== null),
    ).toBe(true);
  });
});
