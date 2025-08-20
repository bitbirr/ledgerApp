// server/setup-najib-el-haji.ts
import { db } from './db/index.ts';
import { businesses, branches, users, businessUsers, categories, items, glAccounts, preferences, taxRates, taxCodes } from './db/schema.ts';
import { eq } from 'drizzle-orm';
import { hashPassword } from './services/auth.ts';
import { createBranch } from './services/branchService.ts';
import { createBusiness, createBusinessUser } from './services/businessService.ts';

const now = () => new Date();

async function setupNajibElHaji() {
  console.log('Setting up "Najib El Haji" business...');
  
  // Check if business already exists
  const existingBusinesses = await db.select().from(businesses).where(eq(businesses.name, 'Najib El Haji'));
  if (existingBusinesses.length > 0) {
    console.log('Business "Najib El Haji" already exists. Skipping setup.');
    return;
  }
  
  // Create the business owner user first
  const ownerEmail = 'najib@hajjelec.com';
  let ownerId: string;
  
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
  const business = await createBusiness(
    'Najib El Haji',
    ownerId,
    'Karamara, Jigjiga, Ethiopia',
    '+251-91-123-4567',
    'info@najibelhaji.com'
  );
  
  console.log(`Created business: ${business.name} (ID: ${business.id})`);
  
  // Create branches
  const branchesData = [
    { name: 'Sayid branch', address: 'Sayid location, Jigjiga, Ethiopia' },
    { name: 'Hamda Hotel branch', address: 'Hamda Hotel, Jigjiga, Ethiopia' },
    { name: 'Chinaksan branch', address: 'Chinaksan area, Jigjiga, Ethiopia' }
  ];
  
  const createdBranches = [];
  for (const branchData of branchesData) {
    const branch = await createBranch(
      business.id,
      branchData.name,
      branchData.address,
      undefined, // phone
      undefined, // email
      ownerId
    );
    createdBranches.push(branch);
    console.log(`Created branch: ${branch.name} (ID: ${branch.id})`);
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
  }, {} as Record<string, string>);
  
  for (const userData of usersData) {
    const branchId = branchMap[userData.branch];
    if (!branchId) {
      console.error(`Branch not found for user: ${userData.name}`);
      continue;
    }
    
    try {
      const result = await createBusinessUser(
        business.id,
        userData.email,
        userData.name,
        userData.role as 'Admin' | 'Staff',
        'SecurePass123!', // Default password for all users
        branchId
      );
      console.log(`Created user: ${userData.name} (${userData.role}) for branch: ${userData.branch}`);
    } catch (error) {
      console.error(`Error creating user ${userData.name}:`, error);
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
  
  for (const cat of categoriesData) {
    const id = `cat_${Math.random().toString(36).substr(2, 9)}`;
    await db.insert(categories).values({
      id,
      name: cat.name,
      color: cat.color,
      businessId: business.id
    });
    console.log(`Created category: ${cat.name}`);
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
  
  for (const account of glAccountsData) {
    const id = `${business.id}_${account.code}`;
    await db.insert(glAccounts).values({
      id,
      businessId: business.id,
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
  
  // Create default preferences
  await db.insert(preferences).values({
    businessId: business.id,
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
  } as any);
  console.log('Created default preferences');
  
  // Create default tax rates and codes
  const taxRateId = `taxrate_vat15_${business.id}`;
  await db.insert(taxRates).values({
    id: taxRateId,
    businessId: business.id,
    name: 'VAT 15%',
    rate: '0.1500',
    effectiveFrom: now(),
    effectiveTo: null,
    isActive: true,
    kind: 'VAT'
  });
  console.log('Created tax rate: VAT 15%');
  
  await db.insert(taxCodes).values({
    id: `taxcode_vat_sales_${business.id}`,
    businessId: business.id,
    code: 'VAT-SALES',
    name: 'VAT 15% Output',
    rateId: taxRateId,
    scope: 'sales',
    direction: 'output',
    isDefault: true
  });
  console.log('Created tax code: VAT 15% Output');
  
  console.log('Setup complete for "Najib El Haji" business!');
  console.log('\nBusiness ID:', business.id);
  console.log('Branches:');
  createdBranches.forEach(branch => {
    console.log(`  - ${branch.name}: ${branch.id}`);
  });
  console.log('\nDefault password for all users: SecurePass123!');
  console.log('Please change passwords after first login.');
}

// Run the setup
setupNajibElHaji().catch(console.error);