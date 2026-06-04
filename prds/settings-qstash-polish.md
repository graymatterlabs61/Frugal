## Problem Statement

Account and security settings exist as UI but don't save to Supabase. QStash cron is not scheduled (polling only works manually). Several UI elements show "coming soon" toasts. The product isn't launch-ready.

## Solution

Wire account/security settings to Supabase Auth, set up QStash 5-minute polling schedule, apply tier enforcement everywhere it was deferred, and remove/replace non-functional UI elements.

## User Stories

1. As a user, I want to update my display name so the dashboard greeting shows my real name.
2. As a user, I want to change my email so my account reflects my current address.
3. As a user, I want to change my password from settings so I can keep my account secure.
4. As an operator, I want QStash to automatically poll every 5 minutes so users don't need manual polling.
5. As a Free user, I want to be blocked from adding a second connection so tier limits are real.
6. As a Plus user, I want to be blocked at 3 connections so the tier boundary is enforced.
7. As a user, I want to download invoices from the billing page so I can keep records.
8. As a user, I want all UI buttons to either work or be removed so the product feels polished.

## Implementation Decisions

**Phase 1 — Account settings (real Supabase updates)**
- `app/(dashboard)/settings/account/AccountClient.tsx`:
  - Name field: `supabase.auth.updateUser({ data: { full_name: name } })` on save
  - Email field: `supabase.auth.updateUser({ email })` — Supabase sends confirmation automatically
  - Show success/error toast after each update
  - Pre-populate with current user data on mount

**Phase 2 — Security settings (password change)**
- `app/(dashboard)/settings/security/SecurityClient.tsx`:
  - New password + confirm password fields
  - `supabase.auth.updateUser({ password })` on submit
  - Client-side: validate match, min 8 chars before submit
  - Success: clear fields + show "Password updated" toast
  - Error: show Supabase error message directly

**Phase 3 — Tier enforcement completion**
- Apply `lib/tier.ts` (built in Phase 4) everywhere deferred:
  - `GET /api/connections`: no enforcement needed, but return current plan in response metadata
  - `POST /api/connections`: check `connectionCount >= getConnectionLimit(plan)` → 403 `{ error: 'Connection limit reached', upgrade_url: '/billing' }`
  - `POST /api/projects`: check `projectCount >= getProjectLimit(plan)` → 403
  - `lib/queries/dashboard.ts` getDailySpend/getMonthlySpend: clamp `days` param to `getHistoryDays(plan)`
  - Connections page: show count vs limit (e.g. "2 / 3 connections")
  - Projects page: show count vs limit

**Phase 4 — QStash schedule setup**
- Verify `app/api/poll/route.ts` handles both QStash POST (with signature verification) and dev GET
- Document environment variables needed: QSTASH_CURRENT_SIGNING_KEY, QSTASH_NEXT_SIGNING_KEY
- Create `docs/QSTASH_SETUP.md` with step-by-step: Upstash dashboard → Schedules → new schedule → POST https://frugal.dev/api/poll every 5 minutes → copy signing keys to Vercel
- Add POLL_SECRET to Vercel env vars for dev GET endpoint

**Phase 5 — UI polish + launch readiness**
- Billing page:
  - Invoice Download button → `stripe.invoices.retrieve(invoiceId)` → redirect to `hosted_invoice_url`
  - Filter/Export buttons → hide or remove (not MVP)
  - "Join Waitlist" → mailto:waitlist@frugal.dev or external form link
- Remove all `toast.info("X — coming soon")` calls — either wire them or remove the button
- Verify Google OAuth setup documented in README
- Verify RESEND_API_KEY, STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, QSTASH_* all documented in .env.example
- Test end-to-end: sign up → connect key → trigger poll → see real data → set budget rule → trigger alert → receive email

## Testing Decisions

- Test account settings: mock supabase.auth.updateUser at boundary, verify called with correct params
- Test password change: passwords don't match → error shown before API call
- Test tier enforcement: seed user with 1 connection on Free plan → POST /api/connections → 403
- Manual E2E test: full flow from new signup to first alert email
- Verify QStash schedule: use Upstash dashboard to confirm schedule is active

## Out of Scope

- Two-factor authentication (not in V1)
- Team member management (F-22, corporate plan)
- API key generation for programmatic access (F-22, V1.1)
- Preferences / theme / notification preferences UI

## Further Notes

- Google OAuth requires: Supabase Auth → Providers → Google → configure client ID/secret from Google Cloud Console
- QStash schedules persist in Upstash — not code-deployed. Add to ops runbook.
- `POLL_SECRET` dev GET endpoint should be disabled or removed in production
- .env.example should list all required env vars for a new deploy

## Decisions Log

Q: Account settings — custom API route or Supabase Auth directly from client?
A: Supabase Auth client SDK directly — no custom API route needed.
Why: Supabase handles user updates securely with session auth.

Q: QStash schedule — code-deployed or dashboard?
A: Upstash dashboard + documentation. Not code-deployed.
Why: QStash schedules are external to the codebase; document the setup step.

Q: "Coming soon" buttons — remove or replace?
A: Wire what's feasible in V1 (invoice download), remove or hide the rest.
Why: Broken UI erodes trust; better to show fewer working things than many broken ones.

Q: History window enforcement timing?
A: Phase 7 (here) — deferred from Phase 3. Apply getHistoryDays(plan) in query layer.
Why: lib/tier.ts created in Phase 4; safe to apply now without circular deps.
