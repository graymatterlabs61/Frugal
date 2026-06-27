import { NotFoundError, ForbiddenError } from '@/utils/errors';
import { getPlanLimits } from '@/utils/tier';
import { encrypt, decrypt, extractSuffix } from '@/utils/encryption';
import { ProjectRepository } from '@/repositories/ProjectRepository';
import { ConnectionRepository } from '@/repositories/ConnectionRepository';
import { providers } from '@/providers';
import type {
  CreateProjectInput,
  UpdateProjectInput,
  CreateConnectionInput,
  UpdateConnectionInput,
} from '@/validators/projects.schema';
import type { Plan } from '@/utils/tier';
import type { Project, ApiConnection } from '@/db/schema';

export class ProjectService {
  constructor(
    private readonly projectRepository: ProjectRepository,
    private readonly connectionRepository: ConnectionRepository,
  ) {}

  async getAll(userId: string): Promise<Project[]> {
    return this.projectRepository.findAllByUser(userId);
  }

  async getById(id: string, userId: string): Promise<Project> {
    const project = await this.projectRepository.findByIdAndUser(id, userId);
    if (!project) throw new NotFoundError('Project not found');
    return project;
  }

  async create(userId: string, plan: Plan, input: CreateProjectInput): Promise<Project> {
    const limits = getPlanLimits(plan);
    if (limits.maxProjects !== Infinity) {
      const count = await this.projectRepository.countByUser(userId);
      if (count >= limits.maxProjects) {
        throw new ForbiddenError(
          `Your plan allows a maximum of ${limits.maxProjects} project(s)`,
        );
      }
    }

    return this.projectRepository.create({ ...input, userId, orgId: null });
  }

  async update(id: string, userId: string, input: UpdateProjectInput): Promise<Project> {
    const project = await this.projectRepository.findByIdAndUser(id, userId);
    if (!project) throw new NotFoundError('Project not found');
    return this.projectRepository.update(id, input);
  }

  async delete(id: string, userId: string): Promise<void> {
    const project = await this.projectRepository.findByIdAndUser(id, userId);
    if (!project) throw new NotFoundError('Project not found');
    await this.projectRepository.delete(id);
  }
}

export class ConnectionService {
  constructor(
    private readonly connectionRepository: ConnectionRepository,
    private readonly projectRepository: ProjectRepository,
  ) {}

  async getAll(userId: string): Promise<SafeConnection[]> {
    const conns = await this.connectionRepository.findAllByUser(userId);
    return conns.map(toSafeConnection);
  }

  async create(
    userId: string,
    plan: Plan,
    input: CreateConnectionInput,
  ): Promise<SafeConnection> {
    const limits = getPlanLimits(plan);
    if (limits.maxConnections !== Infinity) {
      const count = await this.connectionRepository.countByUser(userId);
      if (count >= limits.maxConnections) {
        throw new ForbiddenError(
          `Your plan allows a maximum of ${limits.maxConnections} connection(s)`,
        );
      }
    }

    // Verify project ownership
    const project = await this.projectRepository.findByIdAndUser(input.projectId, userId);
    if (!project) throw new NotFoundError('Project not found');

    // Live-validate the API key against the provider
    const provider = providers[input.provider];
    await provider.validateKey(input.apiKey);

    const apiKeyEncrypted = encrypt(input.apiKey);
    const apiKeySuffix = extractSuffix(input.apiKey);

    const conn = await this.connectionRepository.create({
      userId,
      projectId: input.projectId,
      provider: input.provider,
      label: input.label ?? null,
      apiKeyEncrypted,
      apiKeySuffix,
      status: 'active',
      isActive: true,
    });

    return toSafeConnection(conn);
  }

  async update(
    id: string,
    userId: string,
    input: UpdateConnectionInput,
  ): Promise<SafeConnection> {
    const conn = await this.connectionRepository.findByIdAndUser(id, userId);
    if (!conn) throw new NotFoundError('Connection not found');
    const updated = await this.connectionRepository.update(id, input);
    return toSafeConnection(updated);
  }

  async delete(id: string, userId: string): Promise<void> {
    const conn = await this.connectionRepository.findByIdAndUser(id, userId);
    if (!conn) throw new NotFoundError('Connection not found');
    await this.connectionRepository.delete(id);
  }

  decryptKey(conn: ApiConnection): string {
    return decrypt(conn.apiKeyEncrypted);
  }
}

export interface SafeConnection {
  id: string;
  projectId: string;
  provider: ApiConnection['provider'];
  label: string | null;
  apiKeySuffix: string | null;
  status: ApiConnection['status'];
  isActive: boolean;
  lastPolledAt: Date | null;
  createdAt: Date | null;
}

function toSafeConnection(conn: ApiConnection): SafeConnection {
  return {
    id: conn.id,
    projectId: conn.projectId,
    provider: conn.provider,
    label: conn.label ?? null,
    apiKeySuffix: conn.apiKeySuffix ?? null,
    status: conn.status,
    isActive: conn.isActive,
    lastPolledAt: conn.lastPolledAt ?? null,
    createdAt: conn.createdAt ?? null,
  };
}