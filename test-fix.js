import mysql from 'mysql2/promise';

async function testFix() {
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
    
    // Test the query that was failing
    const [rows] = await connection.execute(
      'SELECT `id`, `name`, `phone`, `type` FROM `accounts` WHERE `accounts`.`business_id` = ?',
      ['biz_ismail']
    );
    
    console.log('✅ Query executed successfully!');
    console.log(`Found ${rows.length} accounts`);
    console.log('First few accounts:', rows.slice(0, 3));
    
    await connection.end();
    console.log('✅ Connection closed successfully');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('SQL:', error.sql);
    process.exit(1);
  }
}

testFix();