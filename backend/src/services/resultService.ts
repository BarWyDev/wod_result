import { db } from '../db';
import { results, workouts, Result, NewResult } from '../db/schema';
import { eq, desc, asc, sql } from 'drizzle-orm';
import { randomUUID } from 'crypto';
import { parseResultNumeric, calculateRoundSum } from '../utils/resultParser';
import { AppError } from '../middleware/errorHandler';

export async function addResult(data: {
  workoutId: string;
  athleteName: string;
  gender: 'M' | 'F';
  resultValue: string;
  roundDetails?: { rounds: number[] } | null;
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

  // Oblicz resultValue z rund jeśli są dostarczone
  let finalResultValue = data.resultValue;
  if (data.roundDetails?.rounds) {
    const sum = calculateRoundSum(data.roundDetails);
    if (sum !== null) {
      finalResultValue = sum.toString();
    }
  }

  const resultNumeric = parseResultNumeric(finalResultValue);

  const [result] = await db.insert(results).values({
    workoutId: data.workoutId,
    resultToken,
    athleteName: data.athleteName,
    gender: data.gender,
    resultValue: finalResultValue,
    resultNumeric: resultNumeric?.toString() || null,
    roundDetails: data.roundDetails || null,
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
    roundDetails?: { rounds: number[] } | null;
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

  // Obsługa roundDetails
  if (data.roundDetails !== undefined) {
    updateData.roundDetails = data.roundDetails;

    // Jeśli są rundy, oblicz sumę
    if (data.roundDetails?.rounds) {
      const sum = calculateRoundSum(data.roundDetails);
      if (sum !== null) {
        updateData.resultValue = sum.toString();
        updateData.resultNumeric = sum.toString();
      }
    }
  }

  // Jeśli resultValue jest podane bezpośrednio (tryb prosty)
  if (data.resultValue && !data.roundDetails) {
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
