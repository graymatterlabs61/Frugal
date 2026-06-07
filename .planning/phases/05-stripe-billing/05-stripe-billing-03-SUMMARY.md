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
duration: 1min
completed: 2026-06-07
---

# Phase 5 Plan 03: Stripe Webhook Handler Summary

**Stripe webhook handler at POST /api/stripe/webhook using Node.js runtime, raw body text, and service role client to process checkout and subscription events**

## Status: PAUSED — awaiting human verification

Task 1 is complete and committed. The plan is paused at the `checkpoint:human-verify` gate. See "User Verification Required" section below for setup and testing steps.

## Performance

- **Duration:** ~1 min
- **Started:** 2026-06-07T09:55:23Z
- **Completed (Task 1):** 2026-06-07T09:56:16Z
- **Tasks:** 1 of 2 complete (checkpoint gate reached)
- **Files modified:** 1

## Accomplishments

- Created `app/api/stripe/webhook/route.ts` with all three Stripe event handlers
- Set `export const runtime = "nodejs"` to prevent Edge re-encoding of request body
- Used `request.text()` (not `request.json()`) to preserve raw body for HMAC verification
- Used `createServiceClient()` to bypass RLS for users table UPDATE

## Task Commits

1. **Task 1: Create POST /api/stripe/webhook** - `f9fcd73` (feat)

## Files Created/Modified

- `app/api/stripe/webhook/route.ts` — Stripe webhook handler; verifies signatures, handles three event types, updates users.plan in Supabase via service role client

## Decisions Made

- Node.js runtime (not Edge) — Edge runtime re-encodes the request body, breaking Stripe's HMAC signature check
- `request.text()` not `request.json()` — json() also re-encodes the body
- `createServiceClient()` not `createClient()` — webhook has no user session, RLS would block UPDATE
- `stripe.subscriptions.retrieve()` called in `checkout.session.completed` handler because `session.subscription` is a string ID (not expanded), price details must be fetched separately

## Deviations from Plan

None — plan executed exactly as written.

## User Verification Required

**Task 2 (checkpoint:human-verify)** requires manual Stripe CLI testing. Follow these steps:

### Step 1: Add STRIPE_WEBHOOK_SECRET to .env.local

Run the Stripe CLI to get your local webhook secret:

```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook --print-secret
```

Copy the `whsec_...` value it prints and add it to `.env.local`:

```
STRIPE_WEBHOOK_SECRET=whsec_...
```

### Step 2: Start the dev server (Terminal 1)

```bash
npm run dev
```

### Step 3: Start Stripe CLI listener (Terminal 2)

```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

### Step 4: Test checkout.session.completed (Terminal 3)

```bash
stripe trigger checkout.session.completed
```

Expected: Stripe CLI shows `200 POST /api/stripe/webhook`

### Step 5: Test customer.subscription.deleted

```bash
stripe trigger customer.subscription.deleted
```

Expected: Stripe CLI shows `200 POST /api/stripe/webhook`

### Step 6: Test invalid signature rejection

```bash
curl -X POST http://localhost:3000/api/stripe/webhook -H "stripe-signature: bad" -d "{}"
```

Expected: response body contains `{"error":"..."}` and HTTP status 400

### Once verified

Reply with "approved" to continue to the next task, or describe any errors seen so they can be debugged.

## Issues Encountered

None — TypeScript compiled cleanly (4 pre-existing TS2367 errors in settings files, unrelated to this plan).

## Next Phase Readiness

- Webhook handler is complete and committed
- Once signature verified via Stripe CLI, plan 03 can be marked complete
- Plan 04 (billing portal / customer portal route) can proceed after verification

---
*Phase: 05-stripe-billing*
*Plan 03 partial completion: 2026-06-07*
