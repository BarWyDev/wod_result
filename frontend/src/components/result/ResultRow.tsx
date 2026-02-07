import { useState } from 'react';
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
  const [isExpanded, setIsExpanded] = useState(false);

  const hasRoundDetails = result.roundDetails?.rounds && result.roundDetails.rounds.length > 0;

  return (
    <div className="border-b border-slate-100 last:border-b-0">
      {/* Main row */}
      <div
        className={clsx(
          'flex items-center gap-5 p-5 transition-colors duration-200',
          isOwner && 'bg-primary-50'
        )}
      >
        <span className="w-10 text-xl font-semibold text-slate-400">{position}</span>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2.5">
            <span className="font-medium text-slate-900 text-base">
              {result.athleteName}
            </span>
            <span className={clsx(
              "text-xl font-extrabold",
              result.gender === 'M' ? 'text-blue-600' : 'text-pink-600'
            )}>
              {result.gender === 'M' ? '♂' : '♀'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="font-mono text-lg font-medium text-slate-900">
            {result.resultValue}
          </span>

          {hasRoundDetails && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-slate-400 hover:text-slate-600 transition-colors p-1"
              aria-label={isExpanded ? 'Zwiń szczegóły rund' : 'Rozwiń szczegóły rund'}
              aria-expanded={isExpanded}
            >
              {isExpanded ? '▼' : '▶'}
            </button>
          )}
        </div>

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

      {/* Expandable round details */}
      {isExpanded && hasRoundDetails && (
        <div className="px-5 pb-5 pt-0 bg-slate-50">
          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
            {result.roundDetails!.rounds.map((round, idx) => (
              <div key={idx} className="text-center p-2 bg-white rounded border border-slate-200">
                <div className="text-xs text-slate-500 mb-1">R{idx + 1}</div>
                <div className="font-mono font-medium text-slate-900">{round}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
