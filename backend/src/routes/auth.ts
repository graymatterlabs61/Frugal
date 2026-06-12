import { Router } from "express";
import { authController } from "../controllers/authController.js";
import { asyncErrorWrapper } from "../middleware/asyncErrorWrapper.js";
import { requireAuth } from "../middleware/requireAuth.js";
import { authRateLimit } from "../middleware/rateLimit.js";

const router = Router();

router.post("/register", authRateLimit, asyncErrorWrapper(authController.register.bind(authController)));
router.post("/login", authRateLimit, asyncErrorWrapper(authController.login.bind(authController)));
router.post(
  "/change-password",
  requireAuth,
  asyncErrorWrapper(authController.changePassword.bind(authController))
);
router.post("/google", authRateLimit, asyncErrorWrapper(authController.googleAuth.bind(authController)));
router.get("/me", requireAuth, asyncErrorWrapper(authController.me.bind(authController)));

export default router;
