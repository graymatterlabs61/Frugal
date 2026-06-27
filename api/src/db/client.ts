import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { config } from '@/config/unifiedConfig';
import * as schema from './schema';

// Use the pgBouncer/Neon pool URL when available (required at scale).
// Direct URL (config.db.url) maxes out at ~10 real Postgres connections.
// Pool URL routes through connection pooler and supports far higher concurrency.
const connectionUrl = config.db.poolUrl ?? config.db.url;
const queryClient = postgres(connectionUrl, {
  max: config.db.poolUrl ? 20 : 10,
  ssl: connectionUrl.includes('sslmode=require') || config.isProduction ? 'require' : false,
  // Neon pool connections must not be kept idle — set a short idle timeout
  idle_timeout: config.db.poolUrl ? 20 : undefined,
});

export const db = drizzle(queryClient, { schema });

export type DB = typeof db;