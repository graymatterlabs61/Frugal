# Project State

## Project Reference

**Product:** Frugal — AI API cost management SaaS
**Core value:** Developers see unified AI spend across all providers and get automated guardrails before costs spiral
**Current focus:** Phase 7 — Settings + QStash Cron + Polish (last remaining phase)

## Current Position

Phase: 6 of 7 complete — phases 1–6 all done (3 and 4 were complete in git but unmarked until 2026-06-10 audit)
Plan: Phase 7 not started (0/5)
Status: 2026-06-10 cleanup session — committed lib/email module (13 branded templates, wired into stripe webhook + auth callback + alertService), fixed TS2367 settings errors (typecheck now clean), made welcome email idempotent via user_metadata flag, added admin-key usage fetchers (OpenAI org Usage API fallback + Anthropic Admin API), created .env.example, synced ROADMAP.md to git reality.
Last activity: 2026-06-10 — problem-fix session (see commits 35b9172..HEAD).

Progress: [█████████░] 90%

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
- [Phase 06-05]: Zod v4 z.union([z.url(), z.literal(''), z.null()]).optional() handles all valid slack_webhook_url states in PATCH handler
- [Phase 06-05]: PATCH /api/projects/[id] coerces empty string to null so users can clear slack_webhook_url via the UI

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

### Decisions (06-04)

- 1-hour rolling dedup window prevents alert re-fire within 60 minutes regardless of budget period boundary (replaces midnight-reset period-based dedup)
- getPeriodStart() preserved unchanged — still required by getProjectSpend() for spend calculation; only removed from the dedup query

### Decisions (06-03)

- AlertPayload duplicated in emailTemplates.ts (not imported from alertService.ts) — avoids circular dependency; emailTemplates is imported by alertService, so re-importing from alertService would create a cycle

### Decisions (06-02)

- deliveryStatus mutated in-place by sendEmail/sendSlack (passed by reference) — no return values needed, cleaner call sites
- onboarding@resend.dev used as RESEND_FROM_ADDRESS fallback — allows email delivery in Resend sandbox before custom domain is verified
- notifiedVia array preserved alongside deliveryStatus — backward-compatible channel list for alert_log.notified_via consumers

### Decisions (06-01)

- slack_webhook_url is nullable text with no default — Slack alert delivery is opt-in per project
- delivery_status is nullable JSONB with no default — absence means alert predates column; shape: {email:{sent,messageId?,error?}, slack:{sent,error?}}
- No indexes on delivery_status — no query patterns require them at this stage

### Blockers/Concerns

- RESEND_API_KEY not yet set — emails won't send until configured (see .env.example)
- QStash cron schedule not configured — manual poll only (dev GET endpoint exists)
- Gemini actual usage data requires Cloud Billing API + service account (not via API key) — out of scope V1
- STRIPE_SECRET_KEY + 4 price ID env vars not yet set — Stripe routes will throw until configured
- PRODUCT: real usage data only flows for OpenAI (legacy or admin key) and Anthropic (admin key, added 2026-06-10). Groq/Replicate/fal.ai = key ping only. "Unified multi-provider spend" promise needs validation with real admin keys before launch
- PRODUCT: per-user attribution (Pro tier unlock, US-005) and block/throttle (US-008) cannot be delivered by polling architecture alone — see PRICING.md open questions 2–4; needs decision before launch marketing

## Session Continuity

Last session: 2026-06-10
Stopped at: Problem-fix session complete (email module committed, TS errors fixed, welcome email idempotent, admin-key fetchers, .env.example, docs synced). Next: Phase 7.
Resume file: None
