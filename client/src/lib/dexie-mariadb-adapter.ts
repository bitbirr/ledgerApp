import {
  Account, Category, Transaction, CashbookEntry, Item, Invoice, InvoiceItem, Preferences,
  GLAccount, GLJournalEntry, GLJournalLine, InsertGLJournalEntry, InsertGLJournalLine
} from '@shared/schema';

const API_BASE = '/api';
const USER_ID = 'default-user'; // You can implement proper user management later
const BUSINESS_ID = 'default-business'; // Multi-business support; replace via auth/selection later

class DexieMariaDBAdapter {
  private headers = {
    'Content-Type': 'application/json',
    'user-id': USER_ID,
    'business-id': BUSINESS_ID,
  };

  // Account operations
  async getAccounts(): Promise<Account[]> {
    const response = await fetch(`${API_BASE}/accounts`, {
      headers: this.headers
    });
    if (!response.ok) throw new Error('Failed to fetch accounts');
    return await response.json();
  }

  async createAccount(account: Omit<Account, 'id' | 'createdAt'>): Promise<Account> {
    const response = await fetch(`${API_BASE}/accounts`, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify(account)
    });
    if (!response.ok) throw new Error('Failed to create account');
    return await response.json();
  }

  async updateAccount(id: string, updates: Partial<Account>): Promise<Account> {
    const response = await fetch(`${API_BASE}/accounts/${id}`, {
      method: 'PUT',
      headers: this.headers,
      body: JSON.stringify(updates)
    });
    if (!response.ok) throw new Error('Failed to update account');
    return await response.json();
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

  // ======================
  // GL: Chart of Accounts
  // ======================
  async getGLAccounts(): Promise<GLAccount[]> {
    const response = await fetch(`${API_BASE}/gl/accounts`, {
      headers: this.headers
    });
    if (!response.ok) throw new Error('Failed to fetch GL accounts');
    return response.json();
  }

  async createGLAccount(account: Omit<GLAccount, 'id' | 'createdAt' | 'updatedAt' | 'systemFlag'>): Promise<GLAccount> {
    const response = await fetch(`${API_BASE}/gl/accounts`, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify(account)
    });
    if (!response.ok) throw new Error('Failed to create GL account');
    return response.json();
  }

  async updateGLAccount(id: string, updates: Partial<GLAccount>): Promise<GLAccount> {
    const response = await fetch(`${API_BASE}/gl/accounts/${id}`, {
      method: 'PUT',
      headers: this.headers,
      body: JSON.stringify(updates)
    });
    if (!response.ok) throw new Error('Failed to update GL account');
    return response.json();
  }

  // ======================
  // GL: Journal
  // ======================
  async postJournal(entry: InsertGLJournalEntry, lines: InsertGLJournalLine[]): Promise<GLJournalEntry> {
    const response = await fetch(`${API_BASE}/gl/journal`, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify({ entry, lines })
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to create journal entry');
    }
    return response.json();
  }

  async listJournal(): Promise<GLJournalEntry[]> {
    const response = await fetch(`${API_BASE}/gl/journal`, {
      headers: this.headers
    });
    if (!response.ok) throw new Error('Failed to fetch journal entries');
    return response.json();
  }

  // ======================
  // Bootstrap: seed CoA
  // ======================
  async bootstrap(): Promise<{ success: boolean }> {
    const response = await fetch(`${API_BASE}/bootstrap`, {
      method: 'POST',
      headers: this.headers
    });
    if (!response.ok) throw new Error('Failed to bootstrap business defaults');
    return response.json();
  }
}
 
export const mariaDBAdapter = {
  async getItems(): Promise<Item[]> {
    const response = await fetch('/api/items');
    if (!response.ok) throw new Error('Failed to fetch items');
    return await response.json();
  },

  async createItem(item: Omit<Item, 'id'>): Promise<string> {
    const response = await fetch('/api/items', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(item)
    });
    if (!response.ok) throw new Error('Failed to create item');
    return await response.json();
  },

  async getPreferences(id: number): Promise<Preferences | undefined> {
    const response = await fetch(`/api/preferences/${id}`);
    if (!response.ok) throw new Error('Failed to fetch preferences');
    return await response.json();
  },

  async updatePreferences(id: number, updates: Partial<Preferences>): Promise<number> {
    const response = await fetch(`/api/preferences/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    if (!response.ok) throw new Error('Failed to update preferences');
    return await response.json();
  }
};