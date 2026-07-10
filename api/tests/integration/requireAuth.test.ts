import { describe, it, expect } from 'vitest';
import express from 'express';
import request from 'supertest';
import { randomUUID } from 'node:crypto';
import { toNodeHandler } from 'better-auth/node';
import { auth } from '../../src/auth.js';
import { requireAuth } from '../../src/middleware/requireAuth.js';
import { errorHandler } from '../../src/middleware/errorHandler.js';

function buildTestApp() {
  const app = express();
  app.use('/api/auth', toNodeHandler(auth));
  app.use(express.json());
  app.get('/protected', requireAuth, (req, res) => {
    res.json({ userId: req.userId, userPlan: req.userPlan });
  });
  app.use(errorHandler);
  return app;
}

describe('requireAuth', () => {
  it('rejects a request with no session cookie/header', async () => {
    const app = buildTestApp();

    const res = await request(app).get('/protected');

    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('UNAUTHORIZED');
  });

  // ponytail: 20s — scrypt password hashing on sign-up exceeds vitest's 5s default (see authFlow.test.ts)
  it(
    'sets req.userId and req.userPlan from a real session (requires DATABASE_URL)',
    async () => {
      const app = buildTestApp();
      const email = `require-auth-${randomUUID()}@example.com`;
      const signUpRes = await request(app)
        .post('/api/auth/sign-up/email')
        .send({ email, password: 'correct-horse-battery', name: 'Require Auth Test' });
      expect(signUpRes.status).toBe(200);
      const cookie = signUpRes.headers['set-cookie'];

      const res = await request(app).get('/protected').set('Cookie', cookie);

      expect(res.status).toBe(200);
      expect(res.body.userId).toBe(signUpRes.body.user.id);
      expect(res.body.userPlan).toBe('free');
    },
    20000,
  );
});
