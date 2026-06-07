# Project State

## Project Reference

**Product:** Frugal — AI API cost management SaaS
**Core value:** Developers see unified AI spend across all providers and get automated guardrails before costs spiral
**Current focus:** Phase 5 — Stripe Billing

## Current Position

Phase: 5 of 7 (Stripe Billing)
Plan: 2 of 5 complete in current phase
Status: Plan 02 complete (Stripe checkout + portal routes). Plans 03–05 remaining.
Last activity: 2026-06-07 — Completed 05-02 (POST /api/stripe/checkout, POST /api/stripe/portal).

Progress: [████████░░] 70%

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

### Blockers/Concerns

- RESEND_API_KEY not yet set — email alerts won't fire until Phase 6
- QStash cron schedule not configured — manual poll only (dev GET endpoint exists)
- Gemini actual usage data requires Cloud Billing API + service account (not via API key) — out of scope V1
- Worker `.eq("is_active", true)` bug — FIXED in 03-04 (b406cec)
- STRIPE_SECRET_KEY + 4 price ID env vars not yet set — Stripe routes will throw until configured

## Session Continuity

Last session: 2026-06-07
Stopped at: Completed 05-02-PLAN.md (Stripe checkout + portal routes)
Resume file: None
