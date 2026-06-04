# Roadmap: Frugal

## Overview

Frugal is an AI API cost management SaaS. Developers building on OpenAI, Anthropic, Replicate, and fal.ai connect their API keys; Frugal polls usage every 5 minutes, tracks spend per project, enforces budget rules, and fires alerts before limits are hit. The build goes from a fully mocked dashboard to a production-ready product with real data, billing, and automated cost enforcement.

## Phases

- [x] **Phase 1: Foundation** - Auth, schema, middleware, encryption, Supabase clients
- [x] **Phase 2: Core APIs + Polling Worker** - Projects + connections CRUD, provider modules, polling worker, budget checker, alert service
- [ ] **Phase 3: Dashboard Real Data** - Wire all dashboard pages to real usage_records and alert_log — replace every hardcoded mock
- [ ] **Phase 4: Budget Rules API + UI** - Real CRUD API for budget_rules, wire project detail rules tab to DB, tier enforcement
- [ ] **Phase 5: Stripe Billing** - Checkout, webhooks, plan updates, billing history from Stripe, tier enforcement in API routes
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
**Success Criteria**:
  1. Dashboard stats (monthly spend, active projects, connection count, alert count) show real data from DB
  2. SpendChart renders real daily spend from usage_records for last 7 days
  3. Top Projects section shows real projects with real spend + budget (if budget_rule exists)
  4. Recent Alerts section pulls from real alert_log rows
  5. Alerts page (/alerts) shows real alert_log data with correct status/severity
  6. Project detail page loads real project data, real connections, real usage chart, real alert history
  7. "Last updated X minutes ago" timestamp reflects actual last_polled_at
**Plans**: TBD

Plans:
- [ ] 03-01: Dashboard page — real stats, spend chart, top projects, recent alerts
- [ ] 03-02: Alerts page + project detail page — real data, real connections tab, real alerts tab

### Phase 4: Budget Rules API + UI
**Goal**: Full CRUD REST API for budget_rules. Wire project detail "Budget Rules" tab to real DB — create, list, delete rules persist. Tier enforcement: Free users cannot create rules; Plus gets alert+block; Pro gets throttle.
**Depends on**: Phase 3
**Requirements**: F-11, F-12, F-13, F-14, F-21
**Success Criteria**:
  1. POST /api/budget-rules creates rule in DB, returns rule object
  2. GET /api/budget-rules?projectId=X lists rules for project
  3. DELETE /api/budget-rules/[id] removes rule
  4. Project detail Budget Rules tab creates/shows/deletes real rules
  5. Free-tier users see upgrade prompt instead of rule creation
  6. Budget checker uses real rules from DB and fires real alerts
**Plans**: TBD

Plans:
- [ ] 04-01: Budget rules API (GET/POST/DELETE) + tier enforcement
- [ ] 04-02: Wire project detail rules tab to real API

### Phase 5: Stripe Billing
**Goal**: Stripe checkout for Plus/Pro plans, webhook handler to update users.plan, billing history pulled from Stripe invoices, customer portal for cancellation/plan change.
**Depends on**: Phase 4
**Requirements**: F-20, F-21
**Success Criteria**:
  1. Clicking "Upgrade Plan" launches Stripe Checkout
  2. Successful checkout updates users.plan in DB via webhook
  3. Billing history table shows real Stripe invoices
  4. Cancelled subscription reverts users.plan to 'free'
  5. Tier limits enforced in all API routes based on users.plan
**Plans**: TBD

Plans:
- [ ] 05-01: Stripe products/prices, checkout session API, webhook handler
- [ ] 05-02: Billing page — real invoices from Stripe, customer portal link

### Phase 6: Email Alerts + Slack
**Goal**: Resend email templates for budget alerts (real RESEND_API_KEY, real sends). Slack webhook URL stored per project in settings. alertService.ts delivers both channels. End-to-end test: connect key → poll → budget rule triggers → email + Slack fires.
**Depends on**: Phase 5
**Requirements**: F-15, F-16, F-17
**Success Criteria**:
  1. Budget alert fires real email via Resend with correct project/spend/limit data
  2. Slack webhook URL configurable per project in settings
  3. Alert fires to Slack when budget threshold crossed
  4. Alert deduplication: same rule doesn't fire twice in 1-hour window
  5. alert_log records delivery_status for each channel
**Plans**: TBD

Plans:
- [ ] 06-01: Resend email template + real delivery
- [ ] 06-02: Slack webhook project settings + alert delivery

### Phase 7: Settings + QStash Cron + Polish
**Goal**: Account settings (name/email update), security settings (password change), integration settings (Slack webhook URL per project). QStash 5-minute cron schedule configured and live. All tier limits enforced (connection limits, project limits, history window). Launch-ready.
**Depends on**: Phase 6
**Requirements**: F-01, F-21, all V1 features
**Success Criteria**:
  1. User can update display name and email in account settings
  2. User can change password in security settings
  3. QStash cron fires POST /api/poll every 5 minutes in production
  4. Free tier: 1 connection max, 1 project max, 7-day history enforced server-side
  5. Plus tier: 3 connections, 5 projects, 90-day history
  6. All "coming soon" toasts replaced with real functionality or removed
**Plans**: TBD

Plans:
- [ ] 07-01: Account + security settings (real Supabase updates)
- [ ] 07-02: QStash cron setup + tier enforcement in all API routes + final polish

## Progress

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Foundation | - | Complete | 2026-06-03 |
| 2. Core APIs + Polling Worker | - | Complete | 2026-06-05 |
| 3. Dashboard Real Data | 0/2 | Not started | - |
| 4. Budget Rules API + UI | 0/2 | Not started | - |
| 5. Stripe Billing | 0/2 | Not started | - |
| 6. Email Alerts + Slack | 0/2 | Not started | - |
| 7. Settings + QStash + Polish | 0/2 | Not started | - |
