import mysql from 'mysql2/promise';

// Database connection configuration
const dbConfig = {
  host: '47.236.39.181',
  user: 'ledger_user', 
  password: 'ledgerApp',
  database: 'ledger'
};

async function cleanupDatabase() {
  let connection;
  
  try {
    connection = await mysql.createConnection(dbConfig);
    console.log('Connected to database');
    
    // Start transaction for data integrity
    await connection.beginTransaction();
    
    // Target business and branches to keep
    const keepBusinessId = 'biz_rmdbi4ukd';
    const keepBranchIds = [
      'branch_9giwu5xjl',   // Sayid branch
      'branch_isfc8arox',   // Chinaksan branch
      'branch_n0fgkfcmf'    // Hamda Hotel branch
    ];
    
    console.log('Starting database cleanup...');
    
    // 1. Delete transactions for other businesses
    console.log('Deleting transactions for other businesses...');
    const [transactionResult] = await connection.execute(
      'DELETE FROM transactions WHERE business_id != ?',
      [keepBusinessId]
    );
    console.log(`Deleted ${transactionResult.affectedRows} transactions`);
    
    // 2. Delete accounts for other businesses
    console.log('Deleting accounts for other businesses...');
    const [accountResult] = await connection.execute(
      'DELETE FROM accounts WHERE business_id != ?',
      [keepBusinessId]
    );
    console.log(`Deleted ${accountResult.affectedRows} accounts`);
    
    // 3. Delete categories for other businesses
    console.log('Deleting categories for other businesses...');
    const [categoryResult] = await connection.execute(
      'DELETE FROM categories WHERE business_id != ?',
      [keepBusinessId]
    );
    console.log(`Deleted ${categoryResult.affectedRows} categories`);
    
    // 4. Delete cashbook entries for other businesses
    console.log('Deleting cashbook entries for other businesses...');
    const [cashbookResult] = await connection.execute(
      'DELETE FROM cashbook WHERE business_id != ?',
      [keepBusinessId]
    );
    console.log(`Deleted ${cashbookResult.affectedRows} cashbook entries`);
    
    // 5. Delete items for other businesses
    console.log('Deleting items for other businesses...');
    const [itemResult] = await connection.execute(
      'DELETE FROM items WHERE business_id != ?',
      [keepBusinessId]
    );
    console.log(`Deleted ${itemResult.affectedRows} items`);
    
    // 6. Delete invoices for other businesses
    console.log('Deleting invoices for other businesses...');
    const [invoiceResult] = await connection.execute(
      'DELETE FROM invoices WHERE business_id != ?',
      [keepBusinessId]
    );
    console.log(`Deleted ${invoiceResult.affectedRows} invoices`);
    
    // 7. Delete GL accounts for other businesses
    console.log('Deleting GL accounts for other businesses...');
    const [glAccountResult] = await connection.execute(
      'DELETE FROM gl_accounts WHERE business_id != ?',
      [keepBusinessId]
    );
    console.log(`Deleted ${glAccountResult.affectedRows} GL accounts`);
    
    // 8. Delete journal entries for other businesses
    console.log('Deleting journal entries for other businesses...');
    const [journalResult] = await connection.execute(
      'DELETE FROM gl_journal_entries WHERE business_id != ?',
      [keepBusinessId]
    );
    console.log(`Deleted ${journalResult.affectedRows} journal entries`);
    
    // 9. Delete journal lines for other businesses
    console.log('Deleting journal lines for other businesses...');
    const [journalLineResult] = await connection.execute(
      'DELETE FROM gl_journal_lines WHERE business_id != ?',
      [keepBusinessId]
    );
    console.log(`Deleted ${journalLineResult.affectedRows} journal lines`);
    
    // 10. Delete inventory movements for other businesses
    console.log('Deleting inventory movements for other businesses...');
    const [inventoryResult] = await connection.execute(
      'DELETE FROM inventory_movements WHERE business_id != ?',
      [keepBusinessId]
    );
    console.log(`Deleted ${inventoryResult.affectedRows} inventory movements`);
    
    // 11. Delete tax rates for other businesses
    console.log('Deleting tax rates for other businesses...');
    const [taxRateResult] = await connection.execute(
      'DELETE FROM tax_rates WHERE business_id != ?',
      [keepBusinessId]
    );
    console.log(`Deleted ${taxRateResult.affectedRows} tax rates`);
    
    // 12. Delete tax codes for other businesses
    console.log('Deleting tax codes for other businesses...');
    const [taxCodeResult] = await connection.execute(
      'DELETE FROM tax_codes WHERE business_id != ?',
      [keepBusinessId]
    );
    console.log(`Deleted ${taxCodeResult.affectedRows} tax codes`);
    
    // 13. Delete posting rules for other businesses
    console.log('Deleting posting rules for other businesses...');
    const [postingRuleResult] = await connection.execute(
      'DELETE FROM posting_rules WHERE business_id != ?',
      [keepBusinessId]
    );
    console.log(`Deleted ${postingRuleResult.affectedRows} posting rules`);
    
    // 14. Delete opening balances for other businesses
    console.log('Deleting opening balances for other businesses...');
    const [openingBalanceResult] = await connection.execute(
      'DELETE FROM opening_balances WHERE business_id != ?',
      [keepBusinessId]
    );
    console.log(`Deleted ${openingBalanceResult.affectedRows} opening balances`);
    
    // 15. Delete preferences for other businesses
    console.log('Deleting preferences for other businesses...');
    const [preferencesResult] = await connection.execute(
      'DELETE FROM preferences WHERE business_id != ?',
      [keepBusinessId]
    );
    console.log(`Deleted ${preferencesResult.affectedRows} preferences`);
    
    // 16. Delete audit logs for other businesses
    console.log('Deleting audit logs for other businesses...');
    const [auditResult] = await connection.execute(
      'DELETE FROM audit_logs WHERE business_id != ? OR business_id IS NULL',
      [keepBusinessId]
    );
    console.log(`Deleted ${auditResult.affectedRows} audit logs`);
    
    // 17. Delete business_users for other businesses and unwanted branches
    console.log('Deleting business_users for other businesses and unwanted branches...');
    const [businessUserResult] = await connection.execute(
      `DELETE FROM business_users 
       WHERE business_id != ? 
       OR (business_id = ? AND branch_id NOT IN (?, ?, ?))`,
      [keepBusinessId, keepBusinessId, ...keepBranchIds]
    );
    console.log(`Deleted ${businessUserResult.affectedRows} business_users`);
    
    // 18. Delete unwanted branches (keep only specified ones)
    console.log('Deleting unwanted branches...');
    const [branchResult] = await connection.execute(
      `DELETE FROM branches 
       WHERE business_id != ? 
       OR (business_id = ? AND id NOT IN (?, ?, ?))`,
      [keepBusinessId, keepBusinessId, ...keepBranchIds]
    );
    console.log(`Deleted ${branchResult.affectedRows} branches`);
    
    // 19. Finally, delete other businesses
    console.log('Deleting other businesses...');
    const [businessResult] = await connection.execute(
      'DELETE FROM businesses WHERE id != ?',
      [keepBusinessId]
    );
    console.log(`Deleted ${businessResult.affectedRows} businesses`);
    
    // Commit transaction
    await connection.commit();
    console.log('\n✅ Database cleanup completed successfully!');
    
    // Verify final state
    console.log('\n=== FINAL DATABASE STATE ===');
    
    const [businesses] = await connection.execute('SELECT id, name FROM businesses');
    console.log('Remaining businesses:', businesses);
    
    const [branches] = await connection.execute(
      'SELECT id, name, business_id FROM branches WHERE business_id = ?',
      [keepBusinessId]
    );
    console.log('Remaining branches:', branches);
    
  } catch (error) {
    console.error('Error during cleanup:', error);
    if (connection) {
      await connection.rollback();
      console.log('Transaction rolled back');
    }
    throw error;
  } finally {
    if (connection) {
      await connection.end();
      console.log('Database connection closed');
    }
  }
}

// Run the cleanup
cleanupDatabase()
  .then(() => {
    console.log('Cleanup script completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Cleanup script failed:', error);
    process.exit(1);
  });