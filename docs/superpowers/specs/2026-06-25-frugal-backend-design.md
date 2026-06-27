# Frugal Backend — Design Spec
**Date:** 2026-06-25
**Author:** Nilesh Kumar (via brainstorming session)
**Status:** Approved — ready for implementation planning

---

## 1. Product Summary

Frugal is an AI API cost management SaaS. Developers and companies connect AI provider accounts (OpenAI, Anthropic, Replicate, fal.ai, Gemini); Frugal tracks unified spend per project, enforces budget rules, and fires alerts before limits are hit.

**Two customer segments:**
- **Personal** — solo developers, solo founders, engineering managers. No code change required. Frugal polls provider usage APIs every 5 minutes.
- **Corporate** — companies giving AI access to employees or embedding AI in products. Proxy gateway sits between team tooling and providers. Real-time enforcement, per-employee attribution.

---

## 2. V1 Providers

| Provider | Personal (polling) | Corporate (proxy) |
|---|---|---|
| OpenAI | ✅ | ✅ |
| Anthropic | ✅ | ✅ |
| Google Gemini | ✅ | ✅ |
| Replicate | ✅ | ✅ |
| fal.ai | ✅ | ✅ |

---

## 3. Architecture: Two Services

### Service 1 — `frugal-api` (main Express app)

Handles all auth, business logic, dashboard data, billing, and background workers.

**Stack:** Express + TypeScript + Drizzle ORM + Neon (Postgres) + Redis (Upstash) + BullMQ + Zod + JWT + Argon2id + Pino + Sentry + Vitest

**Responsibilities:**
- Auth (email/password + Google OAuth)
- Projects, connections, budget rules, alerts CRUD
- Dashboard aggregation queries
- Ingest endpoint (Pro plan per-user attribution)
- Billing (Stripe checkout + webhooks + portal)
- In-app notifications
- Organization management (corporate)
- BullMQ polling worker (5-min cron)
- BullMQ alert dispatcher

### Service 2 — `frugal-proxy` (lightweight Express)

Corporate-only real-time request forwarder. Scales independently.

**Stack:** Express + TypeScript + Redis (shared) + Neon (shared, PgBouncer connection string) + Pino + Sentry

**Responsibilities:**
- Receive AI requests from corporate employee tooling
- Verify org JWT, check org membership (Redis cache, 30s TTL)
- Check budget rules (Redis cache, 60s TTL, invalidated on rule change)
- Block (429) or throttle (queue delay) if rule triggered
- Forward to AI provider with circuit breaker (opossum)
- Async: write `proxy_requests` row via PgBouncer
- Async: push usage event to BullMQ for alert check

**Hardening (99% reliability):**
- **Circuit breaker:** if provider unreachable, fail open (pass request through directly) not fail closed
- **PgBouncer:** all proxy DB writes use Neon's pooled connection string
- **Redis budget cache:** `budget:rule:{projectId}` 60s TTL, invalidated immediately on rule PATCH/DELETE
- **Provider version pinning:** each provider module pins API version header; alert fires on schema mismatch

---

## 4. Plans & Tier Limits

### Personal Plans

| | Free | Plus | Pro |
|---|---|---|---|
| Price | $0 | $19/mo ($15/yr) | $49/mo ($39/yr) |
| Projects | 1 | 5 | Unlimited |
| Connections | 1 | 3 | Unlimited |
| History | 7 days | 90 days | 365 days |
| Events/mo | 50K | 1M | Unlimited |
| Budget action | — | Alert + Block | Alert + Block |
| Alerts | Email | Email + Slack | Email + Slack + Webhook |
| Per-user attribution | ❌ | ❌ | ✅ |
| Programmatic API | ❌ | ❌ | ✅ |

### Corporate Plans (waitlist, Q3 2026)

| | Starter | Growth | Scale | Enterprise |
|---|---|---|---|---|
| Price | $79/mo | $199/mo | $499/mo | Custom |
| Seats | 10 | 25 | 100 | Unlimited |
| Enforcement | Proxy real-time | Proxy real-time | Proxy real-time | Proxy real-time |
| Budget action | Alert + Block + Throttle | Alert + Block + Throttle | Alert + Block + Throttle | Alert + Block + Throttle |
| Per-user attribution | ✅ | ✅ | ✅ | ✅ |
| Audit log export | ❌ | ❌ | ✅ | ✅ |
| SSO (SAML) | ❌ | ❌ | ✅ | ✅ |

### Corporate Org Roles

**Owner** — manages billing, full access
**Admin** — create/edit projects, budget rules, invite members
**Member** — tracked only (spend attributed to them)
**Viewer** — read-only dashboard access (CFO, finance team)

---

## 5. Database Schema (Neon / Drizzle ORM)

### Auth Domain

```sql
users (
  id uuid PK,
  email text UNIQUE NOT NULL,
  full_name text,
  password_hash text,           -- Argon2id, null for Google-only accounts
  google_id text UNIQUE,
  plan plan_enum NOT NULL DEFAULT 'free',
  stripe_customer_id text,
  stripe_subscription_id text,
  created_at timestamptz,
  updated_at timestamptz
)

organizations (
  id uuid PK,
  name text NOT NULL,
  owner_id uuid FK users.id,
  plan plan_enum NOT NULL DEFAULT 'corp_starter',
  stripe_customer_id text,
  stripe_subscription_id text,
  created_at timestamptz,
  updated_at timestamptz
)

org_members (
  id uuid PK,
  org_id uuid FK organizations.id ON DELETE CASCADE,
  user_id uuid FK users.id ON DELETE CASCADE,
  role org_role_enum NOT NULL,  -- owner | admin | member | viewer
  created_at timestamptz,
  UNIQUE(org_id, user_id)
)
```

### Projects & Connections Domain

```sql
projects (
  id uuid PK,
  user_id uuid FK users.id ON DELETE CASCADE,   -- null for org projects
  org_id uuid FK organizations.id ON DELETE CASCADE,  -- null for personal
  name text NOT NULL,
  description text,
  color text DEFAULT 'slate',
  slack_webhook_url text,
  custom_webhook_url text,
  created_at timestamptz,
  updated_at timestamptz
)

api_connections (
  id uuid PK,
  user_id uuid FK users.id ON DELETE CASCADE,
  project_id uuid FK projects.id ON DELETE CASCADE,
  provider provider_enum NOT NULL,
  label text,
  api_key_encrypted text NOT NULL,   -- AES-256-GCM: iv:ciphertext:authTag
  api_key_suffix text,               -- last 4 chars, display only
  status connection_status_enum NOT NULL DEFAULT 'active',
  is_active boolean NOT NULL DEFAULT true,
  last_polled_at timestamptz,
  created_at timestamptz
)
```

### Usage Domain

```sql
usage_records (
  id uuid PK,
  connection_id uuid FK api_connections.id ON DELETE CASCADE,
  user_id uuid FK users.id ON DELETE CASCADE,
  date date NOT NULL,
  model text,
  tokens_input bigint NOT NULL DEFAULT 0,
  tokens_output bigint NOT NULL DEFAULT 0,
  cost_usd numeric(10,6) NOT NULL DEFAULT 0,
  raw_response jsonb,
  created_at timestamptz,
  UNIQUE(connection_id, date, model)
)

ingest_events (
  id uuid PK,
  user_id uuid FK users.id ON DELETE CASCADE,
  end_user_id text NOT NULL,       -- developer's own user identifier
  project_id uuid FK projects.id,
  provider provider_enum,
  model text,
  tokens_input bigint NOT NULL DEFAULT 0,
  tokens_output bigint NOT NULL DEFAULT 0,
  cost_usd numeric(10,6) NOT NULL DEFAULT 0,
  metadata jsonb,
  created_at timestamptz
)

proxy_requests (
  id uuid PK,
  org_id uuid FK organizations.id ON DELETE CASCADE,
  member_user_id uuid FK users.id ON DELETE CASCADE,
  project_id uuid FK projects.id,
  provider provider_enum NOT NULL,
  model text,
  tokens_input bigint DEFAULT 0,
  tokens_output bigint DEFAULT 0,
  cost_usd numeric(10,6) DEFAULT 0,
  latency_ms integer,
  status text NOT NULL DEFAULT 'forwarded',  -- forwarded | blocked | throttled
  created_at timestamptz
)
```

### Rules & Alerts Domain

```sql
budget_rules (
  id uuid PK,
  project_id uuid FK projects.id ON DELETE CASCADE,
  user_id uuid FK users.id ON DELETE CASCADE,
  budget_window budget_window_enum NOT NULL,   -- daily | monthly
  limit_usd numeric(10,2) NOT NULL,
  threshold_pct bigint NOT NULL DEFAULT 80,
  action rule_action_enum NOT NULL DEFAULT 'alert',  -- alert | block | throttle
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz,
  updated_at timestamptz
)

alert_log (
  id uuid PK,
  project_id uuid FK projects.id ON DELETE CASCADE,
  user_id uuid FK users.id ON DELETE CASCADE,
  rule_id uuid FK budget_rules.id ON DELETE SET NULL,
  triggered_at timestamptz NOT NULL DEFAULT now(),
  spend_at_trigger numeric(10,2) NOT NULL,
  limit_usd numeric(10,2) NOT NULL,
  percent_used numeric(5,2) GENERATED ALWAYS AS (ROUND((spend_at_trigger/NULLIF(limit_usd,0))*100,2)),
  action_taken text,
  notified_via text[] NOT NULL DEFAULT '{}',
  delivery_status jsonb,
  status alert_status_enum NOT NULL DEFAULT 'active',  -- active | acknowledged | resolved
  resolved_at timestamptz
)

notifications (
  id uuid PK,
  user_id uuid FK users.id ON DELETE CASCADE,
  type text NOT NULL,         -- budget_alert | connection_error | system
  title text NOT NULL,
  message text NOT NULL,
  read_at timestamptz,        -- null = unread
  created_at timestamptz
)
```

### Enums

```sql
plan_enum:             free | plus | pro | corp_starter | corp_growth | corp_scale | enterprise
provider_enum:         openai | anthropic | replicate | falai | gemini
connection_status_enum: active | polling_error | invalid | blocked
budget_window_enum:    daily | monthly
rule_action_enum:      alert | block | throttle
alert_status_enum:     active | acknowledged | resolved
org_role_enum:         owner | admin | member | viewer
```

---

## 6. API Routes (`frugal-api`, all at `/api/v1/`)

```
AUTH
POST   /auth/register
POST   /auth/login
POST   /auth/google
POST   /auth/change-password
GET    /auth/me
PATCH  /auth/profile

PROJECTS
GET    /projects
POST   /projects
GET    /projects/:id
PATCH  /projects/:id
DELETE /projects/:id

CONNECTIONS
GET    /connections
POST   /connections
PATCH  /connections/:id
DELETE /connections/:id

DASHBOARD
GET    /dashboard
GET    /dashboard/spend-chart
GET    /dashboard/top-projects

BUDGET RULES
GET    /budget-rules?projectId=
POST   /budget-rules
PATCH  /budget-rules/:id
DELETE /budget-rules/:id

ALERTS
GET    /alerts
PATCH  /alerts/:id

NOTIFICATIONS
GET    /notifications
PATCH  /notifications/:id/read
PATCH  /notifications/read-all

INGEST (Pro — per-user attribution)
POST   /ingest

BILLING
POST   /billing/checkout
POST   /billing/portal
POST   /billing/webhook
GET    /billing/invoices

ORGANIZATIONS (corporate)
POST   /orgs
GET    /orgs/:id
PATCH  /orgs/:id
GET    /orgs/:id/members
POST   /orgs/:id/invite
PATCH  /orgs/:id/members/:userId
DELETE /orgs/:id/members/:userId
GET    /orgs/:id/dashboard

POLL
POST   /poll

HEALTH
GET    /health
```

```
PROXY SERVICE (frugal-proxy)
POST   /proxy/openai/*
POST   /proxy/anthropic/*
POST   /proxy/gemini/*
POST   /proxy/replicate/*
POST   /proxy/fal/*
GET    /proxy/health
```

---

## 7. Key Data Flows

### Personal — Polling (every 5 min via BullMQ)

1. BullMQ cron triggers polling job
2. Fetch all active `api_connections` for all users
3. Decrypt `api_key_encrypted` (AES-256-GCM)
4. Call provider usage API (version-pinned)
5. Upsert `usage_records` (idempotent on `connection_id + date + model`)
6. `budgetChecker`: sum spend vs `budget_rules` for each project
7. If threshold crossed: write `alert_log` row + `notifications` row
8. `alertDispatcher` (BullMQ worker): fire Resend email + Slack webhook + custom webhook
9. Update `api_connections.last_polled_at`

### Corporate — Proxy (real-time)

1. Employee app → `POST /proxy/openai/v1/chat/completions`
2. Verify org JWT, extract `org_id` + `member_user_id`
3. Check org membership in Redis (30s TTL)
4. Check budget rules in Redis (`budget:rule:{projectId}`, 60s TTL)
5. If BLOCKED → 429 response, write `proxy_requests` row (status=blocked), done
6. If THROTTLED → queue delay, then forward
7. Forward to `api.openai.com` via circuit breaker (opossum)
8. Stream response back to client
9. Async: write `proxy_requests` row via PgBouncer
10. Async: push usage event to BullMQ for alert check

### SDK / Ingest (Pro — per-user attribution)

1. Developer app → `POST /api/v1/ingest` with Bearer JWT
2. Auth middleware validates JWT
3. Tier check: reject non-Pro with 403
4. Zod validate body (`{ endUserId, model, tokensInput, tokensOutput, costUsd, projectId }`)
5. Write `ingest_events` row
6. `budgetChecker` runs against project's active budget rules

### Alert Delivery

1. `alertDispatcher` BullMQ worker receives alert job
2. Email → Resend (all plans with email)
3. Slack webhook → stored on `projects.slack_webhook_url` (Plus+)
4. Custom webhook → stored on `projects.custom_webhook_url` (Pro+)
5. In-app → `notifications` row (all plans)
6. Update `alert_log.delivery_status` (jsonb) + `notified_via` array

---

## 8. Security

### API Key Storage
- Validate key against provider on POST (live test call, read-only scope)
- AES-256-GCM encrypt immediately: `iv:ciphertext:authTag` (hex:base64:hex)
- Store only encrypted blob + last 4 chars suffix
- Key never returned in any API response after creation
- Key never logged anywhere in the stack
- Decrypt only inside polling worker

### Auth
- Argon2id: `memoryCost:65536, timeCost:3, parallelism:4`
- JWT: HS256, 7-day expiry, `httpOnly` cookie
- Constant-time rejection on login (dummy hash verify)
- Google OAuth: verify ID token with Google tokeninfo endpoint; never trust client-sent `googleId`
- Rate limit: `POST /auth/login` → 5 attempts / 15 min per IP (Redis sliding window)

### Request Security
- Helmet (CSP, HSTS, X-Frame-Options, XSS filter)
- CORS: whitelist dashboard domain + proxy domain only
- Zod `.strict()` on all request bodies (reject unknown fields)
- No raw SQL string concatenation — Drizzle parameterized queries only
- Body size limit: `express.json({ limit: '256kb' })`

### Proxy Security (corporate)
- Every proxy request requires org JWT — no anonymous forwarding
- Org membership verified every request (Redis, 30s TTL)
- Logs: model + tokens + cost + timestamp + `member_user_id`
- Never logs: prompt content, completions, messages array
- Rate limit per org member: 100 req / 10s (Redis sliding window)

### Tier Enforcement
- Every protected route reads plan from JWT, checks `PLAN_LIMITS`
- Server-side enforcement is authoritative — client UI gating is UX only
- Corp-only routes (`/orgs/*`, `/proxy/*`) → 403 for non-corp plans

### Infra
- All secrets via env vars, never hardcoded
- Neon: SSL enforced, connection string never logged
- Redis: TLS (Upstash enforces)
- Stripe webhook: `stripe.webhooks.constructEvent` signature verify before any processing
- Sentry: API keys + emails scrubbed from error payloads

---

## 9. Error Handling

### Error Classes

| Class | HTTP | Trigger |
|---|---|---|
| `ValidationError` | 400 | Zod parse failure |
| `UnauthorizedError` | 401 | Bad/expired JWT |
| `ForbiddenError` | 403 | Wrong tier or wrong org |
| `NotFoundError` | 404 | Resource not found |
| `ConflictError` | 409 | Duplicate email, duplicate resource |
| `RateLimitError` | 429 | Rate limit hit |
| `AppError` | 500 | Unexpected (logged to Sentry) |

**Response shape:** `{ error: { code, message, details? } }`

All controllers wrapped in `asyncErrorWrapper` — no uncaught promise rejections.

Proxy errors: provider 4xx/5xx passed through verbatim.
Circuit breaker open: 503 + `Retry-After` header.

---

## 10. Testing Strategy

### Unit Tests (Vitest)
- `authService`: register, login, timing attack resistance
- `budgetChecker`: threshold logic, 1-hour dedup window
- `encryption`: encrypt → decrypt roundtrip, tamper detection
- Tier gates: each plan limit boundary
- Provider modules: mock HTTP, parse usage response correctly

### Integration Tests (Vitest + Supertest, real Neon test DB)
- Full auth flow: register → login → me
- Project + connection CRUD with tier limits enforced
- Polling worker → `usage_records` upsert idempotency
- Budget rule → `alert_log` → `notifications` chain
- Stripe webhook handlers: `checkout.session.completed`, `customer.subscription.deleted`

### Proxy Tests
- Budget blocked → 429 (Redis mock)
- Circuit breaker open → 503
- Valid request → forwarded + `proxy_requests` row written

### CI (GitHub Actions)
```
typecheck → lint → test → build
Block merge on any failure
```

---

## 11. Folder Structure

```
frugal-api/
  src/
    config/           unified config (env vars, validated with Zod)
    controllers/      thin request/response handlers
    services/         business logic
    repositories/     DB query layer (Drizzle)
    routes/           Express routers
    middleware/       auth, rateLimit, errorHandler, asyncErrorWrapper
    workers/          BullMQ polling worker, alertDispatcher
    providers/        one file per AI provider (openai.ts, anthropic.ts, etc.)
    db/               Drizzle schema, migrations, client
    email/            Resend templates
    utils/            encryption, errors, logger, tier
    types/            express.d.ts, shared types
  tests/
    unit/
    integration/

frugal-proxy/
  src/
    middleware/       orgAuth, budgetCheck, rateLimitPerMember
    forwarders/       one file per provider
    utils/            circuitBreaker, logger
    db/               shared Neon client (PgBouncer string)
  tests/
```

---

## 12. Environment Variables

```
# Database
DATABASE_URL=                  # Neon direct connection
DATABASE_POOL_URL=             # Neon PgBouncer (proxy service uses this)

# Redis
REDIS_URL=                     # Upstash Redis TLS URL
REDIS_TOKEN=

# Auth
JWT_SECRET=
JWT_EXPIRES_IN_SECONDS=604800  # 7 days

# Encryption
ENCRYPTION_KEY=                # 32-byte hex, AES-256-GCM

# Stripe
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
STRIPE_PRICE_PLUS_MONTHLY=
STRIPE_PRICE_PLUS_YEARLY=
STRIPE_PRICE_PRO_MONTHLY=
STRIPE_PRICE_PRO_YEARLY=

# Resend
RESEND_API_KEY=
RESEND_FROM_ADDRESS=

# Sentry
SENTRY_DSN=

# Server
PORT=3000
CORS_ORIGINS=                  # comma-separated
NODE_ENV=

# Google OAuth
GOOGLE_CLIENT_ID=
```
