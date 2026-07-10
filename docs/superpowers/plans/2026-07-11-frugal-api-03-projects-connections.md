# Frugal API — Plan 3: Projects & Connections Domain Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** CRUD for personal (`org_id`-less) `projects` and `api_connections`, with server-side plan-based count limits on create, mounted at `/api/v1/projects` and `/api/v1/connections` behind `requireAuth`.

**Architecture:** First plan to use the `repositories/services/controllers` layering named in spec §11 — `routes/ → controllers/ (parse + respond) → services/ (ownership + tier-limit logic) → repositories/ (Drizzle queries)`. Zod `.strict()` schemas live in each controller; `schema.parse()` throws `ZodError`, which the existing `errorHandler` (Plan 1) already converts to a 400 `VALIDATION_ERROR` — no new error-handling code needed. Live provider-key validation, org-scoped projects, and `Dashboard`/`Organizations` endpoints are explicitly deferred (see design spec).

**Tech Stack adds:** none — `zod`, `drizzle-orm`, `express`, `supertest`, `vitest` are already dependencies from Plans 1–2.

**Spec:** `docs/superpowers/specs/2026-07-11-projects-connections-design.md` (authoritative for this plan — scope, routes, tier limits, authorization rule). Background: `docs/superpowers/specs/2026-06-25-frugal-backend-design.md` §5 (schema, already built), §6 (routes), §8 (security).

## Global Constraints

- Service lives at `api/`. All paths below are relative to `api/`.
- `"type": "module"` ESM, relative imports only, `.js` extensions on relative imports.
- `process.env` may be read ONLY inside `src/config/unifiedConfig.ts`.
- No `console.log` in `src` — Pino logger only.
- No raw SQL string concatenation — Drizzle only.
- Zod `.strict()` on every request body — reject unknown fields.
- Every task ends with typecheck + tests green, then a commit.
- Commands run from `api/`. PowerShell-compatible (no `&&` — use `;`).
- All new integration tests need a reachable Postgres via `DATABASE_URL` (Neon test branch, gitignored `api/.env` — source it before running: bash `set -a; source .env; set +a`).
- Cross-user access to another user's project/connection returns 404 `NotFoundError`, never 403 — existence is never disclosed.

---

### Task 1: `PLAN_LIMITS` tier-limit lookup

**Files:**
- Create: `src/utils/tier.ts`
- Test: `tests/unit/tier.test.ts`

**Interfaces:**
- Consumes: nothing
- Produces: `limitFor(plan: string | undefined, resource: 'projects' | 'connections'): number` — Tasks 3 and 4 call this to decide whether a create is allowed. Unknown or undefined plans resolve to the `free` tier's limits (fail safe, not fail open).

- [ ] **Step 1: Write the failing test** — `tests/unit/tier.test.ts`

```ts
import { describe, it, expect } from 'vitest';
import { limitFor } from '../../src/utils/tier.js';

describe('limitFor', () => {
  it('returns free-tier limits for the free plan', () => {
    expect(limitFor('free', 'projects')).toBe(1);
    expect(limitFor('free', 'connections')).toBe(1);
  });

  it('returns plus-tier limits', () => {
    expect(limitFor('plus', 'projects')).toBe(5);
    expect(limitFor('plus', 'connections')).toBe(3);
  });

  it('returns Infinity for pro and every corp/enterprise plan', () => {
    for (const plan of ['pro', 'corp_starter', 'corp_growth', 'corp_scale', 'enterprise']) {
      expect(limitFor(plan, 'projects')).toBe(Infinity);
      expect(limitFor(plan, 'connections')).toBe(Infinity);
    }
  });

  it('defaults to free-tier limits for unknown or undefined plans', () => {
    expect(limitFor(undefined, 'projects')).toBe(1);
    expect(limitFor('nonsense', 'connections')).toBe(1);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/unit/tier.test.ts`
Expected: FAIL — module not found

- [ ] **Step 3: Write `src/utils/tier.ts`**

```ts
export type PlanTier =
  | 'free'
  | 'plus'
  | 'pro'
  | 'corp_starter'
  | 'corp_growth'
  | 'corp_scale'
  | 'enterprise';

const PLAN_LIMITS: Record<PlanTier, { projects: number; connections: number }> = {
  free: { projects: 1, connections: 1 },
  plus: { projects: 5, connections: 3 },
  pro: { projects: Infinity, connections: Infinity },
  corp_starter: { projects: Infinity, connections: Infinity },
  corp_growth: { projects: Infinity, connections: Infinity },
  corp_scale: { projects: Infinity, connections: Infinity },
  enterprise: { projects: Infinity, connections: Infinity },
};

function isPlanTier(value: string): value is PlanTier {
  return value in PLAN_LIMITS;
}

/** Unknown/undefined plans fall back to the `free` tier's limits (fail safe). */
export function limitFor(plan: string | undefined, resource: 'projects' | 'connections'): number {
  const tier: PlanTier = plan !== undefined && isPlanTier(plan) ? plan : 'free';
  return PLAN_LIMITS[tier][resource];
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/unit/tier.test.ts; npm run typecheck`
Expected: PASS (4 tests), typecheck exit 0

- [ ] **Step 5: Commit**

```bash
git add src/utils/tier.ts tests/unit/tier.test.ts
git commit -m "feat(api): PLAN_LIMITS tier lookup for project/connection create caps"
```

---

### Task 2: `requireAuth` carries the caller's plan

**Files:**
- Modify: `src/types/express.d.ts`
- Modify: `src/middleware/requireAuth.ts`
- Modify: `tests/integration/requireAuth.test.ts`

**Interfaces:**
- Consumes: `session.user.plan` (better-auth session — already populated via the `plan` `additionalFields` entry in `src/auth.ts`, defaulting to `'free'` at sign-up)
- Produces: `req.userPlan?: string`, set by `requireAuth` alongside the existing `req.userId` — Tasks 3 and 4's controllers read it and pass it to `limitFor`

- [ ] **Step 1: Write the failing test** — replace `tests/integration/requireAuth.test.ts` in full

```ts
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

  it('sets req.userId and req.userPlan from a real session (requires DATABASE_URL)', async () => {
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
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `set -a; source .env; set +a; npx vitest run tests/integration/requireAuth.test.ts`
Expected: first test PASSES (401 case unchanged), second test FAILS — `res.body.userPlan` is `undefined`, not `'free'`

- [ ] **Step 3: Modify `src/types/express.d.ts`**

```ts
declare global {
  namespace Express {
    interface Request {
      id: string;
      userId?: string;
      userPlan?: string;
    }
  }
}

export {};
```

- [ ] **Step 4: Modify `src/middleware/requireAuth.ts`**

```ts
import type { Request, Response, NextFunction } from 'express';
import { fromNodeHeaders } from 'better-auth/node';
import { auth } from '../auth.js';
import { UnauthorizedError } from '../utils/errors.js';

export async function requireAuth(req: Request, _res: Response, next: NextFunction): Promise<void> {
  const session = await auth.api.getSession({ headers: fromNodeHeaders(req.headers) });
  if (!session) {
    next(new UnauthorizedError());
    return;
  }
  req.userId = session.user.id;
  req.userPlan = session.user.plan;
  next();
}
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `set -a; source .env; set +a; npx vitest run tests/integration/requireAuth.test.ts; npm run typecheck`
Expected: PASS (2 tests), typecheck exit 0

- [ ] **Step 6: Commit**

```bash
git add src/types/express.d.ts src/middleware/requireAuth.ts tests/integration/requireAuth.test.ts
git commit -m "feat(api): requireAuth also sets req.userPlan from the session"
```

---

### Task 3: Projects domain (repository → service → controller → routes)

**Files:**
- Create: `src/repositories/ProjectRepository.ts`
- Create: `src/services/ProjectService.ts`
- Create: `src/controllers/ProjectController.ts`
- Create: `src/routes/projectRoutes.ts`
- Modify: `src/app.ts`
- Test: `tests/integration/projectRoutes.test.ts`

**Interfaces:**
- Consumes: `db` (`src/db/client.ts`), `projects` table (`src/db/schema.ts`), `limitFor` (Task 1), `requireAuth`/`req.userId`/`req.userPlan` (Task 2, Plan 2), `asyncErrorWrapper`/`ValidationError`/`NotFoundError`/`ForbiddenError` (Plan 1)
- Produces: `projectRoutes: Router`, mounted at `/api/v1/projects` — Task 4 does not depend on this, but later plans (budget rules, alerts) will import `ProjectRepository`/`ProjectService` the same way

- [ ] **Step 1: Write the failing test** — `tests/integration/projectRoutes.test.ts`

```ts
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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `set -a; source .env; set +a; npx vitest run tests/integration/projectRoutes.test.ts`
Expected: FAIL — every request 404s (`Route not found`), route not mounted yet

- [ ] **Step 3: Write `src/repositories/ProjectRepository.ts`**

```ts
import { eq, and, count } from 'drizzle-orm';
import { db } from '../db/client.js';
import { projects } from '../db/schema.js';

export const ProjectRepository = {
  async listForUser(userId: string) {
    return db.select().from(projects).where(eq(projects.userId, userId));
  },

  async countForUser(userId: string): Promise<number> {
    const [row] = await db
      .select({ value: count() })
      .from(projects)
      .where(eq(projects.userId, userId));
    return Number(row?.value ?? 0);
  },

  async findByIdForUser(id: string, userId: string) {
    const [row] = await db
      .select()
      .from(projects)
      .where(and(eq(projects.id, id), eq(projects.userId, userId)));
    return row;
  },

  async create(userId: string, data: { name: string; description?: string; color?: string }) {
    const [row] = await db
      .insert(projects)
      .values({ userId, name: data.name, description: data.description, color: data.color })
      .returning();
    return row!;
  },

  async update(
    id: string,
    userId: string,
    data: { name?: string; description?: string; color?: string },
  ) {
    const [row] = await db
      .update(projects)
      .set({ ...data, updatedAt: new Date() })
      .where(and(eq(projects.id, id), eq(projects.userId, userId)))
      .returning();
    return row;
  },

  async delete(id: string, userId: string): Promise<boolean> {
    const result = await db
      .delete(projects)
      .where(and(eq(projects.id, id), eq(projects.userId, userId)))
      .returning({ id: projects.id });
    return result.length > 0;
  },
};
```

- [ ] **Step 4: Write `src/services/ProjectService.ts`**

```ts
import { ProjectRepository } from '../repositories/ProjectRepository.js';
import { limitFor } from '../utils/tier.js';
import { ForbiddenError, NotFoundError } from '../utils/errors.js';

export const ProjectService = {
  list(userId: string) {
    return ProjectRepository.listForUser(userId);
  },

  async get(id: string, userId: string) {
    const project = await ProjectRepository.findByIdForUser(id, userId);
    if (!project) throw new NotFoundError('Project not found');
    return project;
  },

  async create(
    userId: string,
    userPlan: string | undefined,
    data: { name: string; description?: string; color?: string },
  ) {
    const existing = await ProjectRepository.countForUser(userId);
    if (existing >= limitFor(userPlan, 'projects')) {
      throw new ForbiddenError('Project limit reached for your plan');
    }
    return ProjectRepository.create(userId, data);
  },

  async update(
    id: string,
    userId: string,
    data: { name?: string; description?: string; color?: string },
  ) {
    const project = await ProjectRepository.update(id, userId, data);
    if (!project) throw new NotFoundError('Project not found');
    return project;
  },

  async remove(id: string, userId: string): Promise<void> {
    const deleted = await ProjectRepository.delete(id, userId);
    if (!deleted) throw new NotFoundError('Project not found');
  },
};
```

- [ ] **Step 5: Write `src/controllers/ProjectController.ts`**

```ts
import type { Request, Response } from 'express';
import { z } from 'zod';
import { ProjectService } from '../services/ProjectService.js';

const createProjectSchema = z
  .object({
    name: z.string().min(1).max(200),
    description: z.string().max(2000).optional(),
    color: z.string().max(50).optional(),
  })
  .strict();

const updateProjectSchema = createProjectSchema.partial();

export const ProjectController = {
  async list(req: Request, res: Response): Promise<void> {
    const projects = await ProjectService.list(req.userId!);
    res.json({ projects });
  },

  async get(req: Request, res: Response): Promise<void> {
    const project = await ProjectService.get(req.params.id!, req.userId!);
    res.json({ project });
  },

  async create(req: Request, res: Response): Promise<void> {
    const body = createProjectSchema.parse(req.body);
    const project = await ProjectService.create(req.userId!, req.userPlan, body);
    res.status(201).json({ project });
  },

  async update(req: Request, res: Response): Promise<void> {
    const body = updateProjectSchema.parse(req.body);
    const project = await ProjectService.update(req.params.id!, req.userId!, body);
    res.json({ project });
  },

  async remove(req: Request, res: Response): Promise<void> {
    await ProjectService.remove(req.params.id!, req.userId!);
    res.status(204).send();
  },
};
```

- [ ] **Step 6: Write `src/routes/projectRoutes.ts`**

```ts
import { Router } from 'express';
import { requireAuth } from '../middleware/requireAuth.js';
import { asyncErrorWrapper } from '../middleware/asyncErrorWrapper.js';
import { ProjectController } from '../controllers/ProjectController.js';

export const projectRoutes = Router();

projectRoutes.use(requireAuth);
projectRoutes.get('/', asyncErrorWrapper(ProjectController.list));
projectRoutes.post('/', asyncErrorWrapper(ProjectController.create));
projectRoutes.get('/:id', asyncErrorWrapper(ProjectController.get));
projectRoutes.patch('/:id', asyncErrorWrapper(ProjectController.update));
projectRoutes.delete('/:id', asyncErrorWrapper(ProjectController.remove));
```

- [ ] **Step 7: Modify `src/app.ts`** — mount the router

Replace:
```ts
  // Plans 3–6 mount domain routers here under /api/v1/
```
with:
```ts
  app.use('/api/v1/projects', projectRoutes);

  // Plans 4–6 mount domain routers here under /api/v1/
```

And add the import alongside the other route imports at the top:
```ts
import { projectRoutes } from './routes/projectRoutes.js';
```

- [ ] **Step 8: Run tests to verify they pass**

Run: `set -a; source .env; set +a; npx vitest run tests/integration/projectRoutes.test.ts tests/integration/app.test.ts; npm run typecheck`
Expected: PASS (9 + existing app tests), typecheck exit 0

- [ ] **Step 9: Commit**

```bash
git add src/repositories/ProjectRepository.ts src/services/ProjectService.ts src/controllers/ProjectController.ts src/routes/projectRoutes.ts src/app.ts tests/integration/projectRoutes.test.ts
git commit -m "feat(api): Projects CRUD — repository/service/controller/routes, tier-limited create"
```

---

### Task 4: Connections domain (repository → service → controller → routes)

**Files:**
- Modify: `src/db/schema.ts` (add one exported type alias)
- Create: `src/repositories/ConnectionRepository.ts`
- Create: `src/services/ConnectionService.ts`
- Create: `src/controllers/ConnectionController.ts`
- Create: `src/routes/connectionRoutes.ts`
- Modify: `src/app.ts`
- Test: `tests/integration/connectionRoutes.test.ts`

**Interfaces:**
- Consumes: `db`, `apiConnections`/`projects` tables, `Provider` type (this task, `src/db/schema.ts`), `limitFor` (Task 1), `encrypt` (Plan 1's `src/utils/encryption.ts`), `requireAuth`/`req.userId`/`req.userPlan` (Task 2)
- Produces: `connectionRoutes: Router`, mounted at `/api/v1/connections`

- [ ] **Step 1: Write the failing test** — `tests/integration/connectionRoutes.test.ts`

```ts
import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { randomUUID } from 'node:crypto';
import { createApp } from '../../src/app.js';

describe('connections routes (requires a real Postgres via DATABASE_URL)', () => {
  const app = createApp();
  let cookie: string[];
  let projectId: string;
  let connectionId: string;

  beforeAll(async () => {
    const email = `connections-${randomUUID()}@example.com`;
    const signUpRes = await request(app)
      .post('/api/auth/sign-up/email')
      .send({ email, password: 'correct-horse-battery', name: 'Connections Test' });
    cookie = signUpRes.headers['set-cookie'];

    const projectRes = await request(app)
      .post('/api/v1/projects')
      .set('Cookie', cookie)
      .send({ name: 'Connections Project' });
    projectId = projectRes.body.project.id;
  });

  it('rejects unauthenticated requests', async () => {
    const res = await request(app).get('/api/v1/connections');
    expect(res.status).toBe(401);
  });

  it('starts with an empty connection list', async () => {
    const res = await request(app).get('/api/v1/connections').set('Cookie', cookie);
    expect(res.status).toBe(200);
    expect(res.body.connections).toEqual([]);
  });

  it("404s creating a connection under a project id that doesn't belong to the caller", async () => {
    const res = await request(app)
      .post('/api/v1/connections')
      .set('Cookie', cookie)
      .send({ projectId: randomUUID(), provider: 'openai', apiKey: 'sk-test-123' });
    expect(res.status).toBe(404);
  });

  it('rejects an invalid provider', async () => {
    const res = await request(app)
      .post('/api/v1/connections')
      .set('Cookie', cookie)
      .send({ projectId, provider: 'not-a-provider', apiKey: 'sk-test-123' });
    expect(res.status).toBe(400);
  });

  it('creates a connection and never echoes the key or its ciphertext', async () => {
    const res = await request(app)
      .post('/api/v1/connections')
      .set('Cookie', cookie)
      .send({ projectId, provider: 'openai', label: 'Prod key', apiKey: 'sk-test-1234567890' });
    expect(res.status).toBe(201);
    expect(res.body.connection.provider).toBe('openai');
    expect(res.body.connection.apiKeySuffix).toBe('7890');
    expect(JSON.stringify(res.body)).not.toContain('sk-test-1234567890');
    expect(res.body.connection.apiKeyEncrypted).toBeUndefined();
    connectionId = res.body.connection.id;
  });

  it('rejects create beyond the free-plan connection limit (1)', async () => {
    const res = await request(app)
      .post('/api/v1/connections')
      .set('Cookie', cookie)
      .send({ projectId, provider: 'anthropic', apiKey: 'sk-ant-test' });
    expect(res.status).toBe(403);
    expect(res.body.error.code).toBe('FORBIDDEN');
  });

  it('updates label and isActive', async () => {
    const res = await request(app)
      .patch(`/api/v1/connections/${connectionId}`)
      .set('Cookie', cookie)
      .send({ label: 'Renamed', isActive: false });
    expect(res.status).toBe(200);
    expect(res.body.connection.label).toBe('Renamed');
    expect(res.body.connection.isActive).toBe(false);
  });

  it("404s updating another user's connection", async () => {
    const otherEmail = `connections-other-${randomUUID()}@example.com`;
    const otherSignUp = await request(app)
      .post('/api/auth/sign-up/email')
      .send({ email: otherEmail, password: 'correct-horse-battery', name: 'Other User' });
    const otherCookie = otherSignUp.headers['set-cookie'];

    const res = await request(app)
      .patch(`/api/v1/connections/${connectionId}`)
      .set('Cookie', otherCookie)
      .send({ label: 'Hijacked' });
    expect(res.status).toBe(404);
  });

  it('deletes the connection', async () => {
    const res = await request(app)
      .delete(`/api/v1/connections/${connectionId}`)
      .set('Cookie', cookie);
    expect(res.status).toBe(204);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `set -a; source .env; set +a; npx vitest run tests/integration/connectionRoutes.test.ts`
Expected: FAIL — every `/api/v1/connections` request 404s, route not mounted yet

- [ ] **Step 3: Modify `src/db/schema.ts`** — add a `Provider` type alias next to the existing type exports at the bottom of the file

```ts
export type Provider = (typeof providerEnum.enumValues)[number];
```

- [ ] **Step 4: Write `src/repositories/ConnectionRepository.ts`**

```ts
import { eq, and, count } from 'drizzle-orm';
import { db } from '../db/client.js';
import { apiConnections, projects, type Provider } from '../db/schema.js';

export const ConnectionRepository = {
  async listForUser(userId: string) {
    return db.select().from(apiConnections).where(eq(apiConnections.userId, userId));
  },

  async countForUser(userId: string): Promise<number> {
    const [row] = await db
      .select({ value: count() })
      .from(apiConnections)
      .where(eq(apiConnections.userId, userId));
    return Number(row?.value ?? 0);
  },

  async findProjectForUser(projectId: string, userId: string) {
    const [row] = await db
      .select({ id: projects.id })
      .from(projects)
      .where(and(eq(projects.id, projectId), eq(projects.userId, userId)));
    return row;
  },

  async findByIdForUser(id: string, userId: string) {
    const [row] = await db
      .select()
      .from(apiConnections)
      .where(and(eq(apiConnections.id, id), eq(apiConnections.userId, userId)));
    return row;
  },

  async create(
    userId: string,
    data: {
      projectId: string;
      provider: Provider;
      label?: string;
      apiKeyEncrypted: string;
      apiKeySuffix: string;
    },
  ) {
    const [row] = await db
      .insert(apiConnections)
      .values({
        userId,
        projectId: data.projectId,
        provider: data.provider,
        label: data.label,
        apiKeyEncrypted: data.apiKeyEncrypted,
        apiKeySuffix: data.apiKeySuffix,
      })
      .returning();
    return row!;
  },

  async update(id: string, userId: string, data: { label?: string; isActive?: boolean }) {
    const [row] = await db
      .update(apiConnections)
      .set(data)
      .where(and(eq(apiConnections.id, id), eq(apiConnections.userId, userId)))
      .returning();
    return row;
  },

  async delete(id: string, userId: string): Promise<boolean> {
    const result = await db
      .delete(apiConnections)
      .where(and(eq(apiConnections.id, id), eq(apiConnections.userId, userId)))
      .returning({ id: apiConnections.id });
    return result.length > 0;
  },
};
```

- [ ] **Step 5: Write `src/services/ConnectionService.ts`**

```ts
import { ConnectionRepository } from '../repositories/ConnectionRepository.js';
import { limitFor } from '../utils/tier.js';
import { encrypt } from '../utils/encryption.js';
import { ForbiddenError, NotFoundError } from '../utils/errors.js';
import type { Provider } from '../db/schema.js';

export const ConnectionService = {
  list(userId: string) {
    return ConnectionRepository.listForUser(userId);
  },

  async create(
    userId: string,
    userPlan: string | undefined,
    data: { projectId: string; provider: Provider; label?: string; apiKey: string },
  ) {
    const project = await ConnectionRepository.findProjectForUser(data.projectId, userId);
    if (!project) throw new NotFoundError('Project not found');

    const existing = await ConnectionRepository.countForUser(userId);
    if (existing >= limitFor(userPlan, 'connections')) {
      throw new ForbiddenError('Connection limit reached for your plan');
    }

    const apiKeyEncrypted = encrypt(data.apiKey);
    const apiKeySuffix = data.apiKey.slice(-4);

    return ConnectionRepository.create(userId, {
      projectId: data.projectId,
      provider: data.provider,
      label: data.label,
      apiKeyEncrypted,
      apiKeySuffix,
    });
  },

  async update(id: string, userId: string, data: { label?: string; isActive?: boolean }) {
    const connection = await ConnectionRepository.update(id, userId, data);
    if (!connection) throw new NotFoundError('Connection not found');
    return connection;
  },

  async remove(id: string, userId: string): Promise<void> {
    const deleted = await ConnectionRepository.delete(id, userId);
    if (!deleted) throw new NotFoundError('Connection not found');
  },
};
```

- [ ] **Step 6: Write `src/controllers/ConnectionController.ts`**

```ts
import type { Request, Response } from 'express';
import { z } from 'zod';
import { ConnectionService } from '../services/ConnectionService.js';
import { providerEnum, type apiConnections } from '../db/schema.js';

const createConnectionSchema = z
  .object({
    projectId: z.string().uuid(),
    provider: z.enum(providerEnum.enumValues),
    label: z.string().max(200).optional(),
    apiKey: z.string().min(1).max(500),
  })
  .strict();

const updateConnectionSchema = z
  .object({
    label: z.string().max(200).optional(),
    isActive: z.boolean().optional(),
  })
  .strict();

function serializeConnection(connection: typeof apiConnections.$inferSelect) {
  const { apiKeyEncrypted: _apiKeyEncrypted, ...safe } = connection;
  return safe;
}

export const ConnectionController = {
  async list(req: Request, res: Response): Promise<void> {
    const connections = await ConnectionService.list(req.userId!);
    res.json({ connections: connections.map(serializeConnection) });
  },

  async create(req: Request, res: Response): Promise<void> {
    const body = createConnectionSchema.parse(req.body);
    const connection = await ConnectionService.create(req.userId!, req.userPlan, body);
    res.status(201).json({ connection: serializeConnection(connection) });
  },

  async update(req: Request, res: Response): Promise<void> {
    const body = updateConnectionSchema.parse(req.body);
    const connection = await ConnectionService.update(req.params.id!, req.userId!, body);
    res.json({ connection: serializeConnection(connection) });
  },

  async remove(req: Request, res: Response): Promise<void> {
    await ConnectionService.remove(req.params.id!, req.userId!);
    res.status(204).send();
  },
};
```

- [ ] **Step 7: Write `src/routes/connectionRoutes.ts`**

```ts
import { Router } from 'express';
import { requireAuth } from '../middleware/requireAuth.js';
import { asyncErrorWrapper } from '../middleware/asyncErrorWrapper.js';
import { ConnectionController } from '../controllers/ConnectionController.js';

export const connectionRoutes = Router();

connectionRoutes.use(requireAuth);
connectionRoutes.get('/', asyncErrorWrapper(ConnectionController.list));
connectionRoutes.post('/', asyncErrorWrapper(ConnectionController.create));
connectionRoutes.patch('/:id', asyncErrorWrapper(ConnectionController.update));
connectionRoutes.delete('/:id', asyncErrorWrapper(ConnectionController.remove));
```

- [ ] **Step 8: Modify `src/app.ts`** — mount the router

Replace:
```ts
  app.use('/api/v1/projects', projectRoutes);

  // Plans 4–6 mount domain routers here under /api/v1/
```
with:
```ts
  app.use('/api/v1/projects', projectRoutes);
  app.use('/api/v1/connections', connectionRoutes);

  // Plans 5–6 mount domain routers here under /api/v1/
```

And add the import alongside `projectRoutes`:
```ts
import { connectionRoutes } from './routes/connectionRoutes.js';
```

- [ ] **Step 9: Run tests to verify they pass**

Run: `set -a; source .env; set +a; npm test; npm run typecheck`
Expected: ALL tests pass (unit + integration, full suite), typecheck exit 0

- [ ] **Step 10: Commit**

```bash
git add src/db/schema.ts src/repositories/ConnectionRepository.ts src/services/ConnectionService.ts src/controllers/ConnectionController.ts src/routes/connectionRoutes.ts src/app.ts tests/integration/connectionRoutes.test.ts
git commit -m "feat(api): Connections CRUD — encrypted key storage, tier-limited create, never echoes key"
```

---

## Definition of Done (Plan 3)

- `npm test` green with `DATABASE_URL` pointed at a reachable Postgres, all Plan 1/2 tests plus this plan's new tests
- `npm run typecheck` exit 0
- A free-plan user can create exactly 1 project and 1 connection; the 2nd attempt at each returns 403 `FORBIDDEN`
- A user cannot GET/PATCH/DELETE another user's project or connection (404, not 403 — existence never disclosed)
- `api_connections.api_key_encrypted` never appears in any response body
- Zero `process.env` reads outside `unifiedConfig.ts`, zero `console.log` in `src/`

## Deferred to later plans (explicit, not forgotten)

- **Live provider-key validation** (real HTTP call to OpenAI/Anthropic/etc. on connection create) — needs per-provider client modules; lands with the polling-worker plan
- **Org-scoped projects** (`projects.org_id` set) — Organizations (Plan 6)
- **`requireCorporate`/`requirePro` gate middleware** — first real need is `/orgs/*` (Plan 6); Projects/Connections only needed the count-based `limitFor` check built here
- **Dashboard endpoints** (`GET /dashboard*`) — depend on `usage_records`, populated only by the (unbuilt) polling worker
- **API key rotation endpoint** — `PATCH /connections/:id` intentionally does not accept a new `apiKey`; rotating a key is delete + recreate
- **Budget rules, alerts, notifications, ingest, billing, organizations** — Plans 4–6 per the original spec's route list (§6)
