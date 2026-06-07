---
phase: 05-stripe-billing
plan: "02"
subsystem: payments
tags: [stripe, checkout, billing-portal, subscription, nextjs-api-routes]

# Dependency graph
requires:
  - phase: 05-01
    provides: stripe singleton, PRICE_MAP, getPlanFromPriceId from lib/stripe.ts

provides:
  - POST /api/stripe/checkout — creates Stripe Checkout session for subscription upgrade
  - POST /api/stripe/portal — creates Stripe Customer Portal session for billing management

affects: [05-03, 05-04, billing-page, webhook-handler]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Auth-first API routes: supabase.auth.getUser() before any Stripe calls"
    - "Dual metadata embedding: supabase_user_id in both session.metadata and subscription_data.metadata for webhook coverage"
    - "Optional customer reuse: stripeCustomerId ?? undefined avoids passing null to Stripe customer field"

key-files:
  created:
    - app/api/stripe/checkout/route.ts
    - app/api/stripe/portal/route.ts
  modified: []

key-decisions:
  - "supabase_user_id embedded in both session.metadata and subscription_data.metadata — checkout.session.completed uses session metadata, customer.subscription.* events use subscription metadata"
  - "customer_creation: 'always' only when no existing stripeCustomerId — prevents duplicate customer creation for returning users"
  - "Portal returns 400 (not 404) when no stripe_customer_id — user has account but no billing; actionable error message instructs to upgrade first"

patterns-established:
  - "Stripe API route pattern: auth check → DB lookup for customer ID → Stripe call → return { url }"
  - "customer field set to stripeCustomerId ?? undefined (not null) so absent customer field omits the key entirely from Stripe request"

requirements-completed: [F-20]

# Metrics
duration: 1min
completed: 2026-06-07
---

# Phase 5 Plan 02: Stripe Checkout and Portal Routes Summary

**Stripe Checkout and Customer Portal POST endpoints with auth gates, Zod validation, and dual supabase_user_id metadata embedding for complete webhook coverage**

## Performance

- **Duration:** 1 min
- **Started:** 2026-06-07T09:55:10Z
- **Completed:** 2026-06-07T09:56:09Z
- **Tasks:** 2
- **Files modified:** 2

## Accomplishments

- POST /api/stripe/checkout: validates priceId via Zod, reuses existing stripe_customer_id when present, embeds supabase_user_id in both metadata paths
- POST /api/stripe/portal: returns 400 with actionable error if no billing account, creates portal session for subscription management
- Zero new TypeScript errors — only pre-existing TS2367 errors in unrelated settings files remain

## Task Commits

Each task was committed atomically:

1. **Task 1 + 2: Create Stripe checkout and portal API routes** - `cdb1bc5` (feat)

**Plan metadata:** TBD (docs: complete plan)

## Files Created/Modified

- `app/api/stripe/checkout/route.ts` — POST handler: auth + Zod validation + customer reuse logic + dual metadata embedding + returns { url }
- `app/api/stripe/portal/route.ts` — POST handler: auth + 400 if no stripe_customer_id + billing portal session + returns { url }

## Decisions Made

- Committed both route files in a single atomic commit (same plan, same feature area, no interleaving complexity)
- Portal uses 400 not 404 for missing stripe_customer_id: user is authenticated but hasn't subscribed yet; 400 with descriptive message is more actionable than 404
- `customer_creation: stripeCustomerId ? undefined : "always"` — passing undefined omits the field entirely vs passing null which Stripe may reject

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None — both files compiled cleanly on first pass. Pre-existing TS2367 errors in settings pages confirmed unchanged (4 errors, same files, same lines as documented in context).

## User Setup Required

**External services require manual configuration before these routes are functional:**

### Environment Variables

| Variable | Source |
|---|---|
| `STRIPE_SECRET_KEY` | Stripe Dashboard -> Developers -> API keys -> Secret key |
| `STRIPE_PRICE_STARTER_MONTHLY` | Stripe Dashboard -> Products -> Plus plan -> Monthly price ID |
| `STRIPE_PRICE_STARTER_YEARLY` | Stripe Dashboard -> Products -> Plus plan -> Yearly price ID |
| `STRIPE_PRICE_PRO_MONTHLY` | Stripe Dashboard -> Products -> Pro plan -> Monthly price ID |
| `STRIPE_PRICE_PRO_YEARLY` | Stripe Dashboard -> Products -> Pro plan -> Yearly price ID |
| `NEXT_PUBLIC_APP_URL` | Your app base URL (e.g., https://frugal.app) |

### Dashboard Configuration

- Create two products in Stripe Dashboard: "Plus" ($19/mo, $180/yr) and "Pro" ($49/mo, $468/yr). Copy the Price IDs into the env vars above.
- Activate Stripe Customer Portal: Stripe Dashboard -> Settings -> Billing -> Customer Portal -> Activate portal. Without this, the portal route will return a Stripe error.

## Next Phase Readiness

- Checkout and portal routes are complete and ready for 05-03 (webhook handler) and 05-04 (billing page UI)
- Webhook handler (05-03) can rely on both `metadata.supabase_user_id` and `subscription_data.metadata.supabase_user_id` being present on all new sessions
- Blocker remains: Stripe env vars not yet configured — routes will throw at runtime until STRIPE_SECRET_KEY is set

---
*Phase: 05-stripe-billing*
*Completed: 2026-06-07*
