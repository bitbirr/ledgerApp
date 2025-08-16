// server/routes.ts
import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { randomUUID } from "crypto";
import { eq, and, sql } from "drizzle-orm";

import { db } from "./db";
import {
  accounts,
  transactions,
  cashbook,
  categories,
  glAccounts,
  glJournalEntries,
  glJournalLines,
  taxRates,
  taxCodes,
  invoices,
  invoiceItems as invoiceItemsTable,
  inventoryMovements
} from "./db/schema";

import { SettingsService } from "./services/settings.js";
import { postCashbookWithJournal, postInvoiceWithJournal } from "./services/posting.js";

export async function registerRoutes(app: Express): Promise<Server> {
  // ---------------- Accounts ----------------
  app.get("/api/accounts", async (req, res) => {
    const userId = req.headers["user-id"] as string;
    const businessId = (req.headers["business-id"] as string) || "default-business";
    const database = await db;

    const userAccounts = await database
      .select()
      .from(accounts)
      .where(and(eq(accounts.userId, userId), eq(accounts.businessId, businessId), eq(accounts.archived, false)));

    res.json(userAccounts);
  });

  app.post("/api/accounts", async (req, res) => {
    try {
      const userId = req.headers["user-id"] as string;
      const database = await db;

      const accountData = {
        ...req.body,
        id: randomUUID(),
        userId,
        businessId: "default-business",
        createdAt: new Date(),
        archived: false
      };

      await database.insert(accounts).values(accountData);
      const [newAccount] = await database.select().from(accounts).where(eq(accounts.id, accountData.id)).limit(1);
      res.json(newAccount);
    } catch (e) {
      const error = e as Error;
      console.error("Error creating account:", error);
      res.status(500).json({ error: "Failed to create account" });
    }
  });

  app.put("/api/accounts/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.headers["user-id"] as string;
      const database = await db;

      await database
        .update(accounts)
        .set({ ...req.body, updatedAt: new Date() })
        .where(and(eq(accounts.id, id), eq(accounts.userId, userId)));

      const [updatedAccount] = await database.select().from(accounts).where(eq(accounts.id, id)).limit(1);
      res.json(updatedAccount);
    } catch (e) {
      const error = e as Error;
      console.error("Error updating account:", error);
      res.status(500).json({ error: "Failed to update account" });
    }
  });

  app.delete("/api/accounts/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.headers["user-id"] as string;
      const database = await db;

      await database
        .update(accounts)
        .set({ archived: true })
        .where(and(eq(accounts.id, id), eq(accounts.userId, userId)));

      res.json({ success: true });
    } catch (e) {
      const error = e as Error;
      console.error("Error deleting account:", error);
      res.status(500).json({ error: "Failed to delete account" });
    }
  });

  // ---------------- Transactions ----------------
  app.get("/api/transactions/:accountId", async (req, res) => {
    const { accountId } = req.params;
    const userId = req.headers["user-id"] as string;

    const database = await db;
    const rows = await database
      .select()
      .from(transactions)
      .where(and(eq(transactions.accountId, accountId), eq(transactions.userId, userId), eq(transactions.deleted, false)));

    res.json(rows);
  });

  app.post("/api/transactions", async (req, res) => {
    try {
      const userId = req.headers["user-id"] as string;
      const database = await db;

      const row = {
        ...req.body,
        id: randomUUID(),
        userId,
        createdAt: new Date(),
        updatedAt: new Date(),
        deleted: false
      };

      await database.insert(transactions).values(row);
      const [inserted] = await database.select().from(transactions).where(eq(transactions.id, row.id)).limit(1);
      res.json(inserted);
    } catch (e) {
      const error = e as Error;
      console.error("Error creating transaction:", error);
      res.status(500).json({ error: "Failed to create transaction" });
    }
  });

  app.put("/api/transactions/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.headers["user-id"] as string;
      const database = await db;

      await database
        .update(transactions)
        .set({ ...req.body, updatedAt: new Date() })
        .where(and(eq(transactions.id, id), eq(transactions.userId, userId)));

      const [updated] = await database.select().from(transactions).where(eq(transactions.id, id)).limit(1);
      res.json(updated);
    } catch (e) {
      const error = e as Error;
      console.error("Error updating transaction:", error);
      res.status(500).json({ error: "Failed to update transaction" });
    }
  });

  app.delete("/api/transactions/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.headers["user-id"] as string;
      const database = await db;

      await database
        .update(transactions)
        .set({ deleted: true })
        .where(and(eq(transactions.id, id), eq(transactions.userId, userId)));

      res.json({ success: true });
    } catch (e) {
      const error = e as Error;
      console.error("Error deleting transaction:", error);
      res.status(500).json({ error: "Failed to delete transaction" });
    }
  });

  // ---------------- Sync ----------------
  app.post("/api/sync", async (req, res) => {
    const { lastSyncTime } = req.body;
    const _userId = req.headers["user-id"] as string;
    // TODO: implement conflict resolution and changes since lastSyncTime
    res.json({ success: true, serverData: [], lastSyncTime });
  });

  // ---------------- Cashbook ----------------
  app.get("/api/cashbook", async (req, res) => {
    try {
      const businessId = (req.headers["business-id"] as string) || "default-business";
      const database = await db;

      const entries = await database
        .select()
        .from(cashbook)
        .where(eq(cashbook.businessId, businessId))
        .orderBy(cashbook.dateTime);

      res.json(entries);
    } catch (e) {
      const error = e as Error;
      console.error("Error fetching cashbook entries:", error);
      res.status(500).json({ error: "Failed to fetch cashbook entries" });
    }
  });

  app.post("/api/cashbook", async (req, res) => {
    try {
      const businessId = (req.headers["business-id"] as string) || "default-business";
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
      const [inserted] = await database.select().from(cashbook).where(eq(cashbook.id, newEntry.id)).limit(1);
      res.status(201).json(inserted);
    } catch (e) {
      const error = e as Error;
      console.error("Error creating cashbook entry:", error);
      res.status(500).json({ error: "Failed to create cashbook entry" });
    }
  });

  // ---------------- Settings ----------------
  app.get("/api/settings/:key", async (req, res) => {
    try {
      const { key } = req.params;
      const setting = await SettingsService.getSetting(key);
      if (setting === null) return res.status(404).json({ error: "Setting not found" });
      res.json({ value: setting });
    } catch (e) {
      const error = e as Error;
      console.error("Error fetching setting:", error);
      res.status(500).json({ error: "Failed to fetch setting" });
    }
  });

  app.get("/api/settings/category/:category", async (req, res) => {
    try {
      const { category } = req.params;
      const settings = await SettingsService.getSettingsByCategory(category);
      res.json(settings);
    } catch (e) {
      const error = e as Error;
      console.error("Error fetching settings:", error);
      res.status(500).json({ error: "Failed to fetch settings" });
    }
  });

  app.put("/api/settings/:key", async (req, res) => {
    try {
      const { key } = req.params;
      const { value, type = "string", category = "general", description } = req.body;
      await SettingsService.setSetting(key, value, type, category, description);
      res.json({ success: true });
    } catch (e) {
      const error = e as Error;
      console.error("Error updating setting:", error);
      res.status(500).json({ error: "Failed to update setting" });
    }
  });

  app.delete("/api/settings/:key", async (req, res) => {
    try {
      const { key } = req.params;
      await SettingsService.deleteSetting(key);
      res.json({ success: true });
    } catch (e) {
      const error = e as Error;
      console.error("Error deleting setting:", error);
      res.status(500).json({ error: "Failed to delete setting" });
    }
  });

  // ---------------- GL: Accounts ----------------
  app.get("/api/gl/accounts", async (req, res) => {
    try {
      const businessId = (req.headers["business-id"] as string) || "default-business";
      const database = await db;
      const list = await database.select().from(glAccounts).where(eq(glAccounts.businessId, businessId));
      res.json(list);
    } catch (e) {
      const error = e as Error;
      console.error("Error fetching GL accounts:", error);
      res.status(500).json({ error: "Failed to fetch GL accounts" });
    }
  });

  app.post("/api/gl/accounts", async (req, res) => {
    try {
      const businessId = (req.headers["business-id"] as string) || "default-business";
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
        updatedAt: new Date()
      };

      await database.insert(glAccounts).values(record);
      const [inserted] = await database.select().from(glAccounts).where(eq(glAccounts.id, record.id)).limit(1);
      res.status(201).json(inserted);
    } catch (e) {
      const error = e as Error;
      console.error("Error creating GL account:", error);
      res.status(500).json({ error: "Failed to create GL account" });
    }
  });

  app.put("/api/gl/accounts/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const database = await db;

      const [current] = await database.select().from(glAccounts).where(eq(glAccounts.id, id)).limit(1);
      if (!current) return res.status(404).json({ error: "GL account not found" });

      if (current.systemFlag) {
        const allowed = {
          isActive: req.body.isActive ?? current.isActive,
          description: req.body.description ?? current.description,
          updatedAt: new Date()
        };
        await database.update(glAccounts).set(allowed).where(eq(glAccounts.id, id));
      } else {
        await database.update(glAccounts).set({ ...req.body, updatedAt: new Date() }).where(eq(glAccounts.id, id));
      }

      const [updated] = await database.select().from(glAccounts).where(eq(glAccounts.id, id)).limit(1);
      res.json(updated);
    } catch (e) {
      const error = e as Error;
      console.error("Error updating GL account:", error);
      res.status(500).json({ error: "Failed to update GL account" });
    }
  });

  // ---------------- GL: Journal ----------------
  app.get("/api/gl/journal", async (req, res) => {
    try {
      const businessId = (req.headers["business-id"] as string) || "default-business";
      const database = await db;
      const entries = await database.select().from(glJournalEntries).where(eq(glJournalEntries.businessId, businessId));
      res.json(entries);
    } catch (e) {
      const error = e as Error;
      console.error("Error fetching journal entries:", error);
      res.status(500).json({ error: "Failed to fetch journal entries" });
    }
  });

  app.post("/api/gl/journal", async (req, res) => {
    try {
      const database = await db;
      const businessId = (req.headers["business-id"] as string) || "default-business";
      const postedBy = (req.headers["user-id"] as string) || "system";

      const { entry, lines } = req.body as {
        entry: { entryDate: string; memo?: string; sourceModule: string; sourceId?: string };
        lines: Array<{ accountId: string; debit?: number; credit?: number; partyId?: string; itemId?: string; notes?: string }>;
      };

      if (!Array.isArray(lines) || lines.length < 2) {
        return res.status(400).json({ error: "At least two lines required" });
      }

      const acctIds = Array.from(new Set(lines.map((l) => l.accountId)));
      const acctList = await database.select().from(glAccounts);
      const needed = acctList.filter((a) => acctIds.includes(a.id) && a.businessId === businessId);

      if (needed.length !== acctIds.length) return res.status(400).json({ error: "One or more GL accounts not found" });
      if (needed.some((a) => a.isLeaf === false || a.isActive === false)) {
        return res.status(400).json({ error: "Posting allowed to active leaf accounts only" });
      }

      const totalDebit = lines.reduce((s, l) => s + Number(l.debit || 0), 0);
      const totalCredit = lines.reduce((s, l) => s + Number(l.credit || 0), 0);
      if (Number(totalDebit.toFixed(2)) !== Number(totalCredit.toFixed(2))) {
        return res.status(400).json({ error: "Journal not balanced" });
      }

      const entryId = randomUUID();
      const now = new Date();

      await database.insert(glJournalEntries).values({
        id: entryId,
        businessId,
        entryDate: new Date(entry.entryDate),
        memo: entry.memo,
        sourceModule: entry.sourceModule,
        sourceId: entry.sourceId,
        postedBy,
        postedAt: now,
        createdAt: now,
        locked: false
      });

      for (const l of lines) {
        await database.insert(glJournalLines).values({
          id: randomUUID(),
          entryId,
          businessId,
          accountId: l.accountId,
          debit: (l.debit ?? 0).toString(),
          credit: (l.credit ?? 0).toString(),
          partyId: l.partyId,
          itemId: l.itemId,
          notes: l.notes
        });
      }

      const [created] = await database.select().from(glJournalEntries).where(eq(glJournalEntries.id, entryId)).limit(1);
      res.status(201).json(created);
    } catch (e) {
      const error = e as Error;
      console.error("Error creating journal entry:", error);
      res.status(500).json({ error: "Failed to create journal entry" });
    }
  });

  // ---------------- Reports: Trial Balance ----------------
  app.get("/api/reports/trial-balance", async (req: Request, res: Response) => {
    try {
      const businessId = (req.headers["business-id"] as string) || "default-business";
      const asOfDate = (req.query.asOfDate as string) || new Date().toISOString().split("T")[0];
      const database = await db;

      const acctRows = await database
        .select()
        .from(glAccounts)
        .where(and(eq(glAccounts.businessId, businessId), eq(glAccounts.isActive, true), eq(glAccounts.isLeaf, true)));

      const items: Array<{
        accountId: string;
        accountCode: string;
        accountName: string;
        accountType: string;
        debitBalance: number;
        creditBalance: number;
      }> = [];

      let totalDebits = 0;
      let totalCredits = 0;

      for (const account of acctRows) {
        const lines = await database
          .select()
          .from(glJournalLines)
          .innerJoin(glJournalEntries, eq(glJournalLines.entryId, glJournalEntries.id))
          .where(
            and(
              eq(glJournalLines.businessId, businessId),
              eq(glJournalLines.accountId, account.id),
              sql`DATE(${glJournalEntries.entryDate}) <= ${asOfDate}`
            )
          );

        const totalDebit = lines.reduce((s, r) => s + parseFloat(r.gl_journal_lines.debit || "0"), 0);
        const totalCredit = lines.reduce((s, r) => s + parseFloat(r.gl_journal_lines.credit || "0"), 0);
        const net = totalDebit - totalCredit;

        let debitBalance = 0;
        let creditBalance = 0;

        if (["asset", "expense"].includes(account.type)) {
          if (net > 0) {
            debitBalance = net;
            totalDebits += net;
          } else if (net < 0) {
            creditBalance = Math.abs(net);
            totalCredits += Math.abs(net);
          }
        } else {
          if (net < 0) {
            creditBalance = Math.abs(net);
            totalCredits += Math.abs(net);
          } else if (net > 0) {
            debitBalance = net;
            totalDebits += net;
          }
        }

        if (debitBalance > 0 || creditBalance > 0) {
          items.push({
            accountId: account.id,
            accountCode: account.code,
            accountName: account.name,
            accountType: account.type,
            debitBalance: Math.round(debitBalance * 100) / 100,
            creditBalance: Math.round(creditBalance * 100) / 100
          });
        }
      }

      items.sort((a, b) => a.accountCode.localeCompare(b.accountCode));
      const isBalanced = Math.abs(totalDebits - totalCredits) < 0.01;

      res.json({
        items,
        totalDebits: Math.round(totalDebits * 100) / 100,
        totalCredits: Math.round(totalCredits * 100) / 100,
        isBalanced,
        asOfDate
      });
    } catch (e) {
      const error = e as Error;
      console.error("Error generating trial balance:", error);
      res.status(500).json({ error: "Failed to generate trial balance" });
    }
  });

  // ---------------- Invoices ----------------
  app.post("/api/invoices", async (req, res) => {
    try {
      const {
        businessId,
        userId,
        invoiceType,
        selectedAccount,
        issueDate,
        dueDate,
        invoiceItems,
        additionalCharges,
        discount,
        notes,
        vatRate
      } = req.body;

      if (!businessId || !userId) {
        return res.status(400).json({ error: "businessId and userId are required" });
      }

      const database = await db;
      const invoiceId = randomUUID();
      const invoiceNumber = `INV-${Date.now()}`;

      const subtotal = (invoiceItems as Array<{ total: number }>).reduce((sum, item) => sum + item.total, 0);
      const vatAmount = (subtotal + Number(additionalCharges || 0)) * Number(vatRate || 0);
      const total = subtotal + Number(additionalCharges || 0) + vatAmount - Number(discount || 0);

      await database.insert(invoices).values({
        id: invoiceId,
        businessId,
        number: invoiceNumber,
        kind: invoiceType,
        accountId: selectedAccount,
        issueDate: new Date(issueDate),
        dueDate: dueDate ? new Date(dueDate) : null,
        subtotal: subtotal.toString(),
        addlCharges: Number(additionalCharges || 0).toString(),
        discount: Number(discount || 0).toString(),
        total: total.toString(),
        //notes, // ensure this column exists in your schema; remove if not
        status: "draft",
        //createdAt: new Date()
      });

      for (const item of invoiceItems as Array<any>) {
+   await database.insert(invoiceItemsTable).values({
          id: randomUUID(),
          invoiceId,
          itemId: item.itemId,
          qty: Number(item.quantity).toString(),
          rate: Number(item.rate).toString(),
          discountPct: Number(item.discount || 0).toString(),
          total: Number(item.total).toString()
        });
      }

      res.json({ invoiceId, invoiceNumber });
    } catch (e) {
      const error = e as Error;
      console.error("Error saving invoice:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/invoices/:id/post", async (req, res) => {
    try {
      const invoiceId = req.params.id;
      const { businessId, userId } = req.body;

      if (!businessId || !userId) {
        return res.status(400).json({ error: "businessId and userId are required" });
      }

      const result = await postInvoiceWithJournal({ invoiceId, businessId, userId });
      res.json(result);
    } catch (e) {
      const error = e as Error;
      console.error("Invoice posting error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // ---------------- Categories ----------------
  app.get("/api/categories", async (_req, res) => {
    try {
      const database = await db;
      const rows = await database.select().from(categories);
      res.json(rows);
    } catch (e) {
      const error = e as Error;
      console.error("Error fetching categories:", error);
      res.status(500).json({ error: "Failed to fetch categories" });
    }
  });

  app.post("/api/categories", async (req, res) => {
    try {
      const database = await db;
      const row = { ...req.body, id: randomUUID() };
      await database.insert(categories).values(row);
      const [inserted] = await database.select().from(categories).where(eq(categories.id, row.id)).limit(1);
      res.json(inserted);
    } catch (e) {
      const error = e as Error;
      console.error("Error creating category:", error);
      res.status(500).json({ error: "Failed to create category" });
    }
  });

  // ---------- finally create and return HTTP server ----------
  const httpServer = createServer(app);
  return httpServer;
}
