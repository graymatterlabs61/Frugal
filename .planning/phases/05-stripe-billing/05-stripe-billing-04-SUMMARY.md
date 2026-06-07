---
phase: 05-stripe-billing
plan: "04"
subsystem: ui
tags: [stripe, react, nextjs, server-component, billing]

# Dependency graph
requires:
  - phase: 05-02
    provides: /api/stripe/checkout and /api/stripe/portal API routes
  - phase: 05-03
    provides: Stripe webhook handler that writes plan to users table
provides:
  - Billing page server component — fetches plan + invoices server-side
  - BillingClient.tsx — interactive billing UI with checkout/portal/invoice history
affects: [05-05]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - Server component fetches data + passes serialized plain objects to client component
    - useSearchParams wrapped in Suspense boundary in Next.js 14 App Router
    - Invoice serialization: only required fields passed from Stripe.Invoice to client

key-files:
  created:
    - app/(dashboard)/settings/billing/BillingClient.tsx
  modified:
    - app/(dashboard)/settings/billing/page.tsx

key-decisions:
  - "BillingClientInner (uses useSearchParams) wrapped in Suspense inside exported BillingClient — avoids Next.js 14 dynamic rendering build error without adding Suspense in page.tsx"
  - "Invoice serialization uses type assertion (inv as { period_start?: number }) for period_start/period_end — Stripe SDK types vary by API version, assertion acceptable for display data"
  - "inv.id ?? '' handles Stripe Invoice id being string | null in some SDK versions"

patterns-established:
  - "Pattern: Server component owns all async data fetching; client component receives typed plain-object props"
  - "Pattern: isCurrent() helper maps DB plan values to UI plan card IDs (DB 'starter' = UI 'plus')"

requirements-completed: [F-20]

# Metrics
duration: 3min
completed: 2026-06-07
---

# Phase 5 Plan 04: Billing Page Server/Client Split Summary

**Billing page refactored from 'use client' stub to server component + BillingClient; real Stripe checkout, portal, and invoice history wired up**

## Performance

- **Duration:** ~3 min
- **Started:** 2026-06-07T10:11:46Z
- **Completed:** 2026-06-07T10:14:22Z
- **Tasks:** 2 of 3 complete (stopped at checkpoint:human-verify)
- **Files modified:** 2

## Accomplishments
- Created BillingClient.tsx as a 'use client' component receiving all data as props — no data fetching client-side
- Converted page.tsx from 'use client' stub to async server component with DB + Stripe API calls
- Plan cards now derive `current` dynamically from `currentPlan` prop (DB 'starter' maps to UI 'plus')
- Upgrade buttons call real `/api/stripe/checkout` endpoint and redirect to Stripe Checkout URL
- Portal button calls `/api/stripe/portal` and redirects to Stripe Customer Portal (only shown to paid users)
- Invoice table shows real Stripe invoice data with empty state for free users
- `useSearchParams` success toast wrapped in Suspense boundary for Next.js 14 App Router compatibility

## Task Commits

Each task was committed atomically:

1. **Task 1: Create BillingClient.tsx + Task 2: Convert page.tsx** - `a0a7c55` (feat)

_Note: Both tasks were committed together since they form one cohesive unit (client + server component pair)._

## Files Created/Modified
- `app/(dashboard)/settings/billing/BillingClient.tsx` — New 'use client' component; props-driven billing UI with checkout/portal/invoices
- `app/(dashboard)/settings/billing/page.tsx` — Rewritten as async server component; fetches plan, stripe_customer_id, serialized invoices

## Decisions Made
- BillingClientInner uses useSearchParams and is wrapped in a Suspense boundary inside the exported BillingClient component — this avoids adding Suspense in page.tsx while satisfying Next.js 14 App Router requirements
- Invoice `period_start`/`period_end` accessed via type assertion `(inv as { period_start?: number })` because the field visibility varies across Stripe SDK API versions
- `inv.id ?? ""` handles `string | null` id type in some Stripe SDK versions

## Deviations from Plan

None — plan executed exactly as written.

## Issues Encountered

None — TypeScript compiled cleanly (zero new errors; 4 pre-existing TS2367 errors in settings/integration/page.tsx and settings/SettingsClient.tsx are out of scope as noted in context).

## User Setup Required

None — no new external service configuration required for this plan. Existing Stripe env vars (STRIPE_SECRET_KEY, STRIPE_PRICE_*) must be set from prior plans.

## Checkpoint: Human Verification Required

Plan 04 is `autonomous: false`. Execution stopped at `checkpoint:human-verify` after completing Tasks 1 and 2.

### Visual + Checkout Flow Verification Steps

**Visual check:**
1. Navigate to `http://localhost:3000/settings/billing`
2. Verify page loads without console errors
3. Verify the current plan card shows "Current Plan" (Free for new test accounts)
4. Monthly/yearly toggle switches prices on Plus and Pro cards

**Checkout flow test (requires Stripe test mode keys):**
5. Click "Upgrade Plan" on the Plus card
6. Confirm redirect to Stripe Checkout page (not a toast.info)
7. Use test card: `4242 4242 4242 4242`, any future expiry, any CVC
8. Complete checkout
9. Confirm redirect back to `/settings/billing?success=1` with "Plan upgraded successfully!" toast
10. Refresh page — Plus card should now show "Current Plan"

**Portal test (after completing checkout):**
11. Confirm "Manage Plan / Cancel" button appears below plan cards
12. Click it — confirm redirect to Stripe Customer Portal

**Billing history:**
13. After completing a test checkout, refresh billing page
14. Confirm Billing History table shows the test invoice (not the old hardcoded mock rows)
15. Free plan users should see empty state: "No billing history yet..."

**Resume signal:** Type "approved" if checkout, portal, and billing history all work, or describe any issues seen.

## Next Phase Readiness
- Billing UI complete pending human verification
- Plan 05 (billing page polish + plan limits enforcement) can proceed after checkpoint approved

---
*Phase: 05-stripe-billing*
*Completed: 2026-06-07 (partial — checkpoint pending)*
