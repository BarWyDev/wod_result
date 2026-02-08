# Schemat Bazy Danych - Wod Result

## 1. Tabele

### 1.1 Tabela: `workouts`

Przechowuje informacje o utworzonych workoutach.

| Kolumna | Typ danych | Ograniczenia | Opis |
|---------|-----------|--------------|------|
| `id` | `UUID` | `PRIMARY KEY DEFAULT gen_random_uuid()` | Unikalny identyfikator workoutu |
| `owner_token` | `UUID` | `NOT NULL` | Token identyfikujący twórcę workoutu |
| `description` | `TEXT` | `NOT NULL` | Opis treningu (bez limitu długości) |
| `workout_date` | `DATE` | `NOT NULL DEFAULT CURRENT_DATE, CHECK (workout_date <= CURRENT_DATE)` | Data wykonania workoutu (nie może być w przyszłości) |
| `sort_direction` | `VARCHAR(4)` | `NOT NULL DEFAULT 'desc', CHECK (sort_direction IN ('asc', 'desc'))` | Kierunek sortowania wyników |
| `workout_type` | `VARCHAR(20)` | `NULLABLE, CHECK (workout_type IS NULL OR workout_type IN ('for_time', 'amrap', 'emom', 'tabata', 'chipper', 'ladder', 'load', 'custom'))` | Typ workoutu (for_time, amrap, emom, tabata, chipper, ladder, load, custom) |
| `result_unit` | `VARCHAR(20)` | `NULLABLE, CHECK (result_unit IS NULL OR result_unit IN ('time', 'rounds', 'reps', 'weight', 'custom'))` | Jednostka wyniku (time, rounds, reps, weight, custom) |
| `created_at` | `TIMESTAMP WITH TIME ZONE` | `NOT NULL DEFAULT NOW()` | Timestamp utworzenia rekordu |
| `updated_at` | `TIMESTAMP WITH TIME ZONE` | `NOT NULL DEFAULT NOW()` | Timestamp ostatniej modyfikacji |

**Indeksy:**
- `PRIMARY KEY` na `id`
- B-tree index na `workout_date` (nazwa: `idx_workouts_workout_date`)
- B-tree index na `created_at DESC` (nazwa: `idx_workouts_created_at_desc`)
- B-tree index na `workout_type` (nazwa: `idx_workouts_type`)

**Uwagi:**
- `owner_token` jest generowany przez backend (UUID v4) przy tworzeniu workoutu
- `sort_direction`: 'asc' = niższy wynik wygrywa, 'desc' = wyższy wynik wygrywa
- `workout_date` ma CHECK constraint zapobiegający datom z przyszłości zgodnie z US-012
- `workout_type` i `result_unit` są nullable dla zachowania kompatybilności wstecznej (NULL = custom)
- Jeśli `workout_type` jest ustawiony, `sort_direction` i `result_unit` są automatycznie określane przez backend
- Typy workoutów: for_time, amrap, emom, tabata, chipper, ladder, load, custom
- Jednostki wyników: time, rounds, reps, weight, custom

---

### 1.2 Tabela: `results`

Przechowuje wyniki atletów dla poszczególnych workoutów.

| Kolumna | Typ danych | Ograniczenia | Opis |
|---------|-----------|--------------|------|
| `id` | `UUID` | `PRIMARY KEY DEFAULT gen_random_uuid()` | Unikalny identyfikator wyniku |
| `workout_id` | `UUID` | `NOT NULL, FOREIGN KEY REFERENCES workouts(id) ON DELETE CASCADE` | ID workoutu, do którego należy wynik |
| `result_token` | `UUID` | `NOT NULL` | Token identyfikujący właściciela wyniku |
| `athlete_name` | `VARCHAR(255)` | `NOT NULL` | Imię lub pseudonim atlety |
| `gender` | `CHAR(1)` | `NOT NULL, CHECK (gender IN ('M', 'F'))` | Płeć atlety: M (mężczyzna), F (kobieta) |
| `result_value` | `TEXT` | `NOT NULL` | Oryginalna wartość wyniku wprowadzona przez użytkownika |
| `result_numeric` | `NUMERIC` | `NULLABLE` | Wyekstrahowana wartość liczbowa do sortowania |
| `created_at` | `TIMESTAMP WITH TIME ZONE` | `NOT NULL DEFAULT NOW()` | Timestamp utworzenia rekordu |
| `updated_at` | `TIMESTAMP WITH TIME ZONE` | `NOT NULL DEFAULT NOW()` | Timestamp ostatniej modyfikacji |

**Indeksy:**
- `PRIMARY KEY` na `id`
- Composite B-tree index na `(workout_id, result_numeric)` (nazwa: `idx_results_workout_numeric`)
- B-tree index na `workout_id` (nazwa: `idx_results_workout_id`)

**Uwagi:**
- `result_token` jest generowany przez backend (UUID v4) przy dodawaniu wyniku
- `result_value` przechowuje oryginalną wartość tekstową (np. "45 reps", "3:25", "DNF")
- `result_numeric` zawiera wartość liczbową wyekstrahowaną przez backend dla celów sortowania
- Wartości nieliczbowe mają `result_numeric = NULL` i są sortowane na końcu listy (NULLS LAST)
- `athlete_name` ma limit 255 znaków dla ochrony przed nadmiernie długimi wartościami

---

## 2. Relacje między tabelami

### `workouts` ↔ `results`

**Typ relacji:** One-to-Many (1:N)

- Jeden workout może mieć wiele wyników (results)
- Każdy wynik (result) należy do dokładnie jednego workoutu

**Implementacja:**
- Klucz obcy `workout_id` w tabeli `results` wskazuje na `id` w tabeli `workouts`
- Kaskadowe usuwanie: `ON DELETE CASCADE`
  - Usunięcie workoutu automatycznie usuwa wszystkie powiązane wyniki
  - Zgodne z FR-005: "Twórca workoutu ma możliwość usunięcia workoutu wraz ze wszystkimi przypisanymi wynikami"

---

## 3. Indeksy

### 3.1 Indeksy na tabeli `workouts`

| Nazwa indeksu | Typ | Kolumny | Cel |
|---------------|-----|---------|-----|
| `workouts_pkey` | PRIMARY KEY | `id` | Unikalność i szybkie wyszukiwanie po ID |
| `idx_workouts_workout_date` | B-tree | `workout_date` | Optymalizacja filtrowania po dacie (FR-016: Dziś, Ostatnie 7 dni, Ostatnie 30 dni) |
| `idx_workouts_created_at_desc` | B-tree | `created_at DESC` | Szybkie pobieranie najnowszych workoutów na stronie głównej (US-002) |

### 3.2 Indeksy na tabeli `results`

| Nazwa indeksu | Typ | Kolumny | Cel |
|---------------|-----|---------|-----|
| `results_pkey` | PRIMARY KEY | `id` | Unikalność i szybkie wyszukiwanie po ID |
| `idx_results_workout_numeric` | Composite B-tree | `(workout_id, result_numeric)` | Efektywne sortowanie wyników w ramach workoutu (FR-012) |
| `idx_results_workout_id` | B-tree | `workout_id` | Optymalizacja JOIN operations i filtrowania wyników po workout_id |

**Uzasadnienie composite index:**
- Index `(workout_id, result_numeric)` pokrywa najbardziej krytyczne zapytanie: pobieranie i sortowanie wyników dla konkretnego workoutu
- PostgreSQL może użyć tego indeksu zarówno dla filtrowania po `workout_id`, jak i sortowania po `result_numeric`

---

## 4. Constraints (Ograniczenia)

### 4.1 Ograniczenia tabeli `workouts`

| Constraint | Typ | Definicja | Cel |
|------------|-----|-----------|-----|
| `workouts_pkey` | PRIMARY KEY | `id` | Unikalność ID workoutu |
| `workouts_owner_token_not_null` | NOT NULL | `owner_token` | Każdy workout musi mieć właściciela |
| `workouts_description_not_null` | NOT NULL | `description` | Opis workoutu jest wymagany |
| `workouts_workout_date_not_null` | NOT NULL | `workout_date` | Data workoutu jest wymagana |
| `workouts_workout_date_check` | CHECK | `workout_date <= CURRENT_DATE` | Zapobiega datom z przyszłości (US-012) |
| `workouts_sort_direction_not_null` | NOT NULL | `sort_direction` | Kierunek sortowania jest wymagany |
| `workouts_sort_direction_check` | CHECK | `sort_direction IN ('asc', 'desc')` | Walidacja dozwolonych wartości |
| `workouts_created_at_not_null` | NOT NULL | `created_at` | Timestamp utworzenia jest wymagany |
| `workouts_updated_at_not_null` | NOT NULL | `updated_at` | Timestamp modyfikacji jest wymagany |

### 4.2 Ograniczenia tabeli `results`

| Constraint | Typ | Definicja | Cel |
|------------|-----|-----------|-----|
| `results_pkey` | PRIMARY KEY | `id` | Unikalność ID wyniku |
| `results_workout_id_fkey` | FOREIGN KEY | `workout_id REFERENCES workouts(id) ON DELETE CASCADE` | Integralność referencyjna z kaskadowym usuwaniem |
| `results_workout_id_not_null` | NOT NULL | `workout_id` | Każdy wynik musi być przypisany do workoutu |
| `results_result_token_not_null` | NOT NULL | `result_token` | Każdy wynik musi mieć właściciela |
| `results_athlete_name_not_null` | NOT NULL | `athlete_name` | Imię atlety jest wymagane |
| `results_gender_not_null` | NOT NULL | `gender` | Płeć atlety jest wymagana |
| `results_gender_check` | CHECK | `gender IN ('M', 'F')` | Walidacja dozwolonych wartości płci |
| `results_result_value_not_null` | NOT NULL | `result_value` | Wartość wyniku jest wymagana |
| `results_created_at_not_null` | NOT NULL | `created_at` | Timestamp utworzenia jest wymagany |
| `results_updated_at_not_null` | NOT NULL | `updated_at` | Timestamp modyfikacji jest wymagany |

---

## 5. Triggers (Wyzwalacze)

### 5.1 Trigger: `update_workouts_updated_at`

**Cel:** Automatyczna aktualizacja pola `updated_at` w tabeli `workouts` przy każdej modyfikacji rekordu.

**Funkcja:**
```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

**Trigger:**
```sql
CREATE TRIGGER update_workouts_updated_at
    BEFORE UPDATE ON workouts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
```

### 5.2 Trigger: `update_results_updated_at`

**Cel:** Automatyczna aktualizacja pola `updated_at` w tabeli `results` przy każdej modyfikacji rekordu.

**Trigger:**
```sql
CREATE TRIGGER update_results_updated_at
    BEFORE UPDATE ON results
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
```

**Uwagi:**
- Funkcja `update_updated_at_column()` jest współdzielona przez oba triggery
- Triggery działają na poziomie bazy danych, eliminując potrzebę zarządzania `updated_at` w aplikacji
- Zwiększa to spójność danych i redukuje ryzyko błędów

---

## 6. Row-Level Security (RLS)

**Decyzja:** RLS nie jest implementowany w MVP.

**Uzasadnienie:**
- Aplikacja nie posiada systemu uwierzytelniania użytkowników
- Kontrola dostępu jest zarządzana na poziomie aplikacji Express
- Tokeny (owner_token, result_token) są walidowane w backendzie przed wykonaniem operacji

**Logika kontroli dostępu w aplikacji:**

### 6.1 Usuwanie workoutu
- Backend waliduje, czy `owner_token` z requesta pasuje do `owner_token` w bazie dla danego workoutu
- Jeśli tak: operacja DELETE jest dozwolona
- Jeśli nie: zwracany jest błąd 403 Forbidden

### 6.2 Edycja/usuwanie wyniku
- Backend waliduje, czy `result_token` z requesta pasuje do `result_token` w bazie dla danego wyniku
- Jeśli tak: operacja UPDATE/DELETE jest dozwolona
- Jeśli nie: zwracany jest błąd 403 Forbidden

### 6.3 Publiczny dostęp
- Wszystkie workouty i wyniki są publicznie dostępne do odczytu (GET requests)
- Zgodne z FR-003 i FR-015

---

## 7. Typy danych - uzasadnienie

### 7.1 UUID zamiast SERIAL/BIGSERIAL

**Zalety:**
- Globalnie unikalne ID bez potrzeby centralizacji generowania
- Trudne do odgadnięcia (bezpieczeństwo przez zaciemnienie)
- Możliwość generowania ID po stronie aplikacji
- Brak problemów z kolizjami przy ewentualnej replikacji/shardingu

**Wady:**
- Większy rozmiar (16 bajtów vs 4/8 bajtów dla INT/BIGINT)
- Nieznacznie wolniejsze indeksowanie

**Decyzja:** UUID jest odpowiednie dla tej aplikacji ze względu na publiczny charakter danych i bezpieczeństwo.

### 7.2 NUMERIC zamiast FLOAT/DOUBLE

**Zalety:**
- Precyzyjne przechowywanie wartości dziesiętnych
- Brak problemów z floating-point precision
- Odpowiednie dla wartości sportowych (czasy, powtórzenia, wagi)

**Wady:**
- Nieznacznie wolniejsze operacje arytmetyczne
- Większy rozmiar dla bardzo dużych zakresów

**Decyzja:** NUMERIC jest odpowiednie dla przechowywania wyników sportowych, gdzie precyzja ma znaczenie.

### 7.3 TEXT zamiast VARCHAR dla pól bez ustalonego limitu

**Pola TEXT:**
- `description` (workouts): Opis workoutu może być dowolnej długości
- `result_value` (results): Wyniki mogą mieć różne formaty i długości

**Pola VARCHAR z limitem:**
- `athlete_name` VARCHAR(255): Ochrona przed nadmiernie długimi wartościami

**Decyzja:** TEXT dla flexibilności, VARCHAR z limitem dla ochrony przed abuse.

### 7.4 CHAR(1) dla gender

**Uzasadnienie:**
- Wartość zawsze ma dokładnie 1 znak
- CHAR(1) jest wydajniejszy niż VARCHAR(1)
- CHECK constraint zapewnia walidację wartości ('M' lub 'F')

### 7.5 VARCHAR(4) dla sort_direction

**Uzasadnienie:**
- Wartości: 'asc' (3 znaki), 'desc' (4 znaki)
- VARCHAR(4) jest wystarczający i wydajny
- CHECK constraint zapewnia walidację wartości

**Alternatywa:** Można użyć ENUM type w PostgreSQL:
```sql
CREATE TYPE sort_direction_enum AS ENUM ('asc', 'desc');
```
Jednak VARCHAR z CHECK constraint jest prostszy i wystarczający dla MVP.

### 7.6 TIMESTAMP WITH TIME ZONE

**Uzasadnienie:**
- Poprawne zarządzanie timezone dla użytkowników z różnych stref czasowych
- Automatyczna konwersja do lokalnego timezone klienta
- Best practice dla systemów webowych

---

## 8. Strategia ekstrakcji result_numeric

### 8.1 Algorytm parsowania (implementacja w Express)

Backend powinien implementować następującą logikę przy zapisywaniu wyniku:

1. **Format czasu (mm:ss lub hh:mm:ss):**
   - Regex: `^(\d{1,2}):(\d{2})(?::(\d{2}))?$`
   - Konwersja na sekundy: `hours*3600 + minutes*60 + seconds`
   - Przykład: "3:25" → 205, "1:15:30" → 4530

2. **Format liczbowy (z jednostką lub bez):**
   - Regex: `^(\d+\.?\d*)`
   - Wyciągnięcie pierwszej liczby z tekstu
   - Przykład: "45 reps" → 45, "12.5 kg" → 12.5

3. **Format mieszany:**
   - Priorytet: czas przed liczbą
   - Przykład: "3:25 (45 reps)" → 205

4. **Nieparsowalne wartości:**
   - "DNF", "DNS", "brak wyniku" → `result_numeric = NULL`
   - Wartości NULL są sortowane na końcu listy (PostgreSQL NULLS LAST)

### 8.2 Przykłady konwersji

| result_value | result_numeric | Uwagi |
|--------------|----------------|-------|
| "45 reps" | 45 | Liczba z jednostką |
| "3:25" | 205 | Czas w minutach:sekundach |
| "1:15:30" | 4530 | Czas w godzinach:minutach:sekundach |
| "12.5 kg" | 12.5 | Liczba dziesiętna z jednostką |
| "DNF" | NULL | Nie ukończono |
| "brak" | NULL | Tekstowa wartość |
| "45 reps + 3:25" | 45 | Pierwsza wartość liczbowa |

### 8.3 Sortowanie wyników

**Zapytanie SQL dla sortowania malejącego (desc):**
```sql
SELECT * FROM results
WHERE workout_id = $1
ORDER BY result_numeric DESC NULLS LAST;
```

**Zapytanie SQL dla sortowania rosnącego (asc):**
```sql
SELECT * FROM results
WHERE workout_id = $1
ORDER BY result_numeric ASC NULLS LAST;
```

**Uwagi:**
- `NULLS LAST` zapewnia, że wartości nieliczbowe zawsze są na końcu, niezależnie od kierunku sortowania
- Zgodne z FR-013: "Wyniki zawierające wartości nieliczbowe są umieszczane na końcu listy rankingowej"

---

## 9. Migracje bazy danych

### 9.1 Strategia migracji (Drizzle ORM)

**Podejście:** Początkowa migracja z pełnym schematem.

**Uzasadnienie:**
- Nowy projekt bez istniejącej bazy danych
- Prostsze zarządzanie: jedna migracja tworzy cały schemat
- Łatwiejsze testowanie i deployment

**Struktura plików migracji:**
```
drizzle/
  migrations/
    0000_initial_schema.sql
  meta/
    _journal.json
```

### 9.2 Zawartość początkowej migracji

Migracja powinna zawierać w tej kolejności:
1. Utworzenie tabeli `workouts` z wszystkimi constraints
2. Utworzenie tabeli `results` z wszystkimi constraints i foreign keys
3. Utworzenie indeksów na obu tabelach
4. Utworzenie funkcji `update_updated_at_column()`
5. Utworzenie triggerów dla `updated_at`

### 9.3 Przyszłe migracje

W przyszłości migracje powinny być iteracyjne:
- Jedna zmiana na migrację
- Semantyczne nazwy plików (np. `0001_add_workout_category.sql`)
- Zawsze testować rollback przed deployment

---

## 10. Kwestie wydajnościowe

### 10.1 Optymalizacje zapytań

**Najczęstsze zapytania:**
1. **Lista workoutów na stronie głównej:**
   ```sql
   SELECT * FROM workouts
   WHERE workout_date >= $1  -- filtrowanie po dacie
   ORDER BY created_at DESC
   LIMIT 50;
   ```
   Optymalizacja: index `idx_workouts_created_at_desc`

2. **Wyniki dla workoutu z sortowaniem:**
   ```sql
   SELECT * FROM results
   WHERE workout_id = $1
   ORDER BY result_numeric DESC NULLS LAST;
   ```
   Optymalizacja: composite index `idx_results_workout_numeric`

3. **Filtrowanie wyników po płci:**
   ```sql
   SELECT * FROM results
   WHERE workout_id = $1 AND gender = $2
   ORDER BY result_numeric DESC NULLS LAST;
   ```
   Optymalizacja: composite index `idx_results_workout_numeric` + bitmap index scan

### 10.2 Partycjonowanie (przyszłość)

**Nie wymagane w MVP**, ale możliwe w przyszłości:

**Strategia:** RANGE partitioning tabeli `workouts` po `workout_date`

**Przykład:**
```sql
CREATE TABLE workouts (
  ...
) PARTITION BY RANGE (workout_date);

CREATE TABLE workouts_2025 PARTITION OF workouts
  FOR VALUES FROM ('2025-01-01') TO ('2026-01-01');

CREATE TABLE workouts_2026 PARTITION OF workouts
  FOR VALUES FROM ('2026-01-01') TO ('2027-01-01');
```

**Kiedy rozważyć:**
- Powyżej 1 miliona rekordów w tabeli `workouts`
- Zapytania głównie filtrują po `workout_date`
- Widoczne spowolnienie zapytań pomimo indeksów

### 10.3 Statystyki i vacuum

**Zalecenia:**
- Włączenie auto-vacuum (domyślnie aktywne w PostgreSQL)
- Regularna aktualizacja statystyk: `ANALYZE workouts; ANALYZE results;`
- Monitoring rozmiaru tabel i indeksów

---

## 11. Bezpieczeństwo

### 11.1 Ochrona przed SQL Injection

**Mechanizm:** Drizzle ORM

**Zabezpieczenia:**
- Type-safe queries w TypeScript
- Parameterized statements (prepared statements)
- Automatyczna sanityzacja user inputs

**Zasady:**
- Nigdy nie używać raw SQL z interpolacją stringów
- Zawsze używać Drizzle query builder lub parameterized queries

### 11.2 Ochrona przed nadużyciami

**Rate limiting (do zaimplementowania w Express):**
- Limit tworzenia workoutów: 10 per IP per godzinę
- Limit dodawania wyników: 20 per IP per godzinę

**Walidacja długości:**
- `description`: max 5000 znaków (walidacja w Express)
- `athlete_name`: max 255 znaków (constraint w bazie)
- `result_value`: max 100 znaków (walidacja w Express)

### 11.3 Backup strategy

**Zalecenia dla mikr.us VPS:**
- Codzienny backup bazy danych (pg_dump)
- Retencja: 7 dni daily, 4 weekly, 3 monthly
- Przechowywanie backupów poza VPS (np. cloud storage)
- Regularne testowanie przywracania z backupu

**Skrypt backup (przykład):**
```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
pg_dump -U username -h localhost dbname | gzip > /backup/wod_result_$DATE.sql.gz
find /backup -name "wod_result_*.sql.gz" -mtime +7 -delete
```

---

## 12. Struktura LocalStorage (frontend)

### 12.1 Format danych

Aplikacja przechowuje w LocalStorage przeglądarki następujące dane:

```typescript
interface LocalStorageData {
  myWorkouts: {
    workoutId: string;        // UUID workoutu
    ownerToken: string | null; // UUID jeśli użytkownik jest twórcą
    participated: boolean;     // true jeśli dodano wynik
  }[];
  myResults: {
    resultId: string;         // UUID wyniku
    resultToken: string;      // UUID dla autoryzacji edycji/usuwania
  }[];
}
```

### 12.2 Operacje

**Utworzenie workoutu:**
```typescript
// Backend zwraca: { workoutId, ownerToken }
localStorage.setItem('myWorkouts', JSON.stringify([
  ...existing,
  { workoutId, ownerToken, participated: false }
]));
```

**Dodanie wyniku:**
```typescript
// Backend zwraca: { resultId, resultToken }
localStorage.setItem('myResults', JSON.stringify([
  ...existing,
  { resultId, resultToken }
]));

// Aktualizacja participated dla workoutu
updateWorkoutParticipated(workoutId, true);
```

**Usunięcie workoutu:**
```typescript
// Usuń workout z myWorkouts
// Usuń wszystkie results dla tego workoutu z myResults
```

### 12.3 Synchronizacja

**Brak synchronizacji z backendem:**
- LocalStorage jest source of truth dla "moich workoutów"
- Backend nie przechowuje informacji o właścicielach (poza tokenami)
- Utrata LocalStorage = utrata dostępu do edycji/usuwania

**Przyszłość (poza MVP):**
- Eksport/import listy "moich workoutów"
- Synchronizacja przez konto użytkownika

---

## 13. Nierozwiązane kwestie (do dyskusji)

### 13.1 Duplikaty wyników

**Pytanie:** Czy zapobiegać dodawaniu wielu wyników przez tego samego użytkownika (athlete_name) do jednego workoutu?

**Opcje:**
1. **Brak ograniczenia** (current MVP):
   - Pozwala na wiele wyników od tej samej osoby
   - Prostsza implementacja
   - Ryzyko spam/abuse

2. **Ograniczenie przez UNIQUE constraint:**
   ```sql
   ALTER TABLE results ADD CONSTRAINT unique_athlete_per_workout
   UNIQUE (workout_id, athlete_name);
   ```
   - Zapobiega duplikatom
   - Problem: różne osoby mogą mieć to samo imię

3. **Ograniczenie przez result_token:**
   - Jeden result_token = jeden wynik per workout
   - Wymaga sprawdzania w aplikacji

**Rekomendacja:** Pozostawić bez ograniczenia w MVP, monitorować abuse.

### 13.2 Timezone użytkowników

**Pytanie:** Czy `workout_date` powinno uwzględniać timezone użytkownika tworzącego workout?

**Opcje:**
1. **Użycie server timezone (UTC):**
   - Wszystkie daty w UTC
   - Frontend konwertuje do lokalnego timezone klienta
   - Prostsze, spójne

2. **Użycie client timezone:**
   - Backend otrzymuje datę z timezone klienta
   - Przechowywanie w UTC, ale z zachowaniem kontekstu
   - Bardziej złożone

**Rekomendacja:** Opcja 1 - server timezone (UTC), konwersja w frontend.

### 13.3 Soft delete vs hard delete

**Decyzja w MVP:** Hard delete z CASCADE

**Przyszłość (opcjonalnie):**
- Dodanie `deleted_at` TIMESTAMP (nullable) do obu tabel
- Soft delete dla celów audytu
- Automatyczne czyszczenie po N miesiącach

---

## 14. Diagram ERD (Entity Relationship Diagram)

```
┌─────────────────────────────────────────┐
│             workouts                    │
├─────────────────────────────────────────┤
│ PK  id                  UUID            │
│     owner_token         UUID            │
│     description         TEXT            │
│     workout_date        DATE            │
│     sort_direction      VARCHAR(4)      │
│     created_at          TIMESTAMPTZ     │
│     updated_at          TIMESTAMPTZ     │
└─────────────────────────────────────────┘
               │
               │ 1
               │
               │
               │ N
               ▼
┌─────────────────────────────────────────┐
│              results                    │
├─────────────────────────────────────────┤
│ PK  id                  UUID            │
│ FK  workout_id          UUID            │
│     result_token        UUID            │
│     athlete_name        VARCHAR(255)    │
│     gender              CHAR(1)         │
│     result_value        TEXT            │
│     result_numeric      NUMERIC         │
│     created_at          TIMESTAMPTZ     │
│     updated_at          TIMESTAMPTZ     │
└─────────────────────────────────────────┘
```

**Legenda:**
- PK = Primary Key
- FK = Foreign Key
- 1:N = One-to-Many relationship
- ON DELETE CASCADE na workout_id

---

## 15. Podsumowanie decyzji projektowych

### 15.1 Kluczowe założenia

1. **Token-based ownership:** UUID tokeny jako mechanizm identyfikacji bez uwierzytelniania
2. **Dual-field result storage:** result_value (TEXT) + result_numeric (NUMERIC) dla flexibilności i wydajności
3. **Cascade deletion:** ON DELETE CASCADE dla relacji workout-results
4. **Application-level security:** Brak RLS, kontrola dostępu w Express
5. **Hard delete:** Bez soft delete w MVP dla uproszczenia
6. **Temporal data separation:** workout_date (DATE) vs created_at/updated_at (TIMESTAMPTZ)

### 15.2 Optymalizacje wydajnościowe

1. **Strategiczne indeksowanie:**
   - workout_date dla filtrowania dat
   - created_at DESC dla sortowania listy
   - (workout_id, result_numeric) dla sortowania wyników

2. **Type-safe ORM:** Drizzle dla ochrony przed SQL injection

3. **Automatic triggers:** updated_at zarządzane przez bazę danych

### 15.3 Skalowalność

1. **UUID dla globalnej unikalności:** Przygotowanie na przyszły sharding
2. **Partitioning-ready:** Struktura umożliwia łatwe dodanie partycjonowania w przyszłości
3. **Index optimization:** Composite indexes dla najczęstszych zapytań

### 15.4 Bezpieczeństwo

1. **CHECK constraints:** Walidacja danych na poziomie bazy
2. **NOT NULL constraints:** Wymuszenie wymaganych pól
3. **Parameterized queries:** Drizzle ORM automatycznie zabezpiecza przed SQL injection
4. **Rate limiting:** Do zaimplementowania w warstwie aplikacji

---

## 16. Zgodność z wymaganiami

### 16.1 Funkcjonalne wymagania (FR)

| ID | Wymaganie | Implementacja w schemacie |
|----|-----------|---------------------------|
| FR-001 | Tworzenie workoutu z opisem | Tabela `workouts`, pole `description` (TEXT, NOT NULL) |
| FR-002 | Wybór kierunku sortowania | Pole `sort_direction` (VARCHAR(4) z CHECK constraint) |
| FR-003 | Publiczny dostęp do workoutów | Brak RLS, wszystkie rekordy dostępne publicznie |
| FR-004 | Opcjonalna data z domyślną wartością | Pole `workout_date` (DATE, NOT NULL, DEFAULT CURRENT_DATE) |
| FR-005 | Usuwanie workoutu z wynikami | ON DELETE CASCADE na foreign key |
| FR-006 | Bezterminowe przechowywanie | Brak automatycznego usuwania, brak TTL |
| FR-009 | Edycja własnego wyniku | Token-based authorization przez `result_token` |
| FR-010 | Usuwanie własnego wyniku | Token-based authorization przez `result_token` |
| FR-012 | Sortowanie wyników | Pole `result_numeric` z composite index |
| FR-013 | Wyniki nieliczbowe na końcu | `result_numeric = NULL`, PostgreSQL NULLS LAST |
| FR-014 | Filtrowanie po płci | Pole `gender` (CHAR(1) z CHECK constraint) |
| FR-016 | Filtrowanie po dacie | Index `idx_workouts_workout_date` |

### 16.2 Historyjki użytkownika (US)

| ID | Historia | Wsparcie w schemacie |
|----|----------|----------------------|
| US-001 | Tworzenie workoutu | Tabela `workouts`, `owner_token` dla autoryzacji usuwania |
| US-004 | Dodawanie wyniku | Tabela `results`, `result_token` dla autoryzacji edycji |
| US-005 | Ranking wyników | Index `idx_results_workout_numeric` dla wydajnego sortowania |
| US-006 | Filtrowanie po płci | Pole `gender` z CHECK constraint ('M', 'F') |
| US-007 | Edycja wyniku | `result_token` dla identyfikacji właściciela |
| US-008 | Usuwanie wyniku | `result_token` + hard delete |
| US-009 | Usuwanie workoutu | `owner_token` + CASCADE deletion |
| US-011 | Filtrowanie po dacie | Index na `workout_date` |
| US-012 | Data wstecz | CHECK constraint `workout_date <= CURRENT_DATE` |

---

## 17. Przykładowe zapytania SQL

### 17.1 Utworzenie workoutu

```sql
INSERT INTO workouts (owner_token, description, workout_date, sort_direction)
VALUES ($1, $2, $3, $4)
RETURNING id, owner_token, description, workout_date, sort_direction, created_at;
```

### 17.2 Pobranie listy workoutów (strona główna)

```sql
SELECT
  w.id,
  w.description,
  w.workout_date,
  w.sort_direction,
  COUNT(r.id) as result_count
FROM workouts w
LEFT JOIN results r ON w.id = r.workout_id
WHERE w.workout_date >= CURRENT_DATE - INTERVAL '7 days'
GROUP BY w.id
ORDER BY w.created_at DESC
LIMIT 50;
```

### 17.3 Dodanie wyniku

```sql
INSERT INTO results (workout_id, result_token, athlete_name, gender, result_value, result_numeric)
VALUES ($1, $2, $3, $4, $5, $6)
RETURNING id, result_token, athlete_name, gender, result_value, result_numeric, created_at;
```

### 17.4 Pobranie rankingu wyników (sortowanie malejące)

```sql
SELECT
  id,
  athlete_name,
  gender,
  result_value,
  result_numeric,
  ROW_NUMBER() OVER (ORDER BY result_numeric DESC NULLS LAST) as rank
FROM results
WHERE workout_id = $1
ORDER BY result_numeric DESC NULLS LAST;
```

### 17.5 Pobranie rankingu z filtrem płci

```sql
SELECT
  id,
  athlete_name,
  gender,
  result_value,
  result_numeric,
  ROW_NUMBER() OVER (ORDER BY result_numeric DESC NULLS LAST) as rank
FROM results
WHERE workout_id = $1 AND gender = $2
ORDER BY result_numeric DESC NULLS LAST;
```

### 17.6 Edycja wyniku

```sql
UPDATE results
SET
  athlete_name = $1,
  gender = $2,
  result_value = $3,
  result_numeric = $4
WHERE id = $5 AND result_token = $6
RETURNING id, athlete_name, gender, result_value, result_numeric, updated_at;
```

### 17.7 Usunięcie wyniku

```sql
DELETE FROM results
WHERE id = $1 AND result_token = $2
RETURNING id;
```

### 17.8 Usunięcie workoutu (z kaskadowym usunięciem wyników)

```sql
DELETE FROM workouts
WHERE id = $1 AND owner_token = $2
RETURNING id;
```

---

## 18. Checklist implementacji

### 18.1 Migracja początkowa

- [ ] Utworzenie tabeli `workouts`
- [ ] Utworzenie tabeli `results`
- [ ] Utworzenie foreign key z ON DELETE CASCADE
- [ ] Utworzenie indeksów na tabeli `workouts`
- [ ] Utworzenie indeksów na tabeli `results`
- [ ] Utworzenie funkcji `update_updated_at_column()`
- [ ] Utworzenie triggerów dla `updated_at`

### 18.2 Drizzle ORM schema

- [ ] Definicja tabeli `workouts` w Drizzle
- [ ] Definicja tabeli `results` w Drizzle
- [ ] Definicja relacji between tables
- [ ] Definicja TypeScript types/interfaces
- [ ] Konfiguracja Drizzle connection pool

### 18.3 Backend API endpoints

- [ ] POST /api/workouts (create)
- [ ] GET /api/workouts (list with filters)
- [ ] GET /api/workouts/:id (get single)
- [ ] DELETE /api/workouts/:id (with owner_token validation)
- [ ] POST /api/results (create with result_numeric extraction)
- [ ] GET /api/results/:workoutId (list with sorting/filtering)
- [ ] PUT /api/results/:id (with result_token validation)
- [ ] DELETE /api/results/:id (with result_token validation)

### 18.4 Testowanie

- [ ] Test tworzenia workoutu
- [ ] Test usuwania workoutu (CASCADE)
- [ ] Test dodawania wyniku
- [ ] Test edycji wyniku
- [ ] Test usuwania wyniku
- [ ] Test sortowania wyników (ASC/DESC)
- [ ] Test filtrowania po płci
- [ ] Test filtrowania po dacie
- [ ] Test ekstrakcji result_numeric
- [ ] Test autoryzacji (owner_token, result_token)
- [ ] Test constraint violations
- [ ] Performance testing (indeksy)

---

**Koniec dokumentu schematu bazy danych**

Data utworzenia: 2026-02-05
Wersja: 1.0 (MVP)
Status: Gotowy do implementacji
