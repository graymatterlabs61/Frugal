# Auth — better-auth Design (supersedes Plan 2's custom JWT auth)

**Date:** 2026-07-10
**Status:** Approved — ready for implementation planning

## 1. Summary

Replace Plan 2's hand-rolled JWT/argon2/cookie auth (Tasks 1-4 built so far: `UserRepository`, `middleware/auth.ts`, `validators/auth.schema.ts`) with the self-hosted [better-auth](https://better-auth.com) npm package. Database stays Postgres/Neon — no change to Plan 1's foundation (config, errors, logger, encryption, app assembly) or to the other 9 domain tables (organizations, projects, api_connections, etc.).

**Providers:** Google, Apple, GitHub social sign-in + email/password, with OTP-based email verification (code, not a magic link).

## 2. What's discarded vs. kept

**Discarded** (committed, will be reverted): `api/src/repositories/UserRepository.ts`, `api/src/middleware/auth.ts` (custom `signToken`/`authenticate`), `api/src/validators/auth.schema.ts`. Also the `users` table definition in `api/src/db/schema.ts` — better-auth generates its own.

**Kept as-is:** `config/unifiedConfig.ts` shape (extended, not replaced), `utils/errors.ts`, `utils/logger.ts`, `instrument.ts`, `middleware/requestId.ts`, `middleware/errorHandler.ts`, `app.ts` skeleton (reordered, not rewritten), `/health` route, `utils/encryption.ts` (untouched — pure Node crypto, no DB coupling), the other 9 domain tables in `schema.ts`.

## 3. Schema

better-auth's Drizzle/Postgres adapter generates `users`, `sessions`, `accounts`, `verifications` (pluralized via `usePlural: true` to match the existing naming convention). `plan`, `stripeCustomerId`, `stripeSubscriptionId` (needed by the other 9 tables and by billing) are added back via `additionalFields` on the user table config — nothing is lost versus the original spec's `users` table.

The 9 other tables that FK to `users.id` (organizations.ownerId, orgMembers.userId, projects.userId, apiConnections.userId, usageRecords.userId, ingestEvents.userId, proxyRequests.memberUserId, budgetRules.userId, alertLog.userId, notifications.userId) get re-pointed at the new table.

**Verify at implementation time, don't guess now:** run `npx @better-auth/cli generate` first and inspect the actual output — specifically whether the generated `id`/FK columns are Postgres `text` or `uuid` — then reconcile the 9 other tables' FK column types to match (same pattern Plan 1 used: generate, then inspect, then assert).

## 4. Auth configuration (`api/src/auth.ts`)

```ts
betterAuth({
  database: drizzleAdapter(db, { provider: 'pg', schema: authSchema, usePlural: true }),
  emailAndPassword: { enabled: true },
  emailVerification: {
    sendVerificationOTP: async ({ email, otp }) => { /* send via Resend */ },
  },
  plugins: [emailOTP({ /* otp length, expiry */ })],
  socialProviders: {
    google: { clientId: config.google.clientId, clientSecret: config.google.clientSecret },
    github: { clientId: config.github.clientId, clientSecret: config.github.clientSecret },
    apple: {
      clientId: config.apple.clientId,       // Services ID
      teamId: config.apple.teamId,
      keyId: config.apple.keyId,
      privateKey: config.apple.privateKey,
    },
  },
  user: {
    additionalFields: {
      plan: { type: ['free','plus','pro','corp_starter','corp_growth','corp_scale','enterprise'], required: false, defaultValue: 'free' },
      stripeCustomerId: { type: 'string', required: false, input: false },
      stripeSubscriptionId: { type: 'string', required: false, input: false },
    },
  },
  rateLimit: {
    customRules: { '/sign-in/email': { window: 900, max: 5 } }, // spec §8: 5/15min
  },
  baseURL: config.server.baseUrl,
  secret: config.auth.betterAuthSecret,
})
```

Apple needs its own credential set (Services ID as `clientId`, Team ID, Key ID, private key) — materially more setup than Google/GitHub. If Apple Developer Program credentials aren't available yet, the provider is scaffolded but left unconfigured (empty env vars) rather than blocking the rest — same pattern as the existing Stripe env vars.

## 5. Express wiring

```ts
app.all('/api/auth/*splat', toNodeHandler(auth));  // before express.json()
app.use(express.json({ limit: '256kb' }));
```

better-auth owns body parsing for its own routes — mounting after `express.json()` breaks it (documented gotcha). This reorders `app.ts`'s existing middleware chain but doesn't rewrite it.

A thin `requireAuth` middleware (calls `auth.api.getSession({ headers: fromNodeHeaders(req.headers) })`, sets `req.userId`) is the one piece of custom code that survives — later plans' protected routes (Projects, Billing, etc.) use it the same way the original design intended.

## 6. Endpoints (all built-in, zero custom controllers)

Sign-up/sign-in (email+password), sign-out, change-password, update-user (name + additionalFields), get-session, social sign-in + callback for google/apple/github, send/verify OTP. Mounted under `/api/auth/*` (better-auth's own path convention, not the spec's originally-documented `/api/v1/auth/*` — the frontend uses `better-auth/react`'s client, not hand-built URLs, so the exact path doesn't matter in practice).

## 7. Config additions (`unifiedConfig.ts`)

New env vars: `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL` (baseURL), `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`, `GOOGLE_CLIENT_SECRET` (client ID already existed, secret didn't), `APPLE_CLIENT_ID`, `APPLE_TEAM_ID`, `APPLE_KEY_ID`, `APPLE_PRIVATE_KEY`. Reuses existing `RESEND_API_KEY`/`RESEND_FROM_ADDRESS` for OTP email delivery. Drops the now-unused `JWT_SECRET`/`JWT_EXPIRES_IN_SECONDS` (better-auth manages its own session tokens).

## 8. Testing

Same real-Postgres integration approach as before (the already-provisioned Neon test branch stays in use): sign-up → sign-in → get-session → update-user → change-password, hitting better-auth's actual endpoints. Rate-limit and OTP-send get unit-level coverage with mocked email delivery.

## 9. Deferred

- `requireCorporate`/`requirePro` tier gating — still deferred to first tier-gated route (unchanged from original plan).
- Apple credentials — scaffolded, functional once the user supplies real Apple Developer Program values.
