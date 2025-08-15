import type { Express } from "express";
import { createServer, type Server } from "http";
import { db } from "./db";
import { accounts, transactions, cashbook } from "./db/schema";
import { eq, and } from "drizzle-orm";
import { randomUUID } from "crypto";
import { SettingsService } from './services/settings.js';

export async function registerRoutes(app: Express): Promise<Server> {
  // Accounts API
  app.get('/api/accounts', async (req, res) => {
    const userId = req.headers['user-id'] as string;
    const database = await db;
    const userAccounts = await database.select().from(accounts)
      .where(and(eq(accounts.userId, userId), eq(accounts.archived, false)));
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

  // Add cashbook endpoints
  app.get('/api/cashbook', async (req, res) => {
    try {
      const database = await db;
      const entries = await database.select().from(cashbook).orderBy(cashbook.dateTime);
      res.json(entries);
    } catch (error) {
      console.error('Error fetching cashbook entries:', error);
      res.status(500).json({ error: 'Failed to fetch cashbook entries' });
    }
  });
  
  app.post('/api/cashbook', async (req, res) => {
    try {
      const database = await db;
      const { direction, amount, note, attachmentUrl, dateTime } = req.body;
      
      const newEntry = {
        id: randomUUID(),
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

  // Sync endpoint for offline data
  app.post('/api/sync', async (req, res) => {
    const { lastSyncTime, localData } = req.body;
    const userId = req.headers['user-id'] as string;
    
    // Implement conflict resolution logic
    // Return server changes since lastSyncTime
    res.json({ success: true, serverData: [] });
  });

  // Add cashbook endpoints
  app.get('/api/cashbook', async (req, res) => {
    try {
      const database = await db;
      const entries = await database.select().from(cashbook).orderBy(cashbook.dateTime);
      res.json(entries);
    } catch (error) {
      console.error('Error fetching cashbook entries:', error);
      res.status(500).json({ error: 'Failed to fetch cashbook entries' });
    }
  });
  
  app.post('/api/cashbook', async (req, res) => {
    try {
      const database = await db;
      const { direction, amount, note, dateTime } = req.body;
      
      const newEntry = {
        id: randomUUID(),
        direction,
        amount: amount.toString(), // Convert to string instead of parseFloat
        note,
        dateTime: new Date(dateTime)
      };
      
      await database.insert(cashbook).values(newEntry);
      
      // Fetch the inserted record
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

  const httpServer = createServer(app);
  return httpServer;
}
