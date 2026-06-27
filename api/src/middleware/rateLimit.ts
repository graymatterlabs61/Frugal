import type { Request, Response, NextFunction } from 'express';
import { Redis } from 'ioredis';
import { config } from '@/config/unifiedConfig';
import { RateLimitError } from '@/utils/errors';

let redisClient: Redis | null = null;

function getRedis(): Redis {
  if (!redisClient) {
    redisClient = new Redis(config.redis.url, { lazyConnect: true, enableAutoPipelining: true });
  }
  return redisClient;
}

interface RateLimitOptions {
  windowMs: number;    // window in milliseconds
  max: number;         // max requests per window
  keyPrefix: string;
}

// Atomic INCR + EXPIRE — prevents the race where EXPIRE never runs if process dies between the two calls
const INCR_EXPIRE_LUA = `
local c = redis.call('INCR', KEYS[1])
if c == 1 then redis.call('EXPIRE', KEYS[1], ARGV[1]) end
return c
`;

function createRateLimiter(opts: RateLimitOptions) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const ip = req.ip ?? 'unknown';
    const key = `${opts.keyPrefix}:${ip}`;
    const windowSeconds = Math.ceil(opts.windowMs / 1000);
    const redis = getRedis();

    try {
      const current = (await redis.eval(INCR_EXPIRE_LUA, 1, key, String(windowSeconds))) as number;
      const remaining = Math.max(0, opts.max - current);
      const resetEpoch = Math.ceil(Date.now() / 1000) + windowSeconds;

      res.setHeader('RateLimit-Limit', opts.max);
      res.setHeader('RateLimit-Remaining', remaining);
      res.setHeader('RateLimit-Reset', resetEpoch);

      if (current > opts.max) {
        return next(new RateLimitError());
      }
      next();
    } catch {
      // Redis unavailable — fail open (don't block requests)
      next();
    }
  };
}

// POST /auth/login — 5 attempts per 15 minutes per IP
export const loginRateLimit = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 5,
  keyPrefix: 'rl:login',
});

// General API — 300 req/min per IP
export const apiRateLimit = createRateLimiter({
  windowMs: 60 * 1000,
  max: 300,
  keyPrefix: 'rl:api',
});

export { getRedis };