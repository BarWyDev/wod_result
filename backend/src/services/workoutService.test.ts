import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createWorkout, getWorkouts, getWorkoutById, deleteWorkout } from './workoutService';
import * as dbModule from '../db';

// Mock the database module
vi.mock('../db', () => ({
  db: {
    insert: vi.fn(),
    select: vi.fn(),
    delete: vi.fn(),
  },
}));

describe('workoutService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createWorkout', () => {
    it('should create a workout with generated ownerToken', async () => {
      const mockWorkout = {
        id: 'workout-123',
        description: 'Test WOD',
        workoutDate: '2026-02-06',
        sortDirection: 'desc',
        ownerToken: 'token-123',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockInsert = vi.fn().mockReturnValue({
        values: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([mockWorkout]),
        }),
      });

      (dbModule.db.insert as any) = mockInsert;

      const result = await createWorkout({
        description: 'Test WOD',
        sortDirection: 'desc',
      });

      expect(result).toHaveProperty('workout');
      expect(result).toHaveProperty('ownerToken');
      expect(result.workout.description).toBe('Test WOD');
      expect(result.ownerToken).toBeTruthy();
      expect(typeof result.ownerToken).toBe('string');
    });

    it('should use current date if workoutDate not provided', async () => {
      const mockWorkout = {
        id: 'workout-123',
        description: 'Test WOD',
        workoutDate: new Date().toISOString().split('T')[0],
        sortDirection: 'asc',
        ownerToken: 'token-123',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockInsert = vi.fn().mockReturnValue({
        values: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([mockWorkout]),
        }),
      });

      (dbModule.db.insert as any) = mockInsert;

      const result = await createWorkout({
        description: 'Test WOD',
        sortDirection: 'asc',
      });

      expect(result.workout.workoutDate).toBe(new Date().toISOString().split('T')[0]);
    });
  });

  describe('deleteWorkout', () => {
    it('should throw error if workout not found', async () => {
      const mockSelect = vi.fn().mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue([]),
        }),
      });

      (dbModule.db.select as any) = mockSelect;

      await expect(
        deleteWorkout('nonexistent-id', 'token-123')
      ).rejects.toThrow('Workout nie został znaleziony');
    });

    it('should throw error if ownerToken does not match', async () => {
      const mockWorkout = {
        id: 'workout-123',
        ownerToken: 'correct-token',
        description: 'Test WOD',
        workoutDate: '2026-02-06',
        sortDirection: 'desc',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockSelect = vi.fn().mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue([mockWorkout]),
        }),
      });

      (dbModule.db.select as any) = mockSelect;

      await expect(
        deleteWorkout('workout-123', 'wrong-token')
      ).rejects.toThrow('Brak uprawnień do usunięcia workoutu');
    });
  });
});
