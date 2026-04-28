-- Migration: Add trip ownership and matching filters
-- Run this after the base schema and auth/profile migrations.

USE expense_buddy;

ALTER TABLE trips
  ADD COLUMN IF NOT EXISTS created_by INT DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS min_age INT DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS max_age INT DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS required_college VARCHAR(120) DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS preferred_gender VARCHAR(40) DEFAULT 'Any',
  ADD COLUMN IF NOT EXISTS required_travel_style VARCHAR(40) DEFAULT NULL;

SET @idx_exists = (
  SELECT COUNT(*)
  FROM information_schema.STATISTICS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'trips'
    AND INDEX_NAME = 'idx_trips_created_by'
);
SET @idx_sql = IF(@idx_exists = 0, 'CREATE INDEX idx_trips_created_by ON trips(created_by)', 'SELECT 1');
PREPARE idx_stmt FROM @idx_sql;
EXECUTE idx_stmt;
DEALLOCATE PREPARE idx_stmt;

-- Keep existing rows usable by assigning creator from the coordinator member record.
UPDATE trips t
LEFT JOIN trip_members tm ON tm.trip_id = t.id AND tm.role = 'Coordinator'
SET t.created_by = COALESCE(t.created_by, tm.user_id)
WHERE t.created_by IS NULL;

SET @fk_exists = (
  SELECT COUNT(*)
  FROM information_schema.TABLE_CONSTRAINTS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'trips'
    AND CONSTRAINT_NAME = 'fk_trips_created_by'
    AND CONSTRAINT_TYPE = 'FOREIGN KEY'
);
SET @fk_sql = IF(
  @fk_exists = 0,
  'ALTER TABLE trips ADD CONSTRAINT fk_trips_created_by FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL',
  'SELECT 1'
);
PREPARE fk_stmt FROM @fk_sql;
EXECUTE fk_stmt;
DEALLOCATE PREPARE fk_stmt;
