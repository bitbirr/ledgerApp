// add-daily-sales.js
import mysql from 'mysql2/promise';

// Database configuration from .env
const DATABASE_URL = 'mysql://ledger_user:ledgerApp@47.236.39.181:3306/ledger?ssl=false&authPlugins=mysql_native_password';

// Parse the database URL
const url = new URL(DATABASE_URL);
const config = {
  host: url.hostname,
  port: url.port,
  user: url.username,
  password: url.password,
  database: url.pathname.slice(1),
  ssl: url.searchParams.get('ssl') === 'true'
};

// Helper functions
const now = () => new Date();
const daysAgo = (n) => new Date(Date.now() - n * 86400000);

// Format decimal values
const d2 = (n) => {
  if (typeof n === 'string') {
    n = parseFloat(n);
  }
  return n.toFixed(2);
};

async function addDailySales() {
  let connection;
  
  try {
    // Create database connection
    connection = await mysql.createConnection(config);
    console.log('Connected to the database');
    
    // Get the business ID for "Najib El Haji"
    const [businesses] = await connection.execute(
      'SELECT id FROM businesses WHERE name = ?',
      ['Najib El Haji']
    );
    
    if (businesses.length === 0) {
      console.log('Business "Najib El Haji" not found');
      return;
    }
    
    const businessId = businesses[0].id;
    console.log(`Found business: Najib El Haji (ID: ${businessId})`);
    
    // Get branches for this business
    const [branches] = await connection.execute(
      'SELECT id, name FROM branches WHERE business_id = ?',
      [businessId]
    );
    
    console.log('Branches found:', branches);
    
    // Get inventory items for this business
    const [items] = await connection.execute(
      'SELECT id, name, rate FROM items WHERE business_id = ?',
      [businessId]
    );
    
    console.log(`Found ${items.length} inventory items`);
    
    // Create sample customers for each branch
    const customers = {};
    for (const branch of branches) {
      const customerId = `cust_${Math.random().toString(36).substr(2, 9)}`;
      const customerName = `${branch.name} Customer`;
      
      // Insert customer account
      await connection.execute(
        'INSERT INTO accounts (id, name, phone, type, business_id, user_id, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [customerId, customerName, '+251912345678', 'customer', businessId, 'user_system', now()]
      );
      
      customers[branch.id] = {
        id: customerId,
        name: customerName
      };
      
      console.log(`Created customer for ${branch.name}: ${customerName} (ID: ${customerId})`);
    }
    
    // Add sample daily sales for each branch for the last 7 days
    for (let day = 0; day < 7; day++) {
      const saleDate = daysAgo(day);
      
      for (const branch of branches) {
        // Create 2-5 sales per branch per day
        const salesCount = Math.floor(Math.random() * 4) + 2;
        
        for (let i = 0; i < salesCount; i++) {
          // Select random items for this sale
          const itemCount = Math.floor(Math.random() * 3) + 1;
          const selectedItems = [];
          let subtotal = 0;
          
          for (let j = 0; j < itemCount; j++) {
            const item = items[Math.floor(Math.random() * items.length)];
            const quantity = Math.floor(Math.random() * 3) + 1;
            const itemTotal = item.rate * quantity;
            
            selectedItems.push({
              item,
              quantity,
              total: itemTotal
            });
            
            subtotal += itemTotal;
          }
          
          // Calculate tax (15% VAT)
          const tax = subtotal * 0.15;
          const total = subtotal + tax;
          
          // Create invoice
          const invoiceId = `inv_${Math.random().toString(36).substr(2, 9)}`;
          const invoiceNumber = `INV-${branch.name.substring(0, 3).toUpperCase()}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
          
          await connection.execute(
            'INSERT INTO invoices (id, number, account_id, business_id, kind, issue_date, due_date, subtotal, discount, addl_charges, total, pdf_url, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [invoiceId, invoiceNumber, customers[branch.id].id, businessId, 'sale', saleDate, saleDate, d2(subtotal), d2(0), d2(0), d2(total), null, 'paid']
          );
          
          // Create invoice items
          for (const selectedItem of selectedItems) {
            const invoiceItemId = `ii_${Math.random().toString(36).substr(2, 9)}`;
            
            await connection.execute(
              'INSERT INTO invoice_items (id, invoice_id, item_id, qty, rate, discount_pct, total) VALUES (?, ?, ?, ?, ?, ?, ?)',
              [invoiceItemId, invoiceId, selectedItem.item.id, d2(selectedItem.quantity), d2(selectedItem.item.rate), d2(0), d2(selectedItem.total)]
            );
          }
          
          // Create cashbook entry for this sale
          const cashbookId = `cb_${Math.random().toString(36).substr(2, 9)}`;
          
          await connection.execute(
            'INSERT INTO cashbook (id, business_id, date_time, direction, amount, note, attachment_url) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [cashbookId, businessId, saleDate, 'in', d2(total), `Payment for invoice ${invoiceNumber}`, null]
          );
          
          // Create GL journal entries for this sale
          // 1. Debit Cash/Bank account, Credit Sales Revenue
          const journalEntryId1 = `je_${Math.random().toString(36).substr(2, 9)}`;
          
          await connection.execute(
            'INSERT INTO gl_journal_entries (id, business_id, entry_date, memo, source_module, source_id, posted_by, posted_at, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [journalEntryId1, businessId, saleDate, `Sale ${invoiceNumber}`, 'invoice', invoiceId, 'user_system', now(), now()]
          );
          
          // Get GL accounts for this business
          const [glAccounts] = await connection.execute(
            'SELECT id, code, name FROM gl_accounts WHERE business_id = ?',
            [businessId]
          );
          
          // Create a map of account codes to IDs
          const accountMap = {};
          glAccounts.forEach(account => {
            accountMap[account.code] = account.id;
          });
          
          // Debit Cash (1000)
          const journalLineId1 = `jl_${Math.random().toString(36).substr(2, 9)}`;
          await connection.execute(
            'INSERT INTO gl_journal_lines (id, entry_id, business_id, account_id, debit, credit, party_id, item_id, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [journalLineId1, journalEntryId1, businessId, accountMap['1000'], d2(total), d2(0), customers[branch.id].id, null, 'Cash received from sale']
          );
          
          // Credit Sales Revenue (4000)
          const journalLineId2 = `jl_${Math.random().toString(36).substr(2, 9)}`;
          await connection.execute(
            'INSERT INTO gl_journal_lines (id, entry_id, business_id, account_id, debit, credit, party_id, item_id, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [journalLineId2, journalEntryId1, businessId, accountMap['4000'], d2(0), d2(subtotal), customers[branch.id].id, null, 'Sales revenue']
          );
          
          // Credit VAT Payable (2000) - assuming VAT is tracked in Accounts Payable
          if (tax > 0) {
            const journalLineId3 = `jl_${Math.random().toString(36).substr(2, 9)}`;
            await connection.execute(
              'INSERT INTO gl_journal_lines (id, entry_id, business_id, account_id, debit, credit, party_id, item_id, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
              [journalLineId3, journalEntryId1, businessId, accountMap['2000'], d2(0), d2(tax), customers[branch.id].id, null, 'VAT collected']
            );
          }
          
          // 2. Debit Cost of Goods Sold, Credit Inventory
          const journalEntryId2 = `je_${Math.random().toString(36).substr(2, 9)}`;
          
          await connection.execute(
            'INSERT INTO gl_journal_entries (id, business_id, entry_date, memo, source_module, source_id, posted_by, posted_at, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [journalEntryId2, businessId, saleDate, `COGS for sale ${invoiceNumber}`, 'invoice', invoiceId, 'user_system', now(), now()]
          );
          
          // For simplicity, we'll use a fixed COGS percentage (60% of sales)
          const cogs = subtotal * 0.6;
          
          // Debit Cost of Goods Sold (5000)
          const journalLineId4 = `jl_${Math.random().toString(36).substr(2, 9)}`;
          await connection.execute(
            'INSERT INTO gl_journal_lines (id, entry_id, business_id, account_id, debit, credit, party_id, item_id, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [journalLineId4, journalEntryId2, businessId, accountMap['5000'], d2(cogs), d2(0), null, null, 'Cost of goods sold']
          );
          
          // Credit Inventory (1200)
          const journalLineId5 = `jl_${Math.random().toString(36).substr(2, 9)}`;
          await connection.execute(
            'INSERT INTO gl_journal_lines (id, entry_id, business_id, account_id, debit, credit, party_id, item_id, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [journalLineId5, journalEntryId2, businessId, accountMap['1200'], d2(0), d2(cogs), null, null, 'Inventory reduction']
          );
          
          console.log(`Added sale for ${branch.name} on ${saleDate.toISOString().split('T')[0]}: ${invoiceNumber} (ETB ${d2(total)})`);
        }
      }
    }
    
    console.log('Daily sales data added successfully!');
    
  } catch (error) {
    console.error('Error adding daily sales:', error);
  } finally {
    if (connection) {
      await connection.end();
      console.log('Database connection closed');
    }
  }
}

// Run the daily sales addition
addDailySales();