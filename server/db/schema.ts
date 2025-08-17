import { mysqlTable, varchar, timestamp, decimal, boolean, int, text, index } from 'drizzle-orm/mysql-core';
import { relations } from 'drizzle-orm';

// Users table - for authentication and user management
export const users = mysqlTable('users', {
  id: varchar('id', { length: 255 }).primaryKey(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  name: varchar('name', { length: 255 }).notNull(),
  passwordHash: varchar('password_hash', { length: 255 }).notNull(),
  emailVerified: boolean('email_verified').default(false),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow(),
});

// Businesses table - replaces shops with enhanced multi-tenant features
export const businesses = mysqlTable('businesses', {
  id: varchar('id', { length: 255 }).primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  address: text('address'),
  phone: varchar('phone', { length: 50 }),
  email: varchar('email', { length: 255 }),
  website: varchar('website', { length: 255 }),
  logo: text('logo_url'),
  ownerId: varchar('owner_id', { length: 255 }).notNull(), // references users.id
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow(),
});

// Branches table - for multi-branch support
export const branches = mysqlTable('branches', {
  id: varchar('id', { length: 255 }).primaryKey(),
  businessId: varchar('business_id', { length: 255 }).notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  address: text('address'),
  phone: varchar('phone', { length: 50 }),
  email: varchar('email', { length: 255 }),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow(),
}, (table) => ({
  businessIdx: index('ix_branches_business').on(table.businessId),
}));

// Business Users junction table - for staff invitations and roles
export const businessUsers = mysqlTable('business_users', {
  id: varchar('id', { length: 255 }).primaryKey(),
  businessId: varchar('business_id', { length: 255 }).notNull(), // references businesses.id
  branchId: varchar('branch_id', { length: 255 }), // New field for branch association
  userId: varchar('user_id', { length: 255 }).notNull(), // references users.id
  role: varchar('role', { length: 50 }).default('Staff'), // Update to match RBAC roles: SuperAdmin, Admin, Staff
  permissions: text('permissions'), // JSON string for future role-based permissions
  invitedBy: varchar('invited_by', { length: 255 }), // references users.id
  invitedAt: timestamp('invited_at').defaultNow(),
  acceptedAt: timestamp('accepted_at'),
  status: varchar('status', { length: 20 }).default('pending'), // pending, accepted, declined
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => ({
  businessIdx: index('ix_business_users_business').on(table.businessId),
  branchIdx: index('ix_business_users_branch').on(table.branchId), // New index
}));

// Update accounts table to use businessId instead of shopId
export const accounts = mysqlTable('accounts', {
  id: varchar('id', { length: 255 }).primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  phone: varchar('phone', { length: 50 }),
  type: varchar('type', { length: 50 }).notNull(),
  categoryId: varchar('category_id', { length: 255 }),
  businessId: varchar('business_id', { length: 255 }).notNull(), // Changed from shopId to businessId
  photoUrl: text('photo_url'),
  createdAt: timestamp('created_at').defaultNow(),
  archived: boolean('archived').default(false),
  userId: varchar('user_id', { length: 255 }).notNull(),
});

// Update categories table to include businessId for multi-tenancy
export const categories = mysqlTable('categories', {
  id: varchar('id', { length: 255 }).primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  color: varchar('color', { length: 7 }).notNull(),
  businessId: varchar('business_id', { length: 255 }).notNull(), // Add business association
});

// Update transactions table to include businessId
export const transactions = mysqlTable('transactions', {
  id: varchar('id', { length: 255 }).primaryKey(),
  accountId: varchar('account_id', { length: 255 }).notNull(),
  businessId: varchar('business_id', { length: 255 }).notNull(), // Add business association
  dateTime: timestamp('date_time').notNull(),
  kind: varchar('kind', { length: 10 }).notNull(),
  amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
  note: text('note'),
  imageUrl: text('image_url'),
  dueDate: timestamp('due_date'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
  deleted: boolean('deleted').default(false),
  userId: varchar('user_id', { length: 255 }).notNull(),
});

// Update cashbook table to include businessId
export const cashbook = mysqlTable('cashbook', {
  id: varchar('id', { length: 255 }).primaryKey(),
  businessId: varchar('business_id', { length: 255 }).notNull(), // Add business association
  dateTime: timestamp('date_time').notNull(),
  direction: varchar('direction', { length: 10 }).notNull(),
  amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
  note: text('note'),
  attachmentUrl: text('attachment_url'),
});

// Update items table to include businessId
export const items = mysqlTable('items', {
  id: varchar('id', { length: 255 }).primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  rate: decimal('rate', { precision: 10, scale: 2 }).notNull(),
  uom: varchar('uom', { length: 50 }).notNull(),
  categoryId: varchar('category_id', { length: 255 }),
  businessId: varchar('business_id', { length: 255 }).notNull(), // Add business association
  openingStock: decimal('opening_stock', { precision: 10, scale: 2 }).default('0'),
  lowStockAlert: decimal('low_stock_alert', { precision: 10, scale: 2 }).default('0'),
});

// Update invoices table to include businessId
export const invoices = mysqlTable('invoices', {
  id: varchar('id', { length: 255 }).primaryKey(),
  number: varchar('number', { length: 100 }).notNull(),
  accountId: varchar('account_id', { length: 255 }).notNull(),
  businessId: varchar('business_id', { length: 255 }).notNull(), // Add business association
  kind: varchar('kind', { length: 20 }).notNull(),
  issueDate: timestamp('issue_date').notNull(),
  dueDate: timestamp('due_date'),
  subtotal: decimal('subtotal', { precision: 10, scale: 2 }).notNull(),
  discount: decimal('discount', { precision: 10, scale: 2 }).default('0'),
  addlCharges: decimal('addl_charges', { precision: 10, scale: 2 }).default('0'),
  total: decimal('total', { precision: 10, scale: 2 }).notNull(),
  pdfUrl: text('pdf_url'),
  status: varchar('status', { length: 20 }).notNull(),
});

export const invoiceItems = mysqlTable('invoice_items', {
  id: varchar('id', { length: 255 }).primaryKey(),
  invoiceId: varchar('invoice_id', { length: 255 }).notNull(),
  itemId: varchar('item_id', { length: 255 }).notNull(),
  qty: decimal('qty', { precision: 10, scale: 2 }).notNull(),
  rate: decimal('rate', { precision: 10, scale: 2 }).notNull(),
  discountPct: decimal('discount_pct', { precision: 5, scale: 2 }).default('0'),
  total: decimal('total', { precision: 10, scale: 2 }).notNull(),
});

// Update preferences to be business-specific
export const preferences = mysqlTable('preferences', {
  id: int('id').primaryKey().autoincrement(),
  businessId: varchar('business_id', { length: 255 }).notNull(), // Add business association
  dateFormat: varchar('date_format', { length: 20 }).default('DD/MM/YYYY'),
  timeFormat: varchar('time_format', { length: 5 }).default('12'),
  currency: varchar('currency', { length: 10 }).default('ETB'),
  language: varchar('language', { length: 10 }).default('en'),
  firstDayOfWeek: int('first_day_of_week').default(1),
  firstDayOfMonth: int('first_day_of_month').default(1),
  firstDayOfYear: int('first_day_of_year').default(1),
  showTimeInReports: boolean('show_time_in_reports').default(true),
  showPreviousBalance: boolean('show_previous_balance').default(true),
  darkMode: boolean('dark_mode').default(false),
  biometricEnabled: boolean('biometric_enabled').default(false),
});

// Add the new app_settings table
export const appSettings = mysqlTable('app_settings', {
  settingId: int('setting_id').primaryKey().autoincrement(),
  settingKey: varchar('setting_key', { length: 100 }).notNull().unique(),
  settingValue: text('setting_value'),
  settingType: varchar('setting_type', { length: 20 }).default('string'),
  category: varchar('category', { length: 50 }).notNull(),
  description: text('description'),
  isSystem: boolean('is_system').default(false),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow(),
  createdBy: varchar('created_by', { length: 100 }),
  updatedBy: varchar('updated_by', { length: 100 }),
});

/**
 * General Ledger (GL) and Tax tables for double-entry accounting (Config C)
 */

// Chart of Accounts
export const glAccounts = mysqlTable('gl_accounts', {
  id: varchar('id', { length: 255 }).primaryKey(),
  businessId: varchar('business_id', { length: 255 }).notNull(),
  code: varchar('code', { length: 50 }).notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  type: varchar('type', { length: 20 }).notNull(), // asset, liability, equity, revenue, expense
  parentId: varchar('parent_id', { length: 255 }),
  isLeaf: boolean('is_leaf').default(true),
  isActive: boolean('is_active').default(true),
  systemFlag: boolean('system_flag').default(false),
  description: text('description'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow(),
});

// Journal Entries (header)
export const glJournalEntries = mysqlTable('gl_journal_entries', {
  id: varchar('id', { length: 255 }).primaryKey(),
  businessId: varchar('business_id', { length: 255 }).notNull(),
  entryDate: timestamp('entry_date').notNull(),
  memo: text('memo'),
  sourceModule: varchar('source_module', { length: 50 }).notNull(), // cashbook, invoice, purchase, payment, inventory, migration, manual, opening_balance
  sourceId: varchar('source_id', { length: 255 }),
  postedBy: varchar('posted_by', { length: 255 }).notNull(),
  postedAt: timestamp('posted_at').defaultNow(),
  createdAt: timestamp('created_at').defaultNow(),
  locked: boolean('locked').default(false),
});

// Journal Lines (detail)
export const glJournalLines = mysqlTable('gl_journal_lines', {
  id: varchar('id', { length: 255 }).primaryKey(),
  entryId: varchar('entry_id', { length: 255 }).notNull(),
  businessId: varchar('business_id', { length: 255 }).notNull(),
  accountId: varchar('account_id', { length: 255 }).notNull(),
  debit: decimal('debit', { precision: 14, scale: 2 }).default('0'),
  credit: decimal('credit', { precision: 14, scale: 2 }).default('0'),
  partyId: varchar('party_id', { length: 255 }), // link to AR/AP party (accounts table id)
  itemId: varchar('item_id', { length: 255 }),   // link to items table id
  notes: text('notes'),
});

// Inventory Movements for weighted-average costing
export const inventoryMovements = mysqlTable('inventory_movements', {
  id: varchar('id', { length: 255 }).primaryKey(),
  businessId: varchar('business_id', { length: 255 }).notNull(),
  date: timestamp('date').notNull(),
  itemId: varchar('item_id', { length: 255 }).notNull(),
  qtyIn: decimal('qty_in', { precision: 14, scale: 3 }).default('0'),
  qtyOut: decimal('qty_out', { precision: 14, scale: 3 }).default('0'),
  unitCost: decimal('unit_cost', { precision: 14, scale: 4 }).notNull(),
  value: decimal('value', { precision: 16, scale: 2 }).notNull(),
  sourceModule: varchar('source_module', { length: 50 }).notNull(),
  sourceId: varchar('source_id', { length: 255 }).notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

// Tax Rates and Codes
export const taxRates = mysqlTable('tax_rates', {
  id: varchar('id', { length: 255 }).primaryKey(),
  businessId: varchar('business_id', { length: 255 }).notNull(),
  name: varchar('name', { length: 100 }).notNull(), // "VAT 15%"
  rate: decimal('rate', { precision: 6, scale: 4 }).notNull(), // 0.1500
  effectiveFrom: timestamp('effective_from').notNull(),
  effectiveTo: timestamp('effective_to'),
  isActive: boolean('is_active').default(true),
  kind: varchar('kind', { length: 10 }).default('VAT'),
});

export const taxCodes = mysqlTable('tax_codes', {
  id: varchar('id', { length: 255 }).primaryKey(),
  businessId: varchar('business_id', { length: 255 }).notNull(),
  code: varchar('code', { length: 50 }).notNull(),
  name: varchar('name', { length: 100 }),
  rateId: varchar('rate_id', { length: 255 }).notNull(),
  scope: varchar('scope', { length: 20 }).notNull(),     // sales or purchases
  direction: varchar('direction', { length: 10 }).notNull(), // output or input
  isDefault: boolean('is_default').default(false),
});

// Posting Rules (configurable)
export const postingRules = mysqlTable('posting_rules', {
  id: varchar('id', { length: 255 }).primaryKey(),
  businessId: varchar('business_id', { length: 255 }).notNull(),
  module: varchar('module', { length: 50 }).notNull(), // cashbook, invoice, purchase, etc.
  action: varchar('action', { length: 50 }).notNull(), // cash_in, cash_out, sale_cash, etc.
  debitAccountId: varchar('debit_account_id', { length: 255 }),
  creditAccountId: varchar('credit_account_id', { length: 255 }),
  formula: text('formula'),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow(),
});

// Opening Balances (one per business/period)
export const openingBalances = mysqlTable('opening_balances', {
  id: varchar('id', { length: 255 }).primaryKey(),
  businessId: varchar('business_id', { length: 255 }).notNull(),
  periodStart: timestamp('period_start').notNull(), // e.g., 2025-01-01
  memo: text('memo'),
  locked: boolean('locked').default(false),
  createdAt: timestamp('created_at').defaultNow(),
});

// Audit Logs table - for tracking user actions
export const auditLogs = mysqlTable('audit_logs', {
  id: varchar('id', { length: 255 }).primaryKey(),
  userId: varchar('user_id', { length: 255 }).notNull(),
  businessId: varchar('business_id', { length: 255 }),
  branchId: varchar('branch_id', { length: 255 }),
  action: varchar('action', { length: 100 }).notNull(),
  tableName: varchar('table_name', { length: 100 }),
  recordId: varchar('record_id', { length: 255 }),
  oldValues: text('old_values'), // JSON string
  newValues: text('new_values'), // JSON string
  ipAddress: varchar('ip_address', { length: 45 }),
  userAgent: varchar('user_agent', { length: 500 }),
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => ({
  userIdx: index('ix_audit_logs_user').on(table.userId),
  businessIdx: index('ix_audit_logs_business').on(table.businessId),
  branchIdx: index('ix_audit_logs_branch').on(table.branchId),
  actionIdx: index('ix_audit_logs_action').on(table.action),
  tableIdx: index('ix_audit_logs_table').on(table.tableName),
  dateIdx: index('ix_audit_logs_date').on(table.createdAt),
}));

// Add relationships for branches
export const branchesRelations = relations(branches, ({ one, many }) => ({
  business: one(businesses, {
    fields: [branches.businessId],
    references: [businesses.id],
  }),
  businessUsers: many(businessUsers),
}));

// Add relationships for businessUsers
export const businessUsersRelations = relations(businessUsers, ({ one }) => ({
  business: one(businesses, {
    fields: [businessUsers.businessId],
    references: [businesses.id],
  }),
  branch: one(branches, {
    fields: [businessUsers.branchId],
    references: [branches.id],
  }),
  user: one(users, {
    fields: [businessUsers.userId],
    references: [users.id],
  }),
}));

// Add relationships for auditLogs
export const auditLogsRelations = relations(auditLogs, ({ one }) => ({
  user: one(users, {
    fields: [auditLogs.userId],
    references: [users.id],
  }),
  business: one(businesses, {
    fields: [auditLogs.businessId],
    references: [businesses.id],
  }),
  branch: one(branches, {
    fields: [auditLogs.branchId],
    references: [branches.id],
  }),
}));