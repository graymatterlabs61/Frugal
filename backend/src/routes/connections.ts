import { Router } from "express";
import { connectionController } from "../controllers/connectionController.js";
import { asyncErrorWrapper } from "../middleware/asyncErrorWrapper.js";
import { requireAuth } from "../middleware/requireAuth.js";

const router = Router();

router.use(requireAuth);

router.get("/", asyncErrorWrapper(connectionController.list.bind(connectionController)));
router.post("/", asyncErrorWrapper(connectionController.create.bind(connectionController)));
router.get("/:id", asyncErrorWrapper(connectionController.get.bind(connectionController)));
router.delete("/:id", asyncErrorWrapper(connectionController.delete.bind(connectionController)));

export default router;
