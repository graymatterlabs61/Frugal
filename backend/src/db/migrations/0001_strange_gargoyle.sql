-- Drop default first so the enum type has no dependents when we drop it
ALTER TABLE "public"."users" ALTER COLUMN "plan" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "public"."users" ALTER COLUMN "plan" SET DATA TYPE text;--> statement-breakpoint
-- Rename old enum values before recreating the type
UPDATE "public"."users" SET "plan" = 'plus' WHERE "plan" = 'starter';--> statement-breakpoint
UPDATE "public"."users" SET "plan" = 'corp_starter' WHERE "plan" = 'growth';--> statement-breakpoint
DROP TYPE "public"."plan";--> statement-breakpoint
CREATE TYPE "public"."plan" AS ENUM('free', 'plus', 'pro', 'corp_starter', 'corp_growth', 'corp_scale', 'enterprise');--> statement-breakpoint
ALTER TABLE "public"."users" ALTER COLUMN "plan" SET DATA TYPE "public"."plan" USING "plan"::"public"."plan";--> statement-breakpoint
ALTER TABLE "public"."users" ALTER COLUMN "plan" SET DEFAULT 'free';
