import { Queue, Worker } from 'bullmq';
import { config } from '../config/unifiedConfig.js';
import { PollingService } from '../services/PollingService.js';
import { logger } from '../utils/logger.js';

const QUEUE_NAME = 'provider-polling';

// Plain options object (not an ioredis instance) — bullmq bundles its own ioredis
// internally and constructs the connection itself; passing our own instance here
// would cross-type against bullmq's nested ioredis copy.
const redisUrl = new URL(config.redis.url);
const password = config.redis.token ?? (redisUrl.password || undefined);

const connection = {
  host: redisUrl.hostname,
  port: Number(redisUrl.port) || 6379,
  maxRetriesPerRequest: null,
  ...(redisUrl.username ? { username: redisUrl.username } : {}),
  ...(password ? { password } : {}),
  ...(redisUrl.protocol === 'rediss:' ? { tls: {} } : {}),
};

const pollingQueue = new Queue(QUEUE_NAME, { connection });

const pollingWorker = new Worker(
  QUEUE_NAME,
  async () => {
    const results = await PollingService.pollAllActiveConnections();
    logger.info({ count: results.length }, 'polling sweep complete');
  },
  { connection },
);

pollingWorker.on('failed', (job, err) => {
  logger.error({ jobId: job?.id, err }, 'polling job failed');
});

await pollingQueue.add(
  'sweep',
  {},
  { repeat: { pattern: '*/5 * * * *' }, jobId: 'provider-polling-sweep' },
);

logger.info('provider polling worker started');
