# Frugal API — Plan 1: Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Bootable `frugal-api` Express+TypeScript service with validated config, error system, structured logging, Sentry, complete Drizzle schema + generated migration, AES-256-GCM encryption util, and a tested `/health` endpoint.

**Architecture:** Layered Express service (routes → controllers → services → repositories → Drizzle/Neon) per spec §11. This plan builds only the cross-cutting foundation; domain layers land in Plans 2–6. Sentry is initialized in `instrument.ts` as the first import; all config flows through a single Zod-validated `unifiedConfig`; all errors funnel through typed error classes into one `errorHandler`.

**Tech Stack:** Node 22, TypeScript (strict, ESM), Express 4, Drizzle ORM + drizzle-kit, postgres (postgres.js driver, Neon), Zod, Pino, @sentry/node, Helmet, CORS, Vitest + Supertest.

**Spec:** `docs/superpowers/specs/2026-06-25-frugal-backend-design.md` (§3 stack, §5 schema, §8 security, §9 errors, §11 folders, §12 env vars).

## Global Constraints

- Service lives at `frugal-api/` (repo root). All paths below are relative to repo root.
- `"type": "module"` ESM. Relative imports only (no path aliases — ESM runtime friction; the enforceable rule is "unifiedConfig is the only config source", not the alias).
- `process.env` may be read ONLY inside `frugal-api/src/config/unifiedConfig.ts`.
- Error response shape everywhere: `{ "error": { "code": string, "message": string, "details"?: unknown } }` (spec §9).
- No `console.log` in src — Pino logger only. Unexpected errors → `Sentry.captureException`.
- No raw SQL string concatenation — Drizzle only (spec §8).
- Body limit `express.json({ limit: '256kb' })` (spec §8).
- Secrets never logged; Pino redacts `authorization`, `password`, `apiKey` paths.
- Every task ends with typecheck + tests green, then a commit.
- Commands are run from `frugal-api/` unless stated otherwise. PowerShell-compatible (no `&&` — use `;`).

---

### Task 1: Scaffold `frugal-api`

**Files:**
- Create: `frugal-api/package.json` (via npm commands)
- Create: `frugal-api/tsconfig.json`
- Create: `frugal-api/vitest.config.ts`
- Create: `frugal-api/.gitignore`
- Create: `frugal-api/.env.example`
- Create: `frugal-api/tests/setup.ts`

**Interfaces:**
- Consumes: nothing (first task)
- Produces: npm scripts `dev`, `build`, `typecheck`, `test`; test env defaults in `tests/setup.ts` that every later test file relies on

- [ ] **Step 1: Init package and install dependencies**

```bash
mkdir frugal-api; cd frugal-api
npm init -y
npm pkg set type=module
npm install express helmet cors zod drizzle-orm postgres pino @sentry/node
npm install -D typescript tsx vitest supertest drizzle-kit @types/express @types/cors @types/supertest @types/node
npm pkg set scripts.dev="tsx watch src/server.ts"
npm pkg set scripts.build="tsc -p tsconfig.json"
npm pkg set scripts.typecheck="tsc --noEmit"
npm pkg set scripts.test="vitest run"
npm pkg set scripts.test:watch="vitest"
npm pkg set scripts.db:generate="drizzle-kit generate"
npm pkg set scripts.db:migrate="drizzle-kit migrate"
```

- [ ] **Step 2: Write `frugal-api/tsconfig.json`**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "lib": ["ES2022"],
    "outDir": "dist",
    "rootDir": "src",
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": false,
    "sourceMap": true
  },
  "include": ["src"],
  "exclude": ["node_modules", "dist", "tests"]
}
```

- [ ] **Step 3: Write `frugal-api/vitest.config.ts`, `.gitignore`, `tests/setup.ts`, `.env.example`**

`frugal-api/vitest.config.ts`:
```ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    setupFiles: ['./tests/setup.ts'],
    include: ['tests/**/*.test.ts'],
    passWithNoTests: true,
  },
});
```

`frugal-api/tests/setup.ts` (test-only env defaults — required env for `unifiedConfig` under test):
```ts
process.env.NODE_ENV = 'test';
process.env.DATABASE_URL ??= 'postgres://test:test@localhost:5432/frugal_test';
process.env.REDIS_URL ??= 'rediss://localhost:6379';
process.env.JWT_SECRET ??= 'test-jwt-secret-test-jwt-secret-32b';
process.env.ENCRYPTION_KEY ??=
  '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';
```

`frugal-api/.gitignore`:
```
node_modules/
dist/
.env
.env.*
!.env.example
```

`frugal-api/.env.example` (spec §12, verbatim keys):
```
# Database
DATABASE_URL=                  # Neon direct connection
DATABASE_POOL_URL=             # Neon PgBouncer (proxy service uses this)

# Redis
REDIS_URL=                     # Upstash Redis TLS URL
REDIS_TOKEN=

# Auth
JWT_SECRET=
JWT_EXPIRES_IN_SECONDS=604800  # 7 days

# Encryption
ENCRYPTION_KEY=                # 32-byte hex, AES-256-GCM

# Stripe
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
STRIPE_PRICE_PLUS_MONTHLY=
STRIPE_PRICE_PLUS_YEARLY=
STRIPE_PRICE_PRO_MONTHLY=
STRIPE_PRICE_PRO_YEARLY=

# Resend
RESEND_API_KEY=
RESEND_FROM_ADDRESS=

# Sentry
SENTRY_DSN=

# Server
PORT=3000
CORS_ORIGINS=                  # comma-separated
NODE_ENV=

# Google OAuth
GOOGLE_CLIENT_ID=
```

- [ ] **Step 4: Verify toolchain**

Create `frugal-api/src/server.ts` so tsc has an input file (Task 7 replaces this):
```ts
export {};
```

Run: `npm run typecheck; npm test`
Expected: both exit 0 (`passWithNoTests` covers the empty test suite).

- [ ] **Step 5: Commit**

```bash
git add frugal-api
git commit -m "chore(api): scaffold frugal-api service (Express+TS+Drizzle+Vitest)"
```

---

### Task 2: unifiedConfig (Zod-validated env)

**Files:**
- Create: `frugal-api/src/config/unifiedConfig.ts`
- Test: `frugal-api/tests/unit/unifiedConfig.test.ts`

**Interfaces:**
- Consumes: `process.env` (the ONLY module allowed to)
- Produces: `loadConfig(env: NodeJS.ProcessEnv): AppConfig` and singleton `config: AppConfig` with shape:
  `config.env` ('development'|'test'|'production'), `config.port: number`, `config.database.url: string`, `config.database.poolUrl: string | undefined`, `config.redis.url: string`, `config.auth.jwtSecret: string`, `config.auth.jwtExpiresInSeconds: number`, `config.encryption.key: string` (64 hex chars), `config.cors.origins: string[]`, `config.sentry.dsn: string | undefined`, `config.stripe.{secretKey,webhookSecret,pricePlusMonthly,pricePlusYearly,priceProMonthly,priceProYearly}: string | undefined`, `config.resend.{apiKey,fromAddress}: string | undefined`, `config.google.clientId: string | undefined`

- [ ] **Step 1: Write the failing test** — `frugal-api/tests/unit/unifiedConfig.test.ts`

```ts
import { describe, it, expect } from 'vitest';
import { loadConfig } from '../../src/config/unifiedConfig.js';

const validEnv = {
  NODE_ENV: 'test',
  PORT: '4001',
  DATABASE_URL: 'postgres://u:p@host/db',
  REDIS_URL: 'rediss://host:6379',
  JWT_SECRET: 'x'.repeat(32),
  JWT_EXPIRES_IN_SECONDS: '604800',
  ENCRYPTION_KEY: 'ab'.repeat(32),
  CORS_ORIGINS: 'https://app.frugal.dev, https://frugal.dev',
};

describe('loadConfig', () => {
  it('parses a valid env into grouped config', () => {
    const c = loadConfig(validEnv);
    expect(c.env).toBe('test');
    expect(c.port).toBe(4001);
    expect(c.database.url).toBe('postgres://u:p@host/db');
    expect(c.auth.jwtExpiresInSeconds).toBe(604800);
    expect(c.cors.origins).toEqual(['https://app.frugal.dev', 'https://frugal.dev']);
    expect(c.stripe.secretKey).toBeUndefined();
  });

  it('throws when a required var is missing', () => {
    const { DATABASE_URL: _omit, ...rest } = validEnv;
    expect(() => loadConfig(rest)).toThrow(/DATABASE_URL/);
  });

  it('rejects a short JWT_SECRET', () => {
    expect(() => loadConfig({ ...validEnv, JWT_SECRET: 'short' })).toThrow(/JWT_SECRET/);
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
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/unit/unifiedConfig.test.ts`
Expected: FAIL — cannot find module `../../src/config/unifiedConfig.js`

- [ ] **Step 3: Write `frugal-api/src/config/unifiedConfig.ts`**

```ts
import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(3000),
  DATABASE_URL: z.string({ required_error: 'DATABASE_URL is required' }).min(1, 'DATABASE_URL is required'),
  DATABASE_POOL_URL: z.string().min(1).optional(),
  REDIS_URL: z.string({ required_error: 'REDIS_URL is required' }).min(1, 'REDIS_URL is required'),
  REDIS_TOKEN: z.string().optional(),
  JWT_SECRET: z
    .string({ required_error: 'JWT_SECRET is required' })
    .min(32, 'JWT_SECRET must be at least 32 characters'),
  JWT_EXPIRES_IN_SECONDS: z.coerce.number().int().positive().default(604800),
  ENCRYPTION_KEY: z
    .string({ required_error: 'ENCRYPTION_KEY is required' })
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
});

export interface AppConfig {
  env: 'development' | 'test' | 'production';
  port: number;
  database: { url: string; poolUrl: string | undefined };
  redis: { url: string; token: string | undefined };
  auth: { jwtSecret: string; jwtExpiresInSeconds: number };
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
  google: { clientId: string | undefined };
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
    auth: { jwtSecret: e.JWT_SECRET, jwtExpiresInSeconds: e.JWT_EXPIRES_IN_SECONDS },
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
    google: { clientId: e.GOOGLE_CLIENT_ID },
  };
}

export const config: AppConfig = loadConfig(process.env);
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/unit/unifiedConfig.test.ts`
Expected: PASS (5 tests)

- [ ] **Step 5: Commit**

```bash
git add frugal-api/src/config frugal-api/tests/unit/unifiedConfig.test.ts
git commit -m "feat(api): Zod-validated unifiedConfig, sole process.env access point"
```

---

### Task 3: Error classes, asyncErrorWrapper, errorHandler

**Files:**
- Create: `frugal-api/src/utils/errors.ts`
- Create: `frugal-api/src/middleware/asyncErrorWrapper.ts`
- Create: `frugal-api/src/middleware/errorHandler.ts`
- Test: `frugal-api/tests/unit/errors.test.ts`

**Interfaces:**
- Consumes: nothing
- Produces (later tasks/plans throw these; errorHandler is mounted last in `app.ts` in Task 6):
  - `class AppError extends Error { constructor(message: string, statusCode?: number, code?: string, details?: unknown) }` with fields `statusCode: number` (default 500), `code: string` (default 'INTERNAL_ERROR'), `details?: unknown`
  - `class ValidationError extends AppError` → 400 `VALIDATION_ERROR`
  - `class UnauthorizedError extends AppError` → 401 `UNAUTHORIZED`
  - `class ForbiddenError extends AppError` → 403 `FORBIDDEN`
  - `class NotFoundError extends AppError` → 404 `NOT_FOUND`
  - `class ConflictError extends AppError` → 409 `CONFLICT`
  - `class RateLimitError extends AppError` → 429 `RATE_LIMITED`
  - `asyncErrorWrapper(fn: (req, res, next) => Promise<unknown>): RequestHandler`
  - `errorHandler: ErrorRequestHandler` — maps AppError → its status/code, ZodError → 400 VALIDATION_ERROR with `details` = zod issues, anything else → 500 `INTERNAL_ERROR` with generic message + `Sentry.captureException`

- [ ] **Step 1: Write the failing test** — `frugal-api/tests/unit/errors.test.ts`

```ts
import { describe, it, expect, vi } from 'vitest';
import type { Request, Response, NextFunction } from 'express';
import { z, ZodError } from 'zod';
import {
  AppError,
  ValidationError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
  RateLimitError,
} from '../../src/utils/errors.js';
import { asyncErrorWrapper } from '../../src/middleware/asyncErrorWrapper.js';
import { errorHandler } from '../../src/middleware/errorHandler.js';

function mockRes() {
  const res: Partial<Response> = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res as Response & { status: ReturnType<typeof vi.fn>; json: ReturnType<typeof vi.fn> };
}

describe('error classes', () => {
  it.each([
    [new ValidationError('bad'), 400, 'VALIDATION_ERROR'],
    [new UnauthorizedError('no'), 401, 'UNAUTHORIZED'],
    [new ForbiddenError('no'), 403, 'FORBIDDEN'],
    [new NotFoundError('gone'), 404, 'NOT_FOUND'],
    [new ConflictError('dupe'), 409, 'CONFLICT'],
    [new RateLimitError('slow down'), 429, 'RATE_LIMITED'],
  ])('%s carries status %i and code %s', (err, status, code) => {
    expect(err).toBeInstanceOf(AppError);
    expect(err.statusCode).toBe(status);
    expect(err.code).toBe(code);
  });
});

describe('asyncErrorWrapper', () => {
  it('forwards rejections to next()', async () => {
    const boom = new Error('boom');
    const next = vi.fn();
    const handler = asyncErrorWrapper(async () => {
      throw boom;
    });
    await handler({} as Request, {} as Response, next as NextFunction);
    expect(next).toHaveBeenCalledWith(boom);
  });
});

describe('errorHandler', () => {
  const req = {} as Request;
  const next = vi.fn() as NextFunction;

  it('maps AppError to its status and code', () => {
    const res = mockRes();
    errorHandler(new NotFoundError('project not found'), req, res, next);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      error: { code: 'NOT_FOUND', message: 'project not found' },
    });
  });

  it('maps ZodError to 400 VALIDATION_ERROR with details', () => {
    const res = mockRes();
    let zerr: ZodError;
    try {
      z.object({ email: z.string().email() }).parse({ email: 'nope' });
      throw new Error('unreachable');
    } catch (e) {
      zerr = e as ZodError;
    }
    errorHandler(zerr, req, res, next);
    expect(res.status).toHaveBeenCalledWith(400);
    const body = res.json.mock.calls[0]![0];
    expect(body.error.code).toBe('VALIDATION_ERROR');
    expect(Array.isArray(body.error.details)).toBe(true);
  });

  it('maps unknown errors to 500 with a generic message', () => {
    const res = mockRes();
    errorHandler(new Error('secret internals leaked'), req, res, next);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      error: { code: 'INTERNAL_ERROR', message: 'Internal server error' },
    });
  });

  it('includes details on AppError when provided', () => {
    const res = mockRes();
    errorHandler(new ValidationError('bad input', [{ field: 'email' }]), req, res, next);
    expect(res.json).toHaveBeenCalledWith({
      error: { code: 'VALIDATION_ERROR', message: 'bad input', details: [{ field: 'email' }] },
    });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/unit/errors.test.ts`
Expected: FAIL — modules not found

- [ ] **Step 3: Write the implementations**

`frugal-api/src/utils/errors.ts`:
```ts
export class AppError extends Error {
  readonly statusCode: number;
  readonly code: string;
  readonly details?: unknown;

  constructor(message: string, statusCode = 500, code = 'INTERNAL_ERROR', details?: unknown) {
    super(message);
    this.name = new.target.name;
    this.statusCode = statusCode;
    this.code = code;
    if (details !== undefined) this.details = details;
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: unknown) {
    super(message, 400, 'VALIDATION_ERROR', details);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized') {
    super(message, 401, 'UNAUTHORIZED');
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Forbidden') {
    super(message, 403, 'FORBIDDEN');
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Not found') {
    super(message, 404, 'NOT_FOUND');
  }
}

export class ConflictError extends AppError {
  constructor(message = 'Conflict') {
    super(message, 409, 'CONFLICT');
  }
}

export class RateLimitError extends AppError {
  constructor(message = 'Too many requests') {
    super(message, 429, 'RATE_LIMITED');
  }
}
```

`frugal-api/src/middleware/asyncErrorWrapper.ts`:
```ts
import type { NextFunction, Request, RequestHandler, Response } from 'express';

type AsyncHandler = (req: Request, res: Response, next: NextFunction) => Promise<unknown>;

export function asyncErrorWrapper(fn: AsyncHandler): RequestHandler {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
```

`frugal-api/src/middleware/errorHandler.ts`:
```ts
import type { ErrorRequestHandler } from 'express';
import { ZodError } from 'zod';
import * as Sentry from '@sentry/node';
import { AppError } from '../utils/errors.js';

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  if (err instanceof AppError) {
    const body: { code: string; message: string; details?: unknown } = {
      code: err.code,
      message: err.message,
    };
    if (err.details !== undefined) body.details = err.details;
    res.status(err.statusCode).json({ error: body });
    return;
  }

  if (err instanceof ZodError) {
    res.status(400).json({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Request validation failed',
        details: err.issues.map((i) => ({ path: i.path.join('.'), message: i.message })),
      },
    });
    return;
  }

  Sentry.captureException(err);
  res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } });
};
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run tests/unit/errors.test.ts; npm run typecheck`
Expected: PASS (all tests), typecheck exit 0

- [ ] **Step 5: Commit**

```bash
git add frugal-api/src/utils/errors.ts frugal-api/src/middleware frugal-api/tests/unit/errors.test.ts
git commit -m "feat(api): typed error classes, asyncErrorWrapper, central errorHandler"
```

---

### Task 4: Logger, Sentry instrument, requestId middleware

**Files:**
- Create: `frugal-api/src/utils/logger.ts`
- Create: `frugal-api/src/instrument.ts`
- Create: `frugal-api/src/middleware/requestId.ts`
- Create: `frugal-api/src/types/express.d.ts`
- Test: `frugal-api/tests/unit/logger.test.ts`

**Interfaces:**
- Consumes: `config` from Task 2
- Produces:
  - `logger` (Pino instance) — import as `import { logger } from '../utils/logger.js'`
  - `requestId: RequestHandler` — sets `req.id: string` (UUID) and `X-Request-Id` response header; honors incoming `X-Request-Id`
  - `src/instrument.ts` — side-effect module; MUST be the first import in `server.ts`
  - Express `Request` augmented with `id: string` (and `userId?: string` reserved for Plan 2 auth middleware)

- [ ] **Step 1: Write the failing test** — `frugal-api/tests/unit/logger.test.ts`

```ts
import { describe, it, expect } from 'vitest';
import { Writable } from 'node:stream';
import { createLogger } from '../../src/utils/logger.js';

function captureStream(lines: string[]) {
  return new Writable({
    write(chunk, _enc, cb) {
      lines.push(chunk.toString());
      cb();
    },
  });
}

describe('logger', () => {
  it('redacts authorization headers and password fields', () => {
    const lines: string[] = [];
    const log = createLogger(captureStream(lines));
    log.info(
      { req: { headers: { authorization: 'Bearer sekrit' } }, password: 'hunter2' },
      'login attempt',
    );
    const out = lines.join('');
    expect(out).not.toContain('sekrit');
    expect(out).not.toContain('hunter2');
    expect(out).toContain('[Redacted]');
  });

  it('emits structured JSON with the message', () => {
    const lines: string[] = [];
    const log = createLogger(captureStream(lines));
    log.info({ requestId: 'abc-123' }, 'hello');
    const parsed = JSON.parse(lines[0]!);
    expect(parsed.msg).toBe('hello');
    expect(parsed.requestId).toBe('abc-123');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/unit/logger.test.ts`
Expected: FAIL — module not found

- [ ] **Step 3: Write the implementations**

`frugal-api/src/utils/logger.ts`:
```ts
import pino from 'pino';
import type { DestinationStream } from 'pino';
import { config } from '../config/unifiedConfig.js';

const redactPaths = [
  'req.headers.authorization',
  '*.authorization',
  '*.password',
  '*.passwordHash',
  '*.apiKey',
  '*.api_key_encrypted',
  'password',
  'apiKey',
];

export function createLogger(stream?: DestinationStream) {
  return pino(
    {
      // Explicit stream (tests) always logs; otherwise silent under test env
      level: stream ? 'info' : config.env === 'test' ? 'silent' : 'info',
      redact: { paths: redactPaths, censor: '[Redacted]' },
      base: { service: 'frugal-api' },
    },
    stream,
  );
}

export const logger = createLogger();
```

`frugal-api/src/instrument.ts`:
```ts
import * as Sentry from '@sentry/node';
import { config } from './config/unifiedConfig.js';

Sentry.init({
  dsn: config.sentry.dsn,
  enabled: Boolean(config.sentry.dsn) && config.env === 'production',
  environment: config.env,
  tracesSampleRate: 0.1,
  beforeSend(event) {
    // spec §8: API keys + emails scrubbed from error payloads
    if (event.user) {
      delete event.user.email;
      delete event.user.ip_address;
    }
    return event;
  },
});
```

`frugal-api/src/types/express.d.ts`:
```ts
declare global {
  namespace Express {
    interface Request {
      id: string;
      userId?: string;
    }
  }
}

export {};
```

`frugal-api/src/middleware/requestId.ts`:
```ts
import { randomUUID } from 'node:crypto';
import type { RequestHandler } from 'express';

export const requestId: RequestHandler = (req, res, next) => {
  const incoming = req.header('x-request-id');
  req.id = incoming && incoming.length <= 128 ? incoming : randomUUID();
  res.setHeader('X-Request-Id', req.id);
  next();
};
```

Also update `tsconfig.json` include to pick up the ambient types (already covered — `src` glob includes `src/types/express.d.ts`).

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run tests/unit/logger.test.ts; npm run typecheck`
Expected: PASS (2 tests), typecheck exit 0

- [ ] **Step 5: Commit**

```bash
git add frugal-api/src/utils/logger.ts frugal-api/src/instrument.ts frugal-api/src/middleware/requestId.ts frugal-api/src/types
git add frugal-api/tests/unit/logger.test.ts
git commit -m "feat(api): pino logger with redaction, Sentry instrument, requestId middleware"
```

---

### Task 5: Drizzle schema (all tables) + client + migration

**Files:**
- Create: `frugal-api/src/db/schema.ts`
- Create: `frugal-api/src/db/client.ts`
- Create: `frugal-api/drizzle.config.ts`
- Create (generated): `frugal-api/src/db/migrations/*`
- Test: `frugal-api/tests/unit/schema.test.ts`

**Interfaces:**
- Consumes: `config` (Task 2)
- Produces: every Drizzle table object later plans import: `users`, `organizations`, `orgMembers`, `projects`, `apiConnections`, `usageRecords`, `ingestEvents`, `proxyRequests`, `budgetRules`, `alertLog`, `notifications`; enums `planEnum`, `providerEnum`, `connectionStatusEnum`, `budgetWindowEnum`, `ruleActionEnum`, `alertStatusEnum`, `orgRoleEnum`; `db` (Drizzle instance) from `client.ts`

- [ ] **Step 1: Write the failing test** — `frugal-api/tests/unit/schema.test.ts`

```ts
import { describe, it, expect } from 'vitest';
import { getTableName } from 'drizzle-orm';
import * as schema from '../../src/db/schema.js';

describe('db schema', () => {
  it('defines all 11 tables from spec §5', () => {
    const expected = [
      'users',
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
      schema.users,
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

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/unit/schema.test.ts`
Expected: FAIL — module not found

- [ ] **Step 3: Write `frugal-api/src/db/schema.ts`** (spec §5 verbatim; FK columns indexed per database-schema-designer best practice)

```ts
import {
  pgTable,
  pgEnum,
  uuid,
  text,
  timestamp,
  boolean,
  bigint,
  numeric,
  jsonb,
  date,
  integer,
  uniqueIndex,
  index,
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

// ---- Enums (spec §5) ----
export const planEnum = pgEnum('plan_enum', [
  'free', 'plus', 'pro', 'corp_starter', 'corp_growth', 'corp_scale', 'enterprise',
]);
export const providerEnum = pgEnum('provider_enum', [
  'openai', 'anthropic', 'replicate', 'falai', 'gemini',
]);
export const connectionStatusEnum = pgEnum('connection_status_enum', [
  'active', 'polling_error', 'invalid', 'blocked',
]);
export const budgetWindowEnum = pgEnum('budget_window_enum', ['daily', 'monthly']);
export const ruleActionEnum = pgEnum('rule_action_enum', ['alert', 'block', 'throttle']);
export const alertStatusEnum = pgEnum('alert_status_enum', ['active', 'acknowledged', 'resolved']);
export const orgRoleEnum = pgEnum('org_role_enum', ['owner', 'admin', 'member', 'viewer']);

// ---- Auth domain ----
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email').notNull().unique(),
  fullName: text('full_name'),
  passwordHash: text('password_hash'),
  googleId: text('google_id').unique(),
  plan: planEnum('plan').notNull().default('free'),
  stripeCustomerId: text('stripe_customer_id'),
  stripeSubscriptionId: text('stripe_subscription_id'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const organizations = pgTable(
  'organizations',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    name: text('name').notNull(),
    ownerId: uuid('owner_id')
      .notNull()
      .references(() => users.id),
    plan: planEnum('plan').notNull().default('corp_starter'),
    stripeCustomerId: text('stripe_customer_id'),
    stripeSubscriptionId: text('stripe_subscription_id'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index('idx_organizations_owner_id').on(t.ownerId)],
);

export const orgMembers = pgTable(
  'org_members',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    orgId: uuid('org_id')
      .notNull()
      .references(() => organizations.id, { onDelete: 'cascade' }),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    role: orgRoleEnum('role').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex('uq_org_members_org_user').on(t.orgId, t.userId),
    index('idx_org_members_user_id').on(t.userId),
  ],
);

// ---- Projects & connections ----
export const projects = pgTable(
  'projects',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }),
    orgId: uuid('org_id').references(() => organizations.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    description: text('description'),
    color: text('color').default('slate'),
    slackWebhookUrl: text('slack_webhook_url'),
    customWebhookUrl: text('custom_webhook_url'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index('idx_projects_user_id').on(t.userId), index('idx_projects_org_id').on(t.orgId)],
);

export const apiConnections = pgTable(
  'api_connections',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    projectId: uuid('project_id')
      .notNull()
      .references(() => projects.id, { onDelete: 'cascade' }),
    provider: providerEnum('provider').notNull(),
    label: text('label'),
    apiKeyEncrypted: text('api_key_encrypted').notNull(),
    apiKeySuffix: text('api_key_suffix'),
    status: connectionStatusEnum('status').notNull().default('active'),
    isActive: boolean('is_active').notNull().default(true),
    lastPolledAt: timestamp('last_polled_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index('idx_api_connections_user_id').on(t.userId),
    index('idx_api_connections_project_id').on(t.projectId),
  ],
);

// ---- Usage domain ----
export const usageRecords = pgTable(
  'usage_records',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    connectionId: uuid('connection_id')
      .notNull()
      .references(() => apiConnections.id, { onDelete: 'cascade' }),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    date: date('date').notNull(),
    model: text('model'),
    tokensInput: bigint('tokens_input', { mode: 'number' }).notNull().default(0),
    tokensOutput: bigint('tokens_output', { mode: 'number' }).notNull().default(0),
    costUsd: numeric('cost_usd', { precision: 10, scale: 6 }).notNull().default('0'),
    rawResponse: jsonb('raw_response'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex('uq_usage_records_conn_date_model').on(t.connectionId, t.date, t.model),
    index('idx_usage_records_user_id').on(t.userId),
    index('idx_usage_records_date').on(t.date),
  ],
);

export const ingestEvents = pgTable(
  'ingest_events',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    endUserId: text('end_user_id').notNull(),
    projectId: uuid('project_id').references(() => projects.id),
    provider: providerEnum('provider'),
    model: text('model'),
    tokensInput: bigint('tokens_input', { mode: 'number' }).notNull().default(0),
    tokensOutput: bigint('tokens_output', { mode: 'number' }).notNull().default(0),
    costUsd: numeric('cost_usd', { precision: 10, scale: 6 }).notNull().default('0'),
    metadata: jsonb('metadata'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index('idx_ingest_events_user_id').on(t.userId),
    index('idx_ingest_events_project_id').on(t.projectId),
    index('idx_ingest_events_created_at').on(t.createdAt),
  ],
);

export const proxyRequests = pgTable(
  'proxy_requests',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    orgId: uuid('org_id')
      .notNull()
      .references(() => organizations.id, { onDelete: 'cascade' }),
    memberUserId: uuid('member_user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    projectId: uuid('project_id').references(() => projects.id),
    provider: providerEnum('provider').notNull(),
    model: text('model'),
    tokensInput: bigint('tokens_input', { mode: 'number' }).default(0),
    tokensOutput: bigint('tokens_output', { mode: 'number' }).default(0),
    costUsd: numeric('cost_usd', { precision: 10, scale: 6 }).default('0'),
    latencyMs: integer('latency_ms'),
    status: text('status').notNull().default('forwarded'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index('idx_proxy_requests_org_id').on(t.orgId),
    index('idx_proxy_requests_member_user_id').on(t.memberUserId),
    index('idx_proxy_requests_created_at').on(t.createdAt),
  ],
);

// ---- Rules & alerts ----
export const budgetRules = pgTable(
  'budget_rules',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    projectId: uuid('project_id')
      .notNull()
      .references(() => projects.id, { onDelete: 'cascade' }),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    budgetWindow: budgetWindowEnum('budget_window').notNull(),
    limitUsd: numeric('limit_usd', { precision: 10, scale: 2 }).notNull(),
    thresholdPct: bigint('threshold_pct', { mode: 'number' }).notNull().default(80),
    action: ruleActionEnum('action').notNull().default('alert'),
    isActive: boolean('is_active').notNull().default(true),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index('idx_budget_rules_project_id').on(t.projectId),
    index('idx_budget_rules_user_id').on(t.userId),
  ],
);

export const alertLog = pgTable(
  'alert_log',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    projectId: uuid('project_id')
      .notNull()
      .references(() => projects.id, { onDelete: 'cascade' }),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    ruleId: uuid('rule_id').references(() => budgetRules.id, { onDelete: 'set null' }),
    triggeredAt: timestamp('triggered_at', { withTimezone: true }).notNull().defaultNow(),
    spendAtTrigger: numeric('spend_at_trigger', { precision: 10, scale: 2 }).notNull(),
    limitUsd: numeric('limit_usd', { precision: 10, scale: 2 }).notNull(),
    percentUsed: numeric('percent_used', { precision: 5, scale: 2 }).generatedAlwaysAs(
      sql`ROUND((spend_at_trigger / NULLIF(limit_usd, 0)) * 100, 2)`,
    ),
    actionTaken: text('action_taken'),
    notifiedVia: text('notified_via').array().notNull().default(sql`'{}'::text[]`),
    deliveryStatus: jsonb('delivery_status'),
    status: alertStatusEnum('status').notNull().default('active'),
    resolvedAt: timestamp('resolved_at', { withTimezone: true }),
  },
  (t) => [
    index('idx_alert_log_project_id').on(t.projectId),
    index('idx_alert_log_user_id').on(t.userId),
    index('idx_alert_log_triggered_at').on(t.triggeredAt),
  ],
);

export const notifications = pgTable(
  'notifications',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    type: text('type').notNull(),
    title: text('title').notNull(),
    message: text('message').notNull(),
    readAt: timestamp('read_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index('idx_notifications_user_id').on(t.userId)],
);
```

`frugal-api/src/db/client.ts`:
```ts
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { config } from '../config/unifiedConfig.js';
import * as schema from './schema.js';

const client = postgres(config.database.url, {
  ssl: 'require',
  max: 10,
});

export const db = drizzle(client, { schema });
export type Db = typeof db;
```

`frugal-api/drizzle.config.ts`:
```ts
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './src/db/schema.ts',
  out: './src/db/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    // drizzle-kit runs outside the app; direct env read is acceptable here
    url: process.env.DATABASE_URL ?? '',
  },
});
```

- [ ] **Step 4: Run schema test, generate migration, verify SQL**

Run: `npx vitest run tests/unit/schema.test.ts; npm run typecheck`
Expected: PASS (2 tests), typecheck exit 0

Run: `npx drizzle-kit generate` (no live DB needed)
Expected: one SQL file appears in `frugal-api/src/db/migrations/`

Verify migration contains all tables and the generated column (from `frugal-api/`):
```bash
grep -c "CREATE TABLE" src/db/migrations/*.sql        # expect 11
grep -c "CREATE TYPE" src/db/migrations/*.sql          # expect 7
grep "GENERATED ALWAYS AS" src/db/migrations/*.sql     # expect percent_used line
```

- [ ] **Step 5: Commit**

```bash
git add frugal-api/src/db frugal-api/drizzle.config.ts frugal-api/tests/unit/schema.test.ts
git commit -m "feat(api): complete Drizzle schema (11 tables, 7 enums) with migration"
```

---

### Task 6: AES-256-GCM encryption util

**Files:**
- Create: `frugal-api/src/utils/encryption.ts`
- Test: `frugal-api/tests/unit/encryption.test.ts`

**Interfaces:**
- Consumes: `config.encryption.key` (Task 2)
- Produces (Plan 3 connection service depends on these exact signatures):
  - `encrypt(plaintext: string): string` — returns `iv(hex):ciphertext(base64):authTag(hex)` (spec §8)
  - `decrypt(payload: string): string` — throws `Error('Decryption failed')` on tamper/bad format

- [ ] **Step 1: Write the failing test** — `frugal-api/tests/unit/encryption.test.ts`

```ts
import { describe, it, expect } from 'vitest';
import { encrypt, decrypt } from '../../src/utils/encryption.js';

describe('encryption (AES-256-GCM)', () => {
  it('round-trips plaintext', () => {
    const secret = 'sk-proj-abcdef1234567890';
    expect(decrypt(encrypt(secret))).toBe(secret);
  });

  it('produces iv:ciphertext:authTag in hex:base64:hex', () => {
    const parts = encrypt('hello').split(':');
    expect(parts).toHaveLength(3);
    expect(parts[0]).toMatch(/^[0-9a-f]{24}$/); // 12-byte IV hex
    expect(parts[2]).toMatch(/^[0-9a-f]{32}$/); // 16-byte auth tag hex
    expect(() => Buffer.from(parts[1]!, 'base64')).not.toThrow();
  });

  it('uses a fresh IV every call', () => {
    expect(encrypt('same')).not.toBe(encrypt('same'));
  });

  it('detects ciphertext tampering', () => {
    const payload = encrypt('sensitive');
    const [iv, ct, tag] = payload.split(':') as [string, string, string];
    const flipped = Buffer.from(ct, 'base64');
    flipped[0] = flipped[0]! ^ 0xff;
    const tampered = `${iv}:${flipped.toString('base64')}:${tag}`;
    expect(() => decrypt(tampered)).toThrow('Decryption failed');
  });

  it('rejects malformed payloads', () => {
    expect(() => decrypt('not-a-valid-payload')).toThrow('Decryption failed');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/unit/encryption.test.ts`
Expected: FAIL — module not found

- [ ] **Step 3: Write `frugal-api/src/utils/encryption.ts`**

```ts
import { createCipheriv, createDecipheriv, randomBytes } from 'node:crypto';
import { config } from '../config/unifiedConfig.js';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12; // NIST-recommended for GCM

function key(): Buffer {
  return Buffer.from(config.encryption.key, 'hex');
}

/** Returns `iv(hex):ciphertext(base64):authTag(hex)` per spec §8. */
export function encrypt(plaintext: string): string {
  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv(ALGORITHM, key(), iv);
  const ciphertext = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return `${iv.toString('hex')}:${ciphertext.toString('base64')}:${authTag.toString('hex')}`;
}

export function decrypt(payload: string): string {
  try {
    const parts = payload.split(':');
    if (parts.length !== 3) throw new Error('bad format');
    const [ivHex, ctB64, tagHex] = parts as [string, string, string];
    const decipher = createDecipheriv(ALGORITHM, key(), Buffer.from(ivHex, 'hex'));
    decipher.setAuthTag(Buffer.from(tagHex, 'hex'));
    const plaintext = Buffer.concat([
      decipher.update(Buffer.from(ctB64, 'base64')),
      decipher.final(),
    ]);
    return plaintext.toString('utf8');
  } catch {
    throw new Error('Decryption failed');
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/unit/encryption.test.ts`
Expected: PASS (5 tests)

- [ ] **Step 5: Commit**

```bash
git add frugal-api/src/utils/encryption.ts frugal-api/tests/unit/encryption.test.ts
git commit -m "feat(api): AES-256-GCM encryption util with tamper detection"
```

---

### Task 7: App assembly — `app.ts`, `/health`, `server.ts`

**Files:**
- Create: `frugal-api/src/app.ts`
- Create: `frugal-api/src/routes/healthRoutes.ts`
- Modify: `frugal-api/src/server.ts` (replace the `export {};` placeholder)
- Test: `frugal-api/tests/integration/app.test.ts`

**Interfaces:**
- Consumes: `requestId`, `errorHandler`, `config`, `logger` (Tasks 2–4)
- Produces: `createApp(): Express` — Plans 2–6 mount their routers inside it under `/api/v1/`; `NotFoundError`-shaped 404 JSON for unknown routes

- [ ] **Step 1: Write the failing test** — `frugal-api/tests/integration/app.test.ts`

```ts
import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { createApp } from '../../src/app.js';

describe('app', () => {
  const app = createApp();

  it('GET /health returns 200 with status ok', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(typeof res.body.uptime).toBe('number');
  });

  it('sets an X-Request-Id header on every response', async () => {
    const res = await request(app).get('/health');
    expect(res.headers['x-request-id']).toBeTruthy();
  });

  it('echoes a provided X-Request-Id', async () => {
    const res = await request(app).get('/health').set('X-Request-Id', 'my-trace-1');
    expect(res.headers['x-request-id']).toBe('my-trace-1');
  });

  it('returns spec-shaped 404 for unknown routes', async () => {
    const res = await request(app).get('/nope');
    expect(res.status).toBe(404);
    expect(res.body).toEqual({
      error: { code: 'NOT_FOUND', message: 'Route not found' },
    });
  });

  it('sets security headers via helmet', async () => {
    const res = await request(app).get('/health');
    expect(res.headers['x-content-type-options']).toBe('nosniff');
    expect(res.headers['x-frame-options']).toBeTruthy();
  });

  it('rejects bodies over 256kb', async () => {
    const big = { pad: 'x'.repeat(300 * 1024) };
    const res = await request(app).post('/health').send(big);
    expect(res.status).toBe(413);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/integration/app.test.ts`
Expected: FAIL — `createApp` not found

- [ ] **Step 3: Write the implementations**

`frugal-api/src/routes/healthRoutes.ts`:
```ts
import { Router } from 'express';

export const healthRoutes = Router();

healthRoutes.get('/', (_req, res) => {
  res.status(200).json({ status: 'ok', uptime: process.uptime() });
});
```

`frugal-api/src/app.ts`:
```ts
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
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
  app.use(express.json({ limit: '256kb' }));

  app.use('/health', healthRoutes);

  // Plans 2–6 mount domain routers here under /api/v1/

  app.use((_req, res) => {
    res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Route not found' } });
  });

  app.use(errorHandler);

  return app;
}
```

`frugal-api/src/server.ts` (instrument.ts MUST stay the first import):
```ts
import './instrument.js';
import { createApp } from './app.js';
import { config } from './config/unifiedConfig.js';
import { logger } from './utils/logger.js';

const app = createApp();

const server = app.listen(config.port, () => {
  logger.info({ port: config.port, env: config.env }, 'frugal-api listening');
});

function shutdown(signal: string) {
  logger.info({ signal }, 'shutting down');
  server.close(() => process.exit(0));
  setTimeout(() => process.exit(1), 10_000).unref();
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
```

Note on the 413 test: `express.json` emits a `PayloadTooLargeError` handled by Express's default error path before our handler; the response status is 413 either way. If the body shape assertion is needed later, extend `errorHandler` — out of scope here.

- [ ] **Step 4: Run the full suite**

Run: `npm test; npm run typecheck`
Expected: ALL tests pass (unit + integration), typecheck exit 0

Boot smoke check (optional, needs `.env` with valid values):
Run: `npx tsx src/server.ts` then `curl http://localhost:3000/health`
Expected: `{"status":"ok","uptime":...}`

- [ ] **Step 5: Commit**

```bash
git add frugal-api/src/app.ts frugal-api/src/routes frugal-api/src/server.ts frugal-api/tests/integration
git commit -m "feat(api): app assembly with helmet/cors/body-limit, /health, graceful shutdown"
```

---

## Definition of Done (Plan 1)

- `npm test` green: config (5), errors (7), logger (2), schema (2), encryption (5), app (6) — 27 tests
- `npm run typecheck` exit 0
- `npx drizzle-kit generate` produced a migration with 11 `CREATE TABLE` + 7 `CREATE TYPE`
- Server boots and serves `/health` with a real `.env`
- Zero `process.env` reads outside `unifiedConfig.ts` (+ `drizzle.config.ts`, documented exception)
- Zero `console.log` in `src/`

## Deferred to later plans (explicit, not forgotten)

- Auth routes/middleware/rate limiting → Plan 2
- `requestTimeout` middleware → Plan 2 (with auth routes, first consumer)
- Repositories/services/controllers/BaseController → Plan 2+ (first domain consumer)
- Redis client + BullMQ → Plan 4
- Applying migration to live Neon → first plan that needs a live DB (Plan 2 integration tests)