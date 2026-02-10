#!/usr/bin/env node
/**
 * Plain JS migration runner - no ts-node required.
 * Used in production deploy where devDependencies may not be available.
 */
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Load .env if dotenv is available
try { require('dotenv/config'); } catch (e) { /* dotenv not required if DATABASE_URL is set */ }

const migrationFiles = [
  '0000_overrated_karma.sql',
  '0001_triggers_and_indexes.sql',
  '0002_add_workout_types.sql',
  '0003_add_round_details.sql',
  '0004_allow_future_dates.sql',
  '0005_add_comment_and_dnf.sql',
];

async function runMigrations() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    console.log('Connecting to database...');

    for (const file of migrationFiles) {
      const filePath = path.join(__dirname, 'src', 'db', 'migrations', file);
      console.log(`Running migration: ${file}`);

      const sql = fs.readFileSync(filePath, 'utf-8');
      await pool.query(sql);

      console.log(`  OK: ${file}`);
    }

    console.log('\nAll migrations completed successfully.');
  } catch (error) {
    console.error('Migration failed:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runMigrations();
