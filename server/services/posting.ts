import { randomUUID } from 'crypto';
import { and, eq, inArray } from 'drizzle-orm';
import { db } from '../db';
import { cashbook, glAccounts, glJournalEntries, glJournalLines } from '../db/schema';

export type CashDirection = 'in' | 'out';

export interface PostCashbookParams {
  businessId: string;
  userId: string;
  dateTime: Date;
  direction: CashDirection; // 'in' = cash/bank receives; 'out' = cash/bank pays
  amount: number; // positive number
  note?: string;
  attachmentUrl?: string;

  // GL posting
  cashAccountId: string;    // GL account for Cash/Bank (e.g., 1000/1010/1020)
  offsetAccountId: string;  // Counterparty GL account (e.g., AR, AP, Equity, Expense, Revenue)
  partyId?: string;         // Optional AR/AP party (customer/supplier id)
}

/**
 * Utility to format amounts to string with two decimals for DECIMAL columns.
 */
function toMoneyString(value: number): string {
  return (Math.round((value + Number.EPSILON) * 100) / 100).toFixed(2);
}

/**
 * Validate GL accounts exist, are leaf and active for the given business.
 */
async function validatePostingAccounts(businessId: string, accountIds: string[]) {
  const database = await db;
  const list = await database
    .select()
    .from(glAccounts)
    .where(inArray(glAccounts.id, accountIds));

  // business scoping and existence
  const scoped = list.filter((a) => a.businessId === businessId);
  if (scoped.length !== accountIds.length) {
    throw new Error('One or more GL accounts not found for this business');
  }

  // leaf and active
  if (scoped.some((a) => a.isLeaf === false || a.isActive === false)) {
    throw new Error('Posting allowed to active leaf accounts only');
  }
}

/**
 * Post a cashbook record and a balanced GL journal entry atomically (best-effort).
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

  // Validate accounts
  await validatePostingAccounts(businessId, [cashAccountId, offsetAccountId]);

  const database = await db;

  // 1) Insert cashbook entry
  const cashbookId = randomUUID();
  const cashbookRow = {
    id: cashbookId,
    businessId,
    dateTime,
    direction,
    amount: toMoneyString(amount),
    note: note ?? null,
    attachmentUrl: attachmentUrl ?? null,
  };
  await database.insert(cashbook).values(cashbookRow);

  // 2) Insert GL journal entry header
  const entryId = randomUUID();
  const now = new Date();
  const entryRow = {
    id: entryId,
    businessId,
    entryDate: dateTime,
    memo: note ?? `Cash ${direction} via cashbook`,
    sourceModule: 'cashbook',
    sourceId: cashbookId,
    postedBy: userId,
    postedAt: now,
    createdAt: now,
    locked: false,
  };
  await database.insert(glJournalEntries).values(entryRow);

  // 3) Compose balanced lines
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

  // 4) Persist lines
  await database.insert(glJournalLines).values(debitLine);
  await database.insert(glJournalLines).values(creditLine);

  return {
    cashbookEntryId: cashbookId,
    journalEntryId: entryId,
  };
}

/**
 * Simple validator for balance check in-memory (optional helper if needed elsewhere).
 */
export function isBalanced(lines: Array<{ debit?: number; credit?: number }>): boolean {
  const td = lines.reduce((s, l) => s + Number(l.debit || 0), 0);
  const tc = lines.reduce((s, l) => s + Number(l.credit || 0), 0);
  return Number(td.toFixed(2)) === Number(tc.toFixed(2));
}