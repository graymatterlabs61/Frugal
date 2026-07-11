import { AlertRepository } from '../repositories/AlertRepository.js';
import { NotFoundError } from '../utils/errors.js';
import type { AlertStatus } from '../db/schema.js';

export const AlertService = {
  list(userId: string) {
    return AlertRepository.listForUser(userId);
  },

  async update(id: string, userId: string, status: AlertStatus) {
    const alert = await AlertRepository.update(id, userId, status);
    if (!alert) throw new NotFoundError('Alert not found');
    return alert;
  },
};
