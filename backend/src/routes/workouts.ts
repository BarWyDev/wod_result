import { Router } from 'express';
import * as workoutService from '../services/workoutService';
import { workoutLimiter } from '../middleware/rateLimiter';
import { ALLOWED_WORKOUT_TYPES } from '../constants/workoutTypes';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const router = Router();

// POST /api/workouts - Utworzenie workoutu
router.post('/', workoutLimiter, async (req, res, next) => {
  try {
    const { description, workoutDate, sortDirection, workoutType } = req.body;

    if (!description) {
      return res.status(400).json({ error: 'Brak wymaganych pól' });
    }

    if (typeof description !== 'string' || description.length > 5000) {
      return res.status(400).json({ error: 'Opis musi mieć maksymalnie 5000 znaków' });
    }

    // Validate workoutType if provided
    if (workoutType && !ALLOWED_WORKOUT_TYPES.includes(workoutType)) {
      return res.status(400).json({ error: 'Nieprawidłowy typ workoutu' });
    }

    // Validate workoutDate if provided - not more than 1 year in the future
    if (workoutDate) {
      // Validate date format (YYYY-MM-DD)
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(workoutDate)) {
        return res.status(400).json({ error: 'Nieprawidłowy format daty. Użyj formatu YYYY-MM-DD' });
      }

      const selectedDate = new Date(workoutDate);
      const oneYearFromNow = new Date();
      oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);

      if (isNaN(selectedDate.getTime())) {
        return res.status(400).json({ error: 'Nieprawidłowy format daty' });
      }

      if (selectedDate > oneYearFromNow) {
        return res.status(400).json({ error: 'Data nie może być późniejsza niż 1 rok w przyszłość' });
      }
    }

    // If workoutType is provided, sortDirection is auto-determined
    // If no workoutType, sortDirection is required (backward compatibility)
    if (!workoutType && !sortDirection) {
      return res.status(400).json({ error: 'Brak wymaganych pól' });
    }

    const { workout, ownerToken } = await workoutService.createWorkout({
      description,
      workoutDate,
      sortDirection,
      workoutType: workoutType || null,
    });

    res.status(201).json({ workout, ownerToken });
  } catch (error) {
    next(error);
  }
});

// GET /api/workouts - Lista workoutów
router.get('/', async (req, res, next) => {
  try {
    const { dateFilter } = req.query;
    const workouts = await workoutService.getWorkouts(dateFilter as string);
    res.json({ workouts });
  } catch (error) {
    next(error);
  }
});

// GET /api/workouts/:id - Pojedynczy workout
router.get('/:id', async (req, res, next) => {
  try {
    if (!UUID_REGEX.test(req.params.id)) {
      return res.status(400).json({ error: 'Nieprawidłowy format ID' });
    }

    const workout = await workoutService.getWorkoutById(req.params.id);

    if (!workout) {
      return res.status(404).json({ error: 'Workout nie został znaleziony' });
    }

    res.json({ workout });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/workouts/:id - Usunięcie workoutu
router.delete('/:id', async (req, res, next) => {
  try {
    if (!UUID_REGEX.test(req.params.id)) {
      return res.status(400).json({ error: 'Nieprawidłowy format ID' });
    }

    const { ownerToken } = req.body;

    if (!ownerToken || !UUID_REGEX.test(ownerToken)) {
      return res.status(400).json({ error: 'Brak lub nieprawidłowy token autoryzacji' });
    }

    await workoutService.deleteWorkout(req.params.id, ownerToken);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

export default router;
