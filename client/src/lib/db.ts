import Dexie, { Table } from 'dexie';
import { Account, Category, Transaction, CashbookEntry, Item, Invoice, InvoiceItem, Preferences } from '@shared/schema';

export class CreditDebitDB extends Dexie {
  accounts!: Table<Account>;
  categories!: Table<Category>;
  transactions!: Table<Transaction>;
  cashbook!: Table<CashbookEntry>;
  items!: Table<Item>;
  invoices!: Table<Invoice>;
  invoiceItems!: Table<InvoiceItem>;
  preferences!: Table<Preferences>;

  constructor() {
    super('CreditDebitDB');
    
    this.version(1).stores({
      accounts: 'id, name, type, categoryId, createdAt, archived',
      categories: 'id, name',
      transactions: 'id, accountId, dateTime, kind, amount, createdAt, deleted',
      cashbook: 'id, dateTime, direction, amount',
      items: 'id, name, categoryId',
      invoices: 'id, number, accountId, kind, issueDate, status',
      invoiceItems: 'id, invoiceId, itemId',
      preferences: 'id'
    });

    // Initialize default preferences
    this.on('populate', () => {
      this.preferences.add({
        id: 1,
        dateFormat: 'DD/MM/YYYY',
        timeFormat: '12',
        currency: 'INR',
        language: 'en',
        firstDayOfWeek: 1,
        firstDayOfMonth: 1,
        firstDayOfYear: 1,
        showTimeInReports: true,
        showPreviousBalance: true,
        darkMode: false,
        biometricEnabled: false,
      });

      // Add default categories
      this.categories.bulkAdd([
        { id: 'general', name: 'General', color: '#1976D2' },
        { id: 'business', name: 'Business', color: '#2E7D32' },
        { id: 'personal', name: 'Personal', color: '#F57C00' },
      ]);
    });
  }

  // Helper methods for common operations
  async getAccountBalance(accountId: string): Promise<number> {
    const transactions = await this.transactions
      .where('accountId')
      .equals(accountId)
      .and(txn => !txn.deleted)
      .toArray();
    
    return transactions.reduce((balance, txn) => {
      return txn.kind === 'credit' ? balance + txn.amount : balance - txn.amount;
    }, 0);
  }

  async getAccountSummary() {
    // Fix: Handle undefined/null archived values properly
    const accounts = await this.accounts.filter(account => account.archived !== true).toArray();
    let totalAdvance = 0;
    let totalDue = 0;

    for (const account of accounts) {
      const balance = await this.getAccountBalance(account.id);
      if (balance > 0) {
        totalAdvance += balance;
      } else {
        totalDue += Math.abs(balance);
      }
    }

    return {
      totalAdvance,
      totalDue,
      netBalance: totalAdvance - totalDue,
    };
  }

  async getCashbookSummary(startDate?: Date, endDate?: Date) {
    let query = this.cashbook.toCollection();
    
    if (startDate && endDate) {
      query = query.filter(entry => 
        entry.dateTime >= startDate && entry.dateTime <= endDate
      );
    }

    const entries = await query.toArray();
    
    const totalIn = entries
      .filter(entry => entry.direction === 'in')
      .reduce((sum, entry) => sum + entry.amount, 0);
    
    const totalOut = entries
      .filter(entry => entry.direction === 'out')
      .reduce((sum, entry) => sum + entry.amount, 0);

    return {
      totalIn,
      totalOut,
      balance: totalIn - totalOut,
    };
  }

  async searchAccounts(query: string) {
    return this.accounts
      .filter(account => 
        (account.name?.toLowerCase() || '').includes(query.toLowerCase()) ||
        (account.phone !== undefined && account.phone.includes(query))
      )
      .toArray();
  }
}

export const db = new CreditDebitDB();
