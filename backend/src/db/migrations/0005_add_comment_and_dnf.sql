ALTER TABLE results ADD COLUMN comment TEXT;
ALTER TABLE results ADD COLUMN is_dnf BOOLEAN NOT NULL DEFAULT false;

-- Oznacz istniejące wyniki DNF
UPDATE results SET is_dnf = true WHERE LOWER(result_value) = 'dnf';
