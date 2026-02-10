-- Funkcja dla auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggery
DROP TRIGGER IF EXISTS update_workouts_updated_at ON workouts;
CREATE TRIGGER update_workouts_updated_at
    BEFORE UPDATE ON workouts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_results_updated_at ON results;
CREATE TRIGGER update_results_updated_at
    BEFORE UPDATE ON results
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Indeksy
CREATE INDEX IF NOT EXISTS idx_workouts_workout_date ON workouts(workout_date);
CREATE INDEX IF NOT EXISTS idx_workouts_created_at_desc ON workouts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_results_workout_id ON results(workout_id);
CREATE INDEX IF NOT EXISTS idx_results_workout_numeric ON results(workout_id, result_numeric);

-- CHECK constraints
ALTER TABLE workouts DROP CONSTRAINT IF EXISTS workouts_workout_date_check;
ALTER TABLE workouts ADD CONSTRAINT workouts_workout_date_check
    CHECK (workout_date <= CURRENT_DATE + INTERVAL '1 year');
ALTER TABLE workouts DROP CONSTRAINT IF EXISTS workouts_sort_direction_check;
ALTER TABLE workouts ADD CONSTRAINT workouts_sort_direction_check
    CHECK (sort_direction IN ('asc', 'desc'));
ALTER TABLE results DROP CONSTRAINT IF EXISTS results_gender_check;
ALTER TABLE results ADD CONSTRAINT results_gender_check
    CHECK (gender IN ('M', 'F'));
