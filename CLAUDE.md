# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Wod Result** is a Progressive Web App (PWA) for athletes to compare workout results. The application enables small training groups to quickly create workouts, add results, and view rankings without authentication or user registration.

**Tech Stack:**
- Frontend: React 19 + TypeScript + Vite + TailwindCSS + React Query
- Backend: Node.js + Express + TypeScript
- Database: PostgreSQL with Drizzle ORM
- Authentication: Token-based (localStorage) without user accounts

## Development Commands

### Backend (from `backend/` directory)

```bash
# Development
npm run dev                    # Start development server with nodemon

# Build & Run
npm run build                  # Compile TypeScript to dist/
npm start                      # Run compiled code from dist/

# Database
npm run db:setup               # Full database setup (create + migrations)
npm run db:create              # Create database if not exists
npm run db:run-migrations      # Run existing migrations
npm run db:generate            # Generate new migration from schema changes
npm run db:push                # Push schema changes directly (dev only)
npm run db:verify              # Verify database schema
npm run db:test                # Test database connection
```

### Frontend (from `frontend/` directory)

```bash
# Development
npm run dev                    # Start Vite dev server (default: http://localhost:5173)

# Build & Preview
npm run build                  # Build for production (TypeScript check + Vite build)
npm run preview                # Preview production build locally

# Code Quality
npm run lint                   # Run ESLint
```

### Running the Full Stack

1. **Backend:** `cd backend && npm run dev` (runs on port 3001)
2. **Frontend:** `cd frontend && npm run dev` (runs on port 5173)
3. Ensure PostgreSQL is running and `backend/.env` has correct `DATABASE_URL`

## Architecture

### Token-Based Ownership Model

The application uses a **tokenless authentication** approach stored in browser localStorage:

- **Workout Ownership:** When a user creates a workout, the backend returns an `ownerToken` (UUID) stored in localStorage. Only the owner can delete the workout.
- **Result Ownership:** When adding a result, a `resultToken` (UUID) is stored in localStorage, allowing users to edit/delete their own results.
- **"My Workouts":** Workouts the user created or participated in are tracked locally in `localStorage` via the `AuthContext`.

### Database Schema

Located in `backend/src/db/schema.ts`:

**workouts** table:
- `id` (uuid, primary key)
- `ownerToken` (uuid) - used to verify ownership
- `description` (text) - workout description
- `workoutDate` (date) - when the workout occurred
- `sortDirection` ('asc' | 'desc') - how results should be sorted
- `createdAt`, `updatedAt` (timestamps)

**results** table:
- `id` (uuid, primary key)
- `workoutId` (uuid, foreign key to workouts, cascade delete)
- `resultToken` (uuid) - used to verify ownership
- `athleteName` (varchar) - athlete's name or nickname
- `gender` ('M' | 'F') - athlete's gender
- `resultValue` (text) - raw result value (flexible format)
- `resultNumeric` (numeric, nullable) - parsed numeric value for sorting
- `createdAt`, `updatedAt` (timestamps)

### Result Parsing Logic

Located in `backend/src/utils/resultParser.ts`:

The `parseResultNumeric()` function converts various result formats to numeric values for sorting:
1. **Time formats:** `mm:ss` or `hh:mm:ss` → converted to total seconds
2. **Numeric formats:** Extracts first number from string (e.g., "150 reps" → 150)
3. **Non-numeric:** Returns `null` (these results appear at the end of rankings)

### Frontend State Management

- **React Query:** Used for server state management (fetching/mutating workouts and results)
  - Custom hooks: `useWorkouts` and `useResults` (in `frontend/src/hooks/`)
- **AuthContext:** Manages local ownership state (which workouts/results belong to this user)
- **localStorage utilities:** Located in `frontend/src/utils/localStorage.ts`

### API Layer

Backend API structure (`backend/src/routes/`):
- `/api/workouts` - CRUD operations for workouts
- `/api/results` - CRUD operations for results

Frontend API client (`frontend/src/services/api.ts`):
- Uses axios with base URL from `VITE_API_URL` env variable
- Centralized API calls for workouts and results

### Key UI Patterns

- **Modal-based editing:** Results are edited via `EditResultModal` component
- **Filtering:** Gender filtering for results, date filtering for workouts (today/7days/30days/all)
- **Responsive design:** TailwindCSS with mobile-first approach
- **Lazy loading:** Route-based code splitting for pages

## Important Implementation Details

### Result Sorting

Results are sorted based on:
1. `workout.sortDirection` ('asc' for lowest-wins like time, 'desc' for highest-wins like reps)
2. `result.resultNumeric` (parsed value) - nulls always appear last
3. Sorting happens on the frontend after fetching results

### Date Filtering

Workouts can be filtered by:
- **today:** workouts with `workoutDate` = today
- **7days:** workouts from last 7 days
- **30days:** workouts from last 30 days
- **all:** no date filter

Filtering is handled server-side in `workoutService.getWorkouts()`.

### Cascade Deletion

When a workout is deleted, all associated results are automatically deleted via database CASCADE constraint.

### Error Handling

- Backend uses custom `AppError` class (in `middleware/errorHandler.ts`)
- Frontend uses react-hot-toast for user notifications
- Rate limiting middleware exists but may need configuration

## Database Setup Notes

The database configuration uses Drizzle ORM:
- Schema definitions are in TypeScript (`backend/src/db/schema.ts`)
- Migrations are stored in `backend/src/db/migrations/`
- The `drizzle.config.ts` uses `DATABASE_URL` from environment variables

**Initial setup requires:**
1. PostgreSQL instance running
2. `.env` file with `DATABASE_URL=postgresql://user:password@localhost:5432/dbname`
3. Run `npm run db:setup` to create database and apply migrations

## Common Patterns to Follow

### Adding a New Result Field

1. Update `backend/src/db/schema.ts` (add column to `results` table)
2. Generate migration: `npm run db:generate`
3. Apply migration: `npm run db:run-migrations`
4. Update TypeScript types in `frontend/src/types/index.ts`
5. Update frontend forms and display components

### Adding a New API Endpoint

1. Add route handler in `backend/src/routes/`
2. Add service function in `backend/src/services/`
3. Update frontend API client in `frontend/src/services/api.ts`
4. Create/update React Query hook in `frontend/src/hooks/`

### Working with Ownership Tokens

Always pass tokens from localStorage when calling mutation endpoints:
- Workout deletion: requires `ownerToken` in request body
- Result update/delete: requires `resultToken` in request body
- Tokens are validated server-side before allowing operations

## Environment Variables

### Backend `.env`
```
DATABASE_URL=postgresql://user:password@localhost:5432/wod_result
PORT=3001
```

### Frontend `.env`
```
VITE_API_URL=http://localhost:3001/api
```
