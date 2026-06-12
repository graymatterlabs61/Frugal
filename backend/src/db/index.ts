import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import { config } from "../config/unifiedConfig.js";
import * as schema from "./schema.js";

const pool = new pg.Pool({
  connectionString: config.db.url,
  max: 10,
});

export const db = drizzle(pool, { schema });

export type Db = typeof db;

/** For health checks and graceful shutdown. */
export async function pingDb(): Promise<boolean> {
  const result = await pool.query("SELECT 1");
  return result.rowCount === 1;
}

export async function closeDb(): Promise<void> {
  await pool.end();
}
