import { Account, Category, Transaction, CashbookEntry, Item, Invoice, InvoiceItem, Preferences, Shop } from '@shared/schema';

const API_BASE = '/api';
const USER_ID = 'default-user'; // You can implement proper user management later

class DexieMariaDBAdapter {
  private headers = {
    'Content-Type': 'application/json',
    'user-id': USER_ID
  };

  // Account operations
  async getAccounts(): Promise<Account[]> {
    const response = await fetch(`${API_BASE}/accounts`, {
      headers: this.headers
    });
    if (!response.ok) throw new Error('Failed to fetch accounts');
    return response.json();
  }

  async createAccount(account: Omit<Account, 'id' | 'createdAt'>): Promise<Account> {
    const response = await fetch(`${API_BASE}/accounts`, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify(account)
    });
    if (!response.ok) throw new Error('Failed to create account');
    return response.json();
  }

  async updateAccount(id: string, updates: Partial<Account>): Promise<Account> {
    const response = await fetch(`${API_BASE}/accounts/${id}`, {
      method: 'PUT',
      headers: this.headers,
      body: JSON.stringify(updates)
    });
    if (!response.ok) throw new Error('Failed to update account');
    return response.json();
  }

  async deleteAccount(id: string): Promise<void> {
    const response = await fetch(`${API_BASE}/accounts/${id}`, {
      method: 'DELETE',
      headers: this.headers
    });
    if (!response.ok) throw new Error('Failed to delete account');
  }

  // Transaction operations
  async getTransactions(accountId?: string): Promise<Transaction[]> {
    const url = accountId ? `${API_BASE}/transactions/${accountId}` : `${API_BASE}/transactions`;
    const response = await fetch(url, {
      headers: this.headers
    });
    if (!response.ok) throw new Error('Failed to fetch transactions');
    return response.json();
  }

  async createTransaction(transaction: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>): Promise<Transaction> {
    const response = await fetch(`${API_BASE}/transactions`, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify(transaction)
    });
    if (!response.ok) throw new Error('Failed to create transaction');
    return response.json();
  }

  async updateTransaction(id: string, updates: Partial<Transaction>): Promise<Transaction> {
    const response = await fetch(`${API_BASE}/transactions/${id}`, {
      method: 'PUT',
      headers: this.headers,
      body: JSON.stringify(updates)
    });
    if (!response.ok) throw new Error('Failed to update transaction');
    return response.json();
  }

  async deleteTransaction(id: string): Promise<void> {
    const response = await fetch(`${API_BASE}/transactions/${id}`, {
      method: 'DELETE',
      headers: this.headers
    });
    if (!response.ok) throw new Error('Failed to delete transaction');
  }

  // Cashbook operations
  async getCashbookEntries(): Promise<CashbookEntry[]> {
    const response = await fetch(`${API_BASE}/cashbook`, {
      headers: this.headers
    });
    if (!response.ok) throw new Error('Failed to fetch cashbook entries');
    return response.json();
  }

  async createCashbookEntry(entry: Omit<CashbookEntry, 'id'>): Promise<CashbookEntry> {
    const response = await fetch(`${API_BASE}/cashbook`, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify(entry)
    });
    if (!response.ok) throw new Error('Failed to create cashbook entry');
    return response.json();
  }

  // Categories operations
  async getCategories(): Promise<Category[]> {
    const response = await fetch(`${API_BASE}/categories`, {
      headers: this.headers
    });
    if (!response.ok) throw new Error('Failed to fetch categories');
    return response.json();
  }

  async createCategory(category: Omit<Category, 'id'>): Promise<Category> {
    const response = await fetch(`${API_BASE}/categories`, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify(category)
    });
    if (!response.ok) throw new Error('Failed to create category');
    return response.json();
  }

  // Helper methods for compatibility with existing Dexie interface
  async getAccountBalance(accountId: string): Promise<number> {
    const transactions = await this.getTransactions(accountId);
    return transactions
      .filter(txn => !txn.deleted)
      .reduce((balance, txn) => {
        return txn.kind === 'credit' ? balance + txn.amount : balance - txn.amount;
      }, 0);
  }

  async getAccountSummary() {
    const accounts = await this.getAccounts();
    let totalAdvance = 0;
    let totalDue = 0;

    for (const account of accounts.filter(acc => !acc.archived)) {
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

  async searchAccounts(query: string): Promise<Account[]> {
    const accounts = await this.getAccounts();
    return accounts.filter(account => 
      (account.name?.toLowerCase() || '').includes(query.toLowerCase()) ||
      (account.phone !== undefined && account.phone.includes(query))
    );
  }
}

export const mariaDBAdapter = new DexieMariaDBAdapter();