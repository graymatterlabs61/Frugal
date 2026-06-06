-- ============================================================
-- Frugal — Migration 004: budget_rules schema alignment
-- Run after 003_more_providers.sql
-- ============================================================
-- Renames:
--   period          → budget_window  (avoid PostgreSQL reserved word "window")
--   alert_at_percent → threshold_pct  (shorter, clearer)
-- ============================================================

-- Rename period → budget_window
-- ("window" is a PostgreSQL reserved word; budget_window is safe)
ALTER TABLE public.budget_rules
  RENAME COLUMN period TO budget_window;

-- Drop old check constraint on period column (name from migration 001)
ALTER TABLE public.budget_rules
  DROP CONSTRAINT IF EXISTS budget_rules_period_check;

-- Add check constraint under new column name
ALTER TABLE public.budget_rules
  ADD CONSTRAINT budget_rules_budget_window_check
  CHECK (budget_window IN ('daily', 'monthly'));

-- Rename alert_at_percent → threshold_pct
ALTER TABLE public.budget_rules
  RENAME COLUMN alert_at_percent TO threshold_pct;

-- Drop old check constraint on alert_at_percent
ALTER TABLE public.budget_rules
  DROP CONSTRAINT IF EXISTS budget_rules_alert_at_percent_check;

-- Add check constraint under new column name
ALTER TABLE public.budget_rules
  ADD CONSTRAINT budget_rules_threshold_pct_check
  CHECK (threshold_pct BETWEEN 1 AND 100);
