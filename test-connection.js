import mysql from 'mysql2/promise';

async function testConnection() {
  try {
    // First connection to create database
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
    
    console.log('✅ Connected to MariaDB server');
    
    // Create database if it doesn't exist
    await connection.execute('CREATE DATABASE IF NOT EXISTS ledger');
    console.log('✅ Database "ledger" created or already exists');
    
    await connection.end();
    
    // Second connection directly to the ledger database
    const ledgerConnection = await mysql.createConnection({
      host: '47.236.39.181',
      port: 3306,
      user: 'ledger_user',
      password: 'ledgerApp',
      database: 'ledger', // Connect directly to ledger database
      ssl: false,
      authPlugins: {
        mysql_native_password: () => () => Buffer.alloc(0)
      }
    });
    
    console.log('✅ Successfully connected to ledger database');
    
    // Test a simple query
    const [rows] = await ledgerConnection.execute('SELECT DATABASE() as current_db');
    console.log('✅ Current database:', rows[0].current_db);
    
    await ledgerConnection.end();
    console.log('✅ Connection closed successfully');
    
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    process.exit(1);
  }
}

testConnection();