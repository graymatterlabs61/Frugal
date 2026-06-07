# Roadmap: Frugal

## Overview

Frugal is an AI API cost management SaaS. Developers building on OpenAI, Anthropic, Replicate, and fal.ai connect their API keys; Frugal polls usage every 5 minutes, tracks spend per project, enforces budget rules, and fires alerts before limits are hit. The build goes from a fully mocked dashboard to a production-ready product with real data, billing, and automated cost enforcement.

## Phases

- [x] **Phase 1: Foundation** - Auth, schema, middleware, encryption, Supabase clients
- [x] **Phase 2: Core APIs + Polling Worker** - Projects + connections CRUD, provider modules, polling worker, budget checker, alert service
- [ ] **Phase 3: Dashboard Real Data** - Wire all dashboard pages to real usage_records and alert_log — replace every hardcoded mock
- [ ] **Phase 4: Budget Rules API + UI** - Real CRUD API for budget_rules, wire project detail rules tab to DB, tier enforcement
- [x] **Phase 5: Stripe Billing** - Checkout, webhooks, plan updates, billing history from Stripe, tier enforcement in API routes (completed 2026-06-07)
- [ ] **Phase 6: Email Alerts + Slack** - Resend email templates, Slack webhook support, alert delivery end-to-end
- [ ] **Phase 7: Settings + QStash Cron + Polish** - Account/security/integration settings, QStash 5-min schedule, tier limits enforced everywhere, launch-ready

## Phase Details

<details>
<summary>✅ Completed Phases (1–2)</summary>

### Phase 1: Foundation
**Goal**: Auth pages (login, signup, forgot-password, reset-password, verify-email), Supabase client/server helpers, AES-256 encryption lib, middleware route protection, full DB schema migrations (001 + 002).
**Depends on**: Nothing
**Success Criteria**:
  1. User can sign up, verify email, log in, reset password
  2. Unauthenticated users redirected to /login by middleware
  3. API keys AES-256 encrypted before any DB write
  4. Schema migrations applied: users, projects, api_connections, usage_records, budget_rules, alert_log
**Plans**: Complete

### Phase 2: Core APIs + Polling Worker
**Goal**: Projects and connections REST API (GET/POST/DELETE), per-provider key validation and encryption on POST, polling worker (decrypt → fetch usage → upsert usage_records → update last_polled_at), budget checker, alert service (Resend email + Slack webhook stubs), poll API route (QStash-verified POST + dev GET).
**Depends on**: Phase 1
**Success Criteria**:
  1. User can create/list/delete projects via API
  2. User can add/list/delete/patch connections — key validated, encrypted, suffix stored
  3. Poll endpoint: fetches real OpenAI usage, upserts usage_records idempotently
  4. Budget checker reads budget_rules, writes to alert_log, deduplicates alerts
**Plans**: Complete

</details>

### Phase 3: Dashboard Real Data
**Goal**: Replace all mock/hardcoded data in dashboard, project detail, and alerts pages with live queries against usage_records and alert_log. Every number the user sees reflects their actual connected API usage.
**Depends on**: Phase 2
**Requirements**: F-07, F-08, F-10, F-18
**PRD**: prds/dashboard-real-data.md
**Success Criteria**:
  1. Dashboard stats (monthly spend, active projects, connection count, alert count) show real data from DB
  2. SpendChart renders real daily spend from usage_records — stacked bar per provider
  3. Top 3 projects by spend this month shown with "View all" link
  4. Recent Alerts section pulls from real alert_log rows
  5. Alerts page (/alerts) shows real alert_log data with correct status/severity
  6. Project detail page loads real project data, real connections with last_polled_at, real alert history
  7. Date range toggle (7d/30d/90d) controls chart window; calendar month/rolling-30 toggle on spend card
  8. worker.ts .eq("is_active") bug fixed
**Plans**: TBD

Sub-phases (4):
- [x] 03-01: DB query layer — lib/queries/dashboard.ts with all aggregation functions
- [ ] 03-02: Dashboard page — real stats, stacked SpendChart, top projects, recent alerts, empty state CTA
- [x] 03-03: Alerts page — real alert_log data, empty state
- [ ] 03-04: Project detail page — server component for stats, real connections tab, real alerts tab, worker bug fix

### Phase 4: Budget Rules API + UI
**Goal**: Full CRUD REST API for budget_rules. Wire project detail "Budget Rules" tab to real DB — create, list, delete rules persist. Tier enforcement: Free users cannot create rules; Plus gets alert+block; Pro gets throttle.
**Depends on**: Phase 3
**Requirements**: F-11, F-12, F-13, F-14, F-21
**PRD**: prds/budget-rules-api-ui.md
**Success Criteria**:
  1. POST /api/budget-rules creates rule in DB, validated by Zod, tier-checked
  2. GET /api/budget-rules?projectId=X lists rules for project
  3. DELETE /api/budget-rules/[id] removes rule
  4. Project detail Budget Rules tab creates/shows/deletes real rules — persists on refresh
  5. Free-tier users see "Upgrade to Plus" prompt instead of rule creation
  6. Plus users: alert + block only; Pro users: throttle also available
  7. budgetChecker.ts columns aligned with migration 003 schema
**Plans**: 5 plans

Sub-phases (5):
- [ ] 04-01-PLAN.md — Migration 004: rename budget_rules columns (period→budget_window, alert_at_percent→threshold_pct)
- [ ] 04-02-PLAN.md — lib/tier.ts: canCreateBudgetRules, canUseBlock, canUseThrottle feature gate functions
- [ ] 04-03-PLAN.md — /api/budget-rules route.ts (GET/POST) + /api/budget-rules/[id] (DELETE) with Zod + tier enforcement
- [ ] 04-04-PLAN.md — Wire project detail Budget Rules tab to real API + tier-gated UI + human verify checkpoint
- [ ] 04-05-PLAN.md — budgetChecker.ts + types.ts column alignment (budget_window, threshold_pct)

### Phase 5: Stripe Billing
**Goal**: Stripe checkout for Plus/Pro plans, webhook handler to update users.plan, billing history pulled from Stripe invoices, customer portal for cancellation/plan change.
**Depends on**: Phase 4
**Requirements**: F-20, F-21
**PRD**: prds/stripe-billing.md
**Success Criteria**:
  1. "Upgrade Plan" button launches Stripe Checkout, payment completes
  2. Webhook updates users.plan within seconds of successful checkout
  3. Subscription cancellation reverts plan to 'free' via webhook
  4. Billing page shows real Stripe invoice history
  5. Customer portal accessible for self-serve plan management
**Plans**: 5 plans

Plans:
- [ ] 05-01-PLAN.md — lib/stripe.ts singleton + PRICE_MAP + PLAN_LIMITS in lib/tier.ts
- [ ] 05-02-PLAN.md — POST /api/stripe/checkout + POST /api/stripe/portal
- [ ] 05-03-PLAN.md — POST /api/stripe/webhook (signature verify + 3 event handlers)
- [ ] 05-04-PLAN.md — Billing page server/client split with real invoices + checkout wiring
- [ ] 05-05-PLAN.md — Tier enforcement in POST /api/connections + POST /api/projects

### Phase 6: Email Alerts + Slack
**Goal**: Resend email templates for budget alerts (real RESEND_API_KEY, real sends). Slack webhook URL stored per project in settings. alertService.ts delivers both channels. End-to-end test: connect key → poll → budget rule triggers → email + Slack fires.
**Depends on**: Phase 5
**Requirements**: F-15, F-16, F-17
**PRD**: prds/email-alerts-slack.md
**Success Criteria**:
  1. Budget alert fires real email via Resend with correct project/spend/limit data
  2. Slack webhook URL configurable per project, stored in DB
  3. Alert fires to Slack when threshold crossed on project with webhook configured
  4. Same rule doesn't fire twice within 1-hour deduplication window
  5. alert_log.delivery_status records channel outcomes
**Plans**: 5 plans

Plans:
- [ ] 06-01-PLAN.md — Migration 005: projects.slack_webhook_url + alert_log.delivery_status jsonb
- [ ] 06-02-PLAN.md — alertService.ts: delivery_status tracking + RESEND_FROM_ADDRESS env var
- [ ] 06-03-PLAN.md — lib/polling/emailTemplates.ts: extract buildEmailHtml from alertService.ts
- [ ] 06-04-PLAN.md — budgetChecker.ts: real Slack URL from DB join + 1-hour dedup window
- [ ] 06-05-PLAN.md — PATCH /api/projects/[id] + Notifications tab with Slack webhook input

### Phase 7: Settings + QStash Cron + Polish
**Goal**: Account settings (name/email update), security settings (password change), integration settings (Slack webhook URL per project). QStash 5-minute cron schedule configured and live. All tier limits enforced (connection limits, project limits, history window). Launch-ready.
**Depends on**: Phase 6
**Requirements**: F-01, F-21, all V1 features
**PRD**: prds/settings-qstash-polish.md
**Success Criteria**:
  1. User can update display name and email in account settings
  2. User can change password in security settings
  3. QStash cron fires POST /api/poll every 5 minutes in production
  4. Free: 1 connection max, 1 project max, 7-day history enforced server-side
  5. Plus: 3 connections, 5 projects, 90-day history
  6. All "coming soon" toasts replaced or removed — no dead buttons
**Plans**: TBD

Sub-phases (5):
- [ ] 07-01: Account settings — name + email update via supabase.auth.updateUser
- [ ] 07-02: Security settings — password change via supabase.auth.updateUser
- [ ] 07-03: Tier enforcement — clamp history window in query layer, show limit counters in UI
- [ ] 07-04: QStash cron documentation + POLL_SECRET env var setup
- [ ] 07-05: UI polish — invoice download, remove dead buttons, .env.example, launch checklist

## Progress

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Foundation | - | Complete | 2026-06-03 |
| 2. Core APIs + Polling Worker | - | Complete | 2026-06-05 |
| 3. Dashboard Real Data | 2/4 | In progress | - |
| 4. Budget Rules API + UI | 0/5 | Planned | - |
| 5. Stripe Billing | 5/5 | Complete   | 2026-06-07 |
| 6. Email Alerts + Slack | 3/5 | In Progress|  |
| 7. Settings + QStash + Polish | 0/5 | Not started | - |
