# Project State

## Project Reference

**Product:** Frugal — AI API cost management SaaS
**Core value:** Developers see unified AI spend across all providers and get automated guardrails before costs spiral
**Current focus:** Phase 6 — Email Alerts + Slack

## Current Position

Phase: 6 of 7 (Email Alerts + Slack) — IN PROGRESS
Plan: 2 of 5 complete
Status: Plan 06-02 complete. alertService.ts updated with delivery_status tracking and RESEND_FROM_ADDRESS env var. Ready for 06-03 (Slack webhook validation API).
Last activity: 2026-06-07 — 06-02 executed (alertService.ts delivery tracking, ~5 min).

Progress: [████████░░] 72%

## Performance Metrics

**Velocity:**
- Total plans completed: 0 (phases 1-2 completed before GSD tracking)
- Average duration: N/A
- Total execution time: N/A

*Updated after each plan completion*

## Accumulated Context

### Decisions

- Phase 1: api_connections.project_id is nullable (project is optional for connections)
- Phase 2: fal.ai key validation is format-only (no cheap validation endpoint)
- Phase 2: provider DB value is 'falai' (not 'fal') — must match UI provider key
- Phase 2: api_key_suffix (last 4 chars) stored plaintext for display; encrypted key never returned
- [Phase 05]: Limit check placed before checkProviderKey (expensive network call) and before DB insert — fast 403 gate
- [Phase 05]: Plan read from users table per request (not JWT) to avoid stale plan values after tier changes

### Pending Todos

None yet.

### Decisions (03-03)

- Provider badge column removed from alerts page: alert_log has no direct provider column — omitting avoids multi-hop join for display-only data
- Empty state placed inside Alert History card (stats cards still show 0) — no special header zero-state needed
- Absolute datetime format used for alert timestamps (full history log, not live feed)

### Decisions (03-01)

- Supabase !inner join returns api_connections as array shape in SDK inferred types — use extractProvider() helper to normalize
- getDashboardStats uses in-JS reduce for monthly spend sum (no DB SUM RPC needed)
- getProjectStats fetches connection IDs first, filters usage_records via second query (no project_id on usage_records table)
- Budget limit lookup in getTopProjects uses single .in() query across all project IDs — no N+1

### Decisions (05-02)

- supabase_user_id embedded in both session.metadata and subscription_data.metadata — checkout.session.completed uses session metadata, customer.subscription.* events use subscription metadata
- customer_creation: 'always' only when no existing stripeCustomerId — prevents duplicate customer creation for returning users
- Portal returns 400 (not 404) when no stripe_customer_id — actionable error instructs user to upgrade first

### Decisions (05-01)

- stripe 22.2.0 pins apiVersion to "2026-05-27.dahlia" — plan specified "2026-04-22.dahlia" which is one release behind; must use 2026-05-27.dahlia
- PLAN_LIMITS uses Infinity for pro tier so callers do `count < limit` without special-casing unlimited
- growth plan mirrors starter in PLAN_LIMITS for forward compatibility (Phase 5 billing only sells starter and pro)

### Decisions (05-03)

- Stripe webhook must use Node.js runtime — Edge runtime re-encodes raw body, breaking HMAC signature verification
- request.text() mandatory over request.json() for same HMAC reason
- createServiceClient() (service role) required — no user session in webhook requests, RLS blocks UPDATE
- checkout.session.completed calls stripe.subscriptions.retrieve() because session.subscription is a string ID, not expanded

### Decisions (06-02)

- deliveryStatus mutated in-place by sendEmail/sendSlack (passed by reference) — no return values needed, cleaner call sites
- onboarding@resend.dev used as RESEND_FROM_ADDRESS fallback — allows email delivery in Resend sandbox before custom domain is verified
- notifiedVia array preserved alongside deliveryStatus — backward-compatible channel list for alert_log.notified_via consumers

### Decisions (06-01)

- slack_webhook_url is nullable text with no default — Slack alert delivery is opt-in per project
- delivery_status is nullable JSONB with no default — absence means alert predates column; shape: {email:{sent,messageId?,error?}, slack:{sent,error?}}
- No indexes on delivery_status — no query patterns require them at this stage

### Blockers/Concerns

- RESEND_API_KEY not yet set — email alerts won't fire until Phase 6
- QStash cron schedule not configured — manual poll only (dev GET endpoint exists)
- Gemini actual usage data requires Cloud Billing API + service account (not via API key) — out of scope V1
- Worker `.eq("is_active", true)` bug — FIXED in 03-04 (b406cec)
- STRIPE_SECRET_KEY + 4 price ID env vars not yet set — Stripe routes will throw until configured

## Session Continuity

Last session: 2026-06-07
Stopped at: Completed 06-02-PLAN.md (alertService.ts — delivery_status tracking + RESEND_FROM_ADDRESS)
Resume file: None
