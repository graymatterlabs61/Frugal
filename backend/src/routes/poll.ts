import { Router } from "express";
import { pollController } from "../controllers/pollController.js";
import { asyncErrorWrapper } from "../middleware/asyncErrorWrapper.js";

const router = Router();

// QStash-triggered endpoint — no user auth, signature-verified instead
router.post("/", asyncErrorWrapper(pollController.poll.bind(pollController)));

export default router;
