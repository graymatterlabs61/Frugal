import { NotificationRepository } from '../repositories/NotificationRepository.js';
import { NotFoundError } from '../utils/errors.js';

export const NotificationService = {
  list(userId: string) {
    return NotificationRepository.listForUser(userId);
  },

  async markRead(id: string, userId: string) {
    const notification = await NotificationRepository.markRead(id, userId);
    if (!notification) throw new NotFoundError('Notification not found');
    return notification;
  },

  markAllRead(userId: string): Promise<void> {
    return NotificationRepository.markAllRead(userId);
  },
};
