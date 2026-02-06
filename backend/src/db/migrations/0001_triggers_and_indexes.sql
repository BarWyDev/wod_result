-- Funkcja dla auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggery
CREATE TRIGGER update_workouts_updated_at
    BEFORE UPDATE ON workouts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_results_updated_at
    BEFORE UPDATE ON results
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Indeksy
CREATE INDEX idx_workouts_workout_date ON workouts(workout_date);
CREATE INDEX idx_workouts_created_at_desc ON workouts(created_at DESC);
CREATE INDEX idx_results_workout_id ON results(workout_id);
CREATE INDEX idx_results_workout_numeric ON results(workout_id, result_numeric);

-- CHECK constraints
ALTER TABLE workouts ADD CONSTRAINT workouts_workout_date_check
    CHECK (workout_date <= CURRENT_DATE);
ALTER TABLE workouts ADD CONSTRAINT workouts_sort_direction_check
    CHECK (sort_direction IN ('asc', 'desc'));
ALTER TABLE results ADD CONSTRAINT results_gender_check
    CHECK (gender IN ('M', 'F'));
