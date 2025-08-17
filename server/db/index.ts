// server/db/index.ts
import { drizzle, type MySql2Database } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import * as schema from './schema.ts';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is required');
}

// Use a pool so db is NOT a Promise
export const pool = mysql.createPool(process.env.DATABASE_URL);

// Strongly-typed Drizzle DB bound to our schema
export const db: MySql2Database<typeof schema> = drizzle(pool, { schema, mode: 'default' });

// Re-export schema so other modules can `import { db, schema } from './db/index.ts'`
export { schema };

// Optional: graceful shutdown helper
export async function closePool() {
  await pool.end();
}
