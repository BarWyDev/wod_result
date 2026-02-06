import 'dotenv/config';
import { Pool } from 'pg';

async function verifySchema() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    console.log('Sprawdzanie struktury bazy danych...\n');

    // Sprawdź tabele
    const tablesResult = await pool.query(`
      SELECT tablename
      FROM pg_tables
      WHERE schemaname = 'public'
      ORDER BY tablename
    `);

    console.log('✓ Tabele:');
    tablesResult.rows.forEach(row => console.log(`  - ${row.tablename}`));

    // Sprawdź kolumny w tabeli workouts
    const workoutsColumnsResult = await pool.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'workouts'
      ORDER BY ordinal_position
    `);

    console.log('\n✓ Kolumny tabeli workouts:');
    workoutsColumnsResult.rows.forEach(row => {
      console.log(`  - ${row.column_name}: ${row.data_type} (nullable: ${row.is_nullable})`);
    });

    // Sprawdź kolumny w tabeli results
    const resultsColumnsResult = await pool.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'results'
      ORDER BY ordinal_position
    `);

    console.log('\n✓ Kolumny tabeli results:');
    resultsColumnsResult.rows.forEach(row => {
      console.log(`  - ${row.column_name}: ${row.data_type} (nullable: ${row.is_nullable})`);
    });

    // Sprawdź indeksy
    const indexesResult = await pool.query(`
      SELECT indexname, tablename
      FROM pg_indexes
      WHERE schemaname = 'public'
      ORDER BY tablename, indexname
    `);

    console.log('\n✓ Indeksy:');
    indexesResult.rows.forEach(row => {
      console.log(`  - ${row.indexname} (tabela: ${row.tablename})`);
    });

    // Sprawdź triggery
    const triggersResult = await pool.query(`
      SELECT trigger_name, event_object_table
      FROM information_schema.triggers
      WHERE trigger_schema = 'public'
      ORDER BY event_object_table, trigger_name
    `);

    console.log('\n✓ Triggery:');
    triggersResult.rows.forEach(row => {
      console.log(`  - ${row.trigger_name} (tabela: ${row.event_object_table})`);
    });

    // Sprawdź constraints
    const constraintsResult = await pool.query(`
      SELECT constraint_name, table_name, constraint_type
      FROM information_schema.table_constraints
      WHERE table_schema = 'public'
      AND table_name IN ('workouts', 'results')
      ORDER BY table_name, constraint_type, constraint_name
    `);

    console.log('\n✓ Constraints:');
    constraintsResult.rows.forEach(row => {
      console.log(`  - ${row.constraint_name}: ${row.constraint_type} (tabela: ${row.table_name})`);
    });

    console.log('\n✓ Weryfikacja schematu zakończona pomyślnie!');
  } catch (error) {
    console.error('Błąd podczas weryfikacji schematu:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

verifySchema();
