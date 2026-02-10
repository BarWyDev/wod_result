import { db } from '../db';
import { workouts, results, Workout, NewWorkout } from '../db/schema';
import { eq, gte, lte, and, desc, sql } from 'drizzle-orm';
import { randomUUID } from 'crypto';
import { AppError } from '../middleware/errorHandler';
import { WorkoutType, getWorkoutTypeConfig } from '../constants/workoutTypes';

// Helper function to format date in local timezone as YYYY-MM-DD
function formatLocalDate(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

export async function createWorkout(data: {
  description: string;
  workoutDate?: string;
  sortDirection?: 'asc' | 'desc';
  workoutType?: WorkoutType | null;
}): Promise<{ workout: Workout; ownerToken: string }> {
  const ownerToken = randomUUID();

  // Auto-determine sortDirection and resultUnit from workoutType if provided
  let sortDirection = data.sortDirection || 'desc';
  let resultUnit = 'custom';

  if (data.workoutType) {
    const config = getWorkoutTypeConfig(data.workoutType);
    sortDirection = config.sortDirection;
    resultUnit = config.resultUnit;
  }

  const [workout] = await db.insert(workouts).values({
    ownerToken,
    description: data.description,
    workoutDate: data.workoutDate || new Date().toISOString().split('T')[0],
    sortDirection,
    workoutType: data.workoutType || null,
    resultUnit,
  }).returning();

  if (!workout) {
    throw new AppError('Nie udało się utworzyć workoutu', 500);
  }

  return { workout, ownerToken };
}

export async function getWorkouts(dateFilter?: string): Promise<any[]> {
  const today = new Date();
  const todayStr = formatLocalDate(today);

  let query = db
    .select({
      id: workouts.id,
      description: workouts.description,
      workoutDate: workouts.workoutDate,
      sortDirection: workouts.sortDirection,
      workoutType: workouts.workoutType,
      resultUnit: workouts.resultUnit,
      createdAt: workouts.createdAt,
      resultCount: sql<number>`count(${results.id})::int`,
    })
    .from(workouts)
    .leftJoin(results, eq(workouts.id, results.workoutId))
    .groupBy(workouts.id);

  if (dateFilter === 'today') {
    // Only workouts from today
    query = query.where(sql`${workouts.workoutDate} = ${todayStr}`) as any;
  } else if (dateFilter === '7days') {
    // Workouts from last 7 days (not including future dates)
    const date7 = new Date();
    date7.setDate(date7.getDate() - 7);
    const dateFrom = formatLocalDate(date7);
    query = query.where(
      sql`${workouts.workoutDate} >= ${dateFrom} AND ${workouts.workoutDate} <= ${todayStr}`
    ) as any;
  } else if (dateFilter === '30days') {
    // Workouts from last 30 days (not including future dates)
    const date30 = new Date();
    date30.setDate(date30.getDate() - 30);
    const dateFrom = formatLocalDate(date30);
    query = query.where(
      sql`${workouts.workoutDate} >= ${dateFrom} AND ${workouts.workoutDate} <= ${todayStr}`
    ) as any;
  }

  return query.orderBy(desc(workouts.createdAt));
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
