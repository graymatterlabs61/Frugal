import { Router } from "express";
import { dashboardController } from "../controllers/dashboardController.js";
import { asyncErrorWrapper } from "../middleware/asyncErrorWrapper.js";
import { requireAuth } from "../middleware/requireAuth.js";

const router = Router();

router.get(
  "/stats",
  requireAuth,
  asyncErrorWrapper(dashboardController.getStats.bind(dashboardController))
);
router.get(
  "/daily-spend",
  requireAuth,
  asyncErrorWrapper(dashboardController.getDailySpend.bind(dashboardController))
);
router.get(
  "/top-projects",
  requireAuth,
  asyncErrorWrapper(dashboardController.getTopProjects.bind(dashboardController))
);
router.get(
  "/recent-alerts",
  requireAuth,
  asyncErrorWrapper(dashboardController.getRecentAlerts.bind(dashboardController))
);

export default router;
