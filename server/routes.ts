import type { Express } from "express";
import { createServer, type Server } from "http";
import { db } from "./db";
import { accounts, transactions, cashbook, categories, glAccounts, glJournalEntries, glJournalLines } from "./db/schema";
import { eq, and } from "drizzle-orm";
import { randomUUID } from "crypto";
import { SettingsService } from './services/settings.js';

export async function registerRoutes(app: Express): Promise<Server> {
  // Accounts API
  app.get('/api/accounts', async (req, res) => {
    const userId = req.headers['user-id'] as string;
    const businessId = req.headers['business-id'] as string || 'default-business';
    const database = await db;
    const userAccounts = await database.select().from(accounts)
      .where(and(
        eq(accounts.userId, userId), 
        eq(accounts.businessId, businessId),
        eq(accounts.archived, false)
      ));
    res.json(userAccounts);
  });

  app.post('/api/accounts', async (req, res) => {
    try {
      const userId = req.headers['user-id'] as string;
      const database = await db;
      const accountData = {
        ...req.body,
        id: randomUUID(),
        userId,
        businessId: 'default-business', // Temporary default until full multi-tenant auth is implemented
        createdAt: new Date(),
        archived: false
      };
      
      await database.insert(accounts).values(accountData);
      
      // Since MySQL doesn't support returning, we fetch the inserted record
      const newAccount = await database.select().from(accounts)
        .where(eq(accounts.id, accountData.id))
        .limit(1);
      
      res.json(newAccount[0]);
    } catch (error) {
      console.error('Error creating account:', error);
      res.status(500).json({ error: 'Failed to create account' });
    }
  });

  // Transactions API
  app.get('/api/transactions/:accountId', async (req, res) => {
    const { accountId } = req.params;
    const userId = req.headers['user-id'] as string;
    
    const database = await db;
    const accountTransactions = await database.select().from(transactions)
      .where(and(
        eq(transactions.accountId, accountId),
        eq(transactions.userId, userId),
        eq(transactions.deleted, false)
      ));
    res.json(accountTransactions);
  });

  // Add missing POST endpoint for creating transactions
  app.post('/api/transactions', async (req, res) => {
    try {
      const userId = req.headers['user-id'] as string;
      const database = await db;
      const transactionData = {
        ...req.body,
        id: randomUUID(),
        userId,
        createdAt: new Date(),
        updatedAt: new Date(),
        deleted: false
      };
      
      await database.insert(transactions).values(transactionData);
      
      // Since MySQL doesn't support returning, we fetch the inserted record
      const newTransaction = await database.select().from(transactions)
        .where(eq(transactions.id, transactionData.id))
        .limit(1);
      
      res.json(newTransaction[0]);
    } catch (error) {
      console.error('Error creating transaction:', error);
      res.status(500).json({ error: 'Failed to create transaction' });
    }
  });

  // Sync endpoint for offline data
  app.post('/api/sync', async (req, res) => {
    const { lastSyncTime, localData } = req.body;
    const userId = req.headers['user-id'] as string;
    
    // Implement conflict resolution logic
    // Return server changes since lastSyncTime
    res.json({ success: true, serverData: [] });
  });

  // Add cashbook endpoints (scoped by business)
  app.get('/api/cashbook', async (req, res) => {
    try {
      const businessId = (req.headers['business-id'] as string) || 'default-business';
      const database = await db;
      const entries = await database
        .select()
        .from(cashbook)
        .where(eq(cashbook.businessId, businessId))
        .orderBy(cashbook.dateTime);
      res.json(entries);
    } catch (error) {
      console.error('Error fetching cashbook entries:', error);
      res.status(500).json({ error: 'Failed to fetch cashbook entries' });
    }
  });
  
  app.post('/api/cashbook', async (req, res) => {
    try {
      const businessId = (req.headers['business-id'] as string) || 'default-business';
      const database = await db;
      const { direction, amount, note, attachmentUrl, dateTime } = req.body;
      
      const newEntry = {
        id: randomUUID(),
        businessId,
        direction,
        amount: amount.toString(),
        note,
        attachmentUrl,
        dateTime: new Date(dateTime)
      };
      
      await database.insert(cashbook).values(newEntry);
      
      const insertedEntry = await database
        .select()
        .from(cashbook)
        .where(eq(cashbook.id, newEntry.id))
        .limit(1);
      
      res.status(201).json(insertedEntry[0]);
    } catch (error) {
      console.error('Error creating cashbook entry:', error);
      res.status(500).json({ error: 'Failed to create cashbook entry' });
    }
  });

  // Settings routes
  app.get('/api/settings/:key', async (req, res) => {
    try {
      const { key } = req.params;
      const setting = await SettingsService.getSetting(key);
      
      if (setting === null) {
        return res.status(404).json({ error: 'Setting not found' });
      }
      
      res.json({ value: setting });
    } catch (error) {
      console.error('Error fetching setting:', error);
      res.status(500).json({ error: 'Failed to fetch setting' });
    }
  });
  
  app.get('/api/settings/category/:category', async (req, res) => {
    try {
      const { category } = req.params;
      const settings = await SettingsService.getSettingsByCategory(category);
      res.json(settings);
    } catch (error) {
      console.error('Error fetching settings:', error);
      res.status(500).json({ error: 'Failed to fetch settings' });
    }
  });
  
  app.put('/api/settings/:key', async (req, res) => {
    try {
      const { key } = req.params;
      const { value, type = 'string', category = 'general', description } = req.body;
      
      await SettingsService.setSetting(key, value, type, category, description);
      res.json({ success: true });
    } catch (error) {
      console.error('Error updating setting:', error);
      res.status(500).json({ error: 'Failed to update setting' });
    }
  });
  
  app.delete('/api/settings/:key', async (req, res) => {
    try {
      const { key } = req.params;
      await SettingsService.deleteSetting(key);
      res.json({ success: true });
    } catch (error) {
      console.error('Error deleting setting:', error);
      res.status(500).json({ error: 'Failed to delete setting' });
    }
  });

  /**
   * GL: Chart of Accounts Endpoints
   */
  app.get('/api/gl/accounts', async (req, res) => {
    try {
      const businessId = (req.headers['business-id'] as string) || 'default-business';
      const database = await db;
      const list = await database
        .select()
        .from(glAccounts)
        .where(eq(glAccounts.businessId, businessId));
      res.json(list);
    } catch (error) {
      console.error('Error fetching GL accounts:', error);
      res.status(500).json({ error: 'Failed to fetch GL accounts' });
    }
  });

  app.post('/api/gl/accounts', async (req, res) => {
    try {
      const businessId = (req.headers['business-id'] as string) || 'default-business';
      const database = await db;
      const { code, name, type, parentId, isLeaf = true, isActive = true, description } = req.body;

      const record = {
        id: randomUUID(),
        businessId,
        code,
        name,
        type,
        parentId,
        isLeaf,
        isActive,
        systemFlag: false,
        description,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await database.insert(glAccounts).values(record);
      const inserted = await database.select().from(glAccounts).where(eq(glAccounts.id, record.id)).limit(1);
      res.status(201).json(inserted[0]);
    } catch (error) {
      console.error('Error creating GL account:', error);
      res.status(500).json({ error: 'Failed to create GL account' });
    }
  });

  app.put('/api/gl/accounts/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const businessId = (req.headers['business-id'] as string) || 'default-business';
      const database = await db;

      // Prevent changing system accounts' type/code/name if systemFlag true (basic safeguard)
      const current = await database.select().from(glAccounts).where(eq(glAccounts.id, id)).limit(1);
      if (!current[0]) return res.status(404).json({ error: 'GL account not found' });
      if (current[0].systemFlag) {
        // Only allow toggling isActive or description on system accounts
        const allowed = { isActive: req.body.isActive ?? current[0].isActive, description: req.body.description ?? current[0].description, updatedAt: new Date() };
        await database.update(glAccounts).set(allowed).where(eq(glAccounts.id, id));
      } else {
        await database.update(glAccounts).set({ ...req.body, updatedAt: new Date() }).where(eq(glAccounts.id, id));
      }

      const updated = await database.select().from(glAccounts).where(eq(glAccounts.id, id)).limit(1);
      res.json(updated[0]);
    } catch (error) {
      console.error('Error updating GL account:', error);
      res.status(500).json({ error: 'Failed to update GL account' });
    }
  });

  /**
   * GL: Journal Endpoints
   */
  app.get('/api/gl/journal', async (req, res) => {
    try {
      const businessId = (req.headers['business-id'] as string) || 'default-business';
      const database = await db;
      const entries = await database.select().from(glJournalEntries).where(eq(glJournalEntries.businessId, businessId));
      res.json(entries);
    } catch (error) {
      console.error('Error fetching journal entries:', error);
      res.status(500).json({ error: 'Failed to fetch journal entries' });
    }
  });

  app.post('/api/gl/journal', async (req, res) => {
    try {
      const database = await db;
      const businessId = (req.headers['business-id'] as string) || 'default-business';
      const postedBy = (req.headers['user-id'] as string) || 'system';
      const { entry, lines } = req.body as {
        entry: {
          entryDate: string;
          memo?: string;
          sourceModule: string;
          sourceId?: string;
        };
        lines: Array<{
          accountId: string;
          debit?: number;
          credit?: number;
          partyId?: string;
          itemId?: string;
          notes?: string;
        }>;
      };

      if (!Array.isArray(lines) || lines.length < 2) {
        return res.status(400).json({ error: 'At least two lines required' });
      }

      // Validate accounts and leaf/active
      const accountIds = Array.from(new Set(lines.map(l => l.accountId)));
      const acctList = await database.select().from(glAccounts);
      const needed = acctList.filter(a => accountIds.includes(a.id) && a.businessId === businessId);
      if (needed.length !== accountIds.length) {
        return res.status(400).json({ error: 'One or more GL accounts not found for this business' });
      }
      if (needed.some(a => a.isLeaf === false || a.isActive === false)) {
        return res.status(400).json({ error: 'Posting allowed to active leaf accounts only' });
      }

      // Validate balanced
      const totalDebit = lines.reduce((s, l) => s + Number(l.debit || 0), 0);
      const totalCredit = lines.reduce((s, l) => s + Number(l.credit || 0), 0);
      if (Number(totalDebit.toFixed(2)) !== Number(totalCredit.toFixed(2))) {
        return res.status(400).json({ error: 'Journal not balanced' });
      }

      const entryId = randomUUID();
      const now = new Date();
      const entryRow = {
        id: entryId,
        businessId,
        entryDate: new Date(entry.entryDate),
        memo: entry.memo,
        sourceModule: entry.sourceModule,
        sourceId: entry.sourceId,
        postedBy,
        postedAt: now,
        createdAt: now,
        locked: false,
      };

      await database.insert(glJournalEntries).values(entryRow);

      for (const l of lines) {
        const lineRow = {
          id: randomUUID(),
          entryId,
          businessId,
          accountId: l.accountId,
          debit: (l.debit ?? 0).toString(),
          credit: (l.credit ?? 0).toString(),
          partyId: l.partyId,
          itemId: l.itemId,
          notes: l.notes,
        };
        await database.insert(glJournalLines).values(lineRow);
      }

      const created = await database.select().from(glJournalEntries).where(eq(glJournalEntries.id, entryId)).limit(1);
      res.status(201).json(created[0]);
    } catch (error) {
      console.error('Error creating journal entry:', error);
      res.status(500).json({ error: 'Failed to create journal entry' });
    }
  });

  /**
   * Bootstrap route: seed default CoA and VAT 15% for a business
   */
  app.post('/api/bootstrap', async (req, res) => {
    try {
      const businessId = (req.headers['business-id'] as string) || 'default-business';
      const database = await db;

      // Seed CoA if empty
      const existing = await database.select().from(glAccounts).where(eq(glAccounts.businessId, businessId));
      if (existing.length === 0) {
        const now = new Date();
        const base = [
          { code: '1000', name: 'Cash on Hand', type: 'asset' },
          { code: '1010', name: 'Bank A', type: 'asset' },
          { code: '1020', name: 'Bank B', type: 'asset' },
          { code: '1100', name: 'Accounts Receivable', type: 'asset' },
          { code: '1200', name: 'Inventory', type: 'asset' },
          { code: '2000', name: 'Accounts Payable', type: 'liability' },
          { code: '2100', name: 'VAT Payable', type: 'liability' },
          { code: '2110', name: 'VAT Receivable', type: 'asset' },
          { code: '3000', name: 'Owner Equity', type: 'equity' },
          { code: '3100', name: 'Opening Balance Equity', type: 'equity' },
          { code: '4000', name: 'Sales Revenue', type: 'revenue' },
          { code: '5000', name: 'Cost of Goods Sold', type: 'expense' },
          { code: '5100', name: 'Purchases', type: 'expense' },
          { code: '5200', name: 'Operating Expenses', type: 'expense' },
        ];
        for (const a of base) {
          await database.insert(glAccounts).values({
            id: randomUUID(),
            businessId,
            code: a.code,
            name: a.name,
            type: a.type,
            parentId: null,
            isLeaf: true,
            isActive: true,
            systemFlag: ['1000','1100','1200','2000','2100','2110','3000','3100','4000','5000'].includes(a.code),
            description: null,
            createdAt: now,
            updatedAt: now,
          });
        }
      }

      // Done (tax seeding can be added later as needed)
      res.json({ success: true });
    } catch (error) {
      console.error('Error during bootstrap:', error);
      res.status(500).json({ error: 'Failed to bootstrap' });
    }
  });

  // Add missing endpoints for categories
  app.get('/api/categories', async (req, res) => {
    try {
      const database = await db;
      const allCategories = await database.select().from(categories);
      res.json(allCategories);
    } catch (error) {
      console.error('Error fetching categories:', error);
      res.status(500).json({ error: 'Failed to fetch categories' });
    }
  });

  app.post('/api/categories', async (req, res) => {
    try {
      const database = await db;
      const categoryData = {
        ...req.body,
        id: randomUUID()
      };
      
      await database.insert(categories).values(categoryData);
      
      const newCategory = await database.select().from(categories)
        .where(eq(categories.id, categoryData.id))
        .limit(1);
      
      res.json(newCategory[0]);
    } catch (error) {
      console.error('Error creating category:', error);
      res.status(500).json({ error: 'Failed to create category' });
    }
  });

  // Add missing PUT and DELETE endpoints for accounts
  app.put('/api/accounts/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.headers['user-id'] as string;
      const database = await db;
      
      await database.update(accounts)
        .set({ ...req.body, updatedAt: new Date() })
        .where(and(eq(accounts.id, id), eq(accounts.userId, userId)));
      
      const updatedAccount = await database.select().from(accounts)
        .where(eq(accounts.id, id))
        .limit(1);
      
      res.json(updatedAccount[0]);
    } catch (error) {
      console.error('Error updating account:', error);
      res.status(500).json({ error: 'Failed to update account' });
    }
  });

  app.delete('/api/accounts/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.headers['user-id'] as string;
      const database = await db;
      
      // Soft delete by setting archived to true
      await database.update(accounts)
        .set({ archived: true })
        .where(and(eq(accounts.id, id), eq(accounts.userId, userId)));
      
      res.json({ success: true });
    } catch (error) {
      console.error('Error deleting account:', error);
      res.status(500).json({ error: 'Failed to delete account' });
    }
  });

  // Add missing PUT and DELETE endpoints for transactions
  app.put('/api/transactions/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.headers['user-id'] as string;
      const database = await db;
      
      await database.update(transactions)
        .set({ ...req.body, updatedAt: new Date() })
        .where(and(eq(transactions.id, id), eq(transactions.userId, userId)));
      
      const updatedTransaction = await database.select().from(transactions)
        .where(eq(transactions.id, id))
        .limit(1);
      
      res.json(updatedTransaction[0]);
    } catch (error) {
      console.error('Error updating transaction:', error);
      res.status(500).json({ error: 'Failed to update transaction' });
    }
  });

  app.delete('/api/transactions/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.headers['user-id'] as string;
      const database = await db;
      
      // Soft delete by setting deleted to true
      await database.update(transactions)
        .set({ deleted: true })
        .where(and(eq(transactions.id, id), eq(transactions.userId, userId)));
      
      res.json({ success: true });
    } catch (error) {
      console.error('Error deleting transaction:', error);
      res.status(500).json({ error: 'Failed to delete transaction' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
