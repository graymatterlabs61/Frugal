# Frugal API — Plan 5: Provider Polling Engine Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Real usage polling for OpenAI + Anthropic (the only two providers with an account-level usage API — see spec §1), writing idempotent `usage_records` rows, exposed via a manual `POST /api/v1/poll` and a recurring BullMQ worker.

**Architecture:** `routes/pollRoutes.ts → controllers/PollController.ts → services/PollingService.ts → repositories/{ConnectionRepository,UsageRepository}.ts + providers/{openai,anthropic,pricing}.ts`. A separate process, `workers/pollWorker.ts`, calls the same `PollingService` every 5 minutes via BullMQ for *all* users; the HTTP route calls it for the caller's own connections only. Provider modules do HTTP + parsing only, no DB access; the pricing table is a pure function, no I/O.

**Tech Stack adds:** `bullmq`, `ioredis` (recurring worker only — the HTTP-testable surface in Tasks 1-4 needs neither).

**Spec:** `docs/superpowers/specs/2026-07-11-provider-polling-design.md` (authoritative for this plan). Background: `docs/superpowers/specs/2026-06-25-frugal-backend-design.md` §3, §7, §11.

## Global Constraints

- Service lives at `api/`. All paths below are relative to `api/`.
- `"type": "module"` ESM, relative imports only, `.js` extensions on relative imports.
- `process.env` may be read ONLY inside `src/config/unifiedConfig.ts`.
- No `console.log` in `src` — Pino logger only.
- No raw SQL string concatenation — Drizzle only.
- Every task ends with typecheck + tests green, then a commit.
- Commands run from `api/`. PowerShell-compatible (no `&&` — use `;`).
- Integration tests need a reachable Postgres via `DATABASE_URL` (Neon test branch, gitignored `api/.env` — source it before running: bash `set -a; source .env; set +a`). They do **not** need a real Redis, and do **not** need real OpenAI/Anthropic credentials — `global.fetch` is stubbed with `vi.stubGlobal('fetch', ...)` in every test that would otherwise hit a provider.
- Provider modules never catch-and-swallow errors themselves — they throw `ProviderAuthError`/`ProviderRequestError`; only `PollingService` decides what a thrown error means for a connection's `status`.
- The pricing table (`providers/pricing.ts`) is matched by **longest prefix first** — sort by `prefix.length` descending before searching, otherwise a short prefix (`gpt-4.1`) can shadow a more specific one (`gpt-4.1-mini`) that also starts with it.
- `usage_records.cost_usd` and `.tokensInput`/`.tokensOutput` are upserted (overwritten), never incremented — each poll re-fetches the *whole* UTC day's cumulative total from the provider, so overwriting is correct and self-correcting; incrementing would double-count on every re-poll.
- `workers/pollWorker.ts` is a separate entrypoint (`npm run worker`), never imported by `src/app.ts` or any test — the main HTTP server and its test suite must not require a reachable Redis.

---

### Task 1: Pricing table

**Files:**
- Create: `src/providers/pricing.ts`
- Test: `tests/unit/pricing.test.ts`

**Interfaces:**
- Produces: `costUsd(model: string, tokensInput: number, tokensOutput: number): number` — Task 4's `PollingService` calls this per usage row.

- [ ] **Step 1: Write the failing test** — `tests/unit/pricing.test.ts`

```ts
import { describe, it, expect } from 'vitest';
import { costUsd } from '../../src/providers/pricing.js';

describe('costUsd', () => {
  it('computes cost for a known OpenAI model', () => {
    expect(costUsd('gpt-4.1', 1_000_000, 1_000_000)).toBeCloseTo(2.0 + 8.0, 5);
  });

  it('prefers the more specific mini rate over the shorter base-model prefix', () => {
    expect(costUsd('gpt-4.1-mini-2026-01-15', 1_000_000, 1_000_000)).toBeCloseTo(0.4 + 1.6, 5);
  });

  it('computes cost for a known Anthropic model', () => {
    expect(costUsd('claude-opus-4-8-20260528', 1_000_000, 1_000_000)).toBeCloseTo(5.0 + 25.0, 5);
  });

  it('computes cost proportionally for partial token counts', () => {
    expect(costUsd('gpt-4o-mini', 500_000, 0)).toBeCloseTo(0.075, 5);
  });

  it('defaults to 0 and does not throw for an unknown model', () => {
    expect(costUsd('some-future-model-nobody-has-priced-yet', 1000, 1000)).toBe(0);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/unit/pricing.test.ts`
Expected: FAIL — module not found

- [ ] **Step 3: Write `src/providers/pricing.ts`**

```ts
import { logger } from '../utils/logger.js';

interface PricingRate {
  prefix: string;
  inputPer1M: number;
  outputPer1M: number;
}

// Verified July 2026 — see spec §6 for source links. Providers change pricing/models
// without notice; this table needs manual upkeep when they do.
const RATES: PricingRate[] = [
  { prefix: 'gpt-4.1-nano', inputPer1M: 0.1, outputPer1M: 0.4 },
  { prefix: 'gpt-4.1-mini', inputPer1M: 0.4, outputPer1M: 1.6 },
  { prefix: 'gpt-4.1', inputPer1M: 2.0, outputPer1M: 8.0 },
  { prefix: 'gpt-4o-mini', inputPer1M: 0.15, outputPer1M: 0.6 },
  { prefix: 'gpt-4o', inputPer1M: 2.5, outputPer1M: 10.0 },
  { prefix: 'claude-opus-4', inputPer1M: 5.0, outputPer1M: 25.0 },
  // intro pricing thru 2026-08-31; standard $3/$15 takes effect after — update at cutover
  { prefix: 'claude-sonnet-5', inputPer1M: 2.0, outputPer1M: 10.0 },
  { prefix: 'claude-sonnet-4', inputPer1M: 3.0, outputPer1M: 15.0 },
  { prefix: 'claude-haiku-4', inputPer1M: 1.0, outputPer1M: 5.0 },
].sort((a, b) => b.prefix.length - a.prefix.length);

export function costUsd(model: string, tokensInput: number, tokensOutput: number): number {
  const rate = RATES.find((r) => model.startsWith(r.prefix));
  if (!rate) {
    logger.warn({ model }, 'no pricing rate for model, defaulting cost to 0');
    return 0;
  }
  return (tokensInput / 1_000_000) * rate.inputPer1M + (tokensOutput / 1_000_000) * rate.outputPer1M;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/unit/pricing.test.ts; npm run typecheck`
Expected: PASS (5 tests), typecheck exit 0

- [ ] **Step 5: Commit**

```bash
git add src/providers/pricing.ts tests/unit/pricing.test.ts
git commit -m "feat(api): static per-model pricing table for usage cost computation"
```

---

### Task 2: OpenAI provider module

**Files:**
- Create: `src/providers/types.ts`
- Create: `src/providers/errors.ts`
- Create: `src/providers/openai.ts`
- Test: `tests/unit/openaiProvider.test.ts`

**Interfaces:**
- Produces: `ProviderUsageRow { model: string; tokensInput: number; tokensOutput: number }`, `todayUtcRange(now?: Date): { start: Date; end: Date }`, `ProviderAuthError`, `ProviderRequestError`, `fetchOpenAiUsage(adminKey: string, range: { start: Date; end: Date }): Promise<ProviderUsageRow[]>` — Task 3 reuses `types.ts`/`errors.ts`; Task 4's `PollingService` calls `fetchOpenAiUsage` and `todayUtcRange`.

- [ ] **Step 1: Write the failing test** — `tests/unit/openaiProvider.test.ts`

```ts
import { describe, it, expect, vi, afterEach } from 'vitest';
import { fetchOpenAiUsage } from '../../src/providers/openai.js';
import { ProviderAuthError, ProviderRequestError } from '../../src/providers/errors.js';

afterEach(() => {
  vi.unstubAllGlobals();
});

const range = { start: new Date('2026-07-11T00:00:00Z'), end: new Date('2026-07-11T12:00:00Z') };

describe('fetchOpenAiUsage', () => {
  it('requests the completions usage endpoint grouped by model and parses results', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        data: [
          {
            results: [
              { model: 'gpt-4.1', input_tokens: 1000, output_tokens: 200 },
              { model: 'gpt-4.1-mini', input_tokens: 500, output_tokens: 100 },
            ],
          },
        ],
      }),
    });
    vi.stubGlobal('fetch', fetchMock);

    const rows = await fetchOpenAiUsage('sk-admin-test', range);

    expect(rows).toEqual([
      { model: 'gpt-4.1', tokensInput: 1000, tokensOutput: 200 },
      { model: 'gpt-4.1-mini', tokensInput: 500, tokensOutput: 100 },
    ]);

    const [calledUrl, calledInit] = fetchMock.mock.calls[0] as [URL, RequestInit];
    expect(calledUrl.origin + calledUrl.pathname).toBe(
      'https://api.openai.com/v1/organization/usage/completions',
    );
    expect(calledUrl.searchParams.get('bucket_width')).toBe('1d');
    expect(calledUrl.searchParams.get('group_by')).toBe('model');
    expect(calledUrl.searchParams.get('start_time')).toBe('1783728000');
    expect(calledInit.headers).toMatchObject({ Authorization: 'Bearer sk-admin-test' });
  });

  it('throws ProviderAuthError on 401', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ ok: false, status: 401, json: async () => ({}) }),
    );
    await expect(fetchOpenAiUsage('bad-key', range)).rejects.toThrow(ProviderAuthError);
  });

  it('throws ProviderAuthError on 403 (key lacks admin scope)', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ ok: false, status: 403, json: async () => ({}) }),
    );
    await expect(fetchOpenAiUsage('non-admin-key', range)).rejects.toThrow(ProviderAuthError);
  });

  it('throws ProviderRequestError on 500', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ ok: false, status: 500, json: async () => ({}) }),
    );
    await expect(fetchOpenAiUsage('sk-admin-test', range)).rejects.toThrow(ProviderRequestError);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/unit/openaiProvider.test.ts`
Expected: FAIL — modules not found

- [ ] **Step 3: Write `src/providers/types.ts`**

```ts
export interface ProviderUsageRow {
  model: string;
  tokensInput: number;
  tokensOutput: number;
}

/** UTC calendar day so far: 00:00:00 today through `now`. */
export function todayUtcRange(now: Date = new Date()): { start: Date; end: Date } {
  const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  return { start, end: now };
}
```

- [ ] **Step 4: Write `src/providers/errors.ts`**

```ts
export class ProviderAuthError extends Error {}
export class ProviderRequestError extends Error {}
```

- [ ] **Step 5: Write `src/providers/openai.ts`**

```ts
import { ProviderAuthError, ProviderRequestError } from './errors.js';
import type { ProviderUsageRow } from './types.js';

const OPENAI_USAGE_URL = 'https://api.openai.com/v1/organization/usage/completions';

interface OpenAiUsageResponse {
  data: Array<{
    results: Array<{ model: string | null; input_tokens: number; output_tokens: number }>;
  }>;
}

export async function fetchOpenAiUsage(
  adminKey: string,
  range: { start: Date; end: Date },
): Promise<ProviderUsageRow[]> {
  const url = new URL(OPENAI_USAGE_URL);
  url.searchParams.set('start_time', String(Math.floor(range.start.getTime() / 1000)));
  url.searchParams.set('end_time', String(Math.floor(range.end.getTime() / 1000)));
  url.searchParams.set('bucket_width', '1d');
  url.searchParams.set('group_by', 'model');

  const res = await fetch(url, { headers: { Authorization: `Bearer ${adminKey}` } });

  if (res.status === 401 || res.status === 403) {
    throw new ProviderAuthError(`OpenAI rejected the admin key (${res.status})`);
  }
  if (!res.ok) {
    throw new ProviderRequestError(`OpenAI usage request failed: ${res.status}`);
  }

  const body = (await res.json()) as OpenAiUsageResponse;
  const totals = new Map<string, { tokensInput: number; tokensOutput: number }>();
  for (const bucket of body.data) {
    for (const result of bucket.results) {
      if (!result.model) continue;
      const current = totals.get(result.model) ?? { tokensInput: 0, tokensOutput: 0 };
      current.tokensInput += result.input_tokens;
      current.tokensOutput += result.output_tokens;
      totals.set(result.model, current);
    }
  }
  return [...totals.entries()].map(([model, t]) => ({ model, ...t }));
}
```

- [ ] **Step 6: Run tests to verify they pass**

Run: `npx vitest run tests/unit/openaiProvider.test.ts; npm run typecheck`
Expected: PASS (4 tests), typecheck exit 0

- [ ] **Step 7: Commit**

```bash
git add src/providers/types.ts src/providers/errors.ts src/providers/openai.ts tests/unit/openaiProvider.test.ts
git commit -m "feat(api): OpenAI usage provider module"
```

---

### Task 3: Anthropic provider module

**Files:**
- Create: `src/providers/anthropic.ts`
- Test: `tests/unit/anthropicProvider.test.ts`

**Interfaces:**
- Consumes: `ProviderUsageRow`, `ProviderAuthError`, `ProviderRequestError` (Task 2)
- Produces: `fetchAnthropicUsage(adminKey: string, range: { start: Date; end: Date }): Promise<ProviderUsageRow[]>` — Task 4's `PollingService` calls this.

- [ ] **Step 1: Write the failing test** — `tests/unit/anthropicProvider.test.ts`

```ts
import { describe, it, expect, vi, afterEach } from 'vitest';
import { fetchAnthropicUsage } from '../../src/providers/anthropic.js';
import { ProviderAuthError, ProviderRequestError } from '../../src/providers/errors.js';

afterEach(() => {
  vi.unstubAllGlobals();
});

const range = { start: new Date('2026-07-11T00:00:00Z'), end: new Date('2026-07-11T12:00:00Z') };

describe('fetchAnthropicUsage', () => {
  it('requests the messages usage report grouped by model and sums cache-read + uncached input tokens', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        data: [
          {
            results: [
              {
                model: 'claude-opus-4-8-20260528',
                uncached_input_tokens: 1000,
                cache_read_input_tokens: 50,
                output_tokens: 200,
              },
            ],
          },
        ],
      }),
    });
    vi.stubGlobal('fetch', fetchMock);

    const rows = await fetchAnthropicUsage('sk-ant-admin-test', range);

    expect(rows).toEqual([
      { model: 'claude-opus-4-8-20260528', tokensInput: 1050, tokensOutput: 200 },
    ]);

    const [calledUrl, calledInit] = fetchMock.mock.calls[0] as [URL, RequestInit];
    expect(calledUrl.origin + calledUrl.pathname).toBe(
      'https://api.anthropic.com/v1/organizations/usage_report/messages',
    );
    expect(calledUrl.searchParams.get('bucket_width')).toBe('1d');
    expect(calledUrl.searchParams.get('group_by')).toBe('model');
    expect(calledUrl.searchParams.get('starting_at')).toBe('2026-07-11T00:00:00.000Z');
    expect(calledInit.headers).toMatchObject({
      'x-api-key': 'sk-ant-admin-test',
      'anthropic-version': '2023-06-01',
    });
  });

  it('throws ProviderAuthError on 401', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ ok: false, status: 401, json: async () => ({}) }),
    );
    await expect(fetchAnthropicUsage('bad-key', range)).rejects.toThrow(ProviderAuthError);
  });

  it('throws ProviderRequestError on 500', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ ok: false, status: 500, json: async () => ({}) }),
    );
    await expect(fetchAnthropicUsage('sk-ant-admin-test', range)).rejects.toThrow(
      ProviderRequestError,
    );
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/unit/anthropicProvider.test.ts`
Expected: FAIL — module not found

- [ ] **Step 3: Write `src/providers/anthropic.ts`**

```ts
import { ProviderAuthError, ProviderRequestError } from './errors.js';
import type { ProviderUsageRow } from './types.js';

const ANTHROPIC_USAGE_URL = 'https://api.anthropic.com/v1/organizations/usage_report/messages';
const ANTHROPIC_VERSION = '2023-06-01';

interface AnthropicUsageResponse {
  data: Array<{
    results: Array<{
      model: string | null;
      uncached_input_tokens: number;
      cache_read_input_tokens: number;
      output_tokens: number;
    }>;
  }>;
}

export async function fetchAnthropicUsage(
  adminKey: string,
  range: { start: Date; end: Date },
): Promise<ProviderUsageRow[]> {
  const url = new URL(ANTHROPIC_USAGE_URL);
  url.searchParams.set('starting_at', range.start.toISOString());
  url.searchParams.set('ending_at', range.end.toISOString());
  url.searchParams.set('bucket_width', '1d');
  url.searchParams.set('group_by', 'model');

  const res = await fetch(url, {
    headers: { 'x-api-key': adminKey, 'anthropic-version': ANTHROPIC_VERSION },
  });

  if (res.status === 401 || res.status === 403) {
    throw new ProviderAuthError(`Anthropic rejected the admin key (${res.status})`);
  }
  if (!res.ok) {
    throw new ProviderRequestError(`Anthropic usage request failed: ${res.status}`);
  }

  const body = (await res.json()) as AnthropicUsageResponse;
  const totals = new Map<string, { tokensInput: number; tokensOutput: number }>();
  for (const bucket of body.data) {
    for (const result of bucket.results) {
      if (!result.model) continue;
      const current = totals.get(result.model) ?? { tokensInput: 0, tokensOutput: 0 };
      current.tokensInput += result.uncached_input_tokens + result.cache_read_input_tokens;
      current.tokensOutput += result.output_tokens;
      totals.set(result.model, current);
    }
  }
  return [...totals.entries()].map(([model, t]) => ({ model, ...t }));
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run tests/unit/anthropicProvider.test.ts; npm run typecheck`
Expected: PASS (3 tests), typecheck exit 0

- [ ] **Step 5: Commit**

```bash
git add src/providers/anthropic.ts tests/unit/anthropicProvider.test.ts
git commit -m "feat(api): Anthropic usage provider module"
```

---

### Task 4: Polling engine (repository → service → controller → route)

**Files:**
- Modify: `src/db/schema.ts` (add one exported type alias)
- Modify: `src/repositories/ConnectionRepository.ts` (add three methods)
- Create: `src/repositories/UsageRepository.ts`
- Create: `src/services/PollingService.ts`
- Create: `src/controllers/PollController.ts`
- Create: `src/routes/pollRoutes.ts`
- Modify: `src/app.ts`
- Test: `tests/integration/pollRoutes.test.ts`

**Interfaces:**
- Consumes: `fetchOpenAiUsage`/`fetchAnthropicUsage` (Task 2/3), `todayUtcRange`/`ProviderUsageRow` (Task 2), `ProviderAuthError` (Task 2), `costUsd` (Task 1), `decrypt` (existing `utils/encryption.ts`), `requireAuth`/`req.userId` (Plan 2), `asyncErrorWrapper` (Plan 1)
- Produces: `pollRoutes: Router`, mounted at `/api/v1/poll`. `PollingService.pollAllActiveConnections()` — Task 5's worker calls this directly.

- [ ] **Step 1: Write the failing test** — `tests/integration/pollRoutes.test.ts`

```ts
import { describe, it, expect, beforeAll, afterEach, vi } from 'vitest';
import request from 'supertest';
import { randomUUID } from 'node:crypto';
import { eq, and } from 'drizzle-orm';
import { createApp } from '../../src/app.js';
import { db } from '../../src/db/client.js';
import { usageRecords, apiConnections } from '../../src/db/schema.js';
import { users } from '../../src/db/authSchema.js';

afterEach(() => {
  vi.unstubAllGlobals();
});

function stubOpenAiUsage(results: Array<{ model: string; input_tokens: number; output_tokens: number }>) {
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ data: [{ results }] }),
    }),
  );
}

describe('poll route (requires a real Postgres via DATABASE_URL)', () => {
  const app = createApp();
  let cookie: string[];
  let projectId: string;
  let connectionId: string;

  beforeAll(async () => {
    const email = `poll-${randomUUID()}@example.com`;
    const signUpRes = await request(app)
      .post('/api/auth/sign-up/email')
      .send({ email, password: 'correct-horse-battery', name: 'Poll Test' });
    cookie = signUpRes.headers['set-cookie'];
    // plus plan so this suite's later replicate-connection test doesn't trip the
    // free-plan 1-connection limit (Plan 3) — not testing tier limits here, Plan 3 already does
    await db.update(users).set({ plan: 'plus' }).where(eq(users.id, signUpRes.body.user.id));

    const projectRes = await request(app)
      .post('/api/v1/projects')
      .set('Cookie', cookie)
      .send({ name: 'Poll Project' });
    projectId = projectRes.body.project.id;

    const connectionRes = await request(app)
      .post('/api/v1/connections')
      .set('Cookie', cookie)
      .send({ projectId, provider: 'openai', label: 'Admin key', apiKey: 'sk-admin-fake-test-key' });
    connectionId = connectionRes.body.connection.id;
  });

  it('rejects unauthenticated requests', async () => {
    const res = await request(app).post('/api/v1/poll');
    expect(res.status).toBe(401);
  });

  it('polls the connection and writes a usage_records row', async () => {
    stubOpenAiUsage([{ model: 'gpt-4.1', input_tokens: 1000, output_tokens: 200 }]);

    const res = await request(app).post('/api/v1/poll').set('Cookie', cookie);
    expect(res.status).toBe(200);
    expect(res.body.results).toHaveLength(1);
    expect(res.body.results[0]).toMatchObject({
      connectionId,
      provider: 'openai',
      status: 'polled',
      modelsUpdated: 1,
    });

    const rows = await db
      .select()
      .from(usageRecords)
      .where(and(eq(usageRecords.connectionId, connectionId), eq(usageRecords.model, 'gpt-4.1')));
    expect(rows).toHaveLength(1);
    expect(rows[0]!.tokensInput).toBe(1000);
    expect(rows[0]!.tokensOutput).toBe(200);
    expect(Number(rows[0]!.costUsd)).toBeCloseTo(0.002 + 0.0016, 5);

    const [connection] = await db
      .select()
      .from(apiConnections)
      .where(eq(apiConnections.id, connectionId));
    expect(connection!.status).toBe('active');
    expect(connection!.lastPolledAt).toBeTruthy();
  });

  it('re-polling the same day upserts instead of inserting a second row', async () => {
    stubOpenAiUsage([{ model: 'gpt-4.1', input_tokens: 2000, output_tokens: 400 }]);

    const res = await request(app).post('/api/v1/poll').set('Cookie', cookie);
    expect(res.status).toBe(200);

    const rows = await db
      .select()
      .from(usageRecords)
      .where(and(eq(usageRecords.connectionId, connectionId), eq(usageRecords.model, 'gpt-4.1')));
    expect(rows).toHaveLength(1);
    expect(rows[0]!.tokensInput).toBe(2000);
    expect(rows[0]!.tokensOutput).toBe(400);
  });

  it('marks the connection invalid on a 401 and excludes it from later results', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ ok: false, status: 401, json: async () => ({}) }),
    );

    const res = await request(app).post('/api/v1/poll').set('Cookie', cookie);
    expect(res.status).toBe(200);
    expect(res.body.results[0]).toMatchObject({ connectionId, status: 'auth_error', modelsUpdated: 0 });

    const [connection] = await db
      .select()
      .from(apiConnections)
      .where(eq(apiConnections.id, connectionId));
    expect(connection!.status).toBe('invalid');

    // fetch must not be called again for a now-invalid connection
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
    await request(app).post('/api/v1/poll').set('Cookie', cookie);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('never calls fetch for a replicate connection and reports no results for it', async () => {
    const otherRes = await request(app)
      .post('/api/v1/connections')
      .set('Cookie', cookie)
      .send({ projectId, provider: 'replicate', apiKey: 'r8-fake-test-key' });
    expect(otherRes.status).toBe(201);

    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);

    const res = await request(app).post('/api/v1/poll').set('Cookie', cookie);
    expect(res.status).toBe(200);
    expect(res.body.results.some((r: { connectionId: string }) => r.connectionId === otherRes.body.connection.id)).toBe(false);
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `set -a; source .env; set +a; npx vitest run tests/integration/pollRoutes.test.ts`
Expected: FAIL — every request 404s, route not mounted yet

- [ ] **Step 3: Modify `src/db/schema.ts`** — add one type alias next to `AlertStatus`

```ts
export type ConnectionStatus = (typeof connectionStatusEnum.enumValues)[number];
```

- [ ] **Step 4: Modify `src/repositories/ConnectionRepository.ts`** — add three methods and the needed imports

Change the import line:
```ts
import { eq, and, count, inArray, notInArray } from 'drizzle-orm';
import { db } from '../db/client.js';
import { apiConnections, projects, type Provider, type ConnectionStatus } from '../db/schema.js';
```

Add these methods inside the `ConnectionRepository` object (after `findByIdForUser`, before `create`):
```ts
  async listPollableForUser(userId: string) {
    return db
      .select()
      .from(apiConnections)
      .where(
        and(
          eq(apiConnections.userId, userId),
          eq(apiConnections.isActive, true),
          inArray(apiConnections.provider, ['openai', 'anthropic']),
          notInArray(apiConnections.status, ['invalid', 'blocked']),
        ),
      );
  },

  async listAllPollable() {
    return db
      .select()
      .from(apiConnections)
      .where(
        and(
          eq(apiConnections.isActive, true),
          inArray(apiConnections.provider, ['openai', 'anthropic']),
          notInArray(apiConnections.status, ['invalid', 'blocked']),
        ),
      );
  },

  async markPollResult(id: string, status: ConnectionStatus, lastPolledAt: Date): Promise<void> {
    await db.update(apiConnections).set({ status, lastPolledAt }).where(eq(apiConnections.id, id));
  },
```

- [ ] **Step 5: Write `src/repositories/UsageRepository.ts`**

```ts
import { db } from '../db/client.js';
import { usageRecords } from '../db/schema.js';
import type { ProviderUsageRow } from '../providers/types.js';

export const UsageRepository = {
  async upsertDailyUsage(
    connectionId: string,
    userId: string,
    date: string,
    rows: Array<ProviderUsageRow & { costUsd: number }>,
  ): Promise<void> {
    for (const row of rows) {
      await db
        .insert(usageRecords)
        .values({
          connectionId,
          userId,
          date,
          model: row.model,
          tokensInput: row.tokensInput,
          tokensOutput: row.tokensOutput,
          costUsd: row.costUsd.toFixed(6),
        })
        .onConflictDoUpdate({
          target: [usageRecords.connectionId, usageRecords.date, usageRecords.model],
          set: {
            tokensInput: row.tokensInput,
            tokensOutput: row.tokensOutput,
            costUsd: row.costUsd.toFixed(6),
          },
        });
    }
  },
};
```

- [ ] **Step 6: Write `src/services/PollingService.ts`**

```ts
import { ConnectionRepository } from '../repositories/ConnectionRepository.js';
import { UsageRepository } from '../repositories/UsageRepository.js';
import { decrypt } from '../utils/encryption.js';
import { fetchOpenAiUsage } from '../providers/openai.js';
import { fetchAnthropicUsage } from '../providers/anthropic.js';
import { costUsd } from '../providers/pricing.js';
import { todayUtcRange } from '../providers/types.js';
import { ProviderAuthError } from '../providers/errors.js';
import { logger } from '../utils/logger.js';
import type { apiConnections } from '../db/schema.js';

type Connection = typeof apiConnections.$inferSelect;

export interface PollResult {
  connectionId: string;
  provider: string;
  status: 'polled' | 'auth_error' | 'error';
  modelsUpdated: number;
}

async function pollOne(connection: Connection): Promise<PollResult> {
  const range = todayUtcRange();
  const date = range.start.toISOString().slice(0, 10);

  try {
    const apiKey = decrypt(connection.apiKeyEncrypted);
    const rows =
      connection.provider === 'openai'
        ? await fetchOpenAiUsage(apiKey, range)
        : await fetchAnthropicUsage(apiKey, range);

    await UsageRepository.upsertDailyUsage(
      connection.id,
      connection.userId,
      date,
      rows.map((r) => ({ ...r, costUsd: costUsd(r.model, r.tokensInput, r.tokensOutput) })),
    );
    await ConnectionRepository.markPollResult(connection.id, 'active', new Date());
    return {
      connectionId: connection.id,
      provider: connection.provider,
      status: 'polled',
      modelsUpdated: rows.length,
    };
  } catch (err) {
    const isAuthError = err instanceof ProviderAuthError;
    await ConnectionRepository.markPollResult(
      connection.id,
      isAuthError ? 'invalid' : 'polling_error',
      new Date(),
    );
    logger.warn(
      { connectionId: connection.id, provider: connection.provider, err },
      'poll failed for connection',
    );
    return {
      connectionId: connection.id,
      provider: connection.provider,
      status: isAuthError ? 'auth_error' : 'error',
      modelsUpdated: 0,
    };
  }
}

export const PollingService = {
  async pollConnectionsForUser(userId: string): Promise<PollResult[]> {
    const connections = await ConnectionRepository.listPollableForUser(userId);
    return Promise.all(connections.map(pollOne));
  },

  async pollAllActiveConnections(): Promise<PollResult[]> {
    const connections = await ConnectionRepository.listAllPollable();
    return Promise.all(connections.map(pollOne));
  },
};
```

- [ ] **Step 7: Write `src/controllers/PollController.ts`**

```ts
import type { Request, Response } from 'express';
import { PollingService } from '../services/PollingService.js';

export const PollController = {
  async trigger(req: Request, res: Response): Promise<void> {
    const results = await PollingService.pollConnectionsForUser(req.userId!);
    res.json({ results });
  },
};
```

- [ ] **Step 8: Write `src/routes/pollRoutes.ts`**

```ts
import { Router } from 'express';
import { requireAuth } from '../middleware/requireAuth.js';
import { asyncErrorWrapper } from '../middleware/asyncErrorWrapper.js';
import { PollController } from '../controllers/PollController.js';

export const pollRoutes = Router();

pollRoutes.use(requireAuth);
pollRoutes.post('/', asyncErrorWrapper(PollController.trigger));
```

- [ ] **Step 9: Modify `src/app.ts`** — mount the router

Replace:
```ts
  app.use('/api/v1/notifications', notificationRoutes);

  // Plans 5–6 mount domain routers here under /api/v1/
```
with:
```ts
  app.use('/api/v1/notifications', notificationRoutes);
  app.use('/api/v1/poll', pollRoutes);

  // Plan 6 mounts its own router here under /api/v1/
```

And add the import alongside the other route imports at the top:
```ts
import { pollRoutes } from './routes/pollRoutes.js';
```

- [ ] **Step 10: Run tests to verify they pass**

Run: `set -a; source .env; set +a; npx vitest run tests/integration/pollRoutes.test.ts tests/integration/app.test.ts; npm run typecheck`
Expected: PASS (6 + existing app tests), typecheck exit 0

- [ ] **Step 11: Commit**

```bash
git add src/db/schema.ts src/repositories/ConnectionRepository.ts src/repositories/UsageRepository.ts src/services/PollingService.ts src/controllers/PollController.ts src/routes/pollRoutes.ts src/app.ts tests/integration/pollRoutes.test.ts
git commit -m "feat(api): POST /poll — manual OpenAI/Anthropic usage poll, idempotent upsert"
```

---

### Task 5: Recurring BullMQ worker

**Files:**
- Modify: `package.json` (add `bullmq`, `ioredis` deps; add `worker`/`worker:dev` scripts)
- Create: `src/workers/pollWorker.ts`

**Interfaces:**
- Consumes: `PollingService.pollAllActiveConnections()` (Task 4), `config.redis` (existing `unifiedConfig.ts`)
- Produces: a runnable process (`npm run worker`) with no other module in `src/` importing from it — the HTTP server and its tests never construct a Redis connection.

- [ ] **Step 1: Install dependencies**

Run: `npm install bullmq ioredis`
Expected: `package.json`/`package-lock.json` gain `bullmq` and `ioredis`

- [ ] **Step 2: Write `src/workers/pollWorker.ts`**

```ts
import { Queue, Worker } from 'bullmq';
import IORedis from 'ioredis';
import { config } from '../config/unifiedConfig.js';
import { PollingService } from '../services/PollingService.js';
import { logger } from '../utils/logger.js';

const QUEUE_NAME = 'provider-polling';

const connection = new IORedis(config.redis.url, {
  maxRetriesPerRequest: null,
  ...(config.redis.token ? { password: config.redis.token } : {}),
});

const pollingQueue = new Queue(QUEUE_NAME, { connection });

const pollingWorker = new Worker(
  QUEUE_NAME,
  async () => {
    const results = await PollingService.pollAllActiveConnections();
    logger.info({ count: results.length }, 'polling sweep complete');
  },
  { connection },
);

pollingWorker.on('failed', (job, err) => {
  logger.error({ jobId: job?.id, err }, 'polling job failed');
});

await pollingQueue.add(
  'sweep',
  {},
  { repeat: { pattern: '*/5 * * * *' }, jobId: 'provider-polling-sweep' },
);

logger.info('provider polling worker started');
```

- [ ] **Step 3: Modify `package.json`** — add scripts alongside the existing `dev`/`test` entries

```json
    "worker": "tsx src/workers/pollWorker.ts",
    "worker:dev": "tsx watch src/workers/pollWorker.ts",
```

- [ ] **Step 4: Run typecheck**

Run: `npm run typecheck`
Expected: exit 0 — this file is never imported by anything under test, so `npm test` is unaffected; there is no automated test for the live-Redis behavior itself (matches this repo's existing convention of leaving process-boundary bootstrap code like `server.ts`/`instrument.ts` outside the automated suite).

- [ ] **Step 5: Manual verification (not automated)**

With a real `REDIS_URL` sourced from `api/.env`: `set -a; source .env; set +a; npm run worker`
Expected: logs `"provider polling worker started"` and, once a job fires, `"polling sweep complete"`; process stays alive. Stop with Ctrl+C.

- [ ] **Step 6: Commit**

```bash
git add package.json package-lock.json src/workers/pollWorker.ts
git commit -m "feat(api): recurring BullMQ worker — sweeps all active OpenAI/Anthropic connections every 5 min"
```

---

## Definition of Done (Plan 5)

- `npm test` green against the Neon test branch (no live Redis or provider credentials needed); `npm run typecheck` exit 0
- `POST /api/v1/poll` populates `usage_records` for an OpenAI or Anthropic connection given a mocked provider response, and re-polling the same UTC day upserts rather than duplicating
- A connection that receives a 401/403 is marked `status: 'invalid'` and excluded from the next sweep's eligibility query (no wasted fetch calls)
- Replicate/fal.ai/Gemini connections are never queried, decrypted, or logged by the poller
- `npm run worker` starts against a real `REDIS_URL` without crashing (manual verification)
- Zero `process.env` reads outside `unifiedConfig.ts`, zero `console.log` in `src/`

## Deferred to later plans (explicit, not forgotten)

- **Replicate, fal.ai, Gemini usage tracking** — no viable account-level usage API exists for any of them (spec §1). Revisit via a different mechanism (Ingest/SDK) if these providers become a priority.
- **Live key validation on `POST /connections`** — the provider modules built here could validate a key at creation time; deferred to avoid a blocking network call inside connection creation.
- **`budgetChecker` / `alertDispatcher`** — reads `usage_records` + `budget_rules`, writes `alert_log`/`notifications`, fires email/Slack/webhook delivery. This plan only populates `usage_records`; nothing yet reads it.
- **Dashboard aggregation, Ingest, Billing, Organizations** — separate domains, later plans.
- **Anthropic cache-creation token cost** — under-counted for heavy prompt-caching users (spec §9).
- **Historical backfill on connection create** — polling only accumulates data going forward from whenever the connection was created.
