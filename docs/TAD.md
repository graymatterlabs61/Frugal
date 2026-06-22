# Technical Architecture Document — Frugal
**Version:** 2.0 (SDK-first, Neon/Drizzle/Auth.js stack) | **Date:** 2026-06-19

> **Stack migration decision (2026-06-11):** Supabase → Neon Postgres + Drizzle ORM + Auth.js v5 (NextAuth) + Cloudflare R2. Founder decision; supersedes earlier TRD v1.0 (Supabase). Phase 0 (migration) runs first — all SDK-era code built on final stack, never ported.

---

## 1. Tech Stack

| Layer | Technology | Rationale |
|-------|-----------|-----------|
| Framework | Next.js 14 (App Router) + TypeScript | SSR for fast dashboards; file-based routing; edge-ready; Nilesh's primary stack |
| Language | TypeScript strict (`noImplicitAny: true`) | Type safety full-stack; no `any` types anywhere |
| UI | Tailwind CSS + ShadCN/UI | Utility-first; accessible primitives; consistent design system |
| Database | Neon Postgres (serverless) | Serverless-native Postgres; HTTP driver avoids connection pool exhaustion on Vercel; branching for dev/prod |
| ORM | Drizzle ORM | Type-safe; lightweight; serverless-friendly; no Prisma cold-start penalty; excellent Neon HTTP driver fit |
| Auth | Auth.js v5 (NextAuth) + Drizzle adapter | JWT sessions (no per-request session-table reads); magic-link + Google OAuth |
| Auth email delivery | Resend (magic-link `sendVerificationRequest`) | Same email provider as transactional — one less service |
| Queue / Cron | Upstash QStash | Serverless-native; 5-min polling cron + webhook delivery queue |
| Cache + Rate-limit | Upstash Redis | Status cache (30s TTL); ingest key cache (60s); per-key rate limit; alert dedup |
| Email | Resend + React Email | Transactional + alert emails; 13 branded templates |
| Payments | Stripe | Checkout, customer portal, webhooks; handles INR + USD |
| Storage | Cloudflare R2 | Future: report exports, SDK bundles. Wired now, no active use. |
| Hosting | Vercel | Zero-config Next.js; preview deployments; edge middleware |
| Monitoring | Vercel Analytics + Speed Insights | Core Web Vitals + usage stats |

### SDK (separate repository: `frugal-sdk`)
| Layer | Technology |
|-------|------------|
| Package name | `@getfrugal/sdk` (verify npm availability; fallback: `frugal-sdk`) |
| Language | TypeScript, dual ESM+CJS via `tsup` |
| Runtime | Node ≥18 + Vercel/Cloudflare edge runtimes |
| Dependencies | **Zero runtime deps** |
| Versioning | semver from `0.1.0` |

---

## 2. System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│  User's App                                                      │
│  const openai = frugal.wrap(new OpenAI())                       │
│        ↓ direct, unchanged latency                              │
│     OpenAI / Anthropic / etc.                                   │
│        ↓ async, non-blocking                                    │
│  POST /api/v1/events  ◄─── batch (UUIDv7 ids, 5s interval)     │
└──────────────────────────┬──────────────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────────────┐
│  Vercel (Next.js App)                                            │
│                                                                  │
│  /api/v1/events                                                  │
│    → SHA-256 key lookup (Redis 60s cache)                       │
│    → Zod validation (batch ≤100 events, ≤256KB)                 │
│    → Plan event-cap check                                        │
│    → computeCost() from model_pricing                           │
│    → atomic: INSERT usage_events + UPDATE usage_rollups         │
│    → incremental budget eval → enforcement_state flip           │
│    → alertService (1-hour dedup)                                │
│                                                                  │
│  /api/v1/status  (Redis 30s cache)                              │
│    → returns { state: 'ok'|'blocked', checkAfterSeconds: 30 }  │
│                                                                  │
│  QStash cron (5 min)                                            │
│    → /api/poll → worker.ts                                      │
│    → decrypt keys → provider usage APIs                         │
│    → upsert usage_records (idempotent)                          │
│    → budgetChecker → alertService                               │
│                                                                  │
│  QStash daily cron                                              │
│    → /api/reconcile → compare SDK vs provider billing           │
│    → store drift % in reconciliation_log                        │
└──────────────────────────┬──────────────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────────────┐
│  Neon Postgres                                                   │
│  usage_events (append-only) | usage_rollups (hourly aggregates) │
│  usage_records (polling) | projects | budget_rules | alert_log  │
│  ingest_keys | model_pricing | users | api_connections          │
└─────────────────────────────────────────────────────────────────┘
```

---

## 3. File & Folder Structure

```
frugal/
├── app/                              # Next.js App Router
│   ├── (auth)/                       # Auth pages — no DashboardShell
│   │   ├── login/page.tsx
│   │   ├── signup/page.tsx
│   │   └── verify-email/page.tsx
│   ├── (dashboard)/                  # Protected pages — DashboardShell wrapper
│   │   ├── dashboard/page.tsx        # Server component → lib/queries/dashboard.ts
│   │   ├── projects/
│   │   │   ├── page.tsx
│   │   │   └── [id]/page.tsx         # Project detail (connections, rules, alerts tabs)
│   │   ├── alerts/page.tsx
│   │   ├── billing/page.tsx          # Stripe invoices + plan management
│   │   └── settings/
│   │       ├── account/page.tsx
│   │       └── security/page.tsx
│   ├── api/
│   │   ├── auth/[...nextauth]/route.ts        # Auth.js handler
│   │   ├── projects/route.ts                  # GET/POST
│   │   ├── projects/[id]/route.ts             # GET/PATCH/DELETE
│   │   ├── connections/route.ts               # GET/POST
│   │   ├── connections/[id]/route.ts          # DELETE/PATCH
│   │   ├── budget-rules/route.ts              # GET/POST
│   │   ├── budget-rules/[id]/route.ts         # DELETE
│   │   ├── ingest-keys/route.ts               # GET/POST (create key)
│   │   ├── ingest-keys/[id]/route.ts          # DELETE (revoke)
│   │   ├── poll/route.ts                      # POST (QStash-verified) + GET (dev)
│   │   ├── reconcile/route.ts                 # POST (QStash daily cron)
│   │   ├── stripe/
│   │   │   ├── checkout/route.ts
│   │   │   ├── portal/route.ts
│   │   │   └── webhook/route.ts               # Node runtime; raw body HMAC
│   │   └── v1/                                # Public SDK ingest API
│   │       ├── events/route.ts                # POST — ingest key auth
│   │       └── status/route.ts                # GET  — ingest key auth
│   ├── (marketing)/                  # Landing page, pricing, legal
│   │   ├── page.tsx                  # / — landing page
│   │   ├── pricing/page.tsx
│   │   ├── privacy/page.tsx
│   │   └── terms/page.tsx
│   ├── layout.tsx                    # Root layout + mesh-bg + Analytics
│   ├── globals.css                   # Design system CSS (see FRONTEND_SPEC.md)
│   └── sitemap.ts / robots.ts
│
├── components/
│   ├── ui/                           # ShadCN primitives (auto-generated; do not edit)
│   │   └── button.tsx, card.tsx, dialog.tsx, input.tsx, badge.tsx, ...
│   ├── dashboard/
│   │   ├── SpendChart.tsx            # Recharts stacked bar chart
│   │   ├── ProjectCard.tsx
│   │   ├── AlertRow.tsx
│   │   └── StatCard.tsx
│   ├── layout/
│   │   ├── DashboardShell.tsx        # Sidebar + main area; mesh-bg; mobile hamburger
│   │   ├── Sidebar.tsx
│   │   ├── Navbar.tsx
│   │   └── Footer.tsx                # Giant FRUGAL wordmark + nav columns
│   └── marketing/
│       ├── Hero.tsx
│       ├── PricingSection.tsx
│       └── FeaturesGrid.tsx
│
├── lib/
│   ├── auth.ts                       # Auth.js v5 config (providers, Drizzle adapter, callbacks)
│   ├── db.ts                         # Drizzle client — neon(process.env.DATABASE_URL)
│   ├── schema/                       # Drizzle table definitions
│   │   ├── users.ts                  # users + Auth.js adapter tables
│   │   ├── projects.ts               # projects (+ enforcement_state)
│   │   ├── connections.ts            # api_connections
│   │   ├── events.ts                 # usage_events, usage_rollups, ingest_keys
│   │   ├── budget.ts                 # budget_rules, alert_log
│   │   ├── records.ts                # usage_records (polling path)
│   │   └── pricing.ts               # model_pricing
│   ├── encryption.ts                 # AES-256-GCM; key from ENCRYPTION_KEY env
│   ├── tier.ts                       # PLAN_LIMITS; feature gate functions
│   ├── stripe.ts                     # Stripe singleton; PRICE_MAP
│   ├── redis.ts                      # Upstash Redis client (fromEnv())
│   ├── providers/                    # Per-provider usage fetchers
│   │   ├── openai.ts                 # /v1/usage; admin key fallback
│   │   ├── anthropic.ts              # Admin usage report API
│   │   ├── replicate.ts              # /v1/predictions paginated
│   │   ├── falai.ts                  # /v1/usage
│   │   ├── groq.ts
│   │   └── gemini.ts
│   ├── polling/
│   │   ├── worker.ts                 # QStash orchestrator — iterates connections
│   │   ├── budgetChecker.ts          # Rule eval; reads rollups (SDK) or records (polling)
│   │   └── alertService.ts           # Resend email + Slack webhook; 1-hr dedup
│   ├── ingest/
│   │   ├── evaluateBudget.ts         # Incremental budget eval at ingest
│   │   └── computeCost.ts            # Cost from model_pricing (exact → prefix match)
│   ├── queries/
│   │   └── dashboard.ts              # Aggregation queries; reads rollups (SDK) / records (polling)
│   └── email/                        # React Email templates (13 branded)
│       ├── BudgetAlert.tsx
│       ├── Welcome.tsx
│       ├── MagicLink.tsx
│       ├── SubscriptionChange.tsx
│       └── ...
│
├── drizzle/
│   └── migrations/                   # Drizzle migration files (drizzle-kit)
│
├── scripts/
│   ├── seed-pricing.ts               # Seed model_pricing for all 12 providers
│   └── test-emails.ts                # Send test emails to all templates
│
├── docs/                             # This folder — all spec documents
├── .planning/                        # Architecture plans + phase docs
├── public/
│   ├── logo.svg                      # Two overlapping F-shapes, both #FF500B
│   └── font/                         # Ethnocentric, Nasalization, Playfair, Playwrite
├── .env.example                      # All 23+ env vars documented
└── CLAUDE.md                         # AI coding context (updated post Phase 0)
```

---

## 4. Database Schema

### Auth.js adapter tables (auto-managed by Drizzle adapter)
```sql
accounts (id, userId, type, provider, providerAccountId, ...)
sessions (id, sessionToken, userId, expires)
verification_tokens (identifier, token, expires)
```

### `users`
```sql
id                  uuid PK DEFAULT gen_random_uuid()
email               text UNIQUE NOT NULL
name                text
plan                text NOT NULL DEFAULT 'free'
                    CHECK (plan IN ('free','starter','growth','pro'))
stripe_customer_id  text
created_at          timestamptz DEFAULT now()
updated_at          timestamptz
```

### `projects`
```sql
id                      uuid PK DEFAULT gen_random_uuid()
user_id                 uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE
name                    text NOT NULL
description             text
enforcement_state       text NOT NULL DEFAULT 'ok'
                        CHECK (enforcement_state IN ('ok','blocked'))
enforcement_updated_at  timestamptz
created_at              timestamptz DEFAULT now()
updated_at              timestamptz
```

### `api_connections`
```sql
id              uuid PK DEFAULT gen_random_uuid()
project_id      uuid REFERENCES projects(id)    -- nullable (SDK-only projects)
user_id         uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE
provider        text NOT NULL
                CHECK (provider IN ('openai','anthropic','replicate','falai','groq','gemini'))
encrypted_key   text NOT NULL    -- AES-256-GCM; lib/encryption.ts
key_suffix      text NOT NULL    -- last 4 chars plaintext for display
status          text NOT NULL DEFAULT 'active'
                CHECK (status IN ('active','blocked','invalid','polling_error'))
is_active       boolean NOT NULL DEFAULT true
last_polled_at  timestamptz
created_at      timestamptz DEFAULT now()
```

### `ingest_keys`
```sql
id          uuid PK DEFAULT gen_random_uuid()
project_id  uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE
key_hash    text NOT NULL UNIQUE    -- SHA-256 of full key (fr_pk_ + 32 base62)
key_prefix  text NOT NULL           -- 'fr_pk_a1b2' for display
created_at  timestamptz DEFAULT now()
revoked_at  timestamptz
```
Key format: `fr_pk_` + 32 chars base62. Shown once at creation. One active key per project enforced in route logic.

### `usage_events` (append-only; ClickHouse-mirror schema)
```sql
id              uuid PK    -- client-generated UUIDv7 (dedup key)
project_id      uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE
user_id         uuid NOT NULL
provider        text NOT NULL
model           text NOT NULL
input_tokens    bigint NOT NULL DEFAULT 0
output_tokens   bigint NOT NULL DEFAULT 0
cost_usd        numeric(12,6) NOT NULL
cost_source     text NOT NULL CHECK (cost_source IN ('computed','client_reported'))
pricing_version text
sdk_version     text
metadata        jsonb    -- { feature: 'chat', env: 'prod', userId: '...' }
occurred_at     timestamptz NOT NULL     -- client event time
received_at     timestamptz NOT NULL DEFAULT now()

INDEX: (project_id, occurred_at DESC)
```
No updates, no deletes (plan-retention pruning job added post-launch).

### `usage_rollups`
```sql
project_id    uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE
hour          timestamptz NOT NULL    -- truncated to hour
provider      text NOT NULL
model         text NOT NULL
events_count  bigint NOT NULL DEFAULT 0
input_tokens  bigint NOT NULL DEFAULT 0
output_tokens bigint NOT NULL DEFAULT 0
cost_usd      numeric(14,6) NOT NULL DEFAULT 0

PRIMARY KEY (project_id, hour, provider, model)
```
Maintained via atomic `INSERT … ON CONFLICT (project_id, hour, provider, model) DO UPDATE SET cost_usd = usage_rollups.cost_usd + excluded.cost_usd, …` in same transaction as event insert.

### `usage_records` (polling path — kept for non-SDK projects)
```sql
id              uuid PK DEFAULT gen_random_uuid()
connection_id   uuid REFERENCES api_connections(id) ON DELETE CASCADE
user_id         uuid NOT NULL REFERENCES users(id)
provider        text NOT NULL
date            date NOT NULL
model           text NOT NULL
tokens_in       bigint DEFAULT 0
tokens_out      bigint DEFAULT 0
cost_usd        numeric(10,6) NOT NULL
end_user_id     text    -- null for direct usage; set for per-user attribution
created_at      timestamptz DEFAULT now()

UNIQUE (connection_id, date, model, end_user_id)
```

### `budget_rules`
```sql
id              uuid PK DEFAULT gen_random_uuid()
project_id      uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE
user_id         uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE
budget_window   text NOT NULL CHECK (budget_window IN ('daily','monthly'))
limit_usd       numeric(10,2) NOT NULL CHECK (limit_usd > 0)
threshold_pct   integer NOT NULL DEFAULT 80 CHECK (threshold_pct BETWEEN 1 AND 100)
action          text NOT NULL CHECK (action IN ('alert','block','throttle'))
is_active       boolean NOT NULL DEFAULT true
created_at      timestamptz DEFAULT now()
```

### `alert_log`
```sql
id                  uuid PK DEFAULT gen_random_uuid()
project_id          uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE
rule_id             uuid REFERENCES budget_rules(id)
user_id             uuid NOT NULL REFERENCES users(id)
triggered_at        timestamptz NOT NULL DEFAULT now()
spend_at_trigger    numeric(10,6)
limit_usd           numeric(10,2)
channel             text NOT NULL    -- email | slack | webhook | both
action_taken        text
delivery_status     jsonb    -- { email: 'sent'|'failed', slack: 'sent'|'skipped', webhook: 'sent'|'failed' }
```

### `model_pricing`
```sql
provider        text NOT NULL
model           text NOT NULL    -- exact or prefix pattern (e.g. 'gpt-4o')
input_per_mtok  numeric(12,6) NOT NULL
output_per_mtok numeric(12,6) NOT NULL
version         text NOT NULL    -- e.g. '2026-06'
effective_from  timestamptz NOT NULL

PRIMARY KEY (provider, model, version)
```
Lookup: exact model match → longest-prefix match → fallback: cost=0 + `cost_source='computed'` + log warning + "Unpriced model" badge in dashboard.

---

## 5. API Routes

### Session-authenticated (Auth.js `auth()` check on every route)
```
GET  POST              /api/projects
GET  PATCH  DELETE     /api/projects/[id]
GET  POST              /api/connections
     PATCH  DELETE     /api/connections/[id]
GET  POST              /api/budget-rules
            DELETE     /api/budget-rules/[id]
GET  POST              /api/ingest-keys
            DELETE     /api/ingest-keys/[id]
     POST              /api/stripe/checkout
     POST              /api/stripe/portal
     POST              /api/poll      ← also QStash-verified
     GET               /api/poll      ← dev only, bypasses QStash verify
     POST              /api/reconcile ← QStash daily cron
```

### Ingest key-authenticated (`Authorization: Bearer fr_pk_…`)
```
POST  /api/v1/events   ← SDK event ingest; SHA-256 key auth; Redis-cached
GET   /api/v1/status   ← enforcement state; 30s Redis cache
```

### Stripe webhook (HMAC `stripe.webhooks.constructEvent`; Node runtime)
```
POST  /api/stripe/webhook
```
Events handled: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`

---

## 6. Data Flow

### SDK ingest path (primary)
```
frugal.wrap(new OpenAI()) → AI call (direct, unchanged latency)
  → async batch (UUIDv7 event_id, 5s interval)
  → POST /api/v1/events
      1. SHA-256 key → Redis lookup (60s TTL) → project_id, user_id, plan
      2. Zod validation (≤100 events, ≤256KB)
      3. Plan event-cap check (monthly rollup, Redis-cached)
      4. computeCost() from model_pricing (exact → prefix match)
      5. Drizzle tx: INSERT usage_events (dedup ON CONFLICT DO NOTHING)
                   + UPDATE usage_rollups (ON CONFLICT DO UPDATE)
      6. evaluateBudget(): active rules → threshold check → enforcement_state flip
                         → invalidate status Redis key → enqueue alert (1-hr dedup)
      7. Return { accepted, deduped, dropped }

SDK polls GET /api/v1/status (30s interval, Redis 30s TTL)
  → { state: 'ok'|'blocked', blockedRules: [...], checkAfterSeconds: 30 }
  → if 'blocked': throw FrugalBudgetExceededError on next wrapped call
```

### Polling path (reconciliation / non-SDK fallback)
```
QStash cron (5 min) → POST /api/poll (QSTASH_CURRENT_SIGNING_KEY verified)
  → foreach active api_connection:
      → lib/encryption.ts: decrypt provider key
      → lib/providers/<name>.ts: fetchUsage(key, date) → UsageRecord[]
      → Drizzle: upsert usage_records (ON CONFLICT DO UPDATE, idempotent)
      → update api_connections.last_polled_at
      → on error: set status='polling_error', skip; on 401: set status='invalid'
  → budgetChecker.ts: for SDK projects → reads rollups; for polling projects → reads records
  → alertService.ts: Resend email + Slack webhook POST; 1-hr dedup via alert_log
```

### Nightly reconciler
```
QStash daily cron → POST /api/reconcile
  → per user × provider:
      sum usage_records (org billing truth) for yesterday
      sum usage_events across user's projects for same provider/day
      drift_pct = abs(billed - tracked) / billed × 100
      upsert reconciliation_log
  → dashboard badge: ≤5% = green "reconciled"; >5% = amber "partial coverage"
```

---

## 7. Tier Enforcement

```typescript
// lib/tier.ts
export const PLAN_LIMITS = {
  free:    { connections: 1,        projects: 1,        eventsPerMonth: 50_000,    historyDays: 7   },
  starter: { connections: 3,        projects: 5,        eventsPerMonth: 1_000_000, historyDays: 90  },
  growth:  { connections: 3,        projects: 5,        eventsPerMonth: 1_000_000, historyDays: 90  },
  pro:     { connections: Infinity, projects: Infinity,  eventsPerMonth: Infinity,  historyDays: 365 },
} as const

export function getConnectionLimit(plan: Plan): number
export function getProjectLimit(plan: Plan): number
export function getHistoryDays(plan: Plan): number
export function getEventsPerMonth(plan: Plan): number
export function canCreateBudgetRule(plan: Plan): boolean  // false for free
export function canUseBlock(plan: Plan): boolean          // false for free
export function canUseThrottle(plan: Plan): boolean       // pro only
export function canUseSlack(plan: Plan): boolean          // plus + pro
export function canUseWebhook(plan: Plan): boolean        // pro only
export function canUseAttributionDashboard(plan: Plan): boolean  // pro only
```

All limits enforced **server-side** on every relevant API route. Client-side gates are UI hints only — never enforcement.

Plan read from `users.plan` per request (not JWT) to avoid stale-plan issues.

---

## 8. Environment Variables

```bash
# App
NEXTAUTH_SECRET=               # JWT signing; 32+ random bytes
NEXTAUTH_URL=https://getfrugal.dev

# Database
DATABASE_URL=                  # Neon pooler connection string
DATABASE_URL_UNPOOLED=         # Neon direct (for migrations / Drizzle kit)

# Auth Providers
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# Email (Resend — auth + transactional + alerts)
RESEND_API_KEY=
RESEND_FROM_ADDRESS=noreply@getfrugal.dev

# Encryption (provider API keys at rest)
ENCRYPTION_KEY=                # 32-byte hex string; AES-256-GCM

# Stripe
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_PLUS_MONTHLY_PRICE_ID=
STRIPE_PLUS_ANNUAL_PRICE_ID=
STRIPE_PRO_MONTHLY_PRICE_ID=
STRIPE_PRO_ANNUAL_PRICE_ID=

# Upstash QStash (cron + webhook queue)
QSTASH_TOKEN=
QSTASH_CURRENT_SIGNING_KEY=
QSTASH_NEXT_SIGNING_KEY=

# Upstash Redis (cache + rate-limit)
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=

# Cloudflare R2 (storage — future use)
R2_ACCOUNT_ID=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET_NAME=

# App
NEXT_PUBLIC_APP_URL=https://getfrugal.dev
```

---

## 9. Performance Requirements

| Metric | Target |
|--------|--------|
| Dashboard load (server component, cached rollups) | <1 second |
| SDK ingest endpoint p95 latency | <200ms |
| Status endpoint p95 latency (cache hit) | <10ms |
| Data freshness (SDK path) | ~1 min |
| Data freshness (polling path) | ≤5 min |
| Alert trigger latency (SDK path) | ~1 min |
| Alert trigger latency (polling path) | ≤10 min |
| API route response time p95 | <500ms |
| Vercel uptime SLA | 99.5% |

---

## 10. Scaling Path

| Stage | Users | Infrastructure |
|-------|-------|---------------|
| Launch | 0–100 | Vercel Hobby/Pro + Neon free + Upstash free |
| Growth | 100–1,000 | Vercel Pro ($20/mo) + Neon Launch ($19/mo) + Upstash Pay-as-you-go |
| Scale | 1,000–10,000 | Dedicated ingest service (Vercel separate project or Railway). Neon Scale. |
| ClickHouse trigger | ~10M events/mo | Dual-write events to Tinybird/ClickHouse; backfill; switch rollup reads; drop PG raw events. App code unchanged (readers already behind rollups). |
| Gateway tier | Enterprise demand | SDK transport flag flips from "direct + async log" to "via gateway". Hard block guarantees, caching, fallback routing. |

---

## 11. OWASP Top 10 Checklist

| Risk | Mitigation |
|------|-----------|
| A01 Broken Access Control | App-layer authorization: every query scoped to `session.user.id`; no unscoped reads; ingest route scoped to single project via key |
| A02 Cryptographic Failures | Provider keys AES-256-GCM encrypted at rest; ingest keys stored as SHA-256 hash; TLS on all transit |
| A03 Injection | Drizzle ORM parameterized queries everywhere; Zod validation on all API route inputs; no raw SQL from user input |
| A04 Insecure Design | Fail-open SDK default documented; `failMode:'closed'` for agent workloads; ingest keys are write-only (can't read spend data if leaked) |
| A05 Security Misconfiguration | All secrets in Vercel env vars; `.env` gitignored; no `NEXT_PUBLIC_` prefix on server secrets |
| A06 Vulnerable Components | `npm audit` in CI; weekly Dependabot PRs |
| A07 Auth Failures | Auth.js v5 JWT; magic-link 15-min expiry single-use; `auth()` called at top of every route handler |
| A08 Software Integrity | QStash webhook verified with `QSTASH_CURRENT_SIGNING_KEY`; Stripe webhook HMAC via `stripe.webhooks.constructEvent` |
| A09 Logging Failures | Alert log in DB for audit; Vercel error logs; no sensitive data (keys, tokens) in logs ever |
| A10 SSRF | Provider URLs hardcoded in `lib/providers/`; user input never used to construct outbound HTTP URLs |