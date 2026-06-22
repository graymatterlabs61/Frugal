# Feature Ticket List — Frugal
**Version:** 2.0 (SDK-first roadmap) | **Date:** 2026-06-19

Phases 1–7 are complete (2026-06-11). Active work starts at Phase 0 (stack migration). Each ticket is sized for a single AI coding session / PR.

---

## ✅ Completed Reference (Phases 1–7)

| Phase | What was built | Completed |
|-------|---------------|-----------|
| 1 | Auth pages, middleware, AES-256 encryption, Supabase clients, schema migrations 001–002 | 2026-06-03 |
| 2 | Projects/connections CRUD, provider validators (4 providers), worker.ts, budgetChecker, alertService, /api/poll | 2026-06-05 |
| 3 | lib/queries/dashboard.ts, real data on dashboard/alerts/project-detail pages (replaced all mocks) | 2026-06-06 |
| 4 | Budget rules CRUD API, UI wired, tier enforcement, lib/tier.ts feature gates | 2026-06-06 |
| 5 | Stripe checkout/portal/webhook, billing page with real invoices, tier limits on routes | 2026-06-07 |
| 6 | 13 Resend email templates, Slack webhook per project, alert dedup, delivery_status JSONB | 2026-06-07 |
| 7 | Account/security settings, QStash docs, tier limits enforced everywhere, ESLint clean, UI polish | 2026-06-11 |

---

## Phase 0 — Stack Migration (Supabase → Neon + Drizzle + Auth.js)

**Goal:** Replace Supabase with Neon Postgres + Drizzle ORM + Auth.js v5. All SDK-era code built on final stack, never ported.

**Blocks:** Everything else. Must complete first.

**Rule after migration:** Replace CLAUDE.md critical rules (Supabase RLS → app-layer auth; `supabase.auth.getUser()` → `auth()`).

---

### TICKET-0-01: Neon + Drizzle setup

**Description:** Set up Neon Postgres project (prod + dev branches). Install `drizzle-orm`, `@neondatabase/serverless`, `drizzle-kit`. Create `lib/db.ts` exporting typed Drizzle client using Neon HTTP driver. Port all 6 existing tables to Drizzle schema files in `lib/schema/`. Run `drizzle-kit push` against Neon.

**Acceptance Criteria:**
- `lib/db.ts` exports typed Drizzle client; no `any` types
- Schema files: `users.ts`, `projects.ts`, `connections.ts`, `records.ts`, `budget.ts` — all tables with correct Drizzle types
- Auth.js adapter tables defined (`accounts`, `sessions`, `verification_tokens`)
- `drizzle-kit push` applies schema to Neon with zero errors
- `DATABASE_URL` (pooler) and `DATABASE_URL_UNPOOLED` (direct) in `.env.example`
- `drizzle/migrations/` directory exists for future migration files

**Priority:** Must-have | **Blocks:** All Phase 0

---

### TICKET-0-02: Auth.js v5 setup — magic-link + Google OAuth

**Description:** Install `next-auth@beta` with Drizzle adapter on Neon. Configure `lib/auth.ts` with `EmailProvider` (Resend `sendVerificationRequest`) and `GoogleProvider`. Create `app/api/auth/[...nextauth]/route.ts`. Configure middleware to protect all `/(dashboard)/` routes using Auth.js middleware.

**Acceptance Criteria:**
- User can sign up and log in via email magic-link (Resend sends the email)
- User can sign up and log in via Google OAuth
- `auth()` returns `{ user: { id, email } }` in server components and route handlers
- Unauthenticated request to any `/dashboard/*` route → redirect to `/login`
- JWT session: 30-day expiry; no session-table reads per request
- Magic-link tokens: 15-minute expiry, single-use
- Zero Supabase auth imports remain in codebase after this ticket

**Dependencies:** TICKET-0-01 | **Priority:** Must-have | **Blocks:** All route migration

---

### TICKET-0-03: Port all session-authenticated API routes to Drizzle

**Description:** Replace all `supabase.from(...)` query calls in API routes with Drizzle. Auth check: `const session = await auth(); if (!session?.user?.id) return 401`. Every query scoped to `session.user.id`. Tables: `projects`, `api_connections`, `budget_rules`.

**Routes to migrate:**
- `GET/POST /api/projects`
- `GET/PATCH/DELETE /api/projects/[id]`
- `GET/POST /api/connections`
- `PATCH/DELETE /api/connections/[id]`
- `GET/POST /api/budget-rules`
- `DELETE /api/budget-rules/[id]`

**Acceptance Criteria:**
- All 6 routes work end-to-end with Drizzle queries
- All queries: `where(eq(table.userId, session.user.id))` or join through `projects.userId`
- Wrong user or non-existent resource → 404 (never 403)
- Tier limits re-applied: `lib/tier.ts` functions used (not Supabase RLS)
- Zero Supabase imports in any migrated route
- Zod validation unchanged on all routes

**Dependencies:** TICKET-0-01, TICKET-0-02 | **Priority:** Must-have

---

### TICKET-0-04: Port server components and lib/queries to Drizzle

**Description:** Replace Supabase queries in `lib/queries/dashboard.ts` and all dashboard server components with Drizzle equivalents. Date filters must use `getHistoryDays(plan)` from `lib/tier.ts`.

**Files to migrate:**
- `lib/queries/dashboard.ts` — all aggregation functions
- `app/(dashboard)/dashboard/page.tsx`
- `app/(dashboard)/projects/[id]/page.tsx`
- `app/(dashboard)/alerts/page.tsx`

**Acceptance Criteria:**
- Dashboard stat cards (monthly spend, active projects, connection count, alert count) show real data from Drizzle/Neon
- SpendChart renders real daily spend; stacked bar per provider
- Top projects by spend; recent alerts — all from Drizzle
- Project detail page: connections tab, alerts tab, stats — all from Drizzle
- History window clamped by plan (7/90/365 days)
- Zero Supabase imports in server components or `lib/queries/`

**Dependencies:** TICKET-0-01, TICKET-0-02 | **Priority:** Must-have

---

### TICKET-0-05: Port polling worker and alert service to Drizzle

**Description:** Replace Supabase calls in `lib/polling/worker.ts`, `lib/polling/budgetChecker.ts`, `lib/polling/alertService.ts`. Verify end-to-end: QStash → poll → usage_records upsert → budget check → email + Slack alert fires.

**Acceptance Criteria:**
- `/api/poll` (QStash-verified POST + dev GET) processes all active connections via Drizzle
- `worker.ts` reads `api_connections` → decrypts key → calls provider module → upserts `usage_records`
- `budgetChecker.ts` reads `budget_rules` + sums `usage_records` via Drizzle → writes `alert_log`
- `alertService.ts` reads `projects.slack_webhook_url`, writes `alert_log.delivery_status` via Drizzle
- 1-hour alert dedup via `alert_log` query (not Redis for this path)
- QStash signature verification unchanged
- Zero Supabase imports in `lib/polling/`

**Dependencies:** TICKET-0-01, TICKET-0-02 | **Priority:** Must-have

---

### TICKET-0-06: Port Stripe webhook to Drizzle

**Description:** Replace Supabase calls in `/api/stripe/webhook/route.ts` with Drizzle service-level DB writes (no user session; webhook context).

**Acceptance Criteria:**
- `checkout.session.completed` → updates `users.plan` + `users.stripe_customer_id` via Drizzle
- `customer.subscription.updated` → updates `users.plan` via Drizzle
- `customer.subscription.deleted` → sets `users.plan = 'free'` via Drizzle
- HMAC verification (`stripe.webhooks.constructEvent`) and `export const runtime = 'nodejs'` unchanged
- Raw body via `request.text()` unchanged
- Zero Supabase imports in webhook route

**Dependencies:** TICKET-0-01 | **Priority:** Must-have

---

### TICKET-0-07: Port account/security settings to Drizzle + Auth.js

**Description:** Replace Supabase auth calls in account settings (`supabase.auth.updateUser`) with Auth.js + Drizzle equivalents. Name/email updates → write directly to `users` table via Drizzle. Security (password change) → removed entirely (no passwords in Auth.js magic-link setup; surface "You signed in via magic-link — no password to change" message).

**Acceptance Criteria:**
- User can update display name → writes to `users.name` via Drizzle
- User can see their email address (read-only — email changes require re-auth)
- Security tab: shows "Passwordless account" explanation + option to connect Google OAuth
- Zero Supabase imports in settings routes

**Dependencies:** TICKET-0-01, TICKET-0-02 | **Priority:** Must-have

---

### TICKET-0-08: Update CLAUDE.md critical rules post-migration

**Description:** Rewrite CLAUDE.md "Critical Rules" section. Remove all Supabase RLS and `supabase.auth.getUser()` references. Replace with Auth.js + Drizzle authorization rules.

**New critical rules:**
1. Every API route calls `const session = await auth(); if (!session?.user?.id) return 401` — before any logic
2. Every DB query scoped by `session.user.id` via `where` clause or `projects.userId` join
3. DB access only in server code (route handlers, server components, workers)
4. Ingest routes: auth via ingest key (SHA-256 hash lookup), not session
5. Stripe webhook: HMAC verification via `stripe.webhooks.constructEvent`
6. QStash routes: verified via `QSTASH_CURRENT_SIGNING_KEY`
7. No `any` TypeScript types

**Acceptance Criteria:**
- CLAUDE.md critical rules accurately describe the Neon/Drizzle/Auth.js authorization model
- Zero references to Supabase RLS or `supabase.auth.getUser()` in CLAUDE.md

**Dependencies:** All Phase 0 tickets complete | **Priority:** Must-have

---

## Phase A — SDK Database Schema

**Goal:** Add 5 new tables/columns for the SDK event pipeline.

**Dependency:** Phase 0 complete.

---

### TICKET-A-01: `ingest_keys` table + Drizzle schema

**Description:** Add `ingest_keys` to Drizzle schema (`lib/schema/events.ts`). Generate and apply migration. Key format spec: `fr_pk_` + 32 chars base62 (crypto.getRandomValues). Hash: SHA-256 via `crypto.subtle.digest`.

**Acceptance Criteria:**
- Table in Neon: `id`, `project_id` (FK cascade), `key_hash` (UNIQUE), `key_prefix`, `created_at`, `revoked_at`
- Drizzle schema file exports typed table definition
- Migration applied via `drizzle-kit push`
- Utility function `lib/ingest/generateKey.ts` exports `generateIngestKey()` → `{ plaintext: 'fr_pk_...', hash: '...', prefix: 'fr_pk_a1b2' }`

**Priority:** Must-have

---

### TICKET-A-02: `usage_events` table

**Description:** Add append-only `usage_events` table (ClickHouse-mirror schema) to Drizzle schema and Neon. Add index on `(project_id, occurred_at DESC)`.

**Acceptance Criteria:**
- All columns per TAD.md §4: `id` (uuid PK — UUIDv7 client-generated), `project_id`, `user_id`, `provider`, `model`, `input_tokens`, `output_tokens`, `cost_usd`, `cost_source` (CHECK computed/client_reported), `pricing_version`, `sdk_version`, `metadata` (jsonb), `occurred_at`, `received_at`
- Index created: `(project_id, occurred_at DESC)`
- Drizzle schema with correct Drizzle types (including `jsonb` → `jsonb()`)

**Priority:** Must-have

---

### TICKET-A-03: `usage_rollups` table

**Description:** Add `usage_rollups` table to Drizzle schema + Neon. Composite PK: `(project_id, hour, provider, model)`.

**Acceptance Criteria:**
- Columns: `project_id`, `hour` (timestamptz truncated to hour), `provider`, `model`, `events_count`, `input_tokens`, `output_tokens`, `cost_usd`
- Composite PK enforced
- Drizzle schema exported

**Priority:** Must-have

---

### TICKET-A-04: `enforcement_state` columns on `projects`

**Description:** Alter `projects` table: add `enforcement_state text NOT NULL DEFAULT 'ok'` with check constraint `('ok','blocked')` and `enforcement_updated_at timestamptz`.

**Acceptance Criteria:**
- Both columns exist in Neon
- Drizzle schema updated in `lib/schema/projects.ts`
- All existing rows default to `'ok'` after migration

**Priority:** Must-have

---

### TICKET-A-05: `model_pricing` table + seed script

**Description:** Add `model_pricing` table to Drizzle schema + Neon. Write `scripts/seed-pricing.ts` with current public pricing for all 12 providers. Write `lib/ingest/computeCost.ts` with lookup: exact model match → longest-prefix match → fallback (cost=0, log warning).

**Pricing to seed (current public pricing as of 2026-06):**
- OpenAI: gpt-4o, gpt-4o-mini, gpt-4-turbo, gpt-3.5-turbo, o1, o1-mini, text-embedding-3-small, text-embedding-3-large
- Anthropic: claude-opus-4, claude-sonnet-4, claude-haiku-4
- Replicate: flux-pro, flux-dev, flux-schnell (client_reported pattern)
- fal.ai: flux-pro, flux-dev (client_reported pattern)
- Groq: llama-3.3-70b, llama-3.1-8b, mixtral-8x7b
- Gemini: gemini-2.0-flash, gemini-1.5-pro, gemini-1.5-flash

**Acceptance Criteria:**
- Table: `(provider, model, version)` PK; `input_per_mtok`, `output_per_mtok`, `effective_from`
- `seed-pricing.ts` runs without error: `npx tsx scripts/seed-pricing.ts`
- `computeCost(provider, model, inputTokens, outputTokens)` returns `{ costUsd, pricingVersion, costSource }`
- Unknown model → `{ costUsd: 0, pricingVersion: null, costSource: 'computed' }` + console.warn
- Prefix match: `gpt-4o-2024-11-20` matches `gpt-4o` prefix

**Priority:** Must-have

---

### TICKET-A-06: Atomic ingest transaction Postgres function

**Description:** Write `lib/ingest/ingestBatch.ts` implementing atomic batch insert: event dedup via `ON CONFLICT (id) DO NOTHING` + rollup increment via `ON CONFLICT (project_id, hour, provider, model) DO UPDATE SET cost_usd = usage_rollups.cost_usd + excluded.cost_usd, ...`. Both operations in a single `db.transaction()`. Guarantee: deduped event never double-increments rollup.

**Acceptance Criteria:**
- `ingestBatch(events: ProcessedEvent[]) → { accepted, deduped }` exported function
- Single Drizzle `db.transaction()` wraps: INSERT INTO usage_events (ON CONFLICT DO NOTHING) + INSERT INTO usage_rollups (ON CONFLICT DO UPDATE)
- Submit same event_id twice → second call: accepted=0, deduped=1, rollup unchanged
- TypeScript types: `ProcessedEvent` has all required fields; no `any`

**Priority:** Must-have

---

## Phase B — Ingest & Status API

**Goal:** Build `POST /api/v1/events` and `GET /api/v1/status` — the public SDK-facing server endpoints.

**Dependency:** Phase A complete.

---

### TICKET-B-01: Ingest key management API

**Description:** Build `POST /api/ingest-keys` (create key; return plaintext once) and `DELETE /api/ingest-keys/[id]` (revoke). Session-authenticated. Enforce one active key per project (creation revokes existing key if present, or route blocks creation if active key exists — decide: rotation creates new + revokes old).

**Acceptance Criteria:**
- `POST /api/ingest-keys` requires `{ projectId }` (session user must own project)
- Response: `{ id, prefix: 'fr_pk_a1b2', plaintext: 'fr_pk_...' }` — plaintext returned once only
- `DELETE /api/ingest-keys/[id]` sets `revoked_at = now()`; Redis cache invalidated
- Rotation flow: POST when active key exists → revoke old + create new in same transaction
- Zero plaintext keys stored in DB
- Plan check: all plans can have ingest keys (SDK is free on all tiers)

**Priority:** Must-have

---

### TICKET-B-02: Ingest key management UI

**Description:** Project detail page → SDK Integration tab. Show active key prefix, "Create key" button, "Rotate" button, "Revoke" button. Copy-once modal for key creation. SDK setup code snippet pre-filled with user's actual key prefix (never full key).

**Acceptance Criteria:**
- Create: shows copy-once modal with `⚠️ "You won't see this again"` + clipboard copy button + close button
- After close: only prefix shown in list (e.g. `fr_pk_a1b2...`)
- Rotate: confirmation dialog "Old key stops working immediately. Continue?" → creates new, revokes old, shows new key in copy modal
- Revoke: confirmation dialog → sets revoked_at
- Setup snippet displayed:
  ```bash
  npm install @getfrugal/sdk
  FRUGAL_KEY=fr_pk_a1b2...
  ```
  ```typescript
  const frugal = new Frugal({ key: process.env.FRUGAL_KEY! })
  const openai = frugal.wrap(new OpenAI())
  ```

**Dependencies:** TICKET-B-01 | **Priority:** Must-have

---

### TICKET-B-03: `POST /api/v1/events` — ingest route

**Description:** Public route. Auth: `Authorization: Bearer fr_pk_...` → SHA-256 → lookup `ingest_keys` (Redis 60s cache) → `{ projectId, userId, plan }`. Validate batch (Zod). Plan event-cap check. Compute cost per event. Execute atomic ingest transaction. Return `{ accepted, deduped, dropped }`.

**Full pipeline per request:**
1. Extract `Authorization: Bearer ...` header → SHA-256 hash
2. Redis lookup `ik:{hash}` → if miss: DB query → cache result 60s → if revoked: 401
3. Body size check ≤256KB; parse JSON
4. Zod validation: `{ events: EventSchema[] }` (max 100)
5. Per-key rate limit: Upstash Ratelimit 60 req/min sliding window → 429 on breach
6. Plan event-cap check: monthly count from `usage_rollups` (Redis-cached 5min) → 429 + `X-Frugal-Cap-Exceeded: true` if over
7. Per event: `computeCost(provider, model, inputTokens, outputTokens)` → `cost_usd`, `pricing_version`
8. `ingestBatch(events)` → `{ accepted, deduped }`
9. Return `{ accepted, deduped, dropped }`

**Acceptance Criteria:**
- Invalid key → 401 `{ error: 'Invalid key' }`
- Revoked key → 401 (Redis cache invalidated on revoke)
- Body >256KB → 413
- Validation fail → 400 with Zod issues
- Over rate limit → 429 with `Retry-After` header
- Over event cap → 429 with `X-Frugal-Cap-Exceeded: true`
- Duplicate batch (all deduped) → 200 `{ accepted: 0, deduped: N, dropped: 0 }`
- No `any` types anywhere
- Route does NOT require session auth (ingest key auth only)

**Priority:** Must-have

---

### TICKET-B-04: Incremental budget evaluation at ingest

**Description:** After `ingestBatch()` succeeds, run `evaluateBudget(projectId)` in same request (async, non-blocking for response). Reads active `budget_rules` for project. Sums `usage_rollups.cost_usd` for current window (indexed, cheap). If threshold crossed + plan allows action → flip `projects.enforcement_state = 'blocked'` → delete Redis `status:{projectId}` key → enqueue alert via `alertService` (1-hour dedup via `alert_log`).

**Acceptance Criteria:**
- Rule with `action: 'block'` + plan has `canUseBlock` + threshold crossed → `enforcement_state = 'blocked'`
- Free-tier rule with `action: 'alert'` only → no block, alert fires
- Alert dedup: same `rule_id` + window → check `alert_log` for entry within 1 hour → skip if exists
- Redis `status:{projectId}` deleted on enforcement flip (cache invalidation)
- `evaluateBudget` wrapped in try/catch — never fails the HTTP response
- Unblock path: cron backstop recomputes state each run; rule edit/delete routes call `evaluateBudget` immediately

**Dependencies:** TICKET-B-03, TICKET-A-06 | **Priority:** Must-have

---

### TICKET-B-05: `GET /api/v1/status` — enforcement status route

**Description:** Public route. Same ingest key auth. Served from Redis (30s TTL). Returns enforcement state for SDK to cache.

**Response schema:**
```json
{
  "state": "ok",
  "blockedRules": [],
  "checkAfterSeconds": 30
}
```
Or when blocked:
```json
{
  "state": "blocked",
  "blockedRules": [{ "ruleId": "...", "window": "daily", "limitUsd": 50, "spendUsd": 51.20 }],
  "checkAfterSeconds": 30
}
```

**Acceptance Criteria:**
- Invalid key → 401
- Cache hit → response <10ms (Redis only)
- Cache miss → Drizzle query for `projects.enforcement_state` + active blocked rules → cache 30s
- `checkAfterSeconds: 30` always present (SDK uses to set polling interval)
- `blockedRules` array populated with rule details when blocked; empty array when `ok`

**Priority:** Must-have

---

## Phase C — SDK npm Package (`@getfrugal/sdk`)

**Goal:** Publish working TypeScript SDK to npm. Separate `frugal-sdk` repository.

**Dependency:** Phase B (ingest API live for integration tests).

---

### TICKET-C-01: SDK repo setup + build pipeline

**Description:** Create `frugal-sdk` repo. TypeScript strict. `tsup` for dual ESM+CJS output. Zero runtime dependencies. Node ≥18 + Vercel/Cloudflare edge runtime compatibility. GitHub Actions CI: lint + tests + build on PR.

**Build outputs:**
- `dist/index.mjs` (ESM)
- `dist/index.cjs` (CJS)
- `dist/index.d.ts` (TypeScript declarations)

**`package.json` exports:**
```json
{
  "exports": {
    ".": {
      "import": "./dist/index.mjs",
      "require": "./dist/index.cjs",
      "types": "./dist/index.d.ts"
    }
  }
}
```

**Acceptance Criteria:**
- `npm run build` succeeds with both output formats
- `npm run test` runs (vitest); at least unit tests for `computeKey` hash + `generateEventId`
- Zero runtime deps (`devDependencies` only for build tooling)
- `npm publish --dry-run` succeeds with no warnings
- Verify npm availability: `@getfrugal/sdk` — if taken, fallback to `frugal-sdk`

**Priority:** Must-have

---

### TICKET-C-02: `Frugal` class — core client + delivery

**Description:** Main `Frugal` class: constructor, in-memory event queue, interval-based flush, `fetch` delivery with retry, `flush()` and `shutdown()` methods.

**Constructor options:**
```typescript
interface FrugalOptions {
  key: string                // fr_pk_... ingest key
  failMode?: 'open' | 'closed'  // default: 'open'
  flushIntervalMs?: number   // default: 5000
  maxBatchSize?: number      // default: 50
  endpoint?: string          // default: 'https://getfrugal.dev/api/v1'
}
```

**Delivery behavior:**
- Flush sends `POST {endpoint}/events` with `Authorization: Bearer {key}` + JSON batch
- Retry ×3, exponential backoff + jitter (100ms → 200ms → 400ms + random)
- 4xx (except 429): drop batch (bad data won't get better)
- 429 / 5xx / network error: retry, then re-queue once; if still fails, drop + log warning
- `beforeExit` process event: attempt one final flush

**Acceptance Criteria:**
- Events enqueued synchronously via internal `_enqueue(event)`
- `flush()` returns Promise that resolves when current queue drained
- `shutdown()` calls `flush()` + clears interval timer
- Delivery errors never throw to caller — always caught, always logged at warning level
- `console.warn('[frugal]', ...)` pattern for all warnings (no error throws from telemetry paths)

**Priority:** Must-have

---

### TICKET-C-03: `wrap()` — OpenAI provider

**Description:** Proxy-based wrapper for OpenAI Node.js SDK. Intercept `chat.completions.create`, `embeddings.create`, `responses.create`. Before call: enforcement check. After call: read usage, enqueue event.

**Intercepted methods:**
```typescript
client.chat.completions.create     // usage.prompt_tokens + usage.completion_tokens
client.embeddings.create           // usage.prompt_tokens
client.responses.create            // usage.input_tokens + usage.output_tokens (new Responses API)
```

**Enforcement check (before each call):**
1. If cached status `state === 'blocked'` AND rule `action === 'block'` → throw `FrugalBudgetExceededError`
2. If status stale >5 min:
   - `failMode: 'open'` → proceed (no throw)
   - `failMode: 'closed'` → throw `FrugalUnavailableError`

**Streaming (chat.completions.create with `stream: true`):**
- If `stream_options.include_usage` absent → inject `{ stream_options: { include_usage: true } }`
- Passthrough async iterator; read usage from the final chunk that contains `usage`
- User code receives unmodified stream (transparent wrapper)

**Acceptance Criteria:**
- `frugal.wrap(new OpenAI())` returns client that behaves identically to original in all cases
- Non-intercepted methods pass through untouched (Proxy `get` trap for known paths only)
- All telemetry code wrapped in `try/catch` — telemetry failure ≠ user failure
- Streaming: usage captured without breaking stream consumer
- Thrown errors: `FrugalBudgetExceededError` has `{ ruleId, limitUsd, spendUsd, window }` fields
- `FrugalBudgetExceededError` extends `Error`; `name: 'FrugalBudgetExceededError'`
- Unit tests: mock OpenAI client, verify event enqueued with correct tokens

**Priority:** Must-have

---

### TICKET-C-04: `wrap()` — Anthropic provider

**Description:** Proxy-based wrapper for Anthropic Node.js SDK. Intercept `messages.create`. Read `usage.input_tokens` + `usage.output_tokens` from response.

**Streaming (messages.create with `stream: true`):**
- Accumulate: `input_tokens` from `message_start` event, `output_tokens` from final `message_delta` event
- Passthrough async iterator; user code unchanged

**Acceptance Criteria:**
- Same pass/fail acceptance pattern as TICKET-C-03 but for Anthropic SDK
- Non-intercepted methods pass through
- Streaming: both token counts captured correctly
- Unit tests: mock Anthropic client; streaming and non-streaming cases

**Priority:** Must-have

---

### TICKET-C-05: `frugal.track()` — manual event tracking

**Description:** `frugal.track({ provider, model, costUsd, metadata? })` for providers without SDK wrappers (Replicate, fal.ai per-run pricing). Enqueues event with `cost_source: 'client_reported'`.

**Signature:**
```typescript
frugal.track({
  provider: string    // 'replicate' | 'falai' | any string
  model: string
  costUsd: number     // caller provides cost; Frugal does NOT look up pricing
  occurredAt?: Date   // default: new Date()
  metadata?: Record<string, unknown>
})
```

**Acceptance Criteria:**
- Events enqueued with `costSource: 'client_reported'`
- UUIDv7 generated client-side for dedup
- `metadata` passed through as-is
- `costUsd` validated: must be ≥ 0 (throw `TypeError` for negative — synchronous, not telemetry)
- Unit test: verify correct event shape enqueued

**Priority:** Must-have

---

### TICKET-C-06: Status polling + enforcement cache

**Description:** `Frugal` class polls `GET /api/v1/status` on a separate interval (30s default, overridable). Caches result in memory. `wrap()` reads from this cache before each AI call.

**Cache behavior:**
- Poll on interval (30s)
- Also poll immediately on SDK initialization
- Cache entry: `{ state, blockedRules, fetchedAt }`
- Stale check: `Date.now() - fetchedAt > 5 * 60 * 1000` (5 min grace)
- On 401 from status endpoint: log warning "Invalid or revoked ingest key" — do not crash
- On network error: keep stale cache; log warning

**Acceptance Criteria:**
- Status polled every 30s (or value from `checkAfterSeconds` in response)
- Enforcement check in `wrap()` reads from in-memory cache (zero latency on hot path)
- Stale cache behavior matches `failMode` setting
- Unit test: mock status endpoint returning `'blocked'` → next `wrap()` call throws

**Dependencies:** TICKET-C-02, TICKET-C-03 | **Priority:** Must-have

---

### TICKET-C-07: SDK README + npm publish

**Description:** Write `README.md` for the `@getfrugal/sdk` package. Publish to npm. Add SDK setup snippet to Frugal dashboard project detail page (SDK Integration tab).

**README must cover:**
- Installation (`npm install @getfrugal/sdk`)
- Getting your ingest key from the dashboard
- `FRUGAL_KEY` environment variable
- Quickstart: wrap OpenAI
- Quickstart: wrap Anthropic
- Manual tracking with `frugal.track()`
- Serverless: `await frugal.flush()` before handler return; `waitUntil` pattern for Vercel/Cloudflare
- `failMode` — open vs closed
- `FrugalBudgetExceededError` error handling example
- Event cap behavior (transparent warning; never breaks AI calls)

**Acceptance Criteria:**
- `npm install @getfrugal/sdk` installs from npm
- All code examples in README are tested and working
- Dashboard project detail SDK tab: setup snippet pre-filled with user's `key_prefix` (display only)
- Version: `0.1.0`

**Priority:** Must-have

---

## Phase D — Dashboard Read-Path + Reconciler

**Goal:** Switch dashboard to read from `usage_rollups` (SDK primary). Add nightly reconciler.

**Dependency:** Phase C (SDK publishing events so rollups have data).

---

### TICKET-D-01: Dashboard read-path switch to usage_rollups

**Description:** Update `lib/queries/dashboard.ts`. Per-project source resolution: if project has ≥1 event in `usage_events` in the query window → read from `usage_rollups`; else → read from `usage_records` (polling fallback). Source label stored as `{ source: 'sdk' | 'polling' }` per project in query result.

**Acceptance Criteria:**
- SDK-instrumented projects: stats + chart from `usage_rollups`
- Polling-only projects: stats + chart from `usage_records` (no regression)
- Mixed user (some SDK projects, some polling) → correct source per project
- Source label displayed in UI: "Tracked via SDK" badge / "Provider billing" badge on project detail
- Dashboard loads ≤1s on cached rollup data

**Priority:** Must-have

---

### TICKET-D-02: Budget checker reads rollups for SDK projects

**Description:** Update `lib/polling/budgetChecker.ts`. For SDK projects (≥1 event): read spend from `usage_rollups` for window sum. Polling-only projects: read from `usage_records` (unchanged). Same rule evaluation loop; only the spend source changes.

**Acceptance Criteria:**
- SDK project budget check: `SUM(cost_usd) FROM usage_rollups WHERE project_id = X AND hour >= window_start`
- Polling project budget check: unchanged existing logic
- No double-alert: ingest-time `evaluateBudget` fires first; cron check is backstop (checks `alert_log` dedup)
- No code duplication: factor out shared rule-evaluation logic if both paths share it

**Priority:** Must-have

---

### TICKET-D-03: `reconciliation_log` table + nightly reconciler

**Description:** Add `reconciliation_log` table. Build `/api/reconcile` route (QStash daily cron). Per user × provider: sum `usage_records` (provider billing truth) vs sum `usage_events` for same provider/day. Store drift. Add badge to dashboard.

**Table:**
```sql
reconciliation_log (
  id          uuid PK,
  user_id     uuid FK → users,
  date        date NOT NULL,
  provider    text NOT NULL,
  billed_usd  numeric(12,6),   -- from usage_records
  tracked_usd numeric(12,6),   -- from usage_events
  drift_pct   numeric(6,2),
  created_at  timestamptz DEFAULT now(),
  UNIQUE (user_id, date, provider)
)
```

**Dashboard badge:**
- `drift_pct ≤ 5`: green "Reconciled ✓"
- `drift_pct > 5`: amber "Partial coverage — some spend may be untracked"
- No SDK events for provider: no badge (polling-only, no comparison possible)

**Acceptance Criteria:**
- Cron fires once daily via QStash
- Route calculates drift per user × provider for yesterday
- `reconciliation_log` upserted (ON CONFLICT (user_id, date, provider) DO UPDATE)
- Dashboard project detail shows badge per provider
- Amber badge text is exact: "Some spend may be untracked — connect SDK to all scripts"

**Priority:** Should-have

---

## Phase E — Event Caps UX + Pricing Copy

**Goal:** Complete the over-cap UX. Update pricing page messaging.

**Dependency:** Phases A–D.

---

### TICKET-E-01: Over-cap dashboard banner + email

**Description:** When project's monthly event count exceeds `PLAN_LIMITS[plan].eventsPerMonth`: (1) show dashboard banner with cap details + upgrade link, (2) send one email per billing period (flag in `users` table or Redis).

**Banner text:**
> "You've hit your SDK event cap (50,000/mo on Free). Events are being dropped. [Upgrade to Plus →] for 1,000,000 events/month."

**Email:** "Your Frugal event cap was reached" — one per billing period; fires on first `429` from ingest route.

**Acceptance Criteria:**
- Banner shows on `/dashboard` when cap exceeded; disappears when plan upgraded
- Email fires once per billing period (not per event); `cap_email_sent_at` flag prevents re-send
- SDK receives `429` + `X-Frugal-Cap-Exceeded: true`; SDK logs warning once, continues silently

**Priority:** Must-have

---

### TICKET-E-02: Pricing page — SDK event caps + enforcement messaging

**Description:** Update `/pricing` page copy. Surface SDK features: event caps per tier, per-project attribution, enforcement type. Replace any "5-minute polling" framing with SDK-first messaging.

**Copy changes:**
- Plan cards: show event cap (50k / 1M / unlimited)
- Feature rows: "SDK event tracking", "Per-project attribution", "Budget enforcement"
- Honest footnote: "Block enforcement via SDK: ~1 min latency. Pair with provider-native hard limits for zero-gap protection."
- Remove: any implication of real-time blocking without SDK

**Acceptance Criteria:**
- Pricing cards show event cap
- No "real-time" or "instant" block claims for polling path
- SDK framing is primary value prop (not secondary)
- Corporate plan card: "Contact us" CTA with Q3 2026 timeline

**Priority:** Should-have

---

## V1.1 Tickets (Post-Launch)

### TICKET-F-01: Python SDK (`@getfrugal/sdk-python`)

**Description:** Mirror JS SDK design in Python. Target: `pip install frugal-sdk`. Wrap `openai.OpenAI()` and `anthropic.Anthropic()` clients. `frugal.track()` equivalent. Same fail-open/closed semantics.

**Priority:** Should-have (post-launch demand-driven)

---

### TICKET-V11-01: Programmatic API access (PRO)

**Description:** REST API for reading spend data and managing budget rules. API key issued per user (Pro only), AES-256 encrypted at rest. `Authorization: Bearer <api_key>` header.

**Endpoints:**
```
GET  /api/v1/projects
GET  /api/v1/projects/:id/spend
GET  /api/v1/projects/:id/budget-rules
POST /api/v1/projects/:id/budget-rules
PUT  /api/v1/budget-rules/:id
GET  /api/v1/usage
```

**Priority:** Should-have (V1.1)

---

### TICKET-V11-02: Per-user budget limits (PRO)

**Description:** Budget rules scoped to `end_user_id` field in `usage_events`. When a specific end-user's spend in a project exceeds their limit → block only their calls (project-level `enforcement_state` remains `ok`; per-user state tracked in new `user_enforcement` table or `metadata`-based check).

**Requires:** F-09 (per-user attribution via SDK `metadata.userId`) active.

**Priority:** Should-have (V1.1)

---

### TICKET-V11-03: ElevenLabs + Cohere provider polling

**Description:** Add `lib/providers/elevenlabs.ts` and `lib/providers/cohere.ts`. Both providers added to connection validation and polling worker.

**Priority:** Nice-to-have (V1.1)

---

## V2 / Future (Out of Scope)

| Ticket | Feature | Trigger |
|--------|---------|---------|
| TICKET-G-01 | ClickHouse migration via dual-write | ~10M events/month |
| TICKET-H-01 | Gateway tier (hard-block proxy) | Enterprise demand |
| TICKET-I-01 | SDK throttle support (Pro) | Post-launch V1.1 SDK |
| TICKET-I-02 | Gemini, Mistral, Groq `wrap()` | Post C-04 |
| TICKET-J-01 | SOC 2 Type II | Q4 2026 after traction |
| TICKET-K-01 | Corporate proxy (SSO, compliance export, SLA) | Q3 2026 separate product launch |