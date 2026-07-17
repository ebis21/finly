# Hybrydowy tryb Supabase — projekt

## Cel

Finly działa bez konta z danymi w `localStorage`, a po zalogowaniu używa prywatnych danych użytkownika w Supabase. Pierwsze logowanie może automatycznie przenieść lokalny portfel do pustego konta w chmurze.

## Tryby danych

- Bez zalogowanego użytkownika źródłem prawdy pozostaje istniejący adapter `localStorage` wraz z dotychczasowym mechanizmem danych demonstracyjnych.
- Po zalogowaniu źródłem prawdy jest Supabase. Transakcje, cele i aktywa są pobierane z tabel zabezpieczonych RLS.
- Wylogowanie nie usuwa żadnych danych. Aplikacja wraca do niezmienionego lokalnego portfela.

## Migracja przy pierwszym logowaniu

Po ustaleniu sesji aplikacja równolegle pobiera trzy kolekcje użytkownika z Supabase. Jeżeli wszystkie są puste, kopiuje bieżące lokalne transakcje, cele i aktywa do odpowiednich tabel, przypisując `user_id`.

Jeżeli w którejkolwiek tabeli istnieje rekord, import jest całkowicie pomijany. Zapobiega to duplikatom podczas logowania na kolejnych urządzeniach. Lokalne dane nie są czyszczone po imporcie. Nie jest dodawana osobna flaga migracji — stan pustego portfela chmurowego jest regułą tego etapu.

Import jest traktowany jako jedna operacja aplikacyjna: błąd którejkolwiek kolekcji jest pokazany użytkownikowi, a aplikacja ponownie pobiera stan chmurowy. Schemat nie obiecuje transakcji obejmującej trzy tabele; ponowna próba nie może duplikować danych, ponieważ niepusty stan blokuje kolejny pełny import.

## Uwierzytelnianie i interfejs

Modal konta obsługuje logowanie e-mailem i hasłem, rejestrację, informację o konieczności potwierdzenia adresu oraz wylogowanie. Podczas ustalania sesji, wysyłania formularza i migracji kontrolki są zablokowane, a użytkownik widzi czytelny stan pracy.

Brak konfiguracji Supabase nie blokuje trybu lokalnego. Modal informuje wtedy, że synchronizacja chmurowa wymaga wartości `NEXT_PUBLIC_SUPABASE_URL` i `NEXT_PUBLIC_SUPABASE_ANON_KEY`.

## Warstwa danych i błędy

Kontekst danych zachowuje obecne API komponentów, ale operacje modyfikujące zwracają `Promise` oraz ujednolicony wynik sukcesu lub komunikat błędu. W trybie lokalnym delegują do istniejącego magazynu. W trybie chmurowym zmieniają stan React dopiero po potwierdzonym sukcesie Supabase.

Rekordy Supabase mają jawne typy mapujące nazwy kolumn bazy na istniejące typy domenowe. Błędy pobierania, importu i CRUD nie są zamieniane na pusty stan ani ignorowane. Interfejs zachowuje ostatni poprawny stan i prezentuje komunikat możliwy do ponowienia operacji.

Aktualizacja wpłaty do celu korzysta z aktualnej wartości i zabezpiecza interfejs przed równoległym wysłaniem tej samej operacji. Zakres nie obejmuje synchronizacji czasu rzeczywistego ani rozwiązywania konfliktów między jednocześnie otwartymi urządzeniami.

## Testowanie i dokumentacja

Testy jednostkowe obejmują decyzję o migracji, mapowanie danych, tłumaczenie błędów oraz walidację formularza konta. Testy integracyjne warstwy danych używają kontrolowanego adaptera zamiast prawdziwego projektu Supabase. Końcowa weryfikacja obejmuje testy, `npm run lint` i `npm run build`.

`context.txt` zostanie uzupełniony o tryb hybrydowy, Supabase w stacku oraz wpis w dzienniku. Użytkownik musi ręcznie uruchomić `supabase/schema.sql` w Supabase SQL Editor i dostarczyć lokalne zmienne środowiskowe do pełnego testu połączenia.

## Poza zakresem

- automatyczne scalanie dwóch niepustych portfeli,
- usuwanie lokalnych danych po imporcie,
- logowanie społecznościowe i reset hasła,
- realtime oraz synchronizacja konfliktów,
- automatyczne wykonywanie schematu SQL w zewnętrznym projekcie Supabase.
