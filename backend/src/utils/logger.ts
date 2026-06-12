import { config } from "../config/unifiedConfig.js";

type Level = "debug" | "info" | "warn" | "error";

/**
 * Structured JSON-lines logger. Never log: provider keys (even encrypted),
 * password hashes, JWT tokens, email bodies.
 */
function log(level: Level, msg: string, meta: Record<string, unknown> = {}): void {
  if (level === "debug" && config.isProduction) return;
  const line = JSON.stringify({
    ts: new Date().toISOString(),
    level,
    msg,
    ...meta,
  });
  if (level === "error") process.stderr.write(line + "\n");
  else process.stdout.write(line + "\n");
}

export const logger = {
  debug: (msg: string, meta?: Record<string, unknown>) => log("debug", msg, meta),
  info: (msg: string, meta?: Record<string, unknown>) => log("info", msg, meta),
  warn: (msg: string, meta?: Record<string, unknown>) => log("warn", msg, meta),
  error: (msg: string, meta?: Record<string, unknown>) => log("error", msg, meta),
};
