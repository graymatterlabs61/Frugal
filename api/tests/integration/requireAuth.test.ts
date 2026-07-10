import { describe, it, expect } from 'vitest';
import express from 'express';
import request from 'supertest';
import { requireAuth } from '../../src/middleware/requireAuth.js';
import { errorHandler } from '../../src/middleware/errorHandler.js';

describe('requireAuth', () => {
  it('rejects a request with no session cookie/header', async () => {
    const app = express();
    app.get('/protected', requireAuth, (req, res) => {
      res.json({ userId: (req as express.Request & { userId?: string }).userId });
    });
    app.use(errorHandler);

    const res = await request(app).get('/protected');

    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('UNAUTHORIZED');
  });
});
