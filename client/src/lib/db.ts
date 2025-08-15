import Dexie, { Table } from 'dexie';
import { Account, Category, Transaction, CashbookEntry, Item, Invoice, InvoiceItem, Preferences, Shop } from '@shared/schema';
import { mariaDBAdapter } from './dexie-mariadb-adapter';

// Keep the original Dexie class for offline fallback
export class CreditDebitDB extends Dexie {
  accounts!: Table<Account>;
  categories!: Table<Category>;
  transactions!: Table<Transaction>;
  cashbook!: Table<CashbookEntry>;
  items!: Table<Item>;
  invoices!: Table<Invoice>;
  invoiceItems!: Table<InvoiceItem>;
  preferences!: Table<Preferences>;
  shops!: Table<Shop>;

  constructor() {
    super('CreditDebitDB');
    
    // Keep existing schema for offline fallback
    this.version(2).stores({
      accounts: 'id, name, type, categoryId, shopId, createdAt, archived',
      categories: 'id, name',
      transactions: 'id, accountId, dateTime, kind, amount, createdAt, deleted',
      cashbook: 'id, dateTime, direction, amount',
      items: 'id, name, categoryId',
      invoices: 'id, number, accountId, kind, issueDate, status',
      invoiceItems: 'id, invoiceId, itemId',
      preferences: 'id',
      shops: 'id, name, createdAt'
    });
  }

  // Override methods to use MariaDB adapter
  async getAccountBalance(accountId: string): Promise<number> {
    try {
      return await mariaDBAdapter.getAccountBalance(accountId);
    } catch (error) {
      console.warn('MariaDB unavailable, falling back to local storage:', error);
      // Fallback to local Dexie
      const transactions = await this.transactions
        .where('accountId')
        .equals(accountId)
        .and((txn: Transaction) => !txn.deleted)
        .toArray();
      
      return transactions.reduce((balance, txn) => {
        return txn.kind === 'credit' ? balance + txn.amount : balance - txn.amount;
      }, 0);
    }
  }

  async getAccountSummary() {
    try {
      return await mariaDBAdapter.getAccountSummary();
    } catch (error) {
      console.warn('MariaDB unavailable, falling back to local storage:', error);
      // Fallback to local Dexie
      const accounts = await this.accounts.toArray();
      const summary = { totalCredit: 0, totalDebit: 0, accountCount: accounts.length };
      
      for (const account of accounts) {
        const balance = await this.getAccountBalance(account.id);
        if (balance > 0) {
          summary.totalCredit += balance;
        } else {
          summary.totalDebit += Math.abs(balance);
        }
      }
      
      return summary;
    }
  }

  async searchAccounts(query: string) {
    try {
      return await mariaDBAdapter.searchAccounts(query);
    } catch (error) {
      console.warn('MariaDB unavailable, falling back to local storage:', error);
      // Fallback to local Dexie
      return this.accounts
        .filter((account: Account) => 
          account.name.toLowerCase().includes(query.toLowerCase())
        )
        .toArray();
    }
  }
}

// Hybrid database that tries MariaDB first, falls back to Dexie
class HybridDatabase {
  private dexie = new CreditDebitDB();

  // Account operations
  get accounts() {
    return {
      toArray: async () => {
        try {
          return await mariaDBAdapter.getAccounts();
        } catch (error) {
          console.warn('MariaDB unavailable, using local storage');
          return this.dexie.accounts.toArray();
        }
      },
      get: async (id: string) => {
        try {
          const accounts = await mariaDBAdapter.getAccounts();
          return accounts.find((acc: Account) => acc.id === id);
        } catch (error) {
          return this.dexie.accounts.get(id);
        }
      },
      add: async (account: Omit<Account, 'id' | 'createdAt'>) => {
        try {
          return await mariaDBAdapter.createAccount(account);
        } catch (error) {
          console.warn('MariaDB unavailable, using local storage');
          return this.dexie.accounts.add({ ...account, id: crypto.randomUUID(), createdAt: new Date() });
        }
      },
      update: async (id: string, updates: Partial<Account>) => {
        try {
          return await mariaDBAdapter.updateAccount(id, updates);
        } catch (error) {
          console.warn('MariaDB unavailable, using local storage');
          return this.dexie.accounts.update(id, updates);
        }
      }
    };
  }

  // Transaction operations
  get transactions() {
    return {
      where: (field: string) => ({
        equals: (value: any) => ({
          and: (predicate: (txn: Transaction) => boolean) => ({
            toArray: async () => {
              try {
                const transactions = await mariaDBAdapter.getTransactions();
                return transactions
                  .filter((txn: Transaction) => (txn as any)[field] === value)
                  .filter(predicate);
              } catch (error) {
                return this.dexie.transactions.where(field).equals(value).and(predicate).toArray();
              }
            },
            reverse: () => ({
              sortBy: async (sortField: string) => {
                try {
                  const transactions = await mariaDBAdapter.getTransactions();
                  return transactions
                    .filter((txn: Transaction) => (txn as any)[field] === value)
                    .filter(predicate)
                    .sort((a: Transaction, b: Transaction) => new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime());
                } catch (error) {
                  return this.dexie.transactions.where(field).equals(value).and(predicate).reverse().sortBy(sortField);
                }
              }
            })
          })
        })
      }),
      add: async (transaction: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>) => {
        try {
          return await mariaDBAdapter.createTransaction(transaction);
        } catch (error) {
          console.warn('MariaDB unavailable, using local storage');
          return this.dexie.transactions.add({
            ...transaction,
            id: crypto.randomUUID(),
            createdAt: new Date(),
            updatedAt: new Date()
          });
        }
      },
      update: async (id: string, updates: Partial<Transaction>) => {
        try {
          return await mariaDBAdapter.updateTransaction(id, updates);
        } catch (error) {
          console.warn('MariaDB unavailable, using local storage');
          return this.dexie.transactions.update(id, updates);
        }
      }
    };
  }

  // Cashbook operations
  get cashbook() {
    return {
      orderBy: (field: string) => ({
        toArray: async () => {
          try {
            const entries = await mariaDBAdapter.getCashbookEntries();
            return entries.sort((a: CashbookEntry, b: CashbookEntry) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime());
          } catch (error) {
            return this.dexie.cashbook.orderBy(field).toArray();
          }
        }
      }),
      add: async (entry: Omit<CashbookEntry, 'id'>) => {
        try {
          return await mariaDBAdapter.createCashbookEntry(entry);
        } catch (error) {
          console.warn('MariaDB unavailable, using local storage');
          return this.dexie.cashbook.add({ ...entry, id: crypto.randomUUID() });
        }
      }
    };
  }

  // Category operations
  get categories() {
    return {
      toArray: async () => {
        try {
          return await mariaDBAdapter.getCategories();
        } catch (error) {
          console.warn('MariaDB unavailable, using local storage');
          return this.dexie.categories.toArray();
        }
      },
      add: async (category: Omit<Category, 'id'>) => {
        try {
          return await mariaDBAdapter.createCategory(category);
        } catch (error) {
          console.warn('MariaDB unavailable, using local storage');
          return this.dexie.categories.add({ ...category, id: crypto.randomUUID() });
        }
      }
    };
  }

  async getAccountBalance(accountId: string): Promise<number> {
    return this.dexie.getAccountBalance(accountId);
  }

  async getAccountSummary() {
    return this.dexie.getAccountSummary();
  }

  async searchAccounts(query: string) {
    return this.dexie.searchAccounts(query);
  }
}

export const db = new HybridDatabase();
