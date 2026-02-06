import type { GenderFilter as GenderFilterType } from '../../types';
import { clsx } from 'clsx';

interface GenderFilterProps {
  value: GenderFilterType;
  onChange: (value: GenderFilterType) => void;
}

const options: { value: GenderFilterType; label: string }[] = [
  { value: 'all', label: 'Wszyscy' },
  { value: 'M', label: 'Mężczyźni' },
  { value: 'F', label: 'Kobiety' },
];

export function GenderFilter({ value, onChange }: GenderFilterProps) {
  return (
    <div className="inline-flex rounded bg-slate-100 p-1 border border-slate-200">
      {options.map((option) => (
        <button
          key={option.value}
          onClick={() => onChange(option.value)}
          className={clsx(
            'px-4 py-1.5 text-sm font-medium rounded transition-all duration-200',
            value === option.value
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-700 hover:text-slate-900'
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
