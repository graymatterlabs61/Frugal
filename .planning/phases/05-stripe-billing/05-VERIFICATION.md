---
phase: 05-stripe-billing
verified: 2026-06-07T00:00:00Z
status: gaps_found
score: 4/5 success criteria verified
gaps:
  - truth: "Upgrade Plan button launches Stripe Checkout, payment completes"
    status: partial
    reason: "The canonical billing page at /settings/billing has a fully wired Upgrade Plan button. However, app/(dashboard)/billing/page.tsx (reachable at /billing) still exists with a stubbed checkout button (toast.info('Stripe checkout — coming soon')). ProjectDetailClient.tsx links to /billing (stub) instead of /settings/billing when a user hits a project limit."
    artifacts:
      - path: "app/(dashboard)/billing/page.tsx"
        issue: "Stale pre-phase page with stubbed checkout button and hardcoded fake invoices — served at /billing"
      - path: "app/(dashboard)/projects/[id]/ProjectDetailClient.tsx"
        issue: "Line 748: Link href='/billing' points to the stub page, not /settings/billing"
    missing:
      - "Either delete app/(dashboard)/billing/page.tsx or redirect it to /settings/billing"
      - "Update ProjectDetailClient.tsx line 748: change href='/billing' to href='/settings/billing'"
human_verification:
  - test: "Visit /settings/billing, click Upgrade Plan for Plus (monthly), complete Stripe Checkout test flow"
    expected: "Stripe Checkout opens with correct price, redirect back to /settings/billing?success=1 shows success toast"
    why_human: "Cannot verify Stripe Checkout session creation succeeds without live Stripe test keys"
  - test: "Trigger a checkout.session.completed webhook event via Stripe CLI"
    expected: "users.plan updated to 'starter' or 'pro' in Supabase within seconds"
    why_human: "Webhook correctness depends on live Stripe signature verification"
  - test: "Cancel subscription via Customer Portal"
    expected: "customer.subscription.deleted fires, users.plan reverts to 'free'"
    why_human: "Requires active subscription in test mode"
---

# Phase 5: Stripe Billing Verification Report

**Phase Goal:** Stripe checkout for Plus/Pro plans, webhook handler to update users.plan, billing history pulled from Stripe invoices, customer portal for cancellation/plan change.
**Verified:** 2026-06-07
**Status:** GAPS FOUND (4/5 success criteria verified — one partial)
**Re-verification:** No — initial verification

---

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | "Upgrade Plan" button launches Stripe Checkout | PARTIAL | /settings/billing button fully wired; /billing stub still live, ProjectDetailClient links to stub |
| 2 | Webhook updates users.plan within seconds of checkout | VERIFIED | webhook/route.ts: runtime=nodejs, request.text(), createServiceClient(), all 3 event handlers implemented correctly |
| 3 | Cancellation reverts plan to 'free' via webhook | VERIFIED | customer.subscription.deleted handler updates plan='free' eq stripe_customer_id |
| 4 | Billing page shows real Stripe invoice history | VERIFIED | page.tsx fetches stripe.invoices.list(), serializes and passes to BillingClient — conditional on stripeCustomerId |
| 5 | Customer portal accessible for self-serve management | VERIFIED | portal/route.ts creates billingPortal.sessions, BillingClient renders "Manage Plan / Cancel" button for paid users |

**Score:** 4/5 truths verified (Truth 1 is partial due to stale /billing route)

---

## Required Artifacts

| Artifact | Status | Details |
|----------|--------|---------|
| `lib/stripe.ts` | VERIFIED | Stripe singleton, PRICE_MAP (4 price IDs), getPlanFromPriceId() with 'free' fallback |
| `lib/tier.ts` | VERIFIED | PLAN_LIMITS const, getConnectionLimit(), getProjectLimit(), canCreateBudgetRules(), canUseBlock(), canUseThrottle() |
| `app/api/stripe/checkout/route.ts` | VERIFIED | Auth guard, Zod validation, stripe_customer_id reuse, supabase_user_id in both metadata paths |
| `app/api/stripe/portal/route.ts` | VERIFIED | Auth guard, stripe_customer_id lookup, billingPortal.sessions.create() |
| `app/api/stripe/webhook/route.ts` | VERIFIED | All critical correctness checks pass (see below) |
| `app/(dashboard)/settings/billing/page.tsx` | VERIFIED | Server component (no "use client"), fetches plan + invoices, passes to BillingClient |
| `app/(dashboard)/settings/billing/BillingClient.tsx` | VERIFIED | "use client" present, handleUpgrade wired to /api/stripe/checkout, handlePortal wired to /api/stripe/portal, invoice list renders real data |
| `app/api/connections/route.ts` | VERIFIED | Limit check (lines 106-131) runs BEFORE checkProviderKey (line 133) |
| `app/api/projects/route.ts` | VERIFIED | Limit check (lines 64-89) runs BEFORE DB insert |
| `app/(dashboard)/billing/page.tsx` | STUB | Stale pre-phase page — hardcoded fake invoices, stubbed checkout button, accessible at /billing |

---

## Critical Correctness Checks

| Check | Status | Evidence |
|-------|--------|----------|
| webhook: `export const runtime = "nodejs"` | PASS | Line 7 of webhook/route.ts |
| webhook: `await request.text()` not json() | PASS | Line 11 of webhook/route.ts |
| webhook: `createServiceClient()` not createClient() | PASS | Line 31 of webhook/route.ts |
| webhook handles checkout.session.completed | PASS | Line 35 — retrieves subscription, extracts priceId, updates plan + stripe_customer_id |
| webhook handles customer.subscription.updated | PASS | Line 60 — looks up by stripe_customer_id, updates plan |
| webhook handles customer.subscription.deleted | PASS | Line 74 — sets plan='free' by stripe_customer_id |
| checkout: supabase_user_id in metadata | PASS | Line 58: `metadata: { supabase_user_id: user.id }` |
| checkout: supabase_user_id in subscription_data.metadata | PASS | Line 59: `subscription_data: { metadata: { supabase_user_id: user.id } }` |
| billing page.tsx: NO "use client" | PASS | No "use client" directive found — confirmed server component |
| BillingClient.tsx: HAS "use client" | PASS | Line 1: `"use client"` |
| connections limit check BEFORE expensive operation | PASS | Limit enforced at lines 106-131; checkProviderKey at line 133 |
| projects limit check BEFORE DB insert | PASS | Limit enforced at lines 64-89; insert at line 91 |

---

## Key Link Verification

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| BillingClient.tsx | /api/stripe/checkout | fetch POST + window.location.href = data.url | WIRED | handleUpgrade() lines 164-188 |
| BillingClient.tsx | /api/stripe/portal | fetch POST + window.location.href = data.url | WIRED | handlePortal() lines 190-201 |
| billing/page.tsx | BillingClient.tsx | import + JSX render with props | WIRED | Line 5 import, line 60 render |
| billing/page.tsx | stripe.invoices.list() | await stripe.invoices.list({ customer }) | WIRED | Lines 31-35 — conditional on stripeCustomerId |
| webhook/route.ts | supabase users table | createServiceClient().from("users").update() | WIRED | Lines 51-56, 68-71, 77-80 |
| connections/route.ts | lib/tier.ts | getConnectionLimit() import + call | WIRED | Line 5 import, line 113 call |
| projects/route.ts | lib/tier.ts | getProjectLimit() import + call | WIRED | Line 4 import, line 72 call |
| ProjectDetailClient.tsx (upgrade link) | /billing (stub) | Link href="/billing" | BROKEN | Should link to /settings/billing |
| SettingsNav.tsx | /settings/billing | href="/settings/billing" | WIRED | Line 21 — correct canonical route |

---

## Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| `app/(dashboard)/billing/page.tsx` | 195 | `toast.info("Stripe checkout — coming soon")` | BLOCKER | Users landing at /billing cannot upgrade — stub buttons do nothing |
| `app/(dashboard)/billing/page.tsx` | 83-100 | Hardcoded fake invoices array | BLOCKER | /billing shows static fake billing history instead of real Stripe data |
| `app/(dashboard)/projects/[id]/ProjectDetailClient.tsx` | 748 | `href="/billing"` | BLOCKER | Upgrade link from project detail page routes to stub, not real billing |
| `app/(dashboard)/settings/SettingsClient.tsx` | 513 | `toast.info("Stripe checkout — coming soon")` | WARNING | Orphaned file (never imported), not user-reachable but confusing |

---

## Human Verification Required

### 1. Stripe Checkout Flow

**Test:** Log in, navigate to /settings/billing, click "Upgrade Plan" on the Plus card (monthly).
**Expected:** Stripe Checkout opens with the correct starter-monthly price; after completing test payment, redirects to /settings/billing?success=1 and a "Plan upgraded successfully!" toast appears.
**Why human:** Cannot verify Stripe API call succeeds or checkout session URL is valid without live test keys.

### 2. Webhook Plan Update

**Test:** Use Stripe CLI (`stripe trigger checkout.session.completed`) or complete a test checkout, then query `users.plan` in Supabase.
**Expected:** `users.plan` updates to 'starter' or 'pro' within seconds; `stripe_customer_id` is populated.
**Why human:** Requires Stripe webhook signature verification with live STRIPE_WEBHOOK_SECRET.

### 3. Cancellation Flow

**Test:** Cancel subscription via Customer Portal, then query `users.plan` in Supabase.
**Expected:** `customer.subscription.deleted` fires; `users.plan` reverts to 'free'.
**Why human:** Requires active test subscription and Stripe CLI webhook forwarding.

### 4. Customer Portal Access

**Test:** As a paid user (has stripe_customer_id), click "Manage Plan / Cancel" on /settings/billing.
**Expected:** Redirects to Stripe Customer Portal for the correct customer.
**Why human:** Portal session requires valid stripe_customer_id in the database.

---

## Gaps Summary

The billing infrastructure is **functionally complete** at the canonical route `/settings/billing`. All critical correctness requirements for the webhook pass. The tier enforcement gates are correctly placed in the API routes before expensive operations.

**One gap blocks full goal achievement:** A stale pre-phase billing page exists at `app/(dashboard)/billing/page.tsx` (served at `/billing`) with a stubbed checkout button and hardcoded fake invoices. This page predates Phase 5 and was never removed. Critically, `ProjectDetailClient.tsx` line 748 links directly to `/billing` — meaning users who hit a project limit and click the upgrade prompt land on this stub page, not the real Stripe-wired billing page.

The `SettingsClient.tsx` billing tab is orphaned (exported but never imported by any route) and poses no user-facing risk, but should be cleaned up.

**Remediation required (2 files):**
1. Delete `app/(dashboard)/billing/page.tsx` or add `redirect("/settings/billing")` at the top.
2. Change `ProjectDetailClient.tsx` line 748 from `href="/billing"` to `href="/settings/billing"`.

---

_Verified: 2026-06-07_
_Verifier: Claude (gsd-verifier)_
