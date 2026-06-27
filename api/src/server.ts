import app from './app';
import { config } from '@/config/unifiedConfig';
import { logger } from '@/utils/logger';
import { startPollingWorker } from '@/workers/pollingWorker';
import { startAlertDispatcher } from '@/workers/alertDispatcher';
import { registerScheduledJobs } from '@/workers/scheduler';

const pollingWorker = startPollingWorker();
const alertWorker = startAlertDispatcher();

const server = app.listen(config.server.port, async () => {
  logger.info(`frugal-api running on port ${config.server.port} [${config.env}]`);
  await registerScheduledJobs();
});

// Graceful shutdown — drain BullMQ workers before closing the HTTP server
const shutdown = (): void => {
  logger.info('Shutting down...');
  void Promise.all([pollingWorker.close(), alertWorker.close()]).then(() => {
    server.close(() => {
      logger.info('HTTP server closed');
      process.exit(0);
    });
  });
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

export default server;