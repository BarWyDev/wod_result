import { db } from '../db';
import { results, workouts, Result, NewResult } from '../db/schema';
import { eq, desc, asc, sql } from 'drizzle-orm';
import { randomUUID } from 'crypto';
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

  const resultToken = randomUUID();
  const resultNumeric = parseResultNumeric(data.resultValue);

  const [result] = await db.insert(results).values({
    workoutId: data.workoutId,
    resultToken,
    athleteName: data.athleteName,
    gender: data.gender,
    resultValue: data.resultValue,
    resultNumeric: resultNumeric?.toString() || null,
  }).returning();

  if (!result) {
    throw new AppError('Nie udało się dodać wyniku', 500);
  }

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

  if (!updated) {
    throw new AppError('Nie udało się zaktualizować wyniku', 500);
  }

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
