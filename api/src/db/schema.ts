import {
  pgTable,
  pgEnum,
  uuid,
  text,
  boolean,
  timestamp,
  date,
  bigint,
  numeric,
  jsonb,
  integer,
  unique,
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

// ─── Enums ────────────────────────────────────────────────────────────────────

export const planEnum = pgEnum('plan_enum', [
  'free',
  'plus',
  'pro',
  'corp_starter',
  'corp_growth',
  'corp_scale',
  'enterprise',
]);

export const providerEnum = pgEnum('provider_enum', [
  'openai',
  'anthropic',
  'replicate',
  'falai',
  'gemini',
]);

export const connectionStatusEnum = pgEnum('connection_status_enum', [
  'active',
  'polling_error',
  'invalid',
  'blocked',
]);

export const budgetWindowEnum = pgEnum('budget_window_enum', ['daily', 'monthly']);

export const ruleActionEnum = pgEnum('rule_action_enum', ['alert', 'block', 'throttle']);

export const alertStatusEnum = pgEnum('alert_status_enum', [
  'active',
  'acknowledged',
  'resolved',
]);

export const orgRoleEnum = pgEnum('org_role_enum', ['owner', 'admin', 'member', 'viewer']);

// ─── Auth Domain ──────────────────────────────────────────────────────────────

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email').unique().notNull(),
  fullName: text('full_name'),
  passwordHash: text('password_hash'),
  googleId: text('google_id').unique(),
  plan: planEnum('plan').notNull().default('free'),
  stripeCustomerId: text('stripe_customer_id'),
  stripeSubscriptionId: text('stripe_subscription_id'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

export const organizations = pgTable('organizations', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  ownerId: uuid('owner_id').references(() => users.id),
  plan: planEnum('plan').notNull().default('corp_starter'),
  stripeCustomerId: text('stripe_customer_id'),
  stripeSubscriptionId: text('stripe_subscription_id'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

export const orgMembers = pgTable(
  'org_members',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    orgId: uuid('org_id')
      .notNull()
      .references(() => organizations.id, { onDelete: 'cascade' }),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    role: orgRoleEnum('role').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  },
  (t) => ({
    uniqueOrgUser: unique().on(t.orgId, t.userId),
  }),
);

// ─── Projects & Connections Domain ────────────────────────────────────────────

export const projects = pgTable('projects', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }),
  orgId: uuid('org_id').references(() => organizations.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  description: text('description'),
  color: text('color').default('slate'),
  slackWebhookUrl: text('slack_webhook_url'),
  customWebhookUrl: text('custom_webhook_url'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

export const apiConnections = pgTable('api_connections', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  projectId: uuid('project_id')
    .notNull()
    .references(() => projects.id, { onDelete: 'cascade' }),
  provider: providerEnum('provider').notNull(),
  label: text('label'),
  apiKeyEncrypted: text('api_key_encrypted').notNull(),
  apiKeySuffix: text('api_key_suffix'),
  status: connectionStatusEnum('status').notNull().default('active'),
  isActive: boolean('is_active').notNull().default(true),
  lastPolledAt: timestamp('last_polled_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

// ─── Usage Domain ─────────────────────────────────────────────────────────────

export const usageRecords = pgTable(
  'usage_records',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    connectionId: uuid('connection_id')
      .notNull()
      .references(() => apiConnections.id, { onDelete: 'cascade' }),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    date: date('date').notNull(),
    model: text('model'),
    tokensInput: bigint('tokens_input', { mode: 'number' }).notNull().default(0),
    tokensOutput: bigint('tokens_output', { mode: 'number' }).notNull().default(0),
    costUsd: numeric('cost_usd', { precision: 10, scale: 6 }).notNull().default('0'),
    rawResponse: jsonb('raw_response'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  },
  (t) => ({
    uniqueConnectionDateModel: unique().on(t.connectionId, t.date, t.model),
  }),
);

export const ingestEvents = pgTable('ingest_events', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  endUserId: text('end_user_id').notNull(),
  projectId: uuid('project_id').references(() => projects.id),
  provider: providerEnum('provider'),
  model: text('model'),
  tokensInput: bigint('tokens_input', { mode: 'number' }).notNull().default(0),
  tokensOutput: bigint('tokens_output', { mode: 'number' }).notNull().default(0),
  costUsd: numeric('cost_usd', { precision: 10, scale: 6 }).notNull().default('0'),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

export const proxyRequests = pgTable('proxy_requests', {
  id: uuid('id').primaryKey().defaultRandom(),
  orgId: uuid('org_id')
    .notNull()
    .references(() => organizations.id, { onDelete: 'cascade' }),
  memberUserId: uuid('member_user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  projectId: uuid('project_id').references(() => projects.id),
  provider: providerEnum('provider').notNull(),
  model: text('model'),
  tokensInput: bigint('tokens_input', { mode: 'number' }).default(0),
  tokensOutput: bigint('tokens_output', { mode: 'number' }).default(0),
  costUsd: numeric('cost_usd', { precision: 10, scale: 6 }).default('0'),
  latencyMs: integer('latency_ms'),
  status: text('status').notNull().default('forwarded'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

// ─── Rules & Alerts Domain ────────────────────────────────────────────────────

export const budgetRules = pgTable('budget_rules', {
  id: uuid('id').primaryKey().defaultRandom(),
  projectId: uuid('project_id')
    .notNull()
    .references(() => projects.id, { onDelete: 'cascade' }),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  budgetWindow: budgetWindowEnum('budget_window').notNull(),
  limitUsd: numeric('limit_usd', { precision: 10, scale: 2 }).notNull(),
  thresholdPct: bigint('threshold_pct', { mode: 'number' }).notNull().default(80),
  action: ruleActionEnum('action').notNull().default('alert'),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

export const alertLog = pgTable('alert_log', {
  id: uuid('id').primaryKey().defaultRandom(),
  projectId: uuid('project_id')
    .notNull()
    .references(() => projects.id, { onDelete: 'cascade' }),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  ruleId: uuid('rule_id').references(() => budgetRules.id, { onDelete: 'set null' }),
  triggeredAt: timestamp('triggered_at', { withTimezone: true }).notNull().defaultNow(),
  spendAtTrigger: numeric('spend_at_trigger', { precision: 10, scale: 2 }).notNull(),
  limitUsd: numeric('limit_usd', { precision: 10, scale: 2 }).notNull(),
  percentUsed: numeric('percent_used', { precision: 5, scale: 2 }).generatedAlwaysAs(
    sql`ROUND((spend_at_trigger / NULLIF(limit_usd, 0)) * 100, 2)`,
  ),
  actionTaken: text('action_taken'),
  notifiedVia: text('notified_via').array().notNull().default(sql`'{}'`),
  deliveryStatus: jsonb('delivery_status'),
  status: alertStatusEnum('status').notNull().default('active'),
  resolvedAt: timestamp('resolved_at', { withTimezone: true }),
});

export const notifications = pgTable('notifications', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  type: text('type').notNull(),
  title: text('title').notNull(),
  message: text('message').notNull(),
  readAt: timestamp('read_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

// ─── Types ────────────────────────────────────────────────────────────────────

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Organization = typeof organizations.$inferSelect;
export type NewOrganization = typeof organizations.$inferInsert;
export type OrgMember = typeof orgMembers.$inferSelect;
export type Project = typeof projects.$inferSelect;
export type NewProject = typeof projects.$inferInsert;
export type ApiConnection = typeof apiConnections.$inferSelect;
export type NewApiConnection = typeof apiConnections.$inferInsert;
export type UsageRecord = typeof usageRecords.$inferSelect;
export type NewUsageRecord = typeof usageRecords.$inferInsert;
export type IngestEvent = typeof ingestEvents.$inferSelect;
export type BudgetRule = typeof budgetRules.$inferSelect;
export type NewBudgetRule = typeof budgetRules.$inferInsert;
export type AlertLog = typeof alertLog.$inferSelect;
export type Notification = typeof notifications.$inferSelect;
export type ProxyRequest = typeof proxyRequests.$inferSelect;