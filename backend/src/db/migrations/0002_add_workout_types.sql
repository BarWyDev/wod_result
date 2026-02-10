-- Add workout type and result unit columns
ALTER TABLE workouts
  ADD COLUMN IF NOT EXISTS workout_type VARCHAR(20),
  ADD COLUMN IF NOT EXISTS result_unit VARCHAR(20);

-- Add index for filtering by workout type
CREATE INDEX IF NOT EXISTS idx_workouts_type ON workouts(workout_type);

-- Add check constraint for workout_type (optional, nullable)
ALTER TABLE workouts DROP CONSTRAINT IF EXISTS workouts_workout_type_check;
ALTER TABLE workouts ADD CONSTRAINT workouts_workout_type_check
  CHECK (workout_type IS NULL OR workout_type IN ('for_time', 'amrap', 'emom', 'tabata', 'chipper', 'ladder', 'load', 'custom'));

-- Add check constraint for result_unit (optional, nullable)
ALTER TABLE workouts DROP CONSTRAINT IF EXISTS workouts_result_unit_check;
ALTER TABLE workouts ADD CONSTRAINT workouts_result_unit_check
  CHECK (result_unit IS NULL OR result_unit IN ('time', 'rounds', 'reps', 'weight', 'custom'));
