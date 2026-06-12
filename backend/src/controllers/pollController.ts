import { createHmac } from "node:crypto";
import type { Request, Response } from "express";
import { config } from "../config/unifiedConfig.js";
import { db } from "../db/index.js";
import { BudgetRepository } from "../repositories/BudgetRepository.js";
import { ConnectionRepository } from "../repositories/ConnectionRepository.js";
import { UsageRepository } from "../repositories/UsageRepository.js";
import { PollingService } from "../services/pollingService.js";
import { UnauthorizedError } from "../utils/errors.js";
import { logger } from "../utils/logger.js";
import { BaseController } from "./BaseController.js";

/**
 * Verify QStash signature using HMAC-SHA256.
 * Checks both current and next signing keys (for seamless key rotation).
 * In development, skip verification when no keys are configured.
 */
function verifyQStashSignature(req: Request): boolean {
  const { currentSigningKey, nextSigningKey } = config.qstash;

  if (!currentSigningKey && !nextSigningKey) {
    if (!config.isProduction) {
      logger.warn("qstash_signature_skipped", { reason: "No signing keys configured (dev mode)" });
      return true;
    }
    return false;
  }

  const signature = req.headers["upstash-signature"];
  if (typeof signature !== "string") return false;

  // QStash signs the raw body with HMAC-SHA256 using the signing key
  const body = JSON.stringify(req.body);

  const keysToCheck = [currentSigningKey, nextSigningKey].filter(
    (k): k is string => typeof k === "string"
  );

  return keysToCheck.some((key) => {
    const expected = createHmac("sha256", key).update(body).digest("base64");
    return signature === expected;
  });
}

class PollController extends BaseController {
  private getService(): PollingService {
    return new PollingService(
      new ConnectionRepository(db),
      new UsageRepository(db),
      new BudgetRepository(db)
    );
  }

  async poll(req: Request, res: Response): Promise<void> {
    if (!verifyQStashSignature(req)) {
      throw new UnauthorizedError("Invalid QStash signature");
    }

    logger.info("poll_triggered", { requestId: req.requestId });
    await this.getService().runPollingCycle();
    this.handleNoContent(res);
  }
}

export const pollController = new PollController();
