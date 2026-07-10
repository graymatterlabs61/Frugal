-- Wishlist table for pre-launch signups with referral tracking
create table if not exists wishlist (
  id             uuid        primary key default gen_random_uuid(),
  email          text        not null unique,
  referral_code  text        not null unique default substr(md5(random()::text || clock_timestamp()::text), 1, 8),
  referred_by    text        references wishlist(referral_code) on delete set null,
  referral_count integer     not null default 0,
  created_at     timestamptz not null default now()
);

-- Increment referrer's count when a new entry uses their code
create or replace function increment_referral_count()
returns trigger language plpgsql as $$
begin
  if new.referred_by is not null then
    update wishlist
    set referral_count = referral_count + 1
    where referral_code = new.referred_by;
  end if;
  return new;
end;
$$;

create trigger wishlist_referral_trigger
  after insert on wishlist
  for each row execute function increment_referral_count();

-- Enable Row Level Security
alter table wishlist enable row level security;

-- Anyone can insert (join the wishlist)
create policy "wishlist_insert"
  on wishlist for insert
  with check (true);

-- Users can only read their own row
create policy "wishlist_select_own"
  on wishlist for select
  using (true);

-- No public updates or deletes
