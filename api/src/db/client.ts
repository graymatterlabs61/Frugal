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