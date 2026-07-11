# Provider Polling Engine — Design Spec

**Status:** Approved, ready for implementation plan.

**Supersedes:** narrows `docs/superpowers/specs/2026-06-25-frugal-backend-design.md` §3 (Service 1 responsibilities: "BullMQ polling worker"), §7 ("Personal — Polling" data flow), §11 (`workers/`, `providers/` folders) for Plan 5. Also closes the gap Plan 3's spec explicitly left open ("Live provider-key validation... arrives whenever the polling-worker plan is written") — see §7 below for why it stays open a little longer.

## 1. Why this spec exists

The master spec's §2 provider table marks all five providers (OpenAI, Anthropic, Replicate, fal.ai, Gemini) as ✅ for personal-tier polling, with no further detail. Verifying each provider's actual public API before writing code surfaced a hard blocker: **only OpenAI and Anthropic expose an account-level usage/cost API**, and both require an **Admin API key** — a different, more privileged credential than the regular key a developer pastes into `POST /connections` today.

| Provider | Usage API | Auth | Individual/solo accounts? |
|---|---|---|---|
| OpenAI | `GET /v1/organization/usage/completions` | Bearer Admin key | Admin keys require an org, but any org (including a solo dev's default org) can create one |
| Anthropic | `GET /v1/organizations/usage_report/messages` | `x-api-key` Admin key + `anthropic-version` header | **Team/Enterprise Console orgs only** — individual Claude Pro/Max accounts cannot create an Admin key at all |
| Replicate | none | — | `list predictions` returns `predict_time`, never a dollar cost; no account-level billing endpoint exists |
| fal.ai | none (retroactive) | — | billing surfaces only via the `x-fal-billable-units` response header on the original synchronous request — useless for a poller that isn't in the request path |
| Gemini | none via API key | GCP Cloud Billing / BigQuery export | cost lives on the GCP billing account, not reachable with a Gemini API key |

**Decision (confirmed with product owner):** this plan builds real polling for **OpenAI + Anthropic only**. Replicate, fal.ai, and Gemini connections remain fully creatable (Plan 3 already ships them) but are never touched by the poller — no code path in this plan queries, decrypts, or calls out for them. Revisiting those three providers means either a different tracking mechanism (Ingest/SDK) or a hand-maintained pricing table against something like Replicate's `list predictions`, and is out of scope here.

## 2. Goal

Every 5 minutes, and on-demand via `POST /api/v1/poll`, fetch today's token usage from OpenAI/Anthropic's Admin usage APIs for every eligible `api_connections` row, compute cost from a static per-model pricing table, and upsert into `usage_records` — idempotently, so re-polling the same day never double-counts.

## 3. Explicit scope

**In scope:**
- `providers/openai.ts`, `providers/anthropic.ts` — one HTTP call each per poll, parsed into a normalized `ProviderUsageRow[]`
- `providers/pricing.ts` — static `$/1M tokens` table, prefix-matched, used to compute `cost_usd` (neither provider's admin API cleanly attributes cost to a single `(date, model)` pair — see §6)
- Idempotent upsert into `usage_records` keyed on the existing `(connection_id, date, model)` unique index
- Per-connection error isolation: one bad key never blocks the rest of the sweep
- Connection self-healing: a connection that recovers from an error goes back to `status: 'active'` on the next successful poll, no manual reset needed
- `POST /api/v1/poll` — authenticated, manual trigger scoped to the caller's own connections (self-service "refresh now" button)
- A separate BullMQ worker process (`npm run worker`) that repeats the same sweep across *all* users' eligible connections every 5 minutes

**Explicitly deferred:**
- **Replicate, fal.ai, Gemini polling** — no viable API, see §1. Their connections sit unpolled; `last_polled_at` stays `null` forever until a different mechanism exists.
- **Live key validation on `POST /connections`** (Plan 3's deferred item) — the two provider modules built here *could* now validate a key at creation time, but doing so means a blocking network call inside the connection-creation request, a new failure mode, and doesn't need to ship in the same plan as the poller itself. Stays deferred.
- **`budgetChecker` / `alertDispatcher`** (Plan 4's deferred item) — this plan writes `usage_records` only. Nothing in this plan reads `budget_rules` or writes `alert_log`/`notifications`. That wiring is the next plan.
- **Dashboard aggregation endpoints** — now unblocked (real `usage_records` data exists after this plan), but building the queries is separate work.
- **Historical backfill** — a connection created today only accumulates data going forward. No "fetch the last 30 days on connect" step.

## 4. Architecture

```
routes/pollRoutes.ts
  → controllers/PollController.ts        (thin: parse, call service, respond)
    → services/PollingService.ts         (orchestration: decrypt → fetch → price → upsert → status)
      → repositories/ConnectionRepository.ts   (existing, gains 3 methods)
      → repositories/UsageRepository.ts        (new)
      → providers/openai.ts, providers/anthropic.ts   (HTTP + parsing, no DB access)
      → providers/pricing.ts             (pure function, no I/O)

workers/pollWorker.ts    (separate process — BullMQ Queue + Worker, 5-min repeatable job,
                          calls the same PollingService.pollAllActiveConnections())
```

`PollingService` never touches BullMQ and BullMQ never touches HTTP routes — the manual `POST /poll` route and the recurring worker both call the same service functions, differing only in *which connections* they poll (caller's own vs. everyone's).

## 5. Routes

```
POST /api/v1/poll     manually poll the caller's own eligible connections, behind requireAuth
```

Response: `{ results: PollResult[] }` where each item is `{ connectionId, provider, status: 'polled' | 'auth_error' | 'error', modelsUpdated }`. Not paginated — a personal account has at most a handful of connections.

No request body. No tier gate — polling your own connection isn't a plan-limited action, connection *count* already is (Plan 3).

## 6. Provider integration details

### Eligibility filter

A connection is polled only if: `is_active = true`, `provider IN ('openai', 'anthropic')`, and `status NOT IN ('invalid', 'blocked')`. `invalid`/`blocked` mean the stored key is confirmed bad or forbidden — Plan 3 only allows fixing this via delete + recreate (no key-rotation endpoint), so retrying is pure wasted quota.

### Time window

Every poll (manual or scheduled) requests **today's UTC calendar day**, `start = 00:00:00 UTC today` through `end = now`. Both providers' usage APIs return the bucket's *cumulative* totals for the requested range, so each subsequent poll within the same day re-fetches and overwrites the same `(connection_id, date, model)` row with the latest cumulative total — never incremented, always replaced. This is what makes the upsert idempotent and self-correcting; there is no "yesterday catch-up" logic to get wrong.

### OpenAI

```
GET https://api.openai.com/v1/organization/usage/completions
    ?start_time=<unix_seconds>&end_time=<unix_seconds>&bucket_width=1d&group_by=model
Authorization: Bearer <admin key stored as the connection's apiKey>
```

Response (relevant fields only):
```json
{ "data": [{ "results": [{ "model": "gpt-4.1", "input_tokens": 1000, "output_tokens": 200 }] }] }
```
`401` → bad key. `403` → key valid but lacks the usage-read scope (non-admin key). Both map to connection `status: 'invalid'`. Anything else non-2xx → `status: 'polling_error'` (transient, retried next cycle).

### Anthropic

```
GET https://api.anthropic.com/v1/organizations/usage_report/messages
    ?starting_at=<ISO8601>&ending_at=<ISO8601>&bucket_width=1d&group_by=model
x-api-key: <admin key>
anthropic-version: 2023-06-01
```

Response (relevant fields only):
```json
{ "data": [{ "results": [{ "model": "claude-opus-4-8-20260528", "uncached_input_tokens": 1000, "cache_read_input_tokens": 50, "output_tokens": 200 }] }] }
```
`tokensInput = uncached_input_tokens + cache_read_input_tokens` (cache-creation tokens are billed separately and not tracked by this plan — a known gap, see §9). Same `401`/`403` → `invalid` mapping as OpenAI.

### Why cost is computed, not fetched

Both providers *do* have a separate Costs/Cost-Report admin endpoint, but neither attributes a dollar amount per `(date, model)` the way `usage_records` needs: OpenAI's Costs API breaks down by `line_item` (a free-text description, not a clean `model` field); Anthropic's Cost Report breaks down by `token_type` × `context_window` × `service_tier`, again not a single per-model-per-day number without re-deriving it from the same token counts anyway. Computing `cost_usd = tokens × published $/1M rate` from the *usage* endpoint's clean `model` field is simpler, avoids a second API call per connection per poll, and is the same approach third-party LLM-cost tools (Helicone, LangSmith, etc.) use.

### Pricing table

`providers/pricing.ts` holds a small, hand-maintained `{ prefix, inputPer1M, outputPer1M }` table, matched by **longest prefix first** (so `gpt-4.1-mini` matches before the shorter `gpt-4.1`). Unknown models fall back to `cost_usd = 0` with a `logger.warn` — degraded but never crashes the sweep.

**Known ceiling, documented not hidden:** this table needs manual upkeep whenever a provider ships a new model or changes pricing. Current rates (verified July 2026):

| Model prefix | Input $/1M | Output $/1M |
|---|---|---|
| `gpt-4.1-nano` | 0.10 | 0.40 |
| `gpt-4.1-mini` | 0.40 | 1.60 |
| `gpt-4.1` | 2.00 | 8.00 |
| `gpt-4o-mini` | 0.15 | 0.60 |
| `gpt-4o` | 2.50 | 10.00 |
| `claude-opus-4` | 5.00 | 25.00 |
| `claude-sonnet-5` | 2.00 | 10.00 *(intro pricing thru 2026-08-31; $3/$15 after — update at cutover)* |
| `claude-sonnet-4` | 3.00 | 15.00 |
| `claude-haiku-4` | 1.00 | 5.00 |

## 7. Product/UX note (not a backend task, flagging so it isn't lost)

For OpenAI and Anthropic connections, the key a user pastes into `POST /connections` must now be their **Admin API key**, not the regular key used for completions — Anthropic additionally restricts Admin key creation to Team/Enterprise Console orgs, so a true solo developer on an individual Anthropic plan cannot use polling for Claude at all. This is a real product-copy and onboarding-flow concern (the Connections UI needs to say "paste your *Admin* key" and probably link each provider's admin-key creation docs) but has no backend code implication beyond what's already built — flagging it here so whoever writes the frontend/copy doesn't discover it cold.

## 8. Error handling

No new error classes in `utils/errors.ts` — this domain has no HTTP-facing validation errors beyond `requireAuth`'s existing 401. New provider-internal errors in `providers/errors.ts`:

- `ProviderAuthError` — provider returned 401 or 403 → connection `status: 'invalid'`
- `ProviderRequestError` — any other non-2xx or network failure → connection `status: 'polling_error'`

`PollingService` catches both per-connection, logs via Pino, and continues the sweep — never throws out of `pollConnectionsForUser`/`pollAllActiveConnections`.

## 9. Known gaps (explicit, not forgotten)

- Anthropic cache-creation tokens (`cache_creation.ephemeral_1h_input_tokens` / `ephemeral_5m_input_tokens`) are not counted in `tokensInput` — they're billed at a different rate than regular input tokens and folding them in would require the pricing table to carry a third rate per model. Under-counts spend slightly for heavy prompt-caching users. Revisit if this proves material.
- No pagination handling for either provider's `next_page` cursor — fine for a single connection's single-day query at any realistic personal-tier volume; add a cursor loop if a `next_page` ever comes back non-null in practice.
- No rate limiting on `POST /poll` beyond the natural ceiling of "however many connections one user has." Anthropic's docs say once-a-minute sustained polling is fine; a user mashing the refresh button a few times a minute is not a real concern at this scale.

## 10. Testing

Unit tests (Vitest, no network, no DB):
- `pricing.ts` — known-model rates, longest-prefix-wins, unknown-model fallback to 0
- `openai.ts` / `anthropic.ts` — mocked `global.fetch` (`vi.stubGlobal`), asserting request URL/query/headers and parsed output shape; 401/403 → `ProviderAuthError`; 500 → `ProviderRequestError`

Integration tests (Supertest + real Neon test DB, matching every prior plan — `global.fetch` stubbed, DB is real):
- Full poll happy path: create connection with a fake admin key, stub a canned OpenAI usage response, `POST /poll`, assert `usage_records` row + `last_polled_at`/`status` updated
- Re-polling the same day upserts the existing row rather than inserting a second one
- A stubbed 401 response flips connection `status` to `invalid`
- A `replicate`/`falai`/`gemini` connection is silently skipped — no fetch call made for it, no error

## 11. Definition of Done

- `npm test` green against the Neon test branch; `npm run typecheck` exit 0
- `POST /api/v1/poll` populates `usage_records` for an OpenAI or Anthropic connection given a mocked provider response
- Re-polling the same UTC day never creates a second `usage_records` row for the same `(connection_id, date, model)`
- A connection that 401s is marked `invalid` and excluded from the next sweep's eligibility query
- Replicate/fal.ai/Gemini connections are never queried, decrypted, or logged by the poller
- `npm run worker` starts a BullMQ worker process against a real `REDIS_URL` without crashing (manual verification — this repo doesn't run a live Redis in CI, same as `server.ts`/`instrument.ts` bootstrap code already isn't unit-tested)
