// client/src/lib/api.ts
import { useAuthStore } from '@/lib/auth-store';

export type ID = string;

export type Account = {
  id: ID;
  name: string;
  type: string;              // "customer" | "supplier" | "other" | ...
  businessId: ID;
  archived: boolean;
  phone?: string;
  categoryId?: ID;
  photoUrl?: string;
  createdAt?: string;
  userId: ID;
};

export type Transaction = {
  id: ID;
  accountId: ID;
  businessId: ID;
  dateTime: string;
  kind: string;              // e.g. "debit" | "credit" | "in" | "out"
  amount: string;            // server uses DECIMAL; keep as string
  note?: string;
  imageUrl?: string;
  dueDate?: string;
  deleted: boolean;
  userId: ID;
};

export type CashbookEntry = {
  id: ID;
  businessId: ID;
  dateTime: string;
  direction: string;         // "in" | "out"
  amount: string;
  note?: string;
  attachmentUrl?: string;
};

export type Category = {
  id: ID;
  name: string;
  color: string;
  businessId: ID;
};

export type Item = {
  id: ID;
  name: string;
  rate: number;
  uom: string;
  businessId: ID;
  openingStock: number;
  lowStockAlert: number;
  categoryId?: ID;
};

export type Preferences = {
  id: number;
  businessId: ID;
  // … your prefs fields
};

export type Business = {
  id: ID;
  name: string;
  createdAt: string;
  updatedAt: string;
};

export type Branch = {
  id: ID;
  name: string;
  businessId: ID;
  createdAt: string;
  updatedAt: string;
};

export type Invoice = {
  id: ID;
  businessId: ID;
  branchId: ID;
  customerId: ID;
  invoiceNumber: string;
  issueDate: string;
  dueDate: string;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  subtotal: string;
  tax: string;
  total: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
};

export type InvoiceItem = {
  id: ID;
  invoiceId: ID;
  itemId: ID;
  description: string;
  quantity: number;
  rate: string;
  amount: string;
};

// Enhanced headers function with token refresh support
async function getAuthHeaders(businessId?: string, userId?: string) {
  const { token, refreshToken, isTokenExpired, refreshSession } = useAuthStore.getState();
  
  // If token is expired and we have a refresh token, try to refresh
  if (isTokenExpired() && refreshToken) {
    try {
      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken }),
      });
      
      if (response.ok) {
        const { token: newToken, refreshToken: newRefreshToken } = await response.json();
        refreshSession(newToken, newRefreshToken);
        // Update token for this request
        useAuthStore.getState().token = newToken;
        useAuthStore.getState().refreshToken = newRefreshToken;
      } else {
        // If refresh fails, logout the user
        useAuthStore.getState().logout();
        throw new Error('Session expired. Please log in again.');
      }
    } catch (error) {
      // If refresh fails, logout the user
      useAuthStore.getState().logout();
      throw new Error('Session expired. Please log in again.');
    }
  }
  
  const h: Record<string, string> = { 
    "Content-Type": "application/json",
    "Authorization": `Bearer ${token}`
  };
  
  if (businessId) h["business-id"] = businessId;
  if (userId) h["user-id"] = userId;
  return h;
}

// Enhanced fetch function with error handling
async function apiFetch<T>(input: RequestInfo, init?: RequestInit): Promise<T> {
  try {
    const response = await fetch(input, init);
    
    // Handle 401 Unauthorized
    if (response.status === 401) {
      useAuthStore.getState().logout();
      throw new Error('Unauthorized. Please log in again.');
    }
    
    // Handle 403 Forbidden
    if (response.status === 403) {
      throw new Error('Access forbidden. You do not have permission to perform this action.');
    }
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
    }
    
    return (await response.json()) as T;
  } catch (error) {
    if (error instanceof TypeError && error.message === 'Failed to fetch') {
      throw new Error('Network error. Please check your connection and try again.');
    }
    throw error;
  }
}

export const api = {
  // ---------- Auth ----------
  async login(credentials: { username: string; password: string; businessId?: string; branchId?: string }) {
    const response = await apiFetch<{ 
      user: any; 
      token: string; 
      refreshToken: string; 
      role: 'SuperAdmin' | 'Admin' | 'Staff';
      businessId?: string;
      branchId?: string;
    }>('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });
    
    return response;
  },
  
  async adminLogin(credentials: { username: string; password: string }) {
    const response = await apiFetch<{ 
      user: any; 
      token: string; 
      refreshToken: string; 
      role: 'SuperAdmin';
    }>('/api/auth/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });
    
    return response;
  },
  
  async logout() {
    const { token } = useAuthStore.getState();
    if (token) {
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }).catch(() => {
        // Ignore logout errors
      });
    }
  },
  
  // ---------- Items ----------
  async getItems(businessId: ID): Promise<Item[]> {
    const headers = await getAuthHeaders(businessId);
    return apiFetch<Item[]>("/api/items", { headers });
  },
  
  async createItem(item: Omit<Item, "id">): Promise<Item> {
    const headers = await getAuthHeaders(item.businessId);
    return apiFetch<Item>("/api/items", {
      method: "POST",
      headers,
      body: JSON.stringify(item),
    });
  },
  
  async updateItem(id: ID, updates: Partial<Omit<Item, "id" | "businessId">>, businessId: ID): Promise<Item> {
    const headers = await getAuthHeaders(businessId);
    return apiFetch<Item>(`/api/items/${id}`, {
      method: "PUT",
      headers,
      body: JSON.stringify(updates),
    });
  },
  
  async deleteItem(id: ID, businessId: ID): Promise<void> {
    const headers = await getAuthHeaders(businessId);
    return apiFetch<void>(`/api/items/${id}`, {
      method: "DELETE",
      headers,
    });
  },

  // ---------- Preferences ----------
  async getPreferences(id: number, businessId: ID): Promise<Preferences> {
    const headers = await getAuthHeaders(businessId);
    return apiFetch<Preferences>(`/api/preferences/${id}`, { headers });
  },
  
  async updatePreferences(id: number, updates: Partial<Preferences>, businessId: ID): Promise<void> {
    const headers = await getAuthHeaders(businessId);
    return apiFetch<void>(`/api/preferences/${id}`, {
      method: "PUT",
      headers,
      body: JSON.stringify(updates),
    });
  },

  // ---------- Accounts ----------
  async getAccounts(businessId: ID, userId: ID): Promise<Account[]> {
    const headers = await getAuthHeaders(businessId, userId);
    return apiFetch<Account[]>("/api/accounts", { headers });
  },

  async searchAccounts(query: string, businessId: ID, userId: ID): Promise<Account[]> {
    const headers = await getAuthHeaders(businessId, userId);
    return apiFetch<Account[]>(`/api/accounts?search=${encodeURIComponent(query)}`, { headers });
  },

  async createAccount(
    account: Omit<Account, "id" | "archived" | "createdAt">
  ): Promise<Account> {
    const headers = await getAuthHeaders(account.businessId, account.userId);
    return apiFetch<Account>("/api/accounts", {
      method: "POST",
      headers,
      body: JSON.stringify(account),
    });
  },

  async updateAccount(
    id: ID,
    updates: Partial<Omit<Account, "id" | "businessId" | "userId">>,
    businessId: ID,
    userId: ID
  ): Promise<Account> {
    const headers = await getAuthHeaders(businessId, userId);
    return apiFetch<Account>(`/api/accounts/${id}`, {
      method: "PUT",
      headers,
      body: JSON.stringify(updates),
    });
  },

  async deleteAccount(id: ID, businessId: ID, userId: ID): Promise<void> {
    const headers = await getAuthHeaders(businessId, userId);
    return apiFetch<void>(`/api/accounts/${id}`, {
      method: "DELETE",
      headers,
    });
  },

  // ---------- Transactions ----------
  async getTransactions(accountId: ID, userId: ID): Promise<Transaction[]> {
    const headers = await getAuthHeaders(undefined, userId);
    return apiFetch<Transaction[]>(`/api/transactions/${accountId}`, { headers });
  },

  async createTransaction(
    t: Omit<Transaction, "id" | "deleted">
  ): Promise<Transaction> {
    const headers = await getAuthHeaders(t.businessId, t.userId);
    return apiFetch<Transaction>("/api/transactions", {
      method: "POST",
      headers,
      body: JSON.stringify(t),
    });
  },

  async updateTransaction(
    id: ID,
    updates: Partial<Omit<Transaction, "id" | "businessId" | "userId">>,
    businessId: ID,
    userId: ID
  ): Promise<Transaction> {
    const headers = await getAuthHeaders(businessId, userId);
    return apiFetch<Transaction>(`/api/transactions/${id}`, {
      method: "PUT",
      headers,
      body: JSON.stringify(updates),
    });
  },

  async deleteTransaction(id: ID, businessId: ID, userId: ID): Promise<void> {
    const headers = await getAuthHeaders(businessId, userId);
    return apiFetch<void>(`/api/transactions/${id}`, {
      method: "DELETE",
      headers,
    });
  },

  // ---------- Cashbook ----------
  async getCashbookEntries(businessId: ID, startDate?: string, endDate?: string): Promise<CashbookEntry[]> {
    const headers = await getAuthHeaders(businessId);
    let url = "/api/cashbook";
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    if (params.toString()) url += `?${params.toString()}`;
    return apiFetch<CashbookEntry[]>(url, { headers });
  },

  async createCashbookEntry(
    entry: Omit<CashbookEntry, "id">
  ): Promise<CashbookEntry> {
    const headers = await getAuthHeaders(entry.businessId);
    return apiFetch<CashbookEntry>("/api/cashbook", {
      method: "POST",
      headers,
      body: JSON.stringify(entry),
    });
  },

  async updateCashbookEntry(
    id: ID,
    updates: Partial<Omit<CashbookEntry, "id" | "businessId">>,
    businessId: ID
  ): Promise<CashbookEntry> {
    const headers = await getAuthHeaders(businessId);
    return apiFetch<CashbookEntry>(`/api/cashbook/${id}`, {
      method: "PUT",
      headers,
      body: JSON.stringify(updates),
    });
  },

  async deleteCashbookEntry(id: ID, businessId: ID): Promise<void> {
    const headers = await getAuthHeaders(businessId);
    return apiFetch<void>(`/api/cashbook/${id}`, {
      method: "DELETE",
      headers,
    });
  },

  // ---------- Categories ----------
  async getCategories(businessId: ID): Promise<Category[]> {
    const headers = await getAuthHeaders(businessId);
    return apiFetch<Category[]>(`/api/categories?businessId=${encodeURIComponent(businessId)}`);
  },

  async createCategory(input: { name: string; color: string; businessId: ID }): Promise<Category> {
    const headers = await getAuthHeaders(input.businessId);
    return apiFetch<Category>("/api/categories", {
      method: "POST",
      headers,
      body: JSON.stringify(input),
    });
  },

  async updateCategory(
    id: ID,
    updates: Partial<Omit<Category, "id" | "businessId">>,
    businessId: ID
  ): Promise<Category> {
    const headers = await getAuthHeaders(businessId);
    return apiFetch<Category>(`/api/categories/${id}`, {
      method: "PUT",
      headers,
      body: JSON.stringify(updates),
    });
  },

  async deleteCategory(id: ID, businessId: ID): Promise<void> {
    const headers = await getAuthHeaders(businessId);
    return apiFetch<void>(`/api/categories/${id}`, {
      method: "DELETE",
      headers,
    });
  },

  // ---------- Businesses ----------
  async getBusinesses(): Promise<Business[]> {
    const headers = { 'Content-Type': 'application/json' };
    return apiFetch<Business[]>("/api/businesses", { headers });
  },

  async getBusiness(id: ID): Promise<Business> {
    const headers = await getAuthHeaders();
    return apiFetch<Business>(`/api/businesses/${id}`, { headers });
  },

  async createBusiness(business: Omit<Business, "id" | "createdAt" | "updatedAt">): Promise<Business> {
    const headers = await getAuthHeaders();
    return apiFetch<Business>("/api/businesses", {
      method: "POST",
      headers,
      body: JSON.stringify(business),
    });
  },

  async updateBusiness(
    id: ID,
    updates: Partial<Omit<Business, "id" | "createdAt" | "updatedAt">>,
    businessId: ID
  ): Promise<Business> {
    const headers = await getAuthHeaders(businessId);
    return apiFetch<Business>(`/api/businesses/${id}`, {
      method: "PUT",
      headers,
      body: JSON.stringify(updates),
    });
  },

  async deleteBusiness(id: ID): Promise<void> {
    const headers = await getAuthHeaders();
    return apiFetch<void>(`/api/businesses/${id}`, {
      method: "DELETE",
      headers,
    });
  },

  // ---------- Branches ----------
  async getBranches(businessId: ID): Promise<Branch[]> {
    const headers = { 'Content-Type': 'application/json' };
    return apiFetch<Branch[]>(`/api/branches?businessId=${encodeURIComponent(businessId)}`, { headers });
  },

  async getBranch(id: ID): Promise<Branch> {
    const headers = await getAuthHeaders();
    return apiFetch<Branch>(`/api/branches/${id}`, { headers });
  },

  async createBranch(branch: Omit<Branch, "id" | "createdAt" | "updatedAt">): Promise<Branch> {
    const headers = await getAuthHeaders(branch.businessId);
    return apiFetch<Branch>("/api/branches", {
      method: "POST",
      headers,
      body: JSON.stringify(branch),
    });
  },

  async updateBranch(
    id: ID,
    updates: Partial<Omit<Branch, "id" | "businessId" | "createdAt" | "updatedAt">>,
    businessId: ID
  ): Promise<Branch> {
    const headers = await getAuthHeaders(businessId);
    return apiFetch<Branch>(`/api/branches/${id}`, {
      method: "PUT",
      headers,
      body: JSON.stringify(updates),
    });
  },

  async deleteBranch(id: ID, businessId: ID): Promise<void> {
    const headers = await getAuthHeaders(businessId);
    return apiFetch<void>(`/api/branches/${id}`, {
      method: "DELETE",
      headers,
    });
  },

  // ---------- Invoices ----------
  async getInvoices(businessId: ID, branchId?: ID): Promise<Invoice[]> {
    const headers = await getAuthHeaders(businessId);
    let url = `/api/invoices?businessId=${encodeURIComponent(businessId)}`;
    if (branchId) url += `&branchId=${encodeURIComponent(branchId)}`;
    return apiFetch<Invoice[]>(url, { headers });
  },

  async getInvoice(id: ID): Promise<Invoice> {
    const headers = await getAuthHeaders();
    return apiFetch<Invoice>(`/api/invoices/${id}`, { headers });
  },

  async createInvoice(invoice: Omit<Invoice, "id" | "createdAt" | "updatedAt">): Promise<Invoice> {
    const headers = await getAuthHeaders(invoice.businessId);
    return apiFetch<Invoice>("/api/invoices", {
      method: "POST",
      headers,
      body: JSON.stringify(invoice),
    });
  },

  async updateInvoice(
    id: ID,
    updates: Partial<Omit<Invoice, "id" | "businessId" | "createdAt" | "updatedAt">>,
    businessId: ID
  ): Promise<Invoice> {
    const headers = await getAuthHeaders(businessId);
    return apiFetch<Invoice>(`/api/invoices/${id}`, {
      method: "PUT",
      headers,
      body: JSON.stringify(updates),
    });
  },

  async deleteInvoice(id: ID, businessId: ID): Promise<void> {
    const headers = await getAuthHeaders(businessId);
    return apiFetch<void>(`/api/invoices/${id}`, {
      method: "DELETE",
      headers,
    });
  },

  // ---------- Invoice Items ----------
  async getInvoiceItems(invoiceId: ID): Promise<InvoiceItem[]> {
    const headers = await getAuthHeaders();
    return apiFetch<InvoiceItem[]>(`/api/invoice-items?invoiceId=${encodeURIComponent(invoiceId)}`, { headers });
  },

  async createInvoiceItem(item: Omit<InvoiceItem, "id">): Promise<InvoiceItem> {
    const headers = await getAuthHeaders();
    return apiFetch<InvoiceItem>("/api/invoice-items", {
      method: "POST",
      headers,
      body: JSON.stringify(item),
    });
  },

  async updateInvoiceItem(
    id: ID,
    updates: Partial<Omit<InvoiceItem, "id" | "invoiceId">>
  ): Promise<InvoiceItem> {
    const headers = await getAuthHeaders();
    return apiFetch<InvoiceItem>(`/api/invoice-items/${id}`, {
      method: "PUT",
      headers,
      body: JSON.stringify(updates),
    });
  },

  async deleteInvoiceItem(id: ID): Promise<void> {
    const headers = await getAuthHeaders();
    return apiFetch<void>(`/api/invoice-items/${id}`, {
      method: "DELETE",
      headers,
    });
  },

  // ---------- Derived helpers your db.ts expects ----------
  /**
   * Returns per-account totals + balance.
   * We treat "debit/in/receipt" as + and "credit/out/payment" as −.
   * Balance = totalDebit - totalCredit
   */
  async getAccountBalance(accountId: ID, userId: ID): Promise<{
    totalDebit: number;
    totalCredit: number;
    balance: number;
  }> {
    const rows = await this.getTransactions(accountId, userId);

    const debitKinds = new Set(["debit", "in", "receipt"]);
    const creditKinds = new Set(["credit", "out", "payment"]);

    let totalDebit = 0;
    let totalCredit = 0;

    for (const t of rows) {
      const amt = Number(t.amount);
      if (debitKinds.has(t.kind)) totalDebit += amt;
      else if (creditKinds.has(t.kind)) totalCredit += amt;
      else {
        // Fallback: if kind is unknown, assume positive is debit-side
        totalDebit += amt;
      }
    }
    return { totalDebit, totalCredit, balance: +(totalDebit - totalCredit).toFixed(2) };
  },

  /**
   * Aggregates across all accounts for a business.
   * NOTE: This loops accounts and fetches per-account transactions;
   * good enough for small datasets. For large sets, add a server summary endpoint.
   */
  async getAccountSummary(businessId: ID, userId: ID): Promise<{
    totalDebit: number;
    totalCredit: number;
    accountCount: number;
  }> {
    const accts = await this.getAccounts(businessId, userId);
    let totalDebit = 0;
    let totalCredit = 0;

    for (const a of accts) {
      const { totalDebit: d, totalCredit: c } = await this.getAccountBalance(a.id, userId);
      totalDebit += d;
      totalCredit += c;
    }
    return { totalDebit: +totalDebit.toFixed(2), totalCredit: +totalCredit.toFixed(2), accountCount: accts.length };
  },
};

export type Api = typeof api;
