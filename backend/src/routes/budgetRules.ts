import { Router } from "express";
import { budgetController } from "../controllers/budgetController.js";
import { asyncErrorWrapper } from "../middleware/asyncErrorWrapper.js";
import { requireAuth } from "../middleware/requireAuth.js";

const router = Router();

router.use(requireAuth);

// Nested under project: /api/projects/:projectId/budget-rules
// But also mounted at /api/budget-rules/:id for single-resource operations
router.get(
  "/projects/:projectId",
  asyncErrorWrapper(budgetController.list.bind(budgetController))
);
router.post(
  "/projects/:projectId",
  asyncErrorWrapper(budgetController.create.bind(budgetController))
);
router.delete("/:id", asyncErrorWrapper(budgetController.delete.bind(budgetController)));

export default router;
