import './instrument'; // Sentry must be first import
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import pinoHttp from 'pino-http';
import { config } from '@/config/unifiedConfig';
import { logger } from '@/utils/logger';
import { errorHandler } from '@/middleware/errorHandler';
import { apiRateLimit } from '@/middleware/rateLimit';
import { requestId } from '@/middleware/requestId';
import { requestTimeout } from '@/middleware/requestTimeout';

import authRoutes from '@/routes/authRoutes';
import projectRoutes, { connectionRouter } from '@/routes/projectRoutes';
import dashboardRoutes from '@/routes/dashboardRoutes';
import { budgetRulesRouter, alertsRouter, notificationsRouter } from '@/routes/budgetRoutes';
import { billingRouter, ingestRouter } from '@/routes/billingRoutes';
import orgRoutes from '@/routes/orgRoutes';

const app = express();

// ─── Request ID + timeout ─────────────────────────────────────────────────────
app.use(requestId);
app.use('/api/', requestTimeout);

// ─── Security headers ─────────────────────────────────────────────────────────
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", 'data:', 'https:'],
    },
  },
}));

// ─── CORS ─────────────────────────────────────────────────────────────────────
app.use(cors({
  origin: config.server.corsOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// ─── Stripe webhook needs raw body — register BEFORE express.json ─────────────
app.use('/api/v1/billing/webhook', express.raw({ type: 'application/json' }));

// ─── Body parsing ─────────────────────────────────────────────────────────────
app.use(express.json({ limit: '256kb' }));
app.use(cookieParser());

// ─── HTTP logging ─────────────────────────────────────────────────────────────
app.use(pinoHttp({ logger }));

// ─── Rate limiting ────────────────────────────────────────────────────────────
app.use('/api/', apiRateLimit);

// ─── Health ───────────────────────────────────────────────────────────────────
app.get('/api/v1/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/projects', projectRoutes);
app.use('/api/v1/connections', connectionRouter);
app.use('/api/v1/dashboard', dashboardRoutes);
app.use('/api/v1/budget-rules', budgetRulesRouter);
app.use('/api/v1/alerts', alertsRouter);
app.use('/api/v1/notifications', notificationsRouter);
app.use('/api/v1/billing', billingRouter);
app.use('/api/v1/ingest', ingestRouter);
app.use('/api/v1/orgs', orgRoutes);

// ─── 404 ──────────────────────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Route not found' } });
});

// ─── Global error handler ─────────────────────────────────────────────────────
app.use(errorHandler);

export default app;