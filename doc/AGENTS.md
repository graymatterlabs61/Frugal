# AGENTS.md — Frugal
## Project Context for AI Coding Agents
**Version:** 1.0 | **Date:** June 2026 | **Author:** Nilesh Kumar

---

## Project Overview

**Frugal** is an AI API cost management SaaS. Developers connect their AI provider accounts (OpenAI, Anthropic, Replicate, fal.ai) and get real-time spend dashboards, budget rules with automatic enforcement, and alerts before costs spiral.

**Founder:** Nilesh Kumar | **Stage:** Pre-launch, solo build | **Stack:** Next.js + Supabase

---

## Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Framework | Next.js | 14 (App Router) |
| Language | TypeScript | 5.x |
| Styling | Tailwind CSS + ShadCN/UI | Latest |
| Database | Supabase (PostgreSQL) | Latest |
| Auth | Supabase Auth | Built-in |
| Cache | Upstash Redis | Latest |
| Job Queue | Upstash QStash | Latest |
| Payments | Stripe | Latest SDK |
| Email | Resend | Latest |
| Deployment | Vercel | Latest |
| Error tracking | Sentry | Latest |

---

## File Structure

```
frugal/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   └── signup/page.tsx
│   ├── (dashboard)/
│   │   ├── dashboard/page.tsx        # Main spend overview
│   │   ├── connections/page.tsx      # API key management
│   │   ├── rules/page.tsx            # Budget rules CRUD
│   │   ├── alerts/page.tsx           # Alert log
│   │   └── settings/page.tsx         # Account, billing, Slack
│   ├── api/
│   │   ├── connect/route.ts          # Store API connections
│   │   ├── poll/route.ts             # QStash-triggered polling worker
│   │   ├── dashboard/route.ts        # Aggregated spend data
│   │   ├── rules/route.ts            # Budget rule CRUD
│   │   └── webhooks/
│   │       └── stripe/route.ts       # Stripe subscription events
│   └── layout.tsx
├── components/
│   ├── ui/                           # ShadCN components
│   ├── dashboard/
│   │   ├── SpendChart.tsx
│   │   ├── ProviderCard.tsx
│   │   └── BurnRateIndicator.tsx
│   ├── rules/
│   │   ├── RuleForm.tsx
│   │   └── RuleList.tsx
│   └── alerts/
│       └── AlertLog.tsx
├── lib/
│   ├── supabase/
│   │   ├── client.ts                 # Browser client
│   │   └── server.ts                 # Server client
│   ├── providers/
│   │   ├── openai.ts                 # OpenAI usage API client
│   │   ├── anthropic.ts              # Anthropic usage API client
│   │   ├── replicate.ts              # Replicate usage client
│   │   └── falai.ts                  # fal.ai usage client
│   ├── polling/
│   │   ├── worker.ts                 # Main polling orchestrator
│   │   ├── budgetChecker.ts          # Compares usage to rules
│   │   └── alertService.ts           # Fires email + Slack alerts
│   ├── encryption.ts                 # AES-256 API key encryption
│   └── stripe.ts                     # Stripe client + helpers
├── types/
│   └── index.ts                      # Shared TypeScript types
└── supabase/
    └── migrations/                   # Database migrations
```

---

## Naming Conventions

- **Files:** kebab-case for pages and routes, PascalCase for components
- **TypeScript types:** PascalCase interfaces (e.g. `ApiConnection`, `BudgetRule`)
- **Database tables:** snake_case (e.g. `usage_records`, `budget_rules`)
- **API routes:** REST-style, noun-first (e.g. `/api/connections`, `/api/rules`)
- **Environment variables:** SCREAMING_SNAKE_CASE, prefixed by service (e.g. `OPENAI_SECRET`, `STRIPE_SECRET_KEY`)

---

## Coding Standards

- All components are TypeScript — no plain JS files
- API routes validate input with Zod before processing
- All database operations use Supabase with RLS enforced — never disable RLS
- API keys are encrypted before storage, never logged, never exposed to client
- Every API route checks `supabase.auth.getUser()` before processing — no unauthenticated requests reach business logic
- Error responses always use `{ error: string }` shape with appropriate HTTP status codes
- Polling worker is idempotent — safe to run multiple times for the same time window

---

## Key Architectural Decisions

1. **Polling, not proxy:** Usage data is pulled from provider APIs on 5-minute cron. No proxy layer in v1.0. Accept up to 5-minute enforcement lag.
2. **QStash for cron:** Vercel does not support long-running background jobs. QStash triggers the polling route via HTTP.
3. **Supabase RLS everywhere:** Every table has row-level security. Users can only read their own data.
4. **AES-256 for API keys:** Keys are encrypted with a server-side secret before storage. Decrypted only during polling execution.

---

## Environment Variables Required

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Encryption
ENCRYPTION_SECRET=  # 32-character random string for AES-256

# Stripe
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=

# Resend
RESEND_API_KEY=

# Upstash
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
QSTASH_TOKEN=
QSTASH_CURRENT_SIGNING_KEY=
QSTASH_NEXT_SIGNING_KEY=

# Sentry
NEXT_PUBLIC_SENTRY_DSN=
```

---

## Development Setup

```bash
git clone https://github.com/neilkumar93600/frugal
cd frugal
npm install
cp .env.example .env.local
# Fill in environment variables
npm run dev
```

## Database Setup

```bash
npx supabase init
npx supabase db push
```
