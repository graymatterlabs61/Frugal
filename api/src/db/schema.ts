import {
  pgTable,
  pgEnum,
  uuid,
  text,
  timestamp,
  boolean,
  bigint,
  numeric,
  jsonb,
  date,
  integer,
  uniqueIndex,
  index,
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

// ---- Enums (spec §5) ----
export const planEnum = pgEnum('plan_enum', [
  'free', 'plus', 'pro', 'corp_starter', 'corp_growth', 'corp_scale', 'enterprise',
]);
export const providerEnum = pgEnum('provider_enum', [
  'openai', 'anthropic', 'replicate', 'falai', 'gemini',
]);
export const connectionStatusEnum = pgEnum('connection_status_enum', [
  'active', 'polling_error', 'invalid', 'blocked',
]);
export const budgetWindowEnum = pgEnum('budget_window_enum', ['daily', 'monthly']);
export const ruleActionEnum = pgEnum('rule_action_enum', ['alert', 'block', 'throttle']);
export const alertStatusEnum = pgEnum('alert_status_enum', ['active', 'acknowledged', 'resolved']);
export const orgRoleEnum = pgEnum('org_role_enum', ['owner', 'admin', 'member', 'viewer']);

// ---- Auth domain ----
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email').notNull().unique(),
  fullName: text('full_name'),
  passwordHash: text('password_hash'),
  googleId: text('google_id').unique(),
  plan: planEnum('plan').notNull().default('free'),
  stripeCustomerId: text('stripe_customer_id'),
  stripeSubscriptionId: text('stripe_subscription_id'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const organizations = pgTable(
  'organizations',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    name: text('name').notNull(),
    ownerId: uuid('owner_id')
      .notNull()
      .references(() => users.id),
    plan: planEnum('plan').notNull().default('corp_starter'),
    stripeCustomerId: text('stripe_customer_id'),
    stripeSubscriptionId: text('stripe_subscription_id'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index('idx_organizations_owner_id').on(t.ownerId)],
);

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
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex('uq_org_members_org_user').on(t.orgId, t.userId),
    index('idx_org_members_user_id').on(t.userId),
  ],
);

// ---- Projects & connections ----
export const projects = pgTable(
  'projects',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }),
    orgId: uuid('org_id').references(() => organizations.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    description: text('description'),
    color: text('color').default('slate'),
    slackWebhookUrl: text('slack_webhook_url'),
    customWebhookUrl: text('custom_webhook_url'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index('idx_projects_user_id').on(t.userId), index('idx_projects_org_id').on(t.orgId)],
);

export const apiConnections = pgTable(
  'api_connections',
  {
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
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index('idx_api_connections_user_id').on(t.userId),
    index('idx_api_connections_project_id').on(t.projectId),
  ],
);

// ---- Usage domain ----
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
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex('uq_usage_records_conn_date_model').on(t.connectionId, t.date, t.model),
    index('idx_usage_records_user_id').on(t.userId),
    index('idx_usage_records_date').on(t.date),
  ],
);

export const ingestEvents = pgTable(
  'ingest_events',
  {
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
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index('idx_ingest_events_user_id').on(t.userId),
    index('idx_ingest_events_project_id').on(t.projectId),
    index('idx_ingest_events_created_at').on(t.createdAt),
  ],
);

export const proxyRequests = pgTable(
  'proxy_requests',
  {
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
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index('idx_proxy_requests_org_id').on(t.orgId),
    index('idx_proxy_requests_member_user_id').on(t.memberUserId),
    index('idx_proxy_requests_project_id').on(t.projectId),
    index('idx_proxy_requests_created_at').on(t.createdAt),
  ],
);

// ---- Rules & alerts ----
export const budgetRules = pgTable(
  'budget_rules',
  {
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
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index('idx_budget_rules_project_id').on(t.projectId),
    index('idx_budget_rules_user_id').on(t.userId),
  ],
);

export const alertLog = pgTable(
  'alert_log',
  {
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
    notifiedVia: text('notified_via').array().notNull().default(sql`'{}'::text[]`),
    deliveryStatus: jsonb('delivery_status'),
    status: alertStatusEnum('status').notNull().default('active'),
    resolvedAt: timestamp('resolved_at', { withTimezone: true }),
  },
  (t) => [
    index('idx_alert_log_project_id').on(t.projectId),
    index('idx_alert_log_user_id').on(t.userId),
    index('idx_alert_log_triggered_at').on(t.triggeredAt),
    index('idx_alert_log_rule_id').on(t.ruleId),
  ],
);

export const notifications = pgTable(
  'notifications',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    type: text('type').notNull(),
    title: text('title').notNull(),
    message: text('message').notNull(),
    readAt: timestamp('read_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index('idx_notifications_user_id').on(t.userId)],
);

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;