-- ============================================================
-- Frugal — Schema Updates (Migration 002)
-- Run after 001_schema.sql
-- ============================================================

-- Make project_id nullable (connections can exist without a project)
ALTER TABLE public.api_connections ALTER COLUMN project_id DROP NOT NULL;

-- Store last 4 chars of key for display (never store plaintext key)
ALTER TABLE public.api_connections
  ADD COLUMN IF NOT EXISTS api_key_suffix text;

-- Richer status instead of just is_active boolean
ALTER TABLE public.api_connections
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'active'
  CHECK (status IN ('active', 'polling_error', 'invalid', 'blocked'));

-- Keep is_active in sync with status for backwards compat
CREATE OR REPLACE FUNCTION sync_connection_is_active()
RETURNS TRIGGER AS $$
BEGIN
  NEW.is_active = (NEW.status = 'active');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER api_connections_sync_is_active
  BEFORE INSERT OR UPDATE ON public.api_connections
  FOR EACH ROW EXECUTE FUNCTION sync_connection_is_active();

-- Add label to projects for display
ALTER TABLE public.projects
  ADD COLUMN IF NOT EXISTS color text DEFAULT 'slate';
