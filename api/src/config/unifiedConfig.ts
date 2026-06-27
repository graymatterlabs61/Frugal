import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().default(3000),

  DATABASE_URL: z.string().min(1),
  DATABASE_POOL_URL: z.string().optional(),

  REDIS_URL: z.string().min(1),
  REDIS_TOKEN: z.string().optional(),

  JWT_SECRET: z.string().min(32),
  JWT_EXPIRES_IN_SECONDS: z.coerce.number().default(604800),

  ENCRYPTION_KEY: z.string().length(64), // 32-byte hex = 64 hex chars

  STRIPE_SECRET_KEY: z.string().min(1),
  STRIPE_WEBHOOK_SECRET: z.string().min(1),
  STRIPE_PRICE_PLUS_MONTHLY: z.string().min(1),
  STRIPE_PRICE_PLUS_YEARLY: z.string().min(1),
  STRIPE_PRICE_PRO_MONTHLY: z.string().min(1),
  STRIPE_PRICE_PRO_YEARLY: z.string().min(1),

  RESEND_API_KEY: z.string().min(1),
  RESEND_FROM_ADDRESS: z.string().email(),

  SENTRY_DSN: z.string().url().optional(),

  CORS_ORIGINS: z.string().default('http://localhost:5173'),

  GOOGLE_CLIENT_ID: z.string().optional(),
});

function parseEnv() {
  const result = envSchema.safeParse(process.env);
  if (!result.success) {
    const missing = result.error.issues.map((i) => i.path.join('.')).join(', ');
    throw new Error(`Invalid environment variables: ${missing}`);
  }
  return result.data;
}

const env = parseEnv();

export const config = {
  env: env.NODE_ENV,
  isProduction: env.NODE_ENV === 'production',
  isTest: env.NODE_ENV === 'test',

  server: {
    port: env.PORT,
    corsOrigins: env.CORS_ORIGINS.split(',').map((o) => o.trim()),
  },

  db: {
    url: env.DATABASE_URL,
    poolUrl: env.DATABASE_POOL_URL,
  },

  redis: {
    url: env.REDIS_URL,
    token: env.REDIS_TOKEN,
  },

  auth: {
    jwtSecret: env.JWT_SECRET,
    jwtExpiresInSeconds: env.JWT_EXPIRES_IN_SECONDS,
  },

  encryption: {
    key: env.ENCRYPTION_KEY,
  },

  stripe: {
    secretKey: env.STRIPE_SECRET_KEY,
    webhookSecret: env.STRIPE_WEBHOOK_SECRET,
    prices: {
      plusMonthly: env.STRIPE_PRICE_PLUS_MONTHLY,
      plusYearly: env.STRIPE_PRICE_PLUS_YEARLY,
      proMonthly: env.STRIPE_PRICE_PRO_MONTHLY,
      proYearly: env.STRIPE_PRICE_PRO_YEARLY,
    },
  },

  resend: {
    apiKey: env.RESEND_API_KEY,
    fromAddress: env.RESEND_FROM_ADDRESS,
  },

  sentry: {
    dsn: env.SENTRY_DSN,
  },

  google: {
    clientId: env.GOOGLE_CLIENT_ID,
  },
} as const;

export type Config = typeof config;