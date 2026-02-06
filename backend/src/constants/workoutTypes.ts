export const WORKOUT_TYPES = {
  FOR_TIME: 'for_time',
  AMRAP: 'amrap',
  EMOM: 'emom',
  TABATA: 'tabata',
  CHIPPER: 'chipper',
  LADDER: 'ladder',
  LOAD: 'load',
  CUSTOM: 'custom',
} as const;

export type WorkoutType = typeof WORKOUT_TYPES[keyof typeof WORKOUT_TYPES];

export const RESULT_UNITS = {
  TIME: 'time',
  ROUNDS: 'rounds',
  REPS: 'reps',
  WEIGHT: 'weight',
  CUSTOM: 'custom',
} as const;

export type ResultUnit = typeof RESULT_UNITS[keyof typeof RESULT_UNITS];

export interface WorkoutTypeConfig {
  value: WorkoutType;
  label: string;
  description: string;
  resultUnit: ResultUnit;
  sortDirection: 'asc' | 'desc';
  placeholder: string;
  hint: string;
}

export const WORKOUT_TYPE_CONFIGS: Record<WorkoutType, WorkoutTypeConfig> = {
  [WORKOUT_TYPES.FOR_TIME]: {
    value: WORKOUT_TYPES.FOR_TIME,
    label: 'For Time',
    description: 'Complete the prescribed work as fast as possible',
    resultUnit: RESULT_UNITS.TIME,
    sortDirection: 'asc',
    placeholder: 'mm:ss (e.g., 12:45)',
    hint: 'Enter time in format: mm:ss or hh:mm:ss',
  },
  [WORKOUT_TYPES.AMRAP]: {
    value: WORKOUT_TYPES.AMRAP,
    label: 'AMRAP',
    description: 'As Many Rounds/Reps As Possible in time limit',
    resultUnit: RESULT_UNITS.ROUNDS,
    sortDirection: 'desc',
    placeholder: 'Rounds (e.g., 5)',
    hint: 'Enter number of rounds completed',
  },
  [WORKOUT_TYPES.EMOM]: {
    value: WORKOUT_TYPES.EMOM,
    label: 'EMOM',
    description: 'Every Minute On the Minute - work at start of each minute',
    resultUnit: RESULT_UNITS.ROUNDS,
    sortDirection: 'desc',
    placeholder: 'Rounds (e.g., 10)',
    hint: 'Enter number of rounds completed',
  },
  [WORKOUT_TYPES.TABATA]: {
    value: WORKOUT_TYPES.TABATA,
    label: 'Tabata',
    description: '20 seconds work, 10 seconds rest for 8 rounds',
    resultUnit: RESULT_UNITS.REPS,
    sortDirection: 'desc',
    placeholder: 'Total reps (e.g., 120)',
    hint: 'Enter total number of reps across all rounds',
  },
  [WORKOUT_TYPES.CHIPPER]: {
    value: WORKOUT_TYPES.CHIPPER,
    label: 'Chipper',
    description: 'Complete list of exercises in sequence',
    resultUnit: RESULT_UNITS.TIME,
    sortDirection: 'asc',
    placeholder: 'mm:ss (e.g., 18:30)',
    hint: 'Enter time in format: mm:ss or hh:mm:ss',
  },
  [WORKOUT_TYPES.LADDER]: {
    value: WORKOUT_TYPES.LADDER,
    label: 'Ladder',
    description: 'Reps increase or decrease each round',
    resultUnit: RESULT_UNITS.ROUNDS,
    sortDirection: 'desc',
    placeholder: 'Rounds (e.g., 8)',
    hint: 'Enter number of rounds completed',
  },
  [WORKOUT_TYPES.LOAD]: {
    value: WORKOUT_TYPES.LOAD,
    label: '1RM / Load',
    description: 'Maximum weight lifted',
    resultUnit: RESULT_UNITS.WEIGHT,
    sortDirection: 'desc',
    placeholder: 'Weight (e.g., 100)',
    hint: 'Enter weight in kg or lbs',
  },
  [WORKOUT_TYPES.CUSTOM]: {
    value: WORKOUT_TYPES.CUSTOM,
    label: 'Custom',
    description: 'Any other workout format',
    resultUnit: RESULT_UNITS.CUSTOM,
    sortDirection: 'desc',
    placeholder: 'Your result',
    hint: 'Enter result in any format',
  },
};

export const ALLOWED_WORKOUT_TYPES = Object.values(WORKOUT_TYPES);

export function getWorkoutTypeConfig(workoutType: WorkoutType | null): WorkoutTypeConfig {
  if (!workoutType) {
    return WORKOUT_TYPE_CONFIGS[WORKOUT_TYPES.CUSTOM];
  }
  return WORKOUT_TYPE_CONFIGS[workoutType] || WORKOUT_TYPE_CONFIGS[WORKOUT_TYPES.CUSTOM];
}
