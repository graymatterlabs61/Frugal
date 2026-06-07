-- ============================================================
-- Frugal — Migration 003: extend provider list
-- Run after 002_schema_updates.sql
-- ============================================================

-- Drop old constraint and add extended one
ALTER TABLE public.api_connections
  DROP CONSTRAINT IF EXISTS api_connections_provider_check;

ALTER TABLE public.api_connections
  ADD CONSTRAINT api_connections_provider_check
  CHECK (provider IN (
    'openai', 'anthropic', 'replicate', 'falai',
    'gemini', 'groq', 'mistral', 'together',
    'cohere', 'perplexity', 'deepseek', 'stability'
  ));
