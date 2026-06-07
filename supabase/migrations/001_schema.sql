-- ============================================================
-- Frugal — Initial Schema
-- Run this in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- ── Extensions ──────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ── Helper: auto-update updated_at ──────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ────────────────────────────────────────────────────────────
-- TABLE: users
-- Mirrors auth.users. Created automatically by trigger below.
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.users (
  id                 uuid        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email              text        UNIQUE NOT NULL,
  full_name          text,
  plan               text        NOT NULL DEFAULT 'free'
                                 CHECK (plan IN ('free', 'starter', 'growth', 'pro')),
  stripe_customer_id text,
  created_at         timestamptz NOT NULL DEFAULT now(),
  updated_at         timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users: select own" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "users: update own" ON public.users
  FOR UPDATE USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE TRIGGER users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Auto-create profile row when Supabase auth.users gets a new signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ────────────────────────────────────────────────────────────
-- TABLE: projects
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.projects (
  id          uuid        PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     uuid        NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  name        text        NOT NULL,
  description text,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "projects: select own" ON public.projects
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "projects: insert own" ON public.projects
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "projects: update own" ON public.projects
  FOR UPDATE USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "projects: delete own" ON public.projects
  FOR DELETE USING (auth.uid() = user_id);

CREATE TRIGGER projects_updated_at
  BEFORE UPDATE ON public.projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE INDEX idx_projects_user_id ON public.projects(user_id);

-- ────────────────────────────────────────────────────────────
-- TABLE: api_connections
-- API keys stored AES-256-GCM encrypted via lib/encryption.ts
-- Never decrypt on the client — only in server-side polling worker
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.api_connections (
  id                uuid        PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id           uuid        NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  project_id        uuid        NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  provider          text        NOT NULL
                                CHECK (provider IN ('openai', 'anthropic', 'replicate', 'falai')),
  label             text,
  api_key_encrypted text        NOT NULL,  -- format: iv:ciphertext:authTag (hex:base64:hex)
  last_polled_at    timestamptz,
  is_active         boolean     NOT NULL DEFAULT true,
  created_at        timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.api_connections ENABLE ROW LEVEL SECURITY;

-- Users can manage their own connections (but api_key_encrypted is never sent to client)
CREATE POLICY "api_connections: select own" ON public.api_connections
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "api_connections: insert own" ON public.api_connections
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "api_connections: update own" ON public.api_connections
  FOR UPDATE USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "api_connections: delete own" ON public.api_connections
  FOR DELETE USING (auth.uid() = user_id);

CREATE INDEX idx_api_connections_user_id    ON public.api_connections(user_id);
CREATE INDEX idx_api_connections_project_id ON public.api_connections(project_id);
CREATE INDEX idx_api_connections_active     ON public.api_connections(is_active)
  WHERE is_active = true;

-- ────────────────────────────────────────────────────────────
-- TABLE: usage_records
-- Written only by the server-side polling worker (service role).
-- Users have SELECT only. Unique per (connection, date, model).
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.usage_records (
  id             uuid          PRIMARY KEY DEFAULT uuid_generate_v4(),
  connection_id  uuid          NOT NULL REFERENCES public.api_connections(id) ON DELETE CASCADE,
  user_id        uuid          NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  date           date          NOT NULL,
  model          text,
  tokens_input   bigint        NOT NULL DEFAULT 0,
  tokens_output  bigint        NOT NULL DEFAULT 0,
  cost_usd       numeric(10,6) NOT NULL DEFAULT 0,
  raw_response   jsonb,        -- optional: store raw provider response for debugging
  created_at     timestamptz   NOT NULL DEFAULT now(),
  UNIQUE (connection_id, date, model)
);

ALTER TABLE public.usage_records ENABLE ROW LEVEL SECURITY;

-- Users read own records; polling worker uses service role (bypasses RLS)
CREATE POLICY "usage_records: select own" ON public.usage_records
  FOR SELECT USING (auth.uid() = user_id);

CREATE INDEX idx_usage_records_user_id       ON public.usage_records(user_id);
CREATE INDEX idx_usage_records_connection_id ON public.usage_records(connection_id);
CREATE INDEX idx_usage_records_date          ON public.usage_records(date DESC);
CREATE INDEX idx_usage_records_user_date     ON public.usage_records(user_id, date DESC);

-- ────────────────────────────────────────────────────────────
-- TABLE: budget_rules
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.budget_rules (
  id               uuid          PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id       uuid          NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id          uuid          NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  period           text          NOT NULL CHECK (period IN ('daily', 'monthly')),
  limit_usd        numeric(10,2) NOT NULL CHECK (limit_usd > 0),
  alert_at_percent integer       NOT NULL DEFAULT 80
                                 CHECK (alert_at_percent BETWEEN 1 AND 100),
  action           text          NOT NULL DEFAULT 'alert'
                                 CHECK (action IN ('alert', 'throttle', 'block')),
  is_active        boolean       NOT NULL DEFAULT true,
  created_at       timestamptz   NOT NULL DEFAULT now(),
  updated_at       timestamptz   NOT NULL DEFAULT now()
);

ALTER TABLE public.budget_rules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "budget_rules: select own" ON public.budget_rules
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "budget_rules: insert own" ON public.budget_rules
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "budget_rules: update own" ON public.budget_rules
  FOR UPDATE USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "budget_rules: delete own" ON public.budget_rules
  FOR DELETE USING (auth.uid() = user_id);

CREATE TRIGGER budget_rules_updated_at
  BEFORE UPDATE ON public.budget_rules
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE INDEX idx_budget_rules_project_id ON public.budget_rules(project_id);
CREATE INDEX idx_budget_rules_user_id    ON public.budget_rules(user_id);

-- ────────────────────────────────────────────────────────────
-- TABLE: alert_log
-- Written by polling worker (service role). Users SELECT only.
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.alert_log (
  id               uuid          PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id       uuid          NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id          uuid          NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  rule_id          uuid          REFERENCES public.budget_rules(id) ON DELETE SET NULL,
  triggered_at     timestamptz   NOT NULL DEFAULT now(),
  spend_at_trigger numeric(10,2) NOT NULL,
  limit_usd        numeric(10,2) NOT NULL,
  percent_used     numeric(5,2)
    GENERATED ALWAYS AS (ROUND((spend_at_trigger / NULLIF(limit_usd, 0)) * 100, 2)) STORED,
  action_taken     text,
  notified_via     text[]        NOT NULL DEFAULT '{}',
  status           text          NOT NULL DEFAULT 'active'
                                 CHECK (status IN ('active', 'acknowledged', 'resolved')),
  resolved_at      timestamptz
);

ALTER TABLE public.alert_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "alert_log: select own" ON public.alert_log
  FOR SELECT USING (auth.uid() = user_id);

-- Allow users to acknowledge/resolve their own alerts
CREATE POLICY "alert_log: update own" ON public.alert_log
  FOR UPDATE USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_alert_log_user_id    ON public.alert_log(user_id);
CREATE INDEX idx_alert_log_project_id ON public.alert_log(project_id);
CREATE INDEX idx_alert_log_status     ON public.alert_log(status)
  WHERE status = 'active';
CREATE INDEX idx_alert_log_triggered  ON public.alert_log(triggered_at DESC);

-- ────────────────────────────────────────────────────────────
-- VIEW: project_monthly_spend
-- Pre-aggregated spend per project for the current calendar month.
-- Used by dashboard and budget checker.
-- ────────────────────────────────────────────────────────────
CREATE OR REPLACE VIEW public.project_monthly_spend AS
SELECT
  p.id                                   AS project_id,
  p.user_id,
  p.name                                 AS project_name,
  date_trunc('month', CURRENT_DATE)::date AS month,
  COALESCE(SUM(ur.cost_usd), 0)::numeric(10,2) AS spend_usd,
  COUNT(DISTINCT ac.id)                  AS connection_count
FROM public.projects p
LEFT JOIN public.api_connections ac
  ON ac.project_id = p.id AND ac.is_active = true
LEFT JOIN public.usage_records ur
  ON ur.connection_id = ac.id
  AND date_trunc('month', ur.date) = date_trunc('month', CURRENT_DATE)
GROUP BY p.id, p.user_id, p.name;

-- RLS on views: underlying tables' RLS applies automatically in Supabase
-- because views run with invoker rights by default.
