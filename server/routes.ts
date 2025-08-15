import type { Express } from "express";
import { createServer, type Server } from "http";
import { db } from "./db";
import { accounts, transactions } from "./db/schema";
import { eq, and } from "drizzle-orm";

export async function registerRoutes(app: Express): Promise<Server> {
  // Accounts API
  app.get('/api/accounts', async (req, res) => {
    const userId = req.headers['user-id'] as string;
    const userAccounts = await db.select().from(accounts)
      .where(and(eq(accounts.userId, userId), eq(accounts.archived, false)));
    res.json(userAccounts);
  });

  app.post('/api/accounts', async (req, res) => {
    const userId = req.headers['user-id'] as string;
    const newAccount = await db.insert(accounts)
      .values({ ...req.body, userId })
      .returning();
    res.json(newAccount[0]);
  });

  // Transactions API
  app.get('/api/transactions/:accountId', async (req, res) => {
    const { accountId } = req.params;
    const userId = req.headers['user-id'] as string;
    
    const accountTransactions = await db.select().from(transactions)
      .where(and(
        eq(transactions.accountId, accountId),
        eq(transactions.userId, userId),
        eq(transactions.deleted, false)
      ));
    res.json(accountTransactions);
  });

  // Sync endpoint for offline data
  app.post('/api/sync', async (req, res) => {
    const { lastSyncTime, localData } = req.body;
    const userId = req.headers['user-id'] as string;
    
    // Implement conflict resolution logic
    // Return server changes since lastSyncTime
    res.json({ success: true, serverData: [] });
  });

  const httpServer = createServer(app);
  return httpServer;
}
