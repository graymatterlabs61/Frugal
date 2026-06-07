---
phase: 06-email-alerts-slack
plan: "04"
subsystem: api
tags: [supabase, slack, budget-checker, deduplication, typescript]

requires:
  - phase: 06-01
    provides: slack_webhook_url column on projects table
  - phase: 06-02
    provides: fireAlert() in alertService.ts accepting slackWebhookUrl parameter
  - phase: 06-03
    provides: emailTemplates.ts extraction (alertService import chain complete)

provides:
  - budgetChecker.ts fetches real slack_webhook_url from DB via projects join
  - fireAlert receives actual Slack webhook URL instead of hardcoded null
  - Deduplication uses 1-hour rolling window (not midnight-reset period boundary)

affects: [polling-worker, alert-delivery, slack-integration]

tech-stack:
  added: []
  patterns:
    - "Rolling window dedup: new Date(Date.now() - 60*60*1000).toISOString() for 1-hour alert suppression"
    - "Inline type cast extends BudgetRule with joined columns (projects.slack_webhook_url: string | null)"

key-files:
  created: []
  modified:
    - lib/polling/budgetChecker.ts

key-decisions:
  - "1-hour rolling dedup window prevents alert re-fire within 60 minutes regardless of budget period boundary"
  - "getPeriodStart() preserved unchanged — still required by getProjectSpend() for spend calculation"

patterns-established:
  - "DB join columns require both select string update AND inline type cast update to avoid TypeScript any usage"

requirements-completed: [F-16, F-17]

duration: 5min
completed: 2026-06-07
---

# Phase 06 Plan 04: budgetChecker.ts Slack URL + 1-Hour Dedup Summary

**budgetChecker.ts now fetches real slack_webhook_url via DB join and uses a 1-hour rolling dedup window instead of a midnight-reset period boundary**

## Performance

- **Duration:** ~5 min
- **Started:** 2026-06-07T17:18:26Z
- **Completed:** 2026-06-07T17:23:22Z
- **Tasks:** 1
- **Files modified:** 1

## Accomplishments

- Added `slack_webhook_url` to the budget_rules projects join so Slack webhook URL is fetched in a single existing query
- Extended the inline type cast for the rules array to include `slack_webhook_url: string | null`
- Replaced hardcoded `slackWebhookUrl: null` with `project.slack_webhook_url ?? null` so Slack alerts now fire when a webhook is configured
- Replaced period-based dedup (`.gte("triggered_at", getPeriodStart(...))`) with 1-hour rolling window (`Date.now() - 60 * 60 * 1000`) so a triggered alert suppresses re-firing for exactly 60 minutes

## Task Commits

Each task was committed atomically:

1. **Task 1: Update budgetChecker.ts — real Slack URL + 1-hour dedup** - `694f187` (fix)

**Plan metadata:** (pending docs commit)

## Files Created/Modified

- `lib/polling/budgetChecker.ts` - Four targeted changes: select string, type cast, fireAlert call, dedup query

## Decisions Made

- 1-hour rolling dedup window chosen over period-based reset — prevents alert storms at midnight/month boundary; a rule that fires will not re-fire for exactly 60 minutes regardless of budget period
- `getPeriodStart()` preserved unchanged — removing it would break `getProjectSpend()` which needs it to calculate period spend

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

Pre-existing TypeScript errors in `app/(dashboard)/settings/integration/page.tsx` (TS2367) appeared during `npx tsc --noEmit`. These are unrelated to budgetChecker.ts and were already documented in `deferred-items.md` from plan 06-02. `lib/polling/budgetChecker.ts` itself compiles with no errors.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- budgetChecker.ts is complete — Slack alerts will fire on next polling cycle for any project with a `slack_webhook_url` set in the database
- Ready for 06-05 (the final plan in Phase 6)

---
*Phase: 06-email-alerts-slack*
*Completed: 2026-06-07*
