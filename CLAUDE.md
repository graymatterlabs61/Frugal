# CLAUDE.md — Frugal
## Quick Context for Claude Code Sessions

**Product:** Frugal — AI API cost management SaaS
**Founder:** Nilesh Kumar | **Stage:** Solo build, pre-launch

---

## Stack
Next.js 14 (App Router) + TypeScript + Tailwind + ShadCN/UI + Supabase + Upstash Redis/QStash + Stripe + Resend + Vercel

## Core Problem Being Solved
Developers building on AI APIs (OpenAI, Anthropic, Replicate, fal.ai) have no way to set budget limits or get automatic alerts before costs spiral. Frugal polls provider usage APIs every 5 minutes, tracks spend per project/user, enforces budget rules, and fires alerts before limits are hit.

## Critical Rules
- Never disable Supabase RLS on any table
- API keys are AES-256 encrypted before storage, never logged
- Every API route must call `supabase.auth.getUser()` before processing
- Polling worker must be idempotent
- Input validation with Zod on all API routes
- No TypeScript `any` types

## Key Files
- `lib/polling/worker.ts` — main polling orchestrator (QStash-triggered)
- `lib/polling/budgetChecker.ts` — compares current spend to budget_rules
- `lib/polling/alertService.ts` — fires Resend email + Slack webhook
- `lib/encryption.ts` — AES-256 encrypt/decrypt for API keys
- `lib/providers/` — one file per AI provider (openai.ts, anthropic.ts, etc.)

## Database Tables
users, projects, api_connections, usage_records, budget_rules, alert_log
Full schema in TRD.md

## Current Build Priority (Week 1–2)
1. Auth (Supabase email + Google OAuth)
2. API connection flow (encrypt + store key, validate against provider)
3. OpenAI usage polling (call /v1/usage, write to usage_records)
4. Dashboard page (aggregate spend by day, show burn rate)
