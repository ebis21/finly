# Wdrożenie Finly — GitHub + Vercel

Kolejność: najpierw kod ląduje na GitHubie, potem Vercel pobiera go z GitHuba
i publikuje w internecie. Aktualizacje działają automatycznie — każdy kolejny
`git push` = nowa wersja na żywo.

⚠️ NAJWAŻNIEJSZE: plik `.env.local` z kluczami Supabase NIE trafia na GitHub
(jest w `.gitignore`). Klucze wklejasz osobno w panelu Vercel (Część 2).

---

## CZĘŚĆ 1 — GitHub

### A. Utwórz puste repozytorium (przez stronę)
1. Wejdź na github.com → zielony przycisk "New" (nowe repozytorium).
2. Nazwa: `finly`. Widoczność: Private (prywatne) lub Public — jak wolisz.
3. NIE zaznaczaj "Add a README", "Add .gitignore" ani licencji — repo ma być puste.
4. Kliknij "Create repository" i skopiuj adres repo (kończy się na `.git`),
   np. `https://github.com/twoj-login/finly.git`.

### B. Wyślij kod (prompt do Claude Code)
Wklej adres repo poniżej w miejsce << ... >>, potem odpal `claude` w folderze
Finly i wklej cały tekst od "Cześć!":

```
ADRES_REPO=<< WKLEJ TUTAJ ADRES REPO Z GITHUBA (.git) >>
```

Cześć! Chcę wysłać projekt Finly na GitHub. Zanim zaczniesz, potwierdź w
`.gitignore`, że `.env.local` i `node_modules` są ignorowane (żeby sekrety i
zależności nie trafiły do repo). Następnie:
1. Upewnij się, że wszystkie zmiany są zacommitowane (`git add .` + commit).
2. Dodaj zdalne repozytorium o adresie ADRES_REPO jako `origin`.
3. Ustaw gałąź `main` i zrób `git push -u origin main`.
Jeśli git poprosi o logowanie do GitHuba, poprowadź mnie krok po kroku.
Na koniec potwierdź, że kod jest widoczny w repozytorium.

> Uwaga: przy pierwszym pushu git może poprosić o zalogowanie do GitHuba.
> Najprościej zainstalować "GitHub CLI" (gh) i zrobić `gh auth login`, albo
> zalogować się przez okno, które wyskoczy. Claude Code Ci pomoże.

---

## CZĘŚĆ 2 — Vercel

1. Wejdź na vercel.com i zaloguj się przez GitHub (Continue with GitHub).
2. "Add New…" → "Project".
3. Znajdź na liście repo `finly` i kliknij "Import".
4. Framework wykryje się sam jako Next.js — nic nie zmieniaj w ustawieniach build.
5. Rozwiń sekcję "Environment Variables" i dodaj DWIE zmienne
   (te same, co w Twoim `.env.local`):
   - Name: `NEXT_PUBLIC_SUPABASE_URL`      → Value: Twój Project URL z Supabase
   - Name: `NEXT_PUBLIC_SUPABASE_ANON_KEY` → Value: Twój anon public key z Supabase
6. Kliknij "Deploy" i poczekaj ~1–2 minuty.
7. Dostaniesz adres w stylu `https://finly-xxxx.vercel.app` — to Twoja aplikacja na żywo.

---

## CZĘŚĆ 3 — Supabase po wdrożeniu (żeby logowanie działało na produkcji)

Supabase musi wiedzieć, że Twoja apka żyje teraz pod adresem z Vercela.
1. W Supabase wejdź w: Authentication → URL Configuration.
2. "Site URL": wklej swój adres z Vercela (np. `https://finly-xxxx.vercel.app`).
3. "Redirect URLs": dodaj ten sam adres (możesz też dodać
   `http://localhost:3000` do pracy lokalnej).
4. Zapisz. Od teraz rejestracja i logowanie działają również na produkcji.

---

## Aktualizacje w przyszłości
Gdy zmienisz coś w kodzie: `git add .` → `git commit -m "opis"` → `git push`.
Vercel sam zbuduje i opublikuje nową wersję. Zero dodatkowych kroków.
