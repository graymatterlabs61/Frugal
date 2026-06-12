import type { Request, Response } from "express";
import { z } from "zod";
import { db } from "../db/index.js";
import { getUserId } from "../middleware/requireAuth.js";
import { ProjectRepository } from "../repositories/ProjectRepository.js";
import { UserRepository } from "../repositories/UserRepository.js";
import { ProjectService } from "../services/projectService.js";
import { NotFoundError } from "../utils/errors.js";
import { BaseController } from "./BaseController.js";

const createSchema = z
  .object({
    name: z.string().min(1).max(100),
    description: z.string().max(500).optional(),
    color: z.string().max(50).optional(),
  })
  .strict();

const updateSchema = z
  .object({
    name: z.string().min(1).max(100).optional(),
    description: z.string().max(500).optional(),
    color: z.string().max(50).optional(),
    slackWebhookUrl: z.string().url().max(500).optional(),
  })
  .strict();

const paramsSchema = z.object({ id: z.string().uuid() }).strict();

class ProjectController extends BaseController {
  private getService(): ProjectService {
    return new ProjectService(new ProjectRepository(db));
  }

  private async getUserPlan(userId: string) {
    const userRepo = new UserRepository(db);
    const user = await userRepo.findById(userId);
    if (!user) throw new NotFoundError("User not found");
    return user.plan;
  }

  async list(req: Request, res: Response): Promise<void> {
    const userId = getUserId(req);
    const projects = await this.getService().list(userId);
    this.handleSuccess(res, projects);
  }

  async create(req: Request, res: Response): Promise<void> {
    const userId = getUserId(req);
    const input = createSchema.parse(req.body);
    const plan = await this.getUserPlan(userId);
    const project = await this.getService().create(userId, input, plan);
    this.handleCreated(res, project);
  }

  async get(req: Request, res: Response): Promise<void> {
    const userId = getUserId(req);
    const { id } = paramsSchema.parse(req.params);
    const project = await this.getService().get(userId, id);
    this.handleSuccess(res, project);
  }

  async update(req: Request, res: Response): Promise<void> {
    const userId = getUserId(req);
    const { id } = paramsSchema.parse(req.params);
    const input = updateSchema.parse(req.body);
    const project = await this.getService().update(userId, id, input);
    this.handleSuccess(res, project);
  }

  async delete(req: Request, res: Response): Promise<void> {
    const userId = getUserId(req);
    const { id } = paramsSchema.parse(req.params);
    await this.getService().delete(userId, id);
    this.handleNoContent(res);
  }
}

export const projectController = new ProjectController();
