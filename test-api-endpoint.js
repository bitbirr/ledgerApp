import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Direct MySQL test to replicate the API endpoint logic
async function testBusinessesEndpoint() {
  let connection;
  try {
    console.log('🔍 Testing businesses API endpoint with direct MySQL...');
    console.log('🔗 DATABASE_URL:', process.env.DATABASE_URL ? 'Found' : 'Missing');
    
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL environment variable is not set');
    }
    
    // Create connection using the same DATABASE_URL
    connection = await mysql.createConnection(process.env.DATABASE_URL);
    
    // Execute the same query that Drizzle would generate
    const [rows] = await connection.execute(
      'SELECT `id`, `name` FROM `businesses`'
    );
    
    console.log('✅ Query successful!');
    console.log('📊 Results:', JSON.stringify(rows, null, 2));
    console.log('📈 Count:', rows.length);
    
    if (rows.length === 0) {
      console.log('⚠️  No businesses found in database');
      console.log('🔍 This explains why the API returns empty array!');
    } else {
      console.log('✅ Businesses found - API should work!');
      console.log('🤔 If API still returns empty, the issue is in Express/Drizzle setup');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('🔍 Full error:', error);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

testBusinessesEndpoint();