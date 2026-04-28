import { pool } from './src/config/db.js';

const hasCol = async (table, column) => {
  const [rows] = await pool.query(
    'SELECT 1 FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME = ? LIMIT 1',
    [table, column]
  );
  return rows.length > 0;
};

const hasIdx = async (table, indexName) => {
  const [rows] = await pool.query(
    'SELECT 1 FROM information_schema.STATISTICS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND INDEX_NAME = ? LIMIT 1',
    [table, indexName]
  );
  return rows.length > 0;
};

const hasFk = async (constraintName) => {
  const [rows] = await pool.query(
    'SELECT 1 FROM information_schema.TABLE_CONSTRAINTS WHERE TABLE_SCHEMA = DATABASE() AND CONSTRAINT_TYPE = ? AND CONSTRAINT_NAME = ? LIMIT 1',
    ['FOREIGN KEY', constraintName]
  );
  return rows.length > 0;
};

const ensureSchema = async () => {
  const userCols = [
    ['gender', 'VARCHAR(40) NULL'],
    ['city', 'VARCHAR(120) NULL'],
    ['state', 'VARCHAR(120) NULL'],
    ['country', 'VARCHAR(120) NULL'],
    ['degree', 'VARCHAR(120) NULL'],
    ['branch', 'VARCHAR(120) NULL'],
    ['interests', 'TEXT NULL'],
    ['hobbies', 'TEXT NULL'],
    ['travel_style', 'VARCHAR(40) NULL'],
    ['food_preference', 'VARCHAR(40) NULL'],
    ['sleep_preference', 'VARCHAR(40) NULL'],
    ['drinking_preference', 'VARCHAR(40) NULL']
  ];

  for (const [column, definition] of userCols) {
    if (!(await hasCol('users', column))) {
      await pool.query(`ALTER TABLE users ADD COLUMN ${column} ${definition}`);
      console.log(`added users.${column}`);
    }
  }

  const tripCols = [
    ['created_by', 'INT NULL'],
    ['min_age', 'INT NULL'],
    ['max_age', 'INT NULL'],
    ['required_college', 'VARCHAR(120) NULL'],
    ['preferred_gender', "VARCHAR(40) NULL DEFAULT 'Any'"],
    ['required_travel_style', 'VARCHAR(40) NULL']
  ];

  for (const [column, definition] of tripCols) {
    if (!(await hasCol('trips', column))) {
      await pool.query(`ALTER TABLE trips ADD COLUMN ${column} ${definition}`);
      console.log(`added trips.${column}`);
    }
  }

  await pool.query(
    `UPDATE trips t
     LEFT JOIN trip_members tm ON tm.trip_id = t.id AND tm.role = 'Coordinator'
     SET t.created_by = COALESCE(t.created_by, tm.user_id)
     WHERE t.created_by IS NULL`
  );

  if (!(await hasIdx('trips', 'idx_trips_created_by'))) {
    await pool.query('CREATE INDEX idx_trips_created_by ON trips(created_by)');
    console.log('added idx_trips_created_by');
  }

  if (await hasCol('trips', 'created_by') && !(await hasFk('fk_trips_created_by'))) {
    await pool.query(
      'ALTER TABLE trips ADD CONSTRAINT fk_trips_created_by FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL'
    );
    console.log('added fk_trips_created_by');
  }

  console.log('schema repair complete');
};

ensureSchema()
  .catch((error) => {
    console.error('schema repair failed:', error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await pool.end();
  });
