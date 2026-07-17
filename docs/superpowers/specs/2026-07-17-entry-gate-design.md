# Brama wejścia i pusty tryb gościa — projekt

## Cel

Każda osoba otwierająca Finly świadomie wybiera konto albo tryb bez logowania. Pulpit nie jest widoczny przed ustaleniem sesji lub wyborem gościa. Nowi użytkownicy zaczynają bez danych demonstracyjnych.

## Przepływ wejścia

Podczas odczytu sesji Supabase aplikacja pokazuje pełnoekranowy stan ładowania. Aktywna sesja od razu otwiera portfel chmurowy. Bez aktywnej sesji i bez zapamiętanego wyboru gościa wyświetlana jest pełnoekranowa brama Finly z trzema akcjami: „Zaloguj się”, „Utwórz konto” i „Kontynuuj bez logowania”.

Brama zasłania całą aplikację i nie renderuje nagłówka, pulpitu ani dolnej nawigacji. Logowanie i rejestracja korzystają z istniejącego Supabase Auth oraz polskich komunikatów błędów.

## Tryb gościa

„Kontynuuj bez logowania” zapisuje decyzję na urządzeniu i otwiera lokalny portfel. Decyzja jest zapamiętana między wizytami, dlatego powracający gość nie widzi ponownie bramy. Może później otworzyć ikonę konta i zalogować się lub utworzyć konto.

Nowy portfel lokalny jest pusty: nie zawiera transakcji, celów ani aktywów demo. Istniejący zapis lokalny użytkownika nie jest automatycznie kasowany podczas aktualizacji aplikacji. Jeśli przeglądarka ma wcześniejsze dane w `finly-data-v1`, pozostają dostępne w trybie gościa.

Wylogowanie usuwa zapamiętany wybór wejścia dla bieżącej sesji aplikacji i wraca do bramy. Nie usuwa danych lokalnych ani chmurowych. Użytkownik może ponownie wybrać „Kontynuuj bez logowania”.

## Dane konta i migracja

Zalogowany użytkownik widzi wyłącznie dane przypisane do swojego `user_id` w Supabase. Istniejące konto odzyskuje wcześniejsze transakcje, cele i aktywa z chmury. Nowe konto bez danych pozostaje puste, chyba że na urządzeniu istnieją rzeczywiste dane utworzone w trybie gościa.

Po zalogowaniu lokalny portfel jest kopiowany do Supabase tylko wtedy, gdy wszystkie trzy kolekcje konta chmurowego są puste i lokalny portfel zawiera co najmniej jeden rekord. Dane demonstracyjne nie istnieją, więc nie mogą zostać zaimportowane. Jeśli chmura zawiera dowolny rekord, import jest pomijany, a lokalne dane pozostają na urządzeniu.

## Komponenty i stan

Nowy komponent bramy odpowiada wyłącznie za wybór wejścia i formularze auth. `AuthProvider` nadal odpowiada za sesję Supabase. Osobny, mały moduł przechowuje wybór gościa w localStorage, dzięki czemu reguła jest testowalna i nie miesza się z danymi finansowymi.

Główny layout renderuje albo bramę, albo dotychczasową powłokę aplikacji. `FinlyProvider` zachowuje hybrydowy wybór localStorage/Supabase, lecz pusty obiekt zastępuje dotychczasowy seed demo. Ikona konta korzysta z tego samego formularza auth co brama, żeby nie duplikować logiki interfejsu.

## Błędy i stany przejściowe

Brama blokuje wielokrotne wysłanie formularza. Błędy walidacji i Supabase są pokazane przy formularzu. Nieudane sprawdzenie sesji kończy się bramą z komunikatem umożliwiającym tryb gościa, zamiast bezterminowego ekranu ładowania.

Podczas przejścia gość → konto aplikacja pokazuje stan ładowania danych. Błąd importu nie usuwa lokalnego portfela i jest komunikowany istniejącym alertem warstwy danych.

## Testowanie

Testy obejmują: wybór bramy dla braku sesji, pominięcie bramy dla aktywnej sesji, zapamiętanie i wyczyszczenie trybu gościa, pusty stan nowego localStorage, zachowanie istniejącego lokalnego portfela oraz import niepustych danych gościa wyłącznie do pustego konta.

Końcowa weryfikacja obejmuje pełne testy Vitest, ESLint i produkcyjny build Next.js.

## Poza zakresem

- automatyczne scalanie niepustego portfela lokalnego i chmurowego,
- usuwanie lokalnych danych po migracji,
- reset hasła i logowanie społecznościowe,
- ekran onboardingowy wyjaśniający funkcje finansowe,
- zmiana schematu Supabase.
