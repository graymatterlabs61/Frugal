CREATE TYPE "public"."alert_status_enum" AS ENUM('active', 'acknowledged', 'resolved');--> statement-breakpoint
CREATE TYPE "public"."budget_window_enum" AS ENUM('daily', 'monthly');--> statement-breakpoint
CREATE TYPE "public"."connection_status_enum" AS ENUM('active', 'polling_error', 'invalid', 'blocked');--> statement-breakpoint
CREATE TYPE "public"."org_role_enum" AS ENUM('owner', 'admin', 'member', 'viewer');--> statement-breakpoint
CREATE TYPE "public"."plan_enum" AS ENUM('free', 'plus', 'pro', 'corp_starter', 'corp_growth', 'corp_scale', 'enterprise');--> statement-breakpoint
CREATE TYPE "public"."provider_enum" AS ENUM('openai', 'anthropic', 'replicate', 'falai', 'gemini');--> statement-breakpoint
CREATE TYPE "public"."rule_action_enum" AS ENUM('alert', 'block', 'throttle');--> statement-breakpoint
CREATE TABLE "alert_log" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"rule_id" uuid,
	"triggered_at" timestamp with time zone DEFAULT now() NOT NULL,
	"spend_at_trigger" numeric(10, 2) NOT NULL,
	"limit_usd" numeric(10, 2) NOT NULL,
	"percent_used" numeric(5, 2) GENERATED ALWAYS AS (ROUND((spend_at_trigger / NULLIF(limit_usd, 0)) * 100, 2)) STORED,
	"action_taken" text,
	"notified_via" text[] DEFAULT '{}' NOT NULL,
	"delivery_status" jsonb,
	"status" "alert_status_enum" DEFAULT 'active' NOT NULL,
	"resolved_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "api_connections" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"project_id" uuid NOT NULL,
	"provider" "provider_enum" NOT NULL,
	"label" text,
	"api_key_encrypted" text NOT NULL,
	"api_key_suffix" text,
	"status" "connection_status_enum" DEFAULT 'active' NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"last_polled_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "budget_rules" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"budget_window" "budget_window_enum" NOT NULL,
	"limit_usd" numeric(10, 2) NOT NULL,
	"threshold_pct" bigint DEFAULT 80 NOT NULL,
	"action" "rule_action_enum" DEFAULT 'alert' NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "ingest_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"end_user_id" text NOT NULL,
	"project_id" uuid,
	"provider" "provider_enum",
	"model" text,
	"tokens_input" bigint DEFAULT 0 NOT NULL,
	"tokens_output" bigint DEFAULT 0 NOT NULL,
	"cost_usd" numeric(10, 6) DEFAULT '0' NOT NULL,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"type" text NOT NULL,
	"title" text NOT NULL,
	"message" text NOT NULL,
	"read_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "org_members" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"org_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"role" "org_role_enum" NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "org_members_org_id_user_id_unique" UNIQUE("org_id","user_id")
);
--> statement-breakpoint
CREATE TABLE "organizations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"owner_id" uuid,
	"plan" "plan_enum" DEFAULT 'corp_starter' NOT NULL,
	"stripe_customer_id" text,
	"stripe_subscription_id" text,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "projects" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid,
	"org_id" uuid,
	"name" text NOT NULL,
	"description" text,
	"color" text DEFAULT 'slate',
	"slack_webhook_url" text,
	"custom_webhook_url" text,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "proxy_requests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"org_id" uuid NOT NULL,
	"member_user_id" uuid NOT NULL,
	"project_id" uuid,
	"provider" "provider_enum" NOT NULL,
	"model" text,
	"tokens_input" bigint DEFAULT 0,
	"tokens_output" bigint DEFAULT 0,
	"cost_usd" numeric(10, 6) DEFAULT '0',
	"latency_ms" integer,
	"status" text DEFAULT 'forwarded' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "usage_records" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"connection_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"date" date NOT NULL,
	"model" text,
	"tokens_input" bigint DEFAULT 0 NOT NULL,
	"tokens_output" bigint DEFAULT 0 NOT NULL,
	"cost_usd" numeric(10, 6) DEFAULT '0' NOT NULL,
	"raw_response" jsonb,
	"created_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "usage_records_connection_id_date_model_unique" UNIQUE("connection_id","date","model")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"full_name" text,
	"password_hash" text,
	"google_id" text,
	"plan" "plan_enum" DEFAULT 'free' NOT NULL,
	"stripe_customer_id" text,
	"stripe_subscription_id" text,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "users_email_unique" UNIQUE("email"),
	CONSTRAINT "users_google_id_unique" UNIQUE("google_id")
);
--> statement-breakpoint
ALTER TABLE "alert_log" ADD CONSTRAINT "alert_log_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "alert_log" ADD CONSTRAINT "alert_log_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "alert_log" ADD CONSTRAINT "alert_log_rule_id_budget_rules_id_fk" FOREIGN KEY ("rule_id") REFERENCES "public"."budget_rules"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "api_connections" ADD CONSTRAINT "api_connections_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "api_connections" ADD CONSTRAINT "api_connections_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "budget_rules" ADD CONSTRAINT "budget_rules_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "budget_rules" ADD CONSTRAINT "budget_rules_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ingest_events" ADD CONSTRAINT "ingest_events_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ingest_events" ADD CONSTRAINT "ingest_events_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "org_members" ADD CONSTRAINT "org_members_org_id_organizations_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "org_members" ADD CONSTRAINT "org_members_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organizations" ADD CONSTRAINT "organizations_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "projects" ADD CONSTRAINT "projects_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "projects" ADD CONSTRAINT "projects_org_id_organizations_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "proxy_requests" ADD CONSTRAINT "proxy_requests_org_id_organizations_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "proxy_requests" ADD CONSTRAINT "proxy_requests_member_user_id_users_id_fk" FOREIGN KEY ("member_user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "proxy_requests" ADD CONSTRAINT "proxy_requests_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "usage_records" ADD CONSTRAINT "usage_records_connection_id_api_connections_id_fk" FOREIGN KEY ("connection_id") REFERENCES "public"."api_connections"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "usage_records" ADD CONSTRAINT "usage_records_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;