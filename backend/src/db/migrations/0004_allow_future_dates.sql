-- Remove the constraint that prevents future dates
ALTER TABLE workouts DROP CONSTRAINT IF EXISTS workouts_workout_date_check;

-- Add new constraint: allow dates up to 1 year in the future
ALTER TABLE workouts ADD CONSTRAINT workouts_workout_date_check
    CHECK (workout_date <= CURRENT_DATE + INTERVAL '1 year');
