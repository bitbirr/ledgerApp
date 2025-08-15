const mysql = require('mysql2/promise');

async function testConnection() {
  try {
    const connection = await mysql.createConnection({
      host: '47.236.39.181',
      port: 3306,
      user: 'ledger_user',
      password: 'ledgerApp',
      ssl: false,
      authPlugins: {
        mysql_native_password: () => () => Buffer.alloc(0)
      }
    });
    
    console.log('Connected to MariaDB server');
    
    // Create database if it doesn't exist
    await connection.execute('CREATE DATABASE IF NOT EXISTS ledger');
    console.log('Database "ledger" created or already exists');
    
    await connection.end();
  } catch (error) {
    console.error('Connection failed:', error.message);
  }
}

testConnection();