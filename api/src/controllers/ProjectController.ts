import type { Request, Response } from 'express';
import { z } from 'zod';
import { ProjectService } from '../services/ProjectService.js';

const createProjectSchema = z
  .object({
    name: z.string().min(1).max(200),
    description: z.string().max(2000).optional(),
    color: z.string().max(50).optional(),
  })
  .strict();

const updateProjectSchema = createProjectSchema.partial();

export const ProjectController = {
  async list(req: Request, res: Response): Promise<void> {
    const projects = await ProjectService.list(req.userId!);
    res.json({ projects });
  },

  async get(req: Request, res: Response): Promise<void> {
    const project = await ProjectService.get(req.params.id as string, req.userId!);
    res.json({ project });
  },

  async create(req: Request, res: Response): Promise<void> {
    const body = createProjectSchema.parse(req.body);
    const project = await ProjectService.create(req.userId!, req.userPlan, body);
    res.status(201).json({ project });
  },

  async update(req: Request, res: Response): Promise<void> {
    const body = updateProjectSchema.parse(req.body);
    const project = await ProjectService.update(req.params.id as string, req.userId!, body);
    res.json({ project });
  },

  async remove(req: Request, res: Response): Promise<void> {
    await ProjectService.remove(req.params.id as string, req.userId!);
    res.status(204).send();
  },
};
