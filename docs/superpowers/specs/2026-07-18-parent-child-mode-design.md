# Tryb rodzic↔dziecko — projekt (spec)

Data: 2026-07-18
Status: zaakceptowany (użytkownik zatwierdził całość, „na wszystko się zgadzam”)

## Cel
Rodzic z własnym kontem może połączyć się z kontem dziecka, oglądać jego
portfel (odczyt), dorzucać kieszonkowe i dopłacać do celów — bez możliwości
edycji/kasowania wpisów dziecka. Dziecko jest właścicielem swoich danych
i kontroluje połączenia.

## Decyzje (potwierdzone z użytkownikiem)
1. Dziecko ma **własne konto**; rodzic łączy się **jednorazowym kodem**, który
   generuje dziecko.
2. Rodzic może: **podgląd całości**, **dorzucać kieszonkowe**, **dopłacać do
   celu**. NIE edytuje ani nie kasuje wpisów dziecka.
3. Łączenie: **dziecko generuje kod → rodzic wpisuje**. Kod ważny 15 min,
   jednorazowy.
4. UI rodzica: osobna zakładka **„Dzieci”** (portfel rodzica zostaje osobno).
5. Technika: **reguły w bazie (RLS) + funkcje w bazie (RPC)** — bez Edge
   Functions, bez nowej infrastruktury.

## Model danych (Supabase)
Nowe tabele:

- `family_links`: `id`, `child_user_id`, `parent_user_id`, `created_at`,
  UNIQUE(child_user_id, parent_user_id).
- `link_codes`: `code` (PK, krótki, bez znaków mylących 0/O/1/I/L),
  `child_user_id`, `created_at`, `expires_at` (now+15 min), `used_at` (null).

Zmiana w istniejącej tabeli:
- `transactions.added_by_user_id uuid null` — kto dodał wpis. Null lub =
  właściciel → dziecko samo. Ustawione i różne od właściciela → rodzic
  (UI: „💛 od rodzica”).

`goals` i `assets` — bez zmian w strukturze.

## Bezpieczeństwo (RLS + RPC)
Reguły odczytu (RLS SELECT):
- `transactions`, `goals`, `assets`: widzi właściciel (auth.uid()=user_id)
  LUB połączony rodzic (istnieje wiersz `family_links` gdzie
  child=user_id i parent=auth.uid()).
- `family_links`: widzi child albo parent z wiersza.
- `link_codes`: widzi/tworzy/kasuje tylko child (child_user_id=auth.uid()).

Zapisy:
- `transactions`/`goals`/`assets` INSERT/UPDATE/DELETE: **tylko właściciel**
  (dziecko). Rodzic NIE pisze bezpośrednio.
- Akcje rodzica idą przez funkcje SECURITY DEFINER, które walidują link:
  - `create_link_code()` → tworzy i zwraca kod dla auth.uid() (dziecko).
  - `redeem_link_code(p_code)` → sprawdza (istnieje, nie wygasł, nieużyty,
    child≠parent, para niepołączona), tworzy `family_links`, zużywa kod,
    zwraca dane dziecka (id, imię).
  - `parent_add_pocket_money(p_child, p_amount, p_title)` → waliduje link,
    wstawia income (category „Kieszonkowe”, added_by=parent).
  - `parent_contribute_to_goal(p_goal, p_amount)` → waliduje link do
    właściciela celu, ATOMOWO: wstawia income (category „Na cel”,
    added_by=parent) + zwiększa goals.saved_amount o kwotę. Efekt: saldo
    „Mam” dziecka bez zmian, pasek celu rośnie.
  - `unlink(p_link_id)` → usuwa połączenie, gdy auth.uid() to child lub parent.
  - `get_my_children()` / `get_my_parents()` → lista połączeń z imionami
    (join do auth.users, definer).

Księgowość dopłaty do celu: zewnętrzne pieniądze rodzica nie mogą zmniejszać
salda dziecka, dlatego dopłata = wpływ +kwota ORAZ przeksięgowanie tej kwoty
na cel (netto saldo 0, cel +kwota).

## UI
Strona dziecka (w modalu „Twoje konto”):
- Sekcja „Rodzice”: przycisk „Pokaż kod dla rodzica” → generuje kod, pokazuje
  go dużą czcionką z odliczaniem ważności. Lista połączonych rodziców
  z „Odłącz”. Dla gościa: podpowiedź „załóż konto, by połączyć rodzica”.

Strona rodzica — nowa zakładka `/dzieci` (nowy element w BottomNav):
- Niezalogowany/gość: podpowiedź o założeniu konta.
- „Połącz dziecko” → modal na wpisanie kodu.
- Lista połączonych dzieci: imię + skrót postępu celów. Wejście w dziecko →
  widok szczegółu.
- Szczegół dziecka (modal/pod-widok): saldo „Mam” + „Oczekujące”, lista celów
  z paskami postępu, przyciski „Dorzuć kieszonkowe” i „Dopłać do celu”
  (wybór celu + kwota), opcja „Odłącz”. (Pełna lista transakcji poza MVP.)

Nawigacja: BottomNav rozszerzony do Pulpit / Cele / [+] / Aktywa / Dzieci
(grid 5 kolumn, „+” na środku).

## Warstwa kliencka
- `lib/family.ts`: typy (FamilyLink, ChildSummary, ParentSummary) + funkcje
  owijające RPC/zapytania (createLinkCode, listParents, unlinkParent,
  redeemCode, listChildren, loadChildPortfolio, addPocketMoney,
  contributeToChildGoal). Wszystko przez `requireSupabase()`.
- `transactions` w istniejącym mapowaniu: dodać `added_by_user_id` (odczyt),
  by pokazać „od rodzica”.
- Tryb gościa (lokalny) nie ma dostępu do trybu rodzic↔dziecko (wymaga konta);
  UI pokazuje podpowiedź.

## Testy
- Jednostkowe (Vitest) dla logiki czysto klienckiej: format/generacja kodu,
  mapowanie wierszy połączeń, helper księgowania dopłaty do celu.
- RLS/RPC weryfikowane przez inspekcję SQL; pełne E2E wymaga dwóch kont
  i uruchomionej migracji (poza zakresem automatycznych testów tutaj).

## Migracja i wdrożenie
- Plik `supabase/migrations/2026-07-18-parent-child.sql`: nowe tabele, kolumna
  `added_by_user_id`, polityki RLS, funkcje RPC. Użytkownik uruchamia go raz
  w SQL Editorze Supabase (jak poprzednią migrację). Tryb gościa nie wymaga.

## Poza zakresem MVP (YAGNI)
- Powiadomienia push/e-mail (to osobna funkcja: gamifikacja/przypomnienia).
- Edycja/kasowanie danych dziecka przez rodzica.
- Wielopoziomowe role/uprawnienia (na razie „rodzic” = stały zestaw praw).
- Pełny podgląd historii transakcji dziecka po stronie rodzica.
