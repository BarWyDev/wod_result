import 'dotenv/config';
import { Pool } from 'pg';

async function createDatabase() {
  // Połącz się z bazą postgres (domyślna)
  const connectionUrl = process.env.DATABASE_URL!;
  const postgresUrl = connectionUrl.replace('/wod_result', '/postgres');

  const pool = new Pool({
    connectionString: postgresUrl,
  });

  try {
    console.log('Łączenie z bazą postgres...');

    // Sprawdź czy baza wod_result już istnieje
    const checkResult = await pool.query(
      "SELECT 1 FROM pg_database WHERE datname = 'wod_result'"
    );

    if (checkResult.rows.length > 0) {
      console.log('✓ Baza danych wod_result już istnieje');
    } else {
      console.log('Tworzenie bazy danych wod_result...');
      await pool.query('CREATE DATABASE wod_result');
      console.log('✓ Baza danych wod_result została utworzona pomyślnie');
    }
  } catch (error) {
    console.error('Błąd podczas tworzenia bazy danych:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

createDatabase();
