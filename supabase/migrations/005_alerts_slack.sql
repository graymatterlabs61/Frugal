-- ============================================================
-- Frugal — Migration 005: slack_webhook_url + delivery_status
-- Run after 004_budget_rules_schema.sql
-- ============================================================
-- Adds:
--   projects.slack_webhook_url text      (nullable — Slack incoming webhook URL per project)
--   alert_log.delivery_status jsonb      (nullable — {email:{sent,messageId?,error?}, slack:{sent,error?}})
-- ============================================================

-- Add Slack incoming webhook URL to projects (optional per project)
ALTER TABLE public.projects
  ADD COLUMN IF NOT EXISTS slack_webhook_url text;

-- Add delivery status JSONB to alert_log to record per-channel outcomes
ALTER TABLE public.alert_log
  ADD COLUMN IF NOT EXISTS delivery_status jsonb;
