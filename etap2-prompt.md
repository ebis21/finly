# Prompt do Claude Code — Etap 2 (Supabase: logowanie + baza danych)

> Jak użyć:
> 1. Zaloguj się na supabase.com i utwórz nowy projekt.
> 2. Wejdź w: Project Settings → API. Skopiuj stamtąd dwie rzeczy:
>    - "Project URL"
>    - "anon public" (klucz publiczny)
> 3. Wklej te dwie wartości poniżej w miejsca << ... >>.
> 4. Otwórz terminal w folderze Finly, uruchom `claude` i wklej CAŁY tekst
>    od linii "Cześć!" do końca (razem z uzupełnionymi kluczami).

---

## 🔑 MOJE KLUCZE SUPABASE (uzupełnij te dwie linie)

```
NEXT_PUBLIC_SUPABASE_URL=<< https://wslbccozldcwxogjblku.supabase.coL >>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<< sb_publishable_RCF4-a2Rpgvyu27CWeZ2iw_TvPCM6nC >>
```

---

Cześć! Pracujemy nad aplikacją Finly. Zanim cokolwiek zrobisz, przeczytaj
`CLAUDE.md` i `context.txt` w tym folderze — to pełny kontekst i decyzje.

Twoje zadanie: **Etap 2 — dodać logowanie (e-mail + hasło) i zapis danych do
bazy w Supabase**, zastępując dotychczasowe przechowywanie danych lokalnie.

## 1. Konfiguracja
- Zainstaluj `@supabase/supabase-js`.
- Utwórz plik `.env.local` i wpisz do niego moje dwie zmienne z sekcji
  "MOJE KLUCZE SUPABASE" powyżej (NEXT_PUBLIC_SUPABASE_URL oraz
  NEXT_PUBLIC_SUPABASE_ANON_KEY). Upewnij się, że `.env.local` jest w `.gitignore`
  (nie commituj sekretów).
- Utwórz klienta Supabase w `lib/supabase.ts` (albo `lib/supabaseClient.ts`),
  czytającego te zmienne środowiskowe.

## 2. Baza danych (SQL)
Zapisz poniższy schemat jako `supabase/schema.sql` w projekcie. Ja wkleję go
i uruchomię ręcznie w Supabase (SQL Editor → New query → Run). Sam go nie
uruchamiasz — tylko utwórz plik i przypomnij mi w podsumowaniu, żebym go odpalił.

```sql
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
  note text,
  created_at timestamptz not null default now()
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
```

## 3. Logowanie (e-mail + hasło)
- Ekran rejestracji i logowania (e-mail + hasło) w prostym, ładnym stylu Finly.
- Wylogowanie dostępne z poziomu aplikacji.
- Ochrona aplikacji: jeśli użytkownik nie jest zalogowany, przekieruj go na
  ekran logowania. Zalogowany trafia na pulpit.
- Obsłuż błędy (złe hasło, zajęty e-mail) czytelnymi komunikatami po polsku.

## 4. Zapis danych
- Podmień dotychczasowe przechowywanie danych na zapis/odczyt z Supabase
  dla: transakcji, celów, aktywów, kategorii.
- Przy dodawaniu rekordu ZAWSZE ustawiaj `user_id` na id zalogowanego
  użytkownika (żeby RLS działało).
- Dashboard, cele i aktywa mają pokazywać realne dane z bazy dla danego konta.
- Zadbaj o czytelne stany ładowania i pustych list.

## 5. Na koniec
- Uruchom `npm install` i `npm run dev`, sprawdź, że można się zarejestrować,
  zalogować, dodać wydatek/dochód i że dane się zapisują. Napraw błędy.
- W podsumowaniu przypomnij mi, żebym wkleił `supabase/schema.sql` do
  Supabase SQL Editor i go uruchomił (jeśli jeszcze tego nie zrobiłem).
- Dopisz notatkę do sekcji "DZIENNIK WĄTKÓW" w `context.txt` i zaktualizuj
  sekcję 6 (zakres MVP przechodzi na konta + chmura) oraz 7 (stack).
- Zrób commit w Git z sensownym opisem.

Pytaj, jeśli coś jest niejasne, zanim podejmiesz większą decyzję architektoniczną.
