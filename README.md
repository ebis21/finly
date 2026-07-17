# Finly 💰

Prosta aplikacja do ręcznego organizowania dochodów, wydatków, celów oszczędnościowych i aktywów. Finly służy do śledzenia finansów, nie do wykonywania płatności.

## Status

Interaktywne MVP z trybem hybrydowym:

- bez konta dane są zapisywane lokalnie w przeglądarce,
- po zalogowaniu dane są przechowywane w Supabase,
- lokalny portfel jest automatycznie kopiowany do całkowicie pustego konta chmurowego.

## Stack

- Next.js 14, React i TypeScript
- Tailwind CSS i Recharts
- Supabase Auth oraz Postgres z Row Level Security
- Vitest

## Uruchomienie

```bash
npm install
npm run dev
```

Aplikacja działa pod `http://localhost:3000`. Tryb lokalny nie wymaga konfiguracji Supabase.

Aby włączyć konta i chmurę:

1. Skopiuj `.env.example` do `.env.local` i uzupełnij publiczny URL oraz anon key projektu.
2. Uruchom `supabase/schema.sql` w Supabase SQL Editor.
3. Zrestartuj serwer deweloperski.

## Weryfikacja

```bash
npm test
npm run lint
npm run build
```

Pełny kontekst i historia decyzji znajdują się w `context.txt`.
