import { Router } from 'express';
import * as resultService from '../services/resultService';
import * as workoutService from '../services/workoutService';
import { resultLimiter } from '../middleware/rateLimiter';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const router = Router();

// POST /api/results - Dodanie wyniku
router.post('/', resultLimiter, async (req, res, next) => {
  try {
    const { workoutId, athleteName, gender, resultValue, roundDetails, comment, isDnf } = req.body;

    if (!workoutId || !athleteName || !gender) {
      return res.status(400).json({ error: 'Brak wymaganych pól' });
    }

    if (!UUID_REGEX.test(workoutId)) {
      return res.status(400).json({ error: 'Nieprawidłowy format workoutId' });
    }

    if (typeof athleteName !== 'string' || athleteName.length > 255) {
      return res.status(400).json({ error: 'Nazwa atlety musi mieć maksymalnie 255 znaków' });
    }

    if (resultValue && (typeof resultValue !== 'string' || resultValue.length > 100)) {
      return res.status(400).json({ error: 'Wynik musi mieć maksymalnie 100 znaków' });
    }

    if (!['M', 'F'].includes(gender)) {
      return res.status(400).json({ error: 'Nieprawidłowa wartość płci' });
    }

    // Walidacja comment
    if (comment !== undefined && comment !== null) {
      if (typeof comment !== 'string' || comment.length > 500) {
        return res.status(400).json({ error: 'Komentarz może mieć maksymalnie 500 znaków' });
      }
    }

    // Walidacja isDnf
    if (isDnf !== undefined && typeof isDnf !== 'boolean') {
      return res.status(400).json({ error: 'isDnf musi być wartością boolean' });
    }

    // Walidacja roundDetails jeśli są dostarczone
    if (roundDetails) {
      if (!roundDetails.rounds || !Array.isArray(roundDetails.rounds)) {
        return res.status(400).json({ error: 'roundDetails musi zawierać tablicę rounds' });
      }

      if (roundDetails.rounds.length === 0) {
        return res.status(400).json({ error: 'roundDetails musi zawierać przynajmniej jedną rundę' });
      }

      if (roundDetails.rounds.length > 100) {
        return res.status(400).json({ error: 'Zbyt wiele rund (maksymalnie 100)' });
      }

      const allValid = roundDetails.rounds.every((r: any) =>
        typeof r === 'number' && !isNaN(r) && r >= 0 && Number.isFinite(r)
      );

      if (!allValid) {
        return res.status(400).json({ error: 'Wszystkie rundy muszą być prawidłowymi nieujemnymi liczbami' });
      }
    } else if (!isDnf && !resultValue) {
      // Jeśli nie ma roundDetails i nie jest DNF, wymagamy resultValue
      return res.status(400).json({ error: 'Brak wymaganych pól' });
    }

    const { result, resultToken } = await resultService.addResult({
      workoutId,
      athleteName,
      gender,
      resultValue: resultValue || '',
      roundDetails,
      comment: comment || null,
      isDnf: isDnf || false,
    });

    res.status(201).json({ result, resultToken });
  } catch (error) {
    next(error);
  }
});

// GET /api/results/:workoutId - Wyniki dla workoutu
router.get('/:workoutId', async (req, res, next) => {
  try {
    if (!UUID_REGEX.test(req.params.workoutId)) {
      return res.status(400).json({ error: 'Nieprawidłowy format ID' });
    }

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
    if (!UUID_REGEX.test(req.params.id)) {
      return res.status(400).json({ error: 'Nieprawidłowy format ID' });
    }

    const { resultToken, athleteName, gender, resultValue, roundDetails, comment, isDnf } = req.body;

    if (!resultToken || !UUID_REGEX.test(resultToken)) {
      return res.status(400).json({ error: 'Brak lub nieprawidłowy token autoryzacji' });
    }

    if (athleteName && (typeof athleteName !== 'string' || athleteName.length > 255)) {
      return res.status(400).json({ error: 'Nazwa atlety musi mieć maksymalnie 255 znaków' });
    }

    if (resultValue && (typeof resultValue !== 'string' || resultValue.length > 100)) {
      return res.status(400).json({ error: 'Wynik musi mieć maksymalnie 100 znaków' });
    }

    // Walidacja comment
    if (comment !== undefined && comment !== null) {
      if (typeof comment !== 'string' || comment.length > 500) {
        return res.status(400).json({ error: 'Komentarz może mieć maksymalnie 500 znaków' });
      }
    }

    // Walidacja isDnf
    if (isDnf !== undefined && typeof isDnf !== 'boolean') {
      return res.status(400).json({ error: 'isDnf musi być wartością boolean' });
    }

    // Walidacja roundDetails jeśli są dostarczone
    if (roundDetails !== undefined && roundDetails !== null) {
      if (!roundDetails.rounds || !Array.isArray(roundDetails.rounds)) {
        return res.status(400).json({ error: 'roundDetails musi zawierać tablicę rounds' });
      }

      if (roundDetails.rounds.length === 0) {
        return res.status(400).json({ error: 'roundDetails musi zawierać przynajmniej jedną rundę' });
      }

      if (roundDetails.rounds.length > 100) {
        return res.status(400).json({ error: 'Zbyt wiele rund (maksymalnie 100)' });
      }

      const allValid = roundDetails.rounds.every((r: any) =>
        typeof r === 'number' && !isNaN(r) && r >= 0 && Number.isFinite(r)
      );

      if (!allValid) {
        return res.status(400).json({ error: 'Wszystkie rundy muszą być prawidłowymi nieujemnymi liczbami' });
      }
    }

    const result = await resultService.updateResult(req.params.id, resultToken, {
      athleteName,
      gender,
      resultValue,
      roundDetails,
      comment,
      isDnf,
    });

    res.json({ result });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/results/:id - Usunięcie wyniku
router.delete('/:id', async (req, res, next) => {
  try {
    if (!UUID_REGEX.test(req.params.id)) {
      return res.status(400).json({ error: 'Nieprawidłowy format ID' });
    }

    const { resultToken } = req.body;

    if (!resultToken || !UUID_REGEX.test(resultToken)) {
      return res.status(400).json({ error: 'Brak lub nieprawidłowy token autoryzacji' });
    }

    await resultService.deleteResult(req.params.id, resultToken);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

export default router;
