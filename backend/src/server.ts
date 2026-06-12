// Sentry MUST be the first import — instruments all require/import calls
import "./instrument.js";

import cors from "cors";
import express from "express";
import helmet from "helmet";
import * as Sentry from "@sentry/node";
import { config } from "./config/unifiedConfig.js";
import { closeDb } from "./db/index.js";
import { errorHandler, requestId } from "./middleware/errorHandler.js";
import { logger } from "./utils/logger.js";

// Routes
import authRoutes from "./routes/auth.js";
import billingRoutes from "./routes/billing.js";
import budgetRulesRoutes from "./routes/budgetRules.js";
import connectionRoutes from "./routes/connections.js";
import dashboardRoutes from "./routes/dashboard.js";
import healthRoutes from "./routes/health.js";
import pollRoutes from "./routes/poll.js";
import projectRoutes from "./routes/projects.js";
import publicRoutes from "./routes/public.js";

const app = express();

// ── Security headers ─────────────────────────────────────────────────────────
app.use(helmet());

// ── CORS ─────────────────────────────────────────────────────────────────────
app.use(
  cors({
    origin: config.server.corsOrigins,
    credentials: true,
  })
);

// ── Sentry request handler (must be before routes) ───────────────────────────
Sentry.setupExpressErrorHandler(app);

// ── Raw body for Stripe webhook (must be before json middleware) ──────────────
app.use("/api/billing/webhook", express.raw({ type: "application/json" }));

// ── Body parsing ─────────────────────────────────────────────────────────────
app.use(express.json({ limit: "256kb" }));

// ── Correlation ID ───────────────────────────────────────────────────────────
app.use(requestId);

// ── Routes ───────────────────────────────────────────────────────────────────
app.use("/api/auth", authRoutes);
app.use("/api/billing", billingRoutes);
app.use("/api/budget-rules", budgetRulesRoutes);
app.use("/api/connections", connectionRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/poll", pollRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/health", healthRoutes);
app.use("/api/public", publicRoutes);

// ── 404 handler ──────────────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ error: { code: "not_found", message: "Route not found" } });
});

// ── Error handler (must be last) ─────────────────────────────────────────────
app.use(errorHandler);

// ── Start ─────────────────────────────────────────────────────────────────────
const server = app.listen(config.server.port, () => {
  logger.info("server_started", {
    port: config.server.port,
    env: config.env,
    corsOrigins: config.server.corsOrigins,
  });
});

// ── Graceful shutdown ─────────────────────────────────────────────────────────
async function shutdown(): Promise<void> {
  logger.info("server_shutdown_initiated");
  server.close(async () => {
    try {
      await closeDb();
      logger.info("server_shutdown_complete");
      process.exit(0);
    } catch (err) {
      logger.error("server_shutdown_error", {
        error: err instanceof Error ? err.message : String(err),
      });
      process.exit(1);
    }
  });
}

process.on("SIGTERM", () => void shutdown());
process.on("SIGINT", () => void shutdown());

export default app;
