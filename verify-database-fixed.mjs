import mysql from 'mysql2/promise';

// Direct database connection
const connection = await mysql.createConnection({
  host: '47.236.39.181',
  user: 'ledger_user', 
  password: 'ledgerApp',
  database: 'ledger'
});

async function verifyDatabase() {
  try {
    console.log('=== BUSINESSES ===');
    const [businesses] = await connection.execute(
      'SELECT id, name FROM businesses WHERE name LIKE "%Najib%"'
    );
    console.log(businesses);
    
    if (businesses.length > 0) {
      // Check both businesses
      for (const business of businesses) {
        console.log(`\n=== BRANCHES FOR ${business.name} (ID: ${business.id}) ===`);
        const [branches] = await connection.execute(
          'SELECT id, name, business_id FROM branches WHERE business_id = ?',
          [business.id]
        );
        console.log(branches);
      }
      
      console.log('\n=== BRANCHES TABLE SCHEMA ===');
      const [schema] = await connection.execute('DESCRIBE branches');
      console.log(schema);
    }
    
  } catch (error) {
    console.error('Database error:', error);
  } finally {
    await connection.end();
  }
}

verifyDatabase();