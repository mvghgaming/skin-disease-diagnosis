import { readFileSync } from 'fs';
import { join } from 'path';
import { neon } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL environment variable is not set');
  console.error('Please set it in your .env.local file');
  process.exit(1);
}

async function runMigrations() {
  console.log('🚀 Starting database migrations...\n');

  if (!DATABASE_URL) {
    console.error('❌ DATABASE_URL environment variable is not set');
    console.error('Please set it in your .env.local file');
    process.exit(1);
  }

  const sql = neon(DATABASE_URL);

  try {
    // Read the migration file
    const migrationPath = join(process.cwd(), 'src', 'lib', 'db', 'migrations', '001_initial.sql');
    const migrationSQL = readFileSync(migrationPath, 'utf-8');

    console.log('📄 Running migration: 001_initial.sql');

    // Split SQL into individual statements and execute them one by one
    // Remove comments and split by semicolons
    const statements = migrationSQL
      .split('\n')
      .filter(line => !line.trim().startsWith('--')) // Remove comment lines
      .join('\n')
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0);

    console.log(`📝 Executing ${statements.length} SQL statements...\n`);

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement) {
        try {
          await sql(statement);
          console.log(`✓ Statement ${i + 1}/${statements.length} executed`);
        } catch (error: any) {
          // Ignore "already exists" errors
          if (error.message?.includes('already exists')) {
            console.log(`⊳ Statement ${i + 1}/${statements.length} skipped (already exists)`);
          } else {
            throw error;
          }
        }
      }
    }

    console.log('\n✅ Migration completed successfully\n');

    // Verify tables were created
    console.log('🔍 Verifying tables...');
    const tables = await sql(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `);

    console.log('\n📊 Created tables:');
    tables.forEach((table: any) => {
      console.log(`  - ${table.table_name}`);
    });

    console.log('\n✨ Database is ready!');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

runMigrations();
