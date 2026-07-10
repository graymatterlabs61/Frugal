# ARCHITECTURE — Frugal
## System Architecture Document
**Version:** 1.0 | **Date:** June 2026 | **Author:** Nilesh Kumar / GML-IOS v2.0

---

## 1. C4 Model

### Level 1 — Context

```
[Developer / AI Builder]
        |
        | uses
        v
[Frugal Web App]
        |
        |-- reads usage from --> [OpenAI API]
        |-- reads usage from --> [Anthropic API]
        |-- reads usage from --> [Replicate API]
        |-- reads usage from --> [fal.ai API]
        |-- sends alerts via --> [Resend (Email)]
        |-- sends alerts via --> [Slack Webhooks]
        |-- processes payments via --> [Stripe]
```

---

### Level 2 — Containers

```
Browser Client (Next.js)
    - Dashboard, Budget Rules, Alert Log, Settings
    - Server-side rendered for fast initial load
    - Tailwind + ShadCN/UI components

Next.js API Routes (Vercel Edge / Serverless)
    - /api/connect       - Store & validate API connections
    - /api/dashboard     - Aggregate usage data for display
    - /api/rules         - CRUD for budget rules
    - /api/webhooks/stripe - Handle subscription events

Upstash QStash (Cron)
    - Every 5 minutes: trigger polling worker
    - Serverless, no always-on infrastructure

Polling Worker (Next.js API Route)
    - Fetches usage from each connected provider API
    - Writes to usage_records in Supabase
    - Checks usage against budget_rules
    - Fires alerts when thresholds are crossed

Supabase
    - PostgreSQL: all application data
    - Auth: user sessions and OAuth
    - Row-level security enforced on all tables

Redis (Upstash)
    - Rate limit tracking for provider API calls
    - Cache for dashboard queries (5-min TTL)

Stripe
    - Subscription management
    - Webhook events for plan changes
```

---

### Level 3 — Component (Polling Worker)

```
PollingWorker
    |
    |-- ConnectionRepository.getActiveConnections()
    |       Returns all api_connections where last_polled_at < now() - 5min
    |
    |-- For each connection:
    |       ProviderClient.fetchUsage(connection)
    |           OpenAIClient / AnthropicClient / ReplicateClient / FalClient
    |
    |-- UsageRepository.upsertRecord(usage_data)
    |
    |-- BudgetChecker.evaluate(project_id)
    |       Sums usage for current period
    |       Compares to budget_rules
    |       If threshold crossed: AlertService.fire()
    |
    |-- AlertService.fire(rule, spend, project)
    |       EmailAlert via Resend
    |       SlackAlert via webhook (if configured)
    |       Writes to alert_log
```

---

## 2. Key Architectural Decisions

### ADR-001: Polling vs Proxy

**Decision:** Use dashboard polling (pull from provider APIs) for v1.0, not a proxy layer.

**Rationale:** A proxy requires all user API traffic to route through Frugal's servers, adding latency, infrastructure cost, and a critical point of failure. At 0–100 users, this complexity is not justified. Polling achieves 95% of the value (visibility + alerts) at 10% of the infrastructure cost.

**Trade-off accepted:** Up to 5-minute lag in budget enforcement. Communicated clearly to users.

**v2.0 path:** Optional proxy mode for users who need real-time enforcement. Positioned as Growth/Pro feature.

---

### ADR-002: Supabase over custom PostgreSQL

**Decision:** Use Supabase managed PostgreSQL with built-in Auth and RLS.

**Rationale:** Nilesh has deep Supabase production experience (Juko, Convrsly). RLS eliminates an entire class of authorization bugs. Auth is handled without custom JWT logic. Cost: $0–25/month at launch scale.

---

### ADR-003: Upstash for serverless cron

**Decision:** Use Upstash QStash for background polling jobs instead of a dedicated worker server.

**Rationale:** Vercel does not support long-running background processes. QStash provides reliable cron scheduling with retry logic at $0 for the first 500 messages/day — sufficient for 100 connected accounts at 5-minute polling intervals (288 polls/day/account would need batching at scale).

---

## 3. Scaling Path: 100 to 10,000 Users

| Milestone | Bottleneck | Solution |
|-----------|-----------|---------|
| 100 users | QStash message limits | Batch polling per provider per run |
| 500 users | Supabase connection limits | Supabase Pro + PgBouncer |
| 1,000 users | Polling latency increases | Dedicated polling service on Railway |
| 5,000 users | Dashboard query performance | Read replicas + materialized views |
| 10,000 users | Provider API rate limits | Proxy architecture, request queuing |

---

## 4. Infrastructure Cost at Key Stages

| Stage | Monthly Cost |
|-------|-------------|
| 0–50 users | ~$0 (all free tiers) |
| 50–200 users | ~$50–80 (Vercel Pro + Supabase Pro) |
| 200–1,000 users | ~$150–300 (add Upstash paid + Railway worker) |
| 1,000+ users | ~$500+ (review and optimize per bottleneck) |
