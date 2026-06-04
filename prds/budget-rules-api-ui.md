## Problem Statement

Developers using Frugal need to set automated spend guardrails per project — alert when 80% of budget is hit, block polling at 100%. Currently the Budget Rules tab in the project detail page saves rules to React state only; rules vanish on refresh and are never persisted to the database or checked by the polling worker.

## Solution

Build a full REST API for `budget_rules` with Zod validation and tier enforcement. Wire the existing project detail Budget Rules UI to the real API. Add DB migration to align schema with spec. Verify budgetChecker.ts reads the correct columns.

## User Stories

1. As a Plus/Pro user, I want to create a budget rule on a project so my spend is automatically monitored.
2. As a user, I want to set the rule window (daily or monthly) and action (alert, block, throttle) so I control what happens when my threshold is crossed.
3. As a user, I want to set the alert threshold percentage (e.g. 80%) so I get warned before hitting my limit.
4. As a user, I want my budget rules to persist after page refresh so they actually work.
5. As a Free tier user, I want to see a clear upgrade prompt when trying to create a rule so I understand what I'm missing.
6. As a Plus user, I want alert and block actions but not throttle, matching my tier.
7. As a Pro user, I want throttle action available so expensive models auto-downgrade.
8. As a user, I want to delete a budget rule so I can remove guardrails I no longer need.

## Implementation Decisions

**Phase 1 — DB migration**
- Migration `003_budget_rules_update.sql`: add `user_id uuid references users(id)`, rename `period` → `window`, rename `alert_at_percent` → `threshold_pct`
- Add RLS policy: `CREATE POLICY budget_rules_user ON budget_rules USING (user_id = auth.uid())`
- Backfill: existing rows get user_id from their project's user_id

**Phase 2 — lib/tier.ts**
- Create `lib/tier.ts` exporting: `getConnectionLimit(plan)`, `getProjectLimit(plan)`, `getHistoryDays(plan)`, `canCreateBudgetRule(plan)`, `getAllowedRuleActions(plan)`
- Free: canCreateBudgetRule = false, limit 1 connection, 1 project, 7 days history
- Plus: canCreateBudgetRule = true, actions = ['alert','block'], 3 connections, 5 projects, 90 days
- Pro: canCreateBudgetRule = true, actions = ['alert','block','throttle'], unlimited, 365 days

**Phase 3 — API routes**
- `app/api/budget-rules/route.ts` (GET, POST):
  - GET: query `?projectId=uuid` — fetch rules for project, verify project belongs to user
  - POST: Zod schema validates body, tier check before insert, return created rule
- `app/api/budget-rules/[id]/route.ts` (DELETE):
  - Verify rule.user_id = current user before delete
- Zod schema: `{ project_id: uuid, limit_usd: number>0, window: 'daily'|'monthly', action: 'alert'|'block'|'throttle', threshold_pct: number 1-100 default 80 }`
- All routes: `supabase.auth.getUser()` first, no exceptions (CLAUDE.md)

**Phase 4 — Wire project detail UI**
- Replace `AddRuleDialog` fake `setTimeout` with real `POST /api/budget-rules`
- On mount, `GET /api/budget-rules?projectId={id}` to load existing rules
- Delete button: `DELETE /api/budget-rules/{rule.id}`, remove from state on success
- Free tier: disable "New Rule" button, show tooltip "Upgrade to Plus to set budget rules"

**Phase 5 — Budget checker alignment**
- Audit `lib/polling/budgetChecker.ts` — verify column names match migration 003
- Ensure `window` column used (not `period`), `threshold_pct` (not `alert_at_percent`)
- Verify deduplication: check alert_log WHERE rule_id = X AND triggered_at > start of current window
- Fix any column mismatches found

## Testing Decisions

- Test API routes: authenticated POST creates rule, unauthenticated returns 401
- Test tier enforcement: Free user POST → 403 with `{ error: 'Upgrade to Plus' }`
- Test Plus user: POST with action='throttle' → 403; action='alert' → 201
- Test Zod validation: limit_usd=0 → 400; invalid action → 400
- Test project ownership: user A cannot GET/DELETE user B's rules
- Test budgetChecker: seeded usage_records + budget_rule → checkBudgets() writes to alert_log

## Out of Scope

- Throttle action actual execution (requires proxy — V2)
- Per-user budget limits (F-23, V1.1)
- Bulk rule operations
- Rule templates

## Further Notes

- Current migration 001 has `period` not `window`, `alert_at_percent` not `threshold_pct` — migration 003 aligns with FEATURES.md spec
- budgetChecker.ts must be verified/fixed in same phase as schema migration
- lib/tier.ts is referenced in FEATURES.md F-21 — create it here, use it in all subsequent phases

## Decisions Log

Q: API route structure?
A: /api/budget-rules flat, filter by ?projectId. Matches /api/connections and /api/projects.
Why: Consistent with existing codebase route conventions.

Q: Schema mismatch resolution?
A: Migration 003 — rename columns to match spec. Fix budgetChecker in same phase.
Why: Can't fix budgetChecker without fixing schema; must ship together.

Q: Tier enforcement location?
A: Server-side in API route via lib/tier.ts. Client gating is UI hint only.
Why: FEATURES.md F-21 explicitly states server-side enforcement.

Q: Free tier UX?
A: Disabled button + tooltip, not hidden. User sees what they're missing.
Why: Upgrade prompt strategy — show the value, then gate it.
