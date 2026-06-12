import type { Request, Response } from "express";
import { pingDb } from "../db/index.js";
import { pingRedis } from "../db/redis.js";
import { logger } from "../utils/logger.js";
import { BaseController } from "./BaseController.js";

class HealthController extends BaseController {
  async health(_req: Request, res: Response): Promise<void> {
    const [dbOk, redisOk] = await Promise.all([
      pingDb().catch((err) => {
        logger.error("health_db_ping_failed", { error: err instanceof Error ? err.message : String(err) });
        return false;
      }),
      pingRedis().catch(() => false),
    ]);

    const allOk = dbOk && redisOk;
    res.status(allOk ? 200 : 503).json({
      data: {
        status: allOk ? "ok" : "degraded",
        db: dbOk,
        redis: redisOk,
        timestamp: new Date().toISOString(),
      },
    });
  }
}

export const healthController = new HealthController();
