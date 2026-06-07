---
phase: 05-stripe-billing
plan: "01"
subsystem: payments
tags: [stripe, billing, feature-gates, plan-limits]

# Dependency graph
requires:
  - phase: 04-budget-rules-api-ui
    provides: lib/tier.ts with canCreateBudgetRules, canUseBlock, canUseThrottle
provides:
  - Stripe singleton client with 2026-05-27.dahlia apiVersion
  - PRICE_MAP mapping 4 Stripe price IDs to DB plan values
  - getPlanFromPriceId helper falling back to 'free' for unknown IDs
  - PLAN_LIMITS constant with per-plan connection and project caps
  - getConnectionLimit and getProjectLimit helper functions
affects: [05-02, 05-03, 05-05, api/connections, api/projects]

# Tech tracking
tech-stack:
  added: [stripe@^22.2.0]
  patterns: [singleton Stripe client, PRICE_MAP for price-to-plan mapping, PLAN_LIMITS as single source of truth for resource caps]

key-files:
  created: [lib/stripe.ts]
  modified: [lib/tier.ts, package.json, package-lock.json]

key-decisions:
  - "stripe 22.2.0 requires apiVersion 2026-05-27.dahlia — plan specified 2026-04-22.dahlia which is one release behind"
  - "PLAN_LIMITS uses Infinity for pro connections/projects to allow unlimited without special-casing in callers"
  - "growth plan mirrors starter in PLAN_LIMITS for forward compatibility even though Phase 5 billing only sells starter and pro"

patterns-established:
  - "Stripe singleton: create once in lib/stripe.ts, import everywhere — avoids multiple Stripe instances"
  - "PRICE_MAP: all env var price IDs mapped at module load time, getPlanFromPriceId falls back to free"
  - "Plan limits: getConnectionLimit/getProjectLimit helpers accept any string and fall back to free tier"

requirements-completed: [F-20, F-21]

# Metrics
duration: 2min
completed: 2026-06-07
---

# Phase 5 Plan 01: Stripe Billing Foundation Summary

**Stripe singleton + PRICE_MAP for 4 price IDs, and PLAN_LIMITS with per-plan connection/project caps appended to lib/tier.ts**

## Performance

- **Duration:** 2 min
- **Started:** 2026-06-07T09:51:37Z
- **Completed:** 2026-06-07T09:53:07Z
- **Tasks:** 3
- **Files modified:** 4

## Accomplishments
- Installed stripe@^22.2.0 with bundled TypeScript types (no @types/stripe needed)
- Created lib/stripe.ts with singleton client, PRICE_MAP covering starter monthly/yearly + pro monthly/yearly, and getPlanFromPriceId falling back to 'free'
- Appended PLAN_LIMITS, getConnectionLimit, getProjectLimit to lib/tier.ts without touching the 3 existing functions

## Task Commits

All 3 tasks were completed in a single atomic commit:

1. **Task 1: Install stripe package** - `a6fa948` (feat)
2. **Task 2: Create lib/stripe.ts** - `a6fa948` (feat)
3. **Task 3: Add PLAN_LIMITS to lib/tier.ts** - `a6fa948` (feat)

## Files Created/Modified
- `lib/stripe.ts` - Stripe singleton, PRICE_MAP for 4 price IDs, getPlanFromPriceId helper
- `lib/tier.ts` - PLAN_LIMITS constant + getConnectionLimit + getProjectLimit appended (existing functions untouched)
- `package.json` - stripe@^22.2.0 added to dependencies
- `package-lock.json` - lockfile updated for stripe install

## Decisions Made
- Used apiVersion `2026-05-27.dahlia` instead of plan-specified `2026-04-22.dahlia` — the installed stripe 22.2.0 bundle pins to the newer version and TypeScript rejects the older string
- PLAN_LIMITS uses `Infinity` for pro tier so callers can do `count < limit` without special-casing unlimited plans
- growth plan mirrors starter limits for forward compatibility

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Updated apiVersion to match stripe 22.2.0 bundle**
- **Found during:** Task 2 (Create lib/stripe.ts), TypeScript compile check
- **Issue:** Plan specified `"2026-04-22.dahlia"` but stripe 22.2.0 ships with `"2026-05-27.dahlia"` pinned. TypeScript error TS2322 — the type literal `"2026-04-22.dahlia"` is not assignable to `"2026-05-27.dahlia"`.
- **Fix:** Changed apiVersion string to `"2026-05-27.dahlia"` to match the installed package's bundled type declarations
- **Files modified:** lib/stripe.ts
- **Verification:** `npx tsc --noEmit` — only pre-existing TS2367 errors in settings pages remain; no errors from lib/stripe.ts
- **Committed in:** a6fa948

---

**Total deviations:** 1 auto-fixed (Rule 1 - wrong apiVersion string for installed package version)
**Impact on plan:** Required fix — the plan's apiVersion was one stripe release behind. All other code matches plan exactly.

## Issues Encountered
- Pre-existing TS2367 errors in `app/(dashboard)/settings/integration/page.tsx` and `app/(dashboard)/settings/SettingsClient.tsx` (string comparison overlap on plan UI labels) remain unchanged — these are out of scope for this plan.

## User Setup Required
The following environment variables must be added before Phase 5 billing routes are used:

- `STRIPE_SECRET_KEY` — Stripe secret key (`sk_live_...` or `sk_test_...`)
- `STRIPE_PRICE_STARTER_MONTHLY` — Price ID for Plus plan monthly (`price_...`)
- `STRIPE_PRICE_STARTER_YEARLY` — Price ID for Plus plan yearly (`price_...`)
- `STRIPE_PRICE_PRO_MONTHLY` — Price ID for Pro plan monthly (`price_...`)
- `STRIPE_PRICE_PRO_YEARLY` — Price ID for Pro plan yearly (`price_...`)

These are consumed by lib/stripe.ts at module load time. The module will throw `STRIPE_SECRET_KEY is not set` at startup if the key is missing.

## Next Phase Readiness
- lib/stripe.ts is the shared import for all Phase 5 billing API routes (05-02 checkout, 05-03 webhook, 05-05 enforcement)
- lib/tier.ts PLAN_LIMITS is ready for import in POST /api/connections and POST /api/projects
- TypeScript compiles cleanly for all new code

---
*Phase: 05-stripe-billing*
*Completed: 2026-06-07*
