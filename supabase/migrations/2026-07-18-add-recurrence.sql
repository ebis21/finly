-- Migracja: dodaje częstotliwość powtarzania transakcji (co miesiąc / co rok).
-- Uruchom w SQL Editorze Supabase, jeśli używasz konta (trybu chmurowego).
-- Tryb lokalny (gość) nie wymaga tej migracji.

alter table public.transactions
  add column if not exists recurrence text
  check (recurrence in ('monthly','yearly'));
