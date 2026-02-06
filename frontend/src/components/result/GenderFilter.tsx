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
    <div className="inline-flex rounded-lg bg-gray-100 p-1">
      {options.map((option) => (
        <button
          key={option.value}
          onClick={() => onChange(option.value)}
          className={clsx(
            'px-4 py-2 text-sm font-medium rounded-md transition-colors',
            value === option.value
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
