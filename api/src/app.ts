import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { config } from './config/unifiedConfig.js';
import { requestId } from './middleware/requestId.js';
import { errorHandler } from './middleware/errorHandler.js';
import { healthRoutes } from './routes/healthRoutes.js';

export function createApp() {
  const app = express();

  app.disable('x-powered-by');
  app.use(helmet());
  app.use(
    cors({
      origin: config.cors.origins.length > 0 ? config.cors.origins : false,
      credentials: true,
    }),
  );
  app.use(requestId);
  app.use(express.json({ limit: '256kb' }));

  app.use('/health', healthRoutes);

  // Plans 2–6 mount domain routers here under /api/v1/

  app.use((_req, res) => {
    res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Route not found' } });
  });

  app.use(errorHandler);

  return app;
}
