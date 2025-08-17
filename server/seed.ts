// server/seed.ts
import { db, schema } from './db/index.ts';
import { sql } from 'drizzle-orm';

const now = () => new Date();
const daysAgo = (n: number) => new Date(Date.now() - n * 86400000);

// Helpers for decimal string formatting
const d2 = (n: number) => n.toFixed(2);  // e.g. amount, rate, total (scale 2)
const d3 = (n: number) => n.toFixed(3);  // e.g. qtyIn/qtyOut (scale 3)
const d4 = (n: number) => n.toFixed(4);  // e.g. unitCost rate(14,4)

export type SeedResult = {
  users: number;
  businesses: number;
  businessUsers: number;
  categories: number;
  accounts: number;
  items: number;
  invoices: number;
  invoiceItems: number;
  cashbook: number;
  transactions: number;
  glAccounts: number;
  glJournalEntries: number;
  glJournalLines: number;
  preferences: number;
  taxRates: number;
  taxCodes: number;
  openingBalances: number;
  inventoryMovements: number;
  appSettings: number;
};

export async function seedAll(): Promise<SeedResult> {
  const conn = await db;

  // DEV-ONLY: wipe tables
  await conn.execute(sql`SET FOREIGN_KEY_CHECKS = 0`);
  await conn.delete(schema.glJournalLines);
  await conn.delete(schema.glJournalEntries);
  await conn.delete(schema.inventoryMovements);
  await conn.delete(schema.invoiceItems);
  await conn.delete(schema.invoices);
  await conn.delete(schema.transactions);
  await conn.delete(schema.cashbook);
  await conn.delete(schema.items);
  await conn.delete(schema.categories);
  await conn.delete(schema.accounts);
  await conn.delete(schema.businessUsers);
  await conn.delete(schema.openingBalances);
  await conn.delete(schema.postingRules);
  await conn.delete(schema.taxCodes);
  await conn.delete(schema.taxRates);
  await conn.delete(schema.preferences);
  await conn.delete(schema.appSettings);
  await conn.delete(schema.glAccounts);
  await conn.delete(schema.businesses);
  await conn.delete(schema.users);
  await conn.execute(sql`SET FOREIGN_KEY_CHECKS = 1`);

  // Users
  const users = [
    { id: 'user_ismail', email: 'ismail@eng-ict.com', name: 'Eng. Ismail', passwordHash: 'hash_ismail', emailVerified: true, createdAt: now(), updatedAt: now() },
    { id: 'user_najib',  email: 'najib@hajielec.com', name: 'Najib Haji',   passwordHash: 'hash_najib',  emailVerified: true, createdAt: now(), updatedAt: now() },
    { id: 'user_mawlid', email: 'mawlid@opera.studio', name: 'Mawlid Opera', passwordHash: 'hash_mawlid', emailVerified: true, createdAt: now(), updatedAt: now() },
  ];
  await conn.insert(schema.users).values(users);

  // Businesses
  const businesses = [
    {
      id: 'biz_ismail',
      name: 'Eng Ismail ICT Company',
      address: 'Kebele 04, Jigjiga, Ethiopia',
      phone: '+251-91-000-0001',
      email: 'info@eng-ict.com',
      website: 'https://eng-ict.com',
      logo: null,
      ownerId: 'user_ismail',
      createdAt: now(),
      updatedAt: now(),
    },
    {
      id: 'biz_najib',
      name: 'Najib Haji Electronics',
      address: 'Karamara, Jigjiga, Ethiopia',
      phone: '+251-91-000-0002',
      email: 'support@hajielec.com',
      website: 'https://hajielec.com',
      logo: null,
      ownerId: 'user_najib',
      createdAt: now(),
      updatedAt: now(),
    },
    {
      id: 'biz_mawlid',
      name: 'Mawlid Opera Studio',
      address: 'Fafan, Jigjiga, Ethiopia',
      phone: '+251-91-000-0003',
      email: 'hello@opera.studio',
      website: 'https://opera.studio',
      logo: null,
      ownerId: 'user_mawlid',
      createdAt: now(),
      updatedAt: now(),
    },
  ];
  await conn.insert(schema.businesses).values(businesses);

  // Business Users
  const businessUsers = [
    { id: 'bu_ismail_owner', businessId: 'biz_ismail', userId: 'user_ismail', role: 'owner', permissions: null, invitedBy: 'user_ismail', invitedAt: now(), acceptedAt: now(), status: 'accepted', createdAt: now() },
    { id: 'bu_najib_owner',  businessId: 'biz_najib',  userId: 'user_najib',  role: 'owner', permissions: null, invitedBy: 'user_najib',  invitedAt: now(), acceptedAt: now(), status: 'accepted', createdAt: now() },
    { id: 'bu_mawlid_owner', businessId: 'biz_mawlid', userId: 'user_mawlid', role: 'owner', permissions: null, invitedBy: 'user_mawlid', invitedAt: now(), acceptedAt: now(), status: 'accepted', createdAt: now() },
  ];
  await conn.insert(schema.businessUsers).values(businessUsers);

  // Categories
  const categories = [
    { id: 'cat_ism_services', name: 'ICT Services',     color: '#1976D2', businessId: 'biz_ismail' },
    { id: 'cat_ism_hw',       name: 'Hardware',         color: '#8E24AA', businessId: 'biz_ismail' },
    { id: 'cat_ism_parts',    name: 'Parts',            color: '#00897B', businessId: 'biz_ismail' },
    { id: 'cat_naj_home',     name: 'Home Electronics', color: '#1976D2', businessId: 'biz_najib'  },
    { id: 'cat_naj_mobile',   name: 'Mobile',           color: '#8E24AA', businessId: 'biz_najib'  },
    { id: 'cat_naj_access',   name: 'Accessories',      color: '#00897B', businessId: 'biz_najib'  },
    { id: 'cat_maw_audio',    name: 'Audio Services',   color: '#1976D2', businessId: 'biz_mawlid' },
    { id: 'cat_maw_video',    name: 'Video Services',   color: '#8E24AA', businessId: 'biz_mawlid' },
    { id: 'cat_maw_print',    name: 'Print',            color: '#00897B', businessId: 'biz_mawlid' },
  ];
  await conn.insert(schema.categories).values(categories);

  // Accounts
  const accounts = [
    { id: 'acc_ism_clientA',  name: 'SomTel Jigjiga',  phone: '+252-63-000000', type: 'customer', categoryId: 'cat_ism_services', businessId: 'biz_ismail', photoUrl: null, createdAt: now(), archived: false, userId: 'user_ismail' },
    { id: 'acc_ism_clientB',  name: 'Jigjiga Univ.',   phone: '+251-25-000000', type: 'customer', categoryId: 'cat_ism_services', businessId: 'biz_ismail', photoUrl: null, createdAt: now(), archived: false, userId: 'user_ismail' },
    { id: 'acc_ism_supplier', name: 'Ethio IT Supply', phone: '+251-11-000000', type: 'vendor',   categoryId: 'cat_ism_parts',    businessId: 'biz_ismail', photoUrl: null, createdAt: now(), archived: false, userId: 'user_ismail' },

    { id: 'acc_naj_clientA',  name: 'Karamara Hotel', phone: '+251-25-000111', type: 'customer', categoryId: 'cat_naj_home',   businessId: 'biz_najib', photoUrl: null, createdAt: now(), archived: false, userId: 'user_najib' },
    { id: 'acc_naj_clientB',  name: 'City Mall',      phone: '+251-25-000222', type: 'customer', categoryId: 'cat_naj_mobile', businessId: 'biz_najib', photoUrl: null, createdAt: now(), archived: false, userId: 'user_najib' },
    { id: 'acc_naj_supplier', name: 'Addis Electronics Dist.', phone: '+251-11-123456', type: 'vendor', categoryId: 'cat_naj_access', businessId: 'biz_najib', photoUrl: null, createdAt: now(), archived: false, userId: 'user_najib' },

    { id: 'acc_maw_clientA',  name: 'Regional Bureau', phone: '+251-25-111111', type: 'customer', categoryId: 'cat_maw_audio', businessId: 'biz_mawlid', photoUrl: null, createdAt: now(), archived: false, userId: 'user_mawlid' },
    { id: 'acc_maw_clientB',  name: 'Fafan Media',     phone: '+251-25-222222', type: 'customer', categoryId: 'cat_maw_video', businessId: 'biz_mawlid', photoUrl: null, createdAt: now(), archived: false, userId: 'user_mawlid' },
    { id: 'acc_maw_supplier', name: 'Djibouti Print House', phone: '+253-21-000000', type: 'vendor', categoryId: 'cat_maw_print', businessId: 'biz_mawlid', photoUrl: null, createdAt: now(), archived: false, userId: 'user_mawlid' },
  ];
  await conn.insert(schema.accounts).values(accounts);

  // Items (decimal fields as strings)
  const items = [
    { id: 'itm_ism_router',  name: 'Cisco Router',                   rate: d2(15000), uom: 'pcs', categoryId: 'cat_ism_hw',       businessId: 'biz_ismail', openingStock: d2(10),  lowStockAlert: d2(2) },
    { id: 'itm_ism_service', name: 'Network Setup (per site)',       rate: d2(25000), uom: 'job', categoryId: 'cat_ism_services', businessId: 'biz_ismail', openingStock: d2(0),   lowStockAlert: d2(0) },

    { id: 'itm_naj_tv',      name: 'Samsung 55" 4K TV',              rate: d2(45000), uom: 'pcs', categoryId: 'cat_naj_home',      businessId: 'biz_najib',  openingStock: d2(5),  lowStockAlert: d2(1) },
    { id: 'itm_naj_phone',   name: 'Tecno Spark 10',                 rate: d2(12000), uom: 'pcs', categoryId: 'cat_naj_mobile',    businessId: 'biz_najib',  openingStock: d2(8),  lowStockAlert: d2(2) },

    { id: 'itm_maw_rec',     name: 'Studio Recording (hour)',        rate: d2(800),   uom: 'hr',  categoryId: 'cat_maw_audio',     businessId: 'biz_mawlid', openingStock: d2(0),  lowStockAlert: d2(0) },
    { id: 'itm_maw_print',   name: 'A3 Poster Print',                rate: d2(150),   uom: 'pcs', categoryId: 'cat_maw_print',     businessId: 'biz_mawlid', openingStock: d2(200),lowStockAlert: d2(50) },
  ];
  await conn.insert(schema.items).values(items);

  // Preferences (auto id)
  await conn.insert(schema.preferences).values([
    { businessId: 'biz_ismail', currency: 'ETB', language: 'en', dateFormat: 'YYYY-MM-DD', timeFormat: '24', firstDayOfWeek: 1, firstDayOfMonth: 1, firstDayOfYear: 1, showTimeInReports: true, showPreviousBalance: true, darkMode: false, biometricEnabled: false },
    { businessId: 'biz_najib',  currency: 'ETB', language: 'en', dateFormat: 'YYYY-MM-DD', timeFormat: '24', firstDayOfWeek: 1, firstDayOfMonth: 1, firstDayOfYear: 1, showTimeInReports: true, showPreviousBalance: true, darkMode: false, biometricEnabled: false },
    { businessId: 'biz_mawlid', currency: 'ETB', language: 'en', dateFormat: 'YYYY-MM-DD', timeFormat: '24', firstDayOfWeek: 1, firstDayOfMonth: 1, firstDayOfYear: 1, showTimeInReports: true, showPreviousBalance: true, darkMode: false, biometricEnabled: false },
  ] as any);

  // App Settings
  await conn.insert(schema.appSettings).values([
    { settingKey: 'ui.theme', settingValue: 'light', settingType: 'string', category: 'ui', description: 'Default UI theme', isSystem: false, createdAt: now(), updatedAt: now() },
    { settingKey: 'tax.defaultVatPct', settingValue: '0.1500', settingType: 'number', category: 'tax', description: 'Default VAT %', isSystem: true, createdAt: now(), updatedAt: now() },
  ]);

  // Taxes (decimal as string)
  await conn.insert(schema.taxRates).values([
    { id: 'taxrate_vat15_biz_ism', businessId: 'biz_ismail', name: 'VAT 15%', rate: d4(0.15), effectiveFrom: daysAgo(120), effectiveTo: null, isActive: true, kind: 'VAT' },
    { id: 'taxrate_vat15_biz_naj', businessId: 'biz_najib',  name: 'VAT 15%', rate: d4(0.15), effectiveFrom: daysAgo(120), effectiveTo: null, isActive: true, kind: 'VAT' },
    { id: 'taxrate_vat15_biz_maw', businessId: 'biz_mawlid', name: 'VAT 15%', rate: d4(0.15), effectiveFrom: daysAgo(120), effectiveTo: null, isActive: true, kind: 'VAT' },
  ]);

  await conn.insert(schema.taxCodes).values([
    { id: 'taxcode_vat_sales_ism', businessId: 'biz_ismail', code: 'VAT-SALES', name: 'VAT 15% Output', rateId: 'taxrate_vat15_biz_ism', scope: 'sales', direction: 'output', isDefault: true },
    { id: 'taxcode_vat_sales_naj', businessId: 'biz_najib',  code: 'VAT-SALES', name: 'VAT 15% Output', rateId: 'taxrate_vat15_biz_naj', scope: 'sales', direction: 'output', isDefault: true },
    { id: 'taxcode_vat_sales_maw', businessId: 'biz_mawlid', code: 'VAT-SALES', name: 'VAT 15% Output', rateId: 'taxrate_vat15_biz_maw', scope: 'sales', direction: 'output', isDefault: true },
  ]);

  // GL COA
  const baseCOA = (biz: string) => ([
    { id: `${biz}_1000`, businessId: biz, code: '1000', name: 'Cash',                 type: 'asset',     parentId: null, isLeaf: true, isActive: true, systemFlag: true, description: 'Cash in hand', createdAt: now(), updatedAt: now() },
    { id: `${biz}_1100`, businessId: biz, code: '1100', name: 'Accounts Receivable',  type: 'asset',     parentId: null, isLeaf: true, isActive: true, systemFlag: true, description: 'Trade debtors', createdAt: now(), updatedAt: now() },
    { id: `${biz}_1200`, businessId: biz, code: '1200', name: 'Inventory',            type: 'asset',     parentId: null, isLeaf: true, isActive: true, systemFlag: true, description: 'Inventory on hand', createdAt: now(), updatedAt: now() },
    { id: `${biz}_2000`, businessId: biz, code: '2000', name: 'Accounts Payable',     type: 'liability', parentId: null, isLeaf: true, isActive: true, systemFlag: true, description: 'Trade creditors', createdAt: now(), updatedAt: now() },
    { id: `${biz}_3000`, businessId: biz, code: '3000', name: 'Owner’s Equity',       type: 'equity',    parentId: null, isLeaf: true, isActive: true, systemFlag: true, description: 'Capital', createdAt: now(), updatedAt: now() },
    { id: `${biz}_4000`, businessId: biz, code: '4000', name: 'Sales Revenue',        type: 'revenue',   parentId: null, isLeaf: true, isActive: true, systemFlag: true, description: 'Product/service sales', createdAt: now(), updatedAt: now() },
    { id: `${biz}_5000`, businessId: biz, code: '5000', name: 'Cost of Goods Sold',   type: 'expense',   parentId: null, isLeaf: true, isActive: true, systemFlag: true, description: 'COGS', createdAt: now(), updatedAt: now() },
    { id: `${biz}_5100`, businessId: biz, code: '5100', name: 'Rent Expense',         type: 'expense',   parentId: null, isLeaf: true, isActive: true, systemFlag: true, description: 'Rent', createdAt: now(), updatedAt: now() },
  ]);

  const glAccounts = [
    ...baseCOA('biz_ismail'),
    ...baseCOA('biz_najib'),
    ...baseCOA('biz_mawlid'),
  ];
  await conn.insert(schema.glAccounts).values(glAccounts);

  // Opening balances
  await conn.insert(schema.openingBalances).values([
    { id: 'ob_ism_2025', businessId: 'biz_ismail', periodStart: new Date('2025-01-01T00:00:00Z'), memo: 'Opening balance 2025', locked: false, createdAt: now() },
    { id: 'ob_naj_2025', businessId: 'biz_najib',  periodStart: new Date('2025-01-01T00:00:00Z'), memo: 'Opening balance 2025', locked: false, createdAt: now() },
    { id: 'ob_maw_2025', businessId: 'biz_mawlid', periodStart: new Date('2025-01-01T00:00:00Z'), memo: 'Opening balance 2025', locked: false, createdAt: now() },
  ]);

  // Helper to post JE with decimal strings
  async function postJE(
    biz: string,
    id: string,
    date: Date,
    memo: string,
    sourceModule: string,
    postedBy: string,
    lines: Array<{ accountId: string; debit?: number; credit?: number; notes?: string }>
  ) {
    await conn.insert(schema.glJournalEntries).values({
      id, businessId: biz, entryDate: date, memo, sourceModule,
      sourceId: null, postedBy, postedAt: now(), createdAt: now(), locked: false,
    });
    const lineRows = lines.map((l, idx) => ({
      id: `${id}_L${idx + 1}`,
      entryId: id,
      businessId: biz,
      accountId: l.accountId,
      debit: l.debit != null ? d2(l.debit) : '0.00',
      credit: l.credit != null ? d2(l.credit) : '0.00',
      partyId: null,
      itemId: null,
      notes: l.notes ?? null,
    }));
    await conn.insert(schema.glJournalLines).values(lineRows);
  }

  // Seed JEs (use d2 for amounts)
  await postJE('biz_ismail', 'je_ism_open', new Date('2025-01-02'), 'Opening balance', 'opening_balance', 'user_ismail', [
    { accountId: 'biz_ismail_1000', debit: 50000 },
    { accountId: 'biz_ismail_3000', credit: 50000 },
  ]);
  await postJE('biz_najib', 'je_naj_open', new Date('2025-01-02'), 'Opening balance', 'opening_balance', 'user_najib', [
    { accountId: 'biz_najib_1000', debit: 80000 },
    { accountId: 'biz_najib_3000', credit: 80000 },
  ]);
  await postJE('biz_mawlid', 'je_maw_open', new Date('2025-01-02'), 'Opening balance', 'opening_balance', 'user_mawlid', [
    { accountId: 'biz_mawlid_1000', debit: 30000 },
    { accountId: 'biz_mawlid_3000', credit: 30000 },
  ]);

  await postJE('biz_ismail', 'je_ism_sale1', daysAgo(20), 'Network setup for SomTel – on credit', 'invoice', 'user_ismail', [
    { accountId: 'biz_ismail_1100', debit: 25000, notes: 'AR SomTel' },
    { accountId: 'biz_ismail_4000', credit: 25000, notes: 'Sales revenue' },
  ]);
  await postJE('biz_najib', 'je_naj_sale1', daysAgo(18), 'Sold Samsung 55" to Karamara Hotel – cash', 'invoice', 'user_najib', [
    { accountId: 'biz_najib_1000', debit: 45000, notes: 'Cash sale' },
    { accountId: 'biz_najib_4000', credit: 45000, notes: 'Sales revenue' },
  ]);
  await postJE('biz_mawlid', 'je_maw_sale1', daysAgo(15), 'Recording session – on credit', 'invoice', 'user_mawlid', [
    { accountId: 'biz_mawlid_1100', debit: 4000, notes: 'AR Fafan Media' },
    { accountId: 'biz_mawlid_4000', credit: 4000, notes: 'Sales revenue' },
  ]);

  await postJE('biz_ismail', 'je_ism_receipt1', daysAgo(12), 'SomTel payment', 'cashbook', 'user_ismail', [
    { accountId: 'biz_ismail_1000', debit: 20000, notes: 'Cash in' },
    { accountId: 'biz_ismail_1100', credit: 20000, notes: 'Reduce AR' },
  ]);

  await postJE('biz_najib', 'je_naj_purchase1', daysAgo(25), 'Purchase 3x Samsung 55" on credit', 'purchase', 'user_najib', [
    { accountId: 'biz_najib_1200', debit: 120000, notes: 'Inventory' },
    { accountId: 'biz_najib_2000', credit: 120000, notes: 'AP Addis Electronics' },
  ]);

  await postJE('biz_najib', 'je_naj_cogs1', daysAgo(18), 'COGS for Samsung sale', 'inventory', 'user_najib', [
    { accountId: 'biz_najib_5000', debit: 40000, notes: 'COGS' },
    { accountId: 'biz_najib_1200', credit: 40000, notes: 'Inventory out' },
  ]);

  await postJE('biz_mawlid', 'je_maw_rent', daysAgo(7), 'Studio rent', 'manual', 'user_mawlid', [
    { accountId: 'biz_mawlid_5100', debit: 5000, notes: 'Rent' },
    { accountId: 'biz_mawlid_1000', credit: 5000, notes: 'Cash out' },
  ]);

  // Cashbook (amount as string)
  const cashbook = [
    { id: 'cb_ism_1', businessId: 'biz_ismail', dateTime: daysAgo(12), direction: 'in',  amount: d2(20000), note: 'SomTel payment', attachmentUrl: null },
    { id: 'cb_ism_2', businessId: 'biz_ismail', dateTime: daysAgo(5),  direction: 'out', amount: d2(3000),  note: 'Office supplies', attachmentUrl: null },

    { id: 'cb_naj_1', businessId: 'biz_najib',  dateTime: daysAgo(18), direction: 'in',  amount: d2(45000), note: 'TV cash sale', attachmentUrl: null },
    { id: 'cb_naj_2', businessId: 'biz_najib',  dateTime: daysAgo(3),  direction: 'out', amount: d2(7000),  note: 'Shop utilities', attachmentUrl: null },

    { id: 'cb_maw_1', businessId: 'biz_mawlid', dateTime: daysAgo(7),  direction: 'out', amount: d2(5000),  note: 'Studio rent', attachmentUrl: null },
  ];
  await conn.insert(schema.cashbook).values(cashbook);

  // Inventory movements (qty/unitCost/value as strings)
  const inventoryMovements = [
    { id: 'im_naj_in_1',  businessId: 'biz_najib', date: daysAgo(25), itemId: 'itm_naj_tv', qtyIn: d3(3), qtyOut: d3(0), unitCost: d4(40000), value: d2(120000), sourceModule: 'purchase', sourceId: 'je_naj_purchase1', createdAt: now() },
    { id: 'im_naj_out_1', businessId: 'biz_najib', date: daysAgo(18), itemId: 'itm_naj_tv', qtyIn: d3(0), qtyOut: d3(1), unitCost: d4(40000), value: d2(40000),  sourceModule: 'invoice',  sourceId: 'je_naj_cogs1',     createdAt: now() },
  ];
  await conn.insert(schema.inventoryMovements).values(inventoryMovements);

  // Invoices (money fields as strings)
  await conn.insert(schema.invoices).values([
    {
      id: 'inv_ism_001', number: 'INV-ISM-001', accountId: 'acc_ism_clientA', businessId: 'biz_ismail',
      kind: 'sale', issueDate: daysAgo(20), dueDate: daysAgo(5),
      subtotal: d2(25000), discount: d2(0), addlCharges: d2(0), total: d2(25000), pdfUrl: null, status: 'open',
    },
    {
      id: 'inv_naj_001', number: 'INV-NAJ-001', accountId: 'acc_naj_clientA', businessId: 'biz_najib',
      kind: 'sale', issueDate: daysAgo(18), dueDate: daysAgo(1),
      subtotal: d2(45000), discount: d2(0), addlCharges: d2(0), total: d2(45000), pdfUrl: null, status: 'paid',
    },
    {
      id: 'inv_maw_001', number: 'INV-MAW-001', accountId: 'acc_maw_clientB', businessId: 'biz_mawlid',
      kind: 'sale', issueDate: daysAgo(15), dueDate: daysAgo(2),
      subtotal: d2(4000), discount: d2(0), addlCharges: d2(0), total: d2(4000), pdfUrl: null, status: 'open',
    },
  ]);

  await conn.insert(schema.invoiceItems).values([
    { id: 'ii_ism_001_1', invoiceId: 'inv_ism_001', itemId: 'itm_ism_service', qty: d2(1), rate: d2(25000), discountPct: d2(0), total: d2(25000) },
    { id: 'ii_naj_001_1', invoiceId: 'inv_naj_001', itemId: 'itm_naj_tv',      qty: d2(1), rate: d2(45000), discountPct: d2(0), total: d2(45000) },
    { id: 'ii_maw_001_1', invoiceId: 'inv_maw_001', itemId: 'itm_maw_rec',     qty: d2(5), rate: d2(800),   discountPct: d2(0), total: d2(4000)  },
  ]);

  // Transactions (amount as string)
  const transactions = [
    { id: 'txn_ism_1', accountId: 'acc_ism_clientA', businessId: 'biz_ismail', dateTime: daysAgo(20), kind: 'credit', amount: d2(25000), note: 'Invoice INV-ISM-001', imageUrl: null, dueDate: daysAgo(5), createdAt: now(), updatedAt: now(), deleted: false, userId: 'user_ismail' },
    { id: 'txn_ism_2', accountId: 'acc_ism_clientA', businessId: 'biz_ismail', dateTime: daysAgo(12), kind: 'debit',  amount: d2(20000), note: 'Cash received',       imageUrl: null, dueDate: null,      createdAt: now(), updatedAt: now(), deleted: false, userId: 'user_ismail' },

    { id: 'txn_naj_1', accountId: 'acc_naj_clientA', businessId: 'biz_najib',  dateTime: daysAgo(18), kind: 'credit', amount: d2(45000), note: 'Cash sale INV-NAJ-001', imageUrl: null, dueDate: null, createdAt: now(), updatedAt: now(), deleted: false, userId: 'user_najib' },

    { id: 'txn_maw_1', accountId: 'acc_maw_clientB', businessId: 'biz_mawlid', dateTime: daysAgo(15), kind: 'credit', amount: d2(4000),  note: 'Invoice INV-MAW-001', imageUrl: null, dueDate: daysAgo(2), createdAt: now(), updatedAt: now(), deleted: false, userId: 'user_mawlid' },
  ];
  await conn.insert(schema.transactions).values(transactions);

  return {
    users: users.length,
    businesses: businesses.length,
    businessUsers: businessUsers.length,
    categories: categories.length,
    accounts: accounts.length,
    items: items.length,
    invoices: 3,
    invoiceItems: 3,
    cashbook: cashbook.length,
    transactions: transactions.length,
    glAccounts: glAccounts.length,
    glJournalEntries: 9,
    glJournalLines: 18,
    preferences: 3,
    taxRates: 3,
    taxCodes: 3,
    openingBalances: 3,
    inventoryMovements: 2,
    appSettings: 2,
  };
}
