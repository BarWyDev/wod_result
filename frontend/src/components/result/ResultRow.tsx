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
    <div
      className={clsx(
        'flex items-center gap-5 p-5 border-b border-slate-100 last:border-b-0 transition-colors duration-200',
        isOwner && 'bg-primary-50'
      )}
    >
      <span className="w-10 text-xl font-semibold text-slate-400">{position}</span>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2.5">
          <span className="font-medium text-slate-900 text-base">
            {result.athleteName}
          </span>
          <span className="text-base text-slate-500">
            {result.gender === 'M' ? '♂' : '♀'}
          </span>
        </div>
      </div>

      <span className="font-mono text-lg font-medium text-slate-900">
        {result.resultValue}
      </span>

      {isOwner && (
        <div className="flex gap-3">
          <button
            onClick={() => onEdit(result)}
            className="text-sm font-medium text-primary-600 hover:text-primary-700 transition-colors duration-200"
          >
            Edytuj
          </button>
          <button
            onClick={() => onDelete(result)}
            className="text-sm font-medium text-red-600 hover:text-red-700 transition-colors duration-200"
          >
            Usuń
          </button>
        </div>
      )}
    </div>
  );
}
