import type { Request, Response, NextFunction } from "express";
import { Router } from "express";
import { billingController } from "../controllers/billingController.js";
import { asyncErrorWrapper } from "../middleware/asyncErrorWrapper.js";
import { requireAuth } from "../middleware/requireAuth.js";
import { config } from "../config/unifiedConfig.js";

const router = Router();

function requireStripe(_req: Request, res: Response, next: NextFunction): void {
  if (!config.stripe.enabled) {
    res.status(503).json({ error: { code: "billing_unavailable", message: "Billing not configured" } });
    return;
  }
  next();
}

router.get(
  "/subscription",
  requireAuth,
  requireStripe,
  asyncErrorWrapper(billingController.getSubscription.bind(billingController))
);
router.post(
  "/checkout",
  requireAuth,
  requireStripe,
  asyncErrorWrapper(billingController.createCheckout.bind(billingController))
);
router.post(
  "/portal",
  requireAuth,
  requireStripe,
  asyncErrorWrapper(billingController.createPortal.bind(billingController))
);
router.get(
  "/invoices",
  requireAuth,
  requireStripe,
  asyncErrorWrapper(billingController.getInvoices.bind(billingController))
);
router.get(
  "/payment-method",
  requireAuth,
  requireStripe,
  asyncErrorWrapper(billingController.getPaymentMethod.bind(billingController))
);
router.get(
  "/usage",
  requireAuth,
  requireStripe,
  asyncErrorWrapper(billingController.getUsage.bind(billingController))
);
// No auth — Stripe verifies via signature
router.post(
  "/webhook",
  requireStripe,
  asyncErrorWrapper(billingController.handleWebhook.bind(billingController))
);

export default router;
