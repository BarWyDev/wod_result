import { Link } from 'react-router-dom';
import type { Workout } from '../../types';

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
