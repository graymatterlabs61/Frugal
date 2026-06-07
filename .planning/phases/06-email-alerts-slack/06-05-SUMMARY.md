---
phase: 06-email-alerts-slack
plan: 05
subsystem: ui
tags: [slack, webhook, react, nextjs, zod, supabase]

# Dependency graph
requires:
  - phase: 06-01
    provides: slack_webhook_url column on projects table (migration 005)
  - phase: 06-02
    provides: alertService.ts that reads slack_webhook_url and fires Slack alerts
provides:
  - PATCH /api/projects/[id] endpoint that validates and persists slack_webhook_url
  - ProjectStats type extended with slackWebhookUrl field
  - getProjectStats() returns slackWebhookUrl from DB
  - Notifications tab in ProjectDetailClient.tsx with Slack webhook URL input and save button
affects: [future-ui, dashboard, project-detail]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - Zod v4 standalone z.url() for URL validation (not z.string().url())
    - Empty string to null coercion pattern for optional URL fields
    - Auth-gated PATCH endpoint with supabase.auth.getUser() + user.id ownership check

key-files:
  created: []
  modified:
    - app/api/projects/[id]/route.ts
    - lib/queries/dashboard.ts
    - app/(dashboard)/projects/[id]/ProjectDetailClient.tsx

key-decisions:
  - "Zod v4 z.union([z.url(), z.literal(''), z.null()]).optional() handles all valid states: valid URL, empty string (clear webhook), null (no webhook)"
  - "PATCH checks user_id ownership in .eq('user_id', user.id) — RLS plus explicit ownership check"
  - "slackWebhookUrl state initialized from project.slackWebhookUrl ?? '' — avoids uncontrolled input on mount"

patterns-established:
  - "PATCH with partial update: build updateData object, check key presence with 'in' operator, reject empty update set"

requirements-completed: [F-16]

# Metrics
duration: 4min
completed: 2026-06-07
---

# Phase 06 Plan 05: Notifications Tab + PATCH Endpoint Summary

**PATCH /api/projects/[id] with Zod URL validation, extended ProjectStats, and Notifications tab with Slack webhook input wired to save via PATCH**

## Performance

- **Duration:** ~4 min
- **Started:** 2026-06-07T17:26:41Z
- **Completed:** 2026-06-07T17:30:22Z
- **Tasks:** 2 of 3 (Task 3 is human-verify checkpoint — pending)
- **Files modified:** 3

## Accomplishments
- PATCH handler added to `app/api/projects/[id]/route.ts` with Zod validation and auth guard
- `ProjectStats` interface extended with `slackWebhookUrl: string | null`
- `getProjectStats()` selects `slack_webhook_url` and returns it in the mapped result
- Notifications tab added to `ProjectDetailClient.tsx` with Slack webhook URL input and Save Webhook button
- Save action calls `PATCH /api/projects/{id}` and shows success/error toast via sonner
- Empty string submitted as `null` to clear the webhook URL (matches PATCH coercion logic)

## Task Commits

Each task was committed atomically:

1. **Task 1: PATCH /api/projects/[id] + extend ProjectStats + update getProjectStats** - `9aa8b32` (feat)
2. **Task 2: Add Notifications tab to ProjectDetailClient.tsx** - `59ee4b1` (feat)
3. **Task 3: Human-verify checkpoint** - pending human verification

## Files Created/Modified
- `app/api/projects/[id]/route.ts` - Added PATCH handler with Zod PatchProjectSchema, auth guard, empty-string-to-null coercion
- `lib/queries/dashboard.ts` - Extended ProjectStats with slackWebhookUrl, updated select and return value in getProjectStats()
- `app/(dashboard)/projects/[id]/ProjectDetailClient.tsx` - Added slackWebhookUrl/slackSaving state, handleSaveSlackWebhook(), Notifications TabsTrigger + TabsContent

## Decisions Made
- Zod v4 union schema `z.union([z.url(), z.literal(""), z.null()]).optional()` covers all valid states without `z.string().url()` (which is v3 syntax)
- PATCH returns `{ success: true }` on 200; returns 400 for invalid input or no fields to update; returns 500 on DB error
- slackWebhookUrl state initialized from `project.slackWebhookUrl ?? ""` to avoid uncontrolled-to-controlled input transition

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

Pre-existing TypeScript errors in `settings/integration/page.tsx` and `settings/SettingsClient.tsx` (TS2367 — type comparison with no overlap) were present before this plan and are already documented in `deferred-items.md`. Not introduced by this plan.

## User Setup Required
None - no external service configuration required beyond what was set up in Phase 6.

## Next Phase Readiness
- Phase 6 complete pending human verification of the Notifications tab
- Users can now configure Slack webhook URLs per project via the UI
- alertService.ts already reads `slack_webhook_url` from DB (Phase 06-02/06-04) — end-to-end Slack alerting is now fully wired

---
*Phase: 06-email-alerts-slack*
*Completed: 2026-06-07*
