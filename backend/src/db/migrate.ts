import 'dotenv/config';
import { Pool } from 'pg';
import * as fs from 'fs';
import * as path from 'path';

async function runMigrations() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    console.log('Łączenie z bazą danych...');

    const migrationFiles = [
      '0000_overrated_karma.sql',
      '0001_triggers_and_indexes.sql'
    ];

    for (const file of migrationFiles) {
      const filePath = path.join(__dirname, 'migrations', file);
      console.log(`\nUruchamianie migracji: ${file}`);

      const sql = fs.readFileSync(filePath, 'utf-8');
      await pool.query(sql);

      console.log(`✓ Migracja ${file} wykonana pomyślnie`);
    }

    console.log('\n✓ Wszystkie migracje zostały wykonane pomyślnie');
  } catch (error) {
    console.error('Błąd podczas wykonywania migracji:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runMigrations();
