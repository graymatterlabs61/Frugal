import { sql } from "drizzle-orm";
import {
  bigint,
  boolean,
  date,
  index,
  jsonb,
  numeric,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

// ── Enums ───────────────────────────────────────────────────

export const planEnum = pgEnum("plan", [
  "free",
  "plus",
  "pro",
  "corp_starter",
  "corp_growth",
  "corp_scale",
  "enterprise",
]);

export const providerEnum = pgEnum("provider", [
  "openai",
  "anthropic",
  "replicate",
  "falai",
  "gemini",
  "groq",
  "mistral",
  "together",
  "cohere",
  "perplexity",
  "deepseek",
  "stability",
]);

export const connectionStatusEnum = pgEnum("connection_status", [
  "active",
  "polling_error",
  "invalid",
  "blocked",
]);

export const budgetWindowEnum = pgEnum("budget_window", ["daily", "monthly"]);

export const ruleActionEnum = pgEnum("rule_action", ["alert", "throttle", "block"]);

export const alertStatusEnum = pgEnum("alert_status", [
  "active",
  "acknowledged",
  "resolved",
]);

// ── users ───────────────────────────────────────────────────
// Standalone auth (no Supabase): password_hash lives here (Argon2id).

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  fullName: text("full_name"),
  passwordHash: text("password_hash"),
  googleId: text("google_id").unique(),
  plan: planEnum("plan").notNull().default("free"),
  stripeCustomerId: text("stripe_customer_id"),
  stripeSubscriptionId: text("stripe_subscription_id"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

// ── projects ────────────────────────────────────────────────

export const projects = pgTable(
  "projects",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    description: text("description"),
    color: text("color").default("slate"),
    slackWebhookUrl: text("slack_webhook_url"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("idx_projects_user_id").on(t.userId)]
);

// ── api_connections ─────────────────────────────────────────
// api_key_encrypted format: iv:ciphertext:authTag (hex:base64:hex), AES-256-GCM

export const apiConnections = pgTable(
  "api_connections",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    projectId: uuid("project_id").references(() => projects.id, {
      onDelete: "cascade",
    }),
    provider: providerEnum("provider").notNull(),
    label: text("label"),
    apiKeyEncrypted: text("api_key_encrypted").notNull(),
    apiKeySuffix: text("api_key_suffix"),
    status: connectionStatusEnum("status").notNull().default("active"),
    isActive: boolean("is_active").notNull().default(true),
    lastPolledAt: timestamp("last_polled_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index("idx_api_connections_user_id").on(t.userId),
    index("idx_api_connections_project_id").on(t.projectId),
  ]
);

// ── usage_records ───────────────────────────────────────────
// Written only by polling worker. Unique per (connection, date, model).

export const usageRecords = pgTable(
  "usage_records",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    connectionId: uuid("connection_id")
      .notNull()
      .references(() => apiConnections.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    date: date("date").notNull(),
    model: text("model"),
    tokensInput: bigint("tokens_input", { mode: "number" }).notNull().default(0),
    tokensOutput: bigint("tokens_output", { mode: "number" }).notNull().default(0),
    costUsd: numeric("cost_usd", { precision: 10, scale: 6 }).notNull().default("0"),
    rawResponse: jsonb("raw_response"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex("uq_usage_connection_date_model").on(t.connectionId, t.date, t.model),
    index("idx_usage_records_user_id").on(t.userId),
    index("idx_usage_records_user_date").on(t.userId, t.date),
  ]
);

// ── budget_rules ────────────────────────────────────────────

export const budgetRules = pgTable(
  "budget_rules",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    projectId: uuid("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    budgetWindow: budgetWindowEnum("budget_window").notNull(),
    limitUsd: numeric("limit_usd", { precision: 10, scale: 2 }).notNull(),
    thresholdPct: bigint("threshold_pct", { mode: "number" }).notNull().default(80),
    action: ruleActionEnum("action").notNull().default("alert"),
    isActive: boolean("is_active").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index("idx_budget_rules_project_id").on(t.projectId),
    index("idx_budget_rules_user_id").on(t.userId),
  ]
);

// ── alert_log ───────────────────────────────────────────────

export const alertLog = pgTable(
  "alert_log",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    projectId: uuid("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    ruleId: uuid("rule_id").references(() => budgetRules.id, {
      onDelete: "set null",
    }),
    triggeredAt: timestamp("triggered_at", { withTimezone: true }).notNull().defaultNow(),
    spendAtTrigger: numeric("spend_at_trigger", { precision: 10, scale: 2 }).notNull(),
    limitUsd: numeric("limit_usd", { precision: 10, scale: 2 }).notNull(),
    percentUsed: numeric("percent_used", { precision: 5, scale: 2 }).generatedAlwaysAs(
      sql`ROUND((spend_at_trigger / NULLIF(limit_usd, 0)) * 100, 2)`
    ),
    actionTaken: text("action_taken"),
    notifiedVia: text("notified_via")
      .array()
      .notNull()
      .default(sql`'{}'::text[]`),
    deliveryStatus: jsonb("delivery_status"),
    status: alertStatusEnum("status").notNull().default("active"),
    resolvedAt: timestamp("resolved_at", { withTimezone: true }),
  },
  (t) => [
    index("idx_alert_log_user_id").on(t.userId),
    index("idx_alert_log_project_id").on(t.projectId),
    index("idx_alert_log_triggered").on(t.triggeredAt),
  ]
);

// ── Inferred row types ──────────────────────────────────────

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Project = typeof projects.$inferSelect;
export type NewProject = typeof projects.$inferInsert;
export type ApiConnection = typeof apiConnections.$inferSelect;
export type NewApiConnection = typeof apiConnections.$inferInsert;
export type UsageRecord = typeof usageRecords.$inferSelect;
export type BudgetRule = typeof budgetRules.$inferSelect;
export type NewBudgetRule = typeof budgetRules.$inferInsert;
export type AlertLogEntry = typeof alertLog.$inferSelect;
