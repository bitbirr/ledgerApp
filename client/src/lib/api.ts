// client/src/lib/api.ts
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

function headers(businessId?: string, userId?: string) {
  const h: Record<string, string> = { "Content-Type": "application/json" };
  if (businessId) h["business-id"] = businessId;
  if (userId) h["user-id"] = userId;
  return h;
}

async function getJSON<T>(input: RequestInfo, init?: RequestInit): Promise<T> {
  const res = await fetch(input, init);
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return (await res.json()) as T;
}

export const api = {
  // ---------- Items (you already had these) ----------
  async getItems(): Promise<Item[]> {
    // if you have a route for items, use it; else adapt/remove
    return getJSON<Item[]>("/api/items");
  },
  async createItem(item: Omit<Item, "id">): Promise<Item> {
    return getJSON<Item>("/api/items", {
      method: "POST",
      headers: headers(item.businessId),
      body: JSON.stringify(item),
    });
  },

  // ---------- Preferences (you already had these) ----------
  async getPreferences(id: number): Promise<Preferences> {
    return getJSON<Preferences>(`/api/preferences/${id}`);
  },
  async updatePreferences(id: number, updates: Partial<Preferences>): Promise<void> {
    await getJSON<void>(`/api/preferences/${id}`, {
      method: "PUT",
      headers: headers(updates.businessId as string | undefined),
      body: JSON.stringify(updates),
    });
  },

  // ---------- Accounts ----------
  async getAccounts(businessId: ID, userId: ID): Promise<Account[]> {
    return getJSON<Account[]>("/api/accounts", { headers: headers(businessId, userId) });
  },

  async searchAccounts(query: string, businessId: ID, userId: ID): Promise<Account[]> {
    const all = await this.getAccounts(businessId, userId);
    const q = query.trim().toLowerCase();
    return all.filter(a => a.name.toLowerCase().includes(q));
  },

  async createAccount(
    account: Omit<Account, "id" | "archived" | "createdAt">
  ): Promise<Account> {
    return getJSON<Account>("/api/accounts", {
      method: "POST",
      headers: headers(account.businessId, account.userId),
      body: JSON.stringify(account),
    });
  },

  async updateAccount(
    id: ID,
    updates: Partial<Omit<Account, "id" | "businessId" | "userId">>,
    businessId: ID,
    userId: ID
  ): Promise<Account> {
    return getJSON<Account>(`/api/accounts/${id}`, {
      method: "PUT",
      headers: headers(businessId, userId),
      body: JSON.stringify(updates),
    });
  },

  // ---------- Transactions ----------
  async getTransactions(accountId: ID, userId: ID): Promise<Transaction[]> {
    return getJSON<Transaction[]>(`/api/transactions/${accountId}`, {
      headers: headers(undefined, userId),
    });
  },

  async createTransaction(
    t: Omit<Transaction, "id" | "deleted">
  ): Promise<Transaction> {
    return getJSON<Transaction>("/api/transactions", {
      method: "POST",
      headers: headers(t.businessId, t.userId),
      body: JSON.stringify(t),
    });
  },

  async updateTransaction(
    id: ID,
    updates: Partial<Omit<Transaction, "id" | "businessId" | "userId">>,
    businessId: ID,
    userId: ID
  ): Promise<Transaction> {
    return getJSON<Transaction>(`/api/transactions/${id}`, {
      method: "PUT",
      headers: headers(businessId, userId),
      body: JSON.stringify(updates),
    });
  },

  // ---------- Cashbook ----------
  async getCashbookEntries(businessId: ID): Promise<CashbookEntry[]> {
    return getJSON<CashbookEntry[]>("/api/cashbook", { headers: headers(businessId) });
  },

  async createCashbookEntry(
    entry: Omit<CashbookEntry, "id">
  ): Promise<CashbookEntry> {
    return getJSON<CashbookEntry>("/api/cashbook", {
      method: "POST",
      headers: headers(entry.businessId),
      body: JSON.stringify(entry),
    });
  },

  // ---------- Categories ----------
  async getCategories(businessId: ID): Promise<Category[]> {
    // server can optionally filter by ?businessId=
    return getJSON<Category[]>(`/api/categories?businessId=${encodeURIComponent(businessId)}`);
  },

  async createCategory(input: { name: string; color: string; businessId: ID }): Promise<Category> {
    return getJSON<Category>("/api/categories", {
      method: "POST",
      headers: headers(input.businessId),
      body: JSON.stringify(input),
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
