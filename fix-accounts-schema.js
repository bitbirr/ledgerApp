import mysql from 'mysql2/promise';

async function fixAccountsSchema() {
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
    
    // Check if business_id column already exists
    const [columns] = await connection.execute('DESCRIBE accounts');
    const businessIdColumn = columns.find(row => row.Field === 'business_id');
    const shopIdColumn = columns.find(row => row.Field === 'shop_id');
    
    if (businessIdColumn) {
      console.log('✅ business_id column already exists');
    } else {
      // Add business_id column
      console.log('➕ Adding business_id column...');
      await connection.execute('ALTER TABLE accounts ADD COLUMN business_id varchar(255) NOT NULL');
      console.log('✅ business_id column added');
    }
    
    // Copy data from shop_id to business_id if needed
    if (shopIdColumn && !businessIdColumn) {
      console.log('🔄 Copying data from shop_id to business_id...');
      await connection.execute('UPDATE accounts SET business_id = shop_id WHERE shop_id IS NOT NULL');
      console.log('✅ Data copied from shop_id to business_id');
    }
    
    // Drop shop_id column if it exists
    if (shopIdColumn) {
      console.log('➖ Dropping shop_id column...');
      await connection.execute('ALTER TABLE accounts DROP COLUMN shop_id');
      console.log('✅ shop_id column dropped');
    }
    
    // Commit the transaction
    await connection.commit();
    console.log('✅ Transaction committed successfully');
    
    // Verify the changes
    const [finalColumns] = await connection.execute('DESCRIBE accounts');
    console.log('Accounts table structure after migration:');
    console.table(finalColumns);
    
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

fixAccountsSchema();