# TRD — Frugal
## Technical Requirements Document
**Version:** 1.0 | **Date:** June 2026 | **Author:** Nilesh Kumar / GML-IOS v2.0

---

## 1. Tech Stack

| Layer | Technology | Rationale |
|-------|-----------|-----------|
| Frontend | Next.js 14 + TypeScript | Nilesh's primary stack, SSR for fast dashboards |
| UI | Tailwind CSS + ShadCN/UI | Consistent, accessible components, no design debt |
| Backend | Next.js API routes + Node.js | Unified codebase, faster iteration |
| Database | Supabase (PostgreSQL) | Nilesh's proven stack, Realtime built-in, auth included |
| Cache / Queue | Redis (Upstash) | Rate-limit aware API polling, job queuing for alerts |
| Auth | Supabase Auth | OAuth (GitHub, Google) + email/password, no custom auth needed |
| Payments | Stripe | Industry standard, handles INR + USD, webhooks for subscription events |
| Deployment | Vercel (frontend + API routes) | Zero-config, preview deployments, free tier sufficient at launch |
| Background jobs | Upstash QStash | Serverless cron for usage polling, no always-on server needed |
| Email | Resend | Developer-friendly, 3,000 free emails/month |
| Monitoring | Vercel Analytics + Sentry | Error tracking and performance |

---

## 2. System Architecture — High Level

```
User Browser
    |
    v
Next.js App (Vercel)
    |-- /dashboard      → reads from Supabase (usage_records table)
    |-- /api/connect    → stores encrypted API keys in Supabase
    |-- /api/alerts     → triggered by QStash cron
    |
    v
Upstash QStash (Cron — every 5 min)
    |
    v
Usage Polling Worker (Next.js API route or Edge Function)
    |-- Calls OpenAI Usage API
    |-- Calls Anthropic Usage API
    |-- Calls Replicate Usage API
    |-- Stores results in Supabase usage_records
    |-- Checks against budget_rules table
    |-- If threshold crossed → triggers alert via Resend + Slack webhook
    |
    v
Supabase (PostgreSQL)
    |-- users
    |-- api_connections (encrypted keys)
    |-- projects
    |-- budget_rules
    |-- usage_records
    |-- alert_log
```

---

## 3. API Integration Approach

**Method: Dashboard Polling (v1.0)**

Rather than building a proxy layer (which requires all traffic to route through Frugal's servers, adding latency and infrastructure complexity), v1.0 polls provider usage APIs on a 5-minute cron schedule.

Provider APIs used:
- OpenAI: `GET /v1/usage` (daily usage, token counts, cost estimates)
- Anthropic: Usage API (token counts per model)
- Replicate: `GET /v1/predictions` (filter by date, aggregate cost)
- fal.ai: Usage endpoint (if available, else estimate from prediction logs)

**Limitation:** 5-minute polling means budget enforcement has up to 5-minute lag. This is acceptable for v1.0 — real-time proxy enforcement is a v2.0 feature.

**v2.0 upgrade path:** Proxy layer (similar to Helicone's approach) for sub-second enforcement. Positioned as a Pro/Enterprise feature.

---

## 4. Data Model

```sql
-- Core tables

users (
  id uuid PRIMARY KEY,
  email text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now(),
  stripe_customer_id text,
  plan text DEFAULT 'free' -- free | starter | growth | pro
)

projects (
  id uuid PRIMARY KEY,
  user_id uuid REFERENCES users(id),
  name text NOT NULL,
  created_at timestamptz DEFAULT now()
)

api_connections (
  id uuid PRIMARY KEY,
  user_id uuid REFERENCES users(id),
  project_id uuid REFERENCES projects(id),
  provider text NOT NULL, -- openai | anthropic | replicate | falai
  api_key_encrypted text NOT NULL, -- AES-256 encrypted
  created_at timestamptz DEFAULT now(),
  last_polled_at timestamptz
)

usage_records (
  id uuid PRIMARY KEY,
  connection_id uuid REFERENCES api_connections(id),
  date date NOT NULL,
  model text,
  tokens_input bigint DEFAULT 0,
  tokens_output bigint DEFAULT 0,
  cost_usd numeric(10,6) DEFAULT 0,
  created_at timestamptz DEFAULT now()
)

budget_rules (
  id uuid PRIMARY KEY,
  project_id uuid REFERENCES projects(id),
  period text NOT NULL, -- daily | monthly
  limit_usd numeric(10,2) NOT NULL,
  alert_at_percent integer DEFAULT 80,
  action text DEFAULT 'alert', -- alert | throttle | block
  created_at timestamptz DEFAULT now()
)

alert_log (
  id uuid PRIMARY KEY,
  project_id uuid REFERENCES projects(id),
  rule_id uuid REFERENCES budget_rules(id),
  triggered_at timestamptz DEFAULT now(),
  spend_at_trigger numeric(10,2),
  limit_usd numeric(10,2),
  action_taken text,
  notified_via text[] -- email | slack
)
```

---

## 5. Security Requirements (OWASP Top 10 Checklist)

| Risk | Mitigation |
|------|-----------|
| A01 Broken Access Control | Row-level security (RLS) on all Supabase tables. Users can only read their own data. |
| A02 Cryptographic Failures | API keys encrypted with AES-256 at rest. Keys never logged. Displayed masked in UI. |
| A03 Injection | Supabase parameterized queries. No raw SQL from user input. |
| A05 Security Misconfiguration | Environment variables via Vercel. No secrets in codebase. |
| A07 Authentication Failures | Supabase Auth handles session management. JWT validation on every API route. |
| A09 Logging Failures | Sentry for error tracking. Alert log stored in DB for audit. |

**API key storage:** Keys are AES-256 encrypted before storage using a server-side secret. Keys are decrypted only during polling worker execution and never exposed to the client.

---

## 6. Performance Requirements

| Metric | Target |
|--------|--------|
| Dashboard load time (cached data) | < 1 second |
| Data freshness | ≤ 5 minutes stale |
| Alert trigger latency | ≤ 10 minutes after threshold crossed |
| API route response time (p95) | < 500ms |
| Uptime | 99.5% (Vercel SLA) |

---

## 7. Scaling Path

| Stage | Users | Infrastructure |
|-------|-------|---------------|
| Launch | 0–100 | Vercel free + Supabase free + Upstash free |
| Growth | 100–1,000 | Vercel Pro ($20/mo) + Supabase Pro ($25/mo) + Upstash Pay-as-you-go |
| Scale | 1,000–10,000 | Add dedicated polling service on Railway/GCP. Move to proxy architecture for real-time enforcement. |

---

## 8. v1.0 Delivery Scope

Week 1–2: Auth, Supabase schema, API connection flow, OpenAI polling
Week 3–4: Dashboard UI, budget rules, email alerts
Week 5: Anthropic + Replicate integration, Slack alerts, Stripe integration
Week 6: Alert log, testing, landing page, beta launch
