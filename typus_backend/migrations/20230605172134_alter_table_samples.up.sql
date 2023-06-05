ALTER TABLE code_samples
ADD COLUMN difficulty integer CHECK (difficulty >= 0 AND difficulty <= 10) NOT NULL DEFAULT 0,
ADD COLUMN completed_cnt integer NOT NULL DEFAULT 0;
