import mysql from 'mysql2/promise';

async function checkSchema() {
  try {
    // Connect directly to the ledger database
    const connection = await mysql.createConnection({
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
    
    // Check the structure of the accounts table
    const [rows] = await connection.execute('DESCRIBE accounts');
    console.log('Accounts table structure:');
    console.table(rows);
    
    // Check if business_id column exists
    const businessIdColumn = rows.find(row => row.Field === 'business_id');
    if (businessIdColumn) {
      console.log('✅ business_id column exists');
    } else {
      console.log('❌ business_id column does not exist');
    }
    
    // Check if shop_id column exists
    const shopIdColumn = rows.find(row => row.Field === 'shop_id');
    if (shopIdColumn) {
      console.log('❌ shop_id column still exists');
    } else {
      console.log('✅ shop_id column has been removed');
    }
    
    await connection.end();
    console.log('✅ Connection closed successfully');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

checkSchema();