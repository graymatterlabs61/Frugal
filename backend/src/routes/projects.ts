import { Router } from "express";
import { projectController } from "../controllers/projectController.js";
import { asyncErrorWrapper } from "../middleware/asyncErrorWrapper.js";
import { requireAuth } from "../middleware/requireAuth.js";

const router = Router();

// All project routes require authentication
router.use(requireAuth);

router.get("/", asyncErrorWrapper(projectController.list.bind(projectController)));
router.post("/", asyncErrorWrapper(projectController.create.bind(projectController)));
router.get("/:id", asyncErrorWrapper(projectController.get.bind(projectController)));
router.patch("/:id", asyncErrorWrapper(projectController.update.bind(projectController)));
router.delete("/:id", asyncErrorWrapper(projectController.delete.bind(projectController)));

export default router;
