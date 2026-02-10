import { Link } from 'react-router-dom';
import type { Workout } from '../../types';
import { getWorkoutTypeLabel } from '../../constants/workoutTypes';

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
      className="block bg-white rounded border border-slate-200 p-5 hover:border-primary-600 transition-all duration-200 ease-out hover:shadow-sm"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <p className="text-sm text-slate-700 font-medium">
              {formatDate(workout.workoutDate)}
            </p>
            <span className="text-xs bg-primary-100 text-primary-800 px-2 py-1 rounded font-medium">
              {getWorkoutTypeLabel(workout.workoutType)}
            </span>
          </div>
          <p className="text-slate-900 line-clamp-2 text-base leading-relaxed whitespace-pre-line">
            {workout.description}
          </p>
        </div>
        <div className="ml-6 flex flex-col items-end gap-2">
          <span className="text-sm text-slate-700 bg-slate-50 px-3 py-1 rounded">
            {workout.resultCount || 0} {workout.resultCount === 1 ? 'wynik' : 'wyników'}
          </span>
          {isOwner && (
            <span className="text-xs text-primary-600 font-medium bg-primary-50 px-2 py-1 rounded">
              Twój workout
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
