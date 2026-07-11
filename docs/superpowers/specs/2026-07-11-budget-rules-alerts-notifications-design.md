# Budget Rules, Alerts & Notifications Domain — Design Spec

**Status:** Approved, ready for implementation plan.

**Supersedes:** nothing — operationalizes `docs/superpowers/specs/2026-06-25-frugal-backend-design.md` §5 ("Rules & Alerts Domain" — `budget_rules`/`alert_log`/`notifications`, already built in Plan 1), §4 (tier limits table), §6 (routes) for Plan 4.

## 1. Goal

Give authenticated users:
- Full CRUD over their `budget_rules`, tier-gated by which `action` values their plan allows.
- Read + acknowledge/resolve over their `alert_log` rows (`GET`/`PATCH`, no create/delete — these rows are system-generated).
- Read + mark-read over their `notifications` rows (`GET`/`PATCH`, same system-generated restriction).

Follows the `repositories/services/controllers` layering established in Plan 3, and the same authorization rule: every query scoped to the caller, cross-user access returns 404 never 403.

## 2. Explicit Scope

**In scope:** the three resources' CRUD/read/acknowledge API surface, tier-gated budget-rule actions, ownership checks.

**Explicitly deferred:**
- **The polling worker, `budgetChecker`, `alertDispatcher`** (spec §7) — the BullMQ machinery that actually evaluates usage against budget rules and writes `alert_log`/`notifications` rows. No plan for it exists yet. Until it does, `alert_log` and `notifications` are populated only by direct test fixtures (see §6) — the read/acknowledge endpoints are real and correct, but nothing in the running system creates rows for them yet, same way Plan 3 shipped connection storage before any polling worker could validate keys against it.
- **Alert delivery** (Resend email, Slack/custom webhooks, in-app push) — depends on the dispatcher above.
- **Ingest, Billing, Organizations** — separate domains, later plans.

## 3. Architecture

```
routes/budgetRuleRoutes.ts, alertRoutes.ts, notificationRoutes.ts
  → controllers/BudgetRuleController.ts, AlertController.ts, NotificationController.ts
    → services/BudgetRuleService.ts, AlertService.ts, NotificationService.ts
      → repositories/BudgetRuleRepository.ts, AlertRepository.ts, NotificationRepository.ts
```

Same shape as Plan 3's `ProjectRepository`/`ProjectService`/`ProjectController`. All routes mounted under `/api/v1`, behind `requireAuth`.

## 4. Routes

```
GET    /api/v1/budget-rules?projectId=   list caller's rules for one project (projectId required)
POST   /api/v1/budget-rules              create (tier-gated on `action`)
PATCH  /api/v1/budget-rules/:id          update (tier-gated if `action` changes)
DELETE /api/v1/budget-rules/:id          hard delete

GET    /api/v1/alerts                    list caller's alerts (all projects)
PATCH  /api/v1/alerts/:id                set status to 'acknowledged' or 'resolved'

GET    /api/v1/notifications             list caller's notifications
PATCH  /api/v1/notifications/:id/read    mark one read
PATCH  /api/v1/notifications/read-all    mark all of caller's unread notifications read
```

No `POST`/`DELETE` for alerts or notifications — both are system-written only.

## 5. Request/response shapes & validation

All bodies Zod `.strict()`.

**GET /budget-rules?projectId=`<uuid>`** — `projectId` required query param, validated as a UUID (400 if missing/malformed). Service verifies the project belongs to the caller before listing (404 if not — same non-disclosure rule as Plan 3).

**POST /budget-rules**
```ts
{
  projectId: string (uuid);
  budgetWindow: 'daily' | 'monthly';
  limitUsd: number (positive);
  thresholdPct?: number (1-100, default 80);
  action: 'alert' | 'block' | 'throttle';
}
```
Project ownership verified first (404 if not caller's), then the tier gate (§7) on `action` (403 if not allowed).

**PATCH /budget-rules/:id**
```ts
{ budgetWindow?; limitUsd?; thresholdPct?; action?; isActive?: boolean }
```
If `action` is present in the patch, the tier gate re-runs against the new value.

**PATCH /alerts/:id**
```ts
{ status: 'acknowledged' | 'resolved' }
```
(Not `'active'` — that's the system-only initial state, not user-settable.) When the new status is `'resolved'`, the service sets `resolvedAt = now()`.

**PATCH /notifications/:id/read** — no body. Sets `readAt = now()` if not already set (idempotent).

**PATCH /notifications/read-all** — no body. Sets `readAt = now()` on every one of the caller's notifications where `readAt IS NULL`.

## 6. Authorization rule (unchanged from Plan 3)

Every repository query scoped to `WHERE user_id = :callerId`. Cross-user access → 404, never 403.

## 7. Tier gate for budget-rule actions

Per the spec's tier table (Free: no budget action; Plus/Pro: Alert+Block; Corporate/Enterprise: Alert+Block+Throttle), new `src/utils/budgetRuleTier.ts`:

```ts
export const ALLOWED_ACTIONS: Record<PlanTier, ReadonlyArray<'alert' | 'block' | 'throttle'>> = {
  free: [],
  plus: ['alert', 'block'],
  pro: ['alert', 'block'],
  corp_starter: ['alert', 'block', 'throttle'],
  corp_growth: ['alert', 'block', 'throttle'],
  corp_scale: ['alert', 'block', 'throttle'],
  enterprise: ['alert', 'block', 'throttle'],
};
```
`free: []` means a free-plan user's `POST /budget-rules` always 403s, regardless of requested `action` — the dash in the spec's tier table means no budget-rule capability at all on Free, not just no auto-block. Reuses the `PlanTier` type from Plan 3's `src/utils/tier.ts`.

## 8. Testing

Integration tests (Supertest + real Neon, matching Plans 1-3's pattern):
- Budget rules: full CRUD happy path, tier-gate 403 on free-plan create, tier-gate 403 on plus-plan `action: 'throttle'`, cross-user 404, unknown-field rejection.
- Alerts/Notifications: since no endpoint creates these rows, tests seed a fixture row by inserting directly via Drizzle (`db.insert(alertLog).values(...)` / `db.insert(notifications).values(...)`) in the test's arrange step, then exercise `GET`/`PATCH` over real HTTP exactly as Plans 1-3 do. This is the same "arrange via direct DB write, act+assert via HTTP" pattern already implicit in how every other plan's tests set up a signed-in user (better-auth's own DB write) before hitting the actual API under test — no new pattern, just the first time it's used for a table this plan's own endpoints don't write to.

## 9. Definition of Done

- `npm test` green against the Neon test branch; `npm run typecheck` exit 0
- A free-plan user gets 403 on any `POST /budget-rules`; a plus-plan user gets 403 requesting `action: 'throttle'`
- Cross-user access to another user's budget rule/alert/notification returns 404
- `PATCH /alerts/:id` rejects `status: 'active'`
- `PATCH /notifications/read-all` only touches the caller's own unread rows
