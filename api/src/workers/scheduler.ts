import { pollingQueue } from './queue';
import { logger } from '@/utils/logger';

const POLLING_CRON = '*/5 * * * *'; // every 5 minutes

export async function registerScheduledJobs(): Promise<void> {
  await pollingQueue.upsertJobScheduler(
    'polling-cron',
    { pattern: POLLING_CRON },
    { name: 'poll-all-connections', data: {} },
  );
  logger.info('Polling cron job registered (every 5 min)');
}