import type { ProjectRepository, ProjectRow } from "../repositories/ProjectRepository.js";
import { NotFoundError, ValidationError } from "../utils/errors.js";
import type { Plan } from "../utils/tier.js";
import { PLAN_LIMITS } from "../utils/tier.js";

type CreateProjectData = { name: string; description?: string; color?: string };
type UpdateProjectData = Partial<CreateProjectData> & { slackWebhookUrl?: string };

export class ProjectService {
  constructor(private readonly projectRepo: ProjectRepository) {}

  async list(userId: string): Promise<ProjectRow[]> {
    return this.projectRepo.findAllByUser(userId);
  }

  async get(userId: string, projectId: string): Promise<ProjectRow> {
    const project = await this.projectRepo.findById(userId, projectId);
    if (!project) throw new NotFoundError("Project not found");
    return project;
  }

  async create(
    userId: string,
    data: CreateProjectData,
    userPlan: Plan
  ): Promise<ProjectRow> {
    const limit = PLAN_LIMITS[userPlan].projects;
    const current = await this.projectRepo.countByUser(userId);

    if (current >= limit) {
      throw new ValidationError(
        `Your ${userPlan} plan allows a maximum of ${limit} project${limit === 1 ? "" : "s"}. Upgrade to create more.`
      );
    }

    return this.projectRepo.create(userId, data);
  }

  async update(
    userId: string,
    projectId: string,
    data: UpdateProjectData
  ): Promise<ProjectRow> {
    // Ownership check — throws 404 if not found/owned
    await this.get(userId, projectId);
    const updated = await this.projectRepo.update(userId, projectId, data);
    if (!updated) throw new NotFoundError("Project not found");
    return updated;
  }

  async delete(userId: string, projectId: string): Promise<void> {
    const deleted = await this.projectRepo.delete(userId, projectId);
    if (!deleted) throw new NotFoundError("Project not found");
  }
}
