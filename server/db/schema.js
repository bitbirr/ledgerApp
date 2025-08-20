"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.auditLogsRelations = exports.businessUsersRelations = exports.branchesRelations = exports.auditLogs = exports.openingBalances = exports.postingRules = exports.taxCodes = exports.taxRates = exports.inventoryMovements = exports.glJournalLines = exports.glJournalEntries = exports.glAccounts = exports.appSettings = exports.preferences = exports.invoiceItems = exports.invoices = exports.items = exports.cashbook = exports.transactions = exports.categories = exports.accounts = exports.businessUsers = exports.branches = exports.businesses = exports.users = void 0;
var mysql_core_1 = require("drizzle-orm/mysql-core");
var drizzle_orm_1 = require("drizzle-orm");
// Users table - for authentication and user management
exports.users = (0, mysql_core_1.mysqlTable)('users', {
    id: (0, mysql_core_1.varchar)('id', { length: 255 }).primaryKey(),
    email: (0, mysql_core_1.varchar)('email', { length: 255 }).notNull().unique(),
    name: (0, mysql_core_1.varchar)('name', { length: 255 }).notNull(),
    passwordHash: (0, mysql_core_1.varchar)('password_hash', { length: 255 }).notNull(),
    emailVerified: (0, mysql_core_1.boolean)('email_verified').default(false),
    createdAt: (0, mysql_core_1.timestamp)('created_at').defaultNow(),
    updatedAt: (0, mysql_core_1.timestamp)('updated_at').defaultNow().onUpdateNow(),
});
// Businesses table - replaces shops with enhanced multi-tenant features
exports.businesses = (0, mysql_core_1.mysqlTable)('businesses', {
    id: (0, mysql_core_1.varchar)('id', { length: 255 }).primaryKey(),
    name: (0, mysql_core_1.varchar)('name', { length: 255 }).notNull(),
    address: (0, mysql_core_1.text)('address'),
    phone: (0, mysql_core_1.varchar)('phone', { length: 50 }),
    email: (0, mysql_core_1.varchar)('email', { length: 255 }),
    website: (0, mysql_core_1.varchar)('website', { length: 255 }),
    logo: (0, mysql_core_1.text)('logo_url'),
    ownerId: (0, mysql_core_1.varchar)('owner_id', { length: 255 }).notNull(), // references users.id
    createdAt: (0, mysql_core_1.timestamp)('created_at').defaultNow(),
    updatedAt: (0, mysql_core_1.timestamp)('updated_at').defaultNow().onUpdateNow(),
});
// Branches table - for multi-branch support
exports.branches = (0, mysql_core_1.mysqlTable)('branches', {
    id: (0, mysql_core_1.varchar)('id', { length: 255 }).primaryKey(),
    businessId: (0, mysql_core_1.varchar)('business_id', { length: 255 }).notNull(),
    name: (0, mysql_core_1.varchar)('name', { length: 255 }).notNull(),
    address: (0, mysql_core_1.text)('address'),
    phone: (0, mysql_core_1.varchar)('phone', { length: 50 }),
    email: (0, mysql_core_1.varchar)('email', { length: 255 }),
    isActive: (0, mysql_core_1.boolean)('is_active').default(true),
    createdAt: (0, mysql_core_1.timestamp)('created_at').defaultNow(),
    updatedAt: (0, mysql_core_1.timestamp)('updated_at').defaultNow().onUpdateNow(),
}, function (table) { return ({
    businessIdx: (0, mysql_core_1.index)('ix_branches_business').on(table.businessId),
}); });
// Business Users junction table - for staff invitations and roles
exports.businessUsers = (0, mysql_core_1.mysqlTable)('business_users', {
    id: (0, mysql_core_1.varchar)('id', { length: 255 }).primaryKey(),
    businessId: (0, mysql_core_1.varchar)('business_id', { length: 255 }).notNull(), // references businesses.id
    branchId: (0, mysql_core_1.varchar)('branch_id', { length: 255 }), // New field for branch association
    userId: (0, mysql_core_1.varchar)('user_id', { length: 255 }).notNull(), // references users.id
    role: (0, mysql_core_1.varchar)('role', { length: 50 }).default('Staff'), // Update to match RBAC roles: SuperAdmin, Admin, Staff
    permissions: (0, mysql_core_1.text)('permissions'), // JSON string for future role-based permissions
    invitedBy: (0, mysql_core_1.varchar)('invited_by', { length: 255 }), // references users.id
    invitedAt: (0, mysql_core_1.timestamp)('invited_at').defaultNow(),
    acceptedAt: (0, mysql_core_1.timestamp)('accepted_at'),
    status: (0, mysql_core_1.varchar)('status', { length: 20 }).default('pending'), // pending, accepted, declined
    createdAt: (0, mysql_core_1.timestamp)('created_at').defaultNow(),
}, function (table) { return ({
    businessIdx: (0, mysql_core_1.index)('ix_business_users_business').on(table.businessId),
    branchIdx: (0, mysql_core_1.index)('ix_business_users_branch').on(table.branchId), // New index
}); });
// Update accounts table to use businessId instead of shopId
exports.accounts = (0, mysql_core_1.mysqlTable)('accounts', {
    id: (0, mysql_core_1.varchar)('id', { length: 255 }).primaryKey(),
    name: (0, mysql_core_1.varchar)('name', { length: 255 }).notNull(),
    phone: (0, mysql_core_1.varchar)('phone', { length: 50 }),
    type: (0, mysql_core_1.varchar)('type', { length: 50 }).notNull(),
    categoryId: (0, mysql_core_1.varchar)('category_id', { length: 255 }),
    businessId: (0, mysql_core_1.varchar)('business_id', { length: 255 }).notNull(), // Changed from shopId to businessId
    photoUrl: (0, mysql_core_1.text)('photo_url'),
    createdAt: (0, mysql_core_1.timestamp)('created_at').defaultNow(),
    archived: (0, mysql_core_1.boolean)('archived').default(false),
    userId: (0, mysql_core_1.varchar)('user_id', { length: 255 }).notNull(),
});
// Update categories table to include businessId for multi-tenancy
exports.categories = (0, mysql_core_1.mysqlTable)('categories', {
    id: (0, mysql_core_1.varchar)('id', { length: 255 }).primaryKey(),
    name: (0, mysql_core_1.varchar)('name', { length: 255 }).notNull(),
    color: (0, mysql_core_1.varchar)('color', { length: 7 }).notNull(),
    businessId: (0, mysql_core_1.varchar)('business_id', { length: 255 }).notNull(), // Add business association
});
// Update transactions table to include businessId
exports.transactions = (0, mysql_core_1.mysqlTable)('transactions', {
    id: (0, mysql_core_1.varchar)('id', { length: 255 }).primaryKey(),
    accountId: (0, mysql_core_1.varchar)('account_id', { length: 255 }).notNull(),
    businessId: (0, mysql_core_1.varchar)('business_id', { length: 255 }).notNull(), // Add business association
    dateTime: (0, mysql_core_1.timestamp)('date_time').notNull(),
    kind: (0, mysql_core_1.varchar)('kind', { length: 10 }).notNull(),
    amount: (0, mysql_core_1.decimal)('amount', { precision: 10, scale: 2 }).notNull(),
    note: (0, mysql_core_1.text)('note'),
    imageUrl: (0, mysql_core_1.text)('image_url'),
    dueDate: (0, mysql_core_1.timestamp)('due_date'),
    createdAt: (0, mysql_core_1.timestamp)('created_at').defaultNow(),
    updatedAt: (0, mysql_core_1.timestamp)('updated_at').defaultNow(),
    deleted: (0, mysql_core_1.boolean)('deleted').default(false),
    userId: (0, mysql_core_1.varchar)('user_id', { length: 255 }).notNull(),
});
// Update cashbook table to include businessId
exports.cashbook = (0, mysql_core_1.mysqlTable)('cashbook', {
    id: (0, mysql_core_1.varchar)('id', { length: 255 }).primaryKey(),
    businessId: (0, mysql_core_1.varchar)('business_id', { length: 255 }).notNull(), // Add business association
    dateTime: (0, mysql_core_1.timestamp)('date_time').notNull(),
    direction: (0, mysql_core_1.varchar)('direction', { length: 10 }).notNull(),
    amount: (0, mysql_core_1.decimal)('amount', { precision: 10, scale: 2 }).notNull(),
    note: (0, mysql_core_1.text)('note'),
    attachmentUrl: (0, mysql_core_1.text)('attachment_url'),
});
// Update items table to include businessId
exports.items = (0, mysql_core_1.mysqlTable)('items', {
    id: (0, mysql_core_1.varchar)('id', { length: 255 }).primaryKey(),
    name: (0, mysql_core_1.varchar)('name', { length: 255 }).notNull(),
    rate: (0, mysql_core_1.decimal)('rate', { precision: 10, scale: 2 }).notNull(),
    uom: (0, mysql_core_1.varchar)('uom', { length: 50 }).notNull(),
    categoryId: (0, mysql_core_1.varchar)('category_id', { length: 255 }),
    businessId: (0, mysql_core_1.varchar)('business_id', { length: 255 }).notNull(), // Add business association
    openingStock: (0, mysql_core_1.decimal)('opening_stock', { precision: 10, scale: 2 }).default('0'),
    lowStockAlert: (0, mysql_core_1.decimal)('low_stock_alert', { precision: 10, scale: 2 }).default('0'),
});
// Update invoices table to include businessId
exports.invoices = (0, mysql_core_1.mysqlTable)('invoices', {
    id: (0, mysql_core_1.varchar)('id', { length: 255 }).primaryKey(),
    number: (0, mysql_core_1.varchar)('number', { length: 100 }).notNull(),
    accountId: (0, mysql_core_1.varchar)('account_id', { length: 255 }).notNull(),
    businessId: (0, mysql_core_1.varchar)('business_id', { length: 255 }).notNull(), // Add business association
    kind: (0, mysql_core_1.varchar)('kind', { length: 20 }).notNull(),
    issueDate: (0, mysql_core_1.timestamp)('issue_date').notNull(),
    dueDate: (0, mysql_core_1.timestamp)('due_date'),
    subtotal: (0, mysql_core_1.decimal)('subtotal', { precision: 10, scale: 2 }).notNull(),
    discount: (0, mysql_core_1.decimal)('discount', { precision: 10, scale: 2 }).default('0'),
    addlCharges: (0, mysql_core_1.decimal)('addl_charges', { precision: 10, scale: 2 }).default('0'),
    total: (0, mysql_core_1.decimal)('total', { precision: 10, scale: 2 }).notNull(),
    pdfUrl: (0, mysql_core_1.text)('pdf_url'),
    status: (0, mysql_core_1.varchar)('status', { length: 20 }).notNull(),
});
exports.invoiceItems = (0, mysql_core_1.mysqlTable)('invoice_items', {
    id: (0, mysql_core_1.varchar)('id', { length: 255 }).primaryKey(),
    invoiceId: (0, mysql_core_1.varchar)('invoice_id', { length: 255 }).notNull(),
    itemId: (0, mysql_core_1.varchar)('item_id', { length: 255 }).notNull(),
    qty: (0, mysql_core_1.decimal)('qty', { precision: 10, scale: 2 }).notNull(),
    rate: (0, mysql_core_1.decimal)('rate', { precision: 10, scale: 2 }).notNull(),
    discountPct: (0, mysql_core_1.decimal)('discount_pct', { precision: 5, scale: 2 }).default('0'),
    total: (0, mysql_core_1.decimal)('total', { precision: 10, scale: 2 }).notNull(),
});
// Update preferences to be business-specific
exports.preferences = (0, mysql_core_1.mysqlTable)('preferences', {
    id: (0, mysql_core_1.int)('id').primaryKey().autoincrement(),
    businessId: (0, mysql_core_1.varchar)('business_id', { length: 255 }).notNull(), // Add business association
    dateFormat: (0, mysql_core_1.varchar)('date_format', { length: 20 }).default('DD/MM/YYYY'),
    timeFormat: (0, mysql_core_1.varchar)('time_format', { length: 5 }).default('12'),
    currency: (0, mysql_core_1.varchar)('currency', { length: 10 }).default('ETB'),
    language: (0, mysql_core_1.varchar)('language', { length: 10 }).default('en'),
    firstDayOfWeek: (0, mysql_core_1.int)('first_day_of_week').default(1),
    firstDayOfMonth: (0, mysql_core_1.int)('first_day_of_month').default(1),
    firstDayOfYear: (0, mysql_core_1.int)('first_day_of_year').default(1),
    showTimeInReports: (0, mysql_core_1.boolean)('show_time_in_reports').default(true),
    showPreviousBalance: (0, mysql_core_1.boolean)('show_previous_balance').default(true),
    darkMode: (0, mysql_core_1.boolean)('dark_mode').default(false),
    biometricEnabled: (0, mysql_core_1.boolean)('biometric_enabled').default(false),
});
// Add the new app_settings table
exports.appSettings = (0, mysql_core_1.mysqlTable)('app_settings', {
    settingId: (0, mysql_core_1.int)('setting_id').primaryKey().autoincrement(),
    settingKey: (0, mysql_core_1.varchar)('setting_key', { length: 100 }).notNull().unique(),
    settingValue: (0, mysql_core_1.text)('setting_value'),
    settingType: (0, mysql_core_1.varchar)('setting_type', { length: 20 }).default('string'),
    category: (0, mysql_core_1.varchar)('category', { length: 50 }).notNull(),
    description: (0, mysql_core_1.text)('description'),
    isSystem: (0, mysql_core_1.boolean)('is_system').default(false),
    createdAt: (0, mysql_core_1.timestamp)('created_at').defaultNow(),
    updatedAt: (0, mysql_core_1.timestamp)('updated_at').defaultNow().onUpdateNow(),
    createdBy: (0, mysql_core_1.varchar)('created_by', { length: 100 }),
    updatedBy: (0, mysql_core_1.varchar)('updated_by', { length: 100 }),
});
/**
 * General Ledger (GL) and Tax tables for double-entry accounting (Config C)
 */
// Chart of Accounts
exports.glAccounts = (0, mysql_core_1.mysqlTable)('gl_accounts', {
    id: (0, mysql_core_1.varchar)('id', { length: 255 }).primaryKey(),
    businessId: (0, mysql_core_1.varchar)('business_id', { length: 255 }).notNull(),
    code: (0, mysql_core_1.varchar)('code', { length: 50 }).notNull(),
    name: (0, mysql_core_1.varchar)('name', { length: 255 }).notNull(),
    type: (0, mysql_core_1.varchar)('type', { length: 20 }).notNull(), // asset, liability, equity, revenue, expense
    parentId: (0, mysql_core_1.varchar)('parent_id', { length: 255 }),
    isLeaf: (0, mysql_core_1.boolean)('is_leaf').default(true),
    isActive: (0, mysql_core_1.boolean)('is_active').default(true),
    systemFlag: (0, mysql_core_1.boolean)('system_flag').default(false),
    description: (0, mysql_core_1.text)('description'),
    createdAt: (0, mysql_core_1.timestamp)('created_at').defaultNow(),
    updatedAt: (0, mysql_core_1.timestamp)('updated_at').defaultNow().onUpdateNow(),
});
// Journal Entries (header)
exports.glJournalEntries = (0, mysql_core_1.mysqlTable)('gl_journal_entries', {
    id: (0, mysql_core_1.varchar)('id', { length: 255 }).primaryKey(),
    businessId: (0, mysql_core_1.varchar)('business_id', { length: 255 }).notNull(),
    entryDate: (0, mysql_core_1.timestamp)('entry_date').notNull(),
    memo: (0, mysql_core_1.text)('memo'),
    sourceModule: (0, mysql_core_1.varchar)('source_module', { length: 50 }).notNull(), // cashbook, invoice, purchase, payment, inventory, migration, manual, opening_balance
    sourceId: (0, mysql_core_1.varchar)('source_id', { length: 255 }),
    postedBy: (0, mysql_core_1.varchar)('posted_by', { length: 255 }).notNull(),
    postedAt: (0, mysql_core_1.timestamp)('posted_at').defaultNow(),
    createdAt: (0, mysql_core_1.timestamp)('created_at').defaultNow(),
    locked: (0, mysql_core_1.boolean)('locked').default(false),
});
// Journal Lines (detail)
exports.glJournalLines = (0, mysql_core_1.mysqlTable)('gl_journal_lines', {
    id: (0, mysql_core_1.varchar)('id', { length: 255 }).primaryKey(),
    entryId: (0, mysql_core_1.varchar)('entry_id', { length: 255 }).notNull(),
    businessId: (0, mysql_core_1.varchar)('business_id', { length: 255 }).notNull(),
    accountId: (0, mysql_core_1.varchar)('account_id', { length: 255 }).notNull(),
    debit: (0, mysql_core_1.decimal)('debit', { precision: 14, scale: 2 }).default('0'),
    credit: (0, mysql_core_1.decimal)('credit', { precision: 14, scale: 2 }).default('0'),
    partyId: (0, mysql_core_1.varchar)('party_id', { length: 255 }), // link to AR/AP party (accounts table id)
    itemId: (0, mysql_core_1.varchar)('item_id', { length: 255 }), // link to items table id
    notes: (0, mysql_core_1.text)('notes'),
});
// Inventory Movements for weighted-average costing
exports.inventoryMovements = (0, mysql_core_1.mysqlTable)('inventory_movements', {
    id: (0, mysql_core_1.varchar)('id', { length: 255 }).primaryKey(),
    businessId: (0, mysql_core_1.varchar)('business_id', { length: 255 }).notNull(),
    date: (0, mysql_core_1.timestamp)('date').notNull(),
    itemId: (0, mysql_core_1.varchar)('item_id', { length: 255 }).notNull(),
    qtyIn: (0, mysql_core_1.decimal)('qty_in', { precision: 14, scale: 3 }).default('0'),
    qtyOut: (0, mysql_core_1.decimal)('qty_out', { precision: 14, scale: 3 }).default('0'),
    unitCost: (0, mysql_core_1.decimal)('unit_cost', { precision: 14, scale: 4 }).notNull(),
    value: (0, mysql_core_1.decimal)('value', { precision: 16, scale: 2 }).notNull(),
    sourceModule: (0, mysql_core_1.varchar)('source_module', { length: 50 }).notNull(),
    sourceId: (0, mysql_core_1.varchar)('source_id', { length: 255 }).notNull(),
    createdAt: (0, mysql_core_1.timestamp)('created_at').defaultNow(),
});
// Tax Rates and Codes
exports.taxRates = (0, mysql_core_1.mysqlTable)('tax_rates', {
    id: (0, mysql_core_1.varchar)('id', { length: 255 }).primaryKey(),
    businessId: (0, mysql_core_1.varchar)('business_id', { length: 255 }).notNull(),
    name: (0, mysql_core_1.varchar)('name', { length: 100 }).notNull(), // "VAT 15%"
    rate: (0, mysql_core_1.decimal)('rate', { precision: 6, scale: 4 }).notNull(), // 0.1500
    effectiveFrom: (0, mysql_core_1.timestamp)('effective_from').notNull(),
    effectiveTo: (0, mysql_core_1.timestamp)('effective_to'),
    isActive: (0, mysql_core_1.boolean)('is_active').default(true),
    kind: (0, mysql_core_1.varchar)('kind', { length: 10 }).default('VAT'),
});
exports.taxCodes = (0, mysql_core_1.mysqlTable)('tax_codes', {
    id: (0, mysql_core_1.varchar)('id', { length: 255 }).primaryKey(),
    businessId: (0, mysql_core_1.varchar)('business_id', { length: 255 }).notNull(),
    code: (0, mysql_core_1.varchar)('code', { length: 50 }).notNull(),
    name: (0, mysql_core_1.varchar)('name', { length: 100 }),
    rateId: (0, mysql_core_1.varchar)('rate_id', { length: 255 }).notNull(),
    scope: (0, mysql_core_1.varchar)('scope', { length: 20 }).notNull(), // sales or purchases
    direction: (0, mysql_core_1.varchar)('direction', { length: 10 }).notNull(), // output or input
    isDefault: (0, mysql_core_1.boolean)('is_default').default(false),
});
// Posting Rules (configurable)
exports.postingRules = (0, mysql_core_1.mysqlTable)('posting_rules', {
    id: (0, mysql_core_1.varchar)('id', { length: 255 }).primaryKey(),
    businessId: (0, mysql_core_1.varchar)('business_id', { length: 255 }).notNull(),
    module: (0, mysql_core_1.varchar)('module', { length: 50 }).notNull(), // cashbook, invoice, purchase, etc.
    action: (0, mysql_core_1.varchar)('action', { length: 50 }).notNull(), // cash_in, cash_out, sale_cash, etc.
    debitAccountId: (0, mysql_core_1.varchar)('debit_account_id', { length: 255 }),
    creditAccountId: (0, mysql_core_1.varchar)('credit_account_id', { length: 255 }),
    formula: (0, mysql_core_1.text)('formula'),
    isActive: (0, mysql_core_1.boolean)('is_active').default(true),
    createdAt: (0, mysql_core_1.timestamp)('created_at').defaultNow(),
    updatedAt: (0, mysql_core_1.timestamp)('updated_at').defaultNow().onUpdateNow(),
});
// Opening Balances (one per business/period)
exports.openingBalances = (0, mysql_core_1.mysqlTable)('opening_balances', {
    id: (0, mysql_core_1.varchar)('id', { length: 255 }).primaryKey(),
    businessId: (0, mysql_core_1.varchar)('business_id', { length: 255 }).notNull(),
    periodStart: (0, mysql_core_1.timestamp)('period_start').notNull(), // e.g., 2025-01-01
    memo: (0, mysql_core_1.text)('memo'),
    locked: (0, mysql_core_1.boolean)('locked').default(false),
    createdAt: (0, mysql_core_1.timestamp)('created_at').defaultNow(),
});
// Audit Logs table - for tracking user actions
exports.auditLogs = (0, mysql_core_1.mysqlTable)('audit_logs', {
    id: (0, mysql_core_1.varchar)('id', { length: 255 }).primaryKey(),
    userId: (0, mysql_core_1.varchar)('user_id', { length: 255 }).notNull(),
    businessId: (0, mysql_core_1.varchar)('business_id', { length: 255 }),
    branchId: (0, mysql_core_1.varchar)('branch_id', { length: 255 }),
    action: (0, mysql_core_1.varchar)('action', { length: 100 }).notNull(),
    tableName: (0, mysql_core_1.varchar)('table_name', { length: 100 }),
    recordId: (0, mysql_core_1.varchar)('record_id', { length: 255 }),
    oldValues: (0, mysql_core_1.text)('old_values'), // JSON string
    newValues: (0, mysql_core_1.text)('new_values'), // JSON string
    ipAddress: (0, mysql_core_1.varchar)('ip_address', { length: 45 }),
    userAgent: (0, mysql_core_1.varchar)('user_agent', { length: 500 }),
    createdAt: (0, mysql_core_1.timestamp)('created_at').defaultNow(),
}, function (table) { return ({
    userIdx: (0, mysql_core_1.index)('ix_audit_logs_user').on(table.userId),
    businessIdx: (0, mysql_core_1.index)('ix_audit_logs_business').on(table.businessId),
    branchIdx: (0, mysql_core_1.index)('ix_audit_logs_branch').on(table.branchId),
    actionIdx: (0, mysql_core_1.index)('ix_audit_logs_action').on(table.action),
    tableIdx: (0, mysql_core_1.index)('ix_audit_logs_table').on(table.tableName),
    dateIdx: (0, mysql_core_1.index)('ix_audit_logs_date').on(table.createdAt),
}); });
// Add relationships for branches
exports.branchesRelations = (0, drizzle_orm_1.relations)(exports.branches, function (_a) {
    var one = _a.one, many = _a.many;
    return ({
        business: one(exports.businesses, {
            fields: [exports.branches.businessId],
            references: [exports.businesses.id],
        }),
        businessUsers: many(exports.businessUsers),
    });
});
// Add relationships for businessUsers
exports.businessUsersRelations = (0, drizzle_orm_1.relations)(exports.businessUsers, function (_a) {
    var one = _a.one;
    return ({
        business: one(exports.businesses, {
            fields: [exports.businessUsers.businessId],
            references: [exports.businesses.id],
        }),
        branch: one(exports.branches, {
            fields: [exports.businessUsers.branchId],
            references: [exports.branches.id],
        }),
        user: one(exports.users, {
            fields: [exports.businessUsers.userId],
            references: [exports.users.id],
        }),
    });
});
// Add relationships for auditLogs
exports.auditLogsRelations = (0, drizzle_orm_1.relations)(exports.auditLogs, function (_a) {
    var one = _a.one;
    return ({
        user: one(exports.users, {
            fields: [exports.auditLogs.userId],
            references: [exports.users.id],
        }),
        business: one(exports.businesses, {
            fields: [exports.auditLogs.businessId],
            references: [exports.businesses.id],
        }),
        branch: one(exports.branches, {
            fields: [exports.auditLogs.branchId],
            references: [exports.branches.id],
        }),
    });
});
