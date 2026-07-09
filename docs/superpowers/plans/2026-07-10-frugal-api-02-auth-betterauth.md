# Frugal API — Plan 2 (rev 2): Auth via better-auth Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the custom JWT/argon2 auth built under the original Plan 2 (Tasks 1-4: `UserRepository`, `middleware/auth.ts`, `validators/auth.schema.ts`) with self-hosted `better-auth`: email/password, Google/GitHub/Apple social sign-in, and OTP-based email verification, on the existing Postgres/Neon foundation.

**Architecture:** `better-auth` owns its own `users`/`sessions`/`accounts`/`verifications` tables (generated via its CLI, Postgres/Drizzle adapter, `usePlural: true` to match the rest of the schema's naming) and is mounted as a catch-all Express route (`/api/auth/*splat`) ahead of `express.json()`. The 10 existing domain tables that FK to `users.id` keep working unchanged because `schema.ts` imports `users` from the new generated file instead of defining it itself. A thin `requireAuth` middleware wraps `auth.api.getSession(...)` for later plans' protected routes.

**Tech Stack adds:** `better-auth`, `jose` (Apple client-secret JWT signing), `resend` (OTP email delivery — spec already reserved `RESEND_API_KEY`/`RESEND_FROM_ADDRESS` for this in Plan 1's config, never previously used).

**Spec:** `docs/superpowers/specs/2026-06-25-frugal-backend-design.md` (§8 security intent — auth mechanics superseded by `docs/superpowers/specs/2026-07-10-auth-betterauth-design.md`, which is authoritative for this plan).

## Global Constraints

- Service lives at `api/`. All paths below are relative to `api/`.
- `"type": "module"` ESM, relative imports only, `.js` extensions on relative imports.
- `process.env` may be read ONLY inside `src/config/unifiedConfig.ts`.
- No `console.log` in `src` — Pino logger only.
- No raw SQL string concatenation — Drizzle only.
- Every task ends with typecheck + tests green, then a commit.
- Commands run from `api/`. PowerShell-compatible (no `&&` — use `;`).
- Tasks 4, 5, and 7 need a reachable Postgres via `DATABASE_URL` (a Neon test branch is already provisioned and wired into a local, gitignored `api/.env` — source it before running: bash `set -a; source .env; set +a`).
- Google/GitHub/Apple credentials may not exist yet (Apple in particular needs a paid Apple Developer account). Every provider is wired conditionally — the app must boot and all non-social-provider tests must pass with all provider env vars empty.

---

### Task 1: Revert the custom JWT auth built under the original Plan 2

**Files:**
- Delete: `src/repositories/UserRepository.ts`, `tests/integration/userRepository.test.ts`
- Delete: `src/middleware/auth.ts`, `tests/unit/auth.test.ts`
- Delete: `src/validators/auth.schema.ts`, `tests/unit/auth.schema.test.ts`
- Delete: `docs/superpowers/plans/2026-07-09-frugal-api-02-auth.md` (superseded by this file)
- Modify: `package.json` (remove `jsonwebtoken`, `cookie-parser` and their `@types/*`)

**Interfaces:**
- Consumes: nothing
- Produces: a codebase back to the Plan-1-only baseline (config, errors, logger, encryption, app assembly, `/health`) that later tasks build on

- [ ] **Step 1: Delete the four source+test pairs and the old plan doc**

```bash
git rm src/repositories/UserRepository.ts tests/integration/userRepository.test.ts
git rm src/middleware/auth.ts tests/unit/auth.test.ts
git rm src/validators/auth.schema.ts tests/unit/auth.schema.test.ts
git rm ../docs/superpowers/plans/2026-07-09-frugal-api-02-auth.md
rmdir src/repositories src/validators 2>/dev/null || true
```

(`rmdir` only succeeds if those directories are now empty — that's expected and fine; ignore the error if something else still lives there.)

- [ ] **Step 2: Remove the unused deps from `package.json`**

Remove these four lines from `package.json` (two from `dependencies`, two from `devDependencies`):
```
"jsonwebtoken": "^9.0.3",
```
```
"cookie-parser": "^1.4.7",
```
```
"@types/jsonwebtoken": "^9.0.10",
```
```
"@types/cookie-parser": "^1.4.10",
```

Then run:
```bash
npm install
```
Expected: `package-lock.json` updates to drop those four packages and their now-unused transitive deps; no errors.

- [ ] **Step 3: Verify the codebase is back to a clean baseline**

Run: `npm run typecheck; npm test`
Expected: typecheck exit 0; test suite green with exactly the Plan-1 baseline tests (config, errors, logger, schema, encryption, app — no auth-specific tests remain since Task 4+ of this plan will add new ones)

- [ ] **Step 4: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore(api): revert custom JWT auth — better-auth replaces it (see 2026-07-10 design)"
```

---

### Task 2: `unifiedConfig` — drop JWT vars, add better-auth + provider vars

**Files:**
- Modify: `src/config/unifiedConfig.ts`
- Modify: `tests/unit/unifiedConfig.test.ts`
- Modify: `tests/setup.ts`
- Modify: `.env.example`

**Interfaces:**
- Consumes: nothing
- Produces: `config.betterAuth.{secret,url}`, `config.google.{clientId,clientSecret}`, `config.github.{clientId,clientSecret}`, `config.apple.{clientId,teamId,keyId,privateKey,appBundleIdentifier}` (all `string | undefined` except `betterAuth.secret`/`betterAuth.url`, which are required); removes `config.auth` entirely (nothing outside the deleted Task-1 files consumed it)

- [ ] **Step 1: Write the failing test additions** — modify `tests/unit/unifiedConfig.test.ts`

Replace the `validEnv` object and add new test cases:

```ts
import { describe, it, expect } from 'vitest';
import { loadConfig } from '../../src/config/unifiedConfig.js';

const validEnv = {
  NODE_ENV: 'test',
  PORT: '4001',
  DATABASE_URL: 'postgres://u:p@host/db',
  REDIS_URL: 'rediss://host:6379',
  BETTER_AUTH_SECRET: 'x'.repeat(32),
  BETTER_AUTH_URL: 'http://localhost:3000',
  ENCRYPTION_KEY: 'ab'.repeat(32),
  CORS_ORIGINS: 'https://app.frugal.dev, https://frugal.dev',
};

describe('loadConfig', () => {
  it('parses a valid env into grouped config', () => {
    const c = loadConfig(validEnv);
    expect(c.env).toBe('test');
    expect(c.port).toBe(4001);
    expect(c.database.url).toBe('postgres://u:p@host/db');
    expect(c.betterAuth.secret).toBe('x'.repeat(32));
    expect(c.betterAuth.url).toBe('http://localhost:3000');
    expect(c.cors.origins).toEqual(['https://app.frugal.dev', 'https://frugal.dev']);
    expect(c.stripe.secretKey).toBeUndefined();
  });

  it('throws when a required var is missing', () => {
    const { DATABASE_URL: _omit, ...rest } = validEnv;
    expect(() => loadConfig(rest)).toThrow(/DATABASE_URL/);
  });

  it('rejects a short BETTER_AUTH_SECRET', () => {
    expect(() => loadConfig({ ...validEnv, BETTER_AUTH_SECRET: 'short' })).toThrow(
      /BETTER_AUTH_SECRET/,
    );
  });

  it('rejects a non-64-hex ENCRYPTION_KEY', () => {
    expect(() => loadConfig({ ...validEnv, ENCRYPTION_KEY: 'nothex' })).toThrow(/ENCRYPTION_KEY/);
  });

  it('defaults PORT to 3000 and CORS origins to empty', () => {
    const { PORT: _p, CORS_ORIGINS: _c, ...rest } = validEnv;
    const c = loadConfig(rest);
    expect(c.port).toBe(3000);
    expect(c.cors.origins).toEqual([]);
  });

  it('leaves all social-provider fields undefined when their env vars are absent', () => {
    const c = loadConfig(validEnv);
    expect(c.google.clientId).toBeUndefined();
    expect(c.google.clientSecret).toBeUndefined();
    expect(c.github.clientId).toBeUndefined();
    expect(c.apple.clientId).toBeUndefined();
    expect(c.apple.privateKey).toBeUndefined();
  });

  it('picks up social-provider env vars when present', () => {
    const c = loadConfig({
      ...validEnv,
      GOOGLE_CLIENT_ID: 'g-id',
      GOOGLE_CLIENT_SECRET: 'g-secret',
      GITHUB_CLIENT_ID: 'h-id',
      GITHUB_CLIENT_SECRET: 'h-secret',
      APPLE_CLIENT_ID: 'a-id',
      APPLE_TEAM_ID: 'a-team',
      APPLE_KEY_ID: 'a-key',
      APPLE_PRIVATE_KEY: 'a-pk',
      APPLE_APP_BUNDLE_IDENTIFIER: 'com.frugal.app',
    });
    expect(c.google).toEqual({ clientId: 'g-id', clientSecret: 'g-secret' });
    expect(c.github).toEqual({ clientId: 'h-id', clientSecret: 'h-secret' });
    expect(c.apple).toEqual({
      clientId: 'a-id',
      teamId: 'a-team',
      keyId: 'a-key',
      privateKey: 'a-pk',
      appBundleIdentifier: 'com.frugal.app',
    });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/unit/unifiedConfig.test.ts`
Expected: FAIL — `BETTER_AUTH_SECRET`/`BETTER_AUTH_URL` not recognized, `c.betterAuth` undefined, `c.github`/`c.apple` undefined

- [ ] **Step 3: Rewrite `src/config/unifiedConfig.ts`**

```ts
import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(3000),
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  DATABASE_POOL_URL: z.string().min(1).optional(),
  REDIS_URL: z.string().min(1, 'REDIS_URL is required'),
  REDIS_TOKEN: z.string().optional(),
  BETTER_AUTH_SECRET: z.string().min(32, 'BETTER_AUTH_SECRET must be at least 32 characters'),
  BETTER_AUTH_URL: z.string().min(1, 'BETTER_AUTH_URL is required'),
  ENCRYPTION_KEY: z
    .string()
    .regex(/^[0-9a-fA-F]{64}$/, 'ENCRYPTION_KEY must be 32 bytes hex (64 hex chars)'),
  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),
  STRIPE_PRICE_PLUS_MONTHLY: z.string().optional(),
  STRIPE_PRICE_PLUS_YEARLY: z.string().optional(),
  STRIPE_PRICE_PRO_MONTHLY: z.string().optional(),
  STRIPE_PRICE_PRO_YEARLY: z.string().optional(),
  RESEND_API_KEY: z.string().optional(),
  RESEND_FROM_ADDRESS: z.string().optional(),
  SENTRY_DSN: z.string().optional(),
  CORS_ORIGINS: z.string().default(''),
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  GITHUB_CLIENT_ID: z.string().optional(),
  GITHUB_CLIENT_SECRET: z.string().optional(),
  APPLE_CLIENT_ID: z.string().optional(),
  APPLE_TEAM_ID: z.string().optional(),
  APPLE_KEY_ID: z.string().optional(),
  APPLE_PRIVATE_KEY: z.string().optional(),
  APPLE_APP_BUNDLE_IDENTIFIER: z.string().optional(),
});

export interface AppConfig {
  env: 'development' | 'test' | 'production';
  port: number;
  database: { url: string; poolUrl: string | undefined };
  redis: { url: string; token: string | undefined };
  betterAuth: { secret: string; url: string };
  encryption: { key: string };
  cors: { origins: string[] };
  sentry: { dsn: string | undefined };
  stripe: {
    secretKey: string | undefined;
    webhookSecret: string | undefined;
    pricePlusMonthly: string | undefined;
    pricePlusYearly: string | undefined;
    priceProMonthly: string | undefined;
    priceProYearly: string | undefined;
  };
  resend: { apiKey: string | undefined; fromAddress: string | undefined };
  google: { clientId: string | undefined; clientSecret: string | undefined };
  github: { clientId: string | undefined; clientSecret: string | undefined };
  apple: {
    clientId: string | undefined;
    teamId: string | undefined;
    keyId: string | undefined;
    privateKey: string | undefined;
    appBundleIdentifier: string | undefined;
  };
}

export function loadConfig(env: NodeJS.ProcessEnv): AppConfig {
  const parsed = envSchema.safeParse(env);
  if (!parsed.success) {
    const issues = parsed.error.issues
      .map((i) => `${i.path.join('.')}: ${i.message}`)
      .join('; ');
    throw new Error(`Invalid environment configuration — ${issues}`);
  }
  const e = parsed.data;
  return {
    env: e.NODE_ENV,
    port: e.PORT,
    database: { url: e.DATABASE_URL, poolUrl: e.DATABASE_POOL_URL },
    redis: { url: e.REDIS_URL, token: e.REDIS_TOKEN },
    betterAuth: { secret: e.BETTER_AUTH_SECRET, url: e.BETTER_AUTH_URL },
    encryption: { key: e.ENCRYPTION_KEY },
    cors: {
      origins: e.CORS_ORIGINS.split(',').map((s) => s.trim()).filter(Boolean),
    },
    sentry: { dsn: e.SENTRY_DSN },
    stripe: {
      secretKey: e.STRIPE_SECRET_KEY,
      webhookSecret: e.STRIPE_WEBHOOK_SECRET,
      pricePlusMonthly: e.STRIPE_PRICE_PLUS_MONTHLY,
      pricePlusYearly: e.STRIPE_PRICE_PLUS_YEARLY,
      priceProMonthly: e.STRIPE_PRICE_PRO_MONTHLY,
      priceProYearly: e.STRIPE_PRICE_PRO_YEARLY,
    },
    resend: { apiKey: e.RESEND_API_KEY, fromAddress: e.RESEND_FROM_ADDRESS },
    google: { clientId: e.GOOGLE_CLIENT_ID, clientSecret: e.GOOGLE_CLIENT_SECRET },
    github: { clientId: e.GITHUB_CLIENT_ID, clientSecret: e.GITHUB_CLIENT_SECRET },
    apple: {
      clientId: e.APPLE_CLIENT_ID,
      teamId: e.APPLE_TEAM_ID,
      keyId: e.APPLE_KEY_ID,
      privateKey: e.APPLE_PRIVATE_KEY,
      appBundleIdentifier: e.APPLE_APP_BUNDLE_IDENTIFIER,
    },
  };
}

export const config: AppConfig = loadConfig(process.env);
```

- [ ] **Step 4: Update `tests/setup.ts`** (replace the whole file)

```ts
process.env.NODE_ENV = 'test';
process.env.DATABASE_URL ??= 'postgres://test:test@localhost:5432/frugal_test';
process.env.REDIS_URL ??= 'rediss://localhost:6379';
process.env.BETTER_AUTH_SECRET ??= 'test-better-auth-secret-32-bytes!';
process.env.BETTER_AUTH_URL ??= 'http://localhost:3000';
process.env.ENCRYPTION_KEY ??=
  '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';
```

- [ ] **Step 5: Update `.env.example`** — replace the `# Auth` block with:

```
# Better Auth
BETTER_AUTH_SECRET=                # openssl rand -base64 32
BETTER_AUTH_URL=                   # e.g. http://localhost:3000

# Google OAuth
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# GitHub OAuth
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=

# Apple OAuth
APPLE_CLIENT_ID=                   # Services ID
APPLE_TEAM_ID=
APPLE_KEY_ID=
APPLE_PRIVATE_KEY=                 # contents of the .p8 key file
APPLE_APP_BUNDLE_IDENTIFIER=
```

(Remove the old `# Auth` block's `JWT_SECRET`/`JWT_EXPIRES_IN_SECONDS` lines.)

- [ ] **Step 6: Run tests to verify they pass**

Run: `npx vitest run tests/unit/unifiedConfig.test.ts; npm run typecheck`
Expected: PASS (7 tests), typecheck exit 0 — typecheck will also catch any other file still referencing the removed `config.auth`; there should be none left after Task 1

- [ ] **Step 7: Commit**

```bash
git add src/config/unifiedConfig.ts tests/unit/unifiedConfig.test.ts tests/setup.ts .env.example
git commit -m "feat(api): unifiedConfig — drop JWT vars, add better-auth + Google/GitHub/Apple vars"
```

---

### Task 3: OTP email delivery (`src/utils/email.ts`)

**Files:**
- Create: `src/utils/email.ts`
- Test: `tests/unit/email.test.ts`

**Interfaces:**
- Consumes: `config.resend.{apiKey,fromAddress}` (Task 2), `logger` (Plan 1)
- Produces: `sendOtpEmail(params: { to: string; otp: string; purpose: 'sign-in' | 'email-verification' | 'forget-password' }): Promise<void>` — sends via Resend when `config.resend.apiKey` is set; logs at `info` level and skips sending otherwise (keeps dev/test working without a live Resend account)

- [ ] **Step 1: Install resend**

```bash
npm install resend
```

- [ ] **Step 2: Write the failing test** — `tests/unit/email.test.ts`

```ts
import { describe, it, expect, vi, beforeEach } from 'vitest';

const sendMock = vi.fn().mockResolvedValue({ data: { id: 'email_123' }, error: null });
vi.mock('resend', () => ({
  Resend: vi.fn().mockImplementation(() => ({ emails: { send: sendMock } })),
}));

beforeEach(() => {
  sendMock.mockClear();
});

describe('sendOtpEmail', () => {
  it('sends via Resend when RESEND_API_KEY is configured', async () => {
    vi.stubEnv('RESEND_API_KEY', 're_test_key');
    vi.stubEnv('RESEND_FROM_ADDRESS', 'noreply@frugal.dev');
    vi.resetModules();
    const { sendOtpEmail } = await import('../../src/utils/email.js');

    await sendOtpEmail({ to: 'user@example.com', otp: '123456', purpose: 'email-verification' });

    expect(sendMock).toHaveBeenCalledWith(
      expect.objectContaining({
        from: 'noreply@frugal.dev',
        to: 'user@example.com',
      }),
    );
    const call = sendMock.mock.calls[0]![0] as { subject: string; text: string };
    expect(call.text).toContain('123456');
    vi.unstubAllEnvs();
  });

  it('skips sending and does not throw when RESEND_API_KEY is unset', async () => {
    vi.stubEnv('RESEND_API_KEY', '');
    vi.resetModules();
    const { sendOtpEmail } = await import('../../src/utils/email.js');

    await expect(
      sendOtpEmail({ to: 'user@example.com', otp: '654321', purpose: 'sign-in' }),
    ).resolves.toBeUndefined();
    expect(sendMock).not.toHaveBeenCalled();
    vi.unstubAllEnvs();
  });
});
```

- [ ] **Step 3: Run test to verify it fails**

Run: `npx vitest run tests/unit/email.test.ts`
Expected: FAIL — module not found

- [ ] **Step 4: Write `src/utils/email.ts`**

```ts
import { Resend } from 'resend';
import { config } from '../config/unifiedConfig.js';
import { logger } from './logger.js';

const SUBJECTS: Record<'sign-in' | 'email-verification' | 'forget-password', string> = {
  'sign-in': 'Your Frugal sign-in code',
  'email-verification': 'Verify your Frugal email',
  'forget-password': 'Your Frugal password reset code',
};

export async function sendOtpEmail(params: {
  to: string;
  otp: string;
  purpose: 'sign-in' | 'email-verification' | 'forget-password';
}): Promise<void> {
  const { to, otp, purpose } = params;

  if (!config.resend.apiKey || !config.resend.fromAddress) {
    logger.info({ to, purpose }, 'RESEND_API_KEY not set — skipping OTP email send');
    return;
  }

  const resend = new Resend(config.resend.apiKey);
  await resend.emails.send({
    from: config.resend.fromAddress,
    to,
    subject: SUBJECTS[purpose],
    text: `Your code is ${otp}. It expires in 5 minutes.`,
  });
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `npx vitest run tests/unit/email.test.ts; npm run typecheck`
Expected: PASS (2 tests), typecheck exit 0

- [ ] **Step 6: Commit**

```bash
git add src/utils/email.ts tests/unit/email.test.ts package.json package-lock.json
git commit -m "feat(api): OTP email delivery via Resend (no-op when RESEND_API_KEY unset)"
```

---

### Task 4: Install better-auth, write `src/auth.ts`, generate its schema

**Files:**
- Create: `src/auth.ts`
- Create (generated): `src/db/authSchema.ts`
- Test: `tests/unit/auth.test.ts`

**Interfaces:**
- Consumes: `config.betterAuth`, `config.google`, `config.github`, `config.apple` (Task 2), `sendOtpEmail` (Task 3), `db` (Plan 1's `src/db/client.ts` — imported without its schema arg for now; Task 5 wires the generated schema back in)
- Produces: `auth` (the `better-auth` instance) — imported by Task 6 (Express mount) and Task 7 (tests); `src/db/authSchema.ts` exporting `users`, `sessions`, `accounts`, `verifications` Drizzle table objects — imported by Task 5

- [ ] **Step 1: Install dependencies**

```bash
npm install better-auth jose
```

- [ ] **Step 2: Write `src/auth.ts`**

```ts
import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { emailOTP } from 'better-auth/plugins';
import { importPKCS8, SignJWT } from 'jose';
import { db } from './db/client.js';
import { config } from './config/unifiedConfig.js';
import { sendOtpEmail } from './utils/email.js';

async function generateAppleClientSecret(
  clientId: string,
  teamId: string,
  keyId: string,
  privateKey: string,
): Promise<string> {
  const key = await importPKCS8(privateKey, 'ES256');
  const now = Math.floor(Date.now() / 1000);
  return new SignJWT({})
    .setProtectedHeader({ alg: 'ES256', kid: keyId })
    .setIssuer(teamId)
    .setSubject(clientId)
    .setAudience('https://appleid.apple.com')
    .setIssuedAt(now)
    .setExpirationTime(now + 180 * 24 * 60 * 60)
    .sign(key);
}

export const auth = betterAuth({
  database: drizzleAdapter(db, { provider: 'pg', usePlural: true }),
  baseURL: config.betterAuth.url,
  secret: config.betterAuth.secret,
  emailAndPassword: { enabled: true },
  plugins: [
    emailOTP({
      async sendVerificationOTP({ email, otp, type }) {
        await sendOtpEmail({ to: email, otp, purpose: type });
      },
      otpLength: 6,
      expiresIn: 300,
    }),
  ],
  socialProviders: {
    ...(config.google.clientId && config.google.clientSecret
      ? { google: { clientId: config.google.clientId, clientSecret: config.google.clientSecret } }
      : {}),
    ...(config.github.clientId && config.github.clientSecret
      ? { github: { clientId: config.github.clientId, clientSecret: config.github.clientSecret } }
      : {}),
    ...(config.apple.clientId && config.apple.teamId && config.apple.keyId && config.apple.privateKey
      ? {
          apple: async () => ({
            clientId: config.apple.clientId!,
            clientSecret: await generateAppleClientSecret(
              config.apple.clientId!,
              config.apple.teamId!,
              config.apple.keyId!,
              config.apple.privateKey!,
            ),
            appBundleIdentifier: config.apple.appBundleIdentifier,
          }),
        }
      : {}),
  },
  user: {
    additionalFields: {
      plan: {
        type: ['free', 'plus', 'pro', 'corp_starter', 'corp_growth', 'corp_scale', 'enterprise'],
        required: false,
        defaultValue: 'free',
      },
      stripeCustomerId: { type: 'string', required: false, input: false },
      stripeSubscriptionId: { type: 'string', required: false, input: false },
    },
  },
  rateLimit: {
    customRules: {
      '/sign-in/email': { window: 900, max: 5 }, // spec §8: 5 attempts / 15 min
    },
  },
});
```

- [ ] **Step 3: Generate the schema**

```bash
npx auth@latest generate --config src/auth.ts --output src/db/authSchema.ts --y
```

If `--output`/`--config` aren't recognized by the installed CLI version, run `npx auth@latest generate --help` to check current flag names and adjust the command — the goal is a generated file at `src/db/authSchema.ts`.

Expected: `src/db/authSchema.ts` is created, exporting Drizzle Postgres table objects named `users`, `sessions`, `accounts`, `verifications` (pluralized per `usePlural: true`), with `plan`, `stripeCustomerId`, `stripeSubscriptionId` columns present on `users` alongside the standard `id`/`email`/`name`/`emailVerified`/`image`/`createdAt`/`updatedAt` columns.

- [ ] **Step 4: Inspect and record the generated `id` column type**

```bash
grep -A2 "^export const users" src/db/authSchema.ts
```

Record whether `users.id` is `text('id')` or `uuid('id')` — Task 5 needs this to reconcile the 10 domain tables' FK column types.

- [ ] **Step 5: Write a smoke test** — `tests/unit/auth.test.ts`

```ts
import { describe, it, expect } from 'vitest';
import { auth } from '../../src/auth.js';

describe('auth (better-auth instance)', () => {
  it('constructs without throwing when social-provider env vars are unset', () => {
    expect(auth).toBeDefined();
    expect(auth.api).toBeDefined();
  });

  it('exposes the email-otp plugin endpoints', () => {
    expect(typeof auth.api.sendVerificationOTP).toBe('function');
    expect(typeof auth.api.checkVerificationOTP).toBe('function');
  });
});
```

- [ ] **Step 6: Run test to verify it passes**

Run: `npx vitest run tests/unit/auth.test.ts; npm run typecheck`
Expected: PASS (2 tests), typecheck exit 0 (typecheck may currently warn about `src/db/authSchema.ts` being unused by anything outside `auth.ts` yet — that's resolved in Task 5)

- [ ] **Step 7: Commit**

```bash
git add src/auth.ts src/db/authSchema.ts tests/unit/auth.test.ts package.json package-lock.json
git commit -m "feat(api): better-auth instance — email/password, Google/GitHub/Apple, email OTP verification"
```

---

### Task 5: Merge the generated schema into the domain schema + migrate

**Files:**
- Modify: `src/db/schema.ts` (remove the hand-written `users` table; import `users` from `./authSchema.js` instead; reconcile the 10 FK columns' types if Task 4 found `authSchema.users.id` is `text` not `uuid`)
- Modify: `src/db/client.ts` (merge `schema.ts` + `authSchema.ts` into one schema object)
- Modify: `src/auth.ts` (pass the generated schema into `drizzleAdapter` for full type safety)
- Modify: `tests/unit/schema.test.ts`
- Regenerate: `src/db/migrations/*` (via `drizzle-kit generate`)

**Interfaces:**
- Consumes: `src/db/authSchema.ts` (Task 4)
- Produces: `db` (from `client.ts`) that can query every table — auth and domain — through one Drizzle instance; used by Task 7's integration test

- [ ] **Step 1: Modify `src/db/schema.ts`**

Remove the entire `export const users = pgTable('users', { ... });` block (originally right after the enum exports). Add this import at the top of the file, alongside the existing `drizzle-orm/pg-core` and `drizzle-orm` imports:

```ts
import { users } from './authSchema.js';
```

**If Task 4 found `authSchema.users.id` is `text`, not `uuid`:** change every one of the 10 FK columns below from `uuid(...)` to `text(...)` (keep the column name, `.notNull()`, `.references()`, and `onDelete` options exactly as they are — only the column type function changes):

- `organizations.ownerId`
- `orgMembers.userId`
- `projects.userId`
- `apiConnections.userId`
- `usageRecords.userId`
- `ingestEvents.userId`
- `proxyRequests.memberUserId`
- `budgetRules.userId`
- `alertLog.userId`
- `notifications.userId`

(If `authSchema.users.id` is already `uuid`, skip this — the existing columns are already correct and no edit is needed.)

- [ ] **Step 2: Modify `src/db/client.ts`**

```ts
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { config } from '../config/unifiedConfig.js';
import * as schema from './schema.js';
import * as authSchema from './authSchema.js';

const client = postgres(config.database.url, {
  ssl: 'require',
  max: 10,
});

export const db = drizzle(client, { schema: { ...schema, ...authSchema } });
export type Db = typeof db;
```

- [ ] **Step 3: Modify `src/auth.ts`** — add the schema import and pass it to the adapter

Add near the top:
```ts
import * as authSchema from './db/authSchema.js';
```

Change the `database` line:
```ts
  database: drizzleAdapter(db, { provider: 'pg', usePlural: true, schema: authSchema }),
```

- [ ] **Step 4: Update `tests/unit/schema.test.ts`**

Replace the `users` assertions (the old test expected 11 our-own tables including `users`; now `users` lives in `authSchema.ts` and the domain schema has 10 tables):

```ts
import { describe, it, expect } from 'vitest';
import { getTableName } from 'drizzle-orm';
import * as schema from '../../src/db/schema.js';
import * as authSchema from '../../src/db/authSchema.js';

describe('db schema', () => {
  it('re-exports better-auth\'s users table for FK references', () => {
    expect(getTableName(authSchema.users)).toBe('users');
  });

  it('defines the 10 domain tables from spec §5 (users now owned by better-auth)', () => {
    const expected = [
      'organizations',
      'org_members',
      'projects',
      'api_connections',
      'usage_records',
      'ingest_events',
      'proxy_requests',
      'budget_rules',
      'alert_log',
      'notifications',
    ];
    const actual = [
      schema.organizations,
      schema.orgMembers,
      schema.projects,
      schema.apiConnections,
      schema.usageRecords,
      schema.ingestEvents,
      schema.proxyRequests,
      schema.budgetRules,
      schema.alertLog,
      schema.notifications,
    ].map((t) => getTableName(t));
    expect(actual).toEqual(expected);
  });

  it('defines the 7 enums from spec §5', () => {
    expect(schema.planEnum.enumValues).toEqual([
      'free', 'plus', 'pro', 'corp_starter', 'corp_growth', 'corp_scale', 'enterprise',
    ]);
    expect(schema.providerEnum.enumValues).toEqual([
      'openai', 'anthropic', 'replicate', 'falai', 'gemini',
    ]);
    expect(schema.connectionStatusEnum.enumValues).toEqual([
      'active', 'polling_error', 'invalid', 'blocked',
    ]);
    expect(schema.budgetWindowEnum.enumValues).toEqual(['daily', 'monthly']);
    expect(schema.ruleActionEnum.enumValues).toEqual(['alert', 'block', 'throttle']);
    expect(schema.alertStatusEnum.enumValues).toEqual(['active', 'acknowledged', 'resolved']);
    expect(schema.orgRoleEnum.enumValues).toEqual(['owner', 'admin', 'member', 'viewer']);
  });
});
```

- [ ] **Step 5: Regenerate the migration and apply it to the test database**

```bash
npm run db:generate
set -a; source .env; set +a
npm run db:migrate
```

Expected: a new migration file appears under `src/db/migrations/`, reflecting the dropped/altered old `users` table, the new `users`/`sessions`/`accounts`/`verifications` tables, and (if applicable) the 10 FK column type changes. `db:migrate` applies it to the Neon test branch referenced by `.env`'s `DATABASE_URL` without error.

- [ ] **Step 6: Run the full suite**

Run: `npx vitest run tests/unit/schema.test.ts tests/unit/auth.test.ts; npm run typecheck`
Expected: PASS, typecheck exit 0

- [ ] **Step 7: Commit**

```bash
git add src/db/schema.ts src/db/client.ts src/auth.ts tests/unit/schema.test.ts src/db/migrations
git commit -m "feat(api): merge better-auth schema into the domain schema, migrate test DB"
```

---

### Task 6: Express wiring — mount better-auth, add `requireAuth`

**Files:**
- Modify: `src/app.ts`
- Create: `src/middleware/requireAuth.ts`
- Test: `tests/integration/requireAuth.test.ts`

**Interfaces:**
- Consumes: `auth` (Task 4), `requestId`/`requestTimeout`/`errorHandler`/`healthRoutes` (Plan 1), `UnauthorizedError` (Plan 1)
- Produces: `requireAuth: RequestHandler` — sets `req.userId` on a valid session, otherwise calls `next(new UnauthorizedError())`; `/api/auth/*` mounted and working in `createApp()`

- [ ] **Step 1: Modify `src/app.ts`**

```ts
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { toNodeHandler } from 'better-auth/node';
import { auth } from './auth.js';
import { config } from './config/unifiedConfig.js';
import { requestId } from './middleware/requestId.js';
import { errorHandler } from './middleware/errorHandler.js';
import { healthRoutes } from './routes/healthRoutes.js';

export function createApp() {
  const app = express();

  app.disable('x-powered-by');
  app.use(helmet());
  app.use(
    cors({
      origin: config.cors.origins.length > 0 ? config.cors.origins : false,
      credentials: true,
    }),
  );
  app.use(requestId);

  app.all('/api/auth/*splat', toNodeHandler(auth));

  app.use(express.json({ limit: '256kb' }));

  app.use('/health', healthRoutes);

  // Plans 3–6 mount domain routers here under /api/v1/

  app.use((_req, res) => {
    res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Route not found' } });
  });

  app.use(errorHandler);

  return app;
}
```

Note: `requestTimeout` from the original Plan 2 was never built (that task was dropped along with the rest of the custom-auth plan) — it stays deferred; not reintroduced here since nothing in this plan needs it.

- [ ] **Step 2: Write the failing test** — `tests/integration/requireAuth.test.ts`

```ts
import { describe, it, expect } from 'vitest';
import express from 'express';
import request from 'supertest';
import { requireAuth } from '../../src/middleware/requireAuth.js';
import { errorHandler } from '../../src/middleware/errorHandler.js';

describe('requireAuth', () => {
  it('rejects a request with no session cookie/header', async () => {
    const app = express();
    app.get('/protected', requireAuth, (req, res) => {
      res.json({ userId: (req as express.Request & { userId?: string }).userId });
    });
    app.use(errorHandler);

    const res = await request(app).get('/protected');

    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('UNAUTHORIZED');
  });
});
```

- [ ] **Step 3: Run test to verify it fails**

Run: `npx vitest run tests/integration/requireAuth.test.ts`
Expected: FAIL — module not found

- [ ] **Step 4: Write `src/middleware/requireAuth.ts`**

```ts
import type { Request, Response, NextFunction } from 'express';
import { fromNodeHeaders } from 'better-auth/node';
import { auth } from '../auth.js';
import { UnauthorizedError } from '../utils/errors.js';

export async function requireAuth(req: Request, _res: Response, next: NextFunction): Promise<void> {
  const session = await auth.api.getSession({ headers: fromNodeHeaders(req.headers) });
  if (!session) {
    next(new UnauthorizedError());
    return;
  }
  req.userId = session.user.id;
  next();
}
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `npx vitest run tests/integration/requireAuth.test.ts tests/integration/app.test.ts; npm run typecheck`
Expected: PASS (1 + existing app tests), typecheck exit 0 — the pre-existing `app.test.ts` from Plan 1 must still pass with the reordered middleware chain

- [ ] **Step 6: Commit**

```bash
git add src/app.ts src/middleware/requireAuth.ts tests/integration/requireAuth.test.ts
git commit -m "feat(api): mount better-auth at /api/auth, add requireAuth middleware"
```

---

### Task 7: Full auth flow integration test

**Files:**
- Test: `tests/integration/authFlow.test.ts`

**Interfaces:**
- Consumes: `createApp` (Task 6), a reachable Postgres via `DATABASE_URL`

- [ ] **Step 1: Write the test** — `tests/integration/authFlow.test.ts`

```ts
import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { randomUUID } from 'node:crypto';
import { createApp } from '../../src/app.js';

describe('auth flow (requires a real Postgres via DATABASE_URL)', () => {
  const app = createApp();
  const email = `flow-${randomUUID()}@example.com`;
  const password = 'correct-horse-battery';

  it('signs up, signs in, reads the session, updates the profile, and changes the password', async () => {
    const signUpRes = await request(app)
      .post('/api/auth/sign-up/email')
      .send({ email, password, name: 'Flow Test' });
    expect(signUpRes.status).toBe(200);
    const cookie = signUpRes.headers['set-cookie'];
    expect(cookie).toBeTruthy();

    const sessionRes = await request(app).get('/api/auth/get-session').set('Cookie', cookie);
    expect(sessionRes.status).toBe(200);
    expect(sessionRes.body.user.email).toBe(email);

    const updateRes = await request(app)
      .post('/api/auth/update-user')
      .set('Cookie', cookie)
      .send({ name: 'Updated Name' });
    expect(updateRes.status).toBe(200);

    const changePwRes = await request(app)
      .post('/api/auth/change-password')
      .set('Cookie', cookie)
      .send({ currentPassword: password, newPassword: 'new-correct-horse-battery', revokeOtherSessions: false });
    expect(changePwRes.status).toBe(200);

    const reSignInRes = await request(app)
      .post('/api/auth/sign-in/email')
      .send({ email, password: 'new-correct-horse-battery' });
    expect(reSignInRes.status).toBe(200);

    const oldPwRes = await request(app).post('/api/auth/sign-in/email').send({ email, password });
    expect(oldPwRes.status).toBe(401);
  });

  it('rejects sign-up with an already-registered email', async () => {
    const dupEmail = `dup-${randomUUID()}@example.com`;
    await request(app).post('/api/auth/sign-up/email').send({ email: dupEmail, password });
    const res = await request(app).post('/api/auth/sign-up/email').send({ email: dupEmail, password });
    expect(res.status).toBe(422);
  });

  it('rate-limits sign-in after 5 attempts within the window', async () => {
    const rlEmail = `rl-${randomUUID()}@example.com`;
    for (let i = 0; i < 5; i++) {
      await request(app).post('/api/auth/sign-in/email').send({ email: rlEmail, password: 'wrong' });
    }
    const res = await request(app).post('/api/auth/sign-in/email').send({ email: rlEmail, password: 'wrong' });
    expect(res.status).toBe(429);
  });
});
```

Note on exact response codes: better-auth's status codes for validation/auth failures (`401` vs `400`, `422` vs `409` for duplicates) should be confirmed against the actual installed version's behavior when this test is first run — if a `toBe(...)` assertion fails only on the status code while the request clearly succeeded/failed as expected, adjust the expected code to match reality rather than the number written here, and note the discrepancy in the task report.

- [ ] **Step 2: Run the full suite**

Run: `set -a; source .env; set +a; npm test; npm run typecheck`
Expected: ALL tests pass (unit + integration) with `DATABASE_URL` pointed at the Neon test branch; typecheck exit 0

- [ ] **Step 3: Commit**

```bash
git add tests/integration/authFlow.test.ts
git commit -m "test(api): full better-auth flow — sign-up/sign-in/session/update/change-password/rate-limit"
```

---

## Definition of Done (Plan 2 rev 2)

- `npm test` green with `DATABASE_URL` pointed at a reachable Postgres, all Plan 1 tests plus this plan's new tests
- `npm run typecheck` exit 0
- Server boots and `/api/auth/sign-up/email` → `sign-in/email` → `get-session` → `update-user` → `change-password` all work against a real Postgres, with sign-in rate-limited at 5/15min
- App boots successfully with all of `GOOGLE_CLIENT_ID/SECRET`, `GITHUB_CLIENT_ID/SECRET`, `APPLE_*` unset (social providers conditionally omitted)
- Zero `process.env` reads outside `unifiedConfig.ts`
- Zero `console.log` in `src/`

## Deferred to later plans (explicit, not forgotten)

- `requireCorporate`/`requirePro` tier-gating — first plan with a tier-gated route (Projects/Connections, Plan 3)
- Repositories/services/controllers for Projects, Connections, Dashboard, Budget Rules, Alerts, Notifications, Ingest, Billing, Organizations → Plans 3–6
- Actually testing the Google/GitHub/Apple OAuth *redirect* flows end-to-end — needs real registered OAuth apps and a browser; out of scope for an automated test in this plan. The frontend (`web/`) integration is also out of scope here.
- `requestTimeout` middleware — was part of the original (now-reverted) Plan 2; reintroduce if/when a later plan actually needs it
