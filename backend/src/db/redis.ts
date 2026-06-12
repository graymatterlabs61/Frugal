import { Redis } from "@upstash/redis";
import { Ratelimit } from "@upstash/ratelimit";
import { config } from "../config/unifiedConfig.js";

export const redis = new Redis({
  url: config.redis.url,
  token: config.redis.token,
});

export async function pingRedis(): Promise<boolean> {
  try {
    await redis.ping();
    return true;
  } catch {
    return false;
  }
}

// Rate limiters — sliding window per key
export const ingestRatelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(60, "1 m"),
  prefix: "rl:ingest",
});

export const statusRatelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(30, "1 m"),
  prefix: "rl:status",
});

export const appApiRatelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(120, "1 m"),
  prefix: "rl:app",
});

export const authRatelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, "1 m"),
  prefix: "rl:auth",
});

// Cache helpers
const INGEST_KEY_TTL = 60;   // seconds
const STATUS_TTL = 30;

export async function getCachedIngestKey(hash: string) {
  return redis.get<{ projectId: string; userId: string; plan: string }>(`ik:${hash}`);
}

export async function setCachedIngestKey(
  hash: string,
  data: { projectId: string; userId: string; plan: string }
) {
  await redis.set(`ik:${hash}`, data, { ex: INGEST_KEY_TTL });
}

export async function invalidateIngestKey(hash: string) {
  await redis.del(`ik:${hash}`);
}

export async function getCachedStatus(projectId: string) {
  return redis.get<{ state: string; blockedRules: unknown[] }>(`status:${projectId}`);
}

export async function setCachedStatus(
  projectId: string,
  data: { state: string; blockedRules: unknown[] }
) {
  await redis.set(`status:${projectId}`, data, { ex: STATUS_TTL });
}

export async function invalidateStatus(projectId: string) {
  await redis.del(`status:${projectId}`);
}
