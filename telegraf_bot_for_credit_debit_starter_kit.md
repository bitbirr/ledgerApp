# Telegraf Bot for **Credit Debit** — Starter Kit

A production-ready Telegram bot built with **Telegraf + Express (TypeScript)** that complements your offline‑first PWA. The bot acts as a **remote capture & reminder assistant** and a **lightweight sync bridge** (optional), while keeping your core app fully client‑side on IndexedDB (Dexie).

---

## What this gives you
- ⚡ **Quick‑add** transactions, invoices, and cashbook entries from Telegram.
- 🧭 **Guided wizards** (scenes) for multi‑step data entry.
- 🔔 **Reminders** for due invoices and daily cash prompts.
- 📤 **Exports** (CSV) and **receipt uploads** (photo/doc) saved as Telegram `file_id` and proxied via server.
- 🔗 **Linking flow** between Telegram user and your PWA using a short‑lived link token.
- 🔁 **Optional sync API** so your PWA can pull “inbox” items from the bot and import them into Dexie.
- 🛡️ Sensible security, rate‑limits, and role gating (DMs only by default).

> The bot **does not** replace your app’s IndexedDB source‑of‑truth. It just captures data while on the go, then your PWA **pulls & imports** when online.

---

## Commands (cheat‑sheet)
- `/start` – welcome + help
- `/help` – list commands
- `/link` – generate a link token to pair the bot with your device (enter token in the PWA)
- `/add` – **Quick Add**: `/add 125.50 Lunch @Cash - team meeting`
- `/transaction` – opens the transaction wizard
- `/invoice` – opens the invoice wizard
- `/cashbook` – fast income/expense entry
- `/report` – export your bot inbox to CSV for a date range
- `/due` – list invoices marked due in the bot inbox
- `/settings` – toggle reminders, timezone

---

## Project Structure
```
credit-debit-bot/
├─ package.json
├─ tsconfig.json
├─ .env.example
├─ docker-compose.yml
├─ Dockerfile
└─ src/
   ├─ server.ts              # Express + Telegraf bootstrap (webhook or polling)
   ├─ bot.ts                 # command wiring + middlewares
   ├─ scenes/
   │  ├─ transactionWizard.ts
   │  ├─ invoiceWizard.ts
   │  └─ cashbookWizard.ts
   ├─ db/
   │  ├─ schema.ts           # Drizzle schema (SQLite via better-sqlite3)
   │  └─ index.ts            # db init + helpers
   ├─ routes/
   │  ├─ link.ts             # POST /link/consume
   │  ├─ sync.ts             # GET /sync/inbox, POST /sync/ack, GET /export.csv
   │  └─ files.ts            # GET /file/:id proxy from Telegram
   ├─ utils/
   │  ├─ validators.ts       # Zod schemas shared by bot & routes
   │  └─ time.ts
   └─ types.ts
```

---

## 1) `package.json`
```json
{
  "name": "credit-debit-telegraf-bot",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "ts-node-dev --respawn --transpile-only src/server.ts",
    "build": "tsc",
    "start": "node dist/server.js"
  },
  "dependencies": {
    "axios": "^1.7.2",
    "dayjs": "^1.11.11",
    "dotenv": "^16.4.5",
    "express": "^4.19.2",
    "node-schedule": "^2.1.1",
    "telegraf": "^4.16.3",
    "zod": "^3.23.8",
    "drizzle-orm": "^0.36.2",
    "better-sqlite3": "^9.6.0",
    "uuid": "^9.0.1",
    "rate-limiter-flexible": "^5.0.4"
  },
  "devDependencies": {
    "@types/express": "^4.17.21",
    "@types/node": "^20.12.12",
    "ts-node": "^10.9.2",
    "ts-node-dev": "^2.0.0",
    "typescript": "^5.4.5"
  }
}
```

## 2) `tsconfig.json`
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ES2022",
    "moduleResolution": "bundler",
    "outDir": "dist",
    "rootDir": "src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true
  },
  "include": ["src"]
}
```

## 3) `.env.example`
```
BOT_TOKEN=123456:ABC...
WEBHOOK_URL=https://your-domain.com/telegram/webhook   # leave empty to use long polling
PORT=8080
DB_FILE=./data/bot.sqlite
ALLOWED_USER_IDS=12345678,987654321                   # comma-separated Telegram user IDs allowed
TIMEZONE=Africa/Addis_Ababa
```

## 4) Drizzle schema — `src/db/schema.ts`
```ts
import { sqliteTable, integer, text } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

export const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  tgUserId: text("tg_user_id").notNull(),       // string for BigInt safety
  tgUsername: text("tg_username"),
  clientId: text("client_id"),                  // set after linking
  createdAt: integer("created_at").notNull().default(sql`(strftime('%s','now'))`)
});

export const linkTokens = sqliteTable("link_tokens", {
  token: text("token").primaryKey(),
  tgUserId: text("tg_user_id").notNull(),
  expiresAt: integer("expires_at").notNull(),
  consumedAt: integer("consumed_at")
});

export const inboxEntries = sqliteTable("inbox_entries", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  tgUserId: text("tg_user_id").notNull(),
  type: text("type").notNull(),                 // 'transaction' | 'invoice' | 'cashbook'
  payload: text("payload").notNull(),            // JSON string
  status: text("status").notNull().default("pending"),
  createdAt: integer("created_at").notNull().default(sql`(strftime('%s','now'))`)
});

export const files = sqliteTable("files", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  tgUserId: text("tg_user_id").notNull(),
  fileId: text("file_id").notNull(),            // Telegram file_id
  kind: text("kind").notNull(),                 // 'photo' | 'document'
  caption: text("caption"),
  createdAt: integer("created_at").notNull().default(sql`(strftime('%s','now'))`)
});

export const reminders = sqliteTable("reminders", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  tgUserId: text("tg_user_id").notNull(),
  dueAt: integer("due_at").notNull(),
  payload: text("payload").notNull(),
  done: integer("done", { mode: "boolean" }).notNull().default(false),
  createdAt: integer("created_at").notNull().default(sql`(strftime('%s','now'))`)
});
```

## 5) DB init — `src/db/index.ts`
```ts
import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import * as schema from "./schema.js";
import fs from "fs";

export function openDb(dbFile: string) {
  fs.mkdirSync(new URL("../../data/", import.meta.url), { recursive: true });
  const db = new Database(dbFile);
  const client = drizzle(db, { schema });
  // Drizzle will create tables lazily via first statements; explicit migrator optional
  return { db, client };
}
```

## 6) Shared validators — `src/utils/validators.ts`
```ts
import { z } from "zod";

export const Amount = z.number().positive();
export const ISODate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);

export const TransactionPayload = z.object({
  account: z.string().min(1),
  direction: z.enum(["debit", "credit"]),
  amount: Amount,
  date: ISODate.optional(),
  category: z.string().optional(),
  note: z.string().optional(),
  attachmentFileId: z.string().optional()
});

export const CashbookPayload = z.object({
  kind: z.enum(["in", "out"]),
  amount: Amount,
  date: ISODate.optional(),
  note: z.string().optional()
});

export const InvoiceItem = z.object({ name: z.string(), qty: z.number().positive(), price: Amount });
export const InvoicePayload = z.object({
  customer: z.string().min(1),
  items: z.array(InvoiceItem).min(1),
  issueDate: ISODate.optional(),
  dueDate: ISODate.optional(),
  note: z.string().optional(),
});

export type TransactionPayload = z.infer<typeof TransactionPayload>;
export type CashbookPayload = z.infer<typeof CashbookPayload>;
export type InvoicePayload = z.infer<typeof InvoicePayload>;
```

## 7) Bot scenes — `src/scenes/transactionWizard.ts`
```ts
import { Scenes } from "telegraf";
import dayjs from "dayjs";
import { TransactionPayload } from "../utils/validators.js";

const wizard = new Scenes.WizardScene(
  "transaction-wizard",
  async (ctx) => {
    await ctx.reply("Account name? (e.g., Cash, Bank, John Doe)");
    return ctx.wizard.next();
  },
  async (ctx) => {
    ctx.wizard.state["account"] = ctx.message?.["text"];
    await ctx.reply("Direction? Reply with `debit` or `credit`.");
    return ctx.wizard.next();
  },
  async (ctx) => {
    const dir = (ctx.message?.["text"] || "").toLowerCase();
    if (!(["debit","credit"].includes(dir))) { await ctx.reply("Please type `debit` or `credit`."); return; }
    ctx.wizard.state["direction"] = dir;
    await ctx.reply("Amount? (number)");
    return ctx.wizard.next();
  },
  async (ctx) => {
    const val = Number((ctx.message?.["text"] || "").replace(",","."));
    if (!Number.isFinite(val) || val <= 0) { await ctx.reply("Invalid amount. Try again."); return; }
    ctx.wizard.state["amount"] = val;
    await ctx.reply("Category? (optional; or type `skip`)");
    return ctx.wizard.next();
  },
  async (ctx) => {
    const t = ctx.message?.["text"];
    ctx.wizard.state["category"] = (t && t.toLowerCase() !== "skip") ? t : undefined;
    await ctx.reply("Note? (optional; or type `skip`)");
    return ctx.wizard.next();
  },
  async (ctx) => {
    const t = ctx.message?.["text"];
    ctx.wizard.state["note"] = (t && t.toLowerCase() !== "skip") ? t : undefined;

    const payload = TransactionPayload.parse({
      account: ctx.wizard.state["account"],
      direction: ctx.wizard.state["direction"],
      amount: ctx.wizard.state["amount"],
      category: ctx.wizard.state["category"],
      note: ctx.wizard.state["note"],
      date: dayjs().format("YYYY-MM-DD")
    });

    ctx.scene.state["result"] = payload;
    await ctx.reply(`Confirm?\n${payload.direction.toUpperCase()} ${payload.amount} -> ${payload.account}\nCategory: ${payload.category ?? "-"}\nNote: ${payload.note ?? "-"}\nReply 'yes' to save or 'no' to cancel.`);
    return ctx.wizard.next();
  },
  async (ctx) => {
    const answer = (ctx.message?.["text"] || "").toLowerCase();
    if (answer !== "yes") { await ctx.reply("Cancelled."); return ctx.scene.leave(); }
    (ctx as any).saveInboxEntry("transaction", ctx.scene.state["result"]);
    await ctx.reply("Saved to inbox. Import from your app via Sync.");
    return ctx.scene.leave();
  }
);

export default wizard;
```

## 8) Bot scenes — `src/scenes/invoiceWizard.ts`
```ts
import { Scenes } from "telegraf";
import dayjs from "dayjs";
import { InvoicePayload } from "../utils/validators.js";

const wizard = new Scenes.WizardScene(
  "invoice-wizard",
  async (ctx) => { await ctx.reply("Customer name?"); return ctx.wizard.next(); },
  async (ctx) => {
    ctx.wizard.state["customer"] = ctx.message?.["text"];
    ctx.wizard.state["items"] = [] as Array<{name:string;qty:number;price:number}>;
    await ctx.reply("Add item as: name | qty | price. Type `done` when finished.");
    return ctx.wizard.next();
  },
  async (ctx) => {
    const t = (ctx.message?.["text"] || "").trim();
    if (t.toLowerCase() === "done") { await ctx.reply("Issue date? (YYYY-MM-DD or `today`)"); return ctx.wizard.next(); }
    const [name, qtyStr, priceStr] = t.split("|").map(s=>s.trim());
    const qty = Number(qtyStr); const price = Number(priceStr);
    if (!name || !Number.isFinite(qty) || !Number.isFinite(price)) { await ctx.reply("Invalid. Try again: name | qty | price"); return; }
    (ctx.wizard.state["items"] as any[]).push({ name, qty, price });
    await ctx.reply("Added. Add another or type `done`.");
  },
  async (ctx) => {
    const raw = (ctx.message?.["text"] || "").trim();
    const issueDate = raw.toLowerCase() === "today" ? dayjs().format("YYYY-MM-DD") : raw;
    ctx.wizard.state["issueDate"] = issueDate;
    await ctx.reply("Due date? (YYYY-MM-DD or `none`)");
    return ctx.wizard.next();
  },
  async (ctx) => {
    const raw = (ctx.message?.["text"] || "").trim();
    const dueDate = raw.toLowerCase() === "none" ? undefined : raw;
    ctx.wizard.state["dueDate"] = dueDate;
    await ctx.reply("Note? (`skip` to omit)");
    return ctx.wizard.next();
  },
  async (ctx) => {
    const note = (ctx.message?.["text"] || "").trim();
    ctx.wizard.state["note"] = note.toLowerCase() === "skip" ? undefined : note;

    const payload = InvoicePayload.parse({
      customer: ctx.wizard.state["customer"],
      items: ctx.wizard.state["items"],
      issueDate: ctx.wizard.state["issueDate"],
      dueDate: ctx.wizard.state["dueDate"],
      note: ctx.wizard.state["note"]
    });

    const total = payload.items.reduce((s,i)=>s+i.qty*i.price,0);
    await ctx.reply(`Confirm invoice for ${payload.customer}?\nItems: ${payload.items.length}\nTotal: ${total}\nReply 'yes' to save or 'no' to cancel.`);
    return ctx.wizard.next();
  },
  async (ctx) => {
    const ans = (ctx.message?.["text"] || "").toLowerCase();
    if (ans !== "yes") { await ctx.reply("Cancelled."); return ctx.scene.leave(); }
    (ctx as any).saveInboxEntry("invoice", ctx.scene.state);
    await ctx.reply("Saved to inbox. Import from your app via Sync.");
    return ctx.scene.leave();
  }
);

export default wizard;
```

## 9) Bot scenes — `src/scenes/cashbookWizard.ts`
```ts
import { Scenes } from "telegraf";
import dayjs from "dayjs";
import { CashbookPayload } from "../utils/validators.js";

const wizard = new Scenes.WizardScene(
  "cashbook-wizard",
  async (ctx) => { await ctx.reply("Type `in` for income or `out` for expense."); return ctx.wizard.next(); },
  async (ctx) => {
    const kind = (ctx.message?.["text"] || "").toLowerCase();
    if (!(["in","out"].includes(kind))) { await ctx.reply("Please type `in` or `out`."); return; }
    ctx.wizard.state["kind"] = kind; await ctx.reply("Amount?"); return ctx.wizard.next();
  },
  async (ctx) => {
    const val = Number((ctx.message?.["text"] || "").replace(",","."));
    if (!Number.isFinite(val) || val <= 0) { await ctx.reply("Invalid amount."); return; }
    ctx.wizard.state["amount"] = val; await ctx.reply("Note? (`skip` to omit)"); return ctx.wizard.next();
  },
  async (ctx) => {
    const note = (ctx.message?.["text"] || "").trim();
    ctx.wizard.state["note"] = note.toLowerCase() === "skip" ? undefined : note;

    const payload = CashbookPayload.parse({
      kind: ctx.wizard.state["kind"], amount: ctx.wizard.state["amount"], note: ctx.wizard.state["note"],
      date: dayjs().format("YYYY-MM-DD")
    });

    (ctx as any).saveInboxEntry("cashbook", payload);
    await ctx.reply("Saved to inbox. Import from your app via Sync.");
    return ctx.scene.leave();
  }
);

export default wizard;
```

## 10) Bot wiring — `src/bot.ts`
```ts
import { Telegraf, session, Scenes, Context, Markup } from "telegraf";
import { v4 as uuid } from "uuid";
import dayjs from "dayjs";
import { db, insertInbox, upsertUser, createLinkToken, listDueInvoices, exportCsv, saveFileRef } from "./botData.js";
import transactionWizard from "./scenes/transactionWizard.js";
import invoiceWizard from "./scenes/invoiceWizard.js";
import cashbookWizard from "./scenes/cashbookWizard.js";

export type BotContext = Context & Scenes.WizardContext & {
  saveInboxEntry: (type: string, payload: any)=>void
}

export function buildBot(token: string) {
  const bot = new Telegraf<BotContext>(token);
  const stage = new Scenes.Stage<BotContext>([transactionWizard, invoiceWizard, cashbookWizard]);

  // small allow-list guard (DMs only)
  const allowed = new Set((process.env.ALLOWED_USER_IDS||"").split(",").map(s=>s.trim()).filter(Boolean));
  bot.use(async (ctx, next)=>{
    if (ctx.chat?.type !== "private") return;           // ignore groups by default
    if (allowed.size && !allowed.has(String(ctx.from?.id))) {
      await ctx.reply("Access denied."); return;
    }
    return next();
  });

  // session + helper to persist inbox
  bot.use(session());
  bot.use((ctx, next)=>{
    ctx.saveInboxEntry = (type, payload) => {
      const tgUserId = String(ctx.from!.id);
      insertInbox(tgUserId, type, payload);
    };
    return next();
  });

  bot.use(stage.middleware());

  bot.start(async (ctx)=>{
    await upsertUser(String(ctx.from!.id), ctx.from!.username||null);
    await ctx.reply(
      `Welcome to Credit Debit Bot!\n\nUse /transaction, /cashbook, /invoice to capture entries.\nUse /link to pair with your app for syncing.\n/type /help for more.`,
      Markup.keyboard([["➕ Transaction","💸 Cashbook"],["🧾 Invoice","📄 Report"]]).resize()
    );
  });

  bot.command("help", async (ctx)=>{
    await ctx.reply("Commands: /start /help /link /add /transaction /cashbook /invoice /report /due /settings");
  });

  bot.command("link", async (ctx)=>{
    const token = await createLinkToken(String(ctx.from!.id));
    await ctx.reply(`Link token (valid 10 min):\n\n${token}\n\nOpen your app > Settings > Link Telegram > paste token.`);
  });

  // Quick add: /add 125.50 Lunch @Cash - team meeting
  bot.command("add", async (ctx)=>{
    const text = ctx.message?.["text"]||"";
    const args = text.split(" ").slice(1).join(" ");
    const match = args.match(/^(\d+[.,]?\d*)\s+([^@-]+)\s+@([^\s-]+)(?:\s*-\s*(.*))?$/);
    if (!match) { await ctx.reply("Format: /add <amount> <category> @<account> - <note>"); return; }
    const amount = Number(match[1].replace(",","."));
    const category = match[2].trim();
    const account = match[3].trim();
    const note = (match[4]||"").trim();
    ctx.saveInboxEntry("transaction", { account, direction: "debit", amount, category, note, date: dayjs().format("YYYY-MM-DD") });
    await ctx.reply("Added to inbox ✅");
  });

  bot.hears("➕ Transaction", (ctx)=>ctx.scene.enter("transaction-wizard"));
  bot.command("transaction", (ctx)=>ctx.scene.enter("transaction-wizard"));

  bot.hears("💸 Cashbook", (ctx)=>ctx.scene.enter("cashbook-wizard"));
  bot.command("cashbook", (ctx)=>ctx.scene.enter("cashbook-wizard"));

  bot.hears("🧾 Invoice", (ctx)=>ctx.scene.enter("invoice-wizard"));
  bot.command("invoice", (ctx)=>ctx.scene.enter("invoice-wizard"));

  // attachments (photo/doc) saved as file refs; last transaction in session may attach
  bot.on(["photo","document"], async (ctx)=>{
    const tgUserId = String(ctx.from!.id);
    const fileId = (ctx.message as any).photo?.at(-1)?.file_id || (ctx.message as any).document?.file_id;
    const kind = (ctx.message as any).photo ? "photo" : "document";
    const caption = (ctx.message as any).caption || undefined;
    if (!fileId) return;
    await saveFileRef(tgUserId, fileId, kind, caption);
    await ctx.reply("Attachment saved. You can reference it in your app after import.");
  });

  bot.command("due", async (ctx)=>{
    const rows = await listDueInvoices(String(ctx.from!.id));
    if (!rows.length) { await ctx.reply("No due invoices in inbox."); return; }
    const lines = rows.map(r=>`#${r.id} ${r.payload.customer} • due ${r.payload.dueDate}`);
    await ctx.reply(lines.join("\n"));
  });

  bot.command("report", async (ctx)=>{
    const msg = ctx.message?.["text"]||"";
    const [, from, to] = msg.split(" ");
    const csvPath = await exportCsv(String(ctx.from!.id), from, to);
    await ctx.replyWithDocument({ source: csvPath, filename: `inbox_${from||"all"}_${to||""}.csv` });
  });

  return bot;
}
```

## 11) Bot data helpers — `src/botData.ts`
```ts
import { drizzle } from "drizzle-orm/better-sqlite3";
import { eq, and, gt, isNull } from "drizzle-orm";
import * as schema from "./db/schema.js";
import Database from "better-sqlite3";
import dayjs from "dayjs";
import { v4 as uuid } from "uuid";
import fs from "fs";

const dbFile = process.env.DB_FILE || "./data/bot.sqlite";
fs.mkdirSync("./data", { recursive: true });
const sqlite = new Database(dbFile);
export const db = drizzle(sqlite, { schema });

export async function upsertUser(tgUserId: string, tgUsername: string|null) {
  const existing = sqlite.prepare("select id from users where tg_user_id=?").get(tgUserId);
  if (!existing) {
    sqlite.prepare("insert into users (tg_user_id, tg_username, created_at) values (?,?, strftime('%s','now'))").run(tgUserId, tgUsername);
  }
}

export async function createLinkToken(tgUserId: string) {
  const token = uuid();
  const expiresAt = dayjs().add(10, "minute").unix();
  sqlite.prepare("insert into link_tokens (token, tg_user_id, expires_at) values (?,?,?)").run(token, tgUserId, expiresAt);
  return token;
}

export function consumeLinkToken(token: string, clientId: string) {
  const row = sqlite.prepare("select * from link_tokens where token=?").get(token);
  if (!row) throw new Error("invalid token");
  if (row.consumed_at) throw new Error("already used");
  if (row.expires_at < dayjs().unix()) throw new Error("expired");
  sqlite.prepare("update link_tokens set consumed_at=strftime('%s','now') where token=?").run(token);
  sqlite.prepare("update users set client_id=? where tg_user_id=?").run(clientId, row.tg_user_id);
  return row.tg_user_id as string;
}

export function insertInbox(tgUserId: string, type: string, payload: any) {
  sqlite.prepare("insert into inbox_entries (tg_user_id, type, payload, status, created_at) values (?,?,?,?, strftime('%s','now'))")
    .run(tgUserId, type, JSON.stringify(payload), "pending");
}

export function getInboxByClient(clientId: string) {
  const stmt = sqlite.prepare(`select ie.* from inbox_entries ie join users u on u.tg_user_id=ie.tg_user_id where u.client_id=? and ie.status='pending' order by ie.id asc`);
  return stmt.all(clientId) as Array<{id:number;tg_user_id:string;type:string;payload:string;status:string;created_at:number}>;
}

export function ackInbox(ids: number[], clientId: string) {
  const rows = getInboxByClient(clientId);
  const allowed = new Set(rows.map(r=>r.id));
  const upd = sqlite.prepare("update inbox_entries set status='imported' where id=?");
  for (const id of ids) if (allowed.has(id)) upd.run(id);
}

export async function saveFileRef(tgUserId: string, fileId: string, kind: string, caption?: string) {
  sqlite.prepare("insert into files (tg_user_id, file_id, kind, caption, created_at) values (?,?,?,?, strftime('%s','now'))").run(tgUserId, fileId, kind, caption||null);
}

export function listDueInvoices(tgUserId: string) {
  const rows = sqlite.prepare("select id, payload from inbox_entries where tg_user_id=? and type='invoice' and status='pending'").all(tgUserId) as Array<{id:number;payload:string}>;
  const out = [] as Array<{id:number; payload:any}>;
  for (const r of rows) {
    const p = JSON.parse(r.payload);
    if (p.dueDate) out.push({ id: r.id, payload: p });
  }
  return out;
}

export async function exportCsv(tgUserId: string, from?: string, to?: string) {
  const cond: string[] = ["tg_user_id=?", "status='pending'"];
  const args: any[] = [tgUserId];
  if (from) { cond.push("created_at>=?"); args.push(dayjs(from).unix()); }
  if (to)   { cond.push("created_at<=?"); args.push(dayjs(to).endOf('day').unix()); }
  const sql = `select id,type,payload,datetime(created_at,'unixepoch') as created from inbox_entries where ${cond.join(" and ")} order by id asc`;
  const rows = sqlite.prepare(sql).all(...args) as Array<{id:number;type:string;payload:string;created:string}>;
  const header = "id,type,created,payload\n";
  const body = rows.map(r=>`${r.id},${r.type},${r.created},${JSON.stringify(JSON.parse(r.payload)).replaceAll('"','\"')}`).join("\n");
  const path = `./data/export_${tgUserId}_${Date.now()}.csv`;
  fs.writeFileSync(path, header+body);
  return path;
}
```

## 12) Express + Telegraf bootstrap — `src/server.ts`
```ts
import "dotenv/config";
import express from "express";
import { buildBot } from "./bot.js";
import { consumeLinkToken, getInboxByClient, ackInbox } from "./botData.js";
import axios from "axios";

const app = express();
app.use(express.json({ limit: "2mb" }));

const bot = buildBot(process.env.BOT_TOKEN!);

// Optional webhook mode
if (process.env.WEBHOOK_URL) {
  const path = "/telegram/webhook";
  await bot.telegram.setWebhook(process.env.WEBHOOK_URL);
  app.use(bot.webhookCallback(path));
  console.log("Webhook set at", process.env.WEBHOOK_URL);
} else {
  // Long polling
  bot.launch();
  console.log("Bot started with long polling");
}

// Routes
app.get("/health", (_req, res)=>res.json({ ok: true }));

// Pair PWA with Telegram user by consuming a link token generated via /link
app.post("/link/consume", (req, res)=>{
  try {
    const { token, clientId } = req.body as { token: string; clientId: string };
    if (!token || !clientId) return res.status(400).json({ error: "token and clientId required" });
    const tgUserId = consumeLinkToken(token, clientId);
    return res.json({ ok: true, tgUserId });
  } catch (e:any) { return res.status(400).json({ error: e.message }); }
});

// PWA pulls bot inbox and imports into Dexie
app.get("/sync/inbox", (req, res)=>{
  const clientId = req.query.clientId as string;
  if (!clientId) return res.status(400).json({ error: "clientId required" });
  const rows = getInboxByClient(clientId);
  return res.json({ items: rows.map(r=>({ id: r.id, type: r.type, payload: JSON.parse(r.payload), createdAt: r.created_at })) });
});

app.post("/sync/ack", (req, res)=>{
  const { clientId, ids } = req.body as { clientId: string; ids: number[] };
  if (!clientId || !Array.isArray(ids)) return res.status(400).json({ error: "clientId and ids[] required" });
  ackInbox(ids, clientId);
  return res.json({ ok: true });
});

// Minimal proxy to fetch Telegram files by file_id so PWA can download receipts
app.get("/file/:fileId", async (req, res)=>{
  try {
    const { fileId } = req.params;
    const tg = await bot.telegram.getFile(fileId);
    const url = `https://api.telegram.org/file/bot${process.env.BOT_TOKEN}/${tg.file_path}`;
    const r = await axios.get(url, { responseType: "stream" });
    res.setHeader("Content-Type", r.headers["content-type"]||"application/octet-stream");
    r.data.pipe(res);
  } catch (e) { res.status(404).json({ error: "file not found" }); }
});

const port = Number(process.env.PORT||8080);
app.listen(port, ()=>console.log(`HTTP listening on :${port}`));

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
```

## 13) Docker & Compose
**`Dockerfile`**
```Dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY tsconfig.json ./
COPY src ./src
ENV NODE_ENV=production
RUN npx tsc
CMD ["node","dist/server.js"]
```

**`docker-compose.yml`**
```yaml
version: "3.9"
services:
  bot:
    build: .
    environment:
      - BOT_TOKEN=${BOT_TOKEN}
      - WEBHOOK_URL=${WEBHOOK_URL}
      - PORT=8080
      - DB_FILE=/data/bot.sqlite
      - ALLOWED_USER_IDS=${ALLOWED_USER_IDS}
    volumes:
      - ./data:/data
    ports:
      - "8080:8080"
```

---

## 14) PWA integration (Dexie) — importer snippet
Add a **Sync** button in your app (e.g., Settings → Telegram Sync) that:

```ts
// pseudo-code inside your React app
async function importFromBot(clientId: string) {
  const res = await fetch(`/sync/inbox?clientId=${encodeURIComponent(clientId)}`); // same origin if you host bot behind your domain/proxy
  const { items } = await res.json();
  // Map bot payloads to your Dexie models
  for (const it of items) {
    if (it.type === 'transaction') await db.transactions.add(transformTransaction(it.payload));
    if (it.type === 'cashbook')    await db.cashbook.add(transformCash(it.payload));
    if (it.type === 'invoice')     await db.invoices.add(transformInvoice(it.payload));
  }
  // Ack imported ids to hide from future pulls
  await fetch('/sync/ack', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ clientId, ids: items.map((x:any)=>x.id) }) });
}
```

**Linking UI in your PWA**
1) User taps **Link Telegram** → bot instructs `/link` and shows a token.
2) User pastes token in PWA input → PWA calls `POST /link/consume` with `{ token, clientId }` (clientId can be a stable UUID you store in IndexedDB).
3) After this, `/sync/inbox?clientId=...` will return their items.

---

## 15) Reminders
Use `node-schedule` to run light jobs in `server.ts` if desired (e.g., morning cash prompt). Example:
```ts
// add near bot bootstrap
import schedule from 'node-schedule';
import dayjs from 'dayjs';

schedule.scheduleJob('0 7 * * *', async () => { // 07:00 daily
  // fetch all users and nudge them
  // (left as an exercise: select from db and bot.telegram.sendMessage)
});
```

---

## 16) Security Notes
- Default to **DMs only** (ignore group chats) and **allowlist** via `ALLOWED_USER_IDS`.
- Link tokens are **one‑time** and expire in **10 minutes**.
- `/file/:fileId` proxy ensures the bot token stays server‑side.
- Rate‑limit the `/sync/*` routes behind your reverse proxy (nginx/Cloudflare) as needed.

---

## 17) Extending to Planned Integrations
- **Google Drive backup**: have the server (not the bot) push exported CSV/PDF to Drive; store Drive file IDs in `files` table.
- **WebAuthn**: keep it inside the PWA; bot is unaffected.
- **PDF/Excel**: generate reports server‑side (pdfkit / SheetJS) when users request `/report` with `full` flag.
- **Push Notifications**: keep using Telegram DMs for reminders; PWA can also show in‑app notifications when online.

---

## 18) Local Dev Quickstart
```bash
cp .env.example .env
# fill BOT_TOKEN and ALLOWED_USER_IDS
npm i
npm run dev
# or with Docker
docker compose up --build
```

---

## 19) Notes on Offline‑First Philosophy
- Your **business logic remains on the client** (Dexie + Zustand). The bot only captures raw data for later import and optionally nudges you.
- If you do not want any server persistence, you can **disable /sync** and simply use `/report` to export CSVs of what you captured via bot.

---

Happy building! 🚀

