import { Router } from "express";
import { healthController } from "../controllers/healthController.js";
import { asyncErrorWrapper } from "../middleware/asyncErrorWrapper.js";

const router = Router();

router.get("/", asyncErrorWrapper(healthController.health.bind(healthController)));

export default router;
