import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { randomUUID } from 'node:crypto';
import { createApp } from '../../src/app.js';

describe('auth flow (requires a real Postgres via DATABASE_URL)', () => {
  const app = createApp();
  const email = `flow-${randomUUID()}@example.com`;
  const password = 'correct-horse-battery';

  // ponytail: 20s — sequential scrypt password hashing across 5 requests exceeds vitest's 5s default
  it('signs up, signs in, reads the session, updates the profile, and changes the password', async () => {
    const signUpRes = await request(app)
      .post('/api/auth/sign-up/email')
      .send({ email, password, name: 'Flow Test' });
    expect(signUpRes.status).toBe(200);
    const cookie = signUpRes.headers['set-cookie'];
    expect(cookie).toBeTruthy();

    const sessionRes = await request(app).get('/api/auth/get-session').set('Cookie', cookie);
    expect(sessionRes.status).toBe(200);
    expect(sessionRes.body.user.email).toBe(email);

    const updateRes = await request(app)
      .post('/api/auth/update-user')
      .set('Cookie', cookie)
      .send({ name: 'Updated Name' });
    expect(updateRes.status).toBe(200);

    const changePwRes = await request(app)
      .post('/api/auth/change-password')
      .set('Cookie', cookie)
      .send({ currentPassword: password, newPassword: 'new-correct-horse-battery', revokeOtherSessions: false });
    expect(changePwRes.status).toBe(200);

    const reSignInRes = await request(app)
      .post('/api/auth/sign-in/email')
      .send({ email, password: 'new-correct-horse-battery' });
    expect(reSignInRes.status).toBe(200);

    const oldPwRes = await request(app).post('/api/auth/sign-in/email').send({ email, password });
    expect(oldPwRes.status).toBe(401);
  }, 20000);

  it('rejects sign-up with an already-registered email', async () => {
    const dupEmail = `dup-${randomUUID()}@example.com`;
    await request(app).post('/api/auth/sign-up/email').send({ email: dupEmail, password });
    const res = await request(app).post('/api/auth/sign-up/email').send({ email: dupEmail, password });
    // better-auth (installed version) returns 400 for a duplicate email, not the 422 in the original plan
    expect(res.status).toBe(400);
  });

  it('rate-limits sign-in after 5 attempts within the window', async () => {
    const rlEmail = `rl-${randomUUID()}@example.com`;
    for (let i = 0; i < 5; i++) {
      await request(app).post('/api/auth/sign-in/email').send({ email: rlEmail, password: 'wrong' });
    }
    const res = await request(app).post('/api/auth/sign-in/email').send({ email: rlEmail, password: 'wrong' });
    expect(res.status).toBe(429);
  }, 20000);
});
