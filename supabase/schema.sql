-- ========== TABELE ==========
create table if not exists public.transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  type text not null check (type in ('income','expense')),
  amount numeric(12,2) not null,
  currency text not null default 'PLN',
  date date not null default current_date,
  category text,
  description text,
  is_recurring boolean not null default false,
  added_by_user_id uuid references auth.users(id),
  note text,
  created_at timestamptz not null default now()
);

-- Połączenia rodzic↔dziecko i jednorazowe kody łączenia.
-- Pełne polityki RLS i funkcje RPC: supabase/migrations/2026-07-18-parent-child.sql
create table if not exists public.family_links (
  id uuid primary key default gen_random_uuid(),
  child_user_id uuid not null references auth.users(id) on delete cascade,
  parent_user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (child_user_id, parent_user_id)
);

create table if not exists public.link_codes (
  code text primary key,
  child_user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null,
  used_at timestamptz
);

create table if not exists public.goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  target_amount numeric(12,2) not null,
  saved_amount numeric(12,2) not null default 0,
  link text,
  image_url text,
  status text not null default 'active',
  created_at timestamptz not null default now()
);

create table if not exists public.assets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  type text,
  value numeric(12,2) not null default 0,
  note text,
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  type text not null check (type in ('income','expense')),
  icon text,
  color text,
  created_at timestamptz not null default now()
);

-- ========== BEZPIECZEŃSTWO (Row Level Security) ==========
alter table public.transactions enable row level security;
alter table public.goals        enable row level security;
alter table public.assets       enable row level security;
alter table public.categories   enable row level security;

-- Każdy użytkownik widzi i edytuje TYLKO swoje wiersze.
-- transactions
create policy "transactions_select" on public.transactions for select using (auth.uid() = user_id);
create policy "transactions_insert" on public.transactions for insert with check (auth.uid() = user_id);
create policy "transactions_update" on public.transactions for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "transactions_delete" on public.transactions for delete using (auth.uid() = user_id);
-- goals
create policy "goals_select" on public.goals for select using (auth.uid() = user_id);
create policy "goals_insert" on public.goals for insert with check (auth.uid() = user_id);
create policy "goals_update" on public.goals for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "goals_delete" on public.goals for delete using (auth.uid() = user_id);
-- assets
create policy "assets_select" on public.assets for select using (auth.uid() = user_id);
create policy "assets_insert" on public.assets for insert with check (auth.uid() = user_id);
create policy "assets_update" on public.assets for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "assets_delete" on public.assets for delete using (auth.uid() = user_id);
-- categories
create policy "categories_select" on public.categories for select using (auth.uid() = user_id);
create policy "categories_insert" on public.categories for insert with check (auth.uid() = user_id);
create policy "categories_update" on public.categories for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "categories_delete" on public.categories for delete using (auth.uid() = user_id);
