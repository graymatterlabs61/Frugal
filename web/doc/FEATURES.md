# FEATURES — Frugal
## Complete Feature Specification
**Version:** 1.0 | **Date:** June 2026 | **Author:** Nilesh Kumar / GML-IOS v2.0

---

## Scope of This Document

Personal plan features only. Corporate proxy features are in a separate spec (targeted Q3 2026).

Tier codes: `FREE` `PLUS` `PRO`
Release codes: `V1` `V1.1` `V2`

---

## Feature Index

| # | Feature Area | Key Feature | Tier | Release |
|---|---|---|---|---|
| F-01 | Auth | Email + Google OAuth | ALL | V1 |
| F-02 | API Connections | Add / validate / manage keys | ALL | V1 |
| F-03 | Providers | OpenAI usage polling | ALL | V1 |
| F-04 | Providers | Anthropic usage polling | ALL | V1 |
| F-05 | Providers | Replicate usage polling | ALL | V1 |
| F-06 | Providers | fal.ai usage polling | ALL | V1 |
| F-07 | Dashboard | Multi-provider spend view | ALL | V1 |
| F-08 | Dashboard | Burn rate indicator | PLUS/PRO | V1 |
| F-09 | Dashboard | Per-user attribution | PRO | V1 |
| F-10 | Dashboard | Usage history 7d / 90d / 1yr | tier-gated | V1 |
| F-11 | Budget Rules | Alert rule | PLUS/PRO | V1 |
| F-12 | Budget Rules | Block rule | PLUS/PRO | V1 |
| F-13 | Budget Rules | Throttle rule | PRO | V1 |
| F-14 | Budget Rules | Daily + monthly windows | PLUS/PRO | V1 |
| F-15 | Alerts | Email alerts | ALL | V1 |
| F-16 | Alerts | Slack alerts | PLUS/PRO | V1 |
| F-17 | Alerts | Webhook alerts (HMAC-signed) | PRO | V1 |
| F-18 | Alerts | Alert log with audit trail | ALL | V1 |
| F-19 | Projects | Project management | ALL | V1 |
| F-20 | Billing | Stripe subscriptions | ALL | V1 |
| F-21 | Billing | Tier feature enforcement | ALL | V1 |
| F-22 | API | Programmatic budget access | PRO | V1.1 |
| F-23 | Budget Rules | Per-user budget limits | PRO | V1.1 |
| F-24 | Providers | ElevenLabs polling | ALL | V1.1 |
| F-25 | Providers | Cohere polling | ALL | V1.1 |

---

## F-01 — Auth

**Tier:** ALL | **Release:** V1

### What it does
Email/password signup and Google OAuth. Session management via Supabase. Every API route validates session before processing.

### How it works
- Supabase Auth handles all flows: email confirmation, password reset, Google OAuth
- `supabase.auth.getUser()` called at top of every API route handler — before any logic
- On signup: create row in `users` table (trigger or explicit insert)
- Google OAuth: configured via Supabase OAuth providers, redirect back to `/dashboard`
- Session stored in Supabase cookie (server-side for App Router)

### Rules
- No route skips auth check — no exceptions
- No user data accessible without valid session
- RLS policies scope all tables to `auth.uid()`

---

## F-02 — API Connections

**Tier:** ALL (1 connection Free, 3 Plus, unlimited Pro) | **Release:** V1

### What it does
User adds their provider API key. Frugal validates it, encrypts it, stores it, and begins polling usage data.

### How it works

**Add flow:**
1. User enters API key in UI → `POST /api/connections`
2. Server: AES-256 encrypt via `lib/encryption.ts` → store in `api_connections`
3. Server: validate key — call provider's cheapest validation endpoint (see provider list below)
4. On success: return `{ id, provider, last4, status: 'active' }` — full key never returned
5. QStash: schedule first poll immediately

**Validation endpoints:**
| Provider | Validation call |
|---|---|
| OpenAI | `GET /v1/models` — any 200 = valid |
| Anthropic | `GET /v1/models` — any 200 = valid |
| Replicate | `GET /v1/account` — any 200 = valid |
| fal.ai | `GET /v1/usage` — any 200 = valid |

**Edit/delete:**
- Edit: re-enter key → re-encrypt → re-validate → update record
- Delete: remove record + cancel scheduled polls for that connection

**Status states:** `active` | `blocked` | `invalid` | `polling_error`

### Security rules
- Key AES-256 encrypted before DB write — `lib/encryption.ts`
- Encryption key in env var `ENCRYPTION_KEY` — never in code
- `last4` only stored in plaintext for display
- Key never logged anywhere
- Key never returned in any API response after initial save

### DB schema
```sql
api_connections (
  id uuid primary key,
  user_id uuid references users(id),
  provider text not null,           -- 'openai' | 'anthropic' | 'replicate' | 'fal'
  encrypted_key text not null,
  last4 text not null,
  status text not null default 'active',
  created_at timestamptz default now(),
  last_polled_at timestamptz
)
```

---

## F-03 to F-06 — Provider Polling

**Tier:** ALL | **Release:** V1

### Providers in V1
| Provider | Usage API | Data granularity | Rate limit concern |
|---|---|---|---|
| OpenAI | `/v1/usage` | Daily by model | Low — read-only |
| Anthropic | `/v1/usage` | Daily by model | Low |
| Replicate | `/v1/predictions` paginated | Per-prediction | Medium — paginate carefully |
| fal.ai | `/v1/usage` | Daily | Low |

### How polling works

**Trigger:** QStash cron → `POST /api/worker/poll` every 5 minutes

**Per connection:**
1. Fetch all `api_connections` where `status = 'active'`
2. Decrypt key → call provider usage API for today
3. Normalize response to standard shape: `{ provider, date, model, tokens_in, tokens_out, cost_usd }`
4. Upsert into `usage_records` — idempotent on `(connection_id, date, model)`
5. Update `last_polled_at` on connection
6. If provider returns error: set `status = 'polling_error'`, skip budget check

**Idempotency:** Upsert on unique key `(connection_id, date, model)`. Duplicate poll = same data overwritten, no duplicate rows.

**Failure behavior:**
- Network error: set `polling_error`, alert user by email (once per 24h), continue other connections
- Invalid key 401: set `status = 'invalid'`, email user
- Rate limited 429: skip this cycle, log, retry next cycle

### Provider modules
Each provider lives in `lib/providers/<name>.ts` and exports:
```typescript
export async function fetchUsage(
  decryptedKey: string,
  date: string          // YYYY-MM-DD
): Promise<UsageRecord[]>
```

### DB schema
```sql
usage_records (
  id uuid primary key,
  connection_id uuid references api_connections(id),
  user_id uuid references users(id),
  provider text not null,
  date date not null,
  model text not null,
  tokens_in bigint default 0,
  tokens_out bigint default 0,
  cost_usd numeric(10,6) not null,
  end_user_id text,               -- null for direct usage, set for per-user attribution
  created_at timestamptz default now(),
  unique (connection_id, date, model, end_user_id)
)
```

---

## F-07 — Multi-Provider Spend Dashboard

**Tier:** ALL | **Release:** V1

### What it does
Single view of all AI spend across every connected provider. Breakdown by provider, project, day. This is the activation moment — user sees their full picture for the first time.

### Views
1. **Overview** — total spend this month across all providers, % of budget used per project
2. **By provider** — bar chart: daily spend per provider for last N days
3. **By project** — table: each project's total spend + budget + % used
4. **By model** — breakdown of which models are costing the most

### Data freshness
- Displays data from `usage_records` — max 5 minutes stale (last poll cycle)
- Timestamp shown: "Last updated X minutes ago"

### Implementation
- Server components query Supabase directly — no client-side fetch for main data
- Charts: Recharts (already in shadcn ecosystem)
- History window enforced server-side based on tier:
  - Free: 7 days
  - Plus: 90 days
  - Pro: 365 days

---

## F-08 — Burn Rate Indicator

**Tier:** PLUS, PRO | **Release:** V1

### What it does
Shows estimated monthly spend at current usage pace. Answers: "Am I on track to blow my budget this month?"

### Calculation
```
burn_rate_daily = sum(cost_usd for last 7 days) / 7
projected_monthly = burn_rate_daily * 30
days_until_limit = (budget_limit - spend_this_month) / burn_rate_daily
```

### Display
- "At this pace: ~$X this month"
- "Budget: $Y — you'll hit it in ~Z days" (if on track to exceed)
- Color coding: green < 70%, amber 70–90%, red > 90%

---

## F-09 — Per-User Attribution

**Tier:** PRO | **Release:** V1

### What it does
Tracks which of your end-users (customers of your product) are driving AI spend. Answers: "Which of my users costs me the most?"

### How it works

**Developer setup:**
Developer sends `X-Frugal-User-ID: <their-user-id>` header with each API call. Frugal (in proxy mode) or SDK captures this.

**Personal plan (polling-based) limitation:**
Provider usage APIs don't return per-end-user data. Developer must either:
- Use Frugal's lightweight logging SDK (sends cost event to Frugal after each API call)
- Or tag usage manually via Frugal API: `POST /api/usage-events { user_id, provider, model, tokens, cost }`

This means **per-user attribution on personal plan requires developer integration** — it is not zero-config.

### Dashboard view
- Table: top 20 users by spend this month
- Per user: total cost, model breakdown, daily trend
- Allows setting per-user budget limits (V1.1)

---

## F-10 — Usage History

**Tier:** Gated by tier | **Release:** V1

| Tier | History window |
|---|---|
| Free | 7 days |
| Plus | 90 days |
| Pro | 365 days |

Enforced server-side in all queries — date filter added based on user's plan. Old data is retained in DB but not served to lower tiers. Upgrading unlocks full history retroactively.

---

## F-11 to F-14 — Budget Rules Engine

**Tier:** PLUS/PRO (Free = no rules) | **Release:** V1

### What it does
Developer sets a spending threshold on a project. When spend crosses the threshold, Frugal triggers an action automatically at the next poll cycle (within 5 minutes).

### Rule types

| Action | Tier | What happens |
|---|---|---|
| Alert | PLUS/PRO | Send notification. Polling and API access continue. |
| Block | PLUS/PRO | Set `api_connections.status = 'blocked'`. Next poll skips this connection. App receives error on next request (if using proxy). |
| Throttle | PRO | Downgrade model in requests. `gpt-4o` → `gpt-4o-mini`. Requires proxy mode or SDK. |

### Rule windows
- **Daily:** resets at midnight UTC
- **Monthly:** resets on 1st of month UTC

### Rule structure
```sql
budget_rules (
  id uuid primary key,
  project_id uuid references projects(id),
  user_id uuid references users(id),
  limit_usd numeric(10,2) not null,
  window text not null,             -- 'daily' | 'monthly'
  action text not null,             -- 'alert' | 'block' | 'throttle'
  threshold_pct integer default 100,  -- trigger at this % of limit (80% for early warning)
  created_at timestamptz default now()
)
```

### Budget checker logic (`lib/polling/budgetChecker.ts`)
```
after each poll cycle:
  for each project with active budget rules:
    sum = sum(usage_records.cost_usd) for current window
    for each rule on this project:
      if sum >= (rule.limit_usd * rule.threshold_pct / 100):
        if not already triggered this window (check alert_log):
          execute action
          write to alert_log
```

### Important caveat
Block/throttle actions take effect at the **next polling cycle** — up to 5 minutes after the threshold is crossed. For hard real-time blocking, pair with provider-native spending limits as the floor.

---

## F-15 to F-18 — Alerts

**Tier:** Email = ALL | Slack = PLUS/PRO | Webhook = PRO | **Release:** V1

### Alert payload
Every alert includes:
- Project name
- Provider
- Current spend (this window)
- Budget limit
- % used
- Estimated time until limit at current burn rate
- Timestamp
- Link to dashboard

### Email alerts (F-15)
- Provider: Resend
- Template: transactional, minimal, mobile-friendly
- Triggered by: `lib/polling/alertService.ts`
- Dedup: check `alert_log` — don't fire same rule twice in 1-hour window

### Slack alerts (F-16)
- User configures Slack webhook URL in project settings
- `alertService.ts` POSTs formatted block message to webhook URL
- Failure: log error, fall back to email

### Webhook alerts (F-17)
- User configures webhook URL + sees HMAC secret in project settings
- Request: `POST <user-url>` with JSON payload + `X-Frugal-Signature: hmac-sha256=<hash>`
- Signature computed over request body using user's secret
- Failure: retry 3x with exponential backoff, then log failure + email user

### Alert log (F-18)
```sql
alert_log (
  id uuid primary key,
  rule_id uuid references budget_rules(id),
  project_id uuid references projects(id),
  user_id uuid references users(id),
  triggered_at timestamptz default now(),
  spend_at_trigger numeric(10,6),
  action_taken text,
  delivery_status jsonb    -- { email: 'sent', slack: 'failed', webhook: 'sent' }
)
```

---

## F-19 — Projects

**Tier:** ALL (1 Free, 5 Plus, unlimited Pro) | **Release:** V1

### What it does
Projects group API connections and budget rules. One project = one product you're building. Multi-project users are agencies or devs running multiple products.

### Structure
```sql
projects (
  id uuid primary key,
  user_id uuid references users(id),
  name text not null,
  description text,
  created_at timestamptz default now()
)
```

API connections and budget rules have `project_id` FK. Dashboard can filter by project.

---

## F-20 to F-21 — Billing & Tier Enforcement

**Tier:** ALL | **Release:** V1

### Stripe integration
- Plans: 4 Stripe prices (Plus monthly, Plus annual, Pro monthly, Pro annual)
- Checkout: Stripe Checkout → success → webhook → update `users.plan`
- Webhook events handled: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`
- Cancel: Stripe Customer Portal (self-serve)

### Tier enforcement
```typescript
// lib/tier.ts
export function hasFeature(user: User, feature: Feature): boolean
export function getConnectionLimit(plan: Plan): number  // 1 | 3 | Infinity
export function getProjectLimit(plan: Plan): number     // 1 | 5 | Infinity
export function getHistoryDays(plan: Plan): number      // 7 | 90 | 365
```

All limits checked server-side on every relevant API route. Client-side gates are UI hints only — never the enforcement layer.

---

## F-22 — Programmatic API Access

**Tier:** PRO | **Release:** V1.1

### What it does
REST API for reading spend data and managing budget rules programmatically. Target: developers who want to integrate Frugal data into their own dashboards or CI/CD pipelines.

### Endpoints (planned)
```
GET  /api/v1/projects                  — list projects
GET  /api/v1/projects/:id/spend        — spend for a project
GET  /api/v1/projects/:id/budget-rules — list rules
POST /api/v1/projects/:id/budget-rules — create rule
PUT  /api/v1/budget-rules/:id          — update rule
GET  /api/v1/usage                     — raw usage records (paginated)
```

### Auth
API key issued per user (Pro only). Sent as `Authorization: Bearer <key>`. Key AES-256 encrypted at rest, same as provider keys.

---

## F-23 — Per-User Budget Limits

**Tier:** PRO | **Release:** V1.1

Set a spending cap per end-user of your product. When user X hits $5 in a month, block their requests. Prevents one bad actor from blowing your budget.

Requires per-user attribution (F-09) to be active.

---

## Feature Gating Summary

| Feature | Free | Plus | Pro |
|---|---|---|---|
| API connections | 1 | 3 | Unlimited |
| Projects | 1 | 5 | Unlimited |
| Usage history | 7d | 90d | 365d |
| Multi-provider dashboard | Yes | Yes | Yes |
| Burn rate | No | Yes | Yes |
| Email alerts | Yes | Yes | Yes |
| Slack alerts | No | Yes | Yes |
| Webhook alerts | No | No | Yes |
| Budget rules (alert) | No | Yes | Yes |
| Budget rules (block) | No | Yes | Yes |
| Budget rules (throttle) | No | No | Yes |
| Per-user attribution | No | No | Yes |
| Per-user budget limits | No | No | V1.1 |
| API access | No | No | V1.1 |

---

## V1 Build Order

```
Week 1: Auth + DB schema + API connection add/encrypt/validate
Week 2: OpenAI + Anthropic polling worker (QStash)
Week 3: Dashboard (overview + by-provider + burn rate)
Week 4: Budget rules engine + email alerts
Week 5: Slack alerts + alert log UI + Stripe billing
Week 6: Replicate + fal.ai providers + tier enforcement + polish
```

Providers Replicate + fal.ai are lower priority than the core loop. Ship with OpenAI + Anthropic first.

---

## Out of Scope — V1

- Per-user attribution via polling (needs SDK or proxy — V1.1)
- Webhook alerts HMAC signing (deliver webhook first, signing in V1.1)
- API access (V1.1)
- Per-user budget limits (V1.1)
- ElevenLabs, Cohere (V1.1)
- Corporate proxy, SSO, compliance export (V2 / separate product)
- LLM evaluation, prompt logging, model routing (never — out of product scope)
- Mobile app (never in roadmap)
