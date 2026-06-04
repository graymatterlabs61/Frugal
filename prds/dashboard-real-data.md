## Problem Statement

Every number on the Frugal dashboard is hardcoded mock data. New users who connect API keys see fictional spend, fictional projects, and fictional alerts — undermining trust in the product before they have a chance to use it.

## Solution

Replace all static/mock data across three pages (dashboard, alerts, project detail) with live Supabase queries against `usage_records` and `alert_log`. Every stat, chart, and table reflects the user's actual connected API usage.

## User Stories

1. As a user, I want the monthly spend card to show my real total AI spend this calendar month, so I know what I've actually spent.
2. As a user, I want to toggle between calendar month and rolling 30 days so I can see different spend windows.
3. As a user, I want the spend chart to show stacked bars per provider per day so I can see which provider is costing me most.
4. As a user, I want to select 7d / 30d / 90d chart ranges so I can see historical trends.
5. As a user, I want the top 3 projects by spend to appear on the dashboard so I know where my money is going.
6. As a user, I want to see my real alert history on the alerts page so I can audit what fired.
7. As a user, I want the project detail page to show real spend, real connections, and real alert history so I can manage per-project costs.
8. As a new user with no connections, I want to see a clear CTA to connect my first API key, not confusing $0 data.
9. As a user, I want to see "last updated X minutes ago" so I know how fresh my data is.

## Implementation Decisions

**Phase 1 — DB query layer**
- Create `lib/queries/dashboard.ts`: functions `getMonthlySpend(userId, window)`, `getDailySpend(userId, days)`, `getTopProjects(userId, limit)`, `getRecentAlerts(userId, limit)`, `getProjectStats(projectId)`, `getAlertLog(projectId?)`
- Use existing `project_monthly_spend` view where applicable; raw queries elsewhere
- All functions accept `userId` from `supabase.auth.getUser()` — never trust client input
- `getDailySpend` returns `{ date, openai, anthropic, replicate, falai, gemini, groq, mistral, total }[]`

**Phase 2 — Dashboard page (server component)**
- `app/(dashboard)/dashboard/page.tsx` becomes fully async server component
- Fetches all dashboard data server-side, passes as props to child components
- URL search param `?range=7d|30d|90d` controls chart window (default 7d)
- URL search param `?window=month|rolling30` controls monthly spend card (default month)
- "Last updated" = `MAX(last_polled_at)` across user's active connections
- Empty state: if `connectionCount === 0`, render CTA banner below stats row

**Phase 3 — SpendChart component refactor**
- Convert `components/dashboard/SpendChart.tsx` from mock-data-internal to `data` prop
- Recharts `BarChart` with one `<Bar>` per provider, distinct brand colors
- Provider colors: openai=#10a37f, anthropic=#d97706, replicate=#ea2805, falai=#ec0648, gemini=#4285f4, groq=#f55036, mistral=#fa520f
- Chart handles missing providers gracefully (no bar if provider has no spend in window)
- Date range toggle (7d/30d/90d) rendered as button group above chart; links update URL param

**Phase 4 — Alerts page (server component)**
- `app/(dashboard)/alerts/page.tsx` becomes async server component
- Queries `alert_log` table: `SELECT al.*, br.limit_usd, p.name as project_name FROM alert_log al JOIN budget_rules br ON al.rule_id = br.id JOIN projects p ON al.project_id = p.id WHERE al.user_id = $1 ORDER BY triggered_at DESC LIMIT 100`
- Maps `action_taken` to severity: 'alert' → warning, 'block' → critical
- Empty state: "No alerts yet — set a budget rule on any project to get notified" with link to /projects

**Phase 5 — Project detail page (server + client hybrid)**
- Convert header + stats to server component; tabs remain client components
- Server fetches: project row, monthly spend, burn rate, projected monthly, connection list with last_polled_at
- Connections tab: real `last_polled_at` from DB rendered as relative time
- Alerts tab: real `alert_log` rows for this project
- Fix worker bug: `worker.ts` line 16 `.eq("is_active", true)` → `.eq("status", "active")`

**Aggregation formulas (locked):**
- Monthly spend: `SUM(cost_usd) WHERE date >= first_of_current_month AND date <= today`
- Rolling 30d: `SUM(cost_usd) WHERE date >= today - 30 days`
- Burn rate: `SUM(cost_usd last 7 days) / 7`
- Projected monthly: `burn_rate * 30`
- Budget %: matches rule window — daily rule uses today's spend, monthly rule uses calendar month

## Testing Decisions

- Test `lib/queries/dashboard.ts` with a real Supabase test database — no mocking internal query logic
- Mock only `supabase.auth.getUser()` at the boundary
- Test aggregation math: known usage_records rows → expected spend totals
- Test empty states: zero connections → CTA visible; zero usage_records → $0 stats
- Test URL param handling: `?range=30d` → 30-day query range passed to getDailySpend

## Out of Scope

- Per-provider filtering dropdown on dashboard (future phase)
- Real-time polling/WebSocket updates (5-min polling is sufficient)
- Model breakdown on main dashboard (project detail only)
- Per-user attribution view (F-09, PRO, V1.1)
- Tier enforcement on history window (Phase 5 concern)

## Further Notes

- `project_monthly_spend` view exists in migration 001 — use it for top projects aggregation
- `api_connections.label` field exists — show in connections tab if non-null
- Worker `.eq("is_active", true)` bug blocks all polling — fix must ship in this phase

## Decisions Log

Q: Server component pattern?
A: Async server component queries Supabase directly, passes typed props down.
Why: Matches existing dashboard/page.tsx pattern.

Q: SpendChart data flow?
A: Server fetches, passes `data` prop. Chart = pure presentation.
Why: Testable, no hydration issues.

Q: Date range toggle state?
A: URL search params (?range=7d). Server re-fetches on navigation.
Why: Shareable URL, no useState complexity.

Q: Stacked bar library?
A: Recharts BarChart — already in shadcn ecosystem per FEATURES.md.
Why: Zero new dependencies.

Q: Project spend join path?
A: usage_records → api_connections.project_id → projects.id.
Why: That's the FK chain in migration 001 schema.

Q: Worker bug fix scope?
A: Yes, fix in Phase 5 of this feature. Blocking correctness issue.
Why: Worker never fetches connections without this fix.
