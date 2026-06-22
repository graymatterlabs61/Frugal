# Product Requirements Document — Frugal
**Version:** 2.0 | **Date:** 2026-06-19 | **Author:** Nilesh Kumar

---

## 1. Problem Statement

Developers and engineering teams building on AI APIs (OpenAI, Anthropic, Replicate, fal.ai) have no native way to:

- Set per-project budget limits
- Get alerted before costs spiral
- Attribute spend to specific features, users, or teams
- Enforce hard stops when budgets are exceeded

Cloud provider dashboards show org-level totals with multi-day lag. A rogue agent loop, a misconfigured prompt, or an unthrottled batch job can generate thousands of dollars in charges overnight. By the time a team notices, the damage is done.

**Frugal solves this at the instrumentation layer** — not by proxying traffic (adds latency and infrastructure complexity) but by:
1. **SDK path (V1 primary):** Wrapping provider SDK calls, capturing usage events asynchronously, evaluating budget rules in near-real-time (~1 min enforcement latency)
2. **Polling path (V1 fallback):** Polling provider usage APIs every 5 minutes for accounts without SDK instrumentation

**What Frugal is NOT (personal plan):**
- Not an instant request interceptor (5-min polling gap on polling path; ~1 min on SDK path)
- Not a request logger or LLM observability tool
- Not a replacement for provider native limits — use both as defense-in-depth

---

## 2. Target Users

### Segment A — Individual Technical Users (Personal/Plus Tier)
- **Software developers** building products on top of AI APIs
- **Engineering managers** tracking their team's AI spend
- Trigger: Surprised by an AI bill at least once
- Pain: No visibility until the monthly invoice; no per-project attribution

### Segment B — Orgs with AI Budgets (Corporate/Pro Tier)
- **Startups and founders** with AI spend embedded in their product
- **Companies** provisioning AI tool access to employees and projects
- **Finance/ops leads** responsible for AI cost governance
- Trigger: AI spend is now a real line item, not experimental
- Pain: No control, no attribution, no guardrails across the team

**Key buying trigger (both):** Real money flowing to AI providers with zero visibility or control.

**Personal tier copy:** "Stop your AI bill from surprising you."
**Corporate tier copy:** "Control AI spend across your team and projects."

---

## 3. Product Vision

Frugal is the cost control layer for AI-powered applications — a lightweight SDK that wraps your existing provider clients, tracks spend per project, and enforces budget rules before bills arrive. Zero URL changes. No proxy latency. Connect in 2 minutes.

---

## 4. Core Features

### V1 — Must-Have (Launch)

| # | Feature Area | Feature | Tier | Notes |
|---|---|---|---|---|
| F-01 | Auth | Email magic-link + Google OAuth | ALL | Auth.js v5; no passwords |
| F-02 | API Connections | Add/validate/manage provider keys | ALL | 1/3/∞ per tier; AES-256 encrypted |
| F-03 | Providers | OpenAI usage polling | ALL | `/v1/usage` daily; admin key fallback |
| F-04 | Providers | Anthropic usage polling | ALL | Admin API usage report |
| F-05 | Providers | Replicate usage polling | ALL | `/v1/predictions` paginated |
| F-06 | Providers | fal.ai usage polling | ALL | `/v1/usage` daily |
| F-07 | Dashboard | Multi-provider spend view | ALL | By provider / project / model |
| F-08 | Dashboard | Burn rate indicator | PLUS/PRO | Projected monthly at current pace |
| F-09 | Dashboard | Per-user attribution | PRO | Requires SDK or manual `track()` |
| F-10 | Dashboard | Usage history 7d/90d/1yr | Tier-gated | Enforced server-side |
| F-11 | Budget Rules | Alert rule | PLUS/PRO | Fire notification at threshold |
| F-12 | Budget Rules | Block rule | PLUS/PRO | Flag connection; next poll skips |
| F-13 | Budget Rules | Throttle rule | PRO | Model downgrade; requires SDK |
| F-14 | Budget Rules | Daily + monthly windows | PLUS/PRO | Reset midnight UTC / 1st of month |
| F-15 | Alerts | Email alerts (Resend) | ALL | 1-hour dedup window |
| F-16 | Alerts | Slack alerts | PLUS/PRO | Per-project webhook URL |
| F-17 | Alerts | Webhook alerts (HMAC-signed) | PRO | 3× retry + exponential backoff |
| F-18 | Alerts | Alert log with audit trail | ALL | `delivery_status` JSONB per channel |
| F-19 | Projects | Project management | ALL | 1/5/∞ per tier |
| F-20 | Billing | Stripe subscriptions | ALL | Monthly + annual plans |
| F-21 | Billing | Tier feature enforcement | ALL | Server-side on every route |
| F-SDK | SDK | `@getfrugal/sdk` npm package | ALL | `frugal.wrap()` + `frugal.track()` |

### V1.1 — Should-Have (Post-Launch)

| # | Feature | Tier | Notes |
|---|---|---|---|
| F-22 | Programmatic API access | PRO | REST endpoints for spend/rules data |
| F-23 | Per-user budget limits | PRO | Cap per end-user; requires F-09 |
| F-24 | ElevenLabs polling | ALL | V1.1 provider expansion |
| F-25 | Cohere polling | ALL | V1.1 provider expansion |

### V2 — Nice-to-Have (Corporate / Future)

| # | Feature | Notes |
|---|---|---|
| F-V2-01 | Corporate proxy gateway | Real-time sub-second enforcement; SSO; compliance export |
| F-V2-02 | Python SDK | Mirror JS SDK design |
| F-V2-03 | ClickHouse data plane | Trigger at ~10M events/month |
| F-V2-04 | Gateway tier | Hard block guarantees via traffic proxy |

---

## 5. Feature Detail

### F-02 — API Connections

**Add flow:**
1. User enters API key → `POST /api/connections`
2. Server AES-256 encrypts via `lib/encryption.ts` → stores in `api_connections`
3. Server validates key against provider's cheapest validation endpoint:
   - OpenAI: `GET /v1/models` — any 200 = valid
   - Anthropic: `GET /v1/models` — any 200 = valid
   - Replicate: `GET /v1/account` — any 200 = valid
   - fal.ai: `GET /v1/usage` — any 200 = valid
4. Returns `{ id, provider, last4, status: 'active' }` — full key never returned
5. QStash schedules first poll immediately

**Status states:** `active` | `blocked` | `invalid` | `polling_error`

**Connection limits:** Free = 1, Plus = 3, Pro = unlimited

### F-03 to F-06 — Provider Polling

**Polling trigger:** QStash cron → `POST /api/poll` every 5 minutes

**Per connection flow:**
1. Fetch all `api_connections` where `status = 'active'`
2. Decrypt key → call provider usage API for today
3. Normalize response: `{ provider, date, model, tokens_in, tokens_out, cost_usd }`
4. Upsert into `usage_records` — idempotent on `(connection_id, date, model)`
5. Update `last_polled_at`
6. On provider error: set `status = 'polling_error'`, skip budget check

**Failure behavior:**
- Network error: set `polling_error`, email user (once per 24h), continue other connections
- 401 invalid key: set `status = 'invalid'`, email user
- 429 rate limited: skip cycle, retry next cycle

**Provider modules:** `lib/providers/<name>.ts` each exports:
```typescript
export async function fetchUsage(decryptedKey: string, date: string): Promise<UsageRecord[]>
```

### F-07 — Multi-Provider Dashboard

**Views:**
1. Overview — total spend this month, % of budget per project
2. By provider — stacked bar chart: daily spend per provider for last N days
3. By project — table: spend + budget + % used
4. By model — breakdown of which models cost the most

**Data source (priority):** SDK events via `usage_rollups` (primary for SDK-instrumented projects) → `usage_records` (polling fallback). Source labeled in UI: "Tracked via SDK" / "Provider billing".

**Data freshness:** ≤5 min stale (polling) / ~1 min stale (SDK events)

**History windows (server-enforced):**
- Free: 7 days
- Plus: 90 days
- Pro: 365 days

### F-08 — Burn Rate Indicator (PLUS/PRO)

**Calculation:**
```
burn_rate_daily   = sum(cost_usd, last 7 days) / 7
projected_monthly = burn_rate_daily × 30
days_until_limit  = (budget_limit − spend_this_month) / burn_rate_daily
```

**Display:** "At this pace: ~$X this month" | Color: green <70%, amber 70–90%, red >90%

### F-09 — Per-User Attribution (PRO)

Developer sends `X-Frugal-User-ID` in SDK metadata or calls `frugal.track({ ..., metadata: { userId: '...' } })`. Provider polling APIs don't return per-user data — attribution requires SDK instrumentation or manual `POST /api/usage-events`.

**Dashboard view:** Top 20 users by spend, per-user model breakdown, daily trend.

### F-11 to F-14 — Budget Rules Engine

| Action | Tier | What happens |
|---|---|---|
| Alert | PLUS/PRO | Notification only. Polling continues. |
| Block | PLUS/PRO | `enforcement_state = 'blocked'`. SDK rejects calls. Next poll skips connection. |
| Throttle | PRO | Model downgrade in SDK (gpt-4o → gpt-4o-mini). SDK path only. |

**Windows:** Daily (resets midnight UTC) | Monthly (resets 1st of month UTC)

**Alert threshold:** `threshold_pct` — fire alert at X% of limit (80% default = early warning before hard limit)

**Budget checker logic:**
```
after each poll / at each ingest event batch:
  for each project with active budget rules:
    sum = sum(cost_usd for current window)
    for each rule:
      if sum >= (rule.limit_usd × rule.threshold_pct / 100):
        if not already triggered this window (check alert_log):
          execute action → write alert_log
```

**Important caveat:** Block/throttle on polling path takes effect at next poll cycle (~5 min lag). SDK path: ~1 min enforcement latency (status cache). For hard real-time blocking, pair with provider native spending limits.

### F-15 to F-18 — Alerts

**Every alert includes:**
- Project name + provider
- Current spend (this window) vs budget limit + % used
- Estimated time until limit at current burn rate
- Timestamp + link to dashboard

**Email (F-15):** Resend. Dedup: check `alert_log` — don't fire same rule twice within 1-hour window.

**Slack (F-16):** User configures per-project webhook URL. On failure: log error, fall back to email.

**Webhook (F-17, PRO):** HMAC-SHA256 signed. `X-Frugal-Signature: hmac-sha256=<hash>` header. Retry ×3 exponential backoff. On final failure: log + email user.

**Alert log (F-18):** `delivery_status` JSONB records per-channel outcome: `{ email: 'sent', slack: 'failed', webhook: 'sent' }`

### F-SDK — SDK (`@getfrugal/sdk`)

```typescript
const frugal = new Frugal({ key: process.env.FRUGAL_KEY!, failMode: 'open' })
const openai  = frugal.wrap(new OpenAI())      // Proxy-based; zero latency impact
const anthropic = frugal.wrap(new Anthropic()) // Same pattern
frugal.track({ provider: 'replicate', model: 'flux-pro', costUsd: 0.055 })
await frugal.flush()    // serverless: drain before handler return
await frugal.shutdown() // flush + stop timers
```

**Enforcement modes:**
- `failMode: 'open'` (default) — Frugal down → AI calls proceed on stale cache
- `failMode: 'closed'` — stale status > 5min → throw `FrugalUnavailableError`

**Event caps:** Free 50k/mo | Plus 1M/mo | Pro unlimited. Over cap: events dropped + banner + one email per billing period. Never silent, never breaks AI calls.

---

## 6. App Flow

### Onboarding
1. Land on `getfrugal.dev` → click "Get Started Free" → `/signup`
2. Enter email → magic-link via Resend → click link → `/dashboard` (empty state)
3. Welcome email delivered

### SDK Setup Flow (Primary)
1. "New Project" → name project → system generates ingest key (`fr_pk_…`) — shown once
2. Install SDK: `npm install @getfrugal/sdk`
3. Set `FRUGAL_KEY=fr_pk_…` in `.env`
4. `const openai = frugal.wrap(new OpenAI())`
5. Make AI calls normally → usage appears in dashboard within minutes

### Polling Setup Flow (Alternative)
1. "Add Connection" → select provider → paste API key
2. Key validated → encrypted → stored
3. First poll fires immediately → usage appears within 5 min

### Budget Rule → Alert → Enforcement
1. User creates rule: "Block when monthly > $50"
2. Ingest route evaluates on each event batch; cron backstop every 5 min
3. Threshold crossed → `enforcement_state = 'blocked'`, Redis status cache invalidated
4. SDK: next status poll (30s) → cached `'blocked'` → throws `FrugalBudgetExceededError`
5. Email + Slack alert fires (1-hour dedup)
6. Dashboard: "Blocked" badge on project card

### Billing Flow
1. Free user hits plan limit → upgrade prompt with locked feature highlighted
2. Click "Upgrade" → Stripe Checkout
3. Payment → Stripe webhook → `users.plan` updated → limits immediately lifted

---

## 7. Pricing

### Personal Plans

| | Free | Plus | Pro |
|---|---|---|---|
| **Price (monthly)** | $0 | $19/mo | $49/mo |
| **Price (annual)** | — | $15/mo · $180/yr | $39/mo · $468/yr |
| **Annual saving** | — | Save $48/yr | Save $120/yr |
| **API connections** | 1 | 3 | Unlimited |
| **Projects** | 1 | 5 | Unlimited |
| **Usage history** | 7 days | 90 days | 1 year |
| **SDK events/month** | 50,000 | 1,000,000 | Unlimited |
| **Poll interval** | 5 min | 5 min | 5 min |
| **Alerts** | Email only | Email + Slack | Email + Slack + Webhook |
| **Budget guardrails** | None | Alert + Block | Alert + Block + Throttle |
| **Burn rate dashboard** | No | Yes | Yes |
| **Per-user attribution** | No | No | Yes |
| **API access (programmatic)** | No | No | V1.1 |
| **Support** | Community | Email 48h | Priority email 24h |

**Annual framing:** "2 months free" not "20% off".

### Upgrade Triggers
```
Free → Plus:  Need Slack alerts, budget guardrails, >1 connection, >1 project
Plus → Pro:   Need per-user attribution, webhooks, API access, >5 projects
```

### Price Rationale
- **Free ($0):** Pipeline, not revenue. One connection shows unified multi-provider spend. No guardrails — that gap drives upgrade.
- **Plus ($19):** Hero tier. Below Helicone Pro ($20/seat), ahead on enforcement. Under $20 = no approval needed. Annual at $15 = deal psychology. Target: 60%+ of revenue.
- **Pro ($49):** Per-user attribution unlock. Any dev monetizing a product needs per-end-user cost to price contracts and protect margins.

### Corporate Plans (Waitlist — Q3 2026)

Not launched. Proxy gateway architecture (real-time sub-second enforcement). Per-team/per-person budget policies. Planned tiers:

| | Team | Scale | Growth |
|---|---|---|---|
| **Price** | $79/mo flat | $149/mo flat | Contact sales |
| **Seats** | 2–10 | 11–20 | 20+ |
| **SSO** | No | Yes | Yes |
| **SLA** | No | No | 99.9% uptime |

---

## 8. Competitive Position

| | Frugal Personal | Helicone | LangSmith | Provider Native |
|---|---|---|---|---|
| Multi-provider | **Yes** | Yes | No | No |
| No URL change / no proxy | **Yes** | No (proxy) | No | N/A |
| Automatic guardrails | **Yes** | No | No | Partial |
| Per-user attribution | Yes (Pro) | Partial | No | No |
| Solo-dev pricing | **$19/mo** | $20/seat | $39/user | Free |
| Enforcement type | Polling 5-min / SDK ~1min | Proxy real-time | None | Native limit |

**Frugal's wedge:** Only tool with multi-provider + enforcement + no integration friction at any price.

**Honest tradeoff vs Helicone:** Helicone proxy = real-time enforcement. Frugal personal = 5-min polling + SDK ~1-min enforcement with zero URL change. Users wanting sub-second blocking use provider hard limits as floor + Frugal as layer above.

---

## 9. Trust & Security Transparency

Users give Frugal their API keys. Here is exactly what Frugal does:
- AES-256 encrypted immediately on receipt
- Stored only in encrypted form — never in plaintext anywhere in the stack
- Used **only** to call provider's usage/reporting API — never to make model requests
- Never logged, never transmitted to third parties
- Only last 4 characters shown in UI — full key never returned after save
- Polling path: Frugal never proxies model requests. Traffic goes directly from user's app to provider.

**Auditability roadmap:** SOC 2 Type II targeted Q4 2026, after product proves traction.

---

## 10. Success Metrics

| Metric | Month 1 | Month 6 |
|--------|---------|---------|
| MRR | $500 | $870 |
| Free users | 50 | 30 |
| Plus users | 10 | 20 |
| Pro users | 3 | 10 |
| Active projects (SDK instrumented) | 30 | 200 |
| Free → Paid conversion | 5% | 5–10% |
| Monthly churn | <10% | <5% |

**Month 6 projection assumptions:**
- $870 MRR = 20 Plus ($380) + 10 Pro ($490)
- Requires ~600–1,200 free signups (5–10% conversion)
- Primary risk: distribution, not product

---

## 11. MVP Scope

MVP = a paying user can:
1. Sign up, create project, get ingest key
2. Install SDK, wrap one provider, see spend within 5 minutes
3. Set a budget rule that blocks AI calls and sends an email alert
4. Upgrade to Plus and set multiple projects

---

## 12. What We're NOT Building (V1)

| Not building | Why |
|---|---|
| Proxy/gateway | Adds latency, complex to operate; wait for demand signal |
| Python SDK | JS first; Python post-launch |
| Per-end-user attribution at Pro (V1) | SDK metadata tags cover 80% of need; full per-user budgets post-launch |
| ClickHouse | Trigger at 10M events/month |
| Mobile app | Dev tool; web sufficient |
| Browser SDK | AI keys must not be in browsers |
| SOC 2 | Post-Series A if enterprise warrants |
| LLM evaluation / prompt logging | Out of product scope permanently |
| Real-time block on polling path | 5-min gap exists and is documented; SDK path covers near-real-time |