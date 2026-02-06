import { describe, it, expect, vi, beforeEach } from 'vitest';
import { addResult, updateResult, deleteResult } from './resultService';
import * as dbModule from '../db';

// Mock the database module
vi.mock('../db', () => ({
  db: {
    insert: vi.fn(),
    select: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
}));

// Mock the resultParser
vi.mock('../utils/resultParser', () => ({
  parseResultNumeric: vi.fn((value: string) => {
    if (value === '12:45') return 765;
    if (value === '150') return 150;
    if (value === 'DNF') return null;
    return null;
  }),
}));

describe('resultService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('addResult', () => {
    it('should add result with parsed numeric value', async () => {
      const mockWorkout = {
        id: 'workout-123',
        description: 'Test WOD',
        workoutDate: '2026-02-06',
        sortDirection: 'desc',
        ownerToken: 'token-123',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockResult = {
        id: 'result-123',
        workoutId: 'workout-123',
        resultToken: 'result-token-123',
        athleteName: 'Jan Kowalski',
        gender: 'M',
        resultValue: '12:45',
        resultNumeric: '765',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockSelect = vi.fn().mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue([mockWorkout]),
        }),
      });

      const mockInsert = vi.fn().mockReturnValue({
        values: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([mockResult]),
        }),
      });

      (dbModule.db.select as any) = mockSelect;
      (dbModule.db.insert as any) = mockInsert;

      const result = await addResult({
        workoutId: 'workout-123',
        athleteName: 'Jan Kowalski',
        gender: 'M',
        resultValue: '12:45',
      });

      expect(result).toHaveProperty('result');
      expect(result).toHaveProperty('resultToken');
      expect(result.result.athleteName).toBe('Jan Kowalski');
      expect(result.resultToken).toBeTruthy();
    });

    it('should throw error if workout not found', async () => {
      const mockSelect = vi.fn().mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue([]),
        }),
      });

      (dbModule.db.select as any) = mockSelect;

      await expect(
        addResult({
          workoutId: 'nonexistent-workout',
          athleteName: 'Jan Kowalski',
          gender: 'M',
          resultValue: '12:45',
        })
      ).rejects.toThrow('Workout nie został znaleziony');
    });
  });

  describe('updateResult', () => {
    it('should throw error if result not found', async () => {
      const mockSelect = vi.fn().mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue([]),
        }),
      });

      (dbModule.db.select as any) = mockSelect;

      await expect(
        updateResult('nonexistent-id', 'token-123', {
          athleteName: 'Updated Name',
        })
      ).rejects.toThrow('Wynik nie został znaleziony');
    });

    it('should throw error if resultToken does not match', async () => {
      const mockResult = {
        id: 'result-123',
        resultToken: 'correct-token',
        workoutId: 'workout-123',
        athleteName: 'Jan Kowalski',
        gender: 'M',
        resultValue: '12:45',
        resultNumeric: '765',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockSelect = vi.fn().mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue([mockResult]),
        }),
      });

      (dbModule.db.select as any) = mockSelect;

      await expect(
        updateResult('result-123', 'wrong-token', {
          athleteName: 'Updated Name',
        })
      ).rejects.toThrow('Brak uprawnień do edycji wyniku');
    });
  });

  describe('deleteResult', () => {
    it('should throw error if result not found', async () => {
      const mockSelect = vi.fn().mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue([]),
        }),
      });

      (dbModule.db.select as any) = mockSelect;

      await expect(
        deleteResult('nonexistent-id', 'token-123')
      ).rejects.toThrow('Wynik nie został znaleziony');
    });

    it('should throw error if resultToken does not match', async () => {
      const mockResult = {
        id: 'result-123',
        resultToken: 'correct-token',
        workoutId: 'workout-123',
        athleteName: 'Jan Kowalski',
        gender: 'M',
        resultValue: '12:45',
        resultNumeric: '765',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockSelect = vi.fn().mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue([mockResult]),
        }),
      });

      (dbModule.db.select as any) = mockSelect;

      await expect(
        deleteResult('result-123', 'wrong-token')
      ).rejects.toThrow('Brak uprawnień do usunięcia wyniku');
    });
  });
});
