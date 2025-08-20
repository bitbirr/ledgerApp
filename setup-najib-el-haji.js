// setup-najib-el-haji.js
import mysql from 'mysql2/promise';
import bcrypt from 'bcrypt';

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
const SALT_ROUNDS = 12;

async function hashPassword(password) {
  return await bcrypt.hash(password, SALT_ROUNDS);
}

async function setupNajibElHaji() {
  let connection;
  
  try {
    // Create database connection
    connection = await mysql.createConnection(config);
    console.log('Connected to the database');
    
    // Check if business already exists
    const [existingBusinesses] = await connection.execute(
      'SELECT id FROM businesses WHERE name = ?',
      ['Najib El Haji']
    );
    
    let businessId;
    
    if (existingBusinesses.length > 0) {
      businessId = existingBusinesses[0].id;
      console.log('Business "Najib El Haji" already exists.');
    } else {
      // Create the business owner user first
      const ownerEmail = 'najib@hajjelec.com';
      
      // Check if owner user already exists
      const [existingUsers] = await connection.execute(
        'SELECT id FROM users WHERE email = ?',
        [ownerEmail]
      );
      
      let ownerId;
      
      if (existingUsers.length > 0) {
        ownerId = existingUsers[0].id;
        console.log('Owner user already exists.');
      } else {
        // Create owner user
        ownerId = `user_${Math.random().toString(36).substr(2, 9)}`;
        const passwordHash = await hashPassword('SecurePass123!');
        
        await connection.execute(
          'INSERT INTO users (id, email, name, password_hash, email_verified, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
          [ownerId, ownerEmail, 'Najib Hassen', passwordHash, true, now(), now()]
        );
        
        console.log('Created owner user: Najib Hassen');
      }
      
      // Create the business
      businessId = `biz_${Math.random().toString(36).substr(2, 9)}`;
      
      // First, let's check if the businesses table has a logo column
      try {
        await connection.execute(
          'INSERT INTO businesses (id, name, address, phone, email, website, owner_id, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
          [businessId, 'Najib El Haji', 'Karamara, Jigjiga, Ethiopia', '+251-91-123-4567', 'info@najibelhaji.com', null, ownerId, now(), now()]
        );
      } catch (error) {
        if (error.code === 'ER_BAD_FIELD_ERROR' && error.sqlMessage.includes('logo')) {
          // Try without logo column
          await connection.execute(
            'INSERT INTO businesses (id, name, address, phone, email, website, owner_id, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [businessId, 'Najib El Haji', 'Karamara, Jigjiga, Ethiopia', '+251-91-123-4567', 'info@najibelhaji.com', null, ownerId, now(), now()]
          );
        } else {
          throw error;
        }
      }
      
      console.log(`Created business: Najib El Haji (ID: ${businessId})`);
    }
    
    // Create branches
    const branchesData = [
      { name: 'Sayid branch', address: 'Sayid location, Jigjiga, Ethiopia' },
      { name: 'Hamda Hotel branch', address: 'Hamda Hotel, Jigjiga, Ethiopia' },
      { name: 'Chinaksan branch', address: 'Chinaksan area, Jigjiga, Ethiopia' }
    ];
    
    const createdBranches = [];
    for (const branchData of branchesData) {
      // Check if branch already exists
      const [existingBranches] = await connection.execute(
        'SELECT id FROM branches WHERE name = ? AND business_id = ?',
        [branchData.name, businessId]
      );
      
      if (existingBranches.length > 0) {
        createdBranches.push({ id: existingBranches[0].id, name: branchData.name });
        console.log(`Branch already exists: ${branchData.name}`);
      } else {
        const branchId = `branch_${Math.random().toString(36).substr(2, 9)}`;
        await connection.execute(
          'INSERT INTO branches (id, business_id, name, address, phone, email, is_active, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
          [branchId, businessId, branchData.name, branchData.address, null, null, true, now(), now()]
        );
        
        const branch = {
          id: branchId,
          name: branchData.name
        };
        createdBranches.push(branch);
        console.log(`Created branch: ${branchData.name} (ID: ${branchId})`);
      }
    }
    
    // Create users with their roles
    const usersData = [
      // Sayid branch users
      { email: 'najib@hajjelec.com', name: 'Najib Hassen', role: 'Admin', branch: 'Sayid branch' },
      { email: 'hafsa@hajjelec.com', name: 'Hafsa Hassen', role: 'Staff', branch: 'Sayid branch' },
      { email: 'marwan@hajjelec.com', name: 'Marwan Haji', role: 'Staff', branch: 'Sayid branch' },
      { email: 'hawa@hajjelec.com', name: 'Hawa Kabade', role: 'Staff', branch: 'Sayid branch' },
      { email: 'hana@hajjelec.com', name: 'Hana Hassen', role: 'Staff', branch: 'Sayid branch' },
      
      // Hamda Hotel branch user
      { email: 'naila@hajjelec.com', name: 'Naila Haji', role: 'Staff', branch: 'Hamda Hotel branch' },
      
      // Chinaksan branch user
      { email: 'yenesew@hajjelec.com', name: 'Yenesew Mekonin', role: 'Staff', branch: 'Chinaksan branch' }
    ];
    
    const branchMap = createdBranches.reduce((acc, branch) => {
      acc[branch.name] = branch.id;
      return acc;
    }, {});
    
    for (const userData of usersData) {
      const branchId = branchMap[userData.branch];
      if (!branchId) {
        console.error(`Branch not found for user: ${userData.name}`);
        continue;
      }
      
      // Check if user already exists
      const [existingUsers] = await connection.execute(
        'SELECT id FROM users WHERE email = ?',
        [userData.email]
      );
      
      let userId;
      
      if (existingUsers.length > 0) {
        userId = existingUsers[0].id;
        console.log(`User already exists: ${userData.name}`);
      } else {
        // Create user
        userId = `user_${Math.random().toString(36).substr(2, 9)}`;
        const passwordHash = await hashPassword('SecurePass123!');
        
        await connection.execute(
          'INSERT INTO users (id, email, name, password_hash, email_verified, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
          [userId, userData.email, userData.name, passwordHash, true, now(), now()]
        );
        
        console.log(`Created user: ${userData.name}`);
      }
      
      // Check if business user association already exists
      const [existingBusinessUsers] = await connection.execute(
        'SELECT id FROM business_users WHERE user_id = ? AND business_id = ?',
        [userId, businessId]
      );
      
      if (existingBusinessUsers.length > 0) {
        console.log(`Business user association already exists for: ${userData.name}`);
      } else {
        // Create business user association
        const businessUserId = `bu_${Math.random().toString(36).substr(2, 9)}`;
        await connection.execute(
          'INSERT INTO business_users (id, business_id, branch_id, user_id, role, permissions, invited_by, invited_at, accepted_at, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
          [businessUserId, businessId, branchId, userId, userData.role, null, userId, now(), now(), 'accepted', now()]
        );
        
        console.log(`Created business user: ${userData.name} (${userData.role}) for branch: ${userData.branch}`);
      }
    }
    
    // Create default categories for the business
    const [existingCategories] = await connection.execute(
      'SELECT id FROM categories WHERE business_id = ?',
      [businessId]
    );
    
    if (existingCategories.length === 0) {
      const categoriesData = [
        { name: 'Electronics', color: '#1976D2' },
        { name: 'Mobile Phones', color: '#8E24AA' },
        { name: 'Accessories', color: '#00897B' },
        { name: 'Home Appliances', color: '#FF8F00' },
        { name: 'Computer Parts', color: '#2E7D32' }
      ];
      
      for (const cat of categoriesData) {
        const id = `cat_${Math.random().toString(36).substr(2, 9)}`;
        await connection.execute(
          'INSERT INTO categories (id, name, color, business_id) VALUES (?, ?, ?, ?)',
          [id, cat.name, cat.color, businessId]
        );
        console.log(`Created category: ${cat.name}`);
      }
    } else {
      console.log('Categories already exist for this business.');
    }
    
    // Create default GL accounts for the business
    const [existingGlAccounts] = await connection.execute(
      'SELECT id FROM gl_accounts WHERE business_id = ?',
      [businessId]
    );
    
    if (existingGlAccounts.length === 0) {
      const glAccountsData = [
        { code: '1000', name: 'Cash', type: 'asset' },
        { code: '1100', name: 'Accounts Receivable', type: 'asset' },
        { code: '1200', name: 'Inventory', type: 'asset' },
        { code: '1300', name: 'Telebirr Wallet', type: 'asset' },
        { code: '1400', name: 'CBE Account', type: 'asset' },
        { code: '1500', name: 'Awash Bank Account', type: 'asset' },
        { code: '2000', name: 'Accounts Payable', type: 'liability' },
        { code: '2100', name: 'Debt', type: 'liability' },
        { code: '2200', name: 'Utilities Payable', type: 'liability' },
        { code: '3000', name: 'Owner\'s Equity', type: 'equity' },
        { code: '4000', name: 'Sales Revenue', type: 'revenue' },
        { code: '5000', name: 'Cost of Goods Sold', type: 'expense' },
        { code: '5100', name: 'Utilities Expense', type: 'expense' },
        { code: '5200', name: 'Other Expenses', type: 'expense' },
        { code: '5300', name: 'Debt Repayment', type: 'expense' }
      ];
      
      for (const account of glAccountsData) {
        const id = `${businessId}_${account.code}`;
        await connection.execute(
          'INSERT INTO gl_accounts (id, business_id, code, name, type, parent_id, is_leaf, is_active, system_flag, description, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
          [id, businessId, account.code, account.name, account.type, null, true, true, true, `${account.name} account`, now(), now()]
        );
        console.log(`Created GL account: ${account.name} (${account.code})`);
      }
    } else {
      console.log('GL accounts already exist for this business.');
    }
    
    // Create default preferences
    const [existingPreferences] = await connection.execute(
      'SELECT id FROM preferences WHERE business_id = ?',
      [businessId]
    );
    
    if (existingPreferences.length === 0) {
      await connection.execute(
        'INSERT INTO preferences (business_id, currency, language, date_format, time_format, first_day_of_week, first_day_of_month, first_day_of_year, show_time_in_reports, show_previous_balance, dark_mode, biometric_enabled) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [businessId, 'ETB', 'en', 'YYYY-MM-DD', '24', 1, 1, 1, true, true, false, false]
      );
      console.log('Created default preferences');
    } else {
      console.log('Preferences already exist for this business.');
    }
    
    // Create default tax rates and codes
    const [existingTaxRates] = await connection.execute(
      'SELECT id FROM tax_rates WHERE business_id = ?',
      [businessId]
    );
    
    if (existingTaxRates.length === 0) {
      const taxRateId = `taxrate_vat15_${businessId}`;
      await connection.execute(
        'INSERT INTO tax_rates (id, business_id, name, rate, effective_from, effective_to, is_active, kind) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [taxRateId, businessId, 'VAT 15%', '0.1500', now(), null, true, 'VAT']
      );
      console.log('Created tax rate: VAT 15%');
      
      await connection.execute(
        'INSERT INTO tax_codes (id, business_id, code, name, rate_id, scope, direction, is_default) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [ `taxcode_vat_sales_${businessId}`, businessId, 'VAT-SALES', 'VAT 15% Output', taxRateId, 'sales', 'output', true]
      );
      console.log('Created tax code: VAT 15% Output');
    } else {
      console.log('Tax rates and codes already exist for this business.');
    }
    
    console.log('\nSetup complete for "Najib El Haji" business!');
    console.log('Business ID:', businessId);
    console.log('Branches:');
    createdBranches.forEach(branch => {
      console.log(`  - ${branch.name}: ${branch.id}`);
    });
    console.log('\nDefault password for all users: SecurePass123!');
    console.log('Please change passwords after first login.');
    
  } catch (error) {
    console.error('Error setting up business:', error);
  } finally {
    if (connection) {
      await connection.end();
      console.log('Database connection closed');
    }
  }
}

// Run the setup
setupNajibElHaji();