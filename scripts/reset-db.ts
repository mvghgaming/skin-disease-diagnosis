import { db } from '../src/lib/db/client';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL environment variable is not set');
  console.error('Please set it in your .env.local file');
  process.exit(1);
}

async function resetDatabase() {
  console.log('🗑️  Resetting database...\n');

  try {
    // Drop all tables in reverse order (to handle foreign keys)
    console.log('Dropping tables...');

    await db.query('DROP TABLE IF EXISTS fired_rules CASCADE');
    await db.query('DROP TABLE IF EXISTS session_facts CASCADE');
    await db.query('DROP TABLE IF EXISTS diagnosis_sessions CASCADE');
    await db.query('DROP TABLE IF EXISTS conclusions CASCADE');
    await db.query('DROP TABLE IF EXISTS conditions CASCADE');
    await db.query('DROP TABLE IF EXISTS rules CASCADE');
    await db.query('DROP TABLE IF EXISTS diseases CASCADE');

    console.log('✅ All tables dropped successfully!\n');

    console.log('Now run: pnpm run migrate && pnpm run seed');

  } catch (error) {
    console.error('❌ Reset failed:', error);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

resetDatabase();
