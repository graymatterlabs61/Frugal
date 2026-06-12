CREATE TYPE "public"."alert_status" AS ENUM('active', 'acknowledged', 'resolved');--> statement-breakpoint
CREATE TYPE "public"."budget_window" AS ENUM('daily', 'monthly');--> statement-breakpoint
CREATE TYPE "public"."connection_status" AS ENUM('active', 'polling_error', 'invalid', 'blocked');--> statement-breakpoint
CREATE TYPE "public"."plan" AS ENUM('free', 'starter', 'growth', 'pro');--> statement-breakpoint
CREATE TYPE "public"."provider" AS ENUM('openai', 'anthropic', 'replicate', 'falai', 'gemini', 'groq', 'mistral', 'together', 'cohere', 'perplexity', 'deepseek', 'stability');--> statement-breakpoint
CREATE TYPE "public"."rule_action" AS ENUM('alert', 'throttle', 'block');--> statement-breakpoint
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
	"notified_via" text[] DEFAULT '{}'::text[] NOT NULL,
	"delivery_status" jsonb,
	"status" "alert_status" DEFAULT 'active' NOT NULL,
	"resolved_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "api_connections" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"project_id" uuid,
	"provider" "provider" NOT NULL,
	"label" text,
	"api_key_encrypted" text NOT NULL,
	"api_key_suffix" text,
	"status" "connection_status" DEFAULT 'active' NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"last_polled_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "budget_rules" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"budget_window" "budget_window" NOT NULL,
	"limit_usd" numeric(10, 2) NOT NULL,
	"threshold_pct" bigint DEFAULT 80 NOT NULL,
	"action" "rule_action" DEFAULT 'alert' NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "projects" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"color" text DEFAULT 'slate',
	"slack_webhook_url" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
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
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"full_name" text,
	"password_hash" text,
	"google_id" text,
	"plan" "plan" DEFAULT 'free' NOT NULL,
	"stripe_customer_id" text,
	"stripe_subscription_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
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
ALTER TABLE "projects" ADD CONSTRAINT "projects_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "usage_records" ADD CONSTRAINT "usage_records_connection_id_api_connections_id_fk" FOREIGN KEY ("connection_id") REFERENCES "public"."api_connections"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "usage_records" ADD CONSTRAINT "usage_records_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_alert_log_user_id" ON "alert_log" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_alert_log_project_id" ON "alert_log" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "idx_alert_log_triggered" ON "alert_log" USING btree ("triggered_at");--> statement-breakpoint
CREATE INDEX "idx_api_connections_user_id" ON "api_connections" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_api_connections_project_id" ON "api_connections" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "idx_budget_rules_project_id" ON "budget_rules" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "idx_budget_rules_user_id" ON "budget_rules" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_projects_user_id" ON "projects" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "uq_usage_connection_date_model" ON "usage_records" USING btree ("connection_id","date","model");--> statement-breakpoint
CREATE INDEX "idx_usage_records_user_id" ON "usage_records" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_usage_records_user_date" ON "usage_records" USING btree ("user_id","date");