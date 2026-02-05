# Plan Wdrożenia - Wod Result MVP

Data utworzenia: 2026-02-05
Wersja: 1.0
Status: Gotowy do realizacji

---

## Spis treści

1. [Przegląd projektu](#1-przegląd-projektu)
2. [Faza 1: Inicjalizacja projektu](#faza-1-inicjalizacja-projektu)
3. [Faza 2: Backend - Baza danych](#faza-2-backend---baza-danych)
4. [Faza 3: Backend - API](#faza-3-backend---api)
5. [Faza 4: Frontend - Struktura](#faza-4-frontend---struktura)
6. [Faza 5: Frontend - Komponenty](#faza-5-frontend---komponenty)
7. [Faza 6: Frontend - Strony](#faza-6-frontend---strony)
8. [Faza 7: Integracja Frontend-Backend](#faza-7-integracja-frontend-backend)
9. [Faza 8: PWA](#faza-8-pwa)
10. [Faza 9: Testowanie](#faza-9-testowanie)
11. [Faza 10: Deployment](#faza-10-deployment)
12. [Checklist końcowy](#checklist-końcowy)

---

## 1. Przegląd projektu

### 1.1 Cel
Wod Result to PWA umożliwiająca atletom porównywanie wyników po workoucie.

### 1.2 Stack technologiczny
- **Frontend**: React + Vite + Tailwind CSS + Headless UI
- **Backend**: Node.js + Express + Drizzle ORM
- **Baza danych**: PostgreSQL
- **Hosting**: mikr.us VPS

### 1.3 Struktura katalogów (docelowa)

```
wod_result/
├── .ai/                    # Dokumentacja projektu
├── backend/
│   ├── src/
│   │   ├── db/
│   │   │   ├── schema.ts   # Drizzle schema
│   │   │   ├── index.ts    # DB connection
│   │   │   └── migrations/ # Migracje SQL
│   │   ├── routes/
│   │   │   ├── workouts.ts
│   │   │   └── results.ts
│   │   ├── services/
│   │   │   ├── workoutService.ts
│   │   │   └── resultService.ts
│   │   ├── middleware/
│   │   │   ├── errorHandler.ts
│   │   │   └── rateLimiter.ts
│   │   ├── utils/
│   │   │   └── resultParser.ts
│   │   └── index.ts        # Entry point
│   ├── drizzle.config.ts
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ui/         # Reusable UI components
│   │   │   ├── workout/    # Workout-related components
│   │   │   └── result/     # Result-related components
│   │   ├── pages/
│   │   │   ├── HomePage.tsx
│   │   │   ├── CreateWorkoutPage.tsx
│   │   │   ├── WorkoutDetailPage.tsx
│   │   │   └── NotFoundPage.tsx
│   │   ├── hooks/
│   │   │   ├── useWorkouts.ts
│   │   │   ├── useResults.ts
│   │   │   └── useAuth.ts
│   │   ├── context/
│   │   │   ├── AuthContext.tsx
│   │   │   └── ToastContext.tsx
│   │   ├── services/
│   │   │   └── api.ts
│   │   ├── types/
│   │   │   └── index.ts
│   │   ├── utils/
│   │   │   └── localStorage.ts
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── index.css
│   ├── public/
│   │   ├── icon-192.png
│   │   └── icon-512.png
│   ├── index.html
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   └── package.json
└── README.md
```

---

## Faza 1: Inicjalizacja projektu

### Krok 1.1: Utworzenie struktury projektu
**Czas szacunkowy**: 15 min

**Zadania:**
- [ ] Utworzenie katalogów `backend/` i `frontend/`
- [ ] Inicjalizacja git repository
- [ ] Utworzenie `.gitignore`

**Polecenia:**
```bash
mkdir backend frontend
git init
```

**.gitignore:**
```
node_modules/
dist/
.env
.env.local
*.log
.DS_Store
```

### Krok 1.2: Inicjalizacja backendu
**Czas szacunkowy**: 20 min

**Zadania:**
- [ ] Inicjalizacja projektu Node.js
- [ ] Instalacja zależności
- [ ] Konfiguracja TypeScript
- [ ] Konfiguracja Drizzle ORM

**Polecenia:**
```bash
cd backend
npm init -y
npm install express cors dotenv pg drizzle-orm uuid
npm install -D typescript ts-node @types/node @types/express @types/cors @types/uuid drizzle-kit nodemon
npx tsc --init
```

**package.json scripts:**
```json
{
  "scripts": {
    "dev": "nodemon --exec ts-node src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js",
    "db:generate": "drizzle-kit generate",
    "db:migrate": "drizzle-kit migrate",
    "db:push": "drizzle-kit push"
  }
}
```

### Krok 1.3: Inicjalizacja frontendu
**Czas szacunkowy**: 25 min

**Zadania:**
- [ ] Utworzenie projektu Vite + React + TypeScript
- [ ] Instalacja zależności UI
- [ ] Konfiguracja Tailwind CSS
- [ ] Instalacja dodatkowych bibliotek

**Polecenia:**
```bash
cd frontend
npm create vite@latest . -- --template react-ts
npm install
npm install react-router-dom @headlessui/react @tanstack/react-query react-hook-form react-hot-toast axios
npm install -D tailwindcss postcss autoprefixer @types/react-router-dom
npx tailwindcss init -p
```

**tailwind.config.js:**
```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#EEF2FF',
          100: '#E0E7FF',
          500: '#6366F1',
          600: '#4F46E5',
          700: '#4338CA',
        }
      }
    },
  },
  plugins: [],
}
```

**src/index.css:**
```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

### Krok 1.4: Konfiguracja zmiennych środowiskowych
**Czas szacunkowy**: 10 min

**Zadania:**
- [ ] Utworzenie `.env` dla backendu
- [ ] Utworzenie `.env` dla frontendu

**backend/.env:**
```
PORT=3001
DATABASE_URL=postgresql://user:password@localhost:5432/wod_result
NODE_ENV=development
```

**frontend/.env:**
```
VITE_API_URL=http://localhost:3001/api
```

---

## Faza 2: Backend - Baza danych

### Krok 2.1: Definicja schematu Drizzle
**Czas szacunkowy**: 30 min

**Plik:** `backend/src/db/schema.ts`

**Zadania:**
- [ ] Definicja tabeli `workouts`
- [ ] Definicja tabeli `results`
- [ ] Definicja relacji między tabelami
- [ ] Eksport typów TypeScript

**Zawartość:**
```typescript
import { pgTable, uuid, text, date, varchar, timestamp, numeric, char } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const workouts = pgTable('workouts', {
  id: uuid('id').primaryKey().defaultRandom(),
  ownerToken: uuid('owner_token').notNull(),
  description: text('description').notNull(),
  workoutDate: date('workout_date').notNull().defaultNow(),
  sortDirection: varchar('sort_direction', { length: 4 }).notNull().default('desc'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const results = pgTable('results', {
  id: uuid('id').primaryKey().defaultRandom(),
  workoutId: uuid('workout_id').notNull().references(() => workouts.id, { onDelete: 'cascade' }),
  resultToken: uuid('result_token').notNull(),
  athleteName: varchar('athlete_name', { length: 255 }).notNull(),
  gender: char('gender', { length: 1 }).notNull(),
  resultValue: text('result_value').notNull(),
  resultNumeric: numeric('result_numeric'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const workoutsRelations = relations(workouts, ({ many }) => ({
  results: many(results),
}));

export const resultsRelations = relations(results, ({ one }) => ({
  workout: one(workouts, {
    fields: [results.workoutId],
    references: [workouts.id],
  }),
}));

// Typy TypeScript
export type Workout = typeof workouts.$inferSelect;
export type NewWorkout = typeof workouts.$inferInsert;
export type Result = typeof results.$inferSelect;
export type NewResult = typeof results.$inferInsert;
```

### Krok 2.2: Konfiguracja połączenia z bazą
**Czas szacunkowy**: 15 min

**Plik:** `backend/src/db/index.ts`

**Zadania:**
- [ ] Konfiguracja connection pool
- [ ] Eksport instancji db

**Zawartość:**
```typescript
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export const db = drizzle(pool, { schema });
```

### Krok 2.3: Konfiguracja Drizzle Kit
**Czas szacunkowy**: 10 min

**Plik:** `backend/drizzle.config.ts`

**Zawartość:**
```typescript
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './src/db/schema.ts',
  out: './src/db/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
```

### Krok 2.4: Generacja i uruchomienie migracji
**Czas szacunkowy**: 15 min

**Zadania:**
- [ ] Generacja migracji SQL
- [ ] Utworzenie triggera dla `updated_at`
- [ ] Utworzenie indeksów
- [ ] Uruchomienie migracji

**Polecenia:**
```bash
npm run db:generate
npm run db:push
```

**Dodatkowy SQL (do uruchomienia ręcznie lub przez custom migration):**
```sql
-- Funkcja dla auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggery
CREATE TRIGGER update_workouts_updated_at
    BEFORE UPDATE ON workouts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_results_updated_at
    BEFORE UPDATE ON results
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Indeksy
CREATE INDEX idx_workouts_workout_date ON workouts(workout_date);
CREATE INDEX idx_workouts_created_at_desc ON workouts(created_at DESC);
CREATE INDEX idx_results_workout_id ON results(workout_id);
CREATE INDEX idx_results_workout_numeric ON results(workout_id, result_numeric);

-- CHECK constraints
ALTER TABLE workouts ADD CONSTRAINT workouts_workout_date_check
    CHECK (workout_date <= CURRENT_DATE);
ALTER TABLE workouts ADD CONSTRAINT workouts_sort_direction_check
    CHECK (sort_direction IN ('asc', 'desc'));
ALTER TABLE results ADD CONSTRAINT results_gender_check
    CHECK (gender IN ('M', 'F'));
```

---

## Faza 3: Backend - API

### Krok 3.1: Parser wartości wyników
**Czas szacunkowy**: 30 min

**Plik:** `backend/src/utils/resultParser.ts`

**Zadania:**
- [ ] Implementacja parsowania formatu czasu (mm:ss, hh:mm:ss)
- [ ] Implementacja parsowania liczb z jednostkami
- [ ] Obsługa wartości nieliczbowych (DNF, DNS)

**Zawartość:**
```typescript
/**
 * Parsuje wartość wyniku i zwraca wartość numeryczną do sortowania
 * @param value - oryginalna wartość tekstowa wyniku
 * @returns wartość numeryczna lub null dla wartości nieliczbowych
 */
export function parseResultNumeric(value: string): number | null {
  const trimmed = value.trim();

  // 1. Format czasu hh:mm:ss lub mm:ss
  const timeRegex = /^(\d{1,2}):(\d{2})(?::(\d{2}))?$/;
  const timeMatch = trimmed.match(timeRegex);

  if (timeMatch) {
    const [, first, second, third] = timeMatch;
    if (third !== undefined) {
      // Format hh:mm:ss
      const hours = parseInt(first, 10);
      const minutes = parseInt(second, 10);
      const seconds = parseInt(third, 10);
      return hours * 3600 + minutes * 60 + seconds;
    } else {
      // Format mm:ss
      const minutes = parseInt(first, 10);
      const seconds = parseInt(second, 10);
      return minutes * 60 + seconds;
    }
  }

  // 2. Format liczbowy (pierwsza liczba z tekstu)
  const numberRegex = /^(\d+\.?\d*)/;
  const numberMatch = trimmed.match(numberRegex);

  if (numberMatch) {
    return parseFloat(numberMatch[1]);
  }

  // 3. Wartości nieliczbowe
  return null;
}
```

### Krok 3.2: Middleware
**Czas szacunkowy**: 20 min

**Plik:** `backend/src/middleware/errorHandler.ts`

**Zawartość:**
```typescript
import { Request, Response, NextFunction } from 'express';

export class AppError extends Error {
  statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
  }
}

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      error: err.message,
    });
  }

  console.error('Unexpected error:', err);
  return res.status(500).json({
    error: 'Wystąpił nieoczekiwany błąd',
  });
}
```

**Plik:** `backend/src/middleware/rateLimiter.ts`

**Zawartość:**
```typescript
import rateLimit from 'express-rate-limit';

export const workoutLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 godzina
  max: 10, // 10 workoutów per IP
  message: { error: 'Zbyt wiele requestów. Spróbuj ponownie później.' },
});

export const resultLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 godzina
  max: 20, // 20 wyników per IP
  message: { error: 'Zbyt wiele requestów. Spróbuj ponownie później.' },
});
```

### Krok 3.3: Serwis workoutów
**Czas szacunkowy**: 45 min

**Plik:** `backend/src/services/workoutService.ts`

**Zadania:**
- [ ] Implementacja createWorkout
- [ ] Implementacja getWorkouts (z filtrem daty)
- [ ] Implementacja getWorkoutById
- [ ] Implementacja deleteWorkout (z walidacją owner_token)

**Zawartość:**
```typescript
import { db } from '../db';
import { workouts, results, Workout, NewWorkout } from '../db/schema';
import { eq, gte, desc, sql } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';
import { AppError } from '../middleware/errorHandler';

export async function createWorkout(data: {
  description: string;
  workoutDate?: string;
  sortDirection: 'asc' | 'desc';
}): Promise<{ workout: Workout; ownerToken: string }> {
  const ownerToken = uuidv4();

  const [workout] = await db.insert(workouts).values({
    ownerToken,
    description: data.description,
    workoutDate: data.workoutDate || new Date().toISOString().split('T')[0],
    sortDirection: data.sortDirection,
  }).returning();

  return { workout, ownerToken };
}

export async function getWorkouts(dateFilter?: string): Promise<any[]> {
  let dateFrom: Date | undefined;

  if (dateFilter === 'today') {
    dateFrom = new Date();
    dateFrom.setHours(0, 0, 0, 0);
  } else if (dateFilter === '7days') {
    dateFrom = new Date();
    dateFrom.setDate(dateFrom.getDate() - 7);
  } else if (dateFilter === '30days') {
    dateFrom = new Date();
    dateFrom.setDate(dateFrom.getDate() - 30);
  }

  const query = db
    .select({
      id: workouts.id,
      description: workouts.description,
      workoutDate: workouts.workoutDate,
      sortDirection: workouts.sortDirection,
      createdAt: workouts.createdAt,
      resultCount: sql<number>`count(${results.id})::int`,
    })
    .from(workouts)
    .leftJoin(results, eq(workouts.id, results.workoutId))
    .groupBy(workouts.id)
    .orderBy(desc(workouts.createdAt));

  if (dateFrom) {
    query.where(gte(workouts.workoutDate, dateFrom.toISOString().split('T')[0]));
  }

  return query;
}

export async function getWorkoutById(id: string): Promise<Workout | null> {
  const [workout] = await db
    .select()
    .from(workouts)
    .where(eq(workouts.id, id));

  return workout || null;
}

export async function deleteWorkout(id: string, ownerToken: string): Promise<boolean> {
  const [workout] = await db
    .select()
    .from(workouts)
    .where(eq(workouts.id, id));

  if (!workout) {
    throw new AppError('Workout nie został znaleziony', 404);
  }

  if (workout.ownerToken !== ownerToken) {
    throw new AppError('Brak uprawnień do usunięcia workoutu', 403);
  }

  await db.delete(workouts).where(eq(workouts.id, id));
  return true;
}
```

### Krok 3.4: Serwis wyników
**Czas szacunkowy**: 45 min

**Plik:** `backend/src/services/resultService.ts`

**Zadania:**
- [ ] Implementacja addResult (z parsowaniem result_numeric)
- [ ] Implementacja getResultsByWorkout (z sortowaniem)
- [ ] Implementacja updateResult
- [ ] Implementacja deleteResult

**Zawartość:**
```typescript
import { db } from '../db';
import { results, workouts, Result, NewResult } from '../db/schema';
import { eq, desc, asc, sql } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';
import { parseResultNumeric } from '../utils/resultParser';
import { AppError } from '../middleware/errorHandler';

export async function addResult(data: {
  workoutId: string;
  athleteName: string;
  gender: 'M' | 'F';
  resultValue: string;
}): Promise<{ result: Result; resultToken: string }> {
  // Sprawdź czy workout istnieje
  const [workout] = await db
    .select()
    .from(workouts)
    .where(eq(workouts.id, data.workoutId));

  if (!workout) {
    throw new AppError('Workout nie został znaleziony', 404);
  }

  const resultToken = uuidv4();
  const resultNumeric = parseResultNumeric(data.resultValue);

  const [result] = await db.insert(results).values({
    workoutId: data.workoutId,
    resultToken,
    athleteName: data.athleteName,
    gender: data.gender,
    resultValue: data.resultValue,
    resultNumeric: resultNumeric?.toString() || null,
  }).returning();

  return { result, resultToken };
}

export async function getResultsByWorkout(
  workoutId: string,
  sortDirection: 'asc' | 'desc' = 'desc'
): Promise<Result[]> {
  const orderFn = sortDirection === 'asc' ? asc : desc;

  return db
    .select()
    .from(results)
    .where(eq(results.workoutId, workoutId))
    .orderBy(
      sql`${results.resultNumeric} ${sortDirection === 'asc' ? sql`ASC` : sql`DESC`} NULLS LAST`
    );
}

export async function updateResult(
  id: string,
  resultToken: string,
  data: {
    athleteName?: string;
    gender?: 'M' | 'F';
    resultValue?: string;
  }
): Promise<Result> {
  const [existing] = await db
    .select()
    .from(results)
    .where(eq(results.id, id));

  if (!existing) {
    throw new AppError('Wynik nie został znaleziony', 404);
  }

  if (existing.resultToken !== resultToken) {
    throw new AppError('Brak uprawnień do edycji wyniku', 403);
  }

  const updateData: Partial<NewResult> = {};

  if (data.athleteName) updateData.athleteName = data.athleteName;
  if (data.gender) updateData.gender = data.gender;
  if (data.resultValue) {
    updateData.resultValue = data.resultValue;
    updateData.resultNumeric = parseResultNumeric(data.resultValue)?.toString() || null;
  }

  const [updated] = await db
    .update(results)
    .set(updateData)
    .where(eq(results.id, id))
    .returning();

  return updated;
}

export async function deleteResult(id: string, resultToken: string): Promise<boolean> {
  const [existing] = await db
    .select()
    .from(results)
    .where(eq(results.id, id));

  if (!existing) {
    throw new AppError('Wynik nie został znaleziony', 404);
  }

  if (existing.resultToken !== resultToken) {
    throw new AppError('Brak uprawnień do usunięcia wyniku', 403);
  }

  await db.delete(results).where(eq(results.id, id));
  return true;
}
```

### Krok 3.5: Routing API
**Czas szacunkowy**: 30 min

**Plik:** `backend/src/routes/workouts.ts`

**Zawartość:**
```typescript
import { Router } from 'express';
import * as workoutService from '../services/workoutService';
import { workoutLimiter } from '../middleware/rateLimiter';

const router = Router();

// POST /api/workouts - Utworzenie workoutu
router.post('/', workoutLimiter, async (req, res, next) => {
  try {
    const { description, workoutDate, sortDirection } = req.body;

    if (!description || !sortDirection) {
      return res.status(400).json({ error: 'Brak wymaganych pól' });
    }

    const { workout, ownerToken } = await workoutService.createWorkout({
      description,
      workoutDate,
      sortDirection,
    });

    res.status(201).json({ workout, ownerToken });
  } catch (error) {
    next(error);
  }
});

// GET /api/workouts - Lista workoutów
router.get('/', async (req, res, next) => {
  try {
    const { dateFilter } = req.query;
    const workouts = await workoutService.getWorkouts(dateFilter as string);
    res.json({ workouts });
  } catch (error) {
    next(error);
  }
});

// GET /api/workouts/:id - Pojedynczy workout
router.get('/:id', async (req, res, next) => {
  try {
    const workout = await workoutService.getWorkoutById(req.params.id);

    if (!workout) {
      return res.status(404).json({ error: 'Workout nie został znaleziony' });
    }

    res.json({ workout });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/workouts/:id - Usunięcie workoutu
router.delete('/:id', async (req, res, next) => {
  try {
    const { ownerToken } = req.body;

    if (!ownerToken) {
      return res.status(400).json({ error: 'Brak tokenu autoryzacji' });
    }

    await workoutService.deleteWorkout(req.params.id, ownerToken);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

export default router;
```

**Plik:** `backend/src/routes/results.ts`

**Zawartość:**
```typescript
import { Router } from 'express';
import * as resultService from '../services/resultService';
import * as workoutService from '../services/workoutService';
import { resultLimiter } from '../middleware/rateLimiter';

const router = Router();

// POST /api/results - Dodanie wyniku
router.post('/', resultLimiter, async (req, res, next) => {
  try {
    const { workoutId, athleteName, gender, resultValue } = req.body;

    if (!workoutId || !athleteName || !gender || !resultValue) {
      return res.status(400).json({ error: 'Brak wymaganych pól' });
    }

    if (!['M', 'F'].includes(gender)) {
      return res.status(400).json({ error: 'Nieprawidłowa wartość płci' });
    }

    const { result, resultToken } = await resultService.addResult({
      workoutId,
      athleteName,
      gender,
      resultValue,
    });

    res.status(201).json({ result, resultToken });
  } catch (error) {
    next(error);
  }
});

// GET /api/results/:workoutId - Wyniki dla workoutu
router.get('/:workoutId', async (req, res, next) => {
  try {
    const workout = await workoutService.getWorkoutById(req.params.workoutId);

    if (!workout) {
      return res.status(404).json({ error: 'Workout nie został znaleziony' });
    }

    const results = await resultService.getResultsByWorkout(
      req.params.workoutId,
      workout.sortDirection as 'asc' | 'desc'
    );

    res.json({ results });
  } catch (error) {
    next(error);
  }
});

// PUT /api/results/:id - Edycja wyniku
router.put('/:id', async (req, res, next) => {
  try {
    const { resultToken, athleteName, gender, resultValue } = req.body;

    if (!resultToken) {
      return res.status(400).json({ error: 'Brak tokenu autoryzacji' });
    }

    const result = await resultService.updateResult(req.params.id, resultToken, {
      athleteName,
      gender,
      resultValue,
    });

    res.json({ result });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/results/:id - Usunięcie wyniku
router.delete('/:id', async (req, res, next) => {
  try {
    const { resultToken } = req.body;

    if (!resultToken) {
      return res.status(400).json({ error: 'Brak tokenu autoryzacji' });
    }

    await resultService.deleteResult(req.params.id, resultToken);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

export default router;
```

### Krok 3.6: Entry point backendu
**Czas szacunkowy**: 15 min

**Plik:** `backend/src/index.ts`

**Zawartość:**
```typescript
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import workoutsRouter from './routes/workouts';
import resultsRouter from './routes/results';
import { errorHandler } from './middleware/errorHandler';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/workouts', workoutsRouter);
app.use('/api/results', resultsRouter);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Error handler
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

---

## Faza 4: Frontend - Struktura

### Krok 4.1: Typy TypeScript
**Czas szacunkowy**: 15 min

**Plik:** `frontend/src/types/index.ts`

**Zawartość:**
```typescript
export interface Workout {
  id: string;
  description: string;
  workoutDate: string;
  sortDirection: 'asc' | 'desc';
  createdAt: string;
  resultCount?: number;
}

export interface Result {
  id: string;
  workoutId: string;
  athleteName: string;
  gender: 'M' | 'F';
  resultValue: string;
  resultNumeric: string | null;
  createdAt: string;
}

export interface WorkoutOwnership {
  workoutId: string;
  ownerToken: string | null;
  participated: boolean;
}

export interface ResultOwnership {
  resultId: string;
  resultToken: string;
}

export type GenderFilter = 'all' | 'M' | 'F';
export type DateFilter = 'today' | '7days' | '30days' | 'all';
```

### Krok 4.2: Konfiguracja API client
**Czas szacunkowy**: 20 min

**Plik:** `frontend/src/services/api.ts`

**Zawartość:**
```typescript
import axios from 'axios';
import { Workout, Result } from '../types';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Workouts API
export const workoutsApi = {
  getAll: async (dateFilter?: string) => {
    const params = dateFilter ? { dateFilter } : {};
    const { data } = await api.get<{ workouts: Workout[] }>('/workouts', { params });
    return data.workouts;
  },

  getById: async (id: string) => {
    const { data } = await api.get<{ workout: Workout }>(`/workouts/${id}`);
    return data.workout;
  },

  create: async (workout: {
    description: string;
    workoutDate?: string;
    sortDirection: 'asc' | 'desc';
  }) => {
    const { data } = await api.post<{ workout: Workout; ownerToken: string }>('/workouts', workout);
    return data;
  },

  delete: async (id: string, ownerToken: string) => {
    await api.delete(`/workouts/${id}`, { data: { ownerToken } });
  },
};

// Results API
export const resultsApi = {
  getByWorkout: async (workoutId: string) => {
    const { data } = await api.get<{ results: Result[] }>(`/results/${workoutId}`);
    return data.results;
  },

  create: async (result: {
    workoutId: string;
    athleteName: string;
    gender: 'M' | 'F';
    resultValue: string;
  }) => {
    const { data } = await api.post<{ result: Result; resultToken: string }>('/results', result);
    return data;
  },

  update: async (
    id: string,
    resultToken: string,
    data: {
      athleteName?: string;
      gender?: 'M' | 'F';
      resultValue?: string;
    }
  ) => {
    const response = await api.put<{ result: Result }>(`/results/${id}`, {
      resultToken,
      ...data,
    });
    return response.data.result;
  },

  delete: async (id: string, resultToken: string) => {
    await api.delete(`/results/${id}`, { data: { resultToken } });
  },
};
```

### Krok 4.3: LocalStorage utilities
**Czas szacunkowy**: 20 min

**Plik:** `frontend/src/utils/localStorage.ts`

**Zawartość:**
```typescript
import { WorkoutOwnership, ResultOwnership } from '../types';

const WORKOUTS_KEY = 'myWorkouts';
const RESULTS_KEY = 'myResults';

// Workouts
export function getMyWorkouts(): WorkoutOwnership[] {
  const data = localStorage.getItem(WORKOUTS_KEY);
  return data ? JSON.parse(data) : [];
}

export function addMyWorkout(workoutId: string, ownerToken: string | null): void {
  const workouts = getMyWorkouts();
  const existing = workouts.find(w => w.workoutId === workoutId);

  if (existing) {
    if (ownerToken) existing.ownerToken = ownerToken;
  } else {
    workouts.push({ workoutId, ownerToken, participated: false });
  }

  localStorage.setItem(WORKOUTS_KEY, JSON.stringify(workouts));
}

export function setWorkoutParticipated(workoutId: string): void {
  const workouts = getMyWorkouts();
  const workout = workouts.find(w => w.workoutId === workoutId);

  if (workout) {
    workout.participated = true;
  } else {
    workouts.push({ workoutId, ownerToken: null, participated: true });
  }

  localStorage.setItem(WORKOUTS_KEY, JSON.stringify(workouts));
}

export function getWorkoutOwnerToken(workoutId: string): string | null {
  const workouts = getMyWorkouts();
  return workouts.find(w => w.workoutId === workoutId)?.ownerToken || null;
}

export function removeMyWorkout(workoutId: string): void {
  const workouts = getMyWorkouts().filter(w => w.workoutId !== workoutId);
  localStorage.setItem(WORKOUTS_KEY, JSON.stringify(workouts));

  // Usuń też powiązane wyniki
  const results = getMyResults().filter(r => {
    // Tu nie mamy bezpośredniego dostępu do workoutId wyniku
    // Będzie to obsłużone przez API cascade delete
    return true;
  });
  localStorage.setItem(RESULTS_KEY, JSON.stringify(results));
}

// Results
export function getMyResults(): ResultOwnership[] {
  const data = localStorage.getItem(RESULTS_KEY);
  return data ? JSON.parse(data) : [];
}

export function addMyResult(resultId: string, resultToken: string): void {
  const results = getMyResults();
  results.push({ resultId, resultToken });
  localStorage.setItem(RESULTS_KEY, JSON.stringify(results));
}

export function getResultToken(resultId: string): string | null {
  const results = getMyResults();
  return results.find(r => r.resultId === resultId)?.resultToken || null;
}

export function removeMyResult(resultId: string): void {
  const results = getMyResults().filter(r => r.resultId !== resultId);
  localStorage.setItem(RESULTS_KEY, JSON.stringify(results));
}
```

### Krok 4.4: Context - Auth
**Czas szacunkowy**: 25 min

**Plik:** `frontend/src/context/AuthContext.tsx`

**Zawartość:**
```typescript
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { WorkoutOwnership, ResultOwnership } from '../types';
import * as storage from '../utils/localStorage';

interface AuthContextType {
  myWorkouts: WorkoutOwnership[];
  myResults: ResultOwnership[];
  addWorkout: (workoutId: string, ownerToken: string | null) => void;
  addResult: (workoutId: string, resultId: string, resultToken: string) => void;
  isWorkoutOwner: (workoutId: string) => boolean;
  getWorkoutOwnerToken: (workoutId: string) => string | null;
  isResultOwner: (resultId: string) => boolean;
  getResultToken: (resultId: string) => string | null;
  removeWorkout: (workoutId: string) => void;
  removeResult: (resultId: string) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [myWorkouts, setMyWorkouts] = useState<WorkoutOwnership[]>([]);
  const [myResults, setMyResults] = useState<ResultOwnership[]>([]);

  useEffect(() => {
    setMyWorkouts(storage.getMyWorkouts());
    setMyResults(storage.getMyResults());
  }, []);

  const addWorkout = (workoutId: string, ownerToken: string | null) => {
    storage.addMyWorkout(workoutId, ownerToken);
    setMyWorkouts(storage.getMyWorkouts());
  };

  const addResult = (workoutId: string, resultId: string, resultToken: string) => {
    storage.addMyResult(resultId, resultToken);
    storage.setWorkoutParticipated(workoutId);
    setMyResults(storage.getMyResults());
    setMyWorkouts(storage.getMyWorkouts());
  };

  const isWorkoutOwner = (workoutId: string) => {
    return myWorkouts.some(w => w.workoutId === workoutId && w.ownerToken);
  };

  const getWorkoutOwnerToken = (workoutId: string) => {
    return storage.getWorkoutOwnerToken(workoutId);
  };

  const isResultOwner = (resultId: string) => {
    return myResults.some(r => r.resultId === resultId);
  };

  const getResultToken = (resultId: string) => {
    return storage.getResultToken(resultId);
  };

  const removeWorkout = (workoutId: string) => {
    storage.removeMyWorkout(workoutId);
    setMyWorkouts(storage.getMyWorkouts());
  };

  const removeResult = (resultId: string) => {
    storage.removeMyResult(resultId);
    setMyResults(storage.getMyResults());
  };

  return (
    <AuthContext.Provider
      value={{
        myWorkouts,
        myResults,
        addWorkout,
        addResult,
        isWorkoutOwner,
        getWorkoutOwnerToken,
        isResultOwner,
        getResultToken,
        removeWorkout,
        removeResult,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
```

### Krok 4.5: Konfiguracja React Query
**Czas szacunkowy**: 10 min

**Plik:** `frontend/src/main.tsx`

**Zawartość:**
```typescript
import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import App from './App';
import './index.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minut
      retry: 1,
    },
  },
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <App />
          <Toaster position="bottom-center" />
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>
);
```

### Krok 4.6: Routing
**Czas szacunkowy**: 15 min

**Plik:** `frontend/src/App.tsx`

**Zawartość:**
```typescript
import { Routes, Route } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import Layout from './components/Layout';

const HomePage = lazy(() => import('./pages/HomePage'));
const CreateWorkoutPage = lazy(() => import('./pages/CreateWorkoutPage'));
const WorkoutDetailPage = lazy(() => import('./pages/WorkoutDetailPage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));

function App() {
  return (
    <Layout>
      <Suspense fallback={<div className="flex justify-center p-8">Ładowanie...</div>}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/workout/create" element={<CreateWorkoutPage />} />
          <Route path="/workout/:id" element={<WorkoutDetailPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
    </Layout>
  );
}

export default App;
```

---

## Faza 5: Frontend - Komponenty

### Krok 5.1: Komponenty UI podstawowe
**Czas szacunkowy**: 45 min

**Zadania:**
- [ ] Button component
- [ ] Input component
- [ ] Card component
- [ ] Modal component (Headless UI)

**Plik:** `frontend/src/components/ui/Button.tsx`

```typescript
import { ButtonHTMLAttributes, ReactNode } from 'react';
import { clsx } from 'clsx';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  children: ReactNode;
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled,
  className,
  children,
  ...props
}: ButtonProps) {
  const baseStyles = 'font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';

  const variants = {
    primary: 'bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500',
    secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-gray-500',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };

  return (
    <button
      className={clsx(baseStyles, variants[variant], sizes[size], className)}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <span className="flex items-center gap-2">
          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          Ładowanie...
        </span>
      ) : children}
    </button>
  );
}
```

**Plik:** `frontend/src/components/ui/Input.tsx`

```typescript
import { InputHTMLAttributes, forwardRef } from 'react';
import { clsx } from 'clsx';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className, id, ...props }, ref) => {
    const inputId = id || props.name;

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="block text-sm font-medium text-gray-700 mb-1">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={clsx(
            'w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500',
            error ? 'border-red-500' : 'border-gray-300',
            className
          )}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={error ? `${inputId}-error` : undefined}
          {...props}
        />
        {error && (
          <p id={`${inputId}-error`} className="mt-1 text-sm text-red-600" role="alert">
            {error}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
```

**Plik:** `frontend/src/components/ui/Modal.tsx`

```typescript
import { Fragment, ReactNode } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

export function Modal({ isOpen, onClose, title, children }: ModalProps) {
  return (
    <Transition show={isOpen} as={Fragment}>
      <Dialog onClose={onClose} className="relative z-50">
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        </Transition.Child>

        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <Dialog.Panel className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <Dialog.Title className="text-lg font-semibold">
                  {title}
                </Dialog.Title>
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-600"
                  aria-label="Zamknij"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>
              {children}
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  );
}
```

### Krok 5.2: Layout component
**Czas szacunkowy**: 20 min

**Plik:** `frontend/src/components/Layout.tsx`

```typescript
import { ReactNode } from 'react';
import { Link } from 'react-router-dom';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="text-xl font-bold text-primary-600">
            Wod Result
          </Link>
          <Link
            to="/workout/create"
            className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
          >
            + Nowy workout
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6">
        {children}
      </main>

      <footer className="bg-white border-t mt-auto">
        <div className="max-w-4xl mx-auto px-4 py-4 text-center text-gray-500 text-sm">
          Wod Result MVP
        </div>
      </footer>
    </div>
  );
}
```

### Krok 5.3: Komponenty workout
**Czas szacunkowy**: 40 min

**Zadania:**
- [ ] WorkoutCard - karta workoutu na liście
- [ ] DateFilter - filtr daty (pills)
- [ ] WorkoutList - lista workoutów

**Plik:** `frontend/src/components/workout/WorkoutCard.tsx`

```typescript
import { Link } from 'react-router-dom';
import { Workout } from '../../types';

interface WorkoutCardProps {
  workout: Workout;
  isOwner?: boolean;
}

export function WorkoutCard({ workout, isOwner }: WorkoutCardProps) {
  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('pl-PL', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  return (
    <Link
      to={`/workout/${workout.id}`}
      className="block bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-sm text-gray-500 mb-1">
            {formatDate(workout.workoutDate)}
          </p>
          <p className="text-gray-900 line-clamp-2">
            {workout.description}
          </p>
        </div>
        <div className="ml-4 flex flex-col items-end">
          <span className="text-sm text-gray-500">
            {workout.resultCount || 0} wyników
          </span>
          {isOwner && (
            <span className="text-xs text-primary-600 mt-1">Twój workout</span>
          )}
        </div>
      </div>
    </Link>
  );
}
```

**Plik:** `frontend/src/components/workout/DateFilter.tsx`

```typescript
import { DateFilter as DateFilterType } from '../../types';
import { clsx } from 'clsx';

interface DateFilterProps {
  value: DateFilterType;
  onChange: (value: DateFilterType) => void;
}

const filters: { value: DateFilterType; label: string }[] = [
  { value: 'today', label: 'Dziś' },
  { value: '7days', label: '7 dni' },
  { value: '30days', label: '30 dni' },
  { value: 'all', label: 'Wszystkie' },
];

export function DateFilter({ value, onChange }: DateFilterProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0">
      {filters.map((filter) => (
        <button
          key={filter.value}
          onClick={() => onChange(filter.value)}
          className={clsx(
            'px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors',
            value === filter.value
              ? 'bg-primary-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          )}
        >
          {filter.label}
        </button>
      ))}
    </div>
  );
}
```

### Krok 5.4: Komponenty result
**Czas szacunkowy**: 45 min

**Zadania:**
- [ ] ResultRow - wiersz wyniku w rankingu
- [ ] GenderFilter - filtr płci (segmented control)
- [ ] AddResultForm - formularz dodawania wyniku
- [ ] EditResultModal - modal edycji wyniku

**Plik:** `frontend/src/components/result/GenderFilter.tsx`

```typescript
import { GenderFilter as GenderFilterType } from '../../types';
import { clsx } from 'clsx';

interface GenderFilterProps {
  value: GenderFilterType;
  onChange: (value: GenderFilterType) => void;
}

const options: { value: GenderFilterType; label: string }[] = [
  { value: 'all', label: 'Wszyscy' },
  { value: 'M', label: 'Mężczyźni' },
  { value: 'F', label: 'Kobiety' },
];

export function GenderFilter({ value, onChange }: GenderFilterProps) {
  return (
    <div className="inline-flex rounded-lg bg-gray-100 p-1">
      {options.map((option) => (
        <button
          key={option.value}
          onClick={() => onChange(option.value)}
          className={clsx(
            'px-4 py-2 text-sm font-medium rounded-md transition-colors',
            value === option.value
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
```

**Plik:** `frontend/src/components/result/ResultRow.tsx`

```typescript
import { Result } from '../../types';
import { useAuth } from '../../context/AuthContext';

interface ResultRowProps {
  result: Result;
  position: number;
  onEdit: (result: Result) => void;
  onDelete: (result: Result) => void;
}

export function ResultRow({ result, position, onEdit, onDelete }: ResultRowProps) {
  const { isResultOwner } = useAuth();
  const isOwner = isResultOwner(result.id);

  return (
    <div className={clsx(
      'flex items-center gap-4 p-4 border-b border-gray-100',
      isOwner && 'bg-primary-50'
    )}>
      <span className="w-8 text-lg font-bold text-gray-400">
        {position}
      </span>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium text-gray-900">
            {result.athleteName}
          </span>
          <span className="text-sm text-gray-500">
            {result.gender === 'M' ? '♂' : '♀'}
          </span>
        </div>
      </div>

      <span className="font-mono text-lg">
        {result.resultValue}
      </span>

      {isOwner && (
        <div className="flex gap-2">
          <button
            onClick={() => onEdit(result)}
            className="text-sm text-primary-600 hover:text-primary-700"
          >
            Edytuj
          </button>
          <button
            onClick={() => onDelete(result)}
            className="text-sm text-red-600 hover:text-red-700"
          >
            Usuń
          </button>
        </div>
      )}
    </div>
  );
}
```

---

## Faza 6: Frontend - Strony

### Krok 6.1: HomePage
**Czas szacunkowy**: 45 min

**Plik:** `frontend/src/pages/HomePage.tsx`

**Zadania:**
- [ ] Lista publicznych workoutów
- [ ] Sekcja "Moje workouty"
- [ ] Filtrowanie po dacie
- [ ] Empty states

### Krok 6.2: CreateWorkoutPage
**Czas szacunkowy**: 40 min

**Plik:** `frontend/src/pages/CreateWorkoutPage.tsx`

**Zadania:**
- [ ] Formularz tworzenia workoutu
- [ ] Walidacja (description, date, sortDirection)
- [ ] Zapis do API i localStorage
- [ ] Redirect po sukcesie

### Krok 6.3: WorkoutDetailPage
**Czas szacunkowy**: 60 min

**Plik:** `frontend/src/pages/WorkoutDetailPage.tsx`

**Zadania:**
- [ ] Wyświetlanie opisu workoutu
- [ ] Informacja o kierunku sortowania
- [ ] Lista wyników z rankingiem
- [ ] Filtrowanie po płci
- [ ] Formularz dodawania wyniku
- [ ] Modal edycji wyniku
- [ ] Przycisk usuwania (dla owner)
- [ ] Obsługa 404

### Krok 6.4: NotFoundPage
**Czas szacunkowy**: 15 min

**Plik:** `frontend/src/pages/NotFoundPage.tsx`

**Zawartość:**
```typescript
import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="text-center py-12">
      <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
      <p className="text-gray-600 mb-8">
        Strona nie została znaleziona
      </p>
      <Link
        to="/"
        className="text-primary-600 hover:text-primary-700 font-medium"
      >
        Wróć do strony głównej
      </Link>
    </div>
  );
}
```

---

## Faza 7: Integracja Frontend-Backend

### Krok 7.1: Custom hooks dla API
**Czas szacunkowy**: 30 min

**Zadania:**
- [ ] useWorkouts - pobieranie i cache workoutów
- [ ] useWorkout - pojedynczy workout
- [ ] useResults - wyniki workoutu
- [ ] Mutations hooks (create, update, delete)

**Plik:** `frontend/src/hooks/useWorkouts.ts`

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { workoutsApi } from '../services/api';
import { DateFilter } from '../types';

export function useWorkouts(dateFilter: DateFilter) {
  return useQuery({
    queryKey: ['workouts', dateFilter],
    queryFn: () => workoutsApi.getAll(dateFilter === 'all' ? undefined : dateFilter),
  });
}

export function useWorkout(id: string) {
  return useQuery({
    queryKey: ['workout', id],
    queryFn: () => workoutsApi.getById(id),
    enabled: !!id,
  });
}

export function useCreateWorkout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: workoutsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workouts'] });
    },
  });
}

export function useDeleteWorkout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, ownerToken }: { id: string; ownerToken: string }) =>
      workoutsApi.delete(id, ownerToken),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workouts'] });
    },
  });
}
```

### Krok 7.2: Testowanie integracji
**Czas szacunkowy**: 30 min

**Zadania:**
- [ ] Test tworzenia workoutu
- [ ] Test dodawania wyniku
- [ ] Test sortowania
- [ ] Test filtrowania
- [ ] Test autoryzacji (edit/delete)

---

## Faza 8: PWA

### Krok 8.1: Instalacja i konfiguracja vite-plugin-pwa
**Czas szacunkowy**: 20 min

**Polecenie:**
```bash
cd frontend
npm install -D vite-plugin-pwa
```

**Plik:** `frontend/vite.config.ts`

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'icon-192.png', 'icon-512.png'],
      manifest: {
        name: 'Wod Result',
        short_name: 'Wod Result',
        description: 'Porównuj wyniki workoutów z innymi atletami',
        theme_color: '#4F46E5',
        background_color: '#FFFFFF',
        display: 'standalone',
        start_url: '/',
        icons: [
          {
            src: 'icon-192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'icon-512.png',
            sizes: '512x512',
            type: 'image/png',
          },
        ],
      },
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
                maxAgeSeconds: 60 * 60,
              },
            },
          },
        ],
      },
    }),
  ],
});
```

### Krok 8.2: Przygotowanie ikon
**Czas szacunkowy**: 15 min

**Zadania:**
- [ ] Utworzenie ikony 192x192 px
- [ ] Utworzenie ikony 512x512 px
- [ ] Umieszczenie w `/frontend/public/`

### Krok 8.3: Testowanie PWA
**Czas szacunkowy**: 20 min

**Zadania:**
- [ ] Test instalacji na Chrome desktop
- [ ] Test instalacji na Android
- [ ] Test instalacji na iOS Safari
- [ ] Weryfikacja manifest.json w DevTools

---

## Faza 9: Testowanie

### Krok 9.1: Testy jednostkowe - Backend
**Czas szacunkowy**: 45 min

**Zadania:**
- [ ] Testy resultParser
- [ ] Testy services (mock db)
- [ ] Testy routes (supertest)

### Krok 9.2: Testy jednostkowe - Frontend
**Czas szacunkowy**: 45 min

**Zadania:**
- [ ] Testy komponentów UI (React Testing Library)
- [ ] Testy hooks
- [ ] Testy localStorage utilities

### Krok 9.3: Testy E2E
**Czas szacunkowy**: 60 min

**Zadania:**
- [ ] Setup Playwright/Cypress
- [ ] Test flow: utworzenie workoutu
- [ ] Test flow: dodanie wyniku
- [ ] Test flow: edycja/usunięcie
- [ ] Test responsywności

### Krok 9.4: Testy manualne
**Czas szacunkowy**: 30 min

**Checklist:**
- [ ] Wszystkie user stories (US-001 do US-022) są realizowalne
- [ ] Aplikacja działa na mobile (iOS, Android)
- [ ] Aplikacja działa na desktop (Chrome, Firefox, Safari, Edge)
- [ ] PWA instaluje się poprawnie
- [ ] Brak błędów w console

---

## Faza 10: Deployment

### Krok 10.1: Przygotowanie serwera (mikr.us)
**Czas szacunkowy**: 30 min

**Zadania:**
- [ ] Konfiguracja PostgreSQL
- [ ] Utworzenie bazy danych `wod_result`
- [ ] Instalacja Node.js (jeśli nie ma)
- [ ] Instalacja PM2 globalnie

**Polecenia:**
```bash
# Na serwerze
sudo apt update
sudo apt install nodejs npm
sudo npm install -g pm2
```

### Krok 10.2: Konfiguracja bazy produkcyjnej
**Czas szacunkowy**: 20 min

**Zadania:**
- [ ] Utworzenie użytkownika PostgreSQL
- [ ] Utworzenie bazy danych
- [ ] Uruchomienie migracji

**Polecenia SQL:**
```sql
CREATE USER wod_result_user WITH PASSWORD 'secure_password';
CREATE DATABASE wod_result OWNER wod_result_user;
GRANT ALL PRIVILEGES ON DATABASE wod_result TO wod_result_user;
```

### Krok 10.3: Deploy backendu
**Czas szacunkowy**: 30 min

**Zadania:**
- [ ] Przesłanie kodu na serwer (git clone lub scp)
- [ ] Instalacja zależności
- [ ] Build TypeScript
- [ ] Konfiguracja PM2
- [ ] Uruchomienie

**PM2 ecosystem.config.js:**
```javascript
module.exports = {
  apps: [{
    name: 'wod-result-api',
    script: 'dist/index.js',
    cwd: '/var/www/wod-result/backend',
    env: {
      NODE_ENV: 'production',
      PORT: 3001,
      DATABASE_URL: 'postgresql://wod_result_user:password@localhost:5432/wod_result',
    },
    instances: 1,
    autorestart: true,
    max_memory_restart: '500M',
  }],
};
```

**Polecenia:**
```bash
cd /var/www/wod-result/backend
npm install --production
npm run build
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### Krok 10.4: Deploy frontendu
**Czas szacunkowy**: 25 min

**Zadania:**
- [ ] Build produkcyjny
- [ ] Konfiguracja Nginx jako reverse proxy
- [ ] Konfiguracja SSL (Let's Encrypt)

**Nginx config:**
```nginx
server {
    listen 80;
    server_name wodresult.pl;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl;
    server_name wodresult.pl;

    ssl_certificate /etc/letsencrypt/live/wodresult.pl/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/wodresult.pl/privkey.pem;

    root /var/www/wod-result/frontend/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### Krok 10.5: Monitoring i logi
**Czas szacunkowy**: 15 min

**Zadania:**
- [ ] Konfiguracja logów PM2
- [ ] Setup podstawowego monitoringu
- [ ] Konfiguracja alertów (opcjonalnie)

**Polecenia:**
```bash
# Podgląd logów
pm2 logs wod-result-api

# Monitoring
pm2 monit

# Status
pm2 status
```

---

## Checklist końcowy

### Funkcjonalności (FR)
- [ ] FR-001: Tworzenie workoutu z opisem
- [ ] FR-002: Wybór kierunku sortowania
- [ ] FR-003: Publiczny dostęp do workoutów
- [ ] FR-004: Opcjonalna data z domyślną wartością
- [ ] FR-005: Usuwanie workoutu z wynikami
- [ ] FR-006: Bezterminowe przechowywanie
- [ ] FR-007: Dołączanie z listy lub URL
- [ ] FR-008: Formularz dodawania wyniku
- [ ] FR-009: Edycja własnego wyniku
- [ ] FR-010: Usuwanie własnego wyniku
- [ ] FR-011: Identyfikacja przez pole tekstowe
- [ ] FR-012: Sortowanie według wartości
- [ ] FR-013: Wartości nieliczbowe na końcu
- [ ] FR-014: Filtrowanie według płci
- [ ] FR-015: Pełna transparentność wyników
- [ ] FR-016: Filtrowanie po dacie
- [ ] FR-017: Lista "moje workouty" w localStorage
- [ ] FR-018: Przeglądanie historii
- [ ] FR-019: PWA z instalacją
- [ ] FR-020: Responsywność

### User Stories (US)
- [ ] US-001 do US-022: Wszystkie historyjki użytkownika

### Techniczne
- [ ] Backend działa na produkcji
- [ ] Frontend działa na produkcji
- [ ] PWA instaluje się poprawnie
- [ ] SSL skonfigurowany
- [ ] Baza danych zabezpieczona
- [ ] Logi i monitoring działają
- [ ] Backup bazy skonfigurowany

### Jakość
- [ ] Brak błędów w console (frontend)
- [ ] Brak błędów w logach (backend)
- [ ] Testy przechodzą
- [ ] Responsywność na wszystkich breakpoints
- [ ] Dostępność (keyboard navigation, screen readers)

---

## Podsumowanie

### Szacowany czas całkowity
| Faza | Czas szacunkowy |
|------|-----------------|
| Faza 1: Inicjalizacja | 1.5h |
| Faza 2: Backend - Baza | 1.5h |
| Faza 3: Backend - API | 3h |
| Faza 4: Frontend - Struktura | 2h |
| Faza 5: Frontend - Komponenty | 3h |
| Faza 6: Frontend - Strony | 3h |
| Faza 7: Integracja | 1h |
| Faza 8: PWA | 1h |
| Faza 9: Testowanie | 3h |
| Faza 10: Deployment | 2h |
| **RAZEM** | **~21h** |

### Zależności między fazami
```
Faza 1 (Inicjalizacja)
    ↓
Faza 2 (DB) → Faza 3 (API)
    ↓              ↓
Faza 4 (Frontend struktura)
    ↓
Faza 5 (Komponenty) → Faza 6 (Strony)
    ↓                      ↓
         Faza 7 (Integracja)
              ↓
         Faza 8 (PWA)
              ↓
         Faza 9 (Testowanie)
              ↓
         Faza 10 (Deployment)
```

### Priorytety dla MVP
1. **P0 (Krytyczne)**: Fazy 1-6 - podstawowa funkcjonalność
2. **P1 (Ważne)**: Faza 7-8 - integracja i PWA
3. **P2 (Standardowe)**: Faza 9 - testowanie
4. **P3 (Deployment)**: Faza 10 - produkcja

---

**Koniec dokumentu planu wdrożenia**

Data utworzenia: 2026-02-05
Autor: AI Assistant
Status: Gotowy do realizacji
