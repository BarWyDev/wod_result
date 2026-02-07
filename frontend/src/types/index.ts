export type WorkoutType = 'for_time' | 'amrap' | 'emom' | 'tabata' | 'chipper' | 'ladder' | 'load' | 'custom';

export interface Workout {
  id: string;
  description: string;
  workoutDate: string;
  sortDirection: 'asc' | 'desc';
  workoutType?: WorkoutType | null;
  resultUnit?: string | null;
  createdAt: string;
  resultCount?: number;
}

export interface RoundDetails {
  rounds: number[];
}

export interface Result {
  id: string;
  workoutId: string;
  athleteName: string;
  gender: 'M' | 'F';
  resultValue: string;
  resultNumeric: string | null;
  roundDetails?: RoundDetails | null;
  createdAt: string;
}

export interface WorkoutOwnership {
  workoutId: string;
  ownerToken: string | null;
  participated: boolean;
}

export interface ResultOwnership {
  resultId: string;
  resultToken: string;
}

export type GenderFilter = 'all' | 'M' | 'F';
export type DateFilter = 'today' | '7days' | '30days' | 'all';
