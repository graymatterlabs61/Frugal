# Phase 4: Budget Rules API + UI — Research

**Researched:** 2026-06-07
**Domain:** Supabase REST API + Next.js 14 App Router + tier gating + React state replacement
**Confidence:** HIGH — all findings derived directly from codebase inspection

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**Rule creation form:**
- Dialog shows threshold % + action type only (minimal fields)
- Default threshold: 80% when dialog opens
- Budget limit lives on the project (project-level default) but is overridable per rule — form shows limit field only if project has no limit set, or allows optional override
- Multiple rules per project allowed — user can stack e.g. 70% alert + 100% block
- Validation: if project has no budget limit and rule form has no limit override, block submission with inline error: "Set a monthly budget limit on this project first."

**Tier gate UI:**
- Free user opens Budget Rules tab → sees blurred/dimmed rule list preview + upgrade banner on top
- Banner text: "Upgrade to Plus to create budget rules" + "Upgrade to Plus" button → links to `/billing`
- `/billing` is a placeholder in Phase 4 (Stripe wired in Phase 5); clicking upgrade navigates there
- 'Pro' badge shown next to the Throttle action option in the dialog — visually distinguishes Plus from Pro capability

**Rule action behavior:**
- Actions presented as radio cards with icon + 1-line description:
  - Alert — "Send email/Slack notification when threshold is crossed"
  - Block — "Record a block event and fire notification" (enforcement via SDK — future)
  - Throttle — "Slow down requests [Pro]" (Pro badge visible, disabled for Plus users)
- Block in Phase 4 = writes alert_log entry with action_taken='block' + fires notification — no actual API interception
- No real-time push in Phase 4 — alerts appear on next dashboard refresh

**Rule list display:**
- Rows: threshold% · action badge · delete icon — e.g. "80% · Alert · trash"
- Delete-only in Phase 4 — no edit/PATCH endpoint
- Delete confirmation: inline — clicking trash shows "Delete? [Cancel] [Delete]" in same row; no modal
- Empty state (Plus/Pro, no rules yet): illustration + "No rules yet. Add your first budget rule." + Add Rule button

### Claude's Discretion
- Loading/submitting states in the Add Rule dialog
- Exact illustration for empty state
- Error toast wording for API failures
- Color of action badges (alert = yellow, block = red, throttle = blue — or Claude decides)

### Deferred Ideas (OUT OF SCOPE)
- Actual API call blocking/interception — requires @frugal/sdk npm package (Phase 7+ / SDK phase)
- Supabase Realtime subscription for live alert badge updates — future polish
- Edit existing rules (PATCH endpoint) — omitted in Phase 4
- Notification channel selector in rule form (email vs Slack) — Phase 6
</user_constraints>

---

## Summary

Phase 4 wires the Budget Rules tab from a fully mocked in-memory state to a real Supabase-backed API. The current codebase has a solid, consistent pattern for API routes (auth → Zod parse → Supabase query → NextResponse) that must be replicated exactly.

The current `budget_rules` table schema in migration 001 already has `user_id`, `period`, `limit_usd`, and `alert_at_percent` — but the phase description calls for renaming `period` to `window` and `alert_at_percent` to `threshold_pct`. Migration 003 in the codebase is actually a provider-list expansion, NOT the budget-rules schema migration described in the phase plan. The "migration 003" in the phase description refers to a NEW migration file that needs to be created (which would be numbered 004 in the file system since 003 already exists).

`budgetChecker.ts` queries the OLD column names (`period`, `alert_at_percent`, `limit_usd`). After the schema migration, it must be updated to use the new names (`window`, `threshold_pct`). The `BudgetRule` type in `lib/polling/types.ts` also needs updating. There is currently no `lib/tier.ts` — it must be created from scratch to read the `plan` column from the `users` table.

**Primary recommendation:** Create the migration as `004_budget_rules_schema.sql` (not 003, which is taken). Update budgetChecker.ts and types.ts to use new column names. Follow the exact API route pattern from `app/api/connections/[id]/route.ts` for the DELETE endpoint.

---

## Current Database State (Confirmed from Migrations)

### budget_rules table — CURRENT column names (migration 001)

| Column | Type | Notes |
|--------|------|-------|
| id | uuid PK | uuid_generate_v4() |
| project_id | uuid FK → projects | NOT NULL |
| user_id | uuid FK → users | NOT NULL |
| period | text | CHECK IN ('daily', 'monthly') — **needs rename to `window`** |
| limit_usd | numeric(10,2) | NOT NULL, CHECK > 0 — stays as is |
| alert_at_percent | integer | DEFAULT 80, CHECK 1-100 — **needs rename to `threshold_pct`** |
| action | text | CHECK IN ('alert', 'throttle', 'block') |
| is_active | boolean | DEFAULT true |
| created_at | timestamptz | |
| updated_at | timestamptz | |

RLS policies already exist: select/insert/update/delete own (auth.uid() = user_id). All 4 policies are in place.

### What migration 004 needs to do

```sql
-- Rename period → window (window is reserved in PostgreSQL, must quote or use underscore)
-- Note: "window" is a PostgreSQL reserved word — use quoted identifier or rename to budget_window
ALTER TABLE public.budget_rules RENAME COLUMN period TO budget_window;

-- Rename alert_at_percent → threshold_pct
ALTER TABLE public.budget_rules RENAME COLUMN alert_at_percent TO threshold_pct;
```

**Critical:** `window` is a PostgreSQL reserved word. Either quote it everywhere (`"window"`) or rename to `budget_window`. The phase description says `window` — need to use quoted identifier in SQL and Supabase queries, or use `budget_window` to avoid quoting. Recommend `budget_window` for safety.

### users table — plan column confirmed

The `users` table has `plan text NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'starter', 'growth', 'pro'))` from migration 001.

**Tier mapping for Phase 4:**
- `free` → no budget rules (show upgrade banner)
- `starter` → maps to "Plus" in the UI (alert + block only)
- `growth` → maps to "Plus" in the UI (alert + block only)
- `pro` → throttle also available

The billing page UI uses `free`, `plus`, `pro` labels but the DB uses `free`, `starter`, `growth`, `pro`. The billing page shows plan IDs as `free`, `plus`, `pro` but those don't match the DB CHECK constraint. The DB has `starter` and `growth`, not `plus`. **lib/tier.ts must map DB values to feature gates, not UI labels.**

---

## Standard Stack

### Core (all already installed — confirmed from package.json)

| Library | Version | Purpose |
|---------|---------|---------|
| zod | ^4.4.3 | Schema validation on API routes |
| @supabase/supabase-js | ^2.107.0 | DB client |
| @supabase/ssr | ^0.10.3 | Server-side Supabase client (cookies) |
| sonner | ^2.0.7 | Toast notifications |
| @phosphor-icons/react | ^2.1.10 | Icons (Bell, Shield, Lightning already in codebase) |

### ShadCN Components Available (confirmed from components/ui/)

The dialog, radio-group, button, input, badge, skeleton, and tooltip components are all present. The mock Budget Rules tab already uses `Dialog`, `DialogContent`, `DialogHeader`, `DialogTitle`, `DialogTrigger`. The new dialog must use `RadioGroup` and `RadioGroupItem` from `components/ui/radio-group.tsx` for the action selection (replacing the Select dropdown in the mock).

---

## Architecture Patterns

### API Route Pattern (copy exactly from existing routes)

Every API route in this project follows:

```typescript
// 1. Create server client (async)
const supabase = await createClient();

// 2. Authenticate — MANDATORY first step
const { data: { user }, error: authError } = await supabase.auth.getUser();
if (authError || !user) {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

// 3. Parse body (for POST/PATCH)
let body: unknown;
try {
  body = await request.json();
} catch {
  return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
}

// 4. Zod validate
const parsed = schema.safeParse(body);
if (!parsed.success) {
  return NextResponse.json(
    { error: parsed.error.issues[0].message },
    { status: 400 }
  );
}

// 5. Query with user_id scoping (RLS + explicit eq)
// 6. Return NextResponse.json or new NextResponse(null, { status: 204 }) for DELETE
```

Source: `app/api/connections/route.ts` and `app/api/connections/[id]/route.ts`

### Dynamic Route Params Pattern (Next.js 14 App Router)

Params are a Promise — must await:

```typescript
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  // ...
}
```

Source: `app/api/connections/[id]/route.ts`

### DELETE returns 204 with no body

```typescript
return new NextResponse(null, { status: 204 });
```

Source: `app/api/connections/[id]/route.ts`

### Supabase Client — Server vs Client

- **Server routes and server components:** `import { createClient } from "@/lib/supabase/server"` — returns `Promise<SupabaseClient>`, must `await`
- **Client components fetching from API routes:** use `fetch()` to call the route, not direct Supabase client calls
- **Browser Supabase client:** `import { createClient } from "@/lib/supabase/client"` — synchronous, for client components that need direct DB access (currently used only in auth flows)

### Project Detail Page Architecture

`app/(dashboard)/projects/[id]/page.tsx` is an async server component that:
1. Authenticates via `supabase.auth.getUser()`
2. Fetches data with `Promise.all([getProjectStats, getProjectConnections, getProjectAlerts])`
3. Passes all data as props to `ProjectDetailClient` (the "use client" component)

For Phase 4, budget rules must either:
- Be fetched in `page.tsx` and passed as props to `ProjectDetailClient` (preferred — consistent with existing pattern), OR
- Fetched client-side inside `ProjectDetailClient` via `useEffect` + `fetch("/api/budget-rules?projectId=...")`

The client-side fetch approach is simpler for the interactive rules tab (create/delete without page reload). The existing connections and alerts tabs receive static props and don't mutate. The rules tab will mutate (create/delete) so client-side fetch fits better.

### ProjectDetailClient — Current Mock to Replace

The current `BudgetRule` interface in `ProjectDetailClient.tsx` uses camelCase (`limitUsd`, `window`, `thresholdPct`) — these are in-memory mock types. The real API will return snake_case DB columns or need mapping.

The current mock `AddRuleDialog` uses a `Select` dropdown for action — must be replaced with radio cards per locked decisions.

The current delete is instant (filter from state) — must be replaced with DELETE API call + optimistic UI or refetch.

The current empty state is minimal text — must be replaced with illustration + button per locked decisions.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead |
|---------|-------------|-------------|
| Form validation | Custom error state logic | Zod `safeParse` on API side; inline error state on client |
| Auth check in routes | Manual token parsing | `supabase.auth.getUser()` — already the pattern |
| Tier gating | Complex permission objects | Simple `lib/tier.ts` functions that query `users.plan` |
| Toast notifications | Custom notification system | `sonner` (already imported via `toast` from 'sonner') |
| Dialog state | Custom modal management | ShadCN `Dialog` (already used in mock) |

---

## Common Pitfalls

### Pitfall 1: `window` is a PostgreSQL reserved word
**What goes wrong:** `ALTER TABLE budget_rules RENAME COLUMN period TO window` executes, but queries like `.select("window")` in Supabase JS SDK may fail or behave unexpectedly without quoting.
**How to avoid:** Rename to `budget_window` instead of `window`. The phase description says "rename period→window" conceptually; `budget_window` is safe and unambiguous.

### Pitfall 2: Migration numbering collision
**What goes wrong:** Writing the new migration as `003_budget_rules_schema.sql` when `003_more_providers.sql` already exists. Both would apply, but ordering matters and file conflict is confusing.
**How to avoid:** Name it `004_budget_rules_schema.sql`. Migrations 001, 002, 003 are already in place.

### Pitfall 3: budgetChecker.ts still uses old column names after migration
**What goes wrong:** `budgetChecker.ts` queries `.eq("is_active", true)` and references `rule.period` and `rule.alert_at_percent`. After migration 004 renames these, all budget checking silently breaks (no TypeScript error since Supabase returns `any` from `.from()`).
**How to avoid:** In sub-phase 04-05, update `budgetChecker.ts` to use `budget_window` and `threshold_pct`, and update the `BudgetRule` interface in `lib/polling/types.ts` to match.

### Pitfall 4: DB plan values don't match billing UI plan labels
**What goes wrong:** The billing page shows plan IDs `free`, `plus`, `pro` but the DB CHECK constraint is `('free', 'starter', 'growth', 'pro')`. Writing tier checks like `user.plan === 'plus'` will always be false.
**How to avoid:** `lib/tier.ts` must check against actual DB values. Free users: `plan === 'free'`. Plus-equivalent: `plan === 'starter' || plan === 'growth'`. Pro: `plan === 'pro'`. Or define a helper: `canCreateBudgetRules(plan)` returns `plan !== 'free'`.

### Pitfall 5: GET /api/budget-rules without projectId returns all rules
**What goes wrong:** Returning all rules for all projects for the user instead of filtering by projectId. This leaks data and defeats the per-project UI.
**How to avoid:** Require `projectId` query param, validate as UUID with Zod, return 400 if missing. Also verify the project belongs to the authenticated user before returning rules.

### Pitfall 6: Inline delete confirmation causes z-index/layout issues
**What goes wrong:** Rendering the "Delete? [Cancel] [Delete]" inline in the row can cause layout shifts if not carefully sized.
**How to avoid:** Use a fixed-height row and toggle between the normal row content and the confirm content via state. Keep the row height consistent.

### Pitfall 7: Zod v4 API differences
**What goes wrong:** Zod v4 (installed at ^4.4.3) has breaking changes from v3. Notably `.optional()` chaining and `.nullable()` behave slightly differently; error shapes use `.issues` not `.errors`.
**How to avoid:** The existing routes already use `parsed.error.issues[0].message` which is v4 compatible. Match that pattern exactly.

---

## Code Examples

### Zod schema for POST /api/budget-rules (matching project conventions)

```typescript
// Source: pattern from app/api/projects/route.ts and app/api/connections/route.ts
const createBudgetRuleSchema = z.object({
  projectId: z.string().uuid(),
  thresholdPct: z.number().int().min(1).max(100),
  action: z.enum(["alert", "block", "throttle"]),
  limitUsd: z.number().positive().optional(), // only if project has no budget limit
});
```

### lib/tier.ts — canCreateBudgetRules and canUseThrottle

```typescript
// New file — no existing equivalent
export function canCreateBudgetRules(plan: string): boolean {
  return plan !== "free";
}

export function canUseThrottle(plan: string): boolean {
  return plan === "pro";
}
```

### GET /api/budget-rules?projectId=UUID

```typescript
export async function GET(request: Request) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const projectId = searchParams.get("projectId");
  const parsed = z.string().uuid().safeParse(projectId);
  if (!parsed.success) return NextResponse.json({ error: "Invalid projectId" }, { status: 400 });

  // Verify project ownership before returning rules
  const { data: project } = await supabase
    .from("projects")
    .select("id")
    .eq("id", parsed.data)
    .eq("user_id", user.id)
    .single();
  if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { data, error } = await supabase
    .from("budget_rules")
    .select("id, threshold_pct, action, limit_usd, budget_window, created_at")
    .eq("project_id", parsed.data)
    .eq("user_id", user.id)
    .order("created_at", { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ rules: data });
}
```

### Tier check in POST route

```typescript
// After auth, before insert — read user's plan
const { data: userData } = await supabase
  .from("users")
  .select("plan")
  .eq("id", user.id)
  .single();

if (!canCreateBudgetRules(userData?.plan ?? "free")) {
  return NextResponse.json({ error: "Upgrade to Plus to create budget rules" }, { status: 403 });
}

// Throttle action gated to Pro
if (parsed.data.action === "throttle" && !canUseThrottle(userData?.plan ?? "free")) {
  return NextResponse.json({ error: "Throttle action requires Pro plan" }, { status: 403 });
}
```

### Client-side fetch in ProjectDetailClient (rules tab)

```typescript
// Inside "use client" component — fetch rules on mount and after mutations
const [rules, setRules] = useState<BudgetRule[]>([]);
const [loading, setLoading] = useState(true);

useEffect(() => {
  fetch(`/api/budget-rules?projectId=${project.id}`)
    .then(r => r.json())
    .then(data => { setRules(data.rules ?? []); setLoading(false); });
}, [project.id]);
```

### budgetChecker.ts column alignment (sub-phase 04-05)

Current code (needs updating):
```typescript
// BEFORE — uses old column names
.eq("is_active", true)
const spend = await getProjectSpend(supabase, project.id, rule.period);
if (percentUsed < rule.alert_at_percent) continue;
.gte("triggered_at", getPeriodStart(rule.period))
```

After migration 004:
```typescript
// AFTER — uses new column names
.eq("is_active", true)  // this column is NOT renamed, stays as is
const spend = await getProjectSpend(supabase, project.id, rule.budget_window);
if (percentUsed < rule.threshold_pct) continue;
.gte("triggered_at", getPeriodStart(rule.budget_window))
```

The `BudgetRule` interface in `lib/polling/types.ts` must also update `period` to `budget_window` and `alert_at_percent` to `threshold_pct`.

---

## Sub-phase Breakdown Findings

### 04-01: Migration 004 (not 003)

File: `supabase/migrations/004_budget_rules_schema.sql`

What it must do:
1. Rename `period` → `budget_window` (avoid PostgreSQL reserved word `window`)
2. Rename `alert_at_percent` → `threshold_pct`
3. Update the CHECK constraint on the renamed column (drop old, add new)
4. Confirm `user_id` column already exists (it does — in migration 001)
5. No RLS changes needed — all 4 policies already exist

### 04-02: lib/tier.ts

New file. Reads `plan` column. Two exported functions: `canCreateBudgetRules(plan)` and `canUseThrottle(plan)`.

### 04-03: API routes

Two new files:
- `app/api/budget-rules/route.ts` — GET (list by projectId) + POST (create)
- `app/api/budget-rules/[id]/route.ts` — DELETE only (no PATCH per locked decisions)

### 04-04: ProjectDetailClient.tsx — Budget Rules tab

Replace the entire "Budget Rules — mock, Phase 4" section:
1. Remove in-memory `useState<BudgetRule[]>([])` initialization
2. Add `useEffect` to fetch from `/api/budget-rules?projectId=`
3. Replace `AddRuleDialog` with new component using radio cards for action
4. Add tier gate: if `userPlan === 'free'` show blur + banner instead of rules
5. Replace instant delete with API call + inline confirm UI
6. Replace empty state with illustration + button

The `page.tsx` server component must pass `userPlan` (the user's plan from `users` table) as a prop to `ProjectDetailClient`. Currently `page.tsx` does not fetch `users.plan` — it must be added.

### 04-05: budgetChecker.ts alignment

Update `lib/polling/budgetChecker.ts` line references:
- `rule.period` → `rule.budget_window`
- `rule.alert_at_percent` → `rule.threshold_pct`
- `getPeriodStart(rule.period)` → `getPeriodStart(rule.budget_window)`

Update `lib/polling/types.ts` BudgetRule interface to match.

---

## Open Questions

1. **`budget_window` vs `window` as column name**
   - What we know: `window` is a PostgreSQL reserved word; Supabase PostgREST should handle it with quoting but it's error-prone
   - Recommendation: Use `budget_window` in migration 004. Phase description says "rename period→window" which is the concept; `budget_window` satisfies the intent safely.

2. **How to pass userPlan to ProjectDetailClient**
   - What we know: `page.tsx` currently doesn't fetch `users.plan`; `ProjectDetailClient` needs it for the tier gate
   - Recommendation: Add `getProjectStats` or a separate query in `page.tsx` to fetch `plan` from `users` table, pass as `userPlan: string` prop

3. **Inline delete confirm row height**
   - What we know: The current row renders icon + text; switching to "Delete? [Cancel] [Delete]" needs same height
   - Recommendation: Use a fixed-height row (`min-h-[56px]`) and absolute/relative positioning for the confirm state

---

## Sources

### Primary (HIGH confidence — direct codebase inspection)
- `supabase/migrations/001_schema.sql` — budget_rules table definition, users.plan column
- `supabase/migrations/002_schema_updates.sql` — api_connections updates
- `supabase/migrations/003_more_providers.sql` — confirms 003 is taken (provider list expansion)
- `lib/polling/budgetChecker.ts` — current column names in use
- `lib/polling/types.ts` — BudgetRule interface
- `app/api/projects/route.ts` — GET/POST pattern
- `app/api/connections/route.ts` — full POST pattern with validation
- `app/api/connections/[id]/route.ts` — DELETE/PATCH pattern with params Promise
- `app/(dashboard)/projects/[id]/ProjectDetailClient.tsx` — full mock Budget Rules tab
- `app/(dashboard)/projects/[id]/page.tsx` — server component data fetch pattern
- `app/(dashboard)/billing/page.tsx` — plan names in UI (free/plus/pro vs DB free/starter/growth/pro)
- `lib/supabase/server.ts` — async createClient pattern
- `components/ui/` — confirms radio-group, dialog, badge, button, input, skeleton all available
- `package.json` — confirms zod ^4.4.3, sonner ^2.0.7, @phosphor-icons/react ^2.1.10

---

## Metadata

**Confidence breakdown:**
- Migration 004 scope: HIGH — exact column names confirmed from 001_schema.sql
- API route pattern: HIGH — copied directly from existing routes
- Tier mapping: HIGH — users.plan CHECK constraint confirmed; billing page plan labels also confirmed
- budgetChecker alignment: HIGH — exact column references read from source
- Component availability: HIGH — ls of components/ui/ confirmed

**Research date:** 2026-06-07
**Valid until:** Stable — only invalidated by schema or dependency changes
