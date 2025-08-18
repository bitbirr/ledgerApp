import mysql from 'mysql2/promise';

async function checkAllTables() {
  let connection;
  
  try {
    // Connect directly to the ledger database
    connection = await mysql.createConnection({
      host: '47.236.39.181',
      port: 3306,
      user: 'ledger_user',
      password: 'ledgerApp',
      database: 'ledger',
      ssl: false,
      authPlugins: {
        mysql_native_password: () => () => Buffer.alloc(0)
      }
    });
    
    console.log('✅ Successfully connected to ledger database');
    
    // List of tables to check
    const tables = ['accounts', 'cashbook', 'categories', 'invoices', 'items', 'preferences', 'transactions'];
    
    for (const table of tables) {
      console.log(`\n--- Checking table: ${table} ---`);
      
      try {
        // Get table structure
        const [columns] = await connection.execute(`DESCRIBE ${table}`);
        
        // Check for shop_id column
        const shopIdColumn = columns.find(row => row.Field === 'shop_id');
        if (shopIdColumn) {
          console.log(`❌ ${table} still has shop_id column`);
        } else {
          console.log(`✅ ${table} does not have shop_id column`);
        }
        
        // Check for business_id column
        const businessIdColumn = columns.find(row => row.Field === 'business_id');
        if (businessIdColumn) {
          console.log(`✅ ${table} has business_id column`);
        } else {
          console.log(`❌ ${table} does not have business_id column`);
        }
      } catch (error) {
        console.log(`⚠️  Could not check ${table}: ${error.message}`);
      }
    }
    
    await connection.end();
    console.log('\n✅ Connection closed successfully');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

checkAllTables();