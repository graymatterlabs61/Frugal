import type { Request, Response } from "express";
import { z } from "zod";
import { db } from "../db/index.js";
import { providerEnum } from "../db/schema.js";
import { getUserId } from "../middleware/requireAuth.js";
import { ConnectionRepository } from "../repositories/ConnectionRepository.js";
import { UserRepository } from "../repositories/UserRepository.js";
import { ConnectionService } from "../services/connectionService.js";
import { NotFoundError } from "../utils/errors.js";
import { BaseController } from "./BaseController.js";

const providerValues = providerEnum.enumValues;

const createSchema = z
  .object({
    provider: z.enum(providerValues),
    label: z.string().max(100).optional(),
    projectId: z.string().uuid().optional(),
    apiKey: z.string().min(1).max(200),
  })
  .strict();

const listQuerySchema = z
  .object({
    projectId: z.string().uuid().optional(),
  })
  .strict();

const paramsSchema = z.object({ id: z.string().uuid() }).strict();

class ConnectionController extends BaseController {
  private getService(): ConnectionService {
    return new ConnectionService(new ConnectionRepository(db));
  }

  private async getUserPlan(userId: string) {
    const userRepo = new UserRepository(db);
    const user = await userRepo.findById(userId);
    if (!user) throw new NotFoundError("User not found");
    return user.plan;
  }

  async list(req: Request, res: Response): Promise<void> {
    const userId = getUserId(req);
    const query = listQuerySchema.parse(req.query);
    const connections = await this.getService().list(userId, query.projectId);
    this.handleSuccess(res, connections);
  }

  async create(req: Request, res: Response): Promise<void> {
    const userId = getUserId(req);
    const input = createSchema.parse(req.body);
    const plan = await this.getUserPlan(userId);
    const conn = await this.getService().create(userId, input, plan);
    this.handleCreated(res, conn);
  }

  async get(req: Request, res: Response): Promise<void> {
    const userId = getUserId(req);
    const { id } = paramsSchema.parse(req.params);
    const conn = await this.getService().get(userId, id);
    this.handleSuccess(res, conn);
  }

  async delete(req: Request, res: Response): Promise<void> {
    const userId = getUserId(req);
    const { id } = paramsSchema.parse(req.params);
    await this.getService().delete(userId, id);
    this.handleNoContent(res);
  }
}

export const connectionController = new ConnectionController();
