# Frugal SDK-First Architecture Plan

**Status:** Approved via design interview, 2026-06-11
**Scope:** Per-project cost attribution + local budget enforcement via JS SDK. Polling demoted to reconciliation. Foundations laid for ClickHouse data plane and gateway tier.

> **Backend implementation spec:** `.planning/BACKEND_ARCHITECTURE.md` (layering, Auth.js, authorization model, security checklist, Phase 0 migration steps).
>
> **Stack decision (2026-06-11):** App plane migrates **Supabase → Neon Postgres + Auth.js (NextAuth v5) + Cloudflare R2 + Resend**. Founder decision; supersedes earlier "keep Supabase" recommendation. Consequence: **Phase 0 (stack migration) runs first** — all SDK-era code is built on the final stack, never ported. Authorization model changes from Supabase RLS to app-layer scoping (see §4.6). CLAUDE.md critical rules need updating after Phase 0 (currently reference Supabase RLS + `supabase.auth.getUser()`).

---

## 1. Problem

Provider usage APIs report **org-level** spend. A user sharing one provider key (e.g. one Replicate account) across multiple real projects gets all spend lumped into a single Frugal project. This breaks:

- Per-project budget rules (`budget_rules` attach to projects, but spend can't be attributed)
- Per-project pricing (`PLAN_LIMITS` counts projects; counting is meaningless without attribution)
- The core promise: stop costs *before* they spiral (polling = 5-min blind window, no real enforcement)

## 2. Decisions (locked in design interview)

| # | Decision | Choice |
|---|----------|--------|
| 1 | Data primacy | **SDK events primary** for dashboard + budget rules. Polling = nightly reconciliation with visible drift badge ("vs provider billing: −2%"). |
| 2 | SDK capture | **Client wrappers** (`frugal.wrap(new OpenAI())`) + **`frugal.track()`** escape hatch. No global fetch patching. |
| 3 | Key model | **One ingest key per project** (`fr_pk_…`). Project resolved server-side from key. No project param in SDK calls. |
| 4 | Enforcement fail mode | **Fail-open by default** (Frugal down → user's AI calls proceed on stale cache). `failMode: 'closed'` opt-in for runaway-agent protection. Blocking documented as best-effort; hard guarantees reserved for future gateway tier. |
| 5 | Event store | **Postgres (Neon) now**, schema mirrors future ClickHouse table 1:1. `usage_events` (append-only) + `usage_rollups` (hourly aggregates). All readers hit rollups, never raw events. |
| 6 | Cost computation | **Server-side at ingest** from a versioned pricing table. Events store `pricing_version`. `track()` may pass explicit `costUsd` → flagged `client_reported` (Replicate/fal per-run pricing). |
| 7 | Budget evaluation | **Incremental at ingest**: rollup updated → cheap rule check → flip project `enforcement_state` + fire alert async. Block propagates to SDK in ≤ ~1 min (status cache bound). Cron remains backstop for polling-only projects + dedupe. |
| 8 | Plan gating | **SDK free on all tiers** (it's the moat / funnel). Event caps: free 50k/mo, starter 1M/mo, pro unlimited. Over cap → events dropped **with** banner + email, never silently. Enforcement gating unchanged (`canUseBlock` paid, `canUseThrottle` pro). |

Decided without interview (no real tradeoff):

- Idempotency: SDK generates UUIDv7 `event_id`; at-least-once delivery; ingest dedupes via `ON CONFLICT DO NOTHING`.
- Ingest lives as Next.js API routes on Vercel (zero new infra; peel off a dedicated ingest service only if p99 demands).
- Ingest keys stored **hashed** (SHA-256) in a dedicated table → rotation/revocation support; plaintext shown once at creation.
- SDK v1 enforcement = **block only**. Throttle (pro) in a later SDK release.
- `api_connections` becomes **optional** for SDK-instrumented projects (SDK-only projects work; reconciliation simply unavailable until a key is connected).
- npm package name: `@getfrugal/sdk` preferred (matches domain) — **verify npm availability before Phase C**.

---

## 3. Target architecture

```
user's app ──wrap()──> provider API (direct, unchanged latency)
     │
     ├── async batch ──> POST /api/v1/events ──> usage_events (append-only)
     │                          │                usage_rollups (hourly upsert)
     │                          └── incremental budget check ──> enforcement_state
     │                                                           └─> alertService
     └── GET /api/v1/status (cached 30–60s in SDK) <── enforcement_state
                                                       
polling worker (5 min) ──> usage_records  (unchanged tables)
nightly reconciler ──────> drift % per provider  ──> dashboard badge
```

---

## 4. Database changes (Phase A)

### 4.1 `ingest_keys`
```sql
create table ingest_keys (
  id          uuid primary key default gen_random_uuid(),
  project_id  uuid not null references projects(id) on delete cascade,
  key_hash    text not null unique,        -- sha256 of full key
  key_prefix  text not null,               -- 'fr_pk_a1b2' for display
  created_at  timestamptz not null default now(),
  revoked_at  timestamptz
);
-- Access: server-only; reads scoped via projects.user_id = session user (§4.6).
```
Key format: `fr_pk_` + 32 chars base62. Shown once. One active key per project (enforced in route, not schema — rotation creates new, revokes old).

### 4.2 `usage_events` (append-only, ClickHouse-mirror shape)
```sql
create table usage_events (
  id              uuid primary key,                 -- client-generated UUIDv7
  project_id      uuid not null references projects(id) on delete cascade,
  user_id         uuid not null,
  provider        text not null,
  model           text not null,
  input_tokens    bigint not null default 0,
  output_tokens   bigint not null default 0,
  cost_usd        numeric(12,6) not null,
  cost_source     text not null check (cost_source in ('computed','client_reported')),
  pricing_version text,
  sdk_version     text,
  metadata        jsonb,                            -- user tags: {feature:'chat', env:'prod'}
  occurred_at     timestamptz not null,             -- client event time
  received_at     timestamptz not null default now()
);
create index on usage_events (project_id, occurred_at desc);
```
No updates, no deletes (except plan-retention pruning job later). UUIDv7 PK = dedupe + roughly time-ordered index.

### 4.3 `usage_rollups`
```sql
create table usage_rollups (
  project_id    uuid not null references projects(id) on delete cascade,
  hour          timestamptz not null,               -- truncated to hour
  provider      text not null,
  model         text not null,
  events_count  bigint not null default 0,
  input_tokens  bigint not null default 0,
  output_tokens bigint not null default 0,
  cost_usd      numeric(14,6) not null default 0,
  primary key (project_id, hour, provider, model)
);
```
Maintained by ingest route via `INSERT … ON CONFLICT … DO UPDATE SET cost_usd = usage_rollups.cost_usd + excluded.cost_usd, …`. **Caveat:** increment-on-conflict + event dedupe must be atomic — wrap event insert + rollup increment in one SQL function / single transaction (Drizzle `db.transaction` or a Postgres function called per batch) so a deduped event never double-increments the rollup.

### 4.4 `projects` additions
```sql
alter table projects add column enforcement_state text not null default 'ok'
  check (enforcement_state in ('ok','blocked'));
alter table projects add column enforcement_updated_at timestamptz;
```

### 4.5 `model_pricing`
```sql
create table model_pricing (
  provider        text not null,
  model           text not null,                    -- exact or prefix pattern
  input_per_mtok  numeric(12,6) not null,
  output_per_mtok numeric(12,6) not null,
  version         text not null,                    -- e.g. '2026-06'
  effective_from  timestamptz not null,
  primary key (provider, model, version)
);
```
Seeded from current public pricing for all 12 providers in `lib/providers/`. Lookup: exact model match, then longest-prefix match (handles `gpt-4o-2024-11-20` → `gpt-4o`). Unknown model → cost 0 + `cost_source='computed'` + log warning + surface "unpriced model" in dashboard (honest, not silent).

### 4.6 Authorization model (post-Supabase)
With Neon + Auth.js there is no Supabase RLS layer. Replacement rules (these become the new CLAUDE.md critical rules):
- **Every** server query is scoped by the authenticated session user (`where user_id = session.user.id` or owner-join through `projects`) — no unscoped table reads, ever.
- DB access happens **only** in server code (route handlers / server components / workers). No connection string or query surface reaches the client.
- Ingest/status routes authenticate by ingest key (not session) and are scoped to the key's single project.
- Optional hardening later: Postgres RLS on Neon with per-request `set local` of user id — nice-to-have, not Phase 0 blocker.

---

## 5. Ingest & status API (Phase B)

### 5.1 `POST /api/v1/events`
- Auth: `Authorization: Bearer fr_pk_…` → SHA-256 → `ingest_keys` lookup (Redis-cached 60s) → project_id, user_id, plan.
- Body: Zod-validated batch, max 100 events / 256KB. No `any` types.
- Pipeline per batch:
  1. Plan event-cap check (monthly count from rollups, Redis-cached): over cap → `429` + `X-Frugal-Cap-Exceeded`, increment dropped-events counter, trigger banner/email flag (once per period).
  2. Compute `cost_usd` per event from `model_pricing` (unless `client_reported`).
  3. Single RPC: insert events (dedupe) + increment rollups atomically.
  4. Incremental budget check: active rules for project → sum current window from rollups (indexed, cheap) → threshold crossed → set `enforcement_state='blocked'` (only for rules with `action='block'` and plan passing `canUseBlock`) + invalidate status cache + enqueue alert (reuse `alertService.fireAlert`, dedupe via existing `alert_log` 1-hour window).
- Rate limit: per key, Upstash ratelimit (e.g. 60 req/min — generous, SDK batches).
- Response: `{ accepted, deduped, dropped }`.

### 5.2 `GET /api/v1/status`
- Same auth. Returns:
```json
{
  "state": "ok" | "blocked",
  "blockedRules": [{ "ruleId": "...", "window": "daily", "limitUsd": 50, "spendUsd": 51.2 }],
  "checkAfterSeconds": 30
}
```
- Served from Redis cache (30s TTL) keyed by project; invalidated on enforcement_state flip. Worst-case block propagation = ingest eval (~seconds) + SDK status cache (30–60s) ≈ 1 min.

### 5.3 Unblocking
When window rolls over (new day/month) or rule edited/deleted: enforcement_state recomputed. Cheapest correct approach: cron backstop recomputes states each run; plus rule-mutation API routes trigger immediate recompute. (Window rollover within ≤5 min via cron is acceptable — unblocking latency is low-stakes vs blocking latency.)

---

## 6. SDK — `@getfrugal/sdk` (Phase C)

Separate repo (`frugal-sdk`), TypeScript, dual ESM+CJS via tsup, zero runtime deps. Node ≥18 + edge runtimes. Published to npm; semver from `0.1.0`.

### 6.1 Public API
```ts
const frugal = new Frugal({
  key: process.env.FRUGAL_KEY!,        // fr_pk_…
  failMode: 'open',                    // 'open' | 'closed' (default open)
  flushIntervalMs: 5000,               // batching
  maxBatchSize: 50,
  endpoint: 'https://getfrugal.dev/api/v1', // overridable for testing
});

const openai = frugal.wrap(new OpenAI());          // Proxy-based
const anthropic = frugal.wrap(new Anthropic());

frugal.track({ provider: 'replicate', model: 'flux-pro', costUsd: 0.055,
               metadata: { feature: 'thumbnail-gen' } });

await frugal.flush();                  // manual drain (serverless handlers)
await frugal.shutdown();               // flush + stop timers
```

### 6.2 `wrap()` mechanics
- `Proxy` over provider client; intercepts known method paths (`chat.completions.create`, `responses.create`, `messages.create`, `embeddings.create`).
- Before call: enforcement check — if cached status `blocked` and rule action applies → throw `FrugalBudgetExceededError` (carries rule info). If status stale beyond grace (default 5 min) → `failMode` decides: open = proceed, closed = throw `FrugalUnavailableError`.
- After call: read usage from response (`usage.prompt_tokens` etc. / Anthropic `usage.input_tokens`), enqueue event.
- **Streaming:** OpenAI — if `stream: true` and `stream_options.include_usage` absent, inject it; usage read from final chunk. Anthropic — accumulate `message_start` + `message_delta` usage. Wrapped stream is a passthrough async iterator; user code unchanged.
- Unknown/unwrappable methods pass through untouched — wrapper must never break a provider call it doesn't understand (try/catch around all telemetry paths; telemetry failure ≠ user failure).

### 6.3 Delivery
- In-memory queue → flush on interval / size / `beforeExit`.
- `fetch` with retry ×3, exponential backoff + jitter; 4xx (except 429) = drop batch (bad data won't get better); 429/5xx/network = retry then requeue once.
- At-least-once; server dedupes by event id.
- Serverless note in docs: call `await frugal.flush()` before handler return, or use `waitUntil` where available.

### 6.4 v1 cut lines
- Block enforcement only (no throttle).
- JS/TS only (Python = Phase F).
- No browser support (AI keys shouldn't be in browsers anyway) — server runtimes only.

---

## 7. Dashboard & reconciliation (Phase D)

### 7.1 Read-path switch
`lib/queries/dashboard.ts` and budget UI read from `usage_rollups` for SDK-instrumented projects; fall back to `usage_records` (polling) for projects without events. A project is "SDK-instrumented" if it has ≥1 event in the window. Mixed accounts fine: per-project source resolution, source labeled in UI ("Tracked via SDK" / "Provider billing").

### 7.2 `budgetChecker` update
Cron checker reads rollups (SDK projects) / usage_records (polling projects) — same rule loop, swapped spend source. Ingest-time incremental check handles SDK projects between crons.

### 7.3 Nightly reconciler (new QStash schedule)
Per user × provider: sum polling `usage_records` (org truth) vs sum SDK events across that user's projects for same provider/day. Store drift % in `reconciliation_log` (date, user_id, provider, billed_usd, tracked_usd, drift_pct). Dashboard badge: drift ≤5% green "reconciled", >5% amber "partial coverage — some spend untracked by SDK" (honest framing: usually means un-instrumented scripts, not Frugal error).

---

## 8. Plan/billing integration (Phase E)

- Event caps in `lib/tier.ts`:
```ts
export const PLAN_LIMITS = {
  free:    { connections: 1, projects: 1,        eventsPerMonth: 50_000 },
  starter: { connections: 3, projects: 5,        eventsPerMonth: 1_000_000 },
  growth:  { connections: 3, projects: 5,        eventsPerMonth: 1_000_000 },
  pro:     { connections: Infinity, projects: Infinity, eventsPerMonth: Infinity },
} as const;
```
- Over-cap UX: dashboard banner + one email per billing period + `429` to SDK (SDK logs warning once, keeps app working — telemetry drop never breaks user code).
- Settings → project page: ingest key create/rotate/revoke UI, copy-once modal, SDK setup snippet.
- Pricing page: attribution + enforcement messaging update.

---

## 9. Phasing & estimates (solo, sequential)

| Phase | Content | Est. |
|-------|---------|------|
| **0** | **Stack migration**: Neon (schema port via Drizzle, data dump/restore), Auth.js v5 (email magic-link via Resend + Google OAuth), rewrite all `supabase.auth.getUser()` call sites to `auth()` session checks, swap all query call sites to Drizzle, R2 client for future storage needs, re-verify polling worker + Stripe webhooks + alert flow end-to-end | 7–10 days |
| A | Migrations: 5 tables/columns, ingest transaction fn, pricing seed | 2–3 days |
| B | `/api/v1/events`, `/api/v1/status`, incremental eval, caps, rate limits, tests | 3–4 days |
| C | SDK repo: wrap (OpenAI+Anthropic), track, batching, enforcement, streaming, tests, npm publish | 5–7 days |
| D | Dashboard read-path switch, budgetChecker update, reconciler, drift badge | 3–4 days |
| E | Key management UI, caps UX, docs site page, pricing copy | 2–3 days |
| **Total to launchable** | | **~4.5–5 weeks** |

Phase 0 notes:
- ORM: **Drizzle** (recommended over Prisma for serverless/Neon HTTP driver fit and lighter cold starts).
- Auth.js adapter: Drizzle adapter on same Neon DB; sessions = JWT strategy (no session-table reads per request).
- Password auth: current Supabase email+password flows map to Auth.js Credentials provider **or** simplify to magic-link + Google only — decide at Phase 0 start (magic-link-only deletes the whole forgot/reset-password surface; existing users are ~0 pre-launch, so simplification is safe).
- `lib/encryption.ts` (AES-256 for provider keys) carries over unchanged.
- R2: no current storage usage in app — wire client + env vars only, first real use = report exports later.

### Later phases (explicitly out of scope now)
- **F — Python SDK** (post-launch; AI market is half Python; mirror JS design).
- **G — ClickHouse migration**: trigger at ~10M events/mo or rollup-write contention. Path: dual-write events to Tinybird/ClickHouse, backfill from `usage_events`, switch rollup reads, drop PG raw events. App code untouched (readers already isolated behind rollups).
- **H — Gateway tier** (pro/enterprise): SDK transport flag flips from "direct + async log" to "via gateway". Hard block guarantees, caching, fallback routing. Door kept open by: SDK owns transport abstraction from day 1, enforcement semantics already defined.
- **I — SDK throttle support** (pro), wrap() coverage for remaining providers (Gemini, Mistral, Groq, …), `metadata`-dimension budgets (per-feature/per-end-user).

---

## 10. Risks & mitigations

| Risk | Mitigation |
|------|------------|
| Wrapper breaks on provider SDK update | Telemetry fully try/caught — worst case events lost, never user errors. Pin tested provider-SDK version ranges in peerDeps; CI matrix against latest provider SDKs. |
| Pricing table drift → wrong costs | `pricing_version` on every event; nightly reconciler flags drift >5% automatically; unpriced models surfaced, never silently zeroed. |
| Rollup double-count on retry | Atomic ingest RPC (event dedupe + rollup increment in one transaction). |
| Ingest abuse / key leak | Keys hashed, per-key rate limit, per-plan caps, instant revoke+rotate UI. Key is write-only + status-read — leak can't read spend data or touch provider keys. |
| Fail-open = block not guaranteed | Documented explicitly; `failMode:'closed'` for agent workloads; gateway tier later for hard guarantees. |
| Vercel function limits on ingest spikes | Batching client-side keeps req volume low; Redis buffer (decided against for now) is the known next step if p99 degrades. |

## 11. Open items
- [ ] Verify npm availability: `@getfrugal/sdk` (fallback: `@frugal-dev/sdk`, `frugal-sdk`).
- [ ] Confirm Anthropic/OpenAI wrapped-method list against current SDK versions at Phase C start.
- [ ] Decide event retention per plan (suggest: free 30d raw / rollups forever; paid 13mo raw) — needed before pruning job, not before launch.