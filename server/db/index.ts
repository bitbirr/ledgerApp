// server/db/index.ts
import { drizzle, type MySql2Database } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import * as schema from './schema.ts';
import { dbLogger } from '../services/logger.ts';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is required');
}

// Use a pool so db is NOT a Promise
export const pool = mysql.createPool(process.env.DATABASE_URL);

// Custom logger for Drizzle
const drizzleLogger = {
  logQuery(query: string, params: unknown[]) {
    // We'll implement query timing in the service layer
    // This is just a placeholder to satisfy the interface
  }
};

// Strongly-typed Drizzle DB bound to our schema
export const db: MySql2Database<typeof schema> = drizzle(pool, {
  schema,
  mode: 'default',
  logger: {
    logQuery: (query: string, params: unknown[]) => {
      // In a real implementation, we would track timing here
      // For now, we'll just pass it to our logger
      dbLogger.query(query, params, 0);
    }
  }
});

// Re-export schema so other modules can `import { db, schema } from './db/index.ts'`
export { schema };

// Optional: graceful shutdown helper
export async function closePool() {
  await pool.end();
}
