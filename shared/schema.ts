import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User schema for authentication
export const userSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  name: z.string(),
  emailVerified: z.boolean().default(false),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// Business schema - replaces shop schema with enhanced features
export const businessSchema = z.object({
  id: z.string(),
  name: z.string(),
  address: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  website: z.string().url().optional(),
  logo: z.string().optional(),
  ownerId: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// Business Users schema for staff management
export const businessUserSchema = z.object({
  id: z.string(),
  businessId: z.string(),
  userId: z.string(),
  role: z.enum(['owner', 'admin', 'staff', 'viewer']).default('staff'),
  permissions: z.string().optional(), // JSON string for future role-based permissions
  invitedBy: z.string().optional(),
  invitedAt: z.date(),
  acceptedAt: z.date().optional(),
  status: z.enum(['pending', 'accepted', 'declined']).default('pending'),
  createdAt: z.date(),
});

// Update account schema to use businessId
export const accountSchema = z.object({
  id: z.string(),
  name: z.string(),
  phone: z.string().optional(),
  type: z.enum(['customer', 'supplier', 'other']),
  categoryId: z.string().optional(),
  businessId: z.string(), // Changed from shopId to businessId and made required
  photoUrl: z.string().optional(),
  createdAt: z.date(),
  archived: z.boolean().default(false),
});

// Update category schema to include businessId
export const categorySchema = z.object({
  id: z.string(),
  name: z.string(),
  color: z.string(),
  businessId: z.string(), // Add business association
});

// Update transaction schema to include businessId
export const transactionSchema = z.object({
  id: z.string(),
  accountId: z.string(),
  businessId: z.string(), // Add business association
  dateTime: z.date(),
  kind: z.enum(['credit', 'debit']),
  amount: z.number(),
  note: z.string().optional(),
  imageUrl: z.string().optional(),
  dueDate: z.date().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
  deleted: z.boolean().default(false),
});

// Update cashbook schema to include businessId
export const cashbookSchema = z.object({
  id: z.string(),
  businessId: z.string(), // Add business association
  dateTime: z.date(),
  direction: z.enum(['in', 'out']),
  amount: z.number(),
  note: z.string().optional(),
  attachmentUrl: z.string().optional(),
});

// Update item schema to include businessId
export const itemSchema = z.object({
  id: z.string(),
  name: z.string(),
  rate: z.number(),
  uom: z.string(),
  categoryId: z.string().optional(),
  businessId: z.string(), // Add business association
  openingStock: z.number().default(0),
  lowStockAlert: z.number().default(0),
});

// Update invoice schema to include businessId
export const invoiceSchema = z.object({
  id: z.string(),
  number: z.string(),
  accountId: z.string(),
  businessId: z.string(), // Add business association
  kind: z.enum(['sale', 'purchase']),
  issueDate: z.date(),
  dueDate: z.date().optional(),
  subtotal: z.number(),
  discount: z.number().default(0),
  addlCharges: z.number().default(0),
  total: z.number(),
  pdfUrl: z.string().optional(),
  status: z.enum(['unpaid', 'paid', 'partial']),
});

export const invoiceItemSchema = z.object({
  id: z.string(),
  invoiceId: z.string(),
  itemId: z.string(),
  qty: z.number(),
  rate: z.number(),
  discountPct: z.number().default(0),
  total: z.number(),
});

// Update preferences schema to include businessId
export const preferencesSchema = z.object({
  id: z.number().default(1),
  businessId: z.string(), // Add business association
  dateFormat: z.string().default('DD/MM/YYYY'),
  timeFormat: z.string().default('12'),
  currency: z.string().default('ETB'),
  language: z.string().default('en'),
  firstDayOfWeek: z.number().default(1),
  firstDayOfMonth: z.number().default(1),
  firstDayOfYear: z.number().default(1),
  showTimeInReports: z.boolean().default(true),
  showPreviousBalance: z.boolean().default(true),
  darkMode: z.boolean().default(false),
  biometricEnabled: z.boolean().default(false),
});

// Type exports
export type User = z.infer<typeof userSchema>;
export type Business = z.infer<typeof businessSchema>;
export type BusinessUser = z.infer<typeof businessUserSchema>;
export type Account = z.infer<typeof accountSchema>;
export type Category = z.infer<typeof categorySchema>;
export type Transaction = z.infer<typeof transactionSchema>;
export type CashbookEntry = z.infer<typeof cashbookSchema>;
export type Item = z.infer<typeof itemSchema>;
export type Invoice = z.infer<typeof invoiceSchema>;
export type InvoiceItem = z.infer<typeof invoiceItemSchema>;
export type Preferences = z.infer<typeof preferencesSchema>;

// Insert schemas
export const insertUserSchema = userSchema.omit({ id: true, createdAt: true, updatedAt: true });
export const insertBusinessSchema = businessSchema.omit({ id: true, createdAt: true, updatedAt: true });
export const insertBusinessUserSchema = businessUserSchema.omit({ id: true, invitedAt: true, createdAt: true });
export const insertAccountSchema = accountSchema.omit({ id: true, createdAt: true });
export const insertCategorySchema = categorySchema.omit({ id: true });
export const insertTransactionSchema = transactionSchema.omit({ id: true, createdAt: true, updatedAt: true });
export const insertCashbookSchema = cashbookSchema.omit({ id: true });
export const insertItemSchema = itemSchema.omit({ id: true });
export const insertInvoiceSchema = invoiceSchema.omit({ id: true });
export const insertInvoiceItemSchema = invoiceItemSchema.omit({ id: true });
export const insertPreferencesSchema = preferencesSchema.omit({ id: true });

// Insert types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertBusiness = z.infer<typeof insertBusinessSchema>;
export type InsertBusinessUser = z.infer<typeof insertBusinessUserSchema>;
export type InsertAccount = z.infer<typeof insertAccountSchema>;
export type InsertCategory = z.infer<typeof insertCategorySchema>;
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;
export type InsertCashbookEntry = z.infer<typeof insertCashbookSchema>;
export type InsertItem = z.infer<typeof insertItemSchema>;
export type InsertInvoice = z.infer<typeof insertInvoiceSchema>;
export type InsertInvoiceItem = z.infer<typeof insertInvoiceItemSchema>;
export type InsertPreferences = z.infer<typeof insertPreferencesSchema>;

// ======================
// General Ledger & Tax (Config C)
// ======================

export const accountTypeEnum = z.enum(['asset','liability','equity','revenue','expense']);

export const glAccountSchema = z.object({
  id: z.string(),
  businessId: z.string(),
  code: z.string(), // e.g., 1000, 1100-01
  name: z.string(),
  type: accountTypeEnum,
  parentId: z.string().optional(),
  isLeaf: z.boolean().default(true),
  isActive: z.boolean().default(true),
  systemFlag: z.boolean().default(false), // protected system accounts
  description: z.string().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const sourceModuleEnum = z.enum([
  'cashbook',
  'invoice',
  'purchase',
  'payment',
  'inventory',
  'migration',
  'manual',
  'opening_balance',
]);

export const glJournalEntrySchema = z.object({
  id: z.string(),
  businessId: z.string(),
  entryDate: z.date(),
  memo: z.string().optional(),
  sourceModule: sourceModuleEnum,
  sourceId: z.string().optional(),
  postedBy: z.string(),
  postedAt: z.date(),
  createdAt: z.date(),
  locked: z.boolean().default(false),
});

export const glJournalLineSchema = z.object({
  id: z.string(),
  entryId: z.string(),
  businessId: z.string(), // denormalized for indexing
  accountId: z.string(),
  debit: z.number().default(0),
  credit: z.number().default(0),
  partyId: z.string().optional(), // customer/supplier from accounts
  itemId: z.string().optional(), // inventory item
  notes: z.string().optional(),
});

export const inventoryMovementSchema = z.object({
  id: z.string(),
  businessId: z.string(),
  date: z.date(),
  itemId: z.string(),
  qtyIn: z.number().default(0),
  qtyOut: z.number().default(0),
  unitCost: z.number(), // weighted-average unit cost at time of movement
  value: z.number(), // qty * unitCost, positive for in, positive for out as absolute
  sourceModule: sourceModuleEnum,
  sourceId: z.string(),
  createdAt: z.date(),
});

export const taxKindEnum = z.enum(['VAT']);
export const taxDirectionEnum = z.enum(['output','input']); // sales vs purchases output/input
export const taxScopeEnum = z.enum(['sales','purchases']);

export const taxRateSchema = z.object({
  id: z.string(),
  businessId: z.string(),
  name: z.string(), // e.g., "VAT 15%"
  rate: z.number(), // 0.15
  effectiveFrom: z.date(),
  effectiveTo: z.date().optional(),
  isActive: z.boolean().default(true),
  kind: taxKindEnum.default('VAT'),
});

export const taxCodeSchema = z.object({
  id: z.string(),
  businessId: z.string(),
  code: z.string(), // e.g., "VAT-OUT-15", "VAT-IN-15"
  name: z.string().optional(),
  rateId: z.string(),
  scope: taxScopeEnum, // sales or purchases
  direction: taxDirectionEnum, // output or input
  isDefault: z.boolean().default(false),
});

export const postingRuleSchema = z.object({
  id: z.string(),
  businessId: z.string(),
  module: sourceModuleEnum, // cashbook, invoice, purchase, etc.
  action: z.string(), // e.g., cash_in, cash_out, sale_cash, sale_credit, etc.
  debitAccountId: z.string().optional(), // can be resolved dynamically
  creditAccountId: z.string().optional(),
  formula: z.string().optional(), // future: JSON logic for dynamic calculation
  isActive: z.boolean().default(true),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const openingBalanceSchema = z.object({
  id: z.string(),
  businessId: z.string(),
  periodStart: z.date(), // e.g., 2025-01-01
  memo: z.string().optional(),
  locked: z.boolean().default(false),
  createdAt: z.date(),
});

// ======================
// Types
// ======================

export type GLAccount = z.infer<typeof glAccountSchema>;
export type GLJournalEntry = z.infer<typeof glJournalEntrySchema>;
export type GLJournalLine = z.infer<typeof glJournalLineSchema>;
export type InventoryMovement = z.infer<typeof inventoryMovementSchema>;
export type TaxRate = z.infer<typeof taxRateSchema>;
export type TaxCode = z.infer<typeof taxCodeSchema>;
export type PostingRule = z.infer<typeof postingRuleSchema>;
export type OpeningBalance = z.infer<typeof openingBalanceSchema>;

// ======================
// Insert Schemas & Types
// ======================

export const insertGLAccountSchema = glAccountSchema.omit({ id: true, createdAt: true, updatedAt: true, systemFlag: true });
export const insertGLJournalEntrySchema = glJournalEntrySchema.omit({ id: true, createdAt: true, locked: true });
export const insertGLJournalLineSchema = glJournalLineSchema.omit({ id: true });
export const insertInventoryMovementSchema = inventoryMovementSchema.omit({ id: true, createdAt: true });
export const insertTaxRateSchema = taxRateSchema.omit({ id: true });
export const insertTaxCodeSchema = taxCodeSchema.omit({ id: true });
export const insertPostingRuleSchema = postingRuleSchema.omit({ id: true, createdAt: true, updatedAt: true });
export const insertOpeningBalanceSchema = openingBalanceSchema.omit({ id: true, locked: true, createdAt: true });

export type InsertGLAccount = z.infer<typeof insertGLAccountSchema>;
export type InsertGLJournalEntry = z.infer<typeof insertGLJournalEntrySchema>;
export type InsertGLJournalLine = z.infer<typeof insertGLJournalLineSchema>;
export type InsertInventoryMovement = z.infer<typeof insertInventoryMovementSchema>;
export type InsertTaxRate = z.infer<typeof insertTaxRateSchema>;
export type InsertTaxCode = z.infer<typeof insertTaxCodeSchema>;
export type InsertPostingRule = z.infer<typeof insertPostingRuleSchema>;
export type InsertOpeningBalance = z.infer<typeof insertOpeningBalanceSchema>;
