import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(3000),
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  DATABASE_POOL_URL: z.string().min(1).optional(),
  REDIS_URL: z.string().min(1, 'REDIS_URL is required'),
  REDIS_TOKEN: z.string().optional(),
  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters'),
  JWT_EXPIRES_IN_SECONDS: z.coerce.number().int().positive().default(604800),
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