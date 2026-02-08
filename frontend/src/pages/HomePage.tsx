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
      <div className="mb-10">
        <h1 className="text-4xl font-semibold text-slate-900 mb-6 tracking-tight">
          Workouty
        </h1>
        <DateFilter value={dateFilter} onChange={setDateFilter} />
      </div>

      {isLoading && (
        <div className="text-center py-16">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary-600 border-r-transparent"></div>
          <p className="mt-6 text-slate-700">Ładowanie workoutów...</p>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-300 rounded p-5 text-red-900">
          Wystąpił błąd podczas ładowania workoutów. Spróbuj ponownie później.
        </div>
      )}

      {!isLoading && !error && workouts && (
        <>
          {myWorkoutsList.length > 0 && (
            <section className="mb-12">
              <h2 className="text-2xl font-semibold text-slate-900 mb-6">
                Moje workouty ({myWorkoutsList.length})
              </h2>
              <div className="space-y-4">
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
              <h2 className="text-2xl font-semibold text-slate-900 mb-6">
                {myWorkoutsList.length > 0 ? 'Inne workouty' : 'Wszystkie workouty'} ({otherWorkouts.length})
              </h2>
              <div className="space-y-4">
                {otherWorkouts.map((workout) => (
                  <WorkoutCard key={workout.id} workout={workout} />
                ))}
              </div>
            </section>
          )}

          {workouts.length === 0 && (
            <div className="text-center py-20">
              <div className="text-7xl mb-6">🏋️</div>
              <h3 className="text-2xl font-semibold text-slate-900 mb-3">
                Brak workoutów
              </h3>
              <p className="text-slate-700 text-lg max-w-md mx-auto mb-8">
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
