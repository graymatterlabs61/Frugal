# Phase 3: Dashboard Real Data - Context

**Gathered:** 2026-06-05
**Status:** Ready for planning

<domain>
## Phase Boundary

Replace all hardcoded mock/static data across the dashboard page, alerts page, and project detail page with live Supabase queries against `usage_records` and `alert_log`. Every number the user sees must reflect their actual connected API usage. No new features — only wiring real data to existing UI.

Pages in scope:
- `app/(dashboard)/dashboard/page.tsx` — stats row, SpendChart, top projects, recent alerts
- `app/(dashboard)/alerts/page.tsx` — full alert_log table with real rows
- `app/(dashboard)/projects/[id]/page.tsx` — header stats, Overview tab (chart + model breakdown), Connections tab, Alerts tab

Budget Rules tab in project detail stays mock (Phase 4 scope). SpendChart component gets real data.

</domain>

<decisions>
## Implementation Decisions

### Aggregation Windows

- **Monthly spend** = calendar month (1st of current month to today). This is primary. Also implement a rolling 30-day toggle so user can switch — calendar month is the default.
- **Burn rate** = average daily spend over last 7 days (sum of last 7 days ÷ 7). Matches FEATURES.md spec.
- **Projected monthly** = `burn_rate_daily × 30` as the headline number. Show days-remaining variant (`burn_rate_daily × days_left_in_month`) as a tooltip on hover for extra context.
- **Budget %** = window matches the budget_rule's window field — daily rule compares to today's spend, monthly rule compares to calendar month spend. Claude's discretion on implementation.

### Empty & Zero States

- **Brand new user (no connections):** Show full dashboard with real $0.00 stats in all stat cards + a prominent CTA banner to connect first API key. Do NOT replace the whole dashboard layout — keep it, show zeros, add the CTA.
- **Has connections but no usage_records yet:** Claude's discretion — handle this gracefully (e.g. $0 with a "polling data incoming" note, or skeleton for chart area).
- **Alerts page with no alerts:** Claude's discretion — functional empty state with a clear next action.
- **Project detail with no connections/usage:** Claude's discretion — $0 stats with appropriate nudge.

### Dashboard Scope & Filtering

- **Main dashboard monthly spend stat** = total spend across ALL projects + ALL providers for the user. One number = total AI spend.
- **Spend chart date range** = user-selectable: 7d / 30d / 90d toggle. Backend enforces tier-based history limits (Free = 7d max, Plus = 90d, Pro = 365d) — tier enforcement is Phase 5 concern, but the selector UI should be built in Phase 3 (just don't hard-block yet).
- **Top Projects section** = top 3 projects by spend this month. If fewer than 3 projects have spend, show what exists. "View all →" link to /projects. Ordered by spend descending.
- **SpendChart** = stacked bar chart, one bar per day, each provider a different color within the bar. This reinforces Frugal's multi-provider core value prop.

### Data Freshness Display

- Placement, timestamp logic (oldest vs newest poll), and error indicators: Claude's discretion. Use good judgment — show it on dashboard at minimum, near the spend chart.
- Project detail connections tab: each connection row shows its own `last_polled_at` as relative time (real data replacing the hardcoded strings — consistent with current mock design).

### Bug Fix in Scope

- `worker.ts` line 16 queries `.eq("is_active", true)` but the column is `status` with value `'active'` — fix this while wiring real data.

### Claude's Discretion

- Chart colors per provider (pick something coherent with existing brand)
- Exact empty state copy and illustration/icon choices
- Skeleton vs zero-state approach for "connected but no data yet"
- Timestamp display format (e.g. "2 min ago" vs "Jun 5, 14:22")
- Where exactly to show "last updated" beyond dashboard
- Budget % window matching implementation detail

</decisions>

<specifics>
## Specific Ideas

- "Both — calendar month primary, rolling 30d toggle" — this is a toggle on the stat card or near it, not a full date picker
- Stacked bar chart chosen because multi-provider visibility is the core value prop — providers should be visually distinct colors
- Top 3 projects with "View all" link — clean, not a table dump
- The existing SpendChart component (`components/dashboard/SpendChart.tsx`) needs to accept real data as props; currently it renders mock/static data internally

</specifics>

<deferred>
## Deferred Ideas

- Per-provider filtering on dashboard (dropdown to see only OpenAI spend) — future enhancement phase
- "Spend spike" detection (hourly spend 3× above 7-day avg, as seen in mock alerts) — this is a new alert type, separate phase
- Per-user attribution dashboard view — F-09, PRO only, V1.1
- Model breakdown on main dashboard (not just project detail) — future

</deferred>

---

*Phase: 03-dashboard-real-data*
*Context gathered: 2026-06-05*
