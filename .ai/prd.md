# Dokument wymagań produktu (PRD) - Wod Result

## 1. Przegląd produktu

Wod Result to aplikacja typu Progressive Web App (PWA) umożliwiająca atletom porównywanie wyników po workoucie. Aplikacja rozwiązuje problem braku prostego narzędzia do zbierania i porównywania wyników treningowych w małych grupach ćwiczących.

Główne założenia produktu:
- Stack technologiczny: patrz [tech-stack.md](tech-stack.md)
- Wersja: MVP (Minimum Viable Product)
- Użytkownicy docelowi: Atleci (nie trenerzy ani właściciele boxów)
- Skala: Małe grupy treningowe

Każdy użytkownik może utworzyć workout i automatycznie staje się jego właścicielem z prawem do usunięcia. Aplikacja zapewnia pełną transparentność wyników, co zwiększa element rywalizacji i motywacji wśród uczestników.

## 2. Problem użytkownika

Główny problem: Brak prostej aplikacji do porównywania wyników zawodników po workoucie.

Kontekst problemu:
- Atleci po zakończeniu treningu chcą porównać swoje wyniki z innymi uczestnikami
- Obecnie brakuje dedykowanego, prostego narzędzia do tego celu
- Istniejące rozwiązania są zbyt skomplikowane lub wymagają rejestracji/logowania
- Małe grupy treningowe potrzebują szybkiego sposobu na zebranie i porównanie wyników

Potrzeby użytkowników:
- Szybkie utworzenie workoutu bez konieczności zakładania konta
- Łatwy dostęp do workoutów przez publiczną listę z filtrem daty
- Proste dodawanie wyników bez skomplikowanych formularzy
- Natychmiastowy podgląd rankingu z posortowanymi wynikami
- Możliwość filtrowania wyników według płci
- Dostęp do historii workoutów z poprzednich dni

## 3. Wymagania funkcjonalne

### 3.1 Moduł Workout

FR-001: System umożliwia tworzenie nowego workoutu z polem tekstowym na opis treningu.

FR-002: Przy tworzeniu workoutu użytkownik wybiera kierunek sortowania wyników:
- "Wyższy wynik wygrywa" (np. dla liczby powtórzeń)
- "Niższy wynik wygrywa" (np. dla czasu wykonania)

FR-003: Każdy workout jest dostępny publicznie na liście workoutów i posiada unikalny URL.

FR-004: Pole "data workoutu" jest opcjonalne z domyślną wartością ustawioną na dzień bieżący. Użytkownik może ustawić datę wstecz.

FR-005: Twórca workoutu (właściciel) ma możliwość usunięcia workoutu wraz ze wszystkimi przypisanymi wynikami.

FR-006: Dane workoutów są przechowywane bezterminowo w bazie danych.

### 3.2 Moduł Atleta/Wynik

FR-007: Użytkownik dołącza do workoutu poprzez:
- Wybranie workoutu z publicznej listy na stronie głównej, lub
- Kliknięcie bezpośredniego linku URL do workoutu

FR-008: Przy dodawaniu wyniku użytkownik podaje:
- Imię lub pseudonim (pole tekstowe)
- Płeć (mężczyzna/kobieta)
- Wartość wyniku (pole tekstowe bez określonego formatu)

FR-009: Atleta może edytować własny wynik bez ograniczeń czasowych.

FR-010: Atleta może usunąć własny wynik bez ograniczeń czasowych.

FR-011: Identyfikacja atlety odbywa się przez proste pole tekstowe bez mechanizmu uwierzytelniania.

### 3.3 Moduł Wyświetlania

FR-012: Lista wyników jest sortowana według wartości liczbowej z uwzględnieniem wybranego kierunku sortowania (rosnąco lub malejąco).

FR-013: Wyniki zawierające wartości nieliczbowe są umieszczane na końcu listy rankingowej.

FR-014: System umożliwia filtrowanie wyników według płci:
- Wszyscy
- Mężczyźni
- Kobiety

FR-015: Każdy uczestnik widzi wyniki wszystkich innych uczestników (pełna transparentność).

### 3.4 Moduł Wyszukiwania i Historii

FR-016: System umożliwia filtrowanie workoutów po dacie z predefiniowanymi opcjami:
- Dziś
- Ostatnie 7 dni
- Ostatnie 30 dni

FR-017: Lista "moje workouty" (utworzone przez użytkownika lub z dodanym wynikiem) jest przechowywana lokalnie w przeglądarce użytkownika.

FR-018: Użytkownik może przeglądać historię swoich workoutów z poziomu listy "moje workouty".

### 3.5 Moduł PWA

FR-019: Aplikacja działa jako Progressive Web App z możliwością instalacji na urządzeniach mobilnych i desktopowych.

FR-020: Aplikacja jest responsywna i dostosowuje się do różnych rozmiarów ekranów.

## 4. Granice produktu

### 4.1 W zakresie MVP

- Tworzenie workoutów z opisem tekstowym
- Publiczna lista workoutów z filtrem daty
- Dodawanie, edycja i usuwanie wyników przez atletów
- Sortowanie wyników według wartości z uwzględnieniem kierunku
- Filtrowanie wyników według płci
- Filtrowanie workoutów po dacie (predefiniowane opcje)
- Przechowywanie listy "moich workoutów" lokalnie w przeglądarce
- Usuwanie workoutów przez ich twórców
- Działanie jako PWA na urządzeniach mobilnych i desktopowych

### 4.2 Poza zakresem MVP

- System logowania i rejestracji użytkowników
- Uwierzytelnianie i autoryzacja użytkowników
- Statystyki wyników (średnie, postępy, trendy)
- Szablony workoutów
- Kategorie RX/Scaled
- Podział na grupy wiekowe
- Eksport danych
- Powiadomienia push
- Tryb offline z synchronizacją
- Integracje z zewnętrznymi systemami
- Panel administracyjny
- Zaawansowana walidacja wyników
- Limit uczestników w workoucie
- Kody/linki do udostępniania workoutów (uproszczone w MVP - publiczna lista)
- Mechanizm obsługi duplikatów imion atletów
- Metryki i analityka użytkowania

## 5. Historyjki użytkowników

### US-001: Tworzenie nowego workoutu

Tytuł: Utworzenie workoutu przez atletę

Opis: Jako atleta chcę utworzyć nowy workout z opisem treningu, aby móc zebrać wyniki uczestników.

Kryteria akceptacji:
- Użytkownik ma dostęp do formularza tworzenia workoutu ze strony głównej
- Formularz zawiera pole tekstowe na opis workoutu
- Formularz zawiera opcję wyboru kierunku sortowania ("Wyższy wynik wygrywa" / "Niższy wynik wygrywa")
- Formularz zawiera opcjonalne pole daty z domyślną wartością "dziś"
- Workout zostaje zapisany w bazie danych
- Użytkownik zostaje przekierowany na stronę workoutu
- Workout pojawia się na publicznej liście workoutów

### US-002: Przeglądanie publicznej listy workoutów

Tytuł: Przeglądanie wszystkich workoutów na stronie głównej

Opis: Jako atleta chcę zobaczyć listę wszystkich workoutów, aby wybrać ten, do którego chcę dołączyć.

Kryteria akceptacji:
- Na stronie głównej widoczna jest lista wszystkich workoutów
- Lista zawiera: datę workoutu, opis (skrócony), liczbę uczestników
- Lista jest sortowana od najnowszych
- Kliknięcie workoutu przekierowuje na jego stronę

### US-003: Dołączanie do workoutu z listy

Tytuł: Dołączenie do workoutu przez wybranie z listy

Opis: Jako atleta chcę wybrać workout z listy na stronie głównej, aby móc dodać swój wynik.

Kryteria akceptacji:
- Kliknięcie workoutu na liście otwiera stronę workoutu
- Na stronie widoczny jest opis workoutu
- Na stronie widoczny jest formularz dodawania wyniku
- Na stronie widoczna jest aktualna lista wyników (jeśli są)

### US-004: Dodawanie wyniku do workoutu

Tytuł: Dodanie swojego wyniku do workoutu

Opis: Jako atleta chcę dodać swój wynik do workoutu, aby porównać się z innymi uczestnikami.

Kryteria akceptacji:
- Formularz dodawania wyniku zawiera pole na imię/pseudonim (wymagane)
- Formularz zawiera wybór płci: mężczyzna/kobieta (wymagany)
- Formularz zawiera pole na wynik (wymagane, tekst dowolny)
- Po zapisaniu wynik pojawia się na liście wyników
- Wynik jest zapisywany w bazie danych
- Workout zostaje dodany do listy "moje workouty" w lokalnej pamięci przeglądarki

### US-005: Przeglądanie rankingu wyników

Tytuł: Wyświetlenie rankingu wyników workoutu

Opis: Jako atleta chcę zobaczyć ranking wszystkich wyników posortowany od najlepszego, aby porównać się z innymi uczestnikami.

Kryteria akceptacji:
- Lista wyników jest posortowana zgodnie z kierunkiem sortowania wybranym przy tworzeniu workoutu
- Dla "Wyższy wynik wygrywa" - sortowanie malejąco (najwyższy na górze)
- Dla "Niższy wynik wygrywa" - sortowanie rosnąco (najniższy na górze)
- Każdy wpis na liście zawiera: pozycję w rankingu, imię/pseudonim, płeć, wynik
- Wyniki nieliczbowe są wyświetlane na końcu listy
- Lista aktualizuje się automatycznie po dodaniu nowego wyniku

### US-006: Filtrowanie wyników według płci

Tytuł: Filtrowanie rankingu według płci

Opis: Jako atleta chcę filtrować wyniki według płci, aby porównywać się w swojej kategorii.

Kryteria akceptacji:
- Dostępne są opcje filtrowania: Wszyscy, Mężczyźni, Kobiety
- Po wybraniu filtra lista wyświetla tylko wyniki wybranej płci
- Pozycje w rankingu są przeliczane dla wyfiltrowanej grupy
- Domyślnie wyświetlani są wszyscy uczestnicy

### US-007: Edycja własnego wyniku

Tytuł: Edycja własnego wyniku przez atletę

Opis: Jako atleta chcę edytować swój wynik w przypadku pomyłki, aby dane były poprawne.

Kryteria akceptacji:
- Przy własnym wyniku na liście widoczny jest przycisk "Edytuj"
- Po kliknięciu otwiera się formularz z aktualnymi danymi (imię, płeć, wynik)
- Użytkownik może zmienić dowolne pole
- Po zapisaniu zmiany są widoczne na liście wyników
- Edycja jest możliwa bez ograniczeń czasowych
- Identyfikacja własnego wyniku odbywa się przez dane zapisane w lokalnej pamięci przeglądarki

### US-008: Usuwanie własnego wyniku

Tytuł: Usunięcie własnego wyniku przez atletę

Opis: Jako atleta chcę usunąć swój wynik, jeśli nie chcę już uczestniczyć w porównaniu.

Kryteria akceptacji:
- Przy własnym wyniku na liście widoczny jest przycisk "Usuń"
- Po kliknięciu wyświetla się potwierdzenie "Czy na pewno chcesz usunąć swój wynik?"
- Po potwierdzeniu wynik zostaje usunięty z listy i bazy danych
- Pozycje pozostałych uczestników są przeliczane
- Usunięcie jest możliwe bez ograniczeń czasowych

### US-009: Usuwanie workoutu przez właściciela

Tytuł: Usunięcie workoutu przez jego twórcę

Opis: Jako twórca workoutu chcę mieć możliwość usunięcia całego workoutu wraz z wynikami.

Kryteria akceptacji:
- Tylko twórca workoutu widzi przycisk "Usuń workout" na stronie workoutu
- Po kliknięciu wyświetla się potwierdzenie "Czy na pewno chcesz usunąć ten workout? Wszystkie wyniki zostaną usunięte."
- Po potwierdzeniu workout i wszystkie powiązane wyniki zostają usunięte z bazy danych
- Użytkownik zostaje przekierowany na stronę główną
- Identyfikacja właściciela odbywa się przez dane zapisane w lokalnej pamięci przeglądarki

### US-010: Przeglądanie listy własnych workoutów

Tytuł: Wyświetlenie listy "moje workouty"

Opis: Jako atleta chcę zobaczyć listę workoutów, w których uczestniczyłem lub które utworzyłem, aby łatwo do nich wrócić.

Kryteria akceptacji:
- Na stronie głównej dostępna jest sekcja "Moje workouty"
- Lista zawiera workouty utworzone przez użytkownika oraz te, do których dodał wynik
- Każdy wpis zawiera: datę workoutu, opis (skrócony), liczbę uczestników
- Kliknięcie wpisu przekierowuje na stronę workoutu
- Lista jest przechowywana w lokalnej pamięci przeglądarki
- Lista jest sortowana od najnowszych

### US-011: Filtrowanie workoutów po dacie

Tytuł: Filtrowanie listy workoutów według daty

Opis: Jako atleta chcę filtrować listę workoutów po dacie, aby szybko znaleźć workout z określonego okresu.

Kryteria akceptacji:
- Dostępne są predefiniowane opcje filtrowania: Dziś, Ostatnie 7 dni, Ostatnie 30 dni, Wszystkie
- Po wybraniu filtra lista wyświetla tylko workouty z wybranego okresu
- Filtrowanie odbywa się po dacie workoutu (nie dacie utworzenia)
- Domyślnie wyświetlane są wszystkie workouty

### US-012: Ustawianie daty workoutu wstecz

Tytuł: Ustawienie daty workoutu na dzień wcześniejszy

Opis: Jako atleta chcę móc ustawić datę workoutu na dzień wcześniejszy, aby zarejestrować trening z przeszłości.

Kryteria akceptacji:
- Pole daty w formularzu tworzenia workoutu pozwala wybrać datę z przeszłości
- Pole daty nie pozwala wybrać daty z przyszłości
- Domyślna wartość pola to dzień bieżący
- Wybrana data jest zapisywana z workoutem i wyświetlana na liście

### US-013: Wyświetlanie opisu workoutu

Tytuł: Podgląd pełnego opisu workoutu

Opis: Jako atleta chcę zobaczyć pełny opis workoutu, aby wiedzieć jakie ćwiczenie wykonać.

Kryteria akceptacji:
- Na stronie workoutu widoczny jest pełny opis treningu
- Opis jest wyświetlony w czytelnej formie z zachowaniem formatowania (nowe linie)
- Opis jest widoczny zarówno przed jak i po dodaniu wyniku

### US-014: Instalacja aplikacji jako PWA

Tytuł: Instalacja aplikacji na urządzeniu

Opis: Jako atleta chcę zainstalować aplikację na swoim telefonie, aby mieć do niej szybki dostęp.

Kryteria akceptacji:
- Przeglądarka wyświetla opcję "Dodaj do ekranu głównego" lub "Zainstaluj"
- Po instalacji aplikacja jest dostępna z ekranu głównego urządzenia
- Aplikacja uruchamia się w trybie standalone (bez paska adresu przeglądarki)
- Aplikacja ma własną ikonę i nazwę "Wod Result"

### US-015: Nawigacja do strony głównej

Tytuł: Powrót do strony głównej aplikacji

Opis: Jako atleta chcę mieć możliwość powrotu do strony głównej z dowolnego miejsca w aplikacji.

Kryteria akceptacji:
- Logo lub nazwa aplikacji w nagłówku jest klikalne i prowadzi do strony głównej
- Na każdej podstronie dostępny jest sposób powrotu do strony głównej
- Strona główna zawiera: przycisk tworzenia workoutu, publiczną listę workoutów, sekcję "moje workouty"

### US-016: Obsługa niepoprawnego linku do workoutu

Tytuł: Wyświetlenie komunikatu dla nieistniejącego workoutu

Opis: Jako atleta chcę zobaczyć czytelny komunikat gdy próbuję otworzyć link do nieistniejącego workoutu.

Kryteria akceptacji:
- Gdy workout o podanym ID nie istnieje, wyświetlany jest komunikat "Workout nie został znaleziony"
- Strona zawiera przycisk/link powrotu do strony głównej
- Nie jest wyświetlany błąd techniczny ani pusta strona

### US-017: Wyświetlanie informacji o kierunku sortowania

Tytuł: Informacja o kierunku sortowania na stronie workoutu

Opis: Jako atleta chcę wiedzieć jaki jest kierunek sortowania wyników, aby prawidłowo interpretować ranking.

Kryteria akceptacji:
- Na stronie workoutu widoczna jest informacja o kierunku sortowania
- Informacja jest wyświetlona w zrozumiałej formie (np. "Cel: najwyższy wynik" lub "Cel: najniższy czas")
- Informacja jest widoczna przed i po dodaniu wyniku

### US-018: Walidacja formularza dodawania wyniku

Tytuł: Walidacja danych przy dodawaniu wyniku

Opis: Jako atleta chcę być poinformowany o brakujących danych przy dodawaniu wyniku, aby poprawnie wypełnić formularz.

Kryteria akceptacji:
- Przy próbie zapisania bez imienia wyświetla się komunikat "Podaj imię lub pseudonim"
- Przy próbie zapisania bez wyboru płci wyświetla się komunikat "Wybierz płeć"
- Przy próbie zapisania bez wyniku wyświetla się komunikat "Podaj wynik"
- Komunikaty błędów są wyświetlane przy odpowiednich polach
- Formularz nie jest wysyłany dopóki wszystkie wymagane pola nie są wypełnione

### US-019: Wyświetlanie daty workoutu

Tytuł: Pokazanie daty workoutu na stronie

Opis: Jako atleta chcę widzieć datę workoutu, aby wiedzieć kiedy odbył się trening.

Kryteria akceptacji:
- Data workoutu jest widoczna na stronie workoutu
- Data jest wyświetlona w czytelnym formacie (np. "5 lutego 2026" lub "05.02.2026")
- Data jest widoczna również na liście "moje workouty"

### US-020: Responsywność interfejsu

Tytuł: Dostosowanie interfejsu do rozmiaru ekranu

Opis: Jako atleta chcę korzystać z aplikacji zarówno na telefonie jak i komputerze, aby mieć wygodny dostęp z każdego urządzenia.

Kryteria akceptacji:
- Aplikacja jest czytelna i funkcjonalna na ekranach od 320px szerokości
- Na urządzeniach mobilnych elementy są wystarczająco duże do dotykowej obsługi
- Na większych ekranach aplikacja wykorzystuje dostępną przestrzeń
- Formularze i listy są czytelne na wszystkich urządzeniach

### US-021: Wyświetlanie pustej listy wyników

Tytuł: Komunikat dla workoutu bez wyników

Opis: Jako atleta chcę zobaczyć odpowiedni komunikat gdy workout nie ma jeszcze żadnych wyników.

Kryteria akceptacji:
- Gdy workout nie ma wyników, wyświetlany jest komunikat "Brak wyników. Bądź pierwszy!"
- Formularz dodawania wyniku jest nadal widoczny i dostępny
- Nie jest wyświetlana pusta tabela/lista

### US-022: Wyświetlanie pustej listy moich workoutów

Tytuł: Komunikat dla pustej listy workoutów użytkownika

Opis: Jako nowy użytkownik chcę zobaczyć odpowiedni komunikat gdy nie mam jeszcze żadnych workoutów.

Kryteria akceptacji:
- Gdy lista "moje workouty" jest pusta, wyświetlany jest komunikat "Nie masz jeszcze żadnych workoutów"
- Widoczna jest zachęta do utworzenia pierwszego workoutu lub dołączenia do istniejącego z listy
- Sekcja nie jest ukryta ani nie wyświetla pustej listy

## 6. Metryki sukcesu

W wersji MVP nie są wymagane konkretne metryki ilościowe. Produkt zostanie uznany za udany jeśli spełni następujące kryteria jakościowe:

### 6.1 Kryteria funkcjonalne

- Aplikacja umożliwia pełny przepływ użytkownika: utworzenie workoutu, wybranie workoutu z listy, dodanie wyników przez uczestników, wyświetlenie posortowanego rankingu
- Wszystkie wymagania funkcjonalne (FR-001 do FR-020) są zaimplementowane i działają poprawnie
- Wszystkie historyjki użytkownika (US-001 do US-022) są możliwe do wykonania

### 6.2 Kryteria techniczne

- Aplikacja działa poprawnie jako PWA na urządzeniach mobilnych (iOS, Android)
- Aplikacja działa poprawnie na przeglądarkach desktopowych (Chrome, Firefox, Safari, Edge)
- Aplikacja jest responsywna i dostosowuje się do różnych rozmiarów ekranów
- Aplikacja może być zainstalowana na urządzeniu mobilnym

### 6.3 Kryteria użyteczności

- Użytkownik jest w stanie utworzyć workout w czasie poniżej 1 minuty
- Użytkownik jest w stanie wybrać workout z listy i dodać wynik w czasie poniżej 1 minuty
- Interfejs jest intuicyjny i nie wymaga instrukcji obsługi

### 6.4 Kryteria podstawowe sukcesu (zgodnie z wymaganiami klienta)

- Wyświetlanie daty treningu i przypisanych atletów
- Możliwość dodania workoutu
- Dodanie atlety z wynikiem
- Sortowanie po najlepszych wynikach
- Wyszukiwanie workoutów po dniach dodania
