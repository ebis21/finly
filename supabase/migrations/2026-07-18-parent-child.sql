-- ========================================================================
-- Tryb rodzic↔dziecko. Uruchom raz w SQL Editorze Supabase (tryb chmurowy).
-- Tryb gościa (lokalny) nie wymaga tej migracji.
-- Bezpieczne: dodaje tabele/kolumnę/polityki/funkcje, nie rusza istniejących
-- danych. Można uruchomić wielokrotnie (idempotentne).
-- ========================================================================

-- ---------- TABELE ----------
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

-- Kto dodał wpis: puste/own = dziecko samo; różne od właściciela = rodzic.
alter table public.transactions
  add column if not exists added_by_user_id uuid references auth.users(id);

-- ---------- RLS ----------
alter table public.family_links enable row level security;
alter table public.link_codes   enable row level security;

-- family_links: widzi child albo parent; usunąć (odłączyć) może każde z nich.
-- Wstawianie tylko przez redeem_link_code() (SECURITY DEFINER) — brak insert policy.
drop policy if exists "family_links_select" on public.family_links;
create policy "family_links_select" on public.family_links
  for select using (auth.uid() = child_user_id or auth.uid() = parent_user_id);
drop policy if exists "family_links_delete" on public.family_links;
create policy "family_links_delete" on public.family_links
  for delete using (auth.uid() = child_user_id or auth.uid() = parent_user_id);

-- link_codes: zarządza tylko dziecko (właściciel). Rodzic nie SELECTuje —
-- wpisanie kodu obsługuje redeem_link_code() z uprawnieniami definiującego.
drop policy if exists "link_codes_owner" on public.link_codes;
create policy "link_codes_owner" on public.link_codes
  for all using (auth.uid() = child_user_id) with check (auth.uid() = child_user_id);

-- Dodatkowe polityki ODCZYTU dla połączonego rodzica (OR z istniejącymi).
drop policy if exists "transactions_parent_select" on public.transactions;
create policy "transactions_parent_select" on public.transactions
  for select using (exists (
    select 1 from public.family_links fl
    where fl.child_user_id = transactions.user_id and fl.parent_user_id = auth.uid()
  ));
drop policy if exists "goals_parent_select" on public.goals;
create policy "goals_parent_select" on public.goals
  for select using (exists (
    select 1 from public.family_links fl
    where fl.child_user_id = goals.user_id and fl.parent_user_id = auth.uid()
  ));
drop policy if exists "assets_parent_select" on public.assets;
create policy "assets_parent_select" on public.assets
  for select using (exists (
    select 1 from public.family_links fl
    where fl.child_user_id = assets.user_id and fl.parent_user_id = auth.uid()
  ));

-- ---------- FUNKCJE (RPC) ----------
-- Dziecko generuje jednorazowy kod (ważny 15 min). Zawsze jeden aktywny.
create or replace function public.create_link_code()
returns text
language plpgsql security definer set search_path = public
as $$
declare
  v_code text;
  v_alphabet text := 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'; -- bez 0 O 1 I L
  i int;
begin
  if auth.uid() is null then raise exception 'Brak autoryzacji.'; end if;
  delete from public.link_codes where child_user_id = auth.uid();
  loop
    v_code := '';
    for i in 1..6 loop
      v_code := v_code || substr(v_alphabet, 1 + floor(random() * length(v_alphabet))::int, 1);
    end loop;
    exit when not exists (select 1 from public.link_codes where code = v_code);
  end loop;
  insert into public.link_codes(code, child_user_id, expires_at)
    values (v_code, auth.uid(), now() + interval '15 minutes');
  return v_code;
end;
$$;

-- Rodzic wpisuje kod → tworzy połączenie, zużywa kod, zwraca dane dziecka.
create or replace function public.redeem_link_code(p_code text)
returns json
language plpgsql security definer set search_path = public
as $$
declare
  v_code text := upper(regexp_replace(coalesce(p_code, ''), '\s', '', 'g'));
  v_child uuid;
  v_name text;
begin
  if auth.uid() is null then raise exception 'Brak autoryzacji.'; end if;
  select child_user_id into v_child from public.link_codes
    where code = v_code and used_at is null and expires_at > now();
  if v_child is null then raise exception 'Kod jest nieprawidłowy lub wygasł.'; end if;
  if v_child = auth.uid() then raise exception 'Nie możesz połączyć się sam ze sobą.'; end if;
  insert into public.family_links(child_user_id, parent_user_id)
    values (v_child, auth.uid())
    on conflict (child_user_id, parent_user_id) do nothing;
  update public.link_codes set used_at = now() where code = v_code;
  select coalesce(u.raw_user_meta_data->>'name', split_part(u.email, '@', 1))
    into v_name from auth.users u where u.id = v_child;
  return json_build_object('child_id', v_child, 'name', v_name);
end;
$$;

-- Rodzic dorzuca kieszonkowe (income) do portfela dziecka.
create or replace function public.parent_add_pocket_money(p_child uuid, p_amount numeric, p_title text)
returns void
language plpgsql security definer set search_path = public
as $$
begin
  if auth.uid() is null then raise exception 'Brak autoryzacji.'; end if;
  if p_amount is null or p_amount <= 0 then raise exception 'Kwota musi być dodatnia.'; end if;
  if not exists (select 1 from public.family_links
                 where child_user_id = p_child and parent_user_id = auth.uid())
    then raise exception 'Brak połączenia z tym dzieckiem.'; end if;
  insert into public.transactions(user_id, type, amount, date, category, description, added_by_user_id)
    values (p_child, 'income', p_amount, current_date, 'Kieszonkowe',
            coalesce(nullif(trim(p_title), ''), 'Kieszonkowe'), auth.uid());
end;
$$;

-- Rodzic dopłaca do celu dziecka: wpływ +kwota ORAZ przeksięgowanie na cel,
-- więc saldo "Mam" dziecka nie zmienia się, a pasek celu rośnie.
create or replace function public.parent_contribute_to_goal(p_goal uuid, p_amount numeric)
returns void
language plpgsql security definer set search_path = public
as $$
declare
  v_child uuid;
  v_name text;
begin
  if auth.uid() is null then raise exception 'Brak autoryzacji.'; end if;
  if p_amount is null or p_amount <= 0 then raise exception 'Kwota musi być dodatnia.'; end if;
  select user_id, name into v_child, v_name from public.goals where id = p_goal;
  if v_child is null then raise exception 'Nie ma takiego celu.'; end if;
  if not exists (select 1 from public.family_links
                 where child_user_id = v_child and parent_user_id = auth.uid())
    then raise exception 'Brak połączenia z tym dzieckiem.'; end if;
  insert into public.transactions(user_id, type, amount, date, category, description, added_by_user_id)
    values (v_child, 'income', p_amount, current_date, 'Na cel',
            'Wpłata na cel: ' || v_name, auth.uid());
  update public.goals set saved_amount = saved_amount + p_amount where id = p_goal;
end;
$$;

-- Listy połączeń z imionami (join do auth.users wymaga uprawnień definiującego).
create or replace function public.get_my_children()
returns table (link_id uuid, member_id uuid, name text, email text)
language sql security definer set search_path = public
as $$
  select fl.id, fl.child_user_id,
         coalesce(u.raw_user_meta_data->>'name', split_part(u.email, '@', 1)), u.email
  from public.family_links fl
  join auth.users u on u.id = fl.child_user_id
  where fl.parent_user_id = auth.uid();
$$;

create or replace function public.get_my_parents()
returns table (link_id uuid, member_id uuid, name text, email text)
language sql security definer set search_path = public
as $$
  select fl.id, fl.parent_user_id,
         coalesce(u.raw_user_meta_data->>'name', split_part(u.email, '@', 1)), u.email
  from public.family_links fl
  join auth.users u on u.id = fl.parent_user_id
  where fl.child_user_id = auth.uid();
$$;

-- ---------- UPRAWNIENIA ----------
grant execute on function public.create_link_code() to authenticated;
grant execute on function public.redeem_link_code(text) to authenticated;
grant execute on function public.parent_add_pocket_money(uuid, numeric, text) to authenticated;
grant execute on function public.parent_contribute_to_goal(uuid, numeric) to authenticated;
grant execute on function public.get_my_children() to authenticated;
grant execute on function public.get_my_parents() to authenticated;
