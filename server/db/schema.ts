import { mysqlTable, varchar, timestamp, decimal, boolean, int, text } from 'drizzle-orm/mysql-core';

// Add shops table
export const shops = mysqlTable('shops', {
  id: varchar('id', { length: 255 }).primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  isDefault: boolean('is_default').default(false),
  createdAt: timestamp('created_at').defaultNow(),
});

// Update accounts table to include shopId
export const accounts = mysqlTable('accounts', {
  id: varchar('id', { length: 255 }).primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  phone: varchar('phone', { length: 50 }),
  type: varchar('type', { length: 50 }).notNull(),
  categoryId: varchar('category_id', { length: 255 }),
  shopId: varchar('shop_id', { length: 255 }), // Add shopId field
  photoUrl: text('photo_url'),
  createdAt: timestamp('created_at').defaultNow(),
  archived: boolean('archived').default(false),
  userId: varchar('user_id', { length: 255 }).notNull(),
});

export const categories = mysqlTable('categories', {
  id: varchar('id', { length: 255 }).primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  color: varchar('color', { length: 7 }).notNull(),
});

export const transactions = mysqlTable('transactions', {
  id: varchar('id', { length: 255 }).primaryKey(),
  accountId: varchar('account_id', { length: 255 }).notNull(),
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

export const cashbook = mysqlTable('cashbook', {
  id: varchar('id', { length: 255 }).primaryKey(),
  dateTime: timestamp('date_time').notNull(),
  direction: varchar('direction', { length: 10 }).notNull(),
  amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
  note: text('note'),
  attachmentUrl: text('attachment_url'),
});

export const items = mysqlTable('items', {
  id: varchar('id', { length: 255 }).primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  rate: decimal('rate', { precision: 10, scale: 2 }).notNull(),
  uom: varchar('uom', { length: 50 }).notNull(),
  categoryId: varchar('category_id', { length: 255 }),
  openingStock: decimal('opening_stock', { precision: 10, scale: 2 }).default('0'),
  lowStockAlert: decimal('low_stock_alert', { precision: 10, scale: 2 }).default('0'),
});

export const invoices = mysqlTable('invoices', {
  id: varchar('id', { length: 255 }).primaryKey(),
  number: varchar('number', { length: 100 }).notNull(),
  accountId: varchar('account_id', { length: 255 }).notNull(),
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

export const preferences = mysqlTable('preferences', {
  id: int('id').primaryKey().autoincrement(),
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
  settingValue: text('setting_value'), // JSON stored as text with CHECK constraint in MySQL
  settingType: varchar('setting_type', { length: 20 }).default('string'), // enum: string, number, boolean, json, object
  category: varchar('category', { length: 50 }).notNull(),
  description: text('description'),
  isSystem: boolean('is_system').default(false),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow(),
  createdBy: varchar('created_by', { length: 100 }),
  updatedBy: varchar('updated_by', { length: 100 }),
});