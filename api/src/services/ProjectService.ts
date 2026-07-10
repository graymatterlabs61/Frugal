import { ProjectRepository } from '../repositories/ProjectRepository.js';
import { limitFor } from '../utils/tier.js';
import { ForbiddenError, NotFoundError } from '../utils/errors.js';

export const ProjectService = {
  list(userId: string) {
    return ProjectRepository.listForUser(userId);
  },

  async get(id: string, userId: string) {
    const project = await ProjectRepository.findByIdForUser(id, userId);
    if (!project) throw new NotFoundError('Project not found');
    return project;
  },

  async create(
    userId: string,
    userPlan: string | undefined,
    data: { name: string; description?: string | undefined; color?: string | undefined },
  ) {
    const existing = await ProjectRepository.countForUser(userId);
    if (existing >= limitFor(userPlan, 'projects')) {
      throw new ForbiddenError('Project limit reached for your plan');
    }
    return ProjectRepository.create(userId, data);
  },

  async update(
    id: string,
    userId: string,
    data: { name?: string | undefined; description?: string | undefined; color?: string | undefined },
  ) {
    const project = await ProjectRepository.update(id, userId, data);
    if (!project) throw new NotFoundError('Project not found');
    return project;
  },

  async remove(id: string, userId: string): Promise<void> {
    const deleted = await ProjectRepository.delete(id, userId);
    if (!deleted) throw new NotFoundError('Project not found');
  },
};
