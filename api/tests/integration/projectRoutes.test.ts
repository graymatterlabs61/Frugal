import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { randomUUID } from 'node:crypto';
import { createApp } from '../../src/app.js';

describe('projects routes (requires a real Postgres via DATABASE_URL)', () => {
  const app = createApp();
  let cookie: string[];
  let projectId: string;

  beforeAll(async () => {
    const email = `projects-${randomUUID()}@example.com`;
    const signUpRes = await request(app)
      .post('/api/auth/sign-up/email')
      .send({ email, password: 'correct-horse-battery', name: 'Projects Test' });
    cookie = signUpRes.headers['set-cookie'];
  });

  it('rejects unauthenticated requests', async () => {
    const res = await request(app).get('/api/v1/projects');
    expect(res.status).toBe(401);
  });

  it('starts with an empty project list', async () => {
    const res = await request(app).get('/api/v1/projects').set('Cookie', cookie);
    expect(res.status).toBe(200);
    expect(res.body.projects).toEqual([]);
  });

  it('creates a project', async () => {
    const res = await request(app)
      .post('/api/v1/projects')
      .set('Cookie', cookie)
      .send({ name: 'My Project', description: 'test project', color: 'blue' });
    expect(res.status).toBe(201);
    expect(res.body.project.name).toBe('My Project');
    expect(res.body.project.userId).toBeTruthy();
    projectId = res.body.project.id;
  });

  it('fetches the created project by id', async () => {
    const res = await request(app).get(`/api/v1/projects/${projectId}`).set('Cookie', cookie);
    expect(res.status).toBe(200);
    expect(res.body.project.id).toBe(projectId);
  });

  it('rejects an unknown field on create', async () => {
    const res = await request(app)
      .post('/api/v1/projects')
      .set('Cookie', cookie)
      .send({ name: 'x', orgId: 'sneaky' });
    expect(res.status).toBe(400);
  });

  it('rejects create beyond the free-plan project limit (1)', async () => {
    const res = await request(app)
      .post('/api/v1/projects')
      .set('Cookie', cookie)
      .send({ name: 'Second Project' });
    expect(res.status).toBe(403);
    expect(res.body.error.code).toBe('FORBIDDEN');
  });

  it('updates the project', async () => {
    const res = await request(app)
      .patch(`/api/v1/projects/${projectId}`)
      .set('Cookie', cookie)
      .send({ name: 'Renamed' });
    expect(res.status).toBe(200);
    expect(res.body.project.name).toBe('Renamed');
  });

  it("404s fetching another user's project", async () => {
    const otherEmail = `projects-other-${randomUUID()}@example.com`;
    const otherSignUp = await request(app)
      .post('/api/auth/sign-up/email')
      .send({ email: otherEmail, password: 'correct-horse-battery', name: 'Other User' });
    const otherCookie = otherSignUp.headers['set-cookie'];

    const res = await request(app).get(`/api/v1/projects/${projectId}`).set('Cookie', otherCookie);
    expect(res.status).toBe(404);
  });

  it('deletes the project', async () => {
    const res = await request(app).delete(`/api/v1/projects/${projectId}`).set('Cookie', cookie);
    expect(res.status).toBe(204);
  });

  it('404s fetching the deleted project', async () => {
    const res = await request(app).get(`/api/v1/projects/${projectId}`).set('Cookie', cookie);
    expect(res.status).toBe(404);
  });
});
