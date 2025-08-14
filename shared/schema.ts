import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// No backend storage needed - this is for TypeScript types only
// Data will be stored in IndexedDB via Dexie

export const accountSchema = z.object({
  id: z.string(),
  name: z.string(),
  phone: z.string().optional(),
  type: z.enum(['customer', 'supplier', 'other']),
  categoryId: z.string().optional(),
  photoUrl: z.string().optional(),
  createdAt: z.date(),
  archived: z.boolean().default(false),
});

export const categorySchema = z.object({
  id: z.string(),
  name: z.string(),
  color: z.string(),
});

export const transactionSchema = z.object({
  id: z.string(),
  accountId: z.string(),
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

export const cashbookSchema = z.object({
  id: z.string(),
  dateTime: z.date(),
  direction: z.enum(['in', 'out']),
  amount: z.number(),
  note: z.string().optional(),
  attachmentUrl: z.string().optional(),
});

export const itemSchema = z.object({
  id: z.string(),
  name: z.string(),
  rate: z.number(),
  uom: z.string(), // unit of measurement
  categoryId: z.string().optional(),
  openingStock: z.number().default(0),
  lowStockAlert: z.number().default(0),
});

export const invoiceSchema = z.object({
  id: z.string(),
  number: z.string(),
  accountId: z.string(),
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

export const preferencesSchema = z.object({
  id: z.number().default(1),
  dateFormat: z.string().default('DD/MM/YYYY'),
  timeFormat: z.string().default('12'),
  currency: z.string().default('INR'),
  language: z.string().default('en'),
  firstDayOfWeek: z.number().default(1),
  firstDayOfMonth: z.number().default(1),
  firstDayOfYear: z.number().default(1),
  showTimeInReports: z.boolean().default(true),
  showPreviousBalance: z.boolean().default(true),
  darkMode: z.boolean().default(false),
  biometricEnabled: z.boolean().default(false),
});

// Export types
export type Account = z.infer<typeof accountSchema>;
export type Category = z.infer<typeof categorySchema>;
export type Transaction = z.infer<typeof transactionSchema>;
export type CashbookEntry = z.infer<typeof cashbookSchema>;
export type Item = z.infer<typeof itemSchema>;
export type Invoice = z.infer<typeof invoiceSchema>;
export type InvoiceItem = z.infer<typeof invoiceItemSchema>;
export type Preferences = z.infer<typeof preferencesSchema>;

// Insert schemas (omit auto-generated fields)
export const insertAccountSchema = accountSchema.omit({ id: true, createdAt: true });
export const insertCategorySchema = categorySchema.omit({ id: true });
export const insertTransactionSchema = transactionSchema.omit({ id: true, createdAt: true, updatedAt: true });
export const insertCashbookSchema = cashbookSchema.omit({ id: true });
export const insertItemSchema = itemSchema.omit({ id: true });
export const insertInvoiceSchema = invoiceSchema.omit({ id: true });
export const insertInvoiceItemSchema = invoiceItemSchema.omit({ id: true });

export type InsertAccount = z.infer<typeof insertAccountSchema>;
export type InsertCategory = z.infer<typeof insertCategorySchema>;
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;
export type InsertCashbookEntry = z.infer<typeof insertCashbookSchema>;
export type InsertItem = z.infer<typeof insertItemSchema>;
export type InsertInvoice = z.infer<typeof insertInvoiceSchema>;
export type InsertInvoiceItem = z.infer<typeof insertInvoiceItemSchema>;
