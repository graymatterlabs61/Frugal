# Projects & Connections Domain — Design Spec

**Status:** Approved, ready for implementation plan.

**Supersedes:** nothing — this narrows and operationalizes `docs/superpowers/specs/2026-06-25-frugal-backend-design.md` §5 (Projects & Connections Domain schema, already built in Plan 1), §6 (API routes), and §8 (tier enforcement) for the first domain-logic implementation plan (Plan 3).

## 1. Goal

Give authenticated users CRUD over their `projects` and `api_connections` rows, with plan-based count limits enforced server-side. This is the first plan to use the `repositories/services/controllers` layering named in the original spec's §11 folder structure — Plan 1 (foundation) and Plan 2 (better-auth) didn't need it.

## 2. Explicit Scope

**In scope:**
- Personal projects and connections only (`org_id` always `null`)
- Full CRUD for projects; CRUD minus single-GET for connections (matches original spec §6 exactly)
- Server-side plan limit enforcement on create (project count, connection count)
- AES-256-GCM encryption of stored API keys (reuses Plan 1's `utils/encryption.ts`)

**Explicitly deferred (not this plan):**
- **Live provider-key validation** — spec §8 says POST /connections should make a real HTTP call to the provider before storing the key. That needs per-provider client modules (`providers/openai.ts` etc.) which are polling-worker territory, and no plan for the polling worker exists yet. This plan stores connections as `status: 'active'` (unverified) with format-only validation. Live validation arrives whenever the polling-worker plan is written.
- **Org-scoped projects** (`projects.org_id` set) — Organizations don't exist until Plan 6. Building org-aware branches now would be dead code with nothing to exercise it.
- **`requireCorporate`/`requirePro` gate middleware** — the only routes that would need a boolean corp/pro gate are `/orgs/*` and `/proxy/*` (Plan 6 and the separate proxy service), both out of scope here. Projects/Connections tier enforcement is a **count check on create**, not a role gate — see §5.
- **Dashboard endpoints** — depend on `usage_records`, which only the (unbuilt) polling worker populates. Building them now would return permanently-zero data.
- **API key rotation endpoint** — PATCH /connections/:id does not accept a new `apiKey`. Rotating a key is delete + recreate.

## 3. Architecture

```
routes/projectRoutes.ts, connectionRoutes.ts
  → controllers/ProjectController.ts, ConnectionController.ts   (thin: parse, call service, respond)
    → services/ProjectService.ts, ConnectionService.ts          (ownership checks, tier limits, orchestration)
      → repositories/ProjectRepository.ts, ConnectionRepository.ts  (Drizzle queries only)
```

All controllers wrapped in the existing `asyncErrorWrapper`. All routes mounted under `/api/v1`, behind the existing `requireAuth` middleware (Plan 2).

## 4. Routes

```
GET    /api/v1/projects              list caller's projects
POST   /api/v1/projects              create (tier-limited)
GET    /api/v1/projects/:id          fetch one (404 if not caller's)
PATCH  /api/v1/projects/:id          update name/description/color
DELETE /api/v1/projects/:id          hard delete (FK cascade handles children)

GET    /api/v1/connections           list caller's connections
POST   /api/v1/connections           create (tier-limited)
PATCH  /api/v1/connections/:id       update label/isActive only
DELETE /api/v1/connections/:id       hard delete
```

No `GET /connections/:id` — not in the original spec's route list, not added here.

## 5. Request/response shapes & validation

All bodies validated with Zod `.strict()` (reject unknown fields), matching spec §8's "Request Security" rule.

**POST /projects**
```ts
{ name: string (1-200 chars), description?: string, color?: string }
```
`userId` comes from `req.userId`, never the body. `org_id` always `null` (not accepted from the client).

**PATCH /projects/:id**
```ts
{ name?: string, description?: string, color?: string }
```

**POST /connections**
```ts
{ projectId: string (uuid), provider: 'openai'|'anthropic'|'replicate'|'falai'|'gemini', label?: string, apiKey: string }
```
Service verifies `projectId` belongs to `req.userId` before insert (404 if not — same non-leaking rule as below). `apiKey` is encrypted immediately via `encrypt()`, plaintext never persisted or logged, `apiKeySuffix` stores the last 4 chars for display. Response never includes the key or its ciphertext.

**PATCH /connections/:id**
```ts
{ label?: string, isActive?: boolean }
```

## 6. Authorization rule

Every repository query for both resources is scoped to `WHERE user_id = :callerId`. A request for another user's project/connection ID returns **404 NotFoundError**, not 403 — existence of another user's resource is not disclosed. This applies uniformly to GET/PATCH/DELETE.

## 7. Tier limits

New `src/utils/tier.ts`:

```ts
export const PLAN_LIMITS: Record<string, { projects: number; connections: number }> = {
  free: { projects: 1, connections: 1 },
  plus: { projects: 5, connections: 3 },
  pro: { projects: Infinity, connections: Infinity },
  // corp_* / enterprise: unlimited for both (corp seats are gated elsewhere, Plan 6)
  corp_starter: { projects: Infinity, connections: Infinity },
  corp_growth: { projects: Infinity, connections: Infinity },
  corp_scale: { projects: Infinity, connections: Infinity },
  enterprise: { projects: Infinity, connections: Infinity },
};
```

On `POST /projects` and `POST /connections`, the service counts the caller's existing rows (projects: by `user_id`; connections: by `user_id`, account-wide per spec's tier table, not per-project) and throws `ForbiddenError` (403) if the count is at or above the plan's limit before inserting.

**Plan lookup:** `requireAuth` (Plan 2, `src/middleware/requireAuth.ts`) gets one addition — alongside `req.userId = session.user.id`, it sets `req.userPlan = session.user.plan`. better-auth's session already carries `plan` (added as a `user.additionalFields` entry in Plan 2 Task 4), so this is a same-object read, no extra DB round trip. `src/types/express.d.ts` gains `userPlan?: string` on `Express.Request`.

## 8. Error handling

No new error classes. Reuses existing `src/utils/errors.ts`:
- `ValidationError` (400) — Zod parse failure
- `NotFoundError` (404) — resource missing or not caller's
- `ForbiddenError` (403) — at plan limit

## 9. Testing

Unit tests: `tier.ts`'s `PLAN_LIMITS` shape and any limit-lookup helper.

Integration tests (Supertest + real Neon test DB, matching the Plan 1/2 pattern — no DB mocking in this codebase): full CRUD happy path for both resources, cross-user access returns 404, create beyond plan limit returns 403, connection create with unencrypted-key-never-in-response assertion.

## 10. Definition of Done

- `npm test` green against the Neon test branch; `npm run typecheck` exit 0
- A free-plan user can create exactly 1 project and 1 connection, the 2nd attempt at each returns 403
- A user cannot GET/PATCH/DELETE another user's project or connection (404)
- `api_connections.api_key_encrypted` never appears in any response body, ever
- Zero `process.env` reads outside `unifiedConfig.ts`, zero `console.log` in `src/` (existing project-wide rules, unchanged)
