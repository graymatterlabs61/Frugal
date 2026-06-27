import { Queue } from 'bullmq';
import { config } from '@/config/unifiedConfig';

// BullMQ bundles its own ioredis — pass URL options directly, not an external ioredis instance
const bullMqConnection = { url: config.redis.url };

export const QUEUE_NAMES = {
  POLLING: 'polling',
  ALERT_DISPATCH: 'alert-dispatch',
} as const;

export const pollingQueue = new Queue(QUEUE_NAMES.POLLING, {
  connection: bullMqConnection,
  defaultJobOptions: { removeOnComplete: 100, removeOnFail: 500 },
});

export const alertDispatchQueue = new Queue(QUEUE_NAMES.ALERT_DISPATCH, {
  connection: bullMqConnection,
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: 'exponential', delay: 2000 },
    removeOnComplete: 200,
    removeOnFail: 500,
  },
});

export interface AlertDispatchJob {
  alertId: string;
  projectId: string;
  userId: string;
  spendAtTrigger: number;
  limitUsd: number;
  percentUsed: number;
  budgetWindow: 'daily' | 'monthly';
  action: string;
  slackWebhookUrl?: string | null;
  customWebhookUrl?: string | null;
  userEmail: string;
  projectName: string;
}