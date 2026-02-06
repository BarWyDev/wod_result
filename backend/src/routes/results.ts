import { Router } from 'express';
import * as resultService from '../services/resultService';
import * as workoutService from '../services/workoutService';
import { resultLimiter } from '../middleware/rateLimiter';

const router = Router();

// POST /api/results - Dodanie wyniku
router.post('/', resultLimiter, async (req, res, next) => {
  try {
    const { workoutId, athleteName, gender, resultValue } = req.body;

    if (!workoutId || !athleteName || !gender || !resultValue) {
      return res.status(400).json({ error: 'Brak wymaganych pól' });
    }

    if (!['M', 'F'].includes(gender)) {
      return res.status(400).json({ error: 'Nieprawidłowa wartość płci' });
    }

    const { result, resultToken } = await resultService.addResult({
      workoutId,
      athleteName,
      gender,
      resultValue,
    });

    res.status(201).json({ result, resultToken });
  } catch (error) {
    next(error);
  }
});

// GET /api/results/:workoutId - Wyniki dla workoutu
router.get('/:workoutId', async (req, res, next) => {
  try {
    const workout = await workoutService.getWorkoutById(req.params.workoutId);

    if (!workout) {
      return res.status(404).json({ error: 'Workout nie został znaleziony' });
    }

    const results = await resultService.getResultsByWorkout(
      req.params.workoutId,
      workout.sortDirection as 'asc' | 'desc'
    );

    res.json({ results });
  } catch (error) {
    next(error);
  }
});

// PUT /api/results/:id - Edycja wyniku
router.put('/:id', async (req, res, next) => {
  try {
    const { resultToken, athleteName, gender, resultValue } = req.body;

    if (!resultToken) {
      return res.status(400).json({ error: 'Brak tokenu autoryzacji' });
    }

    const result = await resultService.updateResult(req.params.id, resultToken, {
      athleteName,
      gender,
      resultValue,
    });

    res.json({ result });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/results/:id - Usunięcie wyniku
router.delete('/:id', async (req, res, next) => {
  try {
    const { resultToken } = req.body;

    if (!resultToken) {
      return res.status(400).json({ error: 'Brak tokenu autoryzacji' });
    }

    await resultService.deleteResult(req.params.id, resultToken);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

export default router;
