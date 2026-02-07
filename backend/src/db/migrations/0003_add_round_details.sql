-- Add round_details column for storing per-round scores
ALTER TABLE results
  ADD COLUMN round_details JSONB;

-- Add GIN index for efficient JSONB queries
CREATE INDEX idx_results_round_details ON results USING GIN (round_details);

-- Add documentation comment
COMMENT ON COLUMN results.round_details IS 'JSON array of per-round scores for EMOM/Tabata workouts. Format: {"rounds": [12, 15, 14, ...]}';
