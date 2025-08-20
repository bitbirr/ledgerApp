import mysql from 'mysql2/promise';

async function checkBusinesses() {
  let connection;
  try {
    connection = await mysql.createConnection({
      host: '47.236.39.181',
      user: 'ledger_user', 
      password: 'ledgerApp',
      database: 'ledger'
    });
    
    console.log('✅ Connected to database');
    
    // Check all businesses
    const [allBusinesses] = await connection.execute('SELECT id, name FROM businesses');
    console.log('All businesses in database:', allBusinesses);
    console.log('Total count:', allBusinesses.length);
    
    // Check if table exists and has correct structure
    const [tableInfo] = await connection.execute('DESCRIBE businesses');
    console.log('\nBusinesses table structure:', tableInfo);
    
  } catch (error) {
    console.error('❌ Database error:', error);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

checkBusinesses();