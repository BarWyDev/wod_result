import type { WorkoutType } from '../types';

export interface WorkoutTypeOption {
  value: WorkoutType;
  emoji: string;
  label: string;
  description: string;
  placeholder: string;
  hint: string;
  sortDirection: 'asc' | 'desc';
  resultUnit: string;
}

export const WORKOUT_TYPE_OPTIONS: WorkoutTypeOption[] = [
  {
    value: 'for_time',
    emoji: '⏱️',
    label: 'For Time',
    description: 'Najszybszy czas',
    placeholder: 'Czas',
    hint: 'Wpisz minuty i sekundy',
    sortDirection: 'asc',
    resultUnit: 'time',
  },
  {
    value: 'amrap',
    emoji: '🔄',
    label: 'AMRAP',
    description: 'Najwięcej rund',
    placeholder: '5',
    hint: 'Wpisz liczbę rund',
    sortDirection: 'desc',
    resultUnit: 'rounds',
  },
  {
    value: 'emom',
    emoji: '⏰',
    label: 'EMOM',
    description: 'Rundy co minutę',
    placeholder: '10',
    hint: 'Wpisz liczbę rund',
    sortDirection: 'desc',
    resultUnit: 'rounds',
  },
  {
    value: 'tabata',
    emoji: '💪',
    label: 'Tabata',
    description: '20s praca, 10s odpoczynek',
    placeholder: '120',
    hint: 'Wpisz łączną liczbę powtórzeń',
    sortDirection: 'desc',
    resultUnit: 'reps',
  },
  {
    value: 'chipper',
    emoji: '📋',
    label: 'Chipper',
    description: 'Sekwencja ćwiczeń',
    placeholder: 'Czas',
    hint: 'Wpisz minuty i sekundy',
    sortDirection: 'asc',
    resultUnit: 'time',
  },
  {
    value: 'ladder',
    emoji: '🪜',
    label: 'Ladder',
    description: 'Rosnące/malejące reps',
    placeholder: '8',
    hint: 'Wpisz liczbę rund',
    sortDirection: 'desc',
    resultUnit: 'rounds',
  },
  {
    value: 'load',
    emoji: '🏋️',
    label: '1RM / Obciążenie',
    description: 'Maksymalne obciążenie',
    placeholder: '100',
    hint: 'Wpisz ciężar w kg',
    sortDirection: 'desc',
    resultUnit: 'weight',
  },
  {
    value: 'custom',
    emoji: '⚙️',
    label: 'Custom',
    description: 'Inny typ workout',
    placeholder: '0',
    hint: 'Wpisz wynik liczbowy',
    sortDirection: 'desc',
    resultUnit: 'custom',
  },
];

export function getWorkoutTypeConfig(workoutType: WorkoutType | null | undefined): WorkoutTypeOption {
  if (!workoutType) {
    return WORKOUT_TYPE_OPTIONS.find(opt => opt.value === 'custom')!;
  }
  return WORKOUT_TYPE_OPTIONS.find(opt => opt.value === workoutType) || WORKOUT_TYPE_OPTIONS[7];
}

export function getWorkoutTypeLabel(workoutType: WorkoutType | null | undefined): string {
  const config = getWorkoutTypeConfig(workoutType);
  return `${config.emoji} ${config.label}`;
}

export function getSortDirectionLabel(sortDirection: 'asc' | 'desc'): string {
  return sortDirection === 'asc'
    ? 'Od najniższej (najszybszy czas wygrywa)'
    : 'Od najwyższej (najwięcej reps/rund wygrywa)';
}
