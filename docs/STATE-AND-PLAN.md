# Credit Debit Ledger - State, Objectives, Architecture, and Milestone Plan

This document summarizes the current state, objectives, constraints, refined architecture, risks, and the milestone plan for implementing a comprehensive double-entry ledger for small shops, aligned with Config C requirements.

References to code in this repository:
- Server routes: [`server.registerRoutes()`](server/routes.ts:9)
- Server posting service: [`posting.postCashbookWithJournal()`](server/services/posting.ts:58)
- Shared types and schemas: [`shared.schema.ts`](shared/schema.ts)
- Server Drizzle schema: [`server/db/schema.ts`](server/db/schema.ts)
- Migration: [`migrations/0001_add_gl.sql`](migrations/0001_add_gl.sql)
- Client Dexie hybrid: [`client/src/lib/db.ts`](client/src/lib/db.ts)
- Client MariaDB adapter: [`client/src/lib/dexie-mariadb-adapter.ts`](client/src/lib/dexie-mariadb-adapter.ts)
- Cashbook UI page: [`client/src/pages/CashBook.tsx`](client/src/pages/CashBook.tsx)
- Cash entry modal: [`client/src/components/modals/CashEntryModal.tsx`](client/src/components/modals/CashEntryModal.tsx)

---

## 1) Current state summary

- App is a PWA-first React + TypeScript frontend (Vite) with a minimal Express backend. IndexedDB (Dexie) is primary storage with optional MariaDB via REST. See [`Readme.md`](Readme.md).
- Single-entry models existed (Accounts, Transactions, Cashbook, Invoices, Items). Now extended with a General Ledger and Tax:
  - Chart of Accounts, Journal Entries, Journal Lines
  - Inventory Movements
  - Tax Rates and Tax Codes
  - Posting Rules
  - Opening Balances
  - Implemented via Zod in [`shared/schema.ts`](shared/schema.ts) and Drizzle in [`server/db/schema.ts`](server/db/schema.ts)
  - Database migration: [`migrations/0001_add_gl.sql`](migrations/0001_add_gl.sql)
- Endpoints added:
  - GL Accounts CRUD (GET/POST/PUT)
  - Journal (GET/POST) with balancing validation
  - Cashbook endpoints scoped by businessId
  - Posting endpoint: `/api/post/cashbook` that atomically inserts cashbook + balanced journal via [`postCashbookWithJournal()`](server/services/posting.ts:58)
  - Bootstrap route seeds default CoA and VAT 15% (`/api/bootstrap`)
- Client changes:
  - Dexie stores bumped to include GL/Tax entities in [`client/src/lib/db.ts`](client/src/lib/db.ts)
  - MariaDB adapter supports GL operations and bootstrap [`client/src/lib/dexie-mariadb-adapter.ts`](client/src/lib/dexie-mariadb-adapter.ts)
  - CashEntryModal requires selecting Cash/Bank and Offset GL accounts and optionally party; auto-bootstrap if no CoA; [`client/src/components/modals/CashEntryModal.tsx`](client/src/components/modals/CashEntryModal.tsx)
  - CashBook posts via `/api/post/cashbook` and computes summary locally [`client/src/pages/CashBook.tsx`](client/src/pages/CashBook.tsx)

What works end-to-end now:
- Seed default Chart of Accounts and VAT 15% per business (`/api/bootstrap`)
- Create cashbook entries that also post balanced GL journal lines

---

## 2) Objectives and constraints

Objectives (Config C):
- Multi-business, single currency ETB, VAT 15% exclusive, weighted-average inventory costing
- Double-entry GL with CoA, balanced journal postings for:
  - Cash In/Out with explicit offset account and optional party (AR/AP)
  - Sales and purchases (cash and credit) with VAT Output/Input and inventory COGS/Inventory
  - Debt insertion and repayment
  - Opening balances as of 2025-01-01 per business
- Reporting: Trial Balance, General Ledger, AR/AP Aging, Inventory Valuation, Income Statement, Balance Sheet, VAT Return
- Offline-first operation with eventual sync

Constraints:
- Offline-first IndexedDB must remain primary; server is optional but supported
- Keep schema and data flows deterministic, testable offline
- Small shop usability: simple UX, default CoA, minimal configuration

Ambiguities / Assumptions:
- Assumption: Single currency (ETB) only. No multi-currency.
- Assumption: VAT is 15% exclusive for both sales and purchases; all items taxable by default unless flagged later
- Assumption: Inventory costing method is weighted-average per business and per item
- Assumption: Periods are monthly and we will implement period locks but not mandatory closing entries
- Question: Do we need Bank Reconciliation (statement import)? Default: Not in this milestone.
- Question: Do we support multiple tax rates or exemptions now? Default: Single VAT 15% now; others later.

---

## 3) Remaining tasks, dependencies, acceptance criteria, and milestones

Remaining epics:
- Posting engine for documents (invoices/purchases/payments/opening balances) with VAT and inventory
- UI for Chart of Accounts manager and Journal viewer
- Reports (TB, GL, AR/AP Aging, Inventory Valuation, P&L, Balance Sheet, VAT Return)
- Periods & Locks
- Migration tools (opening balances and historical import)
- Tests (unit, integration): invariants, costing, VAT, reports
- Docs and CI

Acceptance criteria (global):
- All monetary postings are balanced (sum debit = sum credit)
- No posting to non-leaf or inactive accounts
- Business scoping enforced
- Offline path does not block core operations; online path provides sync endpoints
- Reports reconcile (e.g., TB sums to zero, P&L & Balance Sheet consistent)
- Tests deterministic; CI green on commit

Prioritized milestones (short, sequential):

M1: Posting engine coverage for Cashbook (done), add tests + CI + docs
- Dependencies: CoA + Journal endpoints (done)
- Acceptance: Unit tests for posting invariants, CI pipeline; Developer setup docs, .env.example
- Estimate: 1-2 days

M2: Journal viewer (read-only) + Trial Balance API and UI card
- Dependencies: Journal GET (done)
- Acceptance: View entries filtered by business/date; TB endpoint sums debits/credits; TB card in Reports page
- Estimate: 2-3 days

M3: Invoices and Purchases posting with VAT and Inventory Movements (weighted-average COGS)
- Dependencies: Tax config (seeded), items and invoices existing schemas
- Acceptance: Approve flow posts VAT and Inventory entries; Unit tests for VAT calc and COGS
- Estimate: 4-6 days

M4: AR/AP Aging report + GL report + Inventory Valuation
- Dependencies: M3 postings
- Acceptance: API endpoints + UI render; cross-checked with journal lines
- Estimate: 3-5 days

M5: CoA manager UI + Period locks + Opening Balance wizard
- Acceptance: CoA CRUD (protect system accounts), Lock/unlock month, Opening Balance entry
- Estimate: 4-6 days

M6: Migration/Export + Documentation completeness
- Acceptance: CSV/JSON exports, migration guide, troubleshooting, performance and reliability goals verified locally
- Estimate: 2-3 days

Open questions to unblock higher fidelity:
- Sales tax exceptions or multiple rates needed now? (Default: no)
- Do we need Bank transfers and reconciliation this phase? (Default: later)
- Any regulatory reporting formats for VAT return? (Default: summary format)

---

## 4) Refined architecture (implementable)

Components and responsibilities:
- Client (React + TS + Vite)
  - UI for Cashbook, Invoices, Inventory, Reports
  - Posting previews and submissions
  - Offline-first via Dexie; hybrid adapter to talk to server endpoints
- Server (Express)
  - REST APIs: GL Accounts, Journal, Posting endpoints, Reports
  - Validation of invariants (balanced entries, leaf-active accounts)
  - Seed/Bootstrap
- Storage
  - IndexedDB via Dexie: primary local storage with typed stores
  - MariaDB via Drizzle: server persistence for sync and reporting
- Posting Engine
  - Pure functions (prefer shared), but initial implementation on server
  - Functions: postCashEntry, postInvoiceSale, postInvoicePurchase, postPaymentReceipt, postSupplierPayment, postOpeningBalances, postInventoryCOGS

Interfaces and APIs:
- GL Accounts
  - GET /api/gl/accounts
  - POST /api/gl/accounts
  - PUT /api/gl/accounts/:id
- Journal
  - GET /api/gl/journal?from&to&businessId
  - POST /api/gl/journal { entry, lines } — server validates balanced entry
- Posting
  - POST /api/post/cashbook
  - POST /api/post/invoice
  - POST /api/post/purchase
  - POST /api/post/payment
- Reports
  - GET /api/reports/trial-balance?from&to&businessId
  - GET /api/reports/gl?accountId&from&to
  - GET /api/reports/ar-aging
  - GET /api/reports/ap-aging
  - GET /api/reports/inventory
  - GET /api/reports/pnl
  - GET /api/reports/bs
  - GET /api/reports/vat

Data models and schemas:
- See [`shared/schema.ts`](shared/schema.ts) and [`server/db/schema.ts`](server/db/schema.ts)
- Indices:
  - Journal Lines: by entryId, accountId, businessId, partyId, itemId
  - Journal Entries: by businessId, entryDate
  - Inventory Movements: by businessId, date, itemId

Deployment topology:
- Single Node.js process serves both API and static SPA (production build). See [`server/index.ts`](server/index.ts)
- PORT env controls server port; Vite in dev proxies FE
- MariaDB connectivity via DATABASE_URL in server env

Configuration strategy and secrets:
- .env file for DATABASE_URL, PORT
- .env.example committed; never commit real secrets
- Headers user-id and business-id simulate auth/tenant for now; later replace with real auth

Security controls (initial):
- Tenant isolation by businessId at API
- Input validation and invariant checks
- System accounts cannot be modified except isActive/description
- HTTPS assumed at reverse proxy layer (out of scope here)

Logging, metrics, tracing:
- Minimal request logging for /api in [`server/index.ts`](server/index.ts)
- Future: integrate pino for structured logs; minimal metrics (counts of posts) via endpoint or logs

Error handling:
- Express error handler returns JSON; posting validates and returns 400 with reason
- UI toasts errors; preserve form values

Scalability and performance targets:
- Designed for small shops; tens of thousands of journal lines ok
- Indexed queries on journal lines by account and date support TB/GL efficiently
- Pagination in reports (future)

Operational considerations:
- Migrations via Drizzle Kit; initial migration added
- Backups: DB-level; client exports JSON/CSV (future)
- Sync conflicts: not implemented yet; design later with last-write-wins or vector clocks

Risks and mitigations:
- Risk: Inventory costing correctness
  - Mitigation: Unit tests for weighted-average; reconcile Inventory and COGS in reports
- Risk: VAT calculation edge cases
  - Mitigation: Unit tests; configurable rounding rules; initial single-rate assumption
- Risk: Offline/online divergence
  - Mitigation: Keep offline operations deterministic; add sync merge rules later
- Risk: Multi-tenant leakage
  - Mitigation: Enforce businessId in all queries; test coverage

---

## 5) Next milestone (M1) - End-to-end implementation details

Scope of M1:
- Strengthen posting foundation with tests and CI
- Provide developer setup docs and environment samples
- Deliver minimal deterministic unit test for posting service without requiring a live DB

Deliverables:
- .env.example for local setup
- CI (GitHub Actions) to install, lint/check types, test, and build
- Vitest test suite for `postCashbookWithJournal` using a mocked in-memory db
- Developer instructions: setup, run, test, seed

Definition of Done:
- `npm run test` passes deterministically on Linux/macOS/Windows
- CI green on pull requests
- Docs available in README and this state/plan document

---

## 6) Manual test guide (current endpoints)

- Seed defaults
  - POST /api/bootstrap
    - Headers: `business-id: default-business`
- List GL accounts
  - GET /api/gl/accounts
    - Headers: `business-id: default-business`
- Post Cash In
  - POST /api/post/cashbook
    - Headers: `user-id: default-user`, `business-id: default-business`
    - Body:
      ```json
      {
        "dateTime": "2025-01-02T10:00:00.000Z",
        "direction": "in",
        "amount": 1000,
        "note": "Owner capital",
        "cashAccountId": "ID_OF_1000_CASH",
        "offsetAccountId": "ID_OF_3000_EQUITY"
      }
      ```
- Read Journal
  - GET /api/gl/journal
    - Headers: `business-id: default-business`

---

## 7) Changelog (for latest implementation)
- Added GL, Tax, Inventory schemas and migration
- Implemented GL Accounts and Journal endpoints with validation
- Implemented cashbook posting endpoint that also writes balanced GL journals
- Updated client cashbook flow to select GL accounts and post via journal
- Added bootstrap route to seed default CoA and VAT 15%

---

## 8) Next steps after M1
- M2: Journal viewer and Trial Balance (API + UI)
- M3: Invoices/Purchases posting with VAT and Inventory Movements
- M4: Aging and Inventory Valuation reports
- M5: CoA Manager, Opening Balances, Period Locks
- M6: Export/migration tooling and full documentation