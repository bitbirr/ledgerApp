// src/lib/db.ts
// Dexie-free compat shim that provides Dexie-like collections backed by REST + localStorage.
// Now with balance caching to avoid N-per-card requests.

const DEFAULT_BUSINESS_ID = 'default-business';
const DEFAULT_USER_ID = 'default-user';

// ---------- UI-facing types ----------
export type AccountType = 'customer' | 'supplier' | 'other';

export interface Account {
  id: string;
  name: string;
  type: AccountType;
  businessId: string;
  createdAt: Date;
  archived: boolean;
  phone?: string;
  categoryId?: string;
  photoUrl?: string;
}

export interface Transaction {
  id: string;
  businessId: string;
  userId: string;
  accountId: string;
  dateTime: Date;
  kind: 'credit' | 'debit';
  amount: number;
  note?: string;
  imageUrl?: string;
  dueDate?: Date;
  createdAt: Date;
  updatedAt: Date;
  deleted: boolean;
}

export interface CashbookEntry {
  id: string;
  businessId: string;
  dateTime: Date;
  direction: 'in' | 'out';
  amount: number;
  note?: string;
  attachmentUrl?: string;
}

export interface Item {
  id: string;
  name: string;
  businessId: string;
  rate: number;
  uom: string;
  openingStock: number;
  lowStockAlert: number;
  categoryId?: string;
}

export interface Category {
  id: string;
  name: string;
  color?: string;
  businessId?: string;
}

export interface Preferences {
  id: number;
  businessId: string;
  dateFormat: string;
  timeFormat: string;
  currency: string;
  language: string;
  firstDayOfWeek: number;
  firstDayOfMonth: number;
  firstDayOfYear: number;
  showTimeInReports: boolean;
  showPreviousBalance: boolean;
  darkMode: boolean;
  biometricEnabled: boolean;
}

// ---------- fetch helper ----------
async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      'user-id': DEFAULT_USER_ID,
      'business-id': DEFAULT_BUSINESS_ID,
      ...(init?.headers || {}),
    },
  });
  if (!res.ok) {
    let msg = `Request failed: ${res.status}`;
    try {
      const j = await res.json();
      msg = j?.error || msg;
    } catch {}
    throw new Error(msg);
  }
  return res.json();
}

const toDate = (v: any) => (v ? new Date(v) : undefined);

// ---------- localStorage buckets for items & categories (until you add /api/items, /api/categories) ----------
const ls = {
  read<T>(key: string, fallback: T): T {
    if (typeof window === 'undefined') return fallback;
    try {
      const raw = localStorage.getItem(key);
      return raw ? (JSON.parse(raw) as T) : fallback;
    } catch {
      return fallback;
    }
  },
  write<T>(key: string, value: T) {
    if (typeof window === 'undefined') return;
    localStorage.setItem(key, JSON.stringify(value));
  },
};
const LS_ITEMS_KEY = `items_${DEFAULT_BUSINESS_ID}`;
const LS_CATS_KEY = `categories_${DEFAULT_BUSINESS_ID}`;
const readItems = () => ls.read<Item[]>(LS_ITEMS_KEY, []);
const writeItems = (arr: Item[]) => ls.write(LS_ITEMS_KEY, arr);
const readCategories = () => ls.read<Category[]>(LS_CATS_KEY, []);
const writeCategories = (arr: Category[]) => ls.write(LS_CATS_KEY, arr);

// ---------- Balance cache (prevents N-per-card calls) ----------
type BalanceCache = {
  balances: Record<string, number>;
  at: number; // timestamp for debugging/invalidation if you want TTL later
};

let balanceCache: BalanceCache | null = null;
// If a summary build is already in-flight, let others await it
let balanceBuildPromise: Promise<void> | null = null;

function invalidateBalanceCache() {
  balanceCache = null;
  balanceBuildPromise = null;
}

function calcBalanceFromTxns(txns: Transaction[]): number {
  const credits = txns
    .filter((t) => t.kind === 'credit' && !t.deleted)
    .reduce((s, t) => s + t.amount, 0);
  const debits = txns
    .filter((t) => t.kind === 'debit' && !t.deleted)
    .reduce((s, t) => s + t.amount, 0);
  return credits - debits;
}

// Build cache by fetching transactions for each account ONCE.
// Still O(N) calls (one per account) but avoids duplicating them per card.
// If you add a server endpoint to batch balances, switch to that here.
async function buildBalanceCacheOnce(): Promise<void> {
  if (balanceCache) return; // already built
  if (balanceBuildPromise) {
    await balanceBuildPromise; // re-use in-flight build
    return;
  }

  balanceBuildPromise = (async () => {
    const balances: Record<string, number> = {};
    const accts = await accountsCollection.toArray();

    // Fetch per-account transactions in parallel once
    await Promise.all(
      accts.map(async (a) => {
        const rows = await fetchJson<any[]>(`/api/transactions/${a.id}`);
        const txns: Transaction[] = rows.map((r) => ({
          id: r.id,
          businessId: r.businessId ?? DEFAULT_BUSINESS_ID,
          userId: r.userId ?? DEFAULT_USER_ID,
          accountId: r.accountId,
          dateTime: toDate(r.dateTime)!,
          kind: r.kind,
          amount: Number(r.amount),
          note: r.note ?? undefined,
          imageUrl: r.imageUrl ?? undefined,
          dueDate: toDate(r.dueDate),
          createdAt: toDate(r.createdAt)!,
          updatedAt: toDate(r.updatedAt)!,
          deleted: !!r.deleted,
        }));
        balances[a.id] = calcBalanceFromTxns(txns);
      })
    );

    balanceCache = { balances, at: Date.now() };
    balanceBuildPromise = null;
  })();

  await balanceBuildPromise;
}

// ---------- Accounts ----------
const accountsCollection = {
  async toArray(): Promise<Account[]> {
    const rows = await fetchJson<any[]>('/api/accounts');
    return rows.map((r) => ({
      id: r.id,
      name: r.name,
      type: (r.type as AccountType) ?? 'other',
      businessId: r.businessId ?? DEFAULT_BUSINESS_ID,
      createdAt: toDate(r.createdAt) ?? new Date(),
      archived: !!r.archived,
      phone: r.phone ?? undefined,
      categoryId: r.categoryId ?? undefined,
      photoUrl: r.photoUrl ?? undefined,
    }));
  },

  // Accepts anything your UI sends; we pick the fields the API expects.
  async add(a: {
    id?: string;
    name: string;
    type: AccountType;
    phone?: string;
    categoryId?: string;
    photoUrl?: string;
    archived?: boolean;
  }): Promise<string> {
    const payload = {
      name: a.name,
      phone: a.phone ?? null,
      type: a.type,
      categoryId: a.categoryId ?? null,
      photoUrl: a.photoUrl ?? null,
      archived: a.archived ?? false,
    };
    const created = await fetchJson<any>('/api/accounts', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    // Adding an account could change balances next time (new customer starts at 0, but be safe)
    invalidateBalanceCache();
    return created.id as string;
  },

  async get(id: string): Promise<Account | undefined> {
    const all = await accountsCollection.toArray();
    return all.find((x) => x.id === id);
  },

  async update(id: string, updates: Partial<Account>): Promise<void> {
    const payload: any = {
      ...(updates.name !== undefined && { name: updates.name }),
      ...(updates.phone !== undefined && { phone: updates.phone }),
      ...(updates.type !== undefined && { type: updates.type }),
      ...(updates.categoryId !== undefined && { categoryId: updates.categoryId }),
      ...(updates.photoUrl !== undefined && { photoUrl: updates.photoUrl }),
      ...(updates.archived !== undefined && { archived: updates.archived }),
    };
    await fetchJson(`/api/accounts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
    // Archiving/unarchiving etc could change summary cards
    invalidateBalanceCache();
  },
};

// ---------- Transactions (supports where(...).equals(...).and(...).reverse().toArray()) ----------
function transactionsWhere(accountId: string) {
  type Pred = (t: Transaction) => boolean;
  let predicates: Pred[] = [(t) => t.accountId === accountId];

  const api = {
    equals(_value: string) {
      // accountId captured above for Dexie-like shape
      return api;
    },
    and(fn: Pred) {
      predicates.push(fn);
      return api;
    },
    reverse() {
      (api as any)._reverse = true;
      return api;
    },
    async toArray(): Promise<Transaction[]> {
      const rows = await fetchJson<any[]>(`/api/transactions/${accountId}`);
      let list: Transaction[] = rows.map((r) => ({
        id: r.id,
        businessId: r.businessId ?? DEFAULT_BUSINESS_ID,
        userId: r.userId ?? DEFAULT_USER_ID,
        accountId: r.accountId,
        dateTime: toDate(r.dateTime)!,
        kind: r.kind,
        amount: Number(r.amount),
        note: r.note ?? undefined,
        imageUrl: r.imageUrl ?? undefined,
        dueDate: toDate(r.dueDate),
        createdAt: toDate(r.createdAt)!,
        updatedAt: toDate(r.updatedAt)!,
        deleted: !!r.deleted,
      }));
      for (const p of predicates) list = list.filter(p);
      list.sort((a, b) => b.dateTime.getTime() - a.dateTime.getTime());
      if ((api as any)._reverse) list.reverse();
      return list;
    },
  };
  return api;
}

const transactionsCollection = {
  where(_field: 'accountId') {
    return {
      equals: (accountId: string) => transactionsWhere(accountId),
    };
  },

  // NOTE: no userId/businessId required; the server fills from headers.
  async add(t: {
    accountId: string;
    dateTime: Date;
    kind: 'credit' | 'debit';
    amount: number;
    note?: string;
    imageUrl?: string;
    dueDate?: Date;
  }): Promise<string> {
    const payload = {
      accountId: t.accountId,
      dateTime: t.dateTime.toISOString(),
      kind: t.kind,
      amount: t.amount,
      note: t.note ?? null,
      imageUrl: t.imageUrl ?? null,
      dueDate: t.dueDate ? t.dueDate.toISOString() : null,
    };
    const created = await fetchJson<any>('/api/transactions', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    // Transactions change balances immediately
    invalidateBalanceCache();
    return created.id as string;
  },

  async update(id: string, updates: Partial<Transaction>): Promise<void> {
    const payload: any = {
      ...(updates.accountId !== undefined && { accountId: updates.accountId }),
      ...(updates.kind !== undefined && { kind: updates.kind }),
      ...(updates.amount !== undefined && { amount: updates.amount }),
      ...(updates.note !== undefined && { note: updates.note }),
      ...(updates.imageUrl !== undefined && { imageUrl: updates.imageUrl }),
      ...(updates.dueDate !== undefined && {
        dueDate: updates.dueDate ? updates.dueDate.toISOString() : null,
      }),
      ...(updates.deleted !== undefined && { deleted: updates.deleted }),
      ...(updates.dateTime !== undefined && { dateTime: updates.dateTime.toISOString() }),
    };
    await fetchJson(`/api/transactions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
    // Updates also affect balances
    invalidateBalanceCache();
  },
};

// ---------- Cashbook (supports orderBy('dateTime').toArray()) ----------
const cashbookCollection = {
  orderBy(field: 'dateTime') {
    return {
      async toArray(): Promise<CashbookEntry[]> {
        const rows = await fetchJson<any[]>('/api/cashbook');
        const list = rows.map((r) => ({
          id: r.id,
          businessId: r.businessId ?? DEFAULT_BUSINESS_ID,
          dateTime: toDate(r.dateTime)!,
          direction: r.direction,
          amount: Number(r.amount),
          note: r.note ?? undefined,
          attachmentUrl: r.attachmentUrl ?? undefined,
        }));
        if (field === 'dateTime') {
          list.sort((a, b) => a.dateTime.getTime() - b.dateTime.getTime());
        }
        return list;
      },
    };
  },
  async add(e: Omit<CashbookEntry, 'id' | 'businessId'>): Promise<string> {
    const created = await fetchJson<any>('/api/cashbook', {
      method: 'POST',
      body: JSON.stringify({ ...e, dateTime: e.dateTime.toISOString() }),
    });
    // If cashbook entries eventually post to GL affecting per-account balances,
    // you may want to invalidate here as well. For now, keep cache intact.
    return created.id as string;
  },
};

// ---------- Items & Categories (localStorage-backed for now) ----------
const itemsCollection = {
  async toArray(): Promise<Item[]> {
    return readItems();
  },
  async add(item: Item): Promise<string> {
    const items = readItems();
    items.push({ ...item, businessId: DEFAULT_BUSINESS_ID });
    writeItems(items);
    return item.id;
  },
};

const categoriesCollection = {
  async toArray(): Promise<Category[]> {
    return readCategories();
  },
};

// ---------- Preferences ----------
const preferencesCollection = {
  async get(_id: number): Promise<Preferences> {
    return {
      id: 1,
      businessId: DEFAULT_BUSINESS_ID,
      dateFormat: 'DD/MM/YYYY',
      timeFormat: '12',
      currency: 'ETB',
      language: 'en',
      firstDayOfWeek: 1,
      firstDayOfMonth: 1,
      firstDayOfYear: 1,
      showTimeInReports: true,
      showPreviousBalance: true,
      darkMode: false,
      biometricEnabled: false,
    };
  },
  async update(_id: number, _updates: Partial<Preferences>): Promise<void> {
    return;
  },
};

// ---------- helpers used by pages ----------
async function getAccountBalance(accountId: string): Promise<number> {
  // If a summary build is running, wait and read from cache (prevents duplicate fetches)
  if (balanceBuildPromise) {
    await balanceBuildPromise;
  }
  // Use cache if present
  if (balanceCache && accountId in balanceCache.balances) {
    return balanceCache.balances[accountId];
  }
  // Fallback: fetch just this account (won't duplicate if summary already built)
  const rows = await fetchJson<any[]>(`/api/transactions/${accountId}`);
  const txns: Transaction[] = rows.map((r) => ({
    id: r.id,
    businessId: r.businessId ?? DEFAULT_BUSINESS_ID,
    userId: r.userId ?? DEFAULT_USER_ID,
    accountId: r.accountId,
    dateTime: toDate(r.dateTime)!,
    kind: r.kind,
    amount: Number(r.amount),
    note: r.note ?? undefined,
    imageUrl: r.imageUrl ?? undefined,
    dueDate: toDate(r.dueDate),
    createdAt: toDate(r.createdAt)!,
    updatedAt: toDate(r.updatedAt)!,
    deleted: !!r.deleted,
  }));
  const bal = calcBalanceFromTxns(txns);
  // Memoize into cache map
  if (!balanceCache) balanceCache = { balances: {}, at: Date.now() };
  balanceCache.balances[accountId] = bal;
  return bal;
}

async function getAccountSummary(): Promise<{
  totalAdvance: number;
  totalDue: number;
  netBalance: number;
}> {
  // Build (or reuse) the cache once; cards will read from it via getAccountBalance
  await buildBalanceCacheOnce();

  const accts = await accountsCollection.toArray();
  let totalAdvance = 0;
  let totalDue = 0;

  for (const a of accts) {
    const bal =
      balanceCache?.balances[a.id] !== undefined
        ? balanceCache!.balances[a.id]
        : 0;
    if (bal >= 0) totalAdvance += bal;
    else totalDue += -bal;
  }
  const netBalance = totalAdvance - totalDue;
  return { totalAdvance, totalDue, netBalance };
}

// ---------- exported db ----------
export const db = {
  accounts: accountsCollection,
  transactions: transactionsCollection,
  cashbook: cashbookCollection,
  items: itemsCollection,
  categories: categoriesCollection,
  preferences: preferencesCollection,

  getAccountBalance,
  getAccountSummary,
} as const;
