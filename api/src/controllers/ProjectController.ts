import type { Request, Response } from 'express';
import { BaseController } from './BaseController';
import { ProjectService, ConnectionService } from '@/services/projectService';
import { ProjectRepository } from '@/repositories/ProjectRepository';
import { ConnectionRepository } from '@/repositories/ConnectionRepository';
import {
  createProjectSchema,
  updateProjectSchema,
  createConnectionSchema,
  updateConnectionSchema,
} from '@/validators/projects.schema';

const projectService = new ProjectService(new ProjectRepository(), new ConnectionRepository());
const connectionService = new ConnectionService(new ConnectionRepository(), new ProjectRepository());


class ProjectController extends BaseController {
  async list(req: Request, res: Response): Promise<void> {
    try {
      const projects = await projectService.getAll(req.user!.id);
      this.handleSuccess(res, { projects });
    } catch (error) {
      this.handleError(error, res, 'listProjects');
    }
  }

  async get(req: Request, res: Response): Promise<void> {
    try {
      const project = await projectService.getById(this.param(req, 'id'), req.user!.id);
      this.handleSuccess(res, { project });
    } catch (error) {
      this.handleError(error, res, 'getProject');
    }
  }

  async create(req: Request, res: Response): Promise<void> {
    try {
      const input = createProjectSchema.parse(req.body);
      const project = await projectService.create(req.user!.id, req.user!.plan, input);
      this.handleCreated(res, { project });
    } catch (error) {
      this.handleError(error, res, 'createProject');
    }
  }

  async update(req: Request, res: Response): Promise<void> {
    try {
      const input = updateProjectSchema.parse(req.body);
      const project = await projectService.update(this.param(req, 'id'), req.user!.id, input);
      this.handleSuccess(res, { project });
    } catch (error) {
      this.handleError(error, res, 'updateProject');
    }
  }

  async delete(req: Request, res: Response): Promise<void> {
    try {
      await projectService.delete(this.param(req, 'id'), req.user!.id);
      this.handleNoContent(res);
    } catch (error) {
      this.handleError(error, res, 'deleteProject');
    }
  }
}

class ConnectionController extends BaseController {
  async list(req: Request, res: Response): Promise<void> {
    try {
      const connections = await connectionService.getAll(req.user!.id);
      this.handleSuccess(res, { connections });
    } catch (error) {
      this.handleError(error, res, 'listConnections');
    }
  }

  async create(req: Request, res: Response): Promise<void> {
    try {
      const input = createConnectionSchema.parse(req.body);
      const connection = await connectionService.create(req.user!.id, req.user!.plan, input);
      this.handleCreated(res, { connection });
    } catch (error) {
      this.handleError(error, res, 'createConnection');
    }
  }

  async update(req: Request, res: Response): Promise<void> {
    try {
      const input = updateConnectionSchema.parse(req.body);
      const connection = await connectionService.update(this.param(req, 'id'), req.user!.id, input);
      this.handleSuccess(res, { connection });
    } catch (error) {
      this.handleError(error, res, 'updateConnection');
    }
  }

  async delete(req: Request, res: Response): Promise<void> {
    try {
      await connectionService.delete(this.param(req, 'id'), req.user!.id);
      this.handleNoContent(res);
    } catch (error) {
      this.handleError(error, res, 'deleteConnection');
    }
  }
}

export const projectController = new ProjectController();
export const connectionController = new ConnectionController();