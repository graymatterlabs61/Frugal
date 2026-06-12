import { Router } from "express";
import { publicController } from "../controllers/publicController.js";

const router = Router();

router.get("/plans", (req, res) => publicController.getPlans(req, res));
router.get("/blog", (req, res) => publicController.getBlogPosts(req, res));
router.get("/blog/:slug", (req, res) => publicController.getBlogPost(req, res));

export default router;
