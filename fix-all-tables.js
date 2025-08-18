import mysql from 'mysql2/promise';

async function fixAllTables() {
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
    
    // Start a transaction
    await connection.beginTransaction();
    
    // Tables that need business_id column added
    const tablesToFix = ['cashbook', 'categories', 'invoices'];
    
    for (const table of tablesToFix) {
      console.log(`\n--- Fixing table: ${table} ---`);
      
      try {
        // Get table structure
        const [columns] = await connection.execute(`DESCRIBE ${table}`);
        
        // Check for business_id column
        const businessIdColumn = columns.find(row => row.Field === 'business_id');
        if (businessIdColumn) {
          console.log(`✅ ${table} already has business_id column`);
          continue;
        }
        
        // Add business_id column
        console.log(`➕ Adding business_id column to ${table}...`);
        await connection.execute(`ALTER TABLE ${table} ADD COLUMN business_id varchar(255) NOT NULL`);
        console.log(`✅ business_id column added to ${table}`);
        
      } catch (error) {
        console.log(`⚠️  Could not fix ${table}: ${error.message}`);
      }
    }
    
    // Commit the transaction
    await connection.commit();
    console.log('\n✅ Transaction committed successfully');
    
    await connection.end();
    console.log('✅ Connection closed successfully');
    
  } catch (error) {
    if (connection) {
      await connection.rollback();
      console.log('❌ Transaction rolled back due to error');
    }
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

fixAllTables();