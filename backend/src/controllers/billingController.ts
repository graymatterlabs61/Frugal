import type { Request, Response } from "express";
import { z } from "zod";
import { db } from "../db/index.js";
import { getUserId } from "../middleware/requireAuth.js";
import { UserRepository } from "../repositories/UserRepository.js";
import { ConnectionRepository } from "../repositories/ConnectionRepository.js";
import { ProjectRepository } from "../repositories/ProjectRepository.js";
import { BillingService } from "../services/billingService.js";
import { BaseController } from "./BaseController.js";
import { PLAN_LIMITS, type Plan } from "../utils/tier.js";

const checkoutSchema = z
  .object({
    plan: z.enum(["plus", "pro", "corp_starter", "corp_growth", "corp_scale"]),
    successUrl: z.string().url(),
    cancelUrl: z.string().url(),
  })
  .strict();

const portalSchema = z
  .object({
    returnUrl: z.string().url(),
  })
  .strict();

class BillingController extends BaseController {
  private service(): BillingService {
    return new BillingService(new UserRepository(db));
  }

  async getSubscription(req: Request, res: Response): Promise<void> {
    const userId = getUserId(req);
    const result = await this.service().getSubscription(userId);
    this.handleSuccess(res, result);
  }

  async createCheckout(req: Request, res: Response): Promise<void> {
    const userId = getUserId(req);
    const input = checkoutSchema.parse(req.body);
    const userRepo = new UserRepository(db);
    const user = await userRepo.findById(userId);
    if (!user) {
      res.status(404).json({ error: { code: "not_found", message: "User not found" } });
      return;
    }
    const result = await this.service().createCheckoutSession({
      userId,
      email: user.email,
      plan: input.plan,
      successUrl: input.successUrl,
      cancelUrl: input.cancelUrl,
    });
    this.handleSuccess(res, result);
  }

  async createPortal(req: Request, res: Response): Promise<void> {
    const userId = getUserId(req);
    const input = portalSchema.parse(req.body);
    const result = await this.service().createPortalSession({
      userId,
      returnUrl: input.returnUrl,
    });
    this.handleSuccess(res, result);
  }

  async getInvoices(req: Request, res: Response): Promise<void> {
    const userId = getUserId(req);
    const result = await this.service().getInvoices(userId);
    this.handleSuccess(res, { invoices: result });
  }

  async getPaymentMethod(req: Request, res: Response): Promise<void> {
    const userId = getUserId(req);
    const result = await this.service().getDefaultPaymentMethod(userId);
    this.handleSuccess(res, result);
  }

  async getUsage(req: Request, res: Response): Promise<void> {
    const userId = getUserId(req);
    const userRepo = new UserRepository(db);
    const user = await userRepo.findById(userId);
    if (!user) {
      res.status(404).json({ error: { code: "not_found", message: "User not found" } });
      return;
    }
    const [connections, projects] = await Promise.all([
      new ConnectionRepository(db).countByUser(userId),
      new ProjectRepository(db).countByUser(userId),
    ]);
    const limits = PLAN_LIMITS[user.plan as Plan];
    this.handleSuccess(res, {
      connections,
      projects,
      limits: {
        connections: limits.connections === Infinity ? -1 : limits.connections,
        projects: limits.projects === Infinity ? -1 : limits.projects,
      },
      plan: user.plan,
    });
  }

  async handleWebhook(req: Request, res: Response): Promise<void> {
    const sig = req.headers["stripe-signature"];
    if (!sig || typeof sig !== "string") {
      res.status(400).json({ error: { code: "bad_request", message: "Missing stripe-signature header" } });
      return;
    }
    await this.service().handleWebhook(req.body as Buffer, sig);
    res.status(200).json({ received: true });
  }
}

export const billingController = new BillingController();
