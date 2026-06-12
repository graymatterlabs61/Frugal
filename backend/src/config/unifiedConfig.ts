import "dotenv/config";
import { z } from "zod";

/**
 * unifiedConfig — the ONLY place process.env is read.
 * Boot fails fast on missing/invalid env.
 */
const envSchema = z.object({
  DATABASE_URL: z.string().url({ message: "DATABASE_URL must be a valid Postgres URL" }),
  JWT_SECRET: z.string().min(32, "JWT_SECRET must be at least 32 characters"),
  JWT_EXPIRES_IN_SECONDS: z.coerce.number().int().positive().default(604800),
  ENCRYPTION_KEY: z
    .string()
    .regex(/^[0-9a-f]{64}$/i, "ENCRYPTION_KEY must be a 64-character hex string (32 bytes)"),
  PORT: z.coerce.number().int().positive().default(4000),
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  CORS_ORIGINS: z.string().default("http://localhost:3000"),
  SENTRY_DSN: z.string().url().optional().or(z.literal("").transform(() => undefined)),
  RESEND_API_KEY: z.string().optional(),
  RESEND_FROM_WELCOME: z.string().default("Frugal <hello@getfrugal.dev>"),
  RESEND_FROM_ALERTS: z.string().default("Frugal Alerts <alerts@getfrugal.dev>"),
  RESEND_FROM_DIGEST: z.string().default("Frugal <digest@getfrugal.dev>"),
  RESEND_FROM_BILLING: z.string().default("Frugal Billing <billing@getfrugal.dev>"),
  RESEND_FROM_NOREPLY: z.string().default("Frugal <noreply@getfrugal.dev>"),
  RESEND_FROM_SUPPORT: z.string().default("Frugal Support <support@getfrugal.dev>"),
  RESEND_FROM_MARKETING: z.string().default("Frugal <hello@getfrugal.dev>"),
  QSTASH_URL: z.string().url().optional(),
  QSTASH_TOKEN: z.string().optional(),
  QSTASH_CURRENT_SIGNING_KEY: z.string().optional(),
  QSTASH_NEXT_SIGNING_KEY: z.string().optional(),
  UPSTASH_REDIS_REST_URL: z.string().url({ message: "UPSTASH_REDIS_REST_URL must be a valid URL" }),
  UPSTASH_REDIS_REST_TOKEN: z.string().min(1, "UPSTASH_REDIS_REST_TOKEN is required"),
  R2_ACCOUNT_ID: z.string().optional(),
  R2_ACCESS_KEY_ID: z.string().optional(),
  R2_SECRET_ACCESS_KEY: z.string().optional(),
  R2_BUCKET_NAME: z.string().default("frugal"),
  R2_ENDPOINT: z.string().url().optional(),
  R2_PUBLIC_URL: z.string().url().optional(),
  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),
  STRIPE_PRICE_STARTER: z.string().optional(),
  STRIPE_PRICE_GROWTH: z.string().optional(),
  STRIPE_PRICE_PRO: z.string().optional(),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  const issues = parsed.error.issues
    .map((i) => `  - ${i.path.join(".")}: ${i.message}`)
    .join("\n");
  throw new Error(`Invalid environment configuration:\n${issues}`);
}

const env = parsed.data;

export const config = {
  env: env.NODE_ENV,
  isProduction: env.NODE_ENV === "production",
  server: {
    port: env.PORT,
    corsOrigins: env.CORS_ORIGINS.split(",").map((o) => o.trim()).filter(Boolean),
  },
  db: {
    url: env.DATABASE_URL,
  },
  auth: {
    jwtSecret: env.JWT_SECRET,
    jwtExpiresInSeconds: env.JWT_EXPIRES_IN_SECONDS,
  },
  encryption: {
    key: env.ENCRYPTION_KEY,
  },
  observability: {
    sentryDsn: env.SENTRY_DSN,
  },
  resend: {
    apiKey: env.RESEND_API_KEY,
    from: {
      welcome:   env.RESEND_FROM_WELCOME,
      alerts:    env.RESEND_FROM_ALERTS,
      digest:    env.RESEND_FROM_DIGEST,
      billing:   env.RESEND_FROM_BILLING,
      noreply:   env.RESEND_FROM_NOREPLY,
      support:   env.RESEND_FROM_SUPPORT,
      marketing: env.RESEND_FROM_MARKETING,
    },
  },
  qstash: {
    url: env.QSTASH_URL,
    token: env.QSTASH_TOKEN,
    currentSigningKey: env.QSTASH_CURRENT_SIGNING_KEY,
    nextSigningKey: env.QSTASH_NEXT_SIGNING_KEY,
  },
  redis: {
    url: env.UPSTASH_REDIS_REST_URL,
    token: env.UPSTASH_REDIS_REST_TOKEN,
  },
  r2: {
    accountId: env.R2_ACCOUNT_ID,
    accessKeyId: env.R2_ACCESS_KEY_ID,
    secretAccessKey: env.R2_SECRET_ACCESS_KEY,
    bucketName: env.R2_BUCKET_NAME,
    endpoint: env.R2_ENDPOINT,
    // Custom domain — use for public URLs instead of signed r2.cloudflarestorage.com URLs
    publicUrl: env.R2_PUBLIC_URL,
    enabled: !!(env.R2_ACCOUNT_ID && env.R2_ACCESS_KEY_ID && env.R2_SECRET_ACCESS_KEY && env.R2_ENDPOINT),
  },
  stripe: {
    secretKey: env.STRIPE_SECRET_KEY,
    webhookSecret: env.STRIPE_WEBHOOK_SECRET,
    prices: {
      starter: env.STRIPE_PRICE_STARTER,
      growth: env.STRIPE_PRICE_GROWTH,
      pro: env.STRIPE_PRICE_PRO,
    },
    // Real Stripe keys start with sk_test_ or sk_live_ and are ~108 chars
    enabled: !!(
      env.STRIPE_SECRET_KEY &&
      (env.STRIPE_SECRET_KEY.startsWith("sk_test_") || env.STRIPE_SECRET_KEY.startsWith("sk_live_")) &&
      env.STRIPE_SECRET_KEY.length > 20
    ),
  },
} as const;

export type Config = typeof config;