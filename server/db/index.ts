import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import * as schema from './schema';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is required');
}

// Create connection function to handle async initialization
async function createDbConnection() {
  const connection = await mysql.createConnection({
    uri: process.env.DATABASE_URL,
    authPlugins: {
      mysql_native_password: () => () => Buffer.alloc(0)
    }
  });
  
  return drizzle(connection, { 
    schema, 
    mode: 'default'
  });
}

// Export the database connection promise
export const db = createDbConnection();


