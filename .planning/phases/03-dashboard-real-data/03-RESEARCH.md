# Phase 3: Dashboard Real Data - Research

**Researched:** 2026-06-05
**Domain:** Next.js 14 App Router server components, Supabase PostgreSQL queries, Recharts stacked bar charts
**Confidence:** HIGH

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**Phase Boundary**
Replace all hardcoded mock/static data across the dashboard page, alerts page, and project detail page with live Supabase queries against `usage_records` and `alert_log`. No new features — only wiring real data to existing UI.

Pages in scope:
- `app/(dashboard)/dashboard/page.tsx` — stats row, SpendChart, top projects, recent alerts
- `app/(dashboard)/alerts/page.tsx` — full alert_log table with real rows
- `app/(dashboard)/projects/[id]/page.tsx` — header stats, Overview tab (chart + model breakdown), Connections tab, Alerts tab

Budget Rules tab in project detail stays mock (Phase 4 scope). SpendChart component gets real data.

**Aggregation Windows**
- Monthly spend = calendar month (1st of current month to today). Primary. Also implement rolling 30-day toggle — calendar month is default.
- Burn rate = average daily spend over last 7 days (sum of last 7 days ÷ 7)
- Projected monthly = burn_rate_daily × 30 as headline. Tooltip: burn_rate_daily × days_left_in_month
- Budget % = matches budget_rule's window field (Claude's discretion on implementation)

**Empty & Zero States**
- Brand new user (no connections): full dashboard with $0.00 stats + prominent CTA banner to connect first API key
- Other empty states: Claude's discretion

**Dashboard Scope & Filtering**
- Monthly spend stat = total across ALL projects + ALL providers
- Spend chart date range = user-selectable 7d/30d/90d toggle (URL search param)
- Top Projects = top 3 by spend this month, "View all →" to /projects
- SpendChart = stacked bar chart, one bar per day, each provider a different color

**Data Freshness (Claude's Discretion)**
- Project detail connections tab: each row shows its own last_polled_at as relative time

**Bug Fix in Scope**
- worker.ts line 16: .eq("is_active", true) → .eq("status", "active")

### Claude's Discretion
- Chart colors per provider
- Empty state copy and icons
- Skeleton vs zero-state for "connected but no data yet"
- Timestamp format
- Where to show "last updated" beyond dashboard
- Budget % window matching detail

### Deferred Ideas (OUT OF SCOPE)
- Per-provider filtering on dashboard (dropdown to see only OpenAI spend)
- "Spend spike" detection (hourly spend 3× above 7-day avg)
- Per-user attribution dashboard view (F-09, PRO only, V1.1)
- Model breakdown on main dashboard (not just project detail)
</user_constraints>

---

## Summary

This phase is a pure data-wiring exercise: replace hardcoded arrays with live Supabase queries. The codebase already has the right foundation — async server component pattern in `dashboard/page.tsx`, `lib/supabase/server.ts` established, `usage_records` and `alert_log` tables with proper RLS policies, and Recharts already installed. No new dependencies are needed.

The biggest architectural shift is converting two client components (`alerts/page.tsx` and `projects/[id]/page.tsx`) to server components for their data-fetching layer, while keeping interactive tab state client-side. The project detail page needs a server/client split: a server component fetches and passes typed props, a client component handles tab switching and the Budget Rules dialog (which stays mock per Phase 4 scope).

SpendChart needs a full rewrite from `AreaChart` (single `spend` datakey, mock-internal data) to `BarChart` with stacked bars keyed by provider. The PRD specifies exact provider colors. The existing `CustomTooltip` logic needs updating to show per-provider breakdown.

**Primary recommendation:** Build `lib/queries/dashboard.ts` first as the single source of truth for all aggregation logic, then wire each page as a consumer. Keep all SQL-level aggregation in Postgres; avoid post-processing arrays in TypeScript when a GROUP BY or SUM handles it.

---

## Standard Stack

### Core (all already installed — NO new dependencies)

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `@supabase/ssr` | ^0.10.3 | Server component Supabase client | Already used in dashboard/page.tsx |
| `@supabase/supabase-js` | ^2.107.0 | Supabase query client | Core data layer |
| `recharts` | ^3.8.0 | Stacked bar chart | Already installed, ShadCN ecosystem |
| `date-fns` | ^4.4.0 | Date formatting, relative time | Already installed |
| `next` | 16.2.6 | App Router, server components, URL search params | Project framework |

### No New Installations Required

All required packages are already in `package.json`. Zero `npm install` commands needed for this phase.

---

## Architecture Patterns

### Recommended File Structure

```
lib/
└── queries/
    └── dashboard.ts          # All aggregation functions — create new

app/(dashboard)/
├── dashboard/
│   └── page.tsx              # Already async server component — extend
├── alerts/
│   └── page.tsx              # Convert: "use client" → async server component
└── projects/[id]/
    ├── page.tsx              # Convert: split into server loader + client shell
    └── ProjectDetailClient.tsx  # New: extract client-interactive parts

components/dashboard/
└── SpendChart.tsx            # Refactor: AreaChart → BarChart, accept data prop
```

### Pattern 1: Server Component Data Fetching

**What:** Async server component calls `createClient()`, fetches via query functions, passes typed props to children.
**When to use:** All three pages in this phase — dashboard, alerts, project detail.

```typescript
// Source: lib/supabase/server.ts (established pattern in codebase)
// app/(dashboard)/dashboard/page.tsx
import { createClient } from "@/lib/supabase/server";
import { getMonthlySpend, getDailySpend, getTopProjects, getRecentAlerts } from "@/lib/queries/dashboard";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ range?: string; window?: string }>;
}) {
  const { range = "7d", window = "month" } = await searchParams;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [monthlySpend, dailySpend, topProjects, recentAlerts, connectionCount] =
    await Promise.all([
      getMonthlySpend(supabase, user.id, window as "month" | "rolling30"),
      getDailySpend(supabase, user.id, parseInt(range)),
      getTopProjects(supabase, user.id, 3),
      getRecentAlerts(supabase, user.id, 5),
      getConnectionCount(supabase, user.id),
    ]);

  return <DashboardView ... />;
}
```

**IMPORTANT:** In Next.js 14+, `searchParams` in server page components is a `Promise` — must be `await`ed before accessing properties. This is the Next.js 15 behavior; in Next.js 14 it may still be synchronous, but the project runs Next 16.2.6 so treat as async.

### Pattern 2: Query Layer (lib/queries/dashboard.ts)

**What:** All aggregation functions in one file, each accepts `supabase: SupabaseClient` and `userId: string`.
**Why:** Keeps pages thin, makes aggregation logic testable in isolation.

```typescript
// lib/queries/dashboard.ts
import type { SupabaseClient } from "@supabase/supabase-js";

export type SpendRow = {
  date: string;   // "YYYY-MM-DD"
  openai: number;
  anthropic: number;
  replicate: number;
  falai: number;
  gemini: number;
  groq: number;
  mistral: number;
  total: number;
};

export async function getMonthlySpend(
  supabase: SupabaseClient,
  userId: string,
  window: "month" | "rolling30" = "month"
): Promise<number> {
  const start = window === "month"
    ? `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, "0")}-01`
    : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];

  const { data, error } = await supabase
    .from("usage_records")
    .select("cost_usd")
    .eq("user_id", userId)
    .gte("date", start);

  if (error || !data) return 0;
  return data.reduce((sum, r) => sum + Number(r.cost_usd ?? 0), 0);
}
```

**Key decision:** Query `usage_records` directly by `user_id` for most aggregations — the `user_id` column exists on `usage_records` (confirmed in migration 001) and has an index `idx_usage_records_user_date`. This avoids the JOIN through `api_connections`.

### Pattern 3: getDailySpend — Pivoting in TypeScript

**What:** Supabase JS client cannot easily pivot rows into columns. Fetch all records for the date range, then reduce to per-date, per-provider buckets in TypeScript.

```typescript
export async function getDailySpend(
  supabase: SupabaseClient,
  userId: string,
  days: number  // 7, 30, or 90
): Promise<SpendRow[]> {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  const start = startDate.toISOString().split("T")[0];

  const { data, error } = await supabase
    .from("usage_records")
    .select("date, cost_usd, api_connections!inner(provider)")
    .eq("user_id", userId)
    .gte("date", start)
    .order("date", { ascending: true });

  if (error || !data) return [];

  // Pivot: group by date, sum by provider
  const byDate = new Map<string, SpendRow>();
  const defaultRow = (): SpendRow => ({
    date: "", openai: 0, anthropic: 0, replicate: 0,
    falai: 0, gemini: 0, groq: 0, mistral: 0, total: 0,
  });

  for (const r of data) {
    const provider = (r.api_connections as { provider: string }).provider;
    const cost = Number(r.cost_usd ?? 0);
    if (!byDate.has(r.date)) byDate.set(r.date, { ...defaultRow(), date: r.date });
    const row = byDate.get(r.date)!;
    if (provider in row) (row as Record<string, unknown>)[provider] =
      (row[provider as keyof SpendRow] as number) + cost;
    row.total += cost;
  }

  return Array.from(byDate.values());
}
```

**NOTE:** The join syntax `api_connections!inner(provider)` uses Supabase's PostgREST inner join notation. This filters out records where api_connections doesn't exist (shouldn't happen due to FK, but good practice).

### Pattern 4: Server/Client Split for Project Detail Page

**What:** Project detail currently is a full `"use client"` component. Split it: server component fetches data, passes to client component.
**Why:** Tabs (interactive) and the AddRuleDialog (useState) MUST remain client-side. Stats and data fetching should be server-side.

```
app/(dashboard)/projects/[id]/page.tsx          ← async server component
  → fetches: project row, stats, connections, alerts
  → renders: <ProjectDetailClient project={...} stats={...} connections={...} alerts={...} />

app/(dashboard)/projects/[id]/ProjectDetailClient.tsx  ← "use client"
  → receives all data as props
  → handles: tab state, AddRuleDialog (Budget Rules tab, stays mock)
  → connections tab: renders real connection data from props
  → alerts tab: renders real alert data from props
```

### Pattern 5: SpendChart Refactor

**What:** Convert from `AreaChart` (single provider, mock-internal data) to `BarChart` (stacked, multi-provider, data prop).
**Current state:** `components/dashboard/SpendChart.tsx` uses `AreaChart`, `Area`, internal `chartData` constant — no props.
**Target:** Accept `data: SpendRow[]` prop, render `BarChart` with one `<Bar>` per provider.

```typescript
// components/dashboard/SpendChart.tsx — after refactor
"use client";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import type { SpendRow } from "@/lib/queries/dashboard";

const PROVIDER_COLORS = {
  openai:    "#10a37f",
  anthropic: "#d97706",
  replicate: "#ea2805",
  falai:     "#ec0648",  // NOTE: DB value is 'falai' not 'fal'
  gemini:    "#4285f4",
  groq:      "#f55036",
  mistral:   "#fa520f",
} as const;

const PROVIDER_LABELS = {
  openai: "OpenAI", anthropic: "Anthropic", replicate: "Replicate",
  falai: "fal.ai", gemini: "Gemini", groq: "Groq", mistral: "Mistral",
};

interface SpendChartProps {
  data: SpendRow[];
  activeProviders: string[];  // only render bars for providers with any spend
}

export function SpendChart({ data, activeProviders }: SpendChartProps) {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
        <XAxis dataKey="date" ... />
        <YAxis tickFormatter={(v) => `$${v}`} ... />
        <Tooltip content={<CustomTooltip />} />
        {activeProviders.map((provider) => (
          <Bar
            key={provider}
            dataKey={provider}
            stackId="spend"
            fill={PROVIDER_COLORS[provider as keyof typeof PROVIDER_COLORS] ?? "#666"}
            name={PROVIDER_LABELS[provider as keyof typeof PROVIDER_LABELS] ?? provider}
          />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}
```

**Recharts 3.x note:** Version ^3.8.0 is installed. Recharts 3.x uses the same `BarChart`/`Bar`/`stackId` API as 2.x for stacked bars — no breaking changes to stacking behavior. The `stackId` prop on `<Bar>` triggers stacking when multiple Bars share the same stackId value.

### Pattern 6: URL Search Params for Chart Range

**What:** `?range=7d|30d|90d` controls chart window; `?window=month|rolling30` controls spend card toggle.
**How:** Server page reads `searchParams`, passes integer to `getDailySpend`. Buttons are client components that push to URL using `next/navigation` `useRouter`.

```typescript
// Range toggle button (client component)
"use client";
import { useRouter, useSearchParams, usePathname } from "next/navigation";

const ranges = ["7d", "30d", "90d"] as const;

export function RangeToggle({ current }: { current: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function setRange(range: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("range", range);
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="flex gap-1">
      {ranges.map((r) => (
        <button
          key={r}
          onClick={() => setRange(r)}
          className={`text-xs px-2.5 py-1 rounded-lg font-mono transition-colors ${
            current === r ? "bg-white/10 text-foreground" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          {r}
        </button>
      ))}
    </div>
  );
}
```

### Pattern 7: getTopProjects — Using project_monthly_spend View

**What:** The `project_monthly_spend` view exists in migration 001. Query it directly.
**Important gotcha:** The view uses `ac.is_active = true` in the JOIN (migration 001, line 260). Migration 002 keeps `is_active` in sync with `status` via trigger — so the view correctly includes only active connections. No fix needed to the view.

```typescript
export async function getTopProjects(
  supabase: SupabaseClient,
  userId: string,
  limit: number = 3
) {
  const { data, error } = await supabase
    .from("project_monthly_spend")
    .select("project_id, project_name, spend_usd, connection_count")
    .eq("user_id", userId)
    .order("spend_usd", { ascending: false })
    .limit(limit);

  if (error || !data) return [];
  return data;
}
```

**Note:** `project_monthly_spend` is a view without RLS. Supabase views run with invoker rights by default — the underlying tables' RLS policies apply. Since `projects` has `auth.uid() = user_id`, the view is user-scoped correctly.

### Pattern 8: Alerts Page — alert_log Schema vs. Mock UI

**Critical gap:** The `alert_log` table has NO `message` column, NO `type` column, NO `provider` column, and NO `status` column derived from user action (`status` IS present as `active/acknowledged/resolved`). The mock UI shows these fields. The real query must synthesize them:

- **Message:** Compute from `spend_at_trigger`, `limit_usd`, `percent_used` — e.g., `"Monthly spend exceeded ${percent_used}% of $${limit_usd} budget"`
- **Type:** Derive from `action_taken` — if `action_taken = 'alert'` then "Budget Threshold", if `'block'` then "Budget Limit"
- **Provider:** NOT in `alert_log`. To get provider, would need `alert_log → projects → api_connections → provider`. This is complex and multi-provider per project. Recommendation: omit provider column from alerts page (show project name instead, provider is ambiguous for multi-connection projects)
- **Severity:** Derive from `percent_used`: ≥ 100 → critical, ≥ 80 → warning, else → info

**Alert page JOIN query:**
```sql
SELECT
  al.id,
  al.triggered_at,
  al.spend_at_trigger,
  al.limit_usd,
  al.percent_used,
  al.action_taken,
  al.status,
  al.notified_via,
  p.name AS project_name,
  br.period AS rule_period
FROM alert_log al
JOIN projects p ON al.project_id = p.id
LEFT JOIN budget_rules br ON al.rule_id = br.id
WHERE al.user_id = $1
ORDER BY al.triggered_at DESC
LIMIT 100
```

In Supabase JS:
```typescript
const { data } = await supabase
  .from("alert_log")
  .select(`
    id, triggered_at, spend_at_trigger, limit_usd, percent_used,
    action_taken, status, notified_via,
    projects!inner(name),
    budget_rules(period)
  `)
  .eq("user_id", userId)
  .order("triggered_at", { ascending: false })
  .limit(100);
```

### Pattern 9: Relative Time Formatting

**What:** `last_polled_at` in connections tab needs "2 min ago" format. Use `date-fns` `formatDistanceToNow`.
**date-fns 4.x** is installed. API is unchanged from 3.x for this use case.

```typescript
import { formatDistanceToNow } from "date-fns";

function relativeTime(iso: string | null): string {
  if (!iso) return "Never";
  return formatDistanceToNow(new Date(iso), { addSuffix: true });
}
// Output: "2 minutes ago", "about 1 hour ago"
```

### Pattern 10: "Last Updated" Timestamp

**What:** Dashboard shows data freshness. Compute `MAX(last_polled_at)` across user's active connections.

```typescript
export async function getLastUpdated(
  supabase: SupabaseClient,
  userId: string
): Promise<string | null> {
  const { data } = await supabase
    .from("api_connections")
    .select("last_polled_at")
    .eq("user_id", userId)
    .eq("status", "active")
    .order("last_polled_at", { ascending: false })
    .limit(1)
    .single();

  return data?.last_polled_at ?? null;
}
```

### Anti-Patterns to Avoid

- **Fetching all rows then filtering in TypeScript:** Always push `WHERE` clauses to Supabase/Postgres. The `user_id` indexed columns make server-side filtering fast.
- **Using `supabase.auth.getUser()` after the data query:** Always auth-check first, then query. Prevents unauthenticated data exposure.
- **Passing the Supabase client as a prop to client components:** Never. Client components should call `createClient()` from `lib/supabase/client.ts` if they need to query — but in this phase, all queries are server-side.
- **Rendering `<SpendChart />` with no data prop:** The refactored chart MUST accept a `data` prop. Remove all internal mock data constants.
- **Hardcoding "window" as budget_rules column name:** The actual DB column is `period`, not `window`. The mock UI interface uses `window` — this must be renamed when mapping real DB rows.

---

## Critical Schema Findings

### Finding 1: budget_rules.period vs. "window" Naming Mismatch

**Problem:** The `budget_rules` table has a `period` column (`'daily' | 'monthly'`). The CONTEXT.md and PRD refer to it as `window`. The mock `BudgetRule` interface in `projects/[id]/page.tsx` uses `window: "daily" | "monthly"`.

**Fix:** When mapping `budget_rules` rows to the `BudgetRule` interface used in the UI, map `period → window`. OR update the interface to use `period`. Since Budget Rules tab stays mock (Phase 4), this only matters for the alerts page JOIN.

### Finding 2: project_monthly_spend View Uses is_active

**Problem:** The view in migration 001 joins `api_connections` with `ac.is_active = true`. Migration 002 added a `status` column and a trigger that keeps `is_active` in sync.

**Status:** The view IS correct — migration 002's trigger `sync_connection_is_active` ensures `is_active = (status = 'active')`. No view update needed. The view is safe to query.

### Finding 3: Worker Bug — is_active vs status

**Exact location:** `lib/polling/worker.ts` line 16.
**Current:** `.eq("is_active", true)`
**Fix:** `.eq("status", "active")`
**Impact:** Technically both work because of the sync trigger, but querying `is_active` skips the partial index `idx_api_connections_active` which is on `is_active`. The fix aligns with schema intent. More importantly — conceptually the query should use the authoritative `status` column.

**Actual line content verified:**
```typescript
.eq("is_active", true);
// → should be:
.eq("status", "active");
```

### Finding 4: alert_log Has No provider Column

The mock alerts UI shows a "provider" badge per alert. Real `alert_log` has no provider. Deriving provider would require joining through `projects → api_connections` which returns multiple providers per project. Recommendation: drop the provider column from the alerts display. Show `project_name` and `rule_period` (daily/monthly) instead.

### Finding 5: alert_log.status vs. alert_log Severity

`alert_log` has a `status` column (`active/acknowledged/resolved`) that maps to the mock's `status` field. Severity (`critical/warning/info`) is NOT stored — derive from `percent_used`:
- `percent_used >= 100` → `"critical"`
- `percent_used >= 80` → `"warning"`
- else → `"info"`

### Finding 6: api_connections.label Column (for Display)

Migration 002 added `api_key_suffix text` for display. The `label` column was in original migration 001. The PRD notes: "show `api_connections.label` if non-null". Connections tab should show label if present, otherwise show the `api_key_suffix` with masking (`••••{suffix}`).

### Finding 7: Project Detail UUID IDs

The current `projects/[id]/page.tsx` looks up a `projectData` dictionary by string key ("1", "2", "3"). Real projects have UUID ids like `f3a8b2c1-...`. The dictionary lookup always returns `undefined` for real UUIDs, triggering the "Project not found" branch. The entire client-side dict must be replaced with a server-side query by project UUID.

### Finding 8: getProjectStats Join Path

To get per-project spend, join `usage_records → api_connections`:
```typescript
const { data } = await supabase
  .from("usage_records")
  .select("cost_usd, api_connections!inner(project_id, provider)")
  .eq("api_connections.project_id", projectId)
  .gte("date", monthStart);
```
This works because `usage_records.connection_id` → `api_connections.id` FK exists. The `!inner` ensures only records with a matching connection are returned.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Relative timestamps | Custom "X ago" formatter | `date-fns` `formatDistanceToNow` | Edge cases: DST, pluralization, localization |
| Date range math | Manual `Date` arithmetic | `date-fns` `subDays`, `startOfMonth` | Avoids off-by-one, handles month boundaries |
| Provider color mapping | Inline ternary chains | Typed const object `PROVIDER_COLORS` | Maintainable, type-safe, single source of truth |
| Spend aggregation | Supabase row reduce in TS | Postgres `SUM(cost_usd)` via `.select("cost_usd").gte(...)` | Database aggregation is faster than JS reduce on large datasets |
| Stacked chart data format | Custom pivot logic per render | Single `getDailySpend()` pivot in queries layer | Testable once, reusable |

**Key insight:** Supabase JS client's filter operators (`gte`, `lte`, `eq`) push all filtering to Postgres. Always filter server-side.

---

## Common Pitfalls

### Pitfall 1: searchParams Must Be Awaited in Next.js 16

**What goes wrong:** `const { range } = searchParams` — `searchParams` is a Promise in Next.js 15+. Accessing `.range` directly returns `undefined`.
**Why it happens:** Next.js changed `searchParams` from sync to async between v14 and v15.
**How to avoid:** `const { range = "7d" } = await searchParams;`
**Confirmed:** Project uses Next.js 16.2.6 — await is required.

### Pitfall 2: SpendChart "use client" With Server Data

**What goes wrong:** Recharts requires `"use client"` (uses browser APIs). But data comes from server. If you try to query in the chart component, you'll hit "cannot use async in client component."
**How to avoid:** Data flows server → page → `SpendChart` as props. The chart is a pure presentation component. This is already the intended architecture.

### Pitfall 3: Supabase View RLS

**What goes wrong:** Querying `project_monthly_spend` view as an authenticated user and getting other users' data.
**Why it doesn't happen:** Supabase views use invoker rights. The underlying `projects` table has RLS `auth.uid() = user_id`. The view is automatically user-scoped.
**Verification:** Confirmed in migration 001 comment: "RLS on views: underlying tables' RLS applies automatically in Supabase because views run with invoker rights by default."

### Pitfall 4: getDailySpend Returns Empty Array for New Users

**What goes wrong:** `SpendChart` receives `[]` and renders nothing. No crash, but the chart area is blank with no indication of why.
**How to avoid:** Pass `connectionCount` to the chart wrapper. If `connectionCount === 0`, show CTA instead of chart. If `connectionCount > 0` but `data.length === 0`, show "Polling data incoming..." placeholder.

### Pitfall 5: Recharts stacked Bar Requires stackId on All Bars

**What goes wrong:** Only some `<Bar>` components get `stackId="spend"` — bars don't stack, they render side-by-side.
**How to avoid:** Every `<Bar>` rendered in the stacked chart must have `stackId="spend"` (same string on all).

### Pitfall 6: Floating Point Accumulation in Cost Totals

**What goes wrong:** `0.1 + 0.2 + ... + 0.3` in JavaScript produces `0.6000000000000001`. Displayed as "$0.600000" in the stat card.
**How to avoid:** Always `Math.round(total * 100) / 100` or use `toFixed(2)` when formatting for display. The `cost_usd` column is `numeric(10,6)` — 6 decimal precision. Keep numbers as-is in the query layer; only format at render time.

### Pitfall 7: Infinite Re-render from useSearchParams in Client Component

**What goes wrong:** A client component that calls `useSearchParams()` and re-renders every navigation causes excessive renders.
**How to avoid:** The `RangeToggle` component should be wrapped in `<Suspense>` when used in a server component. Next.js App Router requires this for `useSearchParams`.

```typescript
// In server component:
<Suspense fallback={<div className="h-8 w-32 animate-pulse" />}>
  <RangeToggle current={range} />
</Suspense>
```

### Pitfall 8: Project Detail Page — useParams on Server

**What goes wrong:** Current `projects/[id]/page.tsx` uses `"use client"` and `useParams()`. After conversion to server component, `useParams()` is unavailable.
**How to avoid:** Server page components receive params via the `params` prop directly:
```typescript
export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  // ...
}
```

---

## Code Examples

### lib/queries/dashboard.ts — Full Shape

```typescript
// lib/queries/dashboard.ts
import type { SupabaseClient } from "@supabase/supabase-js";

export type Provider = "openai" | "anthropic" | "replicate" | "falai" | "gemini" | "groq" | "mistral";

export const ALL_PROVIDERS: Provider[] = [
  "openai", "anthropic", "replicate", "falai", "gemini", "groq", "mistral"
];

export type SpendRow = {
  date: string;
} & Record<Provider, number> & { total: number };

export type TopProject = {
  project_id: string;
  project_name: string;
  spend_usd: number;
  connection_count: number;
};

export type RecentAlert = {
  id: string;
  triggered_at: string;
  project_name: string;
  percent_used: number;
  action_taken: string | null;
  status: "active" | "acknowledged" | "resolved";
};

export type ProjectStats = {
  monthlySpend: number;
  burnRateDaily: number;
  projectedMonthly: number;
  connectionCount: number;
};

export type ConnectionRow = {
  id: string;
  provider: Provider;
  label: string | null;
  api_key_suffix: string | null;
  status: "active" | "polling_error" | "invalid" | "blocked";
  last_polled_at: string | null;
};
```

### Empty State CTA Banner

```typescript
// Render below stats row when connectionCount === 0
// This REPLACES the always-visible empty state hint in current dashboard/page.tsx
{connectionCount === 0 && (
  <div className="border border-dashed border-primary/30 rounded-2xl p-6 flex items-center gap-4 bg-primary/5">
    <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
      <Zap className="w-5 h-5 text-primary" />
    </div>
    <div className="flex-1">
      <p className="font-semibold text-sm">Connect your first API key</p>
      <p className="text-xs text-muted-foreground mt-0.5">
        Go to Projects → New Project to start tracking real spend data.
      </p>
    </div>
    <Link href="/projects" className="text-xs font-semibold text-primary hover:underline shrink-0">
      Get started →
    </Link>
  </div>
)}
```

### Worker Bug Fix

```typescript
// lib/polling/worker.ts — line 16
// BEFORE:
.eq("is_active", true);
// AFTER:
.eq("status", "active");
```

---

## State of the Art

| Old Approach (Current Code) | New Approach (This Phase) | Impact |
|-----------------------------|---------------------------|--------|
| `const topProjects = [...]` hardcoded array | `getTopProjects(supabase, userId)` async query | Real data |
| `<SpendChart />` no props, internal mock data | `<SpendChart data={dailySpend} activeProviders={...} />` | Real stacked chart |
| `"use client"` + `useParams` on project detail | Server component with `params` prop | Real UUID lookup |
| `alerts/page.tsx` client component | Async server component | Real alert rows |
| `alert_log` join shows provider badge | Show project name only (provider not in alert_log) | Accurate display |
| SpendChart: `AreaChart` single line | SpendChart: `BarChart` stacked by provider | Multi-provider visibility |

---

## Open Questions

1. **getDailySpend JOIN performance at scale**
   - What we know: `usage_records` has `idx_usage_records_user_date` compound index on `(user_id, date DESC)`. The join to `api_connections` for provider is on `connection_id` which is the PK.
   - What's unclear: At 90 days × multiple providers, how many rows could this be? For a solo founder, likely < 10k rows. Fine.
   - Recommendation: Use the direct join approach. If performance degrades at scale, add a `provider` denormalized column to `usage_records` in a future migration.

2. **project_monthly_spend view vs. raw query for monthly spend stat**
   - What we know: The view aggregates per-project. Dashboard needs TOTAL across all projects.
   - Recommendation: For the top projects section, use the view (query by user_id, sum is per-project). For the headline monthly spend stat, query `usage_records` directly by `user_id` — don't sum the view's project-level rows (would require another aggregation and the view is scoped to current month already which is what we want for "top projects" but headline stat needs to support the `?window=rolling30` toggle).

3. **Date formatting for chart X-axis at 90d range**
   - What we know: 90 data points of "Jun 05" labels will be cramped.
   - Recommendation: For 7d show "Jun 5", for 30d show "Jun 5", for 90d show "May 28" or abbreviated month+day with tick interval. Recharts XAxis `interval` prop controls tick frequency. Set `interval={Math.floor(days / 10)}` to show ~10 labels regardless of range.

---

## Sources

### Primary (HIGH confidence)
- Migration files `supabase/migrations/001_schema.sql`, `002_schema_updates.sql`, `003_more_providers.sql` — complete schema verified
- `lib/supabase/server.ts` — server client pattern confirmed
- `lib/polling/worker.ts` — bug location verified (line 16)
- `components/dashboard/SpendChart.tsx` — current implementation verified (AreaChart, mock-internal data)
- `app/(dashboard)/dashboard/page.tsx` — already async server component confirmed
- `app/(dashboard)/alerts/page.tsx` — confirmed as `"use client"` with mock data
- `app/(dashboard)/projects/[id]/page.tsx` — confirmed as `"use client"` with hardcoded projectData dict
- `package.json` — recharts ^3.8.0, date-fns ^4.4.0, next 16.2.6 confirmed

### Secondary (MEDIUM confidence)
- Recharts 3.x stacked BarChart API: stackId prop behavior consistent with v2.x (WebSearch cross-verified against recharts.org documentation pattern)
- Next.js 16.x searchParams as Promise: Consistent with Next.js 15+ behavior for page components

### Tertiary (LOW confidence — needs runtime validation)
- `project_monthly_spend` view RLS through invoker rights: Documented in migration comment. Should be validated with a real multi-user test if possible.

---

## Metadata

**Confidence breakdown:**
- Schema facts: HIGH — read from actual migration files
- Current component state: HIGH — read from actual source files
- Recharts 3.x stacked bar API: MEDIUM — version in package.json confirmed, API verified from docs pattern
- Next.js 16.2.6 searchParams behavior: MEDIUM — consistent with Next.js 15+ documented behavior
- Query performance estimates: LOW — no production data to validate

**Research date:** 2026-06-05
**Valid until:** 2026-07-05 (stable stack)
