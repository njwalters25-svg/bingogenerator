-- Bingo Generator Supabase schema
-- Run this in Supabase SQL Editor after creating the project.

create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists profiles_email_lower_idx
  on public.profiles (lower(email));

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null default 'Untitled bingo project',
  draft_data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists projects_user_id_idx on public.projects(user_id);

create table if not exists public.generated_sets (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references public.projects(id) on delete set null,
  user_id uuid not null references auth.users(id) on delete cascade,
  source_items jsonb not null default '[]'::jsonb,
  requested_count integer not null check (requested_count between 1 and 300),
  cards jsonb not null default '[]'::jsonb,
  generation_snapshot jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists generated_sets_user_id_idx on public.generated_sets(user_id);
create index if not exists generated_sets_project_id_idx on public.generated_sets(project_id);

create table if not exists public.credit_ledger (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  email text not null,
  amount integer not null check (amount <> 0),
  reason text not null,
  source text not null default 'manual',
  source_ref text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists credit_ledger_user_id_idx on public.credit_ledger(user_id);
create index if not exists credit_ledger_email_lower_idx on public.credit_ledger(lower(email));
create unique index if not exists credit_ledger_source_ref_idx
  on public.credit_ledger(source, source_ref)
  where source_ref is not null;

create table if not exists public.etsy_products (
  id uuid primary key default gen_random_uuid(),
  listing_id text not null unique,
  name text not null,
  credits integer not null check (credits > 0),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.etsy_orders (
  id uuid primary key default gen_random_uuid(),
  etsy_receipt_id text not null unique,
  buyer_email text not null,
  listing_id text not null,
  credits_added integer not null check (credits_added > 0),
  raw_payload jsonb not null default '{}'::jsonb,
  processed_at timestamptz not null default now()
);

create or replace view public.credit_balances
with (security_invoker = true) as
select
  coalesce(user_id::text, lower(email)) as account_key,
  user_id,
  lower(email) as email,
  coalesce(sum(amount), 0)::integer as credits_remaining
from public.credit_ledger
group by user_id, lower(email);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

drop trigger if exists projects_set_updated_at on public.projects;
create trigger projects_set_updated_at
before update on public.projects
for each row execute function public.set_updated_at();

drop trigger if exists etsy_products_set_updated_at on public.etsy_products;
create trigger etsy_products_set_updated_at
before update on public.etsy_products
for each row execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, coalesce(new.email, ''))
  on conflict (id) do update
    set email = excluded.email;

  update public.credit_ledger
  set user_id = new.id
  where user_id is null
    and lower(email) = lower(coalesce(new.email, ''));

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.projects enable row level security;
alter table public.generated_sets enable row level security;
alter table public.credit_ledger enable row level security;
alter table public.etsy_products enable row level security;
alter table public.etsy_orders enable row level security;

drop policy if exists "Users can read own profile" on public.profiles;
create policy "Users can read own profile"
on public.profiles for select
to authenticated
using (auth.uid() = id);

drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile"
on public.profiles for update
to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);

drop policy if exists "Users can read own projects" on public.projects;
create policy "Users can read own projects"
on public.projects for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "Users can create own projects" on public.projects;
create policy "Users can create own projects"
on public.projects for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "Users can update own projects" on public.projects;
create policy "Users can update own projects"
on public.projects for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users can delete own projects" on public.projects;
create policy "Users can delete own projects"
on public.projects for delete
to authenticated
using (auth.uid() = user_id);

drop policy if exists "Users can read own generated sets" on public.generated_sets;
create policy "Users can read own generated sets"
on public.generated_sets for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "Users can read own credit ledger" on public.credit_ledger;
create policy "Users can read own credit ledger"
on public.credit_ledger for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "Users can read active Etsy products" on public.etsy_products;
create policy "Users can read active Etsy products"
on public.etsy_products for select
to authenticated
using (active = true);

-- No public policies are created for generated-set inserts, credit changes, or Etsy orders.
-- Those writes should happen through Supabase Edge Functions using the service role key.
