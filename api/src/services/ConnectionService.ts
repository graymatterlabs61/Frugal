import { ConnectionRepository } from '../repositories/ConnectionRepository.js';
import { limitFor } from '../utils/tier.js';
import { encrypt } from '../utils/encryption.js';
import { ForbiddenError, NotFoundError } from '../utils/errors.js';
import type { Provider } from '../db/schema.js';

export const ConnectionService = {
  list(userId: string) {
    return ConnectionRepository.listForUser(userId);
  },

  async create(
    userId: string,
    userPlan: string | undefined,
    data: { projectId: string; provider: Provider; label?: string | undefined; apiKey: string },
  ) {
    const project = await ConnectionRepository.findProjectForUser(data.projectId, userId);
    if (!project) throw new NotFoundError('Project not found');

    const existing = await ConnectionRepository.countForUser(userId);
    if (existing >= limitFor(userPlan, 'connections')) {
      throw new ForbiddenError('Connection limit reached for your plan');
    }

    const apiKeyEncrypted = encrypt(data.apiKey);
    const apiKeySuffix = data.apiKey.slice(-4);

    return ConnectionRepository.create(userId, {
      projectId: data.projectId,
      provider: data.provider,
      label: data.label,
      apiKeyEncrypted,
      apiKeySuffix,
    });
  },

  async update(
    id: string,
    userId: string,
    data: { label?: string | undefined; isActive?: boolean | undefined },
  ) {
    const connection = await ConnectionRepository.update(id, userId, data);
    if (!connection) throw new NotFoundError('Connection not found');
    return connection;
  },

  async remove(id: string, userId: string): Promise<void> {
    const deleted = await ConnectionRepository.delete(id, userId);
    if (!deleted) throw new NotFoundError('Connection not found');
  },
};
