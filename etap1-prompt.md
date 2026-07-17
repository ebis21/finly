# Prompt do Claude Code — Etap 1 (fundament projektu)

> Jak użyć: otwórz terminal w folderze Finly, uruchom `claude`,
> a potem wklej cały poniższy tekst (od linii "Cześć!" do końca).

---

Cześć! Pracujemy nad aplikacją Finly. Zanim cokolwiek zrobisz, przeczytaj
pliki `CLAUDE.md` i `context.txt` w tym folderze — to pełny kontekst projektu
i wszystkie decyzje. Trzymaj się ich.

Twoje zadanie: dokończyć **Etap 1 — fundament projektu**. W folderze są już
pliki konfiguracyjne (`package.json`, `tsconfig.json`, `next.config.mjs`,
`postcss.config.mjs`, `tailwind.config.ts`, `.eslintrc.json`) oraz dokumentacja
(`CLAUDE.md`, `README.md`, `context.txt`, `.gitignore`). Sprawdź, co już istnieje,
i NIE nadpisuj tych plików bez potrzeby — uzupełnij brakujące elementy.

## Co ma powstać
1. Struktura folderów: `app/`, `components/`, `lib/`.
2. Konfiguracja Tailwind CSS i globalny arkusz stylów (`app/globals.css`).
3. Font Inter (przez `next/font`, z obsługą polskich znaków — subset `latin-ext`).
4. Główny layout (`app/layout.tsx`): język `pl`, wyśrodkowany kontener
   maksymalnie szeroki jak telefon (mobile-first), tło, metadane tytułu.
5. Nagłówek (`components/Header.tsx`): logo "F" + nazwa "Finly".
6. Dolna nawigacja (`components/BottomNav.tsx`) z pozycjami: Pulpit, Cele,
   Aktywa oraz dużym, wyróżnionym przyciskiem "+" na środku (na razie bez akcji).
   Użyj ikon z `lucide-react`.
7. Ekran główny / dashboard (`app/page.tsx`) — na razie makieta z danymi
   zerowymi: kafelek salda, dwa kafelki "Wpłynęło" i "Wydałem", oraz pusty
   stan listy transakcji ("Brak transakcji. Dodaj pierwszą przyciskiem +").
8. Pomocnik `lib/utils.ts` z funkcją `cn` (clsx + tailwind-merge) pod przyszłe shadcn/ui.

## Wymagania
- Stack zgodny z `context.txt`: Next.js (App Router) + TypeScript + Tailwind.
- Wygląd: prosty, nowoczesny, czysty, przyjazny też dla dziecka. Duże, czytelne
  liczby. Kolor przewodni — zieleń (emerald). Wszystkie teksty po polsku.
- Kod ma być czytelny i prosty — to fundament, bez nadmiaru abstrakcji.

## Na koniec
1. Uruchom `npm install`, a potem `npm run dev` i upewnij się, że aplikacja
   startuje bez błędów pod http://localhost:3000.
2. Napraw ewentualne błędy.
3. Dopisz krótką notatkę do sekcji "DZIENNIK WĄTKÓW" w `context.txt`
   (co zostało zrobione w Etapie 1).
4. Zrób commit w Git z sensownym opisem.

Pytaj, jeśli coś jest niejasne, zanim podejmiesz większą decyzję architektoniczną.
