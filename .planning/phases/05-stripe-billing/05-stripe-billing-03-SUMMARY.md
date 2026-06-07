---
phase: 05-stripe-billing
plan: "03"
subsystem: payments
tags: [stripe, webhook, nodejs, supabase, service-role]

# Dependency graph
requires:
  - phase: 05-01
    provides: lib/stripe.ts with stripe client, PRICE_MAP, getPlanFromPriceId
  - phase: 05-01
    provides: lib/supabase/service.ts with createServiceClient
provides:
  - "POST /api/stripe/webhook — receives Stripe events and updates users.plan in Supabase"
  - "Handles checkout.session.completed, customer.subscription.updated, customer.subscription.deleted"
affects: [05-04, 05-05, settings-page, billing-page]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Webhook routes must use Node.js runtime (not Edge) — Edge re-encodes body, breaks Stripe HMAC"
    - "Webhook routes use request.text() not request.json() for same reason"
    - "Webhook routes use createServiceClient() (service role) — no user session available"

key-files:
  created:
    - app/api/stripe/webhook/route.ts
  modified: []

key-decisions:
  - "Node.js runtime mandatory for Stripe webhook — Edge runtime re-encodes raw body, breaking HMAC signature verification"
  - "request.text() mandatory over request.json() — json() also re-encodes body, same HMAC breakage"
  - "createServiceClient() used instead of anon client — RLS blocks UPDATE on users table without a user session (webhook is server-to-server)"
  - "checkout.session.completed calls stripe.subscriptions.retrieve() because session.subscription is a string ID, not an expanded object"

patterns-established:
  - "Stripe webhook pattern: runtime=nodejs + request.text() + constructEvent + service role client"

requirements-completed: [F-20]

# Metrics
duration: ~5min
completed: 2026-06-07
---

# Phase 5 Plan 03: Stripe Webhook Handler Summary

**Stripe webhook handler at POST /api/stripe/webhook using Node.js runtime, raw body text, and service role client to process checkout and subscription events**

## Performance

- **Duration:** ~5 min
- **Started:** 2026-06-07T09:55:23Z
- **Completed:** 2026-06-07
- **Tasks:** 2 of 2 complete
- **Files modified:** 1

## Accomplishments

- Created `app/api/stripe/webhook/route.ts` with all three Stripe event handlers
- Set `export const runtime = "nodejs"` to prevent Edge re-encoding of request body
- Used `request.text()` (not `request.json()`) to preserve raw body for HMAC verification
- Used `createServiceClient()` to bypass RLS for users table UPDATE
- Stripe CLI verification passed: valid events return 200, invalid signature returns 400

## Task Commits

1. **Task 1: Create POST /api/stripe/webhook** - `f9fcd73` (feat)
2. **Task 2: Checkpoint — Stripe CLI verification** - approved by user (200 on valid events, 400 on invalid signature)

**Plan metadata:** `d00f8d6` (docs: add webhook plan summary with Stripe CLI verification steps)

## Files Created/Modified

- `app/api/stripe/webhook/route.ts` — Stripe webhook handler; verifies signatures, handles three event types, updates users.plan in Supabase via service role client

## Decisions Made

- Node.js runtime (not Edge) — Edge runtime re-encodes the request body, breaking Stripe's HMAC signature check
- `request.text()` not `request.json()` — json() also re-encodes the body
- `createServiceClient()` not `createClient()` — webhook has no user session, RLS would block UPDATE
- `stripe.subscriptions.retrieve()` called in `checkout.session.completed` handler because `session.subscription` is a string ID (not expanded), price details must be fetched separately

## Deviations from Plan

None — plan executed exactly as written.

## Issues Encountered

None — TypeScript compiled cleanly (4 pre-existing TS2367 errors in settings files, unrelated to this plan). Stripe CLI tests all passed on first run.

## User Setup Required

STRIPE_WEBHOOK_SECRET must be set in `.env.local` for local development (obtained from `stripe listen --print-secret`) and in the Stripe Dashboard for production (Developers -> Webhooks -> Add endpoint). Production events to register: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`.

## Next Phase Readiness

- Webhook handler complete and verified via Stripe CLI
- Plan 04 (settings page / billing UI) can proceed
- stripe_customer_id and plan columns will be updated correctly when real payments flow through

---
*Phase: 05-stripe-billing*
*Completed: 2026-06-07*
