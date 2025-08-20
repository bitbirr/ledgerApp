// server/setup-najib-el-haji-simple.js
import { db } from './db/index.ts';
import { businesses, branches, users, businessUsers, categories, glAccounts, preferences, taxRates, taxCodes } from './db/schema.ts';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcrypt';

const SALT_ROUNDS = 12;
const now = () => new Date();

async function hashPassword(password) {
  return await bcrypt.hash(password, SALT_ROUNDS);
}

async function setupNajibElHaji() {
  console.log('Setting up "Najib El Haji" business...');
  
  // Check if business already exists
  const existingBusinesses = await db.select().from(businesses).where(eq(businesses.name, 'Najib El Haji'));
  let businessId;
  
  if (existingBusinesses.length > 0) {
    businessId = existingBusinesses[0].id;
    console.log('Business "Najib El Haji" already exists.');
  } else {
    // Create the business owner user first
    const ownerEmail = 'najib@hajjelec.com';
    let ownerId;
    
    // Check if owner user already exists
    const existingUsers = await db.select().from(users).where(eq(users.email, ownerEmail));
    if (existingUsers.length > 0) {
      ownerId = existingUsers[0].id;
      console.log('Owner user already exists.');
    } else {
      // Create owner user
      ownerId = `user_${Math.random().toString(36).substr(2, 9)}`;
      const passwordHash = await hashPassword('SecurePass123!');
      
      await db.insert(users).values({
        id: ownerId,
        email: ownerEmail,
        name: 'Najib Hassen',
        passwordHash,
        emailVerified: true,
        createdAt: now(),
        updatedAt: now()
      });
      
      console.log('Created owner user: Najib Hassen');
    }
    
    // Create the business
    businessId = `biz_${Math.random().toString(36).substr(2, 9)}`;
    await db.insert(businesses).values({
      id: businessId,
      name: 'Najib El Haji',
      address: 'Karamara, Jigjiga, Ethiopia',
      phone: '+251-91-123-4567',
      email: 'info@najibelhaji.com',
      website: null,
      logo: null,
      ownerId: ownerId,
      createdAt: now(),
      updatedAt: now()
    });
    
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
    const existingBranches = await db.select().from(branches).where(
      eq(branches.name, branchData.name)
    );
    
    if (existingBranches.length > 0) {
      createdBranches.push(existingBranches[0]);
      console.log(`Branch already exists: ${branchData.name}`);
    } else {
      const branchId = `branch_${Math.random().toString(36).substr(2, 9)}`;
      await db.insert(branches).values({
        id: branchId,
        businessId: businessId,
        name: branchData.name,
        address: branchData.address,
        phone: null,
        email: null,
        isActive: true,
        createdAt: now(),
        updatedAt: now()
      });
      
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
    const existingUsers = await db.select().from(users).where(eq(users.email, userData.email));
    let userId;
    
    if (existingUsers.length > 0) {
      userId = existingUsers[0].id;
      console.log(`User already exists: ${userData.name}`);
    } else {
      // Create user
      userId = `user_${Math.random().toString(36).substr(2, 9)}`;
      const passwordHash = await hashPassword('SecurePass123!');
      
      await db.insert(users).values({
        id: userId,
        email: userData.email,
        name: userData.name,
        passwordHash,
        emailVerified: true,
        createdAt: now(),
        updatedAt: now()
      });
      
      console.log(`Created user: ${userData.name}`);
    }
    
    // Check if business user association already exists
    const existingBusinessUsers = await db.select().from(businessUsers).where(
      eq(businessUsers.userId, userId)
    );
    
    if (existingBusinessUsers.length > 0) {
      console.log(`Business user association already exists for: ${userData.name}`);
    } else {
      // Create business user association
      const businessUserId = `bu_${Math.random().toString(36).substr(2, 9)}`;
      await db.insert(businessUsers).values({
        id: businessUserId,
        businessId: businessId,
        branchId: branchId,
        userId: userId,
        role: userData.role,
        permissions: null,
        invitedBy: userId,
        invitedAt: now(),
        acceptedAt: now(),
        status: 'accepted',
        createdAt: now()
      });
      
      console.log(`Created business user: ${userData.name} (${userData.role}) for branch: ${userData.branch}`);
    }
  }
  
  // Create default categories for the business
  const categoriesData = [
    { name: 'Electronics', color: '#1976D2' },
    { name: 'Mobile Phones', color: '#8E24AA' },
    { name: 'Accessories', color: '#00897B' },
    { name: 'Home Appliances', color: '#FF8F00' },
    { name: 'Computer Parts', color: '#2E7D32' }
  ];
  
  // Check if categories already exist
  const existingCategories = await db.select().from(categories).where(eq(categories.businessId, businessId));
  if (existingCategories.length === 0) {
    for (const cat of categoriesData) {
      const id = `cat_${Math.random().toString(36).substr(2, 9)}`;
      await db.insert(categories).values({
        id,
        name: cat.name,
        color: cat.color,
        businessId: businessId
      });
      console.log(`Created category: ${cat.name}`);
    }
  } else {
    console.log('Categories already exist for this business.');
  }
  
  // Create default GL accounts for the business
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
  
  // Check if GL accounts already exist
  const existingGlAccounts = await db.select().from(glAccounts).where(eq(glAccounts.businessId, businessId));
  if (existingGlAccounts.length === 0) {
    for (const account of glAccountsData) {
      const id = `${businessId}_${account.code}`;
      await db.insert(glAccounts).values({
        id,
        businessId: businessId,
        code: account.code,
        name: account.name,
        type: account.type,
        parentId: null,
        isLeaf: true,
        isActive: true,
        systemFlag: true,
        description: `${account.name} account`,
        createdAt: now(),
        updatedAt: now()
      });
      console.log(`Created GL account: ${account.name} (${account.code})`);
    }
  } else {
    console.log('GL accounts already exist for this business.');
  }
  
  // Create default preferences
  const existingPreferences = await db.select().from(preferences).where(eq(preferences.businessId, businessId));
  if (existingPreferences.length === 0) {
    await db.insert(preferences).values({
      businessId: businessId,
      currency: 'ETB',
      language: 'en',
      dateFormat: 'YYYY-MM-DD',
      timeFormat: '24',
      firstDayOfWeek: 1,
      firstDayOfMonth: 1,
      firstDayOfYear: 1,
      showTimeInReports: true,
      showPreviousBalance: true,
      darkMode: false,
      biometricEnabled: false
    });
    console.log('Created default preferences');
  } else {
    console.log('Preferences already exist for this business.');
  }
  
  // Create default tax rates and codes
  const existingTaxRates = await db.select().from(taxRates).where(eq(taxRates.businessId, businessId));
  if (existingTaxRates.length === 0) {
    const taxRateId = `taxrate_vat15_${businessId}`;
    await db.insert(taxRates).values({
      id: taxRateId,
      businessId: businessId,
      name: 'VAT 15%',
      rate: '0.1500',
      effectiveFrom: now(),
      effectiveTo: null,
      isActive: true,
      kind: 'VAT'
    });
    console.log('Created tax rate: VAT 15%');
    
    await db.insert(taxCodes).values({
      id: `taxcode_vat_sales_${businessId}`,
      businessId: businessId,
      code: 'VAT-SALES',
      name: 'VAT 15% Output',
      rateId: taxRateId,
      scope: 'sales',
      direction: 'output',
      isDefault: true
    });
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
}

// Run the setup
setupNajibElHaji().catch(console.error);