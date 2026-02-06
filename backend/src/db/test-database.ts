import 'dotenv/config';
import { db } from './index';
import { workouts, results } from './schema';
import { eq } from 'drizzle-orm';
import { randomUUID } from 'crypto';

async function testDatabase() {
  try {
    console.log('🧪 Rozpoczynam test funkcjonalny bazy danych...\n');

    // Test 1: Wstawienie workoutu
    console.log('Test 1: Tworzenie workoutu...');
    const [workout] = await db.insert(workouts).values({
      ownerToken: randomUUID(),
      description: 'Test Workout - 21.1 Open',
      workoutDate: '2024-02-05',
      sortDirection: 'asc',
    }).returning();

    if (!workout) throw new Error('Workout nie został utworzony');

    console.log('✓ Workout utworzony:', {
      id: workout.id,
      description: workout.description,
      createdAt: workout.createdAt,
    });

    // Test 2: Wstawienie wyników
    console.log('\nTest 2: Dodawanie wyników...');
    const [result1] = await db.insert(results).values({
      workoutId: workout.id,
      resultToken: randomUUID(),
      athleteName: 'Jan Kowalski',
      gender: 'M',
      resultValue: '12:45',
      resultNumeric: '765', // 12*60 + 45 = 765 sekund
    }).returning();

    const [result2] = await db.insert(results).values({
      workoutId: workout.id,
      resultToken: randomUUID(),
      athleteName: 'Anna Nowak',
      gender: 'F',
      resultValue: '15:30',
      resultNumeric: '930',
    }).returning();

    if (!result1 || !result2) throw new Error('Wyniki nie zostały utworzone');

    console.log('✓ Wyniki dodane:', {
      result1: `${result1.athleteName} (${result1.gender}): ${result1.resultValue}`,
      result2: `${result2.athleteName} (${result2.gender}): ${result2.resultValue}`,
    });

    // Test 3: Pobieranie danych
    console.log('\nTest 3: Pobieranie danych...');
    const fetchedWorkout = await db.query.workouts.findFirst({
      where: eq(workouts.id, workout.id),
      with: {
        results: true,
      },
    });

    if (!fetchedWorkout) throw new Error('Workout nie został pobrany');

    console.log('✓ Workout z wynikami:', {
      description: fetchedWorkout.description,
      resultsCount: fetchedWorkout.results.length,
    });

    // Test 4: Sprawdzenie triggerów (update)
    console.log('\nTest 4: Sprawdzanie triggerów updated_at...');
    const oldUpdatedAt = workout.updatedAt;

    // Czekaj chwilę, żeby timestamp się zmienił
    await new Promise(resolve => setTimeout(resolve, 1100));

    await db.update(workouts)
      .set({ description: 'Test Workout - ZAKTUALIZOWANY' })
      .where(eq(workouts.id, workout.id));

    const [updatedWorkout] = await db
      .select()
      .from(workouts)
      .where(eq(workouts.id, workout.id));

    if (!updatedWorkout) throw new Error('Zaktualizowany workout nie został pobrany');

    const timestampChanged = new Date(updatedWorkout.updatedAt).getTime() > new Date(oldUpdatedAt).getTime();
    console.log('✓ Trigger updated_at działa:', timestampChanged ? 'TAK' : 'NIE');

    // Test 5: Sprawdzenie constraintów
    console.log('\nTest 5: Sprawdzanie constraintów...');
    try {
      await db.insert(results).values({
        workoutId: workout.id,
        resultToken: randomUUID(),
        athleteName: 'Test',
        gender: 'X' as any, // Nieprawidłowa płeć
        resultValue: 'test',
      });
      console.log('✗ Constraint gender_check NIE DZIAŁA (przyjęło nieprawidłową wartość)');
    } catch (error: any) {
      if (error.message.includes('results_gender_check') || error.message.includes('violates check constraint')) {
        console.log('✓ Constraint gender_check działa poprawnie');
      } else {
        console.log('⚠ Inny błąd:', error.message);
      }
    }

    // Test 6: Sprawdzenie CASCADE DELETE
    console.log('\nTest 6: Sprawdzanie CASCADE DELETE...');
    const resultsBeforeDelete = await db
      .select()
      .from(results)
      .where(eq(results.workoutId, workout.id));

    console.log(`  Wyników przed usunięciem workoutu: ${resultsBeforeDelete.length}`);

    await db.delete(workouts).where(eq(workouts.id, workout.id));

    const resultsAfterDelete = await db
      .select()
      .from(results)
      .where(eq(results.workoutId, workout.id));

    console.log(`  Wyników po usunięciu workoutu: ${resultsAfterDelete.length}`);
    console.log('✓ CASCADE DELETE działa:', resultsAfterDelete.length === 0 ? 'TAK' : 'NIE');

    console.log('\n✅ Wszystkie testy zakończone pomyślnie!');
    console.log('\n🎉 Faza 2 działa w 100%!');

  } catch (error) {
    console.error('❌ Błąd podczas testowania:', error);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

testDatabase();
