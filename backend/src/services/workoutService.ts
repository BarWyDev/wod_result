import { db } from '../db';
import { workouts, results, Workout, NewWorkout } from '../db/schema';
import { eq, gte, desc, sql } from 'drizzle-orm';
import { randomUUID } from 'crypto';
import { AppError } from '../middleware/errorHandler';

export async function createWorkout(data: {
  description: string;
  workoutDate?: string;
  sortDirection: 'asc' | 'desc';
}): Promise<{ workout: Workout; ownerToken: string }> {
  const ownerToken = randomUUID();

  const [workout] = await db.insert(workouts).values({
    ownerToken,
    description: data.description,
    workoutDate: data.workoutDate || new Date().toISOString().split('T')[0],
    sortDirection: data.sortDirection,
  }).returning();

  if (!workout) {
    throw new AppError('Nie udało się utworzyć workoutu', 500);
  }

  return { workout, ownerToken };
}

export async function getWorkouts(dateFilter?: string): Promise<any[]> {
  let dateFrom: string | undefined;

  if (dateFilter === 'today') {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    dateFrom = today.toISOString().split('T')[0];
  } else if (dateFilter === '7days') {
    const date = new Date();
    date.setDate(date.getDate() - 7);
    dateFrom = date.toISOString().split('T')[0];
  } else if (dateFilter === '30days') {
    const date = new Date();
    date.setDate(date.getDate() - 30);
    dateFrom = date.toISOString().split('T')[0];
  }

  let query = db
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
    .groupBy(workouts.id);

  if (dateFrom) {
    query = query.where(gte(workouts.workoutDate, dateFrom)) as any;
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
