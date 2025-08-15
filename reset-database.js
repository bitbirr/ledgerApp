import mysql from 'mysql2/promise';

async function resetDatabase() {
  try {
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
    
    console.log('🔄 Resetting database...');
    
    // Drop all tables
    const tables = [
      'invoice_items', 'invoices', 'transactions', 'cashbook', 
      'accounts', 'categories', 'items', 'preferences', 
      'app_settings', 'shops'
    ];
    
    for (const table of tables) {
      try {
        await connection.execute(`DROP TABLE IF EXISTS \`${table}\``);
        console.log(`✅ Dropped table: ${table}`);
      } catch (error) {
        console.log(`⚠️  Table ${table} didn't exist`);
      }
    }
    
    // Clear migration history
    await connection.execute('DROP TABLE IF EXISTS `__drizzle_migrations`');
    console.log('✅ Cleared migration history');
    
    await connection.end();
    console.log('🎉 Database reset complete!');
    
  } catch (error) {
    console.error('❌ Reset failed:', error.message);
    process.exit(1);
  }
}

resetDatabase();