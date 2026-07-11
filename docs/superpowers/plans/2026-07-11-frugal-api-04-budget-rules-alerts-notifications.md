# Frugal API — Plan 4: Budget Rules, Alerts & Notifications Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Full CRUD for `budget_rules` (tier-gated by `action`), read+acknowledge for `alert_log`, and read+mark-read for `notifications`, mounted at `/api/v1/budget-rules`, `/api/v1/alerts`, `/api/v1/notifications` behind `requireAuth`.

**Architecture:** Mirrors Plan 3's `repositories/services/controllers` layering exactly — `routes/ → controllers/ (parse + respond) → services/ (ownership + tier logic) → repositories/ (Drizzle only)`. `alert_log` and `notifications` rows are only ever written by the (unbuilt) polling worker's `budgetChecker`/`alertDispatcher` — since no plan for that worker exists yet, this plan's integration tests seed fixture rows with a direct Drizzle insert in their arrange step, then exercise the real `GET`/`PATCH` endpoints over real HTTP, same as every plan already seeds a signed-in user via better-auth's own DB writes before testing anything else.

**Tech Stack adds:** none — `zod`, `drizzle-orm`, `express`, `supertest`, `vitest` are already dependencies.

**Spec:** `docs/superpowers/specs/2026-07-11-budget-rules-alerts-notifications-design.md` (authoritative for this plan). Background: `docs/superpowers/specs/2026-06-25-frugal-backend-design.md` §5 (schema, already built), §6 (routes), §4 (tier table).

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
- Cross-user access to another user's budget rule/alert/notification returns 404 `NotFoundError`, never 403 — existence is never disclosed.
- `budgetRules.limitUsd` and `alertLog.spendAtTrigger`/`limitUsd` are Drizzle `numeric` columns typed as `string` (not `number`) for insert/select — the repository layer is the only place that converts a JS `number` to a fixed-2-decimal string (`.toFixed(2)`); services/controllers deal in plain `number`.
- On any Drizzle `.update(...).set(data)` call, only spread keys the client actually provided (via `{ ...rest }` after destructuring any field needing type conversion) — never write a key with an explicit `undefined` value into `.set()`, since that can null out an untouched column. Always include at least one unconditionally-present key (e.g. `updatedAt: new Date()`) so the `SET` clause is never empty (an empty `SET` is a Postgres syntax error — this bit Plan 3's Connections PATCH and was fixed there).

---

### Task 1: `isActionAllowed` budget-rule tier gate

**Files:**
- Modify: `src/utils/tier.ts` (export the existing `isPlanTier` function — currently module-private)
- Create: `src/utils/budgetRuleTier.ts`
- Test: `tests/unit/budgetRuleTier.test.ts`

**Interfaces:**
- Consumes: `PlanTier` type and `isPlanTier` (this task exports it) from `src/utils/tier.ts`
- Produces: `isActionAllowed(plan: string | undefined, action: 'alert' | 'block' | 'throttle'): boolean` — Task 2's budget-rule create/update calls this. Unknown/undefined plans resolve to the `free` tier's allowed actions (empty — fail safe).

- [ ] **Step 1: Write the failing test** — `tests/unit/budgetRuleTier.test.ts`

```ts
import { describe, it, expect } from 'vitest';
import { isActionAllowed } from '../../src/utils/budgetRuleTier.js';

describe('isActionAllowed', () => {
  it('free plan cannot use any action', () => {
    expect(isActionAllowed('free', 'alert')).toBe(false);
    expect(isActionAllowed('free', 'block')).toBe(false);
    expect(isActionAllowed('free', 'throttle')).toBe(false);
  });

  it('plus and pro allow alert and block but not throttle', () => {
    for (const plan of ['plus', 'pro']) {
      expect(isActionAllowed(plan, 'alert')).toBe(true);
      expect(isActionAllowed(plan, 'block')).toBe(true);
      expect(isActionAllowed(plan, 'throttle')).toBe(false);
    }
  });

  it('corp and enterprise plans allow throttle too', () => {
    for (const plan of ['corp_starter', 'corp_growth', 'corp_scale', 'enterprise']) {
      expect(isActionAllowed(plan, 'alert')).toBe(true);
      expect(isActionAllowed(plan, 'block')).toBe(true);
      expect(isActionAllowed(plan, 'throttle')).toBe(true);
    }
  });

  it('defaults to free-tier (no actions allowed) for unknown or undefined plans', () => {
    expect(isActionAllowed(undefined, 'alert')).toBe(false);
    expect(isActionAllowed('nonsense', 'alert')).toBe(false);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/unit/budgetRuleTier.test.ts`
Expected: FAIL — module not found

- [ ] **Step 3: Modify `src/utils/tier.ts`** — add `export` to the existing `isPlanTier` function (no other change)

```ts
export function isPlanTier(value: string): value is PlanTier {
  return value in PLAN_LIMITS;
}
```

- [ ] **Step 4: Write `src/utils/budgetRuleTier.ts`**

```ts
import { isPlanTier, type PlanTier } from './tier.js';

const ALLOWED_ACTIONS: Record<PlanTier, ReadonlyArray<'alert' | 'block' | 'throttle'>> = {
  free: [],
  plus: ['alert', 'block'],
  pro: ['alert', 'block'],
  corp_starter: ['alert', 'block', 'throttle'],
  corp_growth: ['alert', 'block', 'throttle'],
  corp_scale: ['alert', 'block', 'throttle'],
  enterprise: ['alert', 'block', 'throttle'],
};

/** Unknown/undefined plans fall back to the `free` tier's allowed actions (fail safe — none). */
export function isActionAllowed(
  plan: string | undefined,
  action: 'alert' | 'block' | 'throttle',
): boolean {
  const tier: PlanTier = plan !== undefined && isPlanTier(plan) ? plan : 'free';
  return ALLOWED_ACTIONS[tier].includes(action);
}
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `npx vitest run tests/unit/budgetRuleTier.test.ts tests/unit/tier.test.ts; npm run typecheck`
Expected: PASS (4 + existing tier tests), typecheck exit 0

- [ ] **Step 6: Commit**

```bash
git add src/utils/tier.ts src/utils/budgetRuleTier.ts tests/unit/budgetRuleTier.test.ts
git commit -m "feat(api): isActionAllowed tier gate for budget-rule actions"
```

---

### Task 2: Budget Rules domain (repository → service → controller → routes)

**Files:**
- Modify: `src/db/schema.ts` (add two exported type aliases)
- Create: `src/repositories/BudgetRuleRepository.ts`
- Create: `src/services/BudgetRuleService.ts`
- Create: `src/controllers/BudgetRuleController.ts`
- Create: `src/routes/budgetRuleRoutes.ts`
- Modify: `src/app.ts`
- Test: `tests/integration/budgetRuleRoutes.test.ts`

**Interfaces:**
- Consumes: `db`, `budgetRules`/`projects` tables (`src/db/schema.ts`), `isActionAllowed` (Task 1), `requireAuth`/`req.userId`/`req.userPlan` (Plan 2), `asyncErrorWrapper`/`ValidationError`/`NotFoundError`/`ForbiddenError` (Plan 1)
- Produces: `budgetRuleRoutes: Router`, mounted at `/api/v1/budget-rules`

- [ ] **Step 1: Write the failing test** — `tests/integration/budgetRuleRoutes.test.ts`

```ts
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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `set -a; source .env; set +a; npx vitest run tests/integration/budgetRuleRoutes.test.ts`
Expected: FAIL — every request 404s (`Route not found`), route not mounted yet

- [ ] **Step 3: Modify `src/db/schema.ts`** — add two type aliases next to the existing `Provider` export at the bottom of the file

```ts
export type BudgetWindow = (typeof budgetWindowEnum.enumValues)[number];
export type RuleAction = (typeof ruleActionEnum.enumValues)[number];
```

- [ ] **Step 4: Write `src/repositories/BudgetRuleRepository.ts`**

```ts
import { eq, and } from 'drizzle-orm';
import { db } from '../db/client.js';
import { budgetRules, projects, type BudgetWindow, type RuleAction } from '../db/schema.js';

export const BudgetRuleRepository = {
  async listForProject(projectId: string, userId: string) {
    return db
      .select()
      .from(budgetRules)
      .where(and(eq(budgetRules.projectId, projectId), eq(budgetRules.userId, userId)));
  },

  async findProjectForUser(projectId: string, userId: string) {
    const [row] = await db
      .select({ id: projects.id })
      .from(projects)
      .where(and(eq(projects.id, projectId), eq(projects.userId, userId)));
    return row;
  },

  async create(
    userId: string,
    data: {
      projectId: string;
      budgetWindow: BudgetWindow;
      limitUsd: number;
      thresholdPct?: number | undefined;
      action: RuleAction;
    },
  ) {
    const [row] = await db
      .insert(budgetRules)
      .values({
        userId,
        projectId: data.projectId,
        budgetWindow: data.budgetWindow,
        limitUsd: data.limitUsd.toFixed(2),
        thresholdPct: data.thresholdPct,
        action: data.action,
      })
      .returning();
    return row!;
  },

  async update(
    id: string,
    userId: string,
    data: {
      budgetWindow?: BudgetWindow | undefined;
      limitUsd?: number | undefined;
      thresholdPct?: number | undefined;
      action?: RuleAction | undefined;
      isActive?: boolean | undefined;
    },
  ) {
    const { limitUsd, ...rest } = data;
    const [row] = await db
      .update(budgetRules)
      .set({
        ...rest,
        ...(limitUsd !== undefined ? { limitUsd: limitUsd.toFixed(2) } : {}),
        updatedAt: new Date(),
      })
      .where(and(eq(budgetRules.id, id), eq(budgetRules.userId, userId)))
      .returning();
    return row;
  },

  async delete(id: string, userId: string): Promise<boolean> {
    const result = await db
      .delete(budgetRules)
      .where(and(eq(budgetRules.id, id), eq(budgetRules.userId, userId)))
      .returning({ id: budgetRules.id });
    return result.length > 0;
  },
};
```

- [ ] **Step 5: Write `src/services/BudgetRuleService.ts`**

```ts
import { BudgetRuleRepository } from '../repositories/BudgetRuleRepository.js';
import { isActionAllowed } from '../utils/budgetRuleTier.js';
import { ForbiddenError, NotFoundError } from '../utils/errors.js';
import type { BudgetWindow, RuleAction } from '../db/schema.js';

export const BudgetRuleService = {
  async list(projectId: string, userId: string) {
    const project = await BudgetRuleRepository.findProjectForUser(projectId, userId);
    if (!project) throw new NotFoundError('Project not found');
    return BudgetRuleRepository.listForProject(projectId, userId);
  },

  async create(
    userId: string,
    userPlan: string | undefined,
    data: {
      projectId: string;
      budgetWindow: BudgetWindow;
      limitUsd: number;
      thresholdPct?: number | undefined;
      action: RuleAction;
    },
  ) {
    const project = await BudgetRuleRepository.findProjectForUser(data.projectId, userId);
    if (!project) throw new NotFoundError('Project not found');

    if (!isActionAllowed(userPlan, data.action)) {
      throw new ForbiddenError('This action is not available on your plan');
    }

    return BudgetRuleRepository.create(userId, data);
  },

  async update(
    id: string,
    userId: string,
    userPlan: string | undefined,
    data: {
      budgetWindow?: BudgetWindow | undefined;
      limitUsd?: number | undefined;
      thresholdPct?: number | undefined;
      action?: RuleAction | undefined;
      isActive?: boolean | undefined;
    },
  ) {
    if (data.action !== undefined && !isActionAllowed(userPlan, data.action)) {
      throw new ForbiddenError('This action is not available on your plan');
    }
    const rule = await BudgetRuleRepository.update(id, userId, data);
    if (!rule) throw new NotFoundError('Budget rule not found');
    return rule;
  },

  async remove(id: string, userId: string): Promise<void> {
    const deleted = await BudgetRuleRepository.delete(id, userId);
    if (!deleted) throw new NotFoundError('Budget rule not found');
  },
};
```

- [ ] **Step 6: Write `src/controllers/BudgetRuleController.ts`**

```ts
import type { Request, Response } from 'express';
import { z } from 'zod';
import { BudgetRuleService } from '../services/BudgetRuleService.js';
import { budgetWindowEnum, ruleActionEnum } from '../db/schema.js';

const listQuerySchema = z.object({ projectId: z.string().uuid() }).strict();

const createBudgetRuleSchema = z
  .object({
    projectId: z.string().uuid(),
    budgetWindow: z.enum(budgetWindowEnum.enumValues),
    limitUsd: z.number().positive(),
    thresholdPct: z.number().min(1).max(100).optional(),
    action: z.enum(ruleActionEnum.enumValues),
  })
  .strict();

const updateBudgetRuleSchema = z
  .object({
    budgetWindow: z.enum(budgetWindowEnum.enumValues).optional(),
    limitUsd: z.number().positive().optional(),
    thresholdPct: z.number().min(1).max(100).optional(),
    action: z.enum(ruleActionEnum.enumValues).optional(),
    isActive: z.boolean().optional(),
  })
  .strict();

export const BudgetRuleController = {
  async list(req: Request, res: Response): Promise<void> {
    const { projectId } = listQuerySchema.parse(req.query);
    const budgetRules = await BudgetRuleService.list(projectId, req.userId!);
    res.json({ budgetRules });
  },

  async create(req: Request, res: Response): Promise<void> {
    const body = createBudgetRuleSchema.parse(req.body);
    const budgetRule = await BudgetRuleService.create(req.userId!, req.userPlan, body);
    res.status(201).json({ budgetRule });
  },

  async update(req: Request, res: Response): Promise<void> {
    const body = updateBudgetRuleSchema.parse(req.body);
    const budgetRule = await BudgetRuleService.update(
      req.params.id as string,
      req.userId!,
      req.userPlan,
      body,
    );
    res.json({ budgetRule });
  },

  async remove(req: Request, res: Response): Promise<void> {
    await BudgetRuleService.remove(req.params.id as string, req.userId!);
    res.status(204).send();
  },
};
```

- [ ] **Step 7: Write `src/routes/budgetRuleRoutes.ts`**

```ts
import { Router } from 'express';
import { requireAuth } from '../middleware/requireAuth.js';
import { asyncErrorWrapper } from '../middleware/asyncErrorWrapper.js';
import { BudgetRuleController } from '../controllers/BudgetRuleController.js';

export const budgetRuleRoutes = Router();

budgetRuleRoutes.use(requireAuth);
budgetRuleRoutes.get('/', asyncErrorWrapper(BudgetRuleController.list));
budgetRuleRoutes.post('/', asyncErrorWrapper(BudgetRuleController.create));
budgetRuleRoutes.patch('/:id', asyncErrorWrapper(BudgetRuleController.update));
budgetRuleRoutes.delete('/:id', asyncErrorWrapper(BudgetRuleController.remove));
```

- [ ] **Step 8: Modify `src/app.ts`** — mount the router

Replace:
```ts
  app.use('/api/v1/projects', projectRoutes);
  app.use('/api/v1/connections', connectionRoutes);

  // Plans 5–6 mount domain routers here under /api/v1/
```
with:
```ts
  app.use('/api/v1/projects', projectRoutes);
  app.use('/api/v1/connections', connectionRoutes);
  app.use('/api/v1/budget-rules', budgetRuleRoutes);

  // Plan 4 continues below (alerts, notifications); Plans 5–6 mount their own routers here
```

And add the import alongside the other route imports at the top:
```ts
import { budgetRuleRoutes } from './routes/budgetRuleRoutes.js';
```

- [ ] **Step 9: Run tests to verify they pass**

Run: `set -a; source .env; set +a; npx vitest run tests/integration/budgetRuleRoutes.test.ts tests/integration/app.test.ts; npm run typecheck`
Expected: PASS (12 + existing app tests), typecheck exit 0

- [ ] **Step 10: Commit**

```bash
git add src/db/schema.ts src/repositories/BudgetRuleRepository.ts src/services/BudgetRuleService.ts src/controllers/BudgetRuleController.ts src/routes/budgetRuleRoutes.ts src/app.ts tests/integration/budgetRuleRoutes.test.ts
git commit -m "feat(api): Budget Rules CRUD — tier-gated actions, project-scoped"
```

---

### Task 3: Alerts domain (repository → service → controller → routes)

**Files:**
- Modify: `src/db/schema.ts` (add one exported type alias)
- Create: `src/repositories/AlertRepository.ts`
- Create: `src/services/AlertService.ts`
- Create: `src/controllers/AlertController.ts`
- Create: `src/routes/alertRoutes.ts`
- Modify: `src/app.ts`
- Test: `tests/integration/alertRoutes.test.ts`

**Interfaces:**
- Consumes: `db`, `alertLog`/`projects` tables, `requireAuth`/`req.userId` (Plan 2), `asyncErrorWrapper`/`NotFoundError` (Plan 1)
- Produces: `alertRoutes: Router`, mounted at `/api/v1/alerts`

- [ ] **Step 1: Write the failing test** — `tests/integration/alertRoutes.test.ts`

```ts
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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `set -a; source .env; set +a; npx vitest run tests/integration/alertRoutes.test.ts`
Expected: FAIL — every `/api/v1/alerts` request 404s, route not mounted yet

- [ ] **Step 3: Modify `src/db/schema.ts`** — add one type alias next to `BudgetWindow`/`RuleAction`

```ts
export type AlertStatus = (typeof alertStatusEnum.enumValues)[number];
```

- [ ] **Step 4: Write `src/repositories/AlertRepository.ts`**

```ts
import { eq, and } from 'drizzle-orm';
import { db } from '../db/client.js';
import { alertLog, type AlertStatus } from '../db/schema.js';

export const AlertRepository = {
  async listForUser(userId: string) {
    return db.select().from(alertLog).where(eq(alertLog.userId, userId));
  },

  async update(id: string, userId: string, status: AlertStatus) {
    const [row] = await db
      .update(alertLog)
      .set({
        status,
        resolvedAt: status === 'resolved' ? new Date() : null,
      })
      .where(and(eq(alertLog.id, id), eq(alertLog.userId, userId)))
      .returning();
    return row;
  },
};
```

- [ ] **Step 5: Write `src/services/AlertService.ts`**

```ts
import { AlertRepository } from '../repositories/AlertRepository.js';
import { NotFoundError } from '../utils/errors.js';
import type { AlertStatus } from '../db/schema.js';

export const AlertService = {
  list(userId: string) {
    return AlertRepository.listForUser(userId);
  },

  async update(id: string, userId: string, status: AlertStatus) {
    const alert = await AlertRepository.update(id, userId, status);
    if (!alert) throw new NotFoundError('Alert not found');
    return alert;
  },
};
```

- [ ] **Step 6: Write `src/controllers/AlertController.ts`**

```ts
import type { Request, Response } from 'express';
import { z } from 'zod';
import { AlertService } from '../services/AlertService.js';

const updateAlertSchema = z.object({ status: z.enum(['acknowledged', 'resolved']) }).strict();

export const AlertController = {
  async list(req: Request, res: Response): Promise<void> {
    const alerts = await AlertService.list(req.userId!);
    res.json({ alerts });
  },

  async update(req: Request, res: Response): Promise<void> {
    const body = updateAlertSchema.parse(req.body);
    const alert = await AlertService.update(req.params.id as string, req.userId!, body.status);
    res.json({ alert });
  },
};
```

- [ ] **Step 7: Write `src/routes/alertRoutes.ts`**

```ts
import { Router } from 'express';
import { requireAuth } from '../middleware/requireAuth.js';
import { asyncErrorWrapper } from '../middleware/asyncErrorWrapper.js';
import { AlertController } from '../controllers/AlertController.js';

export const alertRoutes = Router();

alertRoutes.use(requireAuth);
alertRoutes.get('/', asyncErrorWrapper(AlertController.list));
alertRoutes.patch('/:id', asyncErrorWrapper(AlertController.update));
```

- [ ] **Step 8: Modify `src/app.ts`** — mount the router

Replace:
```ts
  app.use('/api/v1/budget-rules', budgetRuleRoutes);

  // Plan 4 continues below (alerts, notifications); Plans 5–6 mount their own routers here
```
with:
```ts
  app.use('/api/v1/budget-rules', budgetRuleRoutes);
  app.use('/api/v1/alerts', alertRoutes);

  // Plan 4 continues below (notifications); Plans 5–6 mount their own routers here
```

And add the import:
```ts
import { alertRoutes } from './routes/alertRoutes.js';
```

- [ ] **Step 9: Run tests to verify they pass**

Run: `set -a; source .env; set +a; npx vitest run tests/integration/alertRoutes.test.ts tests/integration/app.test.ts; npm run typecheck`
Expected: PASS (7 + existing app tests), typecheck exit 0

- [ ] **Step 10: Commit**

```bash
git add src/db/schema.ts src/repositories/AlertRepository.ts src/services/AlertService.ts src/controllers/AlertController.ts src/routes/alertRoutes.ts src/app.ts tests/integration/alertRoutes.test.ts
git commit -m "feat(api): Alerts — list + acknowledge/resolve, no create/delete (system-written)"
```

---

### Task 4: Notifications domain (repository → service → controller → routes)

**Files:**
- Create: `src/repositories/NotificationRepository.ts`
- Create: `src/services/NotificationService.ts`
- Create: `src/controllers/NotificationController.ts`
- Create: `src/routes/notificationRoutes.ts`
- Modify: `src/app.ts`
- Test: `tests/integration/notificationRoutes.test.ts`

**Interfaces:**
- Consumes: `db`, `notifications` table, `requireAuth`/`req.userId` (Plan 2), `asyncErrorWrapper`/`NotFoundError` (Plan 1)
- Produces: `notificationRoutes: Router`, mounted at `/api/v1/notifications`

- [ ] **Step 1: Write the failing test** — `tests/integration/notificationRoutes.test.ts`

```ts
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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `set -a; source .env; set +a; npx vitest run tests/integration/notificationRoutes.test.ts`
Expected: FAIL — every `/api/v1/notifications` request 404s, route not mounted yet

- [ ] **Step 3: Write `src/repositories/NotificationRepository.ts`**

```ts
import { eq, and, isNull } from 'drizzle-orm';
import { db } from '../db/client.js';
import { notifications } from '../db/schema.js';

export const NotificationRepository = {
  async listForUser(userId: string) {
    return db.select().from(notifications).where(eq(notifications.userId, userId));
  },

  async markRead(id: string, userId: string) {
    const [row] = await db
      .update(notifications)
      .set({ readAt: new Date() })
      .where(and(eq(notifications.id, id), eq(notifications.userId, userId)))
      .returning();
    return row;
  },

  async markAllRead(userId: string): Promise<void> {
    await db
      .update(notifications)
      .set({ readAt: new Date() })
      .where(and(eq(notifications.userId, userId), isNull(notifications.readAt)));
  },
};
```

- [ ] **Step 4: Write `src/services/NotificationService.ts`**

```ts
import { NotificationRepository } from '../repositories/NotificationRepository.js';
import { NotFoundError } from '../utils/errors.js';

export const NotificationService = {
  list(userId: string) {
    return NotificationRepository.listForUser(userId);
  },

  async markRead(id: string, userId: string) {
    const notification = await NotificationRepository.markRead(id, userId);
    if (!notification) throw new NotFoundError('Notification not found');
    return notification;
  },

  markAllRead(userId: string): Promise<void> {
    return NotificationRepository.markAllRead(userId);
  },
};
```

- [ ] **Step 5: Write `src/controllers/NotificationController.ts`**

```ts
import type { Request, Response } from 'express';
import { NotificationService } from '../services/NotificationService.js';

export const NotificationController = {
  async list(req: Request, res: Response): Promise<void> {
    const notifications = await NotificationService.list(req.userId!);
    res.json({ notifications });
  },

  async markRead(req: Request, res: Response): Promise<void> {
    const notification = await NotificationService.markRead(req.params.id as string, req.userId!);
    res.json({ notification });
  },

  async markAllRead(req: Request, res: Response): Promise<void> {
    await NotificationService.markAllRead(req.userId!);
    res.status(204).send();
  },
};
```

- [ ] **Step 6: Write `src/routes/notificationRoutes.ts`**

```ts
import { Router } from 'express';
import { requireAuth } from '../middleware/requireAuth.js';
import { asyncErrorWrapper } from '../middleware/asyncErrorWrapper.js';
import { NotificationController } from '../controllers/NotificationController.js';

export const notificationRoutes = Router();

notificationRoutes.use(requireAuth);
notificationRoutes.get('/', asyncErrorWrapper(NotificationController.list));
notificationRoutes.patch('/read-all', asyncErrorWrapper(NotificationController.markAllRead));
notificationRoutes.patch('/:id/read', asyncErrorWrapper(NotificationController.markRead));
```

- [ ] **Step 7: Modify `src/app.ts`** — mount the router

Replace:
```ts
  app.use('/api/v1/budget-rules', budgetRuleRoutes);
  app.use('/api/v1/alerts', alertRoutes);

  // Plan 4 continues below (notifications); Plans 5–6 mount their own routers here
```
with:
```ts
  app.use('/api/v1/budget-rules', budgetRuleRoutes);
  app.use('/api/v1/alerts', alertRoutes);
  app.use('/api/v1/notifications', notificationRoutes);

  // Plans 5–6 mount domain routers here under /api/v1/
```

And add the import:
```ts
import { notificationRoutes } from './routes/notificationRoutes.js';
```

- [ ] **Step 8: Run tests to verify they pass**

Run: `set -a; source .env; set +a; npm test; npm run typecheck`
Expected: ALL tests pass (unit + integration, full suite), typecheck exit 0

- [ ] **Step 9: Commit**

```bash
git add src/repositories/NotificationRepository.ts src/services/NotificationService.ts src/controllers/NotificationController.ts src/routes/notificationRoutes.ts src/app.ts tests/integration/notificationRoutes.test.ts
git commit -m "feat(api): Notifications — list + mark-read/read-all, no create/delete (system-written)"
```

---

## Definition of Done (Plan 4)

- `npm test` green with `DATABASE_URL` pointed at a reachable Postgres, all Plan 1-3 tests plus this plan's new tests
- `npm run typecheck` exit 0
- A free-plan user gets 403 on any `POST /budget-rules`; a plus-plan user gets 403 requesting `action: 'throttle'`; corp/enterprise plans (not directly tested here — no org-scoped test user exists until Plan 6, but `isActionAllowed`'s unit tests cover the boolean logic) allow all three actions
- Cross-user access to another user's budget rule/alert/notification returns 404, never 403
- `PATCH /alerts/:id` rejects `status: 'active'`
- `PATCH /notifications/read-all` only touches the caller's own unread rows
- Zero `process.env` reads outside `unifiedConfig.ts`, zero `console.log` in `src/`

## Deferred to later plans (explicit, not forgotten)

- **The polling worker, `budgetChecker`, `alertDispatcher`** — the BullMQ machinery that evaluates usage against budget rules and actually writes `alert_log`/`notifications` rows in production. No plan for it exists yet.
- **Alert delivery** (Resend email, Slack/custom webhook, in-app push, `notified_via`/`delivery_status` tracking) — depends on the dispatcher above.
- **Ingest, Billing, Organizations** — separate domains, later plans (exact numbering not yet decided).
