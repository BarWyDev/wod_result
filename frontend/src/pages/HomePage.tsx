import { useState } from 'react';
import { useWorkouts } from '../hooks/useWorkouts';
import { useAuth } from '../context/AuthContext';
import type { DateFilter as DateFilterType } from '../types';
import { DateFilter } from '../components/workout/DateFilter';
import { WorkoutCard } from '../components/workout/WorkoutCard';

export default function HomePage() {
  const [dateFilter, setDateFilter] = useState<DateFilterType>('all');
  const { data: workouts, isLoading, error } = useWorkouts(dateFilter);
  const { myWorkouts } = useAuth();

  const myWorkoutIds = new Set(myWorkouts.map((w) => w.workoutId));
  const myWorkoutsList = workouts?.filter((w) => myWorkoutIds.has(w.id)) || [];
  const otherWorkouts = workouts?.filter((w) => !myWorkoutIds.has(w.id)) || [];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Workouty</h1>
        <DateFilter value={dateFilter} onChange={setDateFilter} />
      </div>

      {isLoading && (
        <div className="text-center py-12">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary-600 border-r-transparent"></div>
          <p className="mt-4 text-gray-600">Ładowanie workoutów...</p>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
          Wystąpił błąd podczas ładowania workoutów. Spróbuj ponownie później.
        </div>
      )}

      {!isLoading && !error && workouts && (
        <>
          {myWorkoutsList.length > 0 && (
            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Moje workouty ({myWorkoutsList.length})
              </h2>
              <div className="space-y-3">
                {myWorkoutsList.map((workout) => (
                  <WorkoutCard
                    key={workout.id}
                    workout={workout}
                    isOwner={myWorkouts.find((w) => w.workoutId === workout.id)?.ownerToken !== null}
                  />
                ))}
              </div>
            </section>
          )}

          {otherWorkouts.length > 0 && (
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                {myWorkoutsList.length > 0 ? 'Inne workouty' : 'Wszystkie workouty'} ({otherWorkouts.length})
              </h2>
              <div className="space-y-3">
                {otherWorkouts.map((workout) => (
                  <WorkoutCard key={workout.id} workout={workout} />
                ))}
              </div>
            </section>
          )}

          {workouts.length === 0 && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🏋️</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Brak workoutów
              </h3>
              <p className="text-gray-600 mb-6">
                {dateFilter === 'all'
                  ? 'Nie ma jeszcze żadnych workoutów. Utwórz pierwszy!'
                  : 'Nie znaleziono workoutów w wybranym okresie. Spróbuj zmienić filtr.'}
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
