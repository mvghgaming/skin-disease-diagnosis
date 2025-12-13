import { neon } from '@neondatabase/serverless';

// Lazy initialization of SQL client
let _sql: ReturnType<typeof neon> | null = null;

function getSql() {
  if (!_sql) {
    const url = process.env.DATABASE_URL;
    if (!url) {
      throw new Error('DATABASE_URL environment variable is not set');
    }
    _sql = neon(url);
  }
  return _sql;
}

export const sql = getSql;

// Helper function to execute queries
export async function query<T = any>(
  text: string,
  params?: any[]
): Promise<{ rows: T[]; rowCount: number }> {
  try {
    const sqlClient = getSql();
    const rows = await sqlClient(text, params || []);
    const rowArray = Array.isArray(rows) ? rows : [];
    return {
      rows: rowArray as T[],
      rowCount: rowArray.length,
    };
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
}

// Export default database client
export const db = {
  query,
  sql: getSql,
};
