import { Router } from 'express';
import * as workoutService from '../services/workoutService';
import { workoutLimiter } from '../middleware/rateLimiter';

const router = Router();

// POST /api/workouts - Utworzenie workoutu
router.post('/', workoutLimiter, async (req, res, next) => {
  try {
    const { description, workoutDate, sortDirection } = req.body;

    if (!description || !sortDirection) {
      return res.status(400).json({ error: 'Brak wymaganych pól' });
    }

    const { workout, ownerToken } = await workoutService.createWorkout({
      description,
      workoutDate,
      sortDirection,
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
    const { ownerToken } = req.body;

    if (!ownerToken) {
      return res.status(400).json({ error: 'Brak tokenu autoryzacji' });
    }

    await workoutService.deleteWorkout(req.params.id, ownerToken);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

export default router;
