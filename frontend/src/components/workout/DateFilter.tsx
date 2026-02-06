import type { DateFilter as DateFilterType } from '../../types';
import { clsx } from 'clsx';

interface DateFilterProps {
  value: DateFilterType;
  onChange: (value: DateFilterType) => void;
}

const filters: { value: DateFilterType; label: string }[] = [
  { value: 'today', label: 'Dziś' },
  { value: '7days', label: '7 dni' },
  { value: '30days', label: '30 dni' },
  { value: 'all', label: 'Wszystkie' },
];

export function DateFilter({ value, onChange }: DateFilterProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0">
      {filters.map((filter) => (
        <button
          key={filter.value}
          onClick={() => onChange(filter.value)}
          className={clsx(
            'px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors',
            value === filter.value
              ? 'bg-primary-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          )}
        >
          {filter.label}
        </button>
      ))}
    </div>
  );
}
