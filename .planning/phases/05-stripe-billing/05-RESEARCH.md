# Phase 5: Stripe Billing - Research

**Researched:** 2026-06-07
**Domain:** Stripe Node.js SDK v22, Next.js 14 App Router subscription billing
**Confidence:** HIGH

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| F-20 | Stripe checkout for paid plans — "Upgrade Plan" launches Checkout, payment completes, users.plan updated | Checkout session creation pattern, webhook handler, PRICE_MAP lookup verified via Stripe docs |
| F-21 | Tier enforcement throughout app — plan limits enforced on connections/projects API routes | Tier limit constants pattern (canCreateX functions in lib/tier.ts), service role update on webhook, plan-gating in POST handlers |
</phase_requirements>

---

## Summary

Stripe is at v22.2.0 (npm `stripe`) as of June 2026. The SDK uses a singleton pattern initialized with `new Stripe(process.env.STRIPE_SECRET_KEY!)` and optionally pins `apiVersion`. In Next.js 14 App Router, the **webhook raw body problem** is solved by using `await request.text()` — not `request.json()`. This is the single most critical integration detail: Stripe's `webhooks.constructEvent()` hashes the raw string and will throw `SignatureVerificationError` if the body has been parsed/re-serialized.

The plan update flow requires a **Supabase service role client** (`lib/supabase/service.ts` — already exists) because webhook handlers have no authenticated user cookie; RLS would block any `UPDATE` to `users.plan` from the anon client. The correct pattern is: `checkout.session.completed` → store `stripe_customer_id` + look up `subscription.items.data[0].price.id` → map to `'starter'|'growth'|'pro'` via `PRICE_MAP` → `UPDATE public.users SET plan = $plan WHERE stripe_customer_id = $customerId`. Cancellation uses `customer.subscription.deleted` → set plan back to `'free'`.

The billing page is a full client component stub with hardcoded invoices (`app/(dashboard)/settings/billing/page.tsx`). It must be converted to a **server component** that fetches real invoices from `stripe.invoices.list({ customer: stripe_customer_id, limit: 24 })`. The customer portal needs one Stripe Dashboard configuration step (Settings → Billing → Customer Portal) before `billingPortal.sessions.create` works — this is a prerequisite the planner must call out.

**Primary recommendation:** Install `stripe@^22`, create `lib/stripe.ts` as a singleton with typed `PRICE_MAP`, use `request.text()` in the webhook handler, update `users.plan` via service role client, convert billing page to server component.

---

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `stripe` | `^22.2.0` | Official Stripe Node.js SDK — checkout, portal, invoices, webhooks | Only official SDK; v22 pins API version `2026-04-22.dahlia`, includes full TypeScript types inline |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `@supabase/supabase-js` (service client) | already installed | Bypass RLS in webhook handler | Webhook route only — no user session available |
| `zod` | already installed | Validate webhook-derived plan values before DB write | Guard against unexpected price IDs |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| `stripe` npm SDK | Raw `fetch` to Stripe REST API | SDK provides TypeScript types, retry logic, and `constructEvent` — don't hand-roll |
| Service role client in webhook | User session client | User session doesn't exist in webhook context; anon client blocked by RLS on `users` UPDATE |

**Installation:**
```bash
npm install stripe
```

No frontend Stripe.js (`@stripe/stripe-js`) needed — Frugal redirects users to Stripe-hosted Checkout, no embedded payment form.

---

## Architecture Patterns

### Recommended Project Structure
```
lib/
├── stripe.ts              # Singleton client + PRICE_MAP + getPlanFromPriceId()
app/api/stripe/
├── checkout/route.ts      # POST — create checkout session, return {url}
├── portal/route.ts        # POST — create portal session, return {url}
└── webhook/route.ts       # POST — verify sig, handle 3 events, update users.plan
app/(dashboard)/settings/billing/
└── page.tsx               # Convert to server component — fetch real invoices
```

### Pattern 1: Stripe Singleton + PRICE_MAP

**What:** A single Stripe client instance re-used across all server-side calls, plus a constant map from Stripe Price IDs to Frugal plan DB values.

**When to use:** All API routes that call Stripe.

```typescript
// lib/stripe.ts
// Source: Stripe Node.js SDK README + official quickstart docs
import Stripe from "stripe";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("STRIPE_SECRET_KEY is not set");
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2026-04-22.dahlia",
  typescript: true,
});

// DB plan values: 'free' | 'starter' | 'growth' | 'pro'
// PRICE_MAP keys must match the exact Price IDs created in the Stripe Dashboard
export const PRICE_MAP: Record<string, "starter" | "growth" | "pro"> = {
  [process.env.STRIPE_PRICE_STARTER_MONTHLY!]: "starter",
  [process.env.STRIPE_PRICE_STARTER_YEARLY!]:  "starter",
  [process.env.STRIPE_PRICE_GROWTH_MONTHLY!]:  "growth",
  [process.env.STRIPE_PRICE_GROWTH_YEARLY!]:   "growth",
  [process.env.STRIPE_PRICE_PRO_MONTHLY!]:     "pro",
  [process.env.STRIPE_PRICE_PRO_YEARLY!]:      "pro",
};

export function getPlanFromPriceId(priceId: string): "free" | "starter" | "growth" | "pro" {
  return PRICE_MAP[priceId] ?? "free";
}
```

**Note on billing page plan IDs:** The existing billing UI uses plan IDs `'free'`, `'plus'`, `'pro'`. The `'plus'` UI label maps to both `'starter'` and `'growth'` DB values. The billing page will need updating to map DB plan values to display labels.

### Pattern 2: Checkout Session Creation

**What:** POST route that creates a Stripe Checkout Session in `subscription` mode and returns the session URL to the client. The client then redirects (`window.location.href = url`).

**When to use:** When user clicks "Upgrade Plan".

```typescript
// app/api/stripe/checkout/route.ts
// Source: https://docs.stripe.com/api/checkout/sessions/create
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { stripe } from "@/lib/stripe";

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: userData } = await supabase
    .from("users")
    .select("stripe_customer_id")
    .eq("id", user.id)
    .single();

  const { priceId } = await request.json() as { priceId: string };

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: userData?.stripe_customer_id ?? undefined,
    customer_email: userData?.stripe_customer_id ? undefined : user.email,
    customer_creation: userData?.stripe_customer_id ? undefined : "always",
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings/billing?success=1`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings/billing`,
    metadata: { supabase_user_id: user.id },  // Critical: links session to DB user
    subscription_data: {
      metadata: { supabase_user_id: user.id }, // Also on subscription for subscription.updated
    },
  });

  return NextResponse.json({ url: session.url });
}
```

### Pattern 3: Webhook Handler — Raw Body + Service Role

**What:** POST route at `/api/stripe/webhook` that verifies the Stripe signature using `request.text()`, handles three subscription lifecycle events, and updates `users.plan` via the service role client.

**When to use:** Called by Stripe on every subscription event.

```typescript
// app/api/stripe/webhook/route.ts
// Source: https://docs.stripe.com/webhooks + Next.js official Stripe example
import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { createServiceClient } from "@/lib/supabase/service";
import { getPlanFromPriceId } from "@/lib/stripe";
import type Stripe from "stripe";

export const runtime = "nodejs"; // Required — edge runtime re-encodes body

export async function POST(request: Request) {
  const body = await request.text();  // MUST be text(), not json()
  const sig = request.headers.get("stripe-signature");

  if (!sig) {
    return NextResponse.json({ error: "Missing stripe-signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Verification failed";
    return NextResponse.json({ error: msg }, { status: 400 });
  }

  const supabase = createServiceClient(); // Bypasses RLS

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const customerId = session.customer as string;
      const userId = session.metadata?.supabase_user_id;
      if (!userId) break;

      // Retrieve subscription to get price ID
      const sub = await stripe.subscriptions.retrieve(session.subscription as string);
      const priceId = sub.items.data[0]?.price.id;
      const plan = getPlanFromPriceId(priceId ?? "");

      await supabase
        .from("users")
        .update({ plan, stripe_customer_id: customerId })
        .eq("id", userId);
      break;
    }

    case "customer.subscription.updated": {
      const sub = event.data.object as Stripe.Subscription;
      const priceId = sub.items.data[0]?.price.id;
      const plan = getPlanFromPriceId(priceId ?? "");
      const customerId = sub.customer as string;

      await supabase
        .from("users")
        .update({ plan })
        .eq("stripe_customer_id", customerId);
      break;
    }

    case "customer.subscription.deleted": {
      const sub = event.data.object as Stripe.Subscription;
      const customerId = sub.customer as string;

      await supabase
        .from("users")
        .update({ plan: "free" })
        .eq("stripe_customer_id", customerId);
      break;
    }
  }

  return NextResponse.json({ received: true }, { status: 200 });
}
```

### Pattern 4: Customer Portal Session

**What:** POST route that creates a Stripe Customer Portal session and returns the redirect URL. Customer must already have a `stripe_customer_id`.

```typescript
// app/api/stripe/portal/route.ts
// Source: https://docs.stripe.com/api/customer_portal/sessions/create
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { stripe } from "@/lib/stripe";

export async function POST() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: userData } = await supabase
    .from("users")
    .select("stripe_customer_id")
    .eq("id", user.id)
    .single();

  if (!userData?.stripe_customer_id) {
    return NextResponse.json({ error: "No active subscription" }, { status: 400 });
  }

  const session = await stripe.billingPortal.sessions.create({
    customer: userData.stripe_customer_id,
    return_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings/billing`,
  });

  return NextResponse.json({ url: session.url });
}
```

### Pattern 5: Billing Page — Server Component with Real Invoices

**What:** Convert existing `billing/page.tsx` (client component stub) to a server component that fetches real invoices via Stripe SDK.

```typescript
// app/(dashboard)/settings/billing/page.tsx
// Source: https://docs.stripe.com/api/invoices/list
import { createClient } from "@/lib/supabase/server";
import { stripe } from "@/lib/stripe";
import { BillingClient } from "./BillingClient"; // Keep interactive UI parts in client

export default async function BillingPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: userData } = await supabase
    .from("users")
    .select("plan, stripe_customer_id")
    .eq("id", user!.id)
    .single();

  let invoices: Stripe.Invoice[] = [];
  if (userData?.stripe_customer_id) {
    const result = await stripe.invoices.list({
      customer: userData.stripe_customer_id,
      limit: 24,
    });
    invoices = result.data;
  }

  return (
    <BillingClient
      currentPlan={userData?.plan ?? "free"}
      invoices={invoices}
    />
  );
}
```

Key invoice fields available: `id`, `amount_paid`, `amount_due`, `status` (`paid`|`open`|`draft`|`void`), `hosted_invoice_url`, `invoice_pdf`, `created` (Unix timestamp), `period_start`, `period_end`, `currency`.

### Pattern 6: Tier Enforcement in POST Handlers

**What:** Before creating a connection or project, count existing records and compare to plan limits.

```typescript
// In POST /api/connections and POST /api/projects
// Plan limits (from billing page existing feature lists):
const PLAN_LIMITS = {
  free:    { connections: 1, projects: 1 },
  starter: { connections: 3, projects: 5 },
  growth:  { connections: 3, projects: 5 },
  pro:     { connections: Infinity, projects: Infinity },
} as const;

// Fetch user plan, count existing, enforce:
const { count } = await supabase
  .from("api_connections")
  .select("id", { count: "exact", head: true })
  .eq("user_id", user.id);

const limit = PLAN_LIMITS[plan as keyof typeof PLAN_LIMITS]?.connections ?? 1;
if ((count ?? 0) >= limit) {
  return NextResponse.json(
    { error: "Connection limit reached. Upgrade your plan." },
    { status: 403 }
  );
}
```

### Anti-Patterns to Avoid

- **Using `request.json()` in webhook handler:** Body is parsed and re-serialized, breaking HMAC signature verification. Always `request.text()`.
- **Using anon/session Supabase client in webhook:** No user cookie exists; RLS blocks UPDATE on `users.plan`. Always use `createServiceClient()`.
- **Not setting `export const runtime = "nodejs"` on webhook route:** Edge runtime may re-encode the body before `request.text()` is called, causing signature failures.
- **Using `session.subscription` as plan source in `checkout.session.completed`:** The subscription object on the session is a string ID only, not expanded. Retrieve it separately via `stripe.subscriptions.retrieve()` to get `items.data[0].price.id`.
- **No idempotency guard:** Stripe delivers webhooks at least once. Using `.update()` (not `.insert()`) on the `users` table is inherently idempotent since it's a single row per user.
- **Missing `supabase_user_id` in checkout metadata:** Without this, `checkout.session.completed` cannot link the Stripe customer to the DB user. Always pass it in both `metadata` and `subscription_data.metadata`.
- **Customer portal without Dashboard configuration:** `billingPortal.sessions.create` returns an error if the Customer Portal isn't configured in the Stripe Dashboard (Settings → Billing → Customer Portal). This is a manual prerequisite.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Webhook signature verification | Custom HMAC comparison | `stripe.webhooks.constructEvent()` | Handles timestamp tolerance (±5 min), multiple signature versions, constant-time comparison |
| Price ID → plan mapping | Ad-hoc string matching | `PRICE_MAP` constant + `getPlanFromPriceId()` | Centralized, testable, type-safe — add prices in one place |
| Subscription plan lookup | Parse subscription metadata | `stripe.subscriptions.retrieve(session.subscription)` | Session object only has subscription ID string, not expanded object |
| Invoice download/history UI | Build custom invoice storage | `stripe.invoices.list({ customer })` | Stripe stores complete invoice history; no need for local DB table |

**Key insight:** Stripe is the source of truth for billing state. Don't mirror subscription state to a separate `subscriptions` table — update `users.plan` directly via webhook and query Stripe directly for invoice history.

---

## Common Pitfalls

### Pitfall 1: Webhook Body Re-Encoding Breaks Signature Verification
**What goes wrong:** Signature verification throws `StripeSignatureVerificationError` even with correct `STRIPE_WEBHOOK_SECRET`.
**Why it happens:** Body was read as JSON (which re-serializes it) or edge runtime re-encoded it, changing the raw bytes that were signed by Stripe.
**How to avoid:** Always `await request.text()`. Add `export const runtime = "nodejs"` to the webhook route.
**Warning signs:** Works locally with Stripe CLI but fails in production; or fails intermittently on certain webhook payloads.

### Pitfall 2: Missing Customer Portal Dashboard Configuration
**What goes wrong:** `billingPortal.sessions.create` returns a Stripe error or redirects to a blank page.
**Why it happens:** The Customer Portal must be configured in Stripe Dashboard (Settings → Billing → Customer Portal) before any portal sessions can be created. The API call succeeds only if a portal configuration exists.
**How to avoid:** Document this as a manual setup step in the sub-phase plan. Configure it in both test and live mode.
**Warning signs:** Stripe API returns `No configuration was provided` or similar; portal URL 404s.

### Pitfall 3: `checkout.session.completed` Fires Before Payment Clears (Async Payment Methods)
**What goes wrong:** User plan is upgraded but payment hasn't actually cleared (bank transfers, SEPA debit take days).
**Why it happens:** `checkout.session.completed` fires when the checkout form is submitted, not when payment settles. `session.payment_status` may be `'unpaid'` for async methods.
**How to avoid:** For credit card payments (typical SaaS), `payment_status` is `'paid'` immediately. Check `session.payment_status === 'paid'` before updating plan, or handle `invoice.paid` event additionally. For Frugal V1 (credit cards only), this is LOW risk.
**Warning signs:** User reports upgrade but billing shows pending payment.

### Pitfall 4: `stripe_customer_id` Is Null on First Checkout
**What goes wrong:** Checkout session creation fails or creates duplicate customers.
**Why it happens:** On first purchase, `users.stripe_customer_id` is null. If `customer` param is passed as null, Stripe creates a new customer. On subsequent purchases, you need to pass the existing customer ID to prevent duplicates.
**How to avoid:** Check `stripe_customer_id` before creating session. If null: pass `customer_email` + `customer_creation: "always"`. If not null: pass `customer: userData.stripe_customer_id`. Store the returned `session.customer` in `users.stripe_customer_id` on `checkout.session.completed`.
**Warning signs:** Multiple Stripe Customer objects for the same email in Stripe Dashboard.

### Pitfall 5: TypeScript Errors from `event.data.object` Without Casting
**What goes wrong:** `event.data.object` is typed as `Stripe.Event['data']['object']` which is a union of all Stripe objects — accessing `.customer` or `.items` causes TS errors.
**Why it happens:** Stripe's event type is broad. Inside `switch (event.type)` cases, TypeScript doesn't narrow `event.data.object` automatically.
**How to avoid:** Cast inside each case: `const sub = event.data.object as Stripe.Subscription;` or `const session = event.data.object as Stripe.Checkout.Session;`. No `any` types — use specific Stripe namespace types.
**Warning signs:** TS errors like "Property 'items' does not exist on type...".

### Pitfall 6: Tier Limits Not Enforced in Connections POST
**What goes wrong:** Free users can create more than 1 connection by calling the API directly (bypassing UI).
**Why it happens:** Phase 4 added tier gates only for budget rules; connections/projects POST routes have no limit check yet.
**How to avoid:** Sub-phase 05-05 adds count check before every POST /api/connections and POST /api/projects.
**Warning signs:** Free user with 3+ connections in `api_connections` table.

---

## Code Examples

Verified patterns from official sources:

### Stripe Singleton Initialization
```typescript
// Source: https://github.com/stripe/stripe-node README
import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-04-22.dahlia",
  typescript: true,
});
```

### Webhook constructEvent with App Router
```typescript
// Source: https://docs.stripe.com/webhooks, Next.js official Stripe example
export const runtime = "nodejs";

export async function POST(request: Request) {
  const body = await request.text();
  const sig = request.headers.get("stripe-signature")!;

  const event = stripe.webhooks.constructEvent(
    body,
    sig,
    process.env.STRIPE_WEBHOOK_SECRET!
  );
  // event.type narrowed in switch statement
}
```

### Invoice List for Billing History
```typescript
// Source: https://docs.stripe.com/api/invoices/list?lang=node
const result = await stripe.invoices.list({
  customer: stripeCustomerId,
  limit: 24,
});
// result.data[0]: { id, amount_paid, status, hosted_invoice_url,
//   invoice_pdf, created, period_start, period_end, currency }
```

### Customer Portal Session
```typescript
// Source: https://docs.stripe.com/api/customer_portal/sessions/create
const session = await stripe.billingPortal.sessions.create({
  customer: stripeCustomerId,
  return_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings/billing`,
});
// Redirect user to: session.url
```

### Subscription Item Price ID
```typescript
// Source: https://docs.stripe.com/api/subscriptions/object
// After retrieve: sub.items.data[0].price.id
const sub = await stripe.subscriptions.retrieve(subscriptionId);
const priceId = sub.items.data[0]?.price.id; // e.g. "price_1NX..."
```

### Service Role Client (already exists)
```typescript
// lib/supabase/service.ts — already implemented
import { createClient } from "@supabase/supabase-js";
export function createServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );
}
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `stripe` v5–v15 — `new Stripe(key, { apiVersion })` optional | `stripe` v22 — apiVersion `2026-04-22.dahlia`, TypeScript types inline | 2025–2026 | Must specify compatible apiVersion; SDK types now shipped inline, no separate `@types/stripe` |
| Pages Router: `config = { api: { bodyParser: false } }` for raw body | App Router: `await request.text()` | Next.js 13+ App Router | No special config needed; just read body as text before passing to constructEvent |
| Mirror subscriptions to local `subscriptions` DB table | Store only `users.plan` + `users.stripe_customer_id`, query Stripe for invoices | SaaS pattern evolution | Simpler schema, Stripe is source of truth, no sync bugs |
| `req.blob().text()` (seen in some examples) | `await request.text()` directly | Next.js 14+ | `request.text()` is the standard Web API; both work but `text()` is cleaner |

**Deprecated/outdated:**
- `body-parser` middleware for webhook raw body: not applicable in App Router (no Express middleware layer)
- `@types/stripe` package: types are now bundled in `stripe` npm package itself
- `stripe.customers.createPortalSession()`: replaced by `stripe.billingPortal.sessions.create()` (old alias removed in v13+)

---

## Open Questions

1. **Monthly vs yearly price IDs for billing UI toggle**
   - What we know: The existing billing page has a monthly/yearly toggle. Each interval needs its own Stripe Price ID.
   - What's unclear: Whether the founder has created Stripe Products and Prices yet (test mode).
   - Recommendation: Sub-phase 05-01 should document the required env vars (`STRIPE_PRICE_STARTER_MONTHLY`, `STRIPE_PRICE_STARTER_YEARLY`, etc.) even if values aren't set yet. PRICE_MAP should handle undefined price IDs gracefully at runtime.

2. **`'plus'` plan ID in billing UI vs `'starter'`/`'growth'` in DB**
   - What we know: Billing page uses `id: "plus"` but DB has `'starter'` and `'growth'` as distinct values. `lib/tier.ts` functions treat both identically.
   - What's unclear: Whether to expose both starter+growth as separate Stripe prices or unify under one "Plus" price.
   - Recommendation: Create two Stripe price tiers for UI ("Plus" at $19/$15/mo and "Pro" at $49/$39/mo). Map both starter+growth Price IDs to `'starter'` or `'growth'` in PRICE_MAP (or simplify to just `'starter'`). This is a business decision — planner should keep it simple: Plus → `'starter'`, Pro → `'pro'`.

3. **Webhook endpoint registration for local development**
   - What we know: Stripe CLI (`stripe listen --forward-to localhost:3000/api/stripe/webhook`) is standard for local development.
   - What's unclear: Not a code question, but the planner should note it in sub-phase 05-03 verification steps.
   - Recommendation: Document `stripe listen` command in the plan. `STRIPE_WEBHOOK_SECRET` must come from `stripe listen --print-secret` for local testing.

4. **Existing billing page `plan.current` logic**
   - What we know: The billing page hardcodes `current: true` on the Free plan. When the server component provides `currentPlan` prop, the plan cards need to dynamically mark the active plan.
   - What's unclear: Minor UI detail, but affects which plan card shows "Current Plan" vs "Upgrade Plan".
   - Recommendation: BillingClient component receives `currentPlan: string` prop from server; compares against plan IDs to set `current` field dynamically.

---

## Sources

### Primary (HIGH confidence)
- Stripe official docs — `https://docs.stripe.com/api/checkout/sessions/create` — checkout session parameters and response
- Stripe official docs — `https://docs.stripe.com/api/invoices/list?lang=node` — invoice list API and object fields
- Stripe official docs — `https://docs.stripe.com/api/customer_portal/sessions/create` — portal session creation
- Stripe official docs — `https://docs.stripe.com/api/subscriptions/object` — subscription object shape, items.data, status values
- Stripe official docs — `https://docs.stripe.com/api/checkout/sessions/object` — session.customer and session.subscription field types
- Stripe Node.js SDK README (github.com/stripe/stripe-node) — initialization pattern, singleton, TypeScript usage
- npm registry — stripe v22.2.0 confirmed current as of 2026-06-07
- Next.js official example (github.com/vercel/next.js, with-stripe-typescript) — App Router webhook handler with `constructEvent`

### Secondary (MEDIUM confidence)
- `https://docs.stripe.com/billing/subscriptions/webhooks` — subscription lifecycle events list (verified; specific payload details deferred to SDK types)
- `https://docs.stripe.com/customer-management/integrate-customer-portal` — portal configuration prerequisites (Dashboard setup required)
- Dev.to article by Jonathan Diniz (Feb 2026) — Stripe+Supabase+Next.js 15 integration, service role client pattern, metadata linking approach — cross-referenced with official Stripe docs

### Tertiary (LOW confidence — flagged for validation)
- Plan limits (`free: 1 conn/1 proj`, `starter/growth: 3 conn/5 proj`, `pro: unlimited`) — derived from billing page feature lists in existing UI stub; not independently verified against a requirements document. Planner should confirm with founder before enforcing.

---

## Metadata

**Confidence breakdown:**
- Standard stack (stripe v22, installation): HIGH — npm registry confirmed
- Architecture (singleton, PRICE_MAP, webhook handler): HIGH — official Stripe docs + Next.js official example
- Webhook raw body pattern (`request.text()`, `runtime: "nodejs"`): HIGH — multiple official sources confirm
- Service role for webhook DB writes: HIGH — Supabase docs + verified pattern
- Billing page server component conversion: HIGH — standard Next.js App Router pattern
- Plan limits (connection/project counts): LOW — derived from UI stub feature lists only

**Research date:** 2026-06-07
**Valid until:** 2026-07-07 (Stripe SDK releases frequently but v22 API is stable; webhook patterns are stable)
