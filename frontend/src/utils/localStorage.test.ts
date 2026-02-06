import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  getMyWorkouts,
  addMyWorkout,
  setWorkoutParticipated,
  getWorkoutOwnerToken,
  removeMyWorkout,
  getMyResults,
  addMyResult,
  getResultToken,
  removeMyResult,
} from './localStorage';

describe('localStorage utilities', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  describe('Workout management', () => {
    it('should return empty array when no workouts', () => {
      const workouts = getMyWorkouts();
      expect(workouts).toEqual([]);
    });

    it('should add a new workout with owner token', () => {
      addMyWorkout('workout-1', 'token-1');
      const workouts = getMyWorkouts();

      expect(workouts).toHaveLength(1);
      expect(workouts[0]).toEqual({
        workoutId: 'workout-1',
        ownerToken: 'token-1',
        participated: false,
      });
    });

    it('should add a new workout without owner token', () => {
      addMyWorkout('workout-2', null);
      const workouts = getMyWorkouts();

      expect(workouts).toHaveLength(1);
      expect(workouts[0]).toEqual({
        workoutId: 'workout-2',
        ownerToken: null,
        participated: false,
      });
    });

    it('should update existing workout with owner token', () => {
      addMyWorkout('workout-1', null);
      addMyWorkout('workout-1', 'token-1');
      const workouts = getMyWorkouts();

      expect(workouts).toHaveLength(1);
      expect(workouts[0].ownerToken).toBe('token-1');
    });

    it('should set workout as participated', () => {
      addMyWorkout('workout-1', 'token-1');
      setWorkoutParticipated('workout-1');
      const workouts = getMyWorkouts();

      expect(workouts[0].participated).toBe(true);
    });

    it('should create workout entry when setting participated if not exists', () => {
      setWorkoutParticipated('workout-new');
      const workouts = getMyWorkouts();

      expect(workouts).toHaveLength(1);
      expect(workouts[0]).toEqual({
        workoutId: 'workout-new',
        ownerToken: null,
        participated: true,
      });
    });

    it('should get workout owner token', () => {
      addMyWorkout('workout-1', 'token-1');
      const token = getWorkoutOwnerToken('workout-1');

      expect(token).toBe('token-1');
    });

    it('should return null for non-existent workout token', () => {
      const token = getWorkoutOwnerToken('nonexistent');

      expect(token).toBeNull();
    });

    it('should remove workout', () => {
      addMyWorkout('workout-1', 'token-1');
      addMyWorkout('workout-2', 'token-2');
      removeMyWorkout('workout-1');
      const workouts = getMyWorkouts();

      expect(workouts).toHaveLength(1);
      expect(workouts[0].workoutId).toBe('workout-2');
    });
  });

  describe('Result management', () => {
    it('should return empty array when no results', () => {
      const results = getMyResults();
      expect(results).toEqual([]);
    });

    it('should add a new result', () => {
      addMyResult('result-1', 'token-1');
      const results = getMyResults();

      expect(results).toHaveLength(1);
      expect(results[0]).toEqual({
        resultId: 'result-1',
        resultToken: 'token-1',
      });
    });

    it('should add multiple results', () => {
      addMyResult('result-1', 'token-1');
      addMyResult('result-2', 'token-2');
      const results = getMyResults();

      expect(results).toHaveLength(2);
    });

    it('should get result token', () => {
      addMyResult('result-1', 'token-1');
      const token = getResultToken('result-1');

      expect(token).toBe('token-1');
    });

    it('should return null for non-existent result token', () => {
      const token = getResultToken('nonexistent');

      expect(token).toBeNull();
    });

    it('should remove result', () => {
      addMyResult('result-1', 'token-1');
      addMyResult('result-2', 'token-2');
      removeMyResult('result-1');
      const results = getMyResults();

      expect(results).toHaveLength(1);
      expect(results[0].resultId).toBe('result-2');
    });
  });
});
