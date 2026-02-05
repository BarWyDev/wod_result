# Plan Architektury UI - Wod Result MVP

Data utworzenia: 2026-02-05
Wersja: 1.0
Status: Zatwierdzone decyzje projektowe

---

## Decyzje projektowe

1. **Routing**: Aplikacja będzie SPA z React Router, wykorzystując następujące ścieżki:
   - `/` - strona główna (lista workoutów + moje workouty)
   - `/workout/create` - formularz tworzenia workoutu
   - `/workout/:id` - strona workoutu z wynikami
   - `/404` - strona nie znaleziono

2. **Biblioteka UI**: Headless UI + Tailwind CSS dla szybkiej implementacji z małym bundle size i pełną kontrolą nad stylingiem

3. **Filtrowanie wyników według płci**: Segmented control (tabs/buttons) z trzema opcjami: "Wszyscy" | "Mężczyźni" | "Kobiety", domyślnie "Wszyscy"

4. **Filtrowanie workoutów po dacie**: Zawsze widoczne jako horizontalne pills/chips: [Dziś] [7 dni] [30 dni] [Wszystkie], z horizontal scroll na mobile

5. **Lista "moje workouty"**: Osobna sekcja na tej samej stronie głównej, poniżej publicznej listy workoutów (pod sobą na mobile, obok na desktop)

6. **Edycja wyniku**: Modal (overlay) z prepopulated formularzem, zachowujący kontekst rankingu w tle

7. **Zarządzanie tokenami**: Struktura localStorage zgodna z db-plan.md:
   ```typescript
   {
     myWorkouts: [{workoutId, ownerToken, participated}],
     myResults: [{resultId, resultToken}]
   }
   ```

8. **Strategia aktualizacji**: Standardowy flow z loading state i potwierdzeniem z backendu (bez optimistic updates)

9. **Komunikaty błędów/sukcesu**:
   - Błędy walidacji: inline messages pod polami
   - Operacje CRUD: toast notifications (react-hot-toast)
   - Błędy krytyczne: inline message w miejscu treści

10. **Wyświetlanie kierunku sortowania**: Prominent text header z emoji nad listą wyników:
    - "🎯 Cel: Najwyższy wynik" (desc)
    - "⏱️ Cel: Najniższy czas" (asc)
    - Sticky header na mobile przy scrollowaniu

---

## Dopasowane rekomendacje

1. **React Router dla publicznych linków**: Routing URL jest konieczny dla realizacji FR-003 (publiczne URL workoutów) i zapewnia lepsze UX przy nawigacji przeglądarki (wstecz/dalej)

2. **Tailwind CSS + Headless UI**: Optymalna kombinacja dla MVP - Tailwind zapewnia szybkie prototypowanie i responsywność, Headless UI dostarcza accessible komponenty (modals, selects) bez narzucania stylów, oba dobrze współpracują z Vite

3. **Segmented control zamiast dropdown**: Dla maksymalnie 3 opcji (Wszyscy/Mężczyźni/Kobiety) segmented control jest bardziej intuicyjny, zapewnia natychmiastowy visual feedback i jest touch-friendly na mobile devices

4. **Persistent date filter**: Filtrowanie po dacie to główna funkcja nawigacji (FR-016, US-011) używana często przez użytkowników, więc powinna być dostępna bez dodatkowego kliknięcia

5. **Unified home page**: Zachowanie publicznej listy i "moich workoutów" na jednej stronie ułatwia szybki dostęp i discovery, zgodnie z mental model użytkownika (US-010)

6. **Modal dla edycji**: Edycja wyniku to rzadka operacja wymagająca uwagi - modal zapewnia focus, zachowuje kontekst (ranking widoczny w tle) i jest zgodny z mobile UX patterns

7. **Structured token storage**: Separacja tokenów według typu (workout vs result) umożliwia szybkie sprawdzenie uprawnień w UI bez dodatkowych API calls i zapewnia clean architecture

8. **Standard flow bez optimistic updates**: Dla MVP standardowy flow redukuje complexity (brak rollback logic, error recovery) przy minimalnym koszcie UX - loading indicators są wystarczające dla rzadkich operacji CRUD

9. **Contextual error handling**: Różne typy komunikatów dla różnych scenariuszy - inline dla walidacji (immediate feedback), toast dla operacji (non-blocking), inline critical dla system errors

10. **Visual goal indication**: Emoji + text header zapewnia szybką identyfikację wizualną celu workoutu (wyższy vs niższy), szczególnie istotne dla nowych użytkowników i zgodne z US-017

---

## Szczegółowe podsumowanie architektury UI

### 1. Główne wymagania architektury UI

#### 1.1 Progressive Web App (PWA)
- Możliwość instalacji na urządzeniach mobilnych i desktopowych
- Tryb standalone (bez paska adresu przeglądarki)
- Service Worker dla offline capabilities (vite-plugin-pwa)
- Web App Manifest z ikoną i nazwą "Wod Result"

#### 1.2 Responsywność
- Mobile-first approach (od 320px szerokości)
- Breakpoints: mobile (<768px), tablet (768-1024px), desktop (>1024px)
- Touch-friendly elementy na mobile (min 44x44px tap targets)
- Horizontal scroll dla pills/chips na małych ekranach

#### 1.3 Performance
- Bundle size optimization (Tailwind CSS purge, code splitting)
- Lazy loading dla routes (React.lazy + Suspense)
- Minimalna liczba re-renders (React.memo dla list items)
- Vite dla fast HMR i optimized production builds

### 2. Kluczowe widoki i ekrany

#### 2.1 Strona główna (`/`)

**Layout:**
```
┌─────────────────────────────┐
│ Header + Logo + CTA Create  │
├─────────────────────────────┤
│ Date Filter Pills           │
├─────────────────────────────┤
│ Public Workouts List        │
│ - Date, Description preview │
│ - Result count              │
├─────────────────────────────┤
│ My Workouts Section         │
│ - Same format as public     │
│ - Empty state if none       │
└─────────────────────────────┘
```

**Funkcjonalności:**
- Przycisk "Utwórz workout" (prominent CTA)
- Filtrowanie po dacie: Dziś | 7 dni | 30 dni | Wszystkie
- Publiczna lista workoutów (sortowana od najnowszych)
- Sekcja "Moje workouty" (z localStorage)
- Empty states dla pustych list (US-022)
- Infinite scroll lub pagination dla długich list

**Mobile adaptacja:**
- Sekcje pod sobą (public list, then my workouts)
- Horizontal scroll dla date filter
- Swipeable cards dla workout items

**Desktop adaptacja:**
- Sekcje obok siebie (2 kolumny: 60% public, 40% my workouts)
- Wszystkie filtry w jednym wierszu
- Hover states dla workout cards

#### 2.2 Formularz tworzenia workoutu (`/workout/create`)

**Layout:**
```
┌─────────────────────────────┐
│ Header + Back button        │
├─────────────────────────────┤
│ Form:                       │
│ - Description (textarea)    │
│ - Date picker (optional)    │
│ - Sort direction (radio)    │
│   ○ Najwyższy wynik wygrywa │
│   ○ Najniższy czas wygrywa  │
│ - Submit button             │
└─────────────────────────────┘
```

**Funkcjonalności:**
- Textarea dla opisu (wieloliniowy, bez limitu w UI)
- Date picker z defaultem na dziś, możliwość wyboru wstecz (FR-004)
- Radio buttons dla sort_direction (wymagany wybór)
- Walidacja: description (required), date (≤ today), sort_direction (required)
- Po submit: generacja owner_token, zapis do localStorage, redirect do `/workout/:id`

**Walidacja:**
- Client-side: HTML5 validation + custom messages (US-018)
- Server-side: Backend validation z error messages w toast

#### 2.3 Strona workoutu (`/workout/:id`)

**Layout:**
```
┌─────────────────────────────┐
│ Header + Back + Delete btn  │
├─────────────────────────────┤
│ Workout Info Card           │
│ - Date                      │
│ - Description (full)        │
│ - Goal indicator (emoji+txt)│
├─────────────────────────────┤
│ Gender Filter (Segmented)   │
│ [Wszyscy][Mężczyźni][Kobiety]│
├─────────────────────────────┤
│ Results Ranking             │
│ 1. Name | Result | Actions  │
│ 2. Name | Result | Actions  │
│ ...                         │
├─────────────────────────────┤
│ Add Result Form (collapsed) │
│ [+ Dodaj wynik] button      │
└─────────────────────────────┘
```

**Funkcjonalności:**
- Przycisk "Usuń workout" (tylko dla owner, z owner_token validation)
- Wyświetlanie pełnego opisu z formatowaniem (nowe linie)
- Goal indicator sticky na mobile przy scroll
- Gender filter: segmented control, default "Wszyscy"
- Ranking z pozycjami, re-calculated per filter
- Actions (Edit/Delete) tylko dla własnych wyników (result_token)
- Formularz dodawania wyniku (expandable lub zawsze widoczny)
- Empty state "Brak wyników. Bądź pierwszy!" (US-021)
- 404 handling dla nieistniejącego workout (US-016)

**Ranking display:**
- Column: Position | Name | Gender icon | Result value | Actions
- Mobile: Stack columns, swipeable actions
- Desktop: Table layout, hover actions
- Highlight własnego wyniku (different bg color)

**Add Result Form:**
```
┌─────────────────────────────┐
│ Name/Nickname (input)       │
│ Gender (radio: M/F)         │
│ Result (input, freeform)    │
│ [Anuluj] [Zapisz]           │
└─────────────────────────────┘
```

#### 2.4 Modal edycji wyniku

**Layout:**
```
┌─────────────────────────────┐
│ [X] Edytuj wynik            │
├─────────────────────────────┤
│ Name (prepopulated)         │
│ Gender (prepopulated)       │
│ Result (prepopulated)       │
│                             │
│ [Anuluj] [Zapisz zmiany]    │
└─────────────────────────────┘
```

**Funkcjonalności:**
- Overlay z backdrop
- Prepopulated fields z aktualnymi wartościami
- Same validation jako add result
- Close on backdrop click lub ESC key
- Loading state podczas save

#### 2.5 Strona 404

**Layout:**
```
┌─────────────────────────────┐
│ Header                      │
├─────────────────────────────┤
│ 🏋️ Workout nie znaleziony    │
│                             │
│ [Wróć do strony głównej]    │
└─────────────────────────────┘
```

### 3. Strategia integracji z API i zarządzania stanem

#### 3.1 API Integration

**HTTP Client:**
- Axios lub native fetch z wrapper
- Base URL z environment variable
- Request interceptor dla headers
- Response interceptor dla error handling

**API Endpoints:**
```typescript
// Workouts
POST   /api/workouts          → { workoutId, ownerToken }
GET    /api/workouts          → { workouts: [...] }
GET    /api/workouts/:id      → { workout: {...} }
DELETE /api/workouts/:id      → (owner_token in body/header)

// Results
POST   /api/results           → { resultId, resultToken }
GET    /api/results/:workoutId → { results: [...] }
PUT    /api/results/:id       → (result_token in body/header)
DELETE /api/results/:id       → (result_token in body/header)
```

**Query Parameters:**
- Date filter: `?date_from=YYYY-MM-DD`
- Gender filter: client-side (nie server-side)

#### 3.2 State Management

**Podejście:**
- **React Context** dla global state (user tokens, current workout)
- **React Query** lub **SWR** dla server state (cache, refetch, mutations)
- **useState** dla local component state (form inputs, UI toggles)
- **localStorage** dla persistence (my workouts, tokens)

**Contexts:**
```typescript
// AuthContext - zarządzanie tokenami
{
  myWorkouts: WorkoutOwnership[],
  myResults: ResultOwnership[],
  addWorkout: (workoutId, ownerToken) => void,
  addResult: (resultId, resultToken) => void,
  isWorkoutOwner: (workoutId) => boolean,
  isResultOwner: (resultId) => boolean
}

// ToastContext - notification system
{
  showToast: (message, type) => void
}
```

**React Query usage:**
```typescript
// Lista workoutów
const { data, isLoading } = useQuery(
  ['workouts', dateFilter],
  () => fetchWorkouts(dateFilter)
)

// Wyniki workoutu
const { data: results } = useQuery(
  ['results', workoutId],
  () => fetchResults(workoutId)
)

// Mutations
const createWorkout = useMutation(
  (data) => api.createWorkout(data),
  {
    onSuccess: (data) => {
      // Save to localStorage
      // Navigate to workout page
      // Invalidate workouts query
    }
  }
)
```

#### 3.3 Token Management

**Flow tworzenia workoutu:**
1. User wypełnia formularz
2. POST /api/workouts → backend zwraca { workoutId, ownerToken }
3. Frontend zapisuje do localStorage: `myWorkouts.push({ workoutId, ownerToken, participated: false })`
4. Redirect do `/workout/:workoutId`

**Flow dodawania wyniku:**
1. User wypełnia formularz z name, gender, result
2. POST /api/results → backend zwraca { resultId, resultToken }
3. Frontend zapisuje do localStorage:
   - `myResults.push({ resultId, resultToken })`
   - Update `myWorkouts[workoutId].participated = true`
4. Refresh results list

**Authorization checks:**
```typescript
// Sprawdzenie czy user może usunąć workout
const canDeleteWorkout = (workoutId: string) => {
  return myWorkouts.find(w => w.workoutId === workoutId)?.ownerToken
}

// Sprawdzenie czy user może edytować wynik
const canEditResult = (resultId: string) => {
  return myResults.find(r => r.resultId === resultId)?.resultToken
}
```

#### 3.4 Client-side filtering

**Gender filter:**
- Server zwraca wszystkie wyniki
- Client filtruje w komponencie:
```typescript
const filteredResults = results.filter(r =>
  genderFilter === 'all' || r.gender === genderFilter
)
```
- Re-calculate ranking positions po filtrze

**Sortowanie:**
- Server zwraca już posortowane wyniki (result_numeric ASC/DESC NULLS LAST)
- Client tylko wyświetla w kolejności

### 4. Responsywność, dostępność i bezpieczeństwo

#### 4.1 Responsywność

**Breakpoints (Tailwind):**
```css
sm: 640px   /* tablets */
md: 768px   /* small desktops */
lg: 1024px  /* desktops */
xl: 1280px  /* large desktops */
```

**Mobile-first strategy:**
- Base styles dla mobile (<640px)
- Progressive enhancement dla większych ekranów
- Touch targets min 44x44px (WCAG AAA)
- Horizontal scroll z scroll-snap dla pills/chips
- Collapsible sections dla długich treści

**Component adaptations:**
- Lists: Cards na mobile, table na desktop
- Forms: Full-width na mobile, max-width na desktop
- Modals: Full-screen na mobile, centered overlay na desktop
- Navigation: Bottom nav na mobile, top nav na desktop

#### 4.2 Dostępność (WCAG 2.1 Level AA)

**Semantic HTML:**
- Proper heading hierarchy (h1 → h2 → h3)
- `<nav>`, `<main>`, `<article>`, `<section>` landmarks
- `<button>` zamiast `<div onClick>`
- `<form>` z proper labels

**Keyboard navigation:**
- Tab order logiczny
- Focus indicators (outline)
- Escape key zamyka modals
- Enter submits forms

**Screen readers:**
- `aria-label` dla icon buttons
- `aria-live` dla dynamic content (toasts, results update)
- `role="alert"` dla error messages
- `alt` text dla images (logo)

**Color contrast:**
- Minimum 4.5:1 dla normal text
- Minimum 3:1 dla large text
- Icons nie tylko kolorem (+ emoji/text)

**Forms:**
- Labels connected z inputs (`htmlFor`)
- Error messages z `aria-describedby`
- Required fields z `aria-required` lub HTML5 `required`

#### 4.3 Bezpieczeństwo

**Client-side:**
- XSS prevention: React escapes by default, unikać `dangerouslySetInnerHTML`
- Input sanitization: Trim whitespace, validate length
- Token storage: localStorage (vulnerable to XSS, but no sensitive PII)
- HTTPS only (enforced by manifest.json)

**Token expiry:**
- Brak expiry w MVP (tokens valid indefinitely)
- Przyszłość: Consider token refresh mechanism

**Rate limiting:**
- Backend responsibility (Express middleware)
- Frontend: Disable buttons po submit (prevent double-submit)
- UI feedback during loading

**CORS:**
- Backend configured dla proper CORS headers
- Credentials: 'include' jeśli używamy cookies (nie w MVP)

### 5. Component Architecture

#### 5.1 Component hierarchy

```
App
├── Router
│   ├── HomePage
│   │   ├── Header (+ CreateWorkoutButton)
│   │   ├── DateFilter
│   │   ├── WorkoutList (public)
│   │   │   └── WorkoutCard[]
│   │   └── MyWorkoutsSection
│   │       └── WorkoutCard[]
│   ├── CreateWorkoutPage
│   │   ├── Header
│   │   └── WorkoutForm
│   ├── WorkoutDetailPage
│   │   ├── Header (+ DeleteButton)
│   │   ├── WorkoutInfoCard
│   │   ├── GenderFilter
│   │   ├── ResultsRanking
│   │   │   └── ResultRow[]
│   │   └── AddResultForm
│   └── NotFoundPage
├── EditResultModal
├── ToastContainer
└── ConfirmDialog
```

#### 5.2 Reusable components

**Button:**
```typescript
<Button
  variant="primary|secondary|danger"
  size="sm|md|lg"
  loading={boolean}
  disabled={boolean}
  onClick={handler}
>
  {children}
</Button>
```

**Input:**
```typescript
<Input
  label={string}
  type="text|date|number"
  value={string}
  onChange={handler}
  error={string|undefined}
  required={boolean}
/>
```

**Card:**
```typescript
<Card
  onClick={handler}
  hoverable={boolean}
>
  {children}
</Card>
```

**Modal (Headless UI Dialog):**
```typescript
<Modal
  isOpen={boolean}
  onClose={handler}
  title={string}
>
  {children}
</Modal>
```

**Toast (react-hot-toast):**
```typescript
toast.success('Wynik dodany!')
toast.error('Nie udało się usunąć workoutu')
toast.loading('Zapisywanie...')
```

#### 5.3 Form handling

**Library:** React Hook Form dla validation i state management

```typescript
const { register, handleSubmit, formState: { errors } } = useForm({
  defaultValues: {
    description: '',
    workout_date: new Date(),
    sort_direction: 'desc'
  }
})

const onSubmit = async (data) => {
  try {
    const result = await createWorkout(data)
    // Success handling
  } catch (error) {
    // Error handling
  }
}
```

### 6. PWA Implementation

#### 6.1 Manifest (vite-plugin-pwa)

```json
{
  "name": "Wod Result",
  "short_name": "Wod Result",
  "description": "Porównuj wyniki workoutów z innymi atletami",
  "theme_color": "#4F46E5",
  "background_color": "#FFFFFF",
  "display": "standalone",
  "start_url": "/",
  "icons": [
    {
      "src": "/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icon-512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

#### 6.2 Service Worker strategy

**vite-plugin-pwa config:**
```typescript
VitePWA({
  registerType: 'autoUpdate',
  workbox: {
    globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
    runtimeCaching: [
      {
        urlPattern: /^https:\/\/api\.wodresult\.com\/.*/i,
        handler: 'NetworkFirst',
        options: {
          cacheName: 'api-cache',
          expiration: {
            maxEntries: 50,
            maxAgeSeconds: 60 * 60 // 1 hour
          }
        }
      }
    ]
  }
})
```

**Offline handling:**
- Static assets: cached na install
- API requests: NetworkFirst (fallback to cache)
- Offline indicator w UI
- "Brak połączenia" message przy failed requests

### 7. Performance Optimization

#### 7.1 Bundle optimization

- Code splitting per route (React.lazy)
- Tree shaking (Vite default)
- Tailwind purge (remove unused classes)
- Image optimization (WebP, lazy loading)
- SVG sprites dla icons

#### 7.2 Rendering optimization

- React.memo dla expensive components (ResultRow)
- useMemo dla filtered/sorted lists
- useCallback dla event handlers w lists
- Virtual scrolling jeśli >100 wyników (react-window)

#### 7.3 Data fetching

- React Query cache (5 min default)
- Stale-while-revalidate strategy
- Prefetch na hover (workout cards)
- Debounce dla search/filters (jeśli dodane w przyszłości)

---

## Nierozwiązane kwestie

1. **Infinite scroll vs Pagination dla listy workoutów**:
   - Nie ustalono jak obsługiwać długie listy workoutów (>50 items)
   - Opcje: pagination (numery stron), infinite scroll (lazy load), "Load more" button
   - Rekomendacja: Infinite scroll dla mobile, pagination dla desktop

2. **Timezone handling dla workout_date**:
   - Nie określono jak wyświetlać daty dla użytkowników z różnych stref czasowych
   - Backend przechowuje DATE (bez timezone), frontend wyświetla w lokalnym timezone
   - Potencjalny problem: workout utworzony 23:00 UTC może pokazywać się jako "jutro" dla użytkownika w Azji
   - Wymaga decyzji: Server timezone (UTC) vs Client timezone

3. **Handling duplikatów athlete_name**:
   - Brak mechanizmu zapobiegającego wielu wynikom od tej samej osoby (samo imię)
   - US-011 nie adresuje tego przypadku
   - Opcje: allowować (MVP), blokować przez result_token, unique constraint na (workout_id, athlete_name)
   - Decyzja z db-plan.md: "Pozostawić bez ograniczenia w MVP, monitorować abuse"

4. **Empty state dla filtrów zwracających 0 wyników**:
   - Np. workout tylko z mężczyznami, user wybiera filter "Kobiety"
   - Wymaga komunikatu: "Brak wyników dla wybranego filtra" vs "Brak wyników"
   - Rekomendacja: Different empty state message w zależności od kontekstu

5. **Edycja workoutu przez owner**:
   - PRD nie wspomina o edycji opisu/daty workoutu
   - Tylko usuwanie (FR-005)
   - Pytanie: Czy dodać feature edycji w przyszłości? Jeśli tak, to modal czy osobna strona?
   - MVP: Brak edycji, tylko delete

6. **Pull-to-refresh gesture na mobile**:
   - Standardowy mobile pattern dla odświeżania listy
   - Nie określono czy implementować
   - Rekomendacja: Dodać dla lepszego UX na mobile (native feel)

7. **Share functionality**:
   - PRD wspomina "Kody/linki do udostępniania - poza zakresem MVP"
   - Jednak workout ma publiczny URL
   - Pytanie: Czy dodać Web Share API button dla łatwego udostępniania?
   - Opcja: "📤 Udostępnij" button kopiujący URL lub używający navigator.share()

8. **Sorting direction change przez użytkownika**:
   - Obecnie sort_direction jest set przy tworzeniu workoutu
   - Nie ma możliwości zmiany później
   - Edge case: Owner popełnił błąd przy tworzeniu
   - Rozwiązanie MVP: Brak edycji, trzeba usunąć i utworzyć nowy workout

9. **Result value format hints**:
   - Pole wyniku to freeform text
   - Użytkownicy mogą nie wiedzieć jaki format wprowadzić
   - Opcje: Placeholder text ("np. 45 reps, 3:25"), przykłady pod polem, smart input z suggestions
   - Rekomendacja: Placeholder text wystarczający dla MVP

10. **Confirmation dialogs consistency**:
    - US-008 i US-009 wymagają potwierdzenia dla delete
    - Nie określono jak wyświetlać: native confirm(), custom modal, inline expansion
    - Rekomendacja: Custom modal dla spójności z design system i lepszego UX

---

## Następne kroki

1. **Utworzenie projektu React + Vite**
   - Inicjalizacja projektu: `npm create vite@latest`
   - Instalacja zależności: React Router, Headless UI, Tailwind CSS, React Query, React Hook Form, react-hot-toast

2. **Konfiguracja PWA**
   - Setup vite-plugin-pwa
   - Utworzenie manifest.json
   - Przygotowanie ikon (192x192, 512x512)

3. **Setup routing structure**
   - Utworzenie podstawowych pages
   - Konfiguracja React Router
   - Implementacja 404 page

4. **Implementacja localStorage service**
   - AuthContext dla zarządzania tokenami
   - Utility functions dla CRUD operations na myWorkouts/myResults

5. **Setup API client**
   - Axios/fetch wrapper z interceptors
   - Environment variables dla API URL
   - Error handling utilities

6. **Implementacja UI components**
   - Design system: kolory, typography, spacing
   - Reusable components (Button, Input, Card, Modal)
   - Toast notification setup

7. **Implementacja stron MVP**
   - HomePage z listami workoutów
   - CreateWorkoutPage z formularzem
   - WorkoutDetailPage z rankingiem
   - EditResultModal

8. **Testowanie responsywności**
   - Mobile (320px-640px)
   - Tablet (640px-1024px)
   - Desktop (>1024px)

9. **Testowanie dostępności**
   - Keyboard navigation
   - Screen reader compatibility
   - WCAG 2.1 Level AA compliance

10. **PWA testing**
    - Instalacja na różnych platformach
    - Offline functionality
    - Manifest validation

---

**Koniec dokumentu planu architektury UI**
