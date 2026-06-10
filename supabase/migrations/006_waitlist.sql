-- 006: waitlist table — pre-launch signups must survive deploys
-- (previous implementation kept emails in serverless memory and lost them)

create table if not exists public.waitlist (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  discount_code text not null default 'EARLY35',
  source text default 'hero',
  created_at timestamptz not null default now()
);

-- RLS on, no public policies: only the service role (API route) touches this table
alter table public.waitlist enable row level security;

create index if not exists waitlist_created_at_idx on public.waitlist (created_at);
