## Problem Statement

The billing page shows plan cards and invoice history but every action triggers a "coming soon" toast. Users cannot upgrade from Free to Plus/Pro, cannot cancel, and cannot view real invoices — making Frugal impossible to monetize.

## Solution

Integrate Stripe Checkout for plan upgrades, a webhook handler to sync subscription state to `users.plan`, real invoice history from the Stripe API, and a customer portal link for self-serve plan management.

## User Stories

1. As a Free user, I want to click "Upgrade Plan" and complete payment so I can access Plus/Pro features.
2. As a user, I want to be taken to Stripe Checkout for secure payment so I don't have to trust Frugal with my card.
3. As a user, I want my plan to update immediately after successful payment so I can use new features right away.
4. As a Plus/Pro user, I want to see my real invoice history so I can expense the subscription.
5. As a user, I want to cancel or change my plan via Stripe's portal so I don't have to contact support.
6. As a user, I want to choose monthly or annual billing so I can save money on annual.
7. As a developer, I want Stripe webhooks to be verified so malicious actors can't fake subscription events.

## Implementation Decisions

**Phase 1 — Stripe setup + lib/stripe.ts**
- `npm install stripe`
- Create `lib/stripe.ts`: export `stripe` singleton (new Stripe(process.env.STRIPE_SECRET_KEY))
- Export `PRICE_MAP`: maps STRIPE_*_PRICE_ID env vars to plan strings
- Export `getPlanFromPriceId(priceId)`: returns 'plus' | 'pro' | 'free'
- Required env vars: STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, 
  STRIPE_PLUS_MONTHLY_PRICE_ID, STRIPE_PLUS_ANNUAL_PRICE_ID,
  STRIPE_PRO_MONTHLY_PRICE_ID, STRIPE_PRO_ANNUAL_PRICE_ID

**Phase 2 — Checkout session API**
- `app/api/stripe/checkout/route.ts` POST:
  - Auth check: getUser(), fetch users row for stripe_customer_id
  - If no stripe_customer_id: create Stripe customer, save to users.stripe_customer_id
  - Body: `{ priceId: string, interval: 'monthly'|'annual' }`
  - Create Stripe Checkout session, return `{ url }` for client redirect
- `app/api/stripe/portal/route.ts` POST:
  - Create Stripe billing portal session, return `{ url }` for redirect

**Phase 3 — Webhook handler**
- `app/api/stripe/webhook/route.ts` POST:
  - `export const dynamic = 'force-dynamic'` (disable body caching)
  - Read raw body via `req.text()`, verify with `stripe.webhooks.constructEvent(body, sig, STRIPE_WEBHOOK_SECRET)`
  - Handle `checkout.session.completed`: extract customer_id + subscription items → update users.plan
  - Handle `customer.subscription.updated`: re-check price_id → update plan
  - Handle `customer.subscription.deleted`: set plan = 'free'
  - Use service role client (bypasses RLS) — webhook has no user session
  - Return 200 immediately even on unknown event types (don't fail Stripe's retry)

**Phase 4 — Billing page real data**
- Convert `app/(dashboard)/billing/page.tsx` to server component
- Fetch user's stripe_customer_id from DB
- If stripe_customer_id exists: `stripe.invoices.list({ customer, limit: 12 })`
- Pass invoices as props, replace mock `invoices` array
- Wire "Upgrade Plan" button: `fetch('/api/stripe/checkout', { body: { priceId, interval } })` then `window.location.href = data.url`
- Wire "Manage Subscription" / cancel: `fetch('/api/stripe/portal')` then redirect

**Phase 5 — Tier enforcement in API routes**
- Install `lib/tier.ts` (created in Budget Rules phase) — call `getConnectionLimit`, `getProjectLimit` etc.
- `POST /api/connections`: check `connections.count >= getConnectionLimit(plan)` → 403
- `POST /api/projects`: check `projects.count >= getProjectLimit(plan)` → 403
- `GET /api/usage` (future): enforce history window based on `getHistoryDays(plan)`
- All enforcement server-side; client-side gates are UI hints only

## Testing Decisions

- Test webhook handler: valid signature → 200 + plan updated; invalid signature → 400
- Test checkout route: authenticated → returns Stripe URL; unauthenticated → 401
- Mock `stripe` SDK at boundary — never mock internal Stripe lib callers
- Test tier enforcement: Free user with 1 connection attempts POST /api/connections → 403
- Test plan map: each price ID maps to correct plan string

## Out of Scope

- Custom payment form (use Stripe Checkout hosted page)
- Invoice PDF generation (use Stripe's hosted invoice URLs)
- Proration calculations (Stripe handles this)
- Team billing / seat management (corporate plan, Q3 2026)

## Further Notes

- users.stripe_customer_id already in schema (migration 001) — no migration needed
- Stripe Customer Portal must be enabled in Stripe Dashboard settings
- Test with Stripe CLI webhook forwarding: `stripe listen --forward-to localhost:3000/api/stripe/webhook`
- Annual plans require STRIPE_*_ANNUAL_PRICE_ID env vars — create prices in Stripe Dashboard

## Decisions Log

Q: Webhook raw body in App Router?
A: req.text() gives raw string; pass to stripe.webhooks.constructEvent.
Why: App Router uses Web Fetch API Request — no express bodyParser equivalent.

Q: Invoice storage — local or Stripe API?
A: Stripe API at render time. No local sync.
Why: Single source of truth; avoids dual-write complexity.

Q: Stripe customer creation timing?
A: Lazy — create on first checkout attempt, store stripe_customer_id.
Why: No cost to creating customers; no reason to create at signup.

Q: plan downgrade on delete?
A: Webhook sets plan = 'free' on subscription.deleted. Immediate enforcement.
Why: User loses access to Plus/Pro features on cancellation.
