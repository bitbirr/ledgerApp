import type { Express, Request, Response } from 'express';
import { db as dbPromise } from './db/index.ts';
import * as schema from './db/schema.ts';
import { and, eq, gte, lte, like, sql, inArray } from 'drizzle-orm';
import { seedAll } from './seed.ts';
import { httpLogger } from './services/logger.ts';
import { authenticateUser, authenticateSuperAdmin, getUserBusinesses, getUserBranches, verifyToken } from './services/auth.ts';

const getDb = async () => await dbPromise;

function getBizId(req: Request): string {
  const h = (req.headers['business-id'] as string) || '';
  if (!h || h === 'default-business') return 'biz_ismail';
  return h;
}

export async function registerRoutes(app: Express): Promise<void> {
  // dev-only seed (optional to use)
  if (app.get('env') === 'development') {
    app.post('/api/dev/seed/full', async (_req, res) => {
      const result = await seedAll();
      res.json({ ok: true, result });
    });
  }

  // Apply HTTP logging middleware to all routes
  app.use(httpLogger);

  // health probe
  app.get('/healthz', async (_req, res) => {
    try {
      const dbc = await getDb();
      await dbc.execute(sql`SELECT 1`);
      res.status(200).type('text/plain').send('ok');
    } catch (err) {
      res.status(500).json({
        status: 'error',
        message: (err as Error).message ?? 'db check failed',
      });
    }
  });
  
  // -------- Authentication
  app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }
    
    const result = await authenticateUser({ email, password });
    res.json(result);
  });
  
  app.post('/api/auth/admin/login', async (req, res) => {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }
    
    const result = await authenticateSuperAdmin({ email, password });
    res.json(result);
  });
  
  app.get('/api/auth/businesses', async (req, res) => {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }
    
    const userSession = verifyToken(token);
    if (!userSession) {
      return res.status(401).json({ success: false, message: 'Invalid token' });
    }
    
    const businesses = await getUserBusinesses(userSession.userId);
    res.json({ businesses });
  });
  
  app.get('/api/auth/branches/:businessId', async (req, res) => {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }
    
    const userSession = verifyToken(token);
    if (!userSession) {
      return res.status(401).json({ success: false, message: 'Invalid token' });
    }
    
    const { businessId } = req.params;
    const branches = await getUserBranches(userSession.userId, businessId);
    res.json({ branches });
  });

  // -------- Accounts
  app.get('/api/accounts', async (req, res) => {
    const dbc = await getDb();
    const businessId = getBizId(req);
    const rows = await dbc
      .select({
        id: schema.accounts.id,
        name: schema.accounts.name,
        phone: schema.accounts.phone,
        type: schema.accounts.type,
      })
      .from(schema.accounts)
      .where(eq(schema.accounts.businessId, businessId));
    res.json(rows);
  });

  // -------- Cashbook
  app.get('/api/cashbook', async (req, res) => {
    const dbc = await getDb();
    const businessId = getBizId(req);
    const rows = await dbc
      .select({
        id: schema.cashbook.id,
        dateTime: schema.cashbook.dateTime,
        direction: schema.cashbook.direction,
        amount: schema.cashbook.amount,
        note: schema.cashbook.note,
      })
      .from(schema.cashbook)
      .where(eq(schema.cashbook.businessId, businessId))
      .orderBy(sql`date_time desc`);
    res.json(rows);
  });

  // -------- GL Accounts
  app.get('/api/gl-accounts', async (req, res) => {
    const dbc = await getDb();
    const businessId = getBizId(req);
    const rows = await dbc
      .select({
        id: schema.glAccounts.id,
        businessId: schema.glAccounts.businessId,
        code: schema.glAccounts.code,
        name: schema.glAccounts.name,
        type: schema.glAccounts.type,
      })
      .from(schema.glAccounts)
      .where(eq(schema.glAccounts.businessId, businessId))
      .orderBy(schema.glAccounts.code);
    res.json(rows);
  });

  // -------- Journal Entries + Lines
  app.get('/api/journal-entries', async (req, res) => {
    const dbc = await getDb();
    const businessId = getBizId(req);
    const { dateFrom, dateTo, accountId, sourceModule, search } = req.query as Record<string, string>;

    const entryWhere = [
      eq(schema.glJournalEntries.businessId, businessId),
      dateFrom ? gte(schema.glJournalEntries.entryDate, new Date(dateFrom)) : undefined,
      dateTo ? lte(schema.glJournalEntries.entryDate, new Date(dateTo)) : undefined,
      sourceModule ? eq(schema.glJournalEntries.sourceModule, sourceModule) : undefined,
      search ? like(schema.glJournalEntries.memo, `%${search}%`) : undefined,
    ].filter(Boolean) as any[];

    const entries = await dbc
      .select({
        id: schema.glJournalEntries.id,
        entryDate: schema.glJournalEntries.entryDate,
        memo: schema.glJournalEntries.memo,
        sourceModule: schema.glJournalEntries.sourceModule,
        sourceId: schema.glJournalEntries.sourceId,
        locked: schema.glJournalEntries.locked,
      })
      .from(schema.glJournalEntries)
      .where(and(...entryWhere))
      .orderBy(sql`entry_date desc`);

    if (entries.length === 0) return res.json([]);

    const entryIds = entries.map(e => e.id);

    const linesRaw = await dbc
      .select({
        id: schema.glJournalLines.id,
        entryId: schema.glJournalLines.entryId,
        accountId: schema.glJournalLines.accountId,
        debit: schema.glJournalLines.debit,
        credit: schema.glJournalLines.credit,
        notes: schema.glJournalLines.notes,
        accountCode: schema.glAccounts.code,
        accountName: schema.glAccounts.name,
      })
      .from(schema.glJournalLines)
      .leftJoin(schema.glAccounts, eq(schema.glJournalLines.accountId, schema.glAccounts.id))
      .where(
        and(
          eq(schema.glJournalLines.businessId, businessId),
          inArray(schema.glJournalLines.entryId, entryIds),
          accountId ? eq(schema.glJournalLines.accountId, accountId) : sql`1=1`,
          search ? like(schema.glJournalLines.notes, `%${search}%`) : sql`1=1`,
        ),
      );

    const linesByEntry = new Map<string, any[]>();
    for (const line of linesRaw) {
      const arr = linesByEntry.get(line.entryId) ?? [];
      arr.push({
        id: line.id,
        businessId,
        entryId: line.entryId,
        accountId: line.accountId,
        accountCode: line.accountCode,
        description: line.notes ?? null,
        debitAmount: Number(line.debit ?? 0),
        creditAmount: Number(line.credit ?? 0),
        notes: line.notes ?? null,
      });
      linesByEntry.set(line.entryId, arr);
    }

    res.json(
      entries.map(e => ({
        id: e.id,
        businessId,
        entryDate: e.entryDate,
        memo: e.memo,
        sourceModule: e.sourceModule,
        sourceId: e.sourceId,
        locked: !!e.locked,
        lines: linesByEntry.get(e.id) || [],
      })),
    );
  });

  // -------- Trial Balance
  app.get('/api/reports/trial-balance', async (req, res) => {
    const dbc = await getDb();
    const businessId = getBizId(req);
    const asOfDate = (req.query.asOfDate as string) || new Date().toISOString().slice(0, 10);
    const cutoff = new Date(asOfDate);

    const rows = await dbc
      .select({
        accountId: schema.glAccounts.id,
        accountCode: schema.glAccounts.code,
        accountName: schema.glAccounts.name,
        accountType: schema.glAccounts.type,
        debitSum: sql<number>`COALESCE(SUM(${schema.glJournalLines.debit}), 0)`,
        creditSum: sql<number>`COALESCE(SUM(${schema.glJournalLines.credit}), 0)`,
      })
      .from(schema.glAccounts)
      .leftJoin(schema.glJournalLines, eq(schema.glAccounts.id, schema.glJournalLines.accountId))
      .leftJoin(
        schema.glJournalEntries,
        and(
          eq(schema.glJournalEntries.id, schema.glJournalLines.entryId),
          lte(schema.glJournalEntries.entryDate, cutoff),
          eq(schema.glJournalEntries.businessId, businessId),
        ),
      )
      .where(eq(schema.glAccounts.businessId, businessId))
      .groupBy(schema.glAccounts.id)
      .orderBy(schema.glAccounts.code);

    const items = rows.map(r => {
      const debit = Number(r.debitSum || 0);
      const credit = Number(r.creditSum || 0);
      const diff = debit - credit;
      return {
        accountId: r.accountId,
        accountCode: r.accountCode,
        accountName: r.accountName,
        accountType: r.accountType,
        debitBalance: diff > 0 ? diff : 0,
        creditBalance: diff < 0 ? Math.abs(diff) : 0,
      };
    });

    const totals = items.reduce(
      (acc, it) => {
        acc.totalDebits += it.debitBalance;
        acc.totalCredits += it.creditBalance;
        return acc;
      },
      { totalDebits: 0, totalCredits: 0 },
    );

    res.json({
      items,
      totalDebits: totals.totalDebits,
      totalCredits: totals.totalCredits,
      isBalanced: Math.abs(totals.totalDebits - totals.totalCredits) < 0.005,
      asOfDate,
    });
  });

  // -------- Items
  app.get('/api/items', async (req, res) => {
    const dbc = await getDb();
    const bizId = (req.headers['business-id'] as string) || (req.query.businessId as string) || '';
    const q = dbc
      .select({
        id: schema.items.id,
        name: schema.items.name,
        rate: schema.items.rate,
        uom: schema.items.uom,
        categoryId: schema.items.categoryId,
        businessId: schema.items.businessId,
        openingStock: schema.items.openingStock,
        lowStockAlert: schema.items.lowStockAlert,
      })
      .from(schema.items);
    const rows = bizId ? await q.where(eq(schema.items.businessId, bizId)) : await q;
    res.json(rows);
  });

  app.post('/api/items', async (req, res) => {
    const dbc = await getDb();
    const b = req.body as {
      name: string;
      rate: string | number;
      uom: string;
      businessId: string;
      openingStock?: string | number;
      lowStockAlert?: string | number;
      categoryId?: string;
    };
    const id = `itm_${crypto.randomUUID().slice(0, 8)}`;
    await dbc.insert(schema.items).values({
      id,
      name: b.name,
      rate: String(b.rate),
      uom: b.uom,
      businessId: b.businessId,
      categoryId: b.categoryId ?? null,
      openingStock: b.openingStock != null ? String(b.openingStock) : '0',
      lowStockAlert: b.lowStockAlert != null ? String(b.lowStockAlert) : '0',
    });
    const [created] = await dbc.select().from(schema.items).where(eq(schema.items.id, id));
    res.status(201).json(created);
  });

  // -------- Categories
  app.get('/api/categories', async (req, res) => {
    const dbc = await getDb();
    const bizId = (req.headers['business-id'] as string) || (req.query.businessId as string) || '';
    const q = dbc
      .select({
        id: schema.categories.id,
        name: schema.categories.name,
        color: schema.categories.color,
        businessId: schema.categories.businessId,
      })
      .from(schema.categories);
    const rows = bizId ? await q.where(eq(schema.categories.businessId, bizId)) : await q;
    res.json(rows);
  });

  app.post('/api/categories', async (req, res) => {
    const dbc = await getDb();
    const b = req.body as { name: string; color: string; businessId: string };
    const id = `cat_${crypto.randomUUID().slice(0, 8)}`;
    await dbc.insert(schema.categories).values({
      id,
      name: b.name,
      color: b.color,
      businessId: b.businessId,
    });
    const [created] = await dbc.select().from(schema.categories).where(eq(schema.categories.id, id));
    res.status(201).json(created);
  });

  // -------- Preferences
  app.get('/api/preferences/:id', async (req, res) => {
    const dbc = await getDb();
    const id = Number(req.params.id);
    if (Number.isNaN(id)) return res.status(400).json({ message: 'Invalid id' });
    const [row] = await dbc.select().from(schema.preferences).where(eq(schema.preferences.id, id));
    if (!row) return res.status(404).json({ message: 'Not found' });
    res.json(row);
  });

  app.put('/api/preferences/:id', async (req, res) => {
    const dbc = await getDb();
    const id = Number(req.params.id);
    if (Number.isNaN(id)) return res.status(400).json({ message: 'Invalid id' });
    const allowed: Partial<typeof schema.preferences.$inferInsert> = {};
    const b = req.body ?? {};
    if (b.dateFormat !== undefined) allowed.dateFormat = b.dateFormat;
    if (b.timeFormat !== undefined) allowed.timeFormat = b.timeFormat;
    if (b.currency !== undefined) allowed.currency = b.currency;
    if (b.language !== undefined) allowed.language = b.language;
    if (b.firstDayOfWeek !== undefined) allowed.firstDayOfWeek = b.firstDayOfWeek;
    if (b.firstDayOfMonth !== undefined) allowed.firstDayOfMonth = b.firstDayOfMonth;
    if (b.firstDayOfYear !== undefined) allowed.firstDayOfYear = b.firstDayOfYear;
    if (b.showTimeInReports !== undefined) allowed.showTimeInReports = !!b.showTimeInReports;
    if (b.showPreviousBalance !== undefined) allowed.showPreviousBalance = !!b.showPreviousBalance;
    if (b.darkMode !== undefined) allowed.darkMode = !!b.darkMode;
    if (b.biometricEnabled !== undefined) allowed.biometricEnabled = !!b.biometricEnabled;

    await dbc.update(schema.preferences).set(allowed).where(eq(schema.preferences.id, id));
    const [row] = await dbc.select().from(schema.preferences).where(eq(schema.preferences.id, id));
    res.json(row);
  });

  // -------- Transactions
  app.get('/api/transactions/:accountId', async (req, res) => {
    const dbc = await getDb();
    const accountId = req.params.accountId;
    const rows = await dbc
      .select({
        id: schema.transactions.id,
        accountId: schema.transactions.accountId,
        businessId: schema.transactions.businessId,
        dateTime: schema.transactions.dateTime,
        kind: schema.transactions.kind,
        amount: schema.transactions.amount,
        note: schema.transactions.note,
        imageUrl: schema.transactions.imageUrl,
        dueDate: schema.transactions.dueDate,
        deleted: schema.transactions.deleted,
        userId: schema.transactions.userId,
      })
      .from(schema.transactions)
      .where(eq(schema.transactions.accountId, accountId))
      .orderBy(sql`date_time desc`);
    res.json(rows);
  });

  app.post('/api/transactions', async (req, res) => {
    const dbc = await getDb();
    const b = req.body as {
      accountId: string;
      businessId: string;
      dateTime: string | Date;
      kind: string;
      amount: string | number;
      note?: string;
      imageUrl?: string;
      dueDate?: string | Date;
      userId: string;
    };
    const id = `txn_${crypto.randomUUID().slice(0, 8)}`;
    await dbc.insert(schema.transactions).values({
      id,
      accountId: b.accountId,
      businessId: b.businessId,
      dateTime: new Date(b.dateTime),
      kind: b.kind,
      amount: String(b.amount),
      note: b.note ?? null,
      imageUrl: b.imageUrl ?? null,
      dueDate: b.dueDate ? new Date(b.dueDate) : null,
      deleted: false,
      userId: b.userId,
    });
    const [created] = await dbc.select().from(schema.transactions).where(eq(schema.transactions.id, id));
    res.status(201).json(created);
  });
}
