import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { toNodeHandler } from 'better-auth/node';
import { auth } from './auth.js';
import { config } from './config/unifiedConfig.js';
import { requestId } from './middleware/requestId.js';
import { errorHandler } from './middleware/errorHandler.js';
import { healthRoutes } from './routes/healthRoutes.js';
import { projectRoutes } from './routes/projectRoutes.js';
import { connectionRoutes } from './routes/connectionRoutes.js';
import { budgetRuleRoutes } from './routes/budgetRuleRoutes.js';

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

  app.use('/api/auth', toNodeHandler(auth));

  app.use(express.json({ limit: '256kb' }));

  app.use('/health', healthRoutes);

  app.use('/api/v1/projects', projectRoutes);
  app.use('/api/v1/connections', connectionRoutes);
  app.use('/api/v1/budget-rules', budgetRuleRoutes);

  // Plan 4 continues below (alerts, notifications); Plans 5–6 mount their own routers here

  app.use((_req, res) => {
    res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Route not found' } });
  });

  app.use(errorHandler);

  return app;
}
