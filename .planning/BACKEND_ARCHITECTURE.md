# Frugal Custom Backend Architecture

**Status:** Draft for Phase 0 execution, 2026-06-11
**Companion doc:** `.planning/SDK_ARCHITECTURE_PLAN.md` (product/SDK decisions — locked)
**Stack:** Next.js 14 App Router (host) · Neon Postgres · Drizzle ORM · Auth.js v5 (NextAuth) · Cloudflare R2 · Resend · Upstash Redis/QStash · Stripe · Vercel

---

## 0. Scope & feasibility (BFRI)

Phase 0 = replace Supabase (auth + DB client + RLS) with Neon + Drizzle + Auth.js, then build SDK ingest backend on the new stack.

| Dimension | Score | Notes |
|---|---|---|
| Architectural fit | 4 | Layered structure maps cleanly onto Next.js route handlers |
| Testability | 4 | Services framework-agnostic; Neon branching = throwaway test DBs |
| Business logic complexity | 2 | Mostly mechanical port; ingest eval is the only new logic |
| Data risk | 4 | Touches auth, every query path, Stripe webhooks — highest-risk change in project history |
| Operational risk | 4 | Auth + billing + polling all affected |

**BFRI = (4+4) − (2+4+4) = −2 → "redesign before coding" zone.** Mitigation that moves it to acceptable: pre-launch with ~0 production users (data risk in practice ≈ 1, op risk ≈ 2 → BFRI = +3). Proceed, but with the cutover safety steps in §8 — they are not optional.

---

## 1. Architecture overview

Single deployable (Next.js on Vercel). No separate Express service — a second server adds ops burden a solo founder doesn't need, and Vercel functions already give per-route isolation. The *guidelines'* layering is enforced inside the app instead:

```
app/api/**/route.ts        (routes: parse → call service → format response. ZERO business logic)
        │
lib/services/**            (business rules. framework-agnostic. constructor DI. unit-tested)
        │
lib/repositories/**        (ALL Drizzle queries. intent-named methods. no SQL outside this layer)
        │
lib/db/                    (Drizzle client, schema, migrations — Neon HTTP driver)
```

```mermaid
flowchart LR
  subgraph clients
    APP[Dashboard UI]
    SDK[@getfrugal/sdk]
  end
  subgraph vercel [Next.js on Vercel]
    MW[middleware: session gate]
    R1[app routes /api/*]
    R2[ingest /api/v1/events]
    R3[status /api/v1/status]
    SVC[lib/services]
    REPO[lib/repositories]
  end
  APP --> MW --> R1 --> SVC --> REPO
  SDK --> R2 --> SVC
  SDK --> R3
  REPO --> NEON[(Neon Postgres)]
  SVC --> REDIS[(Upstash Redis\nstatus cache + ratelimit)]
  QSTASH[QStash cron] --> R1
  SVC --> RESEND[Resend]
  SVC --> R2STORE[(Cloudflare R2\nfuture: report exports)]
```

### Canonical directory layout

```
lib/
├── config.ts                  # unifiedConfig — ONLY place process.env is read (Zod-validated at boot)
├── db/
│   ├── index.ts               # drizzle(neon(config.db.url))
│   ├── schema.ts              # full schema (port of migrations 001–006 + SDK tables)
│   └── migrations/            # drizzle-kit generated SQL
├── auth/
│   ├── index.ts               # Auth.js v5 config: providers, callbacks, JWT strategy
│   └── session.ts             # requireSession() helper — the ONLY way routes get a user
├── repositories/
│   ├── ProjectRepository.ts
│   ├── ConnectionRepository.ts
│   ├── UsageRepository.ts     # usage_records + usage_events + usage_rollups
│   ├── BudgetRepository.ts
│   └── IngestKeyRepository.ts
├── services/
│   ├── ingestService.ts       # event pipeline (§4 of SDK plan)
│   ├── enforcementService.ts  # incremental budget eval + state flips
│   ├── pricingService.ts      # model_pricing lookup w/ prefix matching
│   ├── reconcileService.ts    # nightly polling-vs-SDK drift
│   └── (port: alertService, budgetChecker, worker → services w/ repository deps)
├── validators/                # Zod schemas — one file per route group
├── encryption.ts              # unchanged (AES-256-GCM)
└── observability.ts           # logger + Sentry init helpers
```

Naming per guidelines: `PascalCaseRepository.ts`, `camelCaseService.ts`, `camelCase.schema.ts`.

### Layer rules (non-negotiable, replaces Supabase-era CLAUDE.md rules)

1. Route handlers never import `lib/db` or repositories — services only.
2. Services receive repositories via constructor (DI) — unit-testable with fakes, no DB.
3. Repositories own every query; every method scoped by `userId` or `projectId` parameter — **no method exists that can return another user's rows** (authorization by construction, replaces RLS).
4. `process.env` read only in `lib/config.ts`; everything else imports `config`. Boot fails fast on invalid/missing env (Zod), with Stripe-optional handling preserved.
5. All external input — bodies, query params, route params, webhooks, SDK batches — Zod-parsed before touching a service. No `any`.
6. Every thrown error reaches the error reporter (Sentry) via the route wrapper; no `console.log` debugging left in, no swallowed catches.

---

## 2. Auth (Auth.js v5)

- **Strategy:** JWT sessions (no per-request session-table read; Vercel-friendly).
- **Providers:** Google OAuth + Resend magic-link. **Recommendation: drop password auth at migration** — deletes forgot/reset-password surface entirely (4 pages + token flows + attack surface), zero real users lose anything. If keeping passwords: Credentials provider + Argon2id hashes, and the reset flow must be rebuilt by hand (Auth.js doesn't ship one) — that alone is +2 days; weigh it.
- **Adapter:** Drizzle adapter on Neon (`users`, `accounts`, `sessions`, `verification_tokens` tables; existing `users` table extended, not replaced — keep `plan`, `stripe_customer_id` columns).
- **Session access pattern:**
  ```ts
  // lib/auth/session.ts
  export async function requireSession(): Promise<{ userId: string; plan: Plan }> {
    const session = await auth();
    if (!session?.user?.id) throw new UnauthorizedError();
    return { userId: session.user.id, plan: await userRepo.getPlan(session.user.id) };
  }
  ```
  Plan read from DB per request (preserves existing stale-plan decision), JWT carries identity only.
- **Middleware:** route-group gate for `/(dashboard)` pages (redirect to login); API routes do their own `requireSession()` — middleware is UX, not the security boundary.
- **JWT hygiene:** `AUTH_SECRET` ≥ 32 bytes; session maxAge 30d, update on activity; cookie `__Secure-` prefixed, `HttpOnly`, `SameSite=Lax`, `Secure`.

## 3. Authorization model (replaces RLS)

Defense-in-depth, three layers:

1. **Repository scoping (primary):** every repository method takes the owning `userId` (or a `projectId` that was itself resolved through an owner check) and includes it in the WHERE clause. Code review rule: a repo method without an ownership predicate is a rejected PR.
2. **Service-level ownership asserts:** cross-entity operations (e.g. attach rule to project) verify the project belongs to session user before acting — return 404 (not 403) on foreign IDs to avoid resource-existence leaks (IDOR).
3. **Optional later:** Postgres RLS on Neon with `SET LOCAL app.user_id` per transaction. Designed-for (all tables keep `user_id`), not built in Phase 0.

Ingest path authorization: `fr_pk_` key → SHA-256 → `ingest_keys` → single `project_id`. The key can do exactly two things: write events to its project, read its project's enforcement status. It cannot read spend, list projects, or touch provider keys.

## 4. Security checklist (backend-security-coder applied)

| Area | Implementation |
|---|---|
| Input validation | Zod on every route; batch limits (100 events / 256KB); `z.string().uuid()` on all IDs; reject unknown keys (`.strict()`) |
| SQLi | Drizzle parameterized only; no `sql.raw` with interpolated user input — lint-greppable rule |
| Secrets | All via `lib/config.ts`; `ENCRYPTION_KEY`, `AUTH_SECRET`, DB URL never logged; provider keys remain AES-256-GCM at rest, decrypted only in polling worker memory |
| Ingest keys | Stored SHA-256; constant-time compare not needed (hash lookup), but rate-limit key-auth failures per IP (Upstash) to blunt enumeration; `fr_pk_` prefix → secret-scanner friendly (register pattern with GitHub secret scanning post-launch) |
| Rate limiting | Upstash sliding window: ingest 60/min/key, status 30/min/key, auth endpoints 10/min/IP, app API 120/min/user |
| CSRF | Auth.js built-in for auth routes; app API is same-origin + `SameSite=Lax` cookies; ingest API is Bearer-auth (immune) |
| Headers | `next.config` headers: HSTS, `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, conservative CSP on app pages (allow self + Stripe JS), `Referrer-Policy: strict-origin-when-cross-origin` |
| CORS | App API: none (same-origin). Ingest/status: `Access-Control-Allow-Origin: *` is acceptable (Bearer-auth, no cookies) — SDK runs server-side anyway, CORS mostly irrelevant; keep `*` for edge-runtime users |
| Webhooks | Stripe: Node runtime + raw-body HMAC (port as-is). QStash: signature verification (port as-is) |
| Error responses | Uniform envelope `{ error: { code, message } }`; messages never echo internals/SQL/stack; full detail goes to Sentry with request ID |
| SSRF | Slack webhook URLs (user-supplied): validate https + reject private/link-local IP literals + 5s timeout + no redirects-to-private (port existing behavior, add IP check) |
| Logging hygiene | Request-ID correlation; never log: provider keys (even encrypted), ingest key plaintext, email bodies, full event metadata |
| R2 | Bucket private; access via signed URLs only when report exports ship; no public buckets |

## 5. Error handling & observability

- **Route wrapper** (the asyncErrorWrapper requirement, Next.js-shaped):
  ```ts
  export function apiHandler<T>(fn: (req: NextRequest, ctx: T) => Promise<Response>) {
    return async (req: NextRequest, ctx: T) => {
      const requestId = crypto.randomUUID();
      try { return await fn(req, ctx); }
      catch (e) {
        if (e instanceof ApiError) return e.toResponse(requestId);   // typed 4xx
        Sentry.captureException(e, { tags: { requestId } });
        return jsonError(500, 'internal_error', requestId);
      }
    };
  }
  ```
  Typed error family: `UnauthorizedError(401)`, `NotFoundError(404)`, `ValidationError(422)`, `RateLimitError(429)`, `CapExceededError(429)`.
- **Sentry** (`@sentry/nextjs`, free tier): errors + tracing on ingest/status/poll routes. New dependency — justified: the polling worker and ingest pipeline run unattended; silent failure = product failure.
- **Structured logs:** JSON lines via thin logger (level, msg, requestId, projectId) → Vercel log drain later. Replaces ad-hoc `console.error` in worker.
- **Health:** `GET /api/health` → DB ping + Redis ping (for uptime monitor); QStash cron failures alert via Sentry cron monitors.
- **RED metrics** (post-launch nice-to-have): ingest rate/error/duration from Vercel + Sentry tracing — no extra infra now.

## 6. API surface (contract summary)

| Route | Auth | Layer chain |
|---|---|---|
| `POST /api/v1/events` | Bearer `fr_pk_` | route → ingestService → (pricing, Usage/Budget repos, enforcementService) |
| `GET /api/v1/status` | Bearer `fr_pk_` | route → Redis cache → enforcementService fallback |
| `/api/projects`, `/api/connections`, `/api/rules` CRUD | session | route → requireSession → service → repo |
| `/api/poll` | QStash signature | route → pollingService (ported worker) |
| `/api/stripe/*` | Stripe HMAC / session | ported, Drizzle-ified |
| `/api/auth/[...nextauth]` | — | Auth.js |
| `/api/health` | none | ping checks |

Versioning: `/api/v1/` namespace is SDK-facing and **contract-stable** (SDKs in the wild can't be force-updated — additive changes only, breaking changes = `/api/v2/`). Internal app routes are not versioned (same deploy as UI).

## 7. Testing discipline

- **Unit (Vitest):** services with fake repositories — enforcementService threshold math, pricingService prefix matching, ingest dedupe/cap logic. These carry the business risk; coverage target meaningful-100% of service branches.
- **Integration:** route handlers against a **Neon branch** (create per CI run, destroy after — Neon's killer feature here): ingest idempotency under retry, rollup atomicity, authz negative tests (user A cannot read/write user B's anything; foreign IDs → 404).
- **Contract:** SDK repo CI runs its client against a deployed preview URL (happy path + 429 + blocked-status).
- **No merge of Phase 0 cutover** until: auth round-trip (signup→session→logout), all CRUD authz negatives, Stripe webhook replay, poll worker run — green on Neon branch.

## 8. Phase 0 migration plan (with rollback)

Order chosen so each step is independently verifiable; Supabase stays alive until step 7.

1. **Scaffold:** `lib/config.ts` (Zod env), Drizzle + Neon project, schema.ts ported from migrations 001–006 (minus Supabase `auth.*` internals; plus Auth.js tables; plus SDK-plan tables so it's one migration era).
2. **Data:** `pg_dump` Supabase → restore to Neon (users/projects/connections/rules/usage/alerts). Pre-launch row counts are tiny; verify with count + spot-check script.
3. **Repositories + services:** port query call sites (`lib/queries/dashboard.ts`, worker, budgetChecker, alertService, tier reads) to repository layer. Pure mechanical, test as ported.
4. **Auth.js:** config + Drizzle adapter; magic-link (Resend) + Google; rewrite ~30 `supabase.auth.getUser()` call sites → `requireSession()`; middleware gate; delete Supabase client/SSR packages. Decide password question (§2) before this step.
5. **Webhooks/cron re-verify:** Stripe checkout→webhook→plan flip on Neon; QStash poll run end-to-end; alert email fires.
6. **Staging soak:** Vercel preview + Neon branch as full staging; run §7 gate.
7. **Cutover:** point production env at Neon; Supabase project paused (not deleted) for 30 days = rollback = flip env vars back.
8. **Cleanup:** remove `@supabase/*` deps, update CLAUDE.md critical rules (RLS rules → §1 layer rules + §3 authz rules), update `.env.example` (≈10 vars change).

Rollback triggers: auth loop failures, any cross-user data access found, Stripe webhook misfires. Rollback cost while Supabase paused: minutes.

## 9. What was consciously NOT adopted from the guideline skills

- **Separate Express microservice** — single Next.js deployable; service split only if ingest p99 forces it (known escape hatch: peel `api/v1/*` into a Hono service later, contracts already isolated).
- **Prisma** — Drizzle chosen (Neon HTTP driver fit, lighter cold starts, SQL-transparent).
- **BaseController class** — replaced by `apiHandler` wrapper + typed errors (idiomatic App Router; classes add nothing here).
- **Multi-agent orchestrated delivery workflow** (canary/feature-flag infra, 80% blanket coverage, BFF, etc.) — solo pre-launch scale; feature flags via simple env/config until there's traffic to canary.