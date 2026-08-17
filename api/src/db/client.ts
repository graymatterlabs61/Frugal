import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { config } from '../config/unifiedConfig.js';
import * as schema from './schema.js';
import * as authSchema from './authSchema.js';

// Railway's private network (*.railway.internal) doesn't run TLS on Postgres —
// it's already isolated per-project. Managed providers (Neon etc) require it.
const isRailwayPrivateNetwork = config.database.url.includes('.railway.internal');

const client = postgres(config.database.url, {
  ssl: isRailwayPrivateNetwork ? false : 'require',
  max: 10,
});

export const db = drizzle(client, { schema: { ...schema, ...authSchema } });
export type Db = typeof db;