# Security & Access Document — Frugal
**Version:** 2.0 (Auth.js / Neon stack) | **Date:** 2026-06-19

---

## 1. Authentication

### Method
**Auth.js v5 (NextAuth)** with two providers:

| Provider | Mechanism | Implementation |
|----------|-----------|----------------|
| Email magic-link | Resend `sendVerificationRequest` | 15-minute expiry; single-use; no password stored |
| Google OAuth | googleapis scope: email + profile only | Redirect back to `/dashboard` on success |

**No password authentication.** Eliminates the forgot/reset-password attack surface entirely. Pre-launch user base is zero — simplification is safe.

### Session Strategy
**JWT (stateless).** No session-table reads per request. JWT contains `user.id`, `user.email`. Plan is **not** in JWT — read from `users.plan` per request for billing-sensitive operations (stale-plan avoidance).

### Session Configuration
| Setting | Value |
|---------|-------|
| JWT expiry | 30-day sliding |
| Magic-link token expiry | 15 minutes |
| Magic-link token usage | Single-use only |
| Session cookie | HttpOnly, Secure, SameSite=Lax |

### Route Protection
Middleware runs on all `/(dashboard)/` routes — unauthenticated request → redirect to `/login`. API routes check `auth()` at the top of every handler.

---

## 2. Authorization Model

**No Supabase RLS.** Post-migration: app-layer authorization enforces all data isolation.

### Critical Rules (every route must follow — new CLAUDE.md rules post Phase 0)

1. **Every server query is scoped by session user.** All DB reads use `where user_id = session.user.id` or owner-join through `projects`. No unscoped table reads, ever.
2. **DB access only in server code.** Route handlers, server components, workers. Connection string never reaches the client.
3. **Ingest/status routes authenticate by ingest key, not session.** Scoped to the key's single project. Key resolved server-side via SHA-256 hash lookup.
4. **Stripe webhook uses HMAC verification** (`stripe.webhooks.constructEvent`), not session auth. Uses service-level DB write. Must use `request.text()` for raw body (HMAC requires this).
5. **QStash polling route verifies `QSTASH_CURRENT_SIGNING_KEY`** on all POST requests. Dev GET bypasses this for local testing only.

### Route Authorization Pattern

```typescript
// Every session-authenticated route:
const session = await auth()
if (!session?.user?.id) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
}

// Every query scoped to session user:
const project = await db.query.projects.findFirst({
  where: and(
    eq(projects.id, projectId),
    eq(projects.userId, session.user.id)  // ← always present
  )
})
// Resource not found OR belongs to other user → same 404 (don't leak existence)
if (!project) {
  return NextResponse.json({ error: 'Not found' }, { status: 404 })
}
```

---

## 3. User Roles & Permissions

Frugal has one user role. All data isolation is per-user, not per-role. Tier (plan) determines feature access.

### Feature Access by Plan

| Feature | Free | Plus | Pro |
|---------|------|------|-----|
| Create projects | 1 max | 5 max | Unlimited |
| Add connections | 1 max | 3 max | Unlimited |
| Usage history view | 7 days | 90 days | 365 days |
| SDK events/month | 50,000 | 1,000,000 | Unlimited |
| Budget rules — alert | ✗ | ✓ | ✓ |
| Budget rules — block | ✗ | ✓ | ✓ |
| Budget rules — throttle | ✗ | ✗ | ✓ |
| Slack alerts | ✗ | ✓ | ✓ |
| Webhook alerts (HMAC) | ✗ | ✗ | ✓ |
| Burn rate dashboard | ✗ | ✓ | ✓ |
| Per-user attribution | ✗ | ✗ | ✓ |
| Per-user budget limits | ✗ | ✗ | V1.1 |
| Programmatic API access | ✗ | ✗ | V1.1 |
| Support | Community | Email 48h | Priority 24h |

### Plan Enforcement Locations
- `POST /api/projects` — checks `getProjectLimit(plan)` before insert
- `POST /api/connections` — checks `getConnectionLimit(plan)` before insert
- `POST /api/budget-rules` — checks `canCreateBudgetRule(plan)` and `canUseBlock/Throttle(plan)`
- `POST /api/v1/events` — checks monthly event cap from rollups
- `lib/queries/dashboard.ts` — `getHistoryDays(plan)` clamps date filter
- UI — buttons disabled + "Upgrade" prompt at limit (hints only; server enforces)

---

## 4. Sensitive Data Handling

### Provider API Keys

| Step | What happens |
|------|--------------|
| Received via `POST /api/connections` | Immediately AES-256-GCM encrypted in `lib/encryption.ts` |
| Stored in `api_connections.encrypted_key` | Ciphertext only; never plaintext in DB |
| `key_suffix` in `api_connections` | Last 4 chars plaintext — display only |
| Decryption | Server-side only in `lib/polling/worker.ts`; immediately used; not cached |
| Returned to client | Never — not in any API response after initial POST |
| Logged | Never — not in console.log, error logs, or analytics |

**Encryption spec (`lib/encryption.ts`):**
- Algorithm: AES-256-GCM
- Key: `process.env.ENCRYPTION_KEY` (32-byte hex) — throw at startup if absent
- Each encrypt: random 12-byte IV; stores `iv:ciphertext:authTag` as base64

### Ingest Keys (`fr_pk_…`)

| Step | What happens |
|------|--------------|
| Generated | `fr_pk_` + 32 chars base62 (crypto.getRandomValues) |
| Stored | SHA-256 hash in `ingest_keys.key_hash`; only `key_prefix` stored for display |
| Shown to user | Plaintext exactly once in copy modal at creation |
| After creation | Only prefix (`fr_pk_a1b2`) shown for identification |
| Auth lookup | SHA-256 hash → Redis lookup (60s TTL) → project_id |
| Redis cache | Stores `{ projectId, userId, plan }` — never the plaintext key |
| Rotation | Create new key → revoke old atomically; stale key → immediate 401 (cache invalidated) |
| If leaked | Can POST events (telemetry write) and GET status. Cannot read spend data, project config, or provider keys. Rotate immediately. |

### Environment Variables

```
ENCRYPTION_KEY      — 32-byte hex; throw at startup if absent; never logged
NEXTAUTH_SECRET     — JWT signing key; never exposed client-side
STRIPE_SECRET_KEY   — Server-only; never NEXT_PUBLIC_ prefix
STRIPE_WEBHOOK_SECRET — Server-only; raw body required for HMAC
QSTASH_*            — Server-only; signing key verification
RESEND_API_KEY      — Server-only
```

All secrets in Vercel environment variables UI. `.env` file is gitignored. `.env.example` documents all vars with types and examples, never with real values.

---

## 5. Input Validation

**All API routes use Zod.** No `any` types anywhere.

### Session-authenticated routes

```typescript
// POST /api/projects
const schema = z.object({
  name: z.string().min(1).max(100).trim(),
  description: z.string().max(500).optional(),
})

// POST /api/connections
const schema = z.object({
  projectId: z.string().uuid().optional(),
  provider: z.enum(['openai','anthropic','replicate','falai','groq','gemini']),
  apiKey: z.string().min(10).max(500),
})

// POST /api/budget-rules
const schema = z.object({
  projectId: z.string().uuid(),
  budgetWindow: z.enum(['daily','monthly']),
  limitUsd: z.number().positive().max(10_000),
  thresholdPct: z.number().int().min(1).max(100),
  action: z.enum(['alert','block','throttle']),
})
```

### Ingest route

```typescript
// POST /api/v1/events
const eventSchema = z.object({
  id: z.string().uuid(),           // UUIDv7 generated client-side
  provider: z.string().min(1).max(50),
  model: z.string().min(1).max(200),
  inputTokens: z.number().int().min(0),
  outputTokens: z.number().int().min(0),
  occurredAt: z.string().datetime(),
  costUsd: z.number().min(0).optional(),       // for client_reported
  metadata: z.record(z.string(), z.unknown()).optional(),
})
const batchSchema = z.object({
  events: z.array(eventSchema).min(1).max(100),
})
// Additional: body size checked ≤256KB before parsing
```

### Rate limits (Upstash Ratelimit)
- Ingest route: 60 req/min per ingest key (sliding window)
- Auth routes: 10 req/15min per IP (magic-link abuse prevention)

---

## 6. Error Handling

### Auth Errors

| Scenario | Response |
|----------|----------|
| No session on protected API route | `401 { error: 'Unauthorized' }` |
| No session on dashboard page | Middleware redirects to `/login?callbackUrl=...` |
| Session expired | Auth.js auto-refresh; on failure → redirect to `/login` |
| Invalid magic-link | Auth.js shows "Link expired or already used" |
| OAuth failure | Auth.js redirects to `/login?error=OAuthCallback` |

### API Errors

| Scenario | HTTP | Body |
|----------|------|------|
| Zod validation fail | 400 | `{ error: 'Validation failed', issues: [{path, message}] }` |
| Resource not found (wrong user or doesn't exist) | 404 | `{ error: 'Not found' }` — never leak "Forbidden" |
| Plan limit exceeded (projects/connections/rules) | 403 | `{ error: 'Plan limit reached', current: N, limit: M, upgrade: '/billing' }` |
| Server/DB error | 500 | `{ error: 'Internal server error' }` — no stack traces in response; full error in Vercel logs |
| Missing required env var at startup | Process exits | Log: `Missing required env: ENCRYPTION_KEY` |

### Ingest API Errors

| Scenario | HTTP | Response |
|----------|------|----------|
| Invalid or revoked ingest key | 401 | `{ error: 'Invalid key' }` |
| Monthly event cap exceeded | 429 | `{ error: 'Event cap exceeded' }` + `X-Frugal-Cap-Exceeded: true` header |
| Per-key rate limit hit | 429 | `{ error: 'Rate limit exceeded', retryAfter: N }` |
| Batch validation fail | 400 | `{ error: 'Invalid event batch', issues: [...] }` |
| All events deduped | 200 | `{ accepted: 0, deduped: N, dropped: 0 }` |
| Partial success | 200 | `{ accepted: N, deduped: M, dropped: K }` |

### Stripe Webhook Errors

| Scenario | Response |
|----------|----------|
| Invalid HMAC signature | 400 — log attempt (possible replay attack) |
| Unknown event type | 200 — acknowledge + ignore (prevents Stripe retry storm) |
| DB write fail | 500 — Stripe retries with exponential backoff (up to 72h) |
| Duplicate event (Stripe retries) | 200 — idempotency: check if `users.stripe_customer_id` already set before update |

### SDK Fail Modes

| Scenario | `failMode: 'open'` (default) | `failMode: 'closed'` |
|----------|------------------------------|----------------------|
| Budget exceeded (cached state='blocked') | Throw `FrugalBudgetExceededError` | Throw `FrugalBudgetExceededError` |
| Status cache stale > 5 min | Proceed (user AI call succeeds) | Throw `FrugalUnavailableError` |
| Ingest endpoint down | Drop events + log warning | Drop events + log warning |
| Any telemetry error | Caught + swallowed; never propagates | Caught + swallowed; never propagates |

**Principle:** Telemetry failure never breaks user AI calls. All SDK telemetry paths are wrapped in try/catch.

### Polling Worker Errors

| Provider Error | Handling |
|----------------|----------|
| Network error | Set `status='polling_error'`; email user once per 24h; continue other connections |
| 401 invalid key | Set `status='invalid'`; email user; stop polling this connection |
| 429 rate limited | Skip this cycle; log; retry next cycle (5 min) |
| Partial provider data | Log warning; upsert whatever data was received; no crash |

---

## 7. Edge Cases

| Case | Handling |
|------|----------|
| Empty form submission | Zod rejects at `z.string().min(1)`; 400 with field-level errors |
| User accesses another user's resource via URL | DB query scoped to session user → null → 404 (never 403 — don't leak existence) |
| Ingest key leaked and rotated | Rotation creates new key + sets `revoked_at` on old. Stale key: Redis `del` on revoke → 401 on next ingest call. |
| Budget window rolls over (midnight/1st) | Cron backstop recomputes `enforcement_state` each run (≤5 min). Rule-edit routes trigger immediate recompute. |
| Event submitted twice (same UUIDv7) | `ON CONFLICT DO NOTHING` on `usage_events`. Response: `{ accepted: 0, deduped: 1, dropped: 0 }`. Rollup unchanged (atomic tx). |
| Rollup increment + event dedupe race | Handled by single Drizzle `db.transaction()`: event insert (dedup) + rollup increment atomically. |
| Provider API returns 401 during polling | `status='invalid'` set; user email sent once; UI shows "Reconnect" prompt; polling stops for this connection. |
| Stripe webhook received twice (retry) | Check if plan already updated to target state before writing; idempotent update. |
| User submits two identical project names | Allow: project names are not unique (user may duplicate intentionally). `id` is the dedup key. |
| Free user tries to add second project via API | Route: `getProjectLimit(plan) = 1`; count existing; return `403` with upgrade URL before insert. |
| Unknown model in ingest event | `cost_usd = 0`, `cost_source = 'computed'`, log warning, "Unpriced model" badge in dashboard. Never silent, never errors. |
| Slow connection — user submits form twice | API is not idempotent for creates (no unique constraint on project name). UI: disable submit button on first click. |
| QStash delivers webhook twice | Polling worker reads `last_polled_at` + dedupes on `(connection_id, date, model)` unique constraint — safe. |
| User deletes project while SDK is still sending events | `project_id` FK on `usage_events` is CASCADE DELETE — events orphaned. In practice: SDK gets 401 on next status check (key revoked with project). |

---

## 8. Security Checklist (Pre-Launch)

- [ ] `ENCRYPTION_KEY` rotated from any value used in development
- [ ] Stripe webhook secret from production dashboard (not test mode)
- [ ] QStash signing keys from production Upstash account
- [ ] Neon production database has different credentials from dev branch
- [ ] Google OAuth redirect URIs include only `https://getfrugal.dev/*`
- [ ] Resend domain `getfrugal.dev` verified and DKIM configured
- [ ] Vercel environment variables set for all 23 vars (none defaulting to dev values)
- [ ] `npm audit` passes with no high/critical vulnerabilities
- [ ] No `console.log` statements that could leak keys or user data
- [ ] All API routes tested: unauthorized request → 401, not 200 or 500