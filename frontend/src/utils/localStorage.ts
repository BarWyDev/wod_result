import type { WorkoutOwnership, ResultOwnership } from '../types';

const WORKOUTS_KEY = 'myWorkouts';
const RESULTS_KEY = 'myResults';

function safeParse<T>(key: string): T[] {
  const data = localStorage.getItem(key);
  if (!data) return [];
  try {
    return JSON.parse(data);
  } catch {
    localStorage.removeItem(key);
    return [];
  }
}

// Workouts
export function getMyWorkouts(): WorkoutOwnership[] {
  return safeParse<WorkoutOwnership>(WORKOUTS_KEY);
}

export function addMyWorkout(workoutId: string, ownerToken: string | null): void {
  const workouts = getMyWorkouts();
  const existing = workouts.find(w => w.workoutId === workoutId);

  if (existing) {
    if (ownerToken) existing.ownerToken = ownerToken;
  } else {
    workouts.push({ workoutId, ownerToken, participated: false });
  }

  localStorage.setItem(WORKOUTS_KEY, JSON.stringify(workouts));
}

export function setWorkoutParticipated(workoutId: string): void {
  const workouts = getMyWorkouts();
  const workout = workouts.find(w => w.workoutId === workoutId);

  if (workout) {
    workout.participated = true;
  } else {
    workouts.push({ workoutId, ownerToken: null, participated: true });
  }

  localStorage.setItem(WORKOUTS_KEY, JSON.stringify(workouts));
}

export function getWorkoutOwnerToken(workoutId: string): string | null {
  const workouts = getMyWorkouts();
  return workouts.find(w => w.workoutId === workoutId)?.ownerToken || null;
}

export function removeMyWorkout(workoutId: string): void {
  const workouts = getMyWorkouts().filter(w => w.workoutId !== workoutId);
  localStorage.setItem(WORKOUTS_KEY, JSON.stringify(workouts));
}

// Results
export function getMyResults(): ResultOwnership[] {
  return safeParse<ResultOwnership>(RESULTS_KEY);
}

export function addMyResult(resultId: string, resultToken: string): void {
  const results = getMyResults();
  results.push({ resultId, resultToken });
  localStorage.setItem(RESULTS_KEY, JSON.stringify(results));
}

export function getResultToken(resultId: string): string | null {
  const results = getMyResults();
  return results.find(r => r.resultId === resultId)?.resultToken || null;
}

export function removeMyResult(resultId: string): void {
  const results = getMyResults().filter(r => r.resultId !== resultId);
  localStorage.setItem(RESULTS_KEY, JSON.stringify(results));
}
