import { create } from 'zustand';
import { Account, Transaction, CashbookEntry, Invoice, Preferences } from '@shared/schema';

interface AppState {
  // UI State
  drawerOpen: boolean;
  sortBy: 'name-asc' | 'name-desc' | 'amount-asc' | 'amount-desc' | 'category' | 'last-transaction';
  timePeriod: 'all' | 'daily' | 'weekly' | 'monthly' | 'yearly';
  
  // App State
  accounts: Account[];
  transactions: Transaction[];
  cashbook: CashbookEntry[];
  invoices: Invoice[];
  preferences: Preferences | null;
  
  // Summary Data
  accountSummary: {
    totalAdvance: number;
    totalDue: number;
    netBalance: number;
  };
  
  // Actions
  setDrawerOpen: (open: boolean) => void;
  setSortBy: (sort: AppState['sortBy']) => void;
  setTimePeriod: (period: AppState['timePeriod']) => void;
  
  // Data Actions
  setAccounts: (accounts: Account[]) => void;
  setTransactions: (transactions: Transaction[]) => void;
  setCashbook: (entries: CashbookEntry[]) => void;
  setInvoices: (invoices: Invoice[]) => void;
  setPreferences: (prefs: Preferences) => void;
  setAccountSummary: (summary: AppState['accountSummary']) => void;
  
  // Business Logic
  getAccountBalance: (accountId: string) => number;
  sortAccounts: (accounts: Account[]) => Account[];
}

export const useAppStore = create<AppState>((set, get) => ({
  // Initial UI State
  drawerOpen: false,
  sortBy: 'name-asc',
  timePeriod: 'all',
  
  // Initial App State
  accounts: [],
  transactions: [],
  cashbook: [],
  invoices: [],
  preferences: null,
  accountSummary: {
    totalAdvance: 0,
    totalDue: 0,
    netBalance: 0,
  },
  
  // UI Actions
  setDrawerOpen: (open) => set({ drawerOpen: open }),
  setSortBy: (sort) => set({ sortBy: sort }),
  setTimePeriod: (period) => set({ timePeriod: period }),
  
  // Data Actions
  setAccounts: (accounts) => set({ accounts }),
  setTransactions: (transactions) => set({ transactions }),
  setCashbook: (entries) => set({ cashbook: entries }),
  setInvoices: (invoices) => set({ invoices }),
  setPreferences: (prefs) => set({ preferences: prefs }),
  setAccountSummary: (summary) => set({ accountSummary: summary }),
  
  // Business Logic
  getAccountBalance: (accountId) => {
    const { transactions } = get();
    return transactions
      .filter(txn => txn.accountId === accountId && !txn.deleted)
      .reduce((balance, txn) => {
        return txn.kind === 'credit' ? balance + txn.amount : balance - txn.amount;
      }, 0);
  },
  
  sortAccounts: (accounts) => {
    const { sortBy, getAccountBalance } = get();
    
    return [...accounts].sort((a, b) => {
      switch (sortBy) {
        case 'name-asc':
          return a.name.localeCompare(b.name);
        case 'name-desc':
          return b.name.localeCompare(a.name);
        case 'amount-asc':
          return getAccountBalance(a.id) - getAccountBalance(b.id);
        case 'amount-desc':
          return getAccountBalance(b.id) - getAccountBalance(a.id);
        default:
          return 0;
      }
    });
  },
}));
