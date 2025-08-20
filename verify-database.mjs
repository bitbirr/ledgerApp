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
      const businessId = businesses[0].id;
      console.log('\n=== BRANCHES FOR BUSINESS ID:', businessId, '===');
      const [branches] = await connection.execute(
        'SELECT id, name, businessId FROM branches WHERE businessId = ?',
        [businessId]
      );
      console.log(branches);
      
      console.log('\n=== ALL BRANCHES (for comparison) ===');
      const [allBranches] = await connection.execute(
        'SELECT id, name, businessId FROM branches LIMIT 10'
      );
      console.log(allBranches);
    }
    
  } catch (error) {
    console.error('Database error:', error);
  } finally {
    await connection.end();
  }
}

verifyDatabase();