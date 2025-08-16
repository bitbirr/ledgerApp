import { randomUUID } from 'crypto';
import { and, eq, inArray } from 'drizzle-orm';
import { db } from '../db';
import {
  cashbook,
  glAccounts,
  glJournalEntries,
  glJournalLines,
  invoices as invoicesTable,
  invoiceItems as invoiceItemsTable,
  taxCodes as taxCodesTable,
  taxRates as taxRatesTable,
} from '../db/schema';

export type CashDirection = 'in' | 'out';

export interface PostCashbookParams {
  businessId: string;
  userId: string;
  dateTime: Date;
  direction: CashDirection;        // 'in' = cash/bank receives; 'out' = cash/bank pays
  amount: number;                  // positive number
  note?: string;
  attachmentUrl?: string;

  // GL posting
  cashAccountId: string;           // GL account for Cash/Bank (e.g., 1000/1010/1020)
  offsetAccountId: string;         // Counterparty GL account (AR, AP, Equity, Expense, Revenue)
  partyId?: string;                // Optional AR/AP party (customer/supplier id)
}

/** Format numbers for DECIMAL columns (string) */
function toMoneyString(value: number): string {
  return (Math.round((value + Number.EPSILON) * 100) / 100).toFixed(2);
}

/** Validate GL accounts exist, belong to the business, are active leaf accounts */
async function validatePostingAccounts(businessId: string, accountIds: string[]) {
  const database = await db;
  const list = await database
    .select()
    .from(glAccounts)
    .where(inArray(glAccounts.id, accountIds));

  const scoped = list.filter(a => a.businessId === businessId);
  if (scoped.length !== accountIds.length) {
    throw new Error('One or more GL accounts not found for this business');
  }

  if (scoped.some(a => a.isLeaf === false || a.isActive === false)) {
    throw new Error('Posting allowed to active leaf accounts only');
  }
}

/**
 * Post a cashbook record and a balanced GL journal entry.
 *
 * For direction = 'in':
 *   Dr: Cash/Bank
 *   Cr: Offset Account (e.g., AR, Revenue, Equity)
 * For direction = 'out':
 *   Dr: Offset Account (e.g., Expense, AP)
 *   Cr: Cash/Bank
 */
export async function postCashbookWithJournal(params: PostCashbookParams): Promise<{
  cashbookEntryId: string;
  journalEntryId: string;
}> {
  const {
    businessId,
    userId,
    dateTime,
    direction,
    amount,
    note,
    attachmentUrl,
    cashAccountId,
    offsetAccountId,
    partyId,
  } = params;

  if (!businessId) throw new Error('businessId is required');
  if (!userId) throw new Error('userId is required');
  if (!dateTime) throw new Error('dateTime is required');
  if (direction !== 'in' && direction !== 'out') throw new Error('direction must be in|out');
  if (!(amount > 0)) throw new Error('amount must be a positive number');
  if (!cashAccountId) throw new Error('cashAccountId is required');
  if (!offsetAccountId) throw new Error('offsetAccountId is required');

  await validatePostingAccounts(businessId, [cashAccountId, offsetAccountId]);
  const database = await db;

  // 1) Cashbook row
  const cashbookId = randomUUID();
  await database.insert(cashbook).values({
    id: cashbookId,
    businessId,
    dateTime,
    direction,
    amount: toMoneyString(amount),
    note: note ?? null,
    attachmentUrl: attachmentUrl ?? null,
  });

  // 2) Journal header
  const entryId = randomUUID();
  const now = new Date();
  await database.insert(glJournalEntries).values({
    id: entryId,
    businessId,
    entryDate: dateTime,
    memo: note ?? `Cash ${direction} via cashbook`,
    sourceModule: 'cashbook',
    sourceId: cashbookId,
    postedBy: userId,
    postedAt: now,     // defaults exist, but being explicit is fine
    createdAt: now,
    locked: false,
  });

  // 3) Balanced lines
  const debitLine = {
    id: randomUUID(),
    entryId,
    businessId,
    accountId: direction === 'in' ? cashAccountId : offsetAccountId,
    debit: toMoneyString(amount),
    credit: toMoneyString(0),
    partyId: partyId ?? null,
    itemId: null as string | null,
    notes: note ?? null,
  };
  const creditLine = {
    id: randomUUID(),
    entryId,
    businessId,
    accountId: direction === 'in' ? offsetAccountId : cashAccountId,
    debit: toMoneyString(0),
    credit: toMoneyString(amount),
    partyId: partyId ?? null,
    itemId: null as string | null,
    notes: note ?? null,
  };

  await database.insert(glJournalLines).values(debitLine);
  await database.insert(glJournalLines).values(creditLine);

  return { cashbookEntryId: cashbookId, journalEntryId: entryId };
}

/** In-memory balance helper */
export function isBalanced(lines: Array<{ debit?: number; credit?: number }>): boolean {
  const td = lines.reduce((s, l) => s + Number(l.debit || 0), 0);
  const tc = lines.reduce((s, l) => s + Number(l.credit || 0), 0);
  return Number(td.toFixed(2)) === Number(tc.toFixed(2));
}

export interface PostInvoiceParams {
  invoiceId: string;
  businessId: string;
  userId: string;
}

/**
 * Post an invoice with VAT calculation (inventory movements TBD).
 *
 * For Sales Invoice:
 *   Dr: Accounts Receivable (or Cash)
 *   Cr: Sales Revenue
 *   Dr: Cost of Goods Sold
 *   Cr: Inventory
 *   Dr: VAT Input (if applicable)
 *   Cr: VAT Output
 *
 * For Purchase Invoice:
 *   Dr: Purchases/Inventory
 *   Cr: Accounts Payable (or Cash)
 *   Dr: VAT Input
 *   Cr: VAT Payable
 */
export async function postInvoiceWithJournal(params: PostInvoiceParams): Promise<{
  journalEntryId: string;
  inventoryMovements: string[];
}> {
  const { invoiceId, businessId, userId } = params;
  const database = await db;

  // 1) Load invoice header (scoped)
  const invoiceRows = await database
    .select()
    .from(invoicesTable)
    .where(and(eq(invoicesTable.id, invoiceId), eq(invoicesTable.businessId, businessId)))
    .limit(1);

  if (invoiceRows.length === 0) throw new Error('Invoice not found');
  const invoice = invoiceRows[0];

  // 2) Load invoice items
  const items = await database
    .select()
    .from(invoiceItemsTable)
    .where(eq(invoiceItemsTable.invoiceId, invoiceId));

  if (items.length === 0) throw new Error('No items found for invoice');

  // 3) VAT config (use typed select to avoid table-name key access)
  const taxScope = invoice.kind === 'sale' ? 'sales' : 'purchases';
  const taxDirection = invoice.kind === 'sale' ? 'output' : 'input';

  const vatRow = await database
    .select({ rate: taxRatesTable.rate })
    .from(taxCodesTable)
    .innerJoin(taxRatesTable, eq(taxCodesTable.rateId, taxRatesTable.id))
    .where(
      and(
        eq(taxCodesTable.businessId, businessId),
        eq(taxCodesTable.scope, taxScope),
        eq(taxCodesTable.direction, taxDirection),
        eq(taxCodesTable.isDefault, true)
      )
    )
    .limit(1);

  if (vatRow.length === 0) throw new Error(`Default ${taxScope} tax code not found`);
  const vatRate = parseFloat(vatRow[0].rate);

  // 4) Totals (DECIMALs come back as strings)
  const subtotal = Number(invoice.subtotal || 0);
  const addlCharges = Number(invoice.addlCharges || 0);
  const discount = Number(invoice.discount || 0);
  const taxableAmount = subtotal + addlCharges;
  const vatAmount = taxableAmount * vatRate;
  const totalAmount = taxableAmount + vatAmount - discount;

  // 5) Journal header (you'll add lines according to your posting rules)
  const journalEntryId = randomUUID();
  await database.insert(glJournalEntries).values({
    id: journalEntryId,
    businessId,
    entryDate: invoice.issueDate,
    memo: `Posted invoice ${invoice.number}`,
    sourceModule: 'invoice',
    sourceId: invoiceId,
    postedBy: userId,
  });

  // TODO: Insert glJournalLines here based on your COA mapping and whether it's a sale/purchase.
  // Example (pseudo):
  // - Sales:
  //   Dr AR/Cash totalAmount
  //   Cr Sales subtotal
  //   Cr VAT Output vatAmount
  //   Dr COGS X
  //   Cr Inventory X

  // 6) Mark invoice as posted
  await database
    .update(invoicesTable)
    .set({ status: 'posted' })
    .where(eq(invoicesTable.id, invoiceId));

  return { journalEntryId, inventoryMovements: [] };
}
