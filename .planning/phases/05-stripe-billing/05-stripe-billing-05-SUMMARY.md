---
phase: 05-stripe-billing
plan: "05"
subsystem: api
tags: [supabase, tier-limits, resource-enforcement, billing]

# Dependency graph
requires:
  - phase: 05-01
    provides: getConnectionLimit and getProjectLimit exported from lib/tier.ts

provides:
  - POST /api/connections returns 403 with upgrade message when user is at their plan's connection limit
  - POST /api/projects returns 403 with upgrade message when user is at their plan's project limit
  - Plan lookup reads from users table (not JWT) for authoritative plan value

affects:
  - frontend connection creation flow (must handle 403 "Connection limit reached")
  - frontend project creation flow (must handle 403 "Project limit reached")

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Plan gate pattern: query users.plan → call tier fn → count existing → return 403 before expensive work"
    - "Supabase count query: .select('id', { count: 'exact', head: true }) returns count without fetching rows"

key-files:
  created: []
  modified:
    - app/api/connections/route.ts
    - app/api/projects/route.ts

key-decisions:
  - "Limit check placed BEFORE checkProviderKey (expensive network call) and before DB insert — fast 403 gate"
  - "Plan read from users table per request (not JWT) — authoritative, no stale plan value risk"
  - "Infinity for pro tier means (count >= Infinity) is always false — no special-case branch needed"

patterns-established:
  - "Plan gate: fetch plan from DB, call tier fn, count existing resources, return 403 if at limit — then proceed"

requirements-completed:
  - F-21

# Metrics
duration: 3min
completed: 2026-06-07
---

# Phase 05 Plan 05: Plan-Based Resource Limit Enforcement Summary

**Server-side 403 gates added to POST /api/connections and POST /api/projects, reading users.plan and calling getConnectionLimit/getProjectLimit from lib/tier.ts before any expensive operations**

## Performance

- **Duration:** 3 min
- **Started:** 2026-06-07T10:11:39Z
- **Completed:** 2026-06-07T10:14:20Z
- **Tasks:** 2
- **Files modified:** 2

## Accomplishments

- POST /api/connections now enforces free (1), starter/growth (3), pro (unlimited) connection limits
- POST /api/projects now enforces free (1), starter/growth (5), pro (unlimited) project limits
- Both limit checks are fast gates placed before expensive operations (provider key validation / DB insert)

## Task Commits

Both tasks committed atomically in a single feat commit:

1. **Task 1: Connection limit enforcement** - `2ac8941` (feat)
2. **Task 2: Project limit enforcement** - `2ac8941` (feat)

**Plan metadata:** (docs commit below)

## Files Created/Modified

- `app/api/connections/route.ts` — Added `getConnectionLimit` import + limit check block after Zod parse, before `checkProviderKey`
- `app/api/projects/route.ts` — Added `getProjectLimit` import + limit check block after Zod parse, before DB insert

## Decisions Made

- Limit check placed before `checkProviderKey` (network call to validate key) — fast 403 gate avoids unnecessary provider API calls
- Plan read from `users` table per request, not from JWT/session — avoids stale plan values after upgrade/downgrade
- `userData?.plan ?? "free"` fallback ensures unknown or missing plan values default to the most restrictive tier

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

Pre-existing TS2367 errors in settings files (noted in context, not fixed). Zero new TypeScript errors introduced.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Tier limit enforcement is complete. Free users are hard-blocked from exceeding 1 connection and 1 project at the API layer.
- Frontend connection/project creation UIs should handle 403 responses and surface the upgrade message to users.
- Phase 5 plans complete: lib/tier.ts + Stripe checkout + webhook + customer portal + resource limits.

---
*Phase: 05-stripe-billing*
*Completed: 2026-06-07*
