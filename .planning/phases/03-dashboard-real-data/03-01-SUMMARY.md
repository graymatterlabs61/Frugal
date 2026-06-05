---
phase: 03-dashboard-real-data
plan: "01"
subsystem: database
tags: [supabase, typescript, dashboard, queries, aggregation]

# Dependency graph
requires:
  - phase: 02-polling-worker
    provides: usage_records, alert_log, api_connections tables populated by polling worker
provides:
  - lib/queries/dashboard.ts with 7 typed async functions covering all dashboard data needs
affects:
  - 03-02-PLAN.md (main dashboard page uses getDashboardStats, getDailySpend, getTopProjects, getRecentAlerts)
  - 03-03-PLAN.md (alerts page uses getRecentAlerts)
  - 03-04-PLAN.md (project detail page uses getProjectStats, getProjectConnections, getProjectAlerts)

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Centralized data access layer: all dashboard queries in lib/queries/dashboard.ts, never touching Supabase directly from pages"
    - "SupabaseClient passed as argument (not created internally) — caller controls auth context"
    - "Complete date skeleton built in TypeScript then filled from DB results — guarantees no date gaps in charts"
    - "Supabase join returns api_connections as array or object depending on SDK version — handled via extractProvider helper"

key-files:
  created:
    - lib/queries/dashboard.ts
  modified: []

key-decisions:
  - "Supabase join on !inner returns api_connections as either an object or an array depending on context — use extractProvider() to normalize"
  - "getDashboardStats uses in-JS reduce (not DB SUM) for monthly spend to avoid Supabase aggregate API complexity"
  - "getProjectStats fetches connection IDs first, then filters usage_records in a second query (no project_id on usage_records)"
  - "getTopProjects uses project_monthly_spend view + single budget_rules IN query — no N+1"
  - "Severity: >=100% = critical, >=80% = warning, else info; Type: action_taken=block = Budget Limit, else Budget Threshold"

patterns-established:
  - "Query pattern: pass SupabaseClient + userId into every function, never call createClient() inside query file"
  - "Error pattern: log with console.error and return safe default (empty array, null, or zero-filled struct) on query failure"
  - "Date math: all UTC-based, no date-fns dependency needed for simple operations"

requirements-completed:
  - F-07
  - F-08
  - F-10
  - F-18

# Metrics
duration: 3min
completed: 2026-06-05
---

# Phase 3 Plan 01: Dashboard Queries Summary

**Typed Supabase data access layer (7 async functions) covering all dashboard, alerts, and project detail data needs — with provider pivot, date-range skeletons, and alert severity computation**

## Performance

- **Duration:** 3 min
- **Started:** 2026-06-05T17:31:25Z
- **Completed:** 2026-06-05T17:34:21Z
- **Tasks:** 2
- **Files modified:** 1 (created)

## Accomplishments

- Created `lib/queries/dashboard.ts` from scratch as the sole data access layer for Phase 3
- Implemented 7 fully typed async functions covering stats, charts, top projects, alerts, and project detail
- Built provider-pivot logic with complete date skeletons ensuring zero-gap chart data

## Task Commits

Each task was committed atomically:

1. **Task 1: Stats and chart functions** - `70f75ac` (feat)
2. **Task 2: Alert and project query functions** - `2e14a9e` (feat)

**Plan metadata:** (pending final docs commit)

## Files Created/Modified

- `lib/queries/dashboard.ts` - 7 exported typed async functions: getDashboardStats, getDailySpend, getTopProjects, getRecentAlerts, getProjectStats, getProjectConnections, getProjectAlerts

## Decisions Made

- Supabase `!inner` join returns `api_connections` as an array in the SDK's inferred type even for a many-to-one relationship. Used `as unknown as UsageRecordWithConnection[]` cast and a `extractProvider()` helper that handles both object and array shapes.
- `getDashboardStats` uses in-JS `reduce` for the monthly spend sum rather than a Supabase RPC call, keeping the code simple and avoiding a separate database function.
- `getProjectStats` fetches the project's connection IDs first, then uses those to filter `usage_records`, because `usage_records` has no `project_id` column — the plan specifies this exact approach.
- Budget limit lookup in `getTopProjects` uses a single `.in()` query across all 3 project IDs rather than 3 separate queries, avoiding N+1.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

**TypeScript cast on Supabase join result:** The `!inner` join on `api_connections` caused a TypeScript mismatch because Supabase's inferred return type marks `api_connections` as `{ provider: any }[]` (array) while the interface expected a single object. Fixed by defining a union type (`{ provider: string } | { provider: string }[] | null`) and casting via `as unknown as UsageRecordWithConnection[]`. This is a known Supabase SDK typing quirk, not a logic error.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- All 7 query functions are ready. Plans 02, 03, and 04 can import directly from `lib/queries/dashboard.ts`.
- The `project_monthly_spend` Supabase view must exist in the database for `getTopProjects` to work — verify it was created in Phase 1/2 migrations.
- Reminder from STATE.md: `worker.ts` line 16 queries `.eq("is_active", true)` but column is `status = 'active'` — this bug should be fixed in Phase 3 execution (03-CONTEXT.md confirms it is in scope).

---

*Phase: 03-dashboard-real-data*
*Completed: 2026-06-05*
