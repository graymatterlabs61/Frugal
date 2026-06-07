# Phase 06: Email Alerts + Slack — Research

**Researched:** 2026-06-07
**Domain:** Transactional email (Resend SDK), Slack Incoming Webhooks, alert deduplication, Next.js API route PATCH
**Confidence:** HIGH

---

## Summary

Phase 6 wires up the notification pipeline that already exists as stubs. The alertService.ts file is not a stub — it is substantially implemented, including HTML email construction and Slack block-kit delivery. The main gaps are: (1) `slackWebhookUrl` is hardcoded `null` in budgetChecker.ts because the `projects.slack_webhook_url` column doesn't exist yet; (2) `alert_log.delivery_status` JSONB column referenced in the roadmap doesn't exist yet; (3) the deduplication window is period-based (fires once per budget window), not a fixed 1-hour window; (4) there is no PATCH handler on `/api/projects/[id]` — only DELETE exists; (5) there is no "Notifications" tab in the project detail UI.

The email template (`buildEmailHtml`) is already in alertService.ts — the roadmap's planned `emailTemplates.ts` sub-phase should extract it to a separate file rather than build from scratch. The Resend SDK call pattern is already correct for v6.12.4 (dynamic import, `resend.emails.send()`, destructured `{ error }`).

**Primary recommendation:** The work is mostly plumbing — column migrations, unwiring hardcoded nulls, adding PATCH route, adding Notifications tab. No core logic needs to be invented; it needs to be connected.

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| F-15 | Budget alert fires real email via Resend with correct project/spend/limit data | Resend SDK v6 pattern confirmed; `sendEmail()` in alertService.ts already correct; needs RESEND_API_KEY env var set |
| F-16 | Slack webhook URL configurable per project, stored in DB; alert fires to Slack when threshold crossed | `sendSlack()` in alertService.ts already implemented; blocked only by missing `projects.slack_webhook_url` column and hardcoded `null` in budgetChecker.ts |
| F-17 | Same rule doesn't fire twice within 1-hour deduplication window; alert_log.delivery_status records channel outcomes | Current dedup is period-based (once per budget window), needs strengthening to 1-hour window; `delivery_status` JSONB column needs migration |
</phase_requirements>

---

## Current State Audit (What's Already Built)

### alertService.ts — Status: 90% complete, needs extraction + delivery_status

```
lib/polling/alertService.ts
```

**What exists:**
- `AlertPayload` interface with all needed fields including `slackWebhookUrl?: string | null`
- `fireAlert(supabase, payload)` — calls sendEmail + sendSlack, inserts into alert_log
- `sendEmail(payload, notifiedVia)` — correct Resend v6 dynamic import pattern, builds HTML inline
- `sendSlack(payload, notifiedVia)` — correct Slack Incoming Webhook POST with Block Kit, 5-second AbortSignal timeout
- `buildEmailHtml(payload)` — inline HTML builder, dark theme, brand-consistent

**What's missing:**
- `delivery_status` JSONB is not recorded (the insert writes `notified_via: string[]` but not delivery outcomes per channel)
- The `from:` address is hardcoded as `alerts@frugal.dev` — needs to match a verified Resend domain
- `buildEmailHtml` is inline in alertService.ts; roadmap wants it extracted to `lib/polling/emailTemplates.ts`

### budgetChecker.ts — Status: Works, but slack webhook is hardcoded null

Line 54: `slackWebhookUrl: null, // future: pull from user settings`

The `checkBudgets` select query fetches `projects(id, name, user_id, users(id, email))` but does not fetch `slack_webhook_url`. Once the column exists, the select and the fireAlert call both need updating.

**Current deduplication logic (lines 33-41):**
```typescript
const { data: existing } = await supabase
  .from("alert_log")
  .select("id")
  .eq("rule_id", rule.id)
  .eq("status", "active")
  .gte("triggered_at", getPeriodStart(rule.budget_window))
  .limit(1);
```

This fires once per budget window period, not once per hour. For daily rules this is fine (resets at midnight). For monthly rules it means an alert fires once at the start of the month when threshold is hit, then never again until next month — which is the desired behaviour. The success criterion says "1-hour deduplication window" which may conflict with this approach. See Open Questions.

### Database — Missing Columns

**`projects` table** (from migration 001 + 002):
- Has: `id, user_id, name, description, color, status, created_at, updated_at`
- Missing: `slack_webhook_url text` — needs migration 005

**`alert_log` table** (from migration 001):
- Has: `id, project_id, user_id, rule_id, triggered_at, spend_at_trigger, limit_usd, percent_used` (generated), `action_taken, notified_via text[], status, resolved_at`
- Missing: `delivery_status jsonb` — needs migration 005

### API Routes — Missing PATCH

`app/api/projects/[id]/route.ts` currently has only DELETE. PATCH must be added to save `slack_webhook_url`.

`app/api/projects/route.ts` has GET (list) and POST (create). The existing Zod schema does NOT include `slack_webhook_url`.

### Project Detail UI — Missing Notifications Tab

`ProjectDetailClient.tsx` has four tabs: Overview, Connections, Budget Rules, Alerts.

No "Notifications" tab. One must be added as a fifth tab containing:
- Slack webhook URL input + save button
- Explanation of what the URL does
- Test/status indicator (optional, out of scope per phase)

The component receives `project: ProjectStats` — that type does NOT include `slack_webhook_url` yet. The prop and query will need updating.

---

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| resend | ^6.12.4 (installed) | Transactional email delivery | Already in package.json; Resend official Node SDK |
| @supabase/supabase-js | ^2.107.0 (installed) | DB read/write for alert_log, projects | Already in use throughout |
| zod | ^4.4.3 (installed) | Input validation on PATCH route | Already used on all API routes |
| next (App Router) | 16.2.6 (installed) | PATCH route handler | Already the framework |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| Slack Incoming Webhooks | n/a (HTTP only) | Slack notification delivery | Already implemented via native fetch in sendSlack() |
| sonner | ^2.0.7 (installed) | Toast feedback on webhook save | Already used in ProjectDetailClient |

### Installation
No new packages required. All dependencies are already installed.

---

## Architecture Patterns

### Pattern 1: Resend v6 emails.send()

**Confirmed from official docs (resend.com/docs/send-with-nodejs):**

```typescript
// Correct pattern for v6 — already in alertService.ts
const { Resend } = await import("resend");
const resend = new Resend(process.env.RESEND_API_KEY);

const { data, error } = await resend.emails.send({
  from: "Frugal <alerts@frugal.dev>",   // domain must be verified in Resend dashboard
  to: payload.userEmail,                  // string or string[]
  subject: "Budget alert: ...",
  html: buildEmailHtml(payload),
});
// data is { id: string } on success
// error is { message: string, name: string } on failure
```

**Important:** The `from` domain (`frugal.dev`) must be verified in the Resend dashboard before real sends work. During development, use `onboarding@resend.dev` as the from address, which is Resend's sandbox sender — works for any `to` address without domain verification.

### Pattern 2: Slack Incoming Webhook POST

Already correctly implemented in alertService.ts. Slack's API expects:

```typescript
await fetch(slackWebhookUrl, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    text: "fallback text",  // required for notifications
    blocks: [/* Block Kit blocks */],
  }),
  signal: AbortSignal.timeout(5000),  // already in code — good
});
// Returns HTTP 200 "ok" on success, non-200 or "invalid_payload" on failure
```

### Pattern 3: PATCH route for projects/[id]

Following the project's existing pattern from `app/api/projects/route.ts`:

```typescript
// app/api/projects/[id]/route.ts — add alongside existing DELETE
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  let body: unknown;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }

  const parsed = patchProjectSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });

  const { error } = await supabase
    .from("projects")
    .update(parsed.data)
    .eq("id", id)
    .eq("user_id", user.id);  // RLS + explicit check

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
```

Zod schema for PATCH:
```typescript
const patchProjectSchema = z.object({
  slack_webhook_url: z.url().nullable().optional(),
  // add other patchable fields here if needed
});
```

Note: `z.url()` in Zod v4 validates that the string is a URL. Slack webhook URLs always start with `https://hooks.slack.com/` — this can be the validation pattern.

### Pattern 4: delivery_status JSONB column

The roadmap calls for `alert_log.delivery_status jsonb`. The intent is to record per-channel outcome rather than the binary `notified_via text[]`. Recommended shape:

```typescript
// delivery_status JSONB value written at alert fire time
{
  email: { sent: true, messageId: "re_abc123" },
  slack: { sent: false, error: "Network timeout" }
}
```

This replaces or supplements the existing `notified_via text[]` array. Since `notified_via` is already used, safest approach is to ADD `delivery_status jsonb` and keep `notified_via` for backwards compatibility. The alertService.ts insert can write both.

### Pattern 5: Deduplication — 1-hour window

Success criterion 4 says "same rule doesn't fire twice within 1-hour deduplication window." The current dedup uses `getPeriodStart()` which resets at midnight (daily) or month start (monthly).

To implement 1-hour dedup:

```typescript
const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
const { data: existing } = await supabase
  .from("alert_log")
  .select("id")
  .eq("rule_id", rule.id)
  .gte("triggered_at", oneHourAgo)
  .limit(1);
```

The period-based dedup must also be preserved — otherwise a rule could fire once per hour every hour for the entire month. The correct logic is: fire if `percentUsed >= threshold_pct` AND no alert for this rule in the last 1 hour. The period-based re-arm (after spend resets) is automatic because when a new period starts `triggered_at` values are all in the previous period.

### Recommended Project Structure for New Files

```
lib/polling/
├── alertService.ts        (modify: add delivery_status, pull slack_webhook_url)
├── emailTemplates.ts      (new: extract buildEmailHtml from alertService.ts)
├── budgetChecker.ts       (modify: fetch slack_webhook_url, 1-hour dedup)
app/api/projects/[id]/
├── route.ts               (modify: add PATCH handler)
app/(dashboard)/projects/[id]/
├── ProjectDetailClient.tsx (modify: add Notifications tab)
supabase/migrations/
├── 005_notifications.sql  (new: projects.slack_webhook_url + alert_log.delivery_status)
```

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| HTML email rendering | Custom templating engine | buildEmailHtml() already in alertService.ts | Already dark-themed, brand-consistent |
| Slack message delivery | Custom Slack SDK | Native fetch to Incoming Webhook URL | Slack's Incoming Webhooks require no auth beyond the URL; no SDK needed |
| Email delivery | SMTP server | Resend SDK (already installed) | Handles deliverability, bounces, open tracking |
| URL validation | Custom regex | `z.url()` in Zod v4 | Built-in, handles edge cases |

---

## Common Pitfalls

### Pitfall 1: Resend "from" domain not verified

**What goes wrong:** `resend.emails.send()` returns `error: { name: "validation_error", message: "The gmail.com domain is not allowed..." }` or similar when using an unverified domain in `from`.

**Why it happens:** Resend requires the sending domain (`frugal.dev`) to be verified via DNS records in the Resend dashboard. The API key alone is not enough.

**How to avoid:** During development/testing, use `onboarding@resend.dev` as the `from` address (Resend's shared sandbox). Production requires DNS verification for `frugal.dev`. The code can check `NODE_ENV` to swap the from address, or use a `RESEND_FROM_ADDRESS` env var.

**Warning signs:** Resend error response with `validation_error` name and domain-related message.

### Pitfall 2: `slackWebhookUrl` join query returns nested `projects` shape

**What goes wrong:** When budgetChecker.ts adds `slack_webhook_url` to the Supabase select, the field path through the join is `rule.projects.slack_webhook_url` — the same object already accessed for `project.id`, `project.name`, etc.

**How to avoid:** Simply extend the existing select string:
```typescript
.select("*, projects(id, name, user_id, slack_webhook_url, users(id, email))")
```
Then access `project.slack_webhook_url` in the fireAlert call — replace the hardcoded `null`.

### Pitfall 3: Zod v4 breaking change — z.string().url() removed, use z.url()

**What goes wrong:** In Zod v4 (installed as `^4.4.3`), `z.string().url()` is deprecated/removed. Using it causes a TypeScript error or runtime failure.

**How to avoid:** Use `z.url()` directly (standalone validator in Zod v4), not `z.string().url()`. The PATCH schema for slack_webhook_url should be:
```typescript
slack_webhook_url: z.url().nullable().optional()
```

**Confidence:** MEDIUM — Zod v4 is recent; verify against installed version behaviour.

### Pitfall 4: ProjectStats type doesn't include slack_webhook_url

**What goes wrong:** When adding the Notifications tab to ProjectDetailClient.tsx, the component needs to display the current `slack_webhook_url` value. But `ProjectStats` (from lib/queries/dashboard.ts) doesn't include this field.

**How to avoid:** Either (a) extend `ProjectStats` to include `slack_webhook_url: string | null` and update `getProjectStats()` to fetch it, or (b) make a separate client-side fetch in the Notifications tab. Option (a) is cleaner given the existing pattern.

### Pitfall 5: delivery_status requires alert_log INSERT update

**What goes wrong:** The alert_log insert in alertService.ts currently doesn't include `delivery_status`. Adding the column to the DB without updating the insert leaves the column NULL for all new alerts.

**How to avoid:** Update the `fireAlert()` insert to include `delivery_status` built from the `notifiedVia` tracking already in the function. Build the JSONB object after both `sendEmail` and `sendSlack` complete.

### Pitfall 6: Slack webhook URL input needs debounce or explicit save button

**What goes wrong:** Auto-save on every keystroke would fire PATCH on every character typed in the URL field.

**How to avoid:** Use an explicit "Save" button. Pattern matches the existing AddRuleDialog (explicit form submit). The Notifications tab should have a controlled input + save button that fires PATCH only on submit.

---

## Code Examples

### alertService.ts — Updated fireAlert with delivery_status

```typescript
// Source: analysis of existing alertService.ts + migration 005 pattern
export async function fireAlert(
  supabase: SupabaseClient,
  payload: AlertPayload,
): Promise<void> {
  const deliveryStatus: Record<string, { sent: boolean; messageId?: string; error?: string }> = {};
  const notifiedVia: string[] = [];

  await sendEmail(payload, notifiedVia, deliveryStatus);
  if (payload.slackWebhookUrl) {
    await sendSlack(payload, notifiedVia, deliveryStatus);
  }

  await supabase.from("alert_log").insert({
    project_id: payload.projectId,
    user_id: payload.userId,
    rule_id: payload.ruleId,
    spend_at_trigger: payload.spendUsd,
    limit_usd: payload.limitUsd,
    action_taken: payload.action,
    notified_via: notifiedVia,
    delivery_status: deliveryStatus,  // new jsonb column
    status: "active",
  });
}
```

### Migration 005 — Add slack_webhook_url + delivery_status

```sql
-- supabase/migrations/005_notifications.sql

-- projects: add Slack webhook URL per project
ALTER TABLE public.projects
  ADD COLUMN IF NOT EXISTS slack_webhook_url text;

-- alert_log: add delivery_status JSONB for per-channel outcomes
ALTER TABLE public.alert_log
  ADD COLUMN IF NOT EXISTS delivery_status jsonb;
```

No constraints needed on `slack_webhook_url` at DB level — validation is in the API layer (Zod). No index needed on `delivery_status` (not queried).

### budgetChecker.ts — 1-hour dedup + slack_webhook_url fetch

```typescript
// Replace period-based dedup with 1-hour window
const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
const { data: existing } = await supabase
  .from("alert_log")
  .select("id")
  .eq("rule_id", rule.id)
  .gte("triggered_at", oneHourAgo)
  .limit(1);

if (existing?.length) continue;

// Updated select to include slack_webhook_url
// .select("*, projects(id, name, user_id, slack_webhook_url, users(id, email))")
// Then pass:
await fireAlert(supabase, {
  // ...existing fields...
  slackWebhookUrl: project.slack_webhook_url ?? null,  // was hardcoded null
});
```

### PATCH /api/projects/[id] — Zod schema

```typescript
import { z } from "zod";

const patchProjectSchema = z.object({
  slack_webhook_url: z.union([z.url(), z.literal(""), z.null()]).optional(),
});
```

Using `z.literal("")` allows clearing the URL (empty string from form submit), alongside null for explicit clear.

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `z.string().url()` | `z.url()` | Zod v4 | Standalone URL type, not string refinement |
| React Email JSX | `react: ComponentFn({ props })` — function call not JSX | Resend v6 | Only relevant if using React Email; Frugal uses plain HTML |

---

## Open Questions

1. **1-hour dedup vs period-based dedup — which is authoritative?**
   - What we know: Current code deduplicates by "once per budget window period" (daily resets at midnight, monthly at month start). Success criterion says "1-hour deduplication window."
   - What's unclear: With 1-hour dedup and a monthly rule at 80% threshold, if spend stays above 80%, would the user receive an alert every hour? That could be annoying.
   - Recommendation: Implement 1-hour dedup as stated in the success criteria. This is the more precise and user-controllable behaviour. The hour-by-hour repeat scenario is unlikely at polling cadence and can be revisited if users report alert fatigue.

2. **Resend from address — frugal.dev verified?**
   - What we know: Code uses `alerts@frugal.dev`. DNS verification must be done in the Resend dashboard.
   - What's unclear: Whether `frugal.dev` is a real owned domain with Resend DNS records configured.
   - Recommendation: Add a `RESEND_FROM_ADDRESS` env var defaulting to `onboarding@resend.dev` for development. Document that production requires DNS verification in `.env.example`.

3. **emailTemplates.ts extraction — necessary or cosmetic?**
   - What we know: `buildEmailHtml` is inline in alertService.ts and complete. The roadmap lists a sub-phase (06-03) to extract it to `lib/polling/emailTemplates.ts`.
   - What's unclear: Is this a testability/reusability concern or just organisation?
   - Recommendation: Extract as planned. A separate file makes the template independently editable and testable. It's a move operation, not a rewrite.

---

## Sources

### Primary (HIGH confidence)
- Direct code read: `lib/polling/alertService.ts` — existing implementation
- Direct code read: `lib/polling/budgetChecker.ts` — dedup logic and hardcoded null
- Direct code read: `supabase/migrations/001_schema.sql` through `004_budget_rules_schema.sql` — confirmed missing columns
- Direct code read: `app/api/projects/[id]/route.ts` — confirmed PATCH is missing
- Direct code read: `app/(dashboard)/projects/[id]/ProjectDetailClient.tsx` — confirmed four existing tabs
- [Resend official docs](https://resend.com/docs/send-with-nodejs) — emails.send() v6 API signature confirmed

### Secondary (MEDIUM confidence)
- package.json — `"resend": "^6.12.4"` installed version confirmed
- Zod v4 standalone `z.url()` pattern — inferred from v4 changelog; verify against installed behaviour

---

## Metadata

**Confidence breakdown:**
- Current state audit: HIGH — read directly from source files
- Standard stack: HIGH — all packages already installed, verified versions
- Resend API pattern: HIGH — confirmed from official docs, matches existing code
- Slack webhook pattern: HIGH — already implemented correctly in codebase
- Zod v4 z.url() pattern: MEDIUM — known v4 change, not verified against exact installed minor version
- Architecture: HIGH — follows established codebase patterns

**Research date:** 2026-06-07
**Valid until:** 2026-07-07 (stable tech; Resend SDK unlikely to change in 30 days)
