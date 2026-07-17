# CLAUDE.md — Finly

> Ten plik jest czytany automatycznie przez Claude Code na starcie sesji.
> Zanim zaczniesz jakąkolwiek pracę, przeczytaj `context.txt` w tym folderze —
> to pełne źródło prawdy o projekcie (koncept, decyzje, model danych, plan).

## Skrót projektu
Finly to prosta, ładna aplikacja webowa do organizowania własnych finansów:
osobisty "portfel" do ręcznego zapisywania dochodów, wydatków, celów i aktywów.
NIE służy do płatności — tylko do śledzenia. Dla każdego, od dziecka po dorosłego.

## Kluczowe decyzje
- Platforma: **web najpierw** (mobile-first, responsywne), potem mobile
- MVP: **lokalnie, bez kont** (dane w przeglądarce)
- Stack: **Next.js + TypeScript, Tailwind CSS, shadcn/ui, Recharts**, dane w localStorage/IndexedDB

## Zasady pracy
- Trzymaj się prostoty — mało kliknięć, czytelny UI (przyjazny też dziecku).
- Po ważnych ustaleniach dopisuj je do sekcji "DZIENNIK WĄTKÓW" w `context.txt`.
- Pytaj, zanim wprowadzisz dużą zmianę architektury.

## Struktura
- `context.txt` — pełny kontekst projektu (czytaj najpierw)
- `CLAUDE.md` — ten plik
- (kod aplikacji pojawi się tutaj po zainicjowaniu projektu w Etapie 1)
