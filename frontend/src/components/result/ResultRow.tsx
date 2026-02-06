import { clsx } from 'clsx';
import type { Result } from '../../types';
import { useAuth } from '../../context/AuthContext';

interface ResultRowProps {
  result: Result;
  position: number;
  onEdit: (result: Result) => void;
  onDelete: (result: Result) => void;
}

export function ResultRow({ result, position, onEdit, onDelete }: ResultRowProps) {
  const { isResultOwner } = useAuth();
  const isOwner = isResultOwner(result.id);

  return (
    <div className={clsx(
      'flex items-center gap-4 p-4 border-b border-gray-100',
      isOwner && 'bg-primary-50'
    )}>
      <span className="w-8 text-lg font-bold text-gray-400">
        {position}
      </span>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium text-gray-900">
            {result.athleteName}
          </span>
          <span className="text-sm text-gray-500">
            {result.gender === 'M' ? '♂' : '♀'}
          </span>
        </div>
      </div>

      <span className="font-mono text-lg">
        {result.resultValue}
      </span>

      {isOwner && (
        <div className="flex gap-2">
          <button
            onClick={() => onEdit(result)}
            className="text-sm text-primary-600 hover:text-primary-700"
          >
            Edytuj
          </button>
          <button
            onClick={() => onDelete(result)}
            className="text-sm text-red-600 hover:text-red-700"
          >
            Usuń
          </button>
        </div>
      )}
    </div>
  );
}
