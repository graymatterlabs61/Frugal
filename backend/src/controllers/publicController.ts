import type { Request, Response } from "express";
import { blogPosts, coverStory } from "../data/blog.js";
import { corporatePlans, faqs, personalPlans } from "../data/plans.js";
import { BaseController } from "./BaseController.js";

class PublicController extends BaseController {
  getPlans(_req: Request, res: Response): void {
    this.handleSuccess(res, {
      personal: personalPlans,
      corporate: corporatePlans,
      faqs,
    });
  }

  getBlogPosts(_req: Request, res: Response): void {
    this.handleSuccess(res, { coverStory, posts: blogPosts });
  }

  getBlogPost(req: Request, res: Response): void {
    const { slug } = req.params;
    const post = blogPosts.find((p) => p.slug === slug);
    if (!post) {
      res.status(404).json({ error: { code: "not_found", message: "Post not found" } });
      return;
    }
    this.handleSuccess(res, post);
  }
}

export const publicController = new PublicController();
