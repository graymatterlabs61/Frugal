import type { Request, Response } from 'express';
import { z } from 'zod';
import { ConnectionService } from '../services/ConnectionService.js';
import { providerEnum, type apiConnections } from '../db/schema.js';

const createConnectionSchema = z
  .object({
    projectId: z.string().uuid(),
    provider: z.enum(providerEnum.enumValues),
    label: z.string().max(200).optional(),
    apiKey: z.string().min(1).max(500),
  })
  .strict();

const updateConnectionSchema = z
  .object({
    label: z.string().max(200).optional(),
    isActive: z.boolean().optional(),
  })
  .strict();

function serializeConnection(connection: typeof apiConnections.$inferSelect) {
  const { apiKeyEncrypted: _apiKeyEncrypted, ...safe } = connection;
  return safe;
}

export const ConnectionController = {
  async list(req: Request, res: Response): Promise<void> {
    const connections = await ConnectionService.list(req.userId!);
    res.json({ connections: connections.map(serializeConnection) });
  },

  async create(req: Request, res: Response): Promise<void> {
    const body = createConnectionSchema.parse(req.body);
    const connection = await ConnectionService.create(req.userId!, req.userPlan, body);
    res.status(201).json({ connection: serializeConnection(connection) });
  },

  async update(req: Request, res: Response): Promise<void> {
    const body = updateConnectionSchema.parse(req.body);
    const connection = await ConnectionService.update(req.params.id as string, req.userId!, body);
    res.json({ connection: serializeConnection(connection) });
  },

  async remove(req: Request, res: Response): Promise<void> {
    await ConnectionService.remove(req.params.id as string, req.userId!);
    res.status(204).send();
  },
};
