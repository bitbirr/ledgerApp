
Finalize architecture and design spec reflecting Config C: multi-business, ETB, VAT 15 percent exclusive, weighted-average inventory costing, monthly fiscal periods starting day 1, opening balances as of 2025-01-01 per business
Confirm requirements: inventory costing method weighted average, tax handling VAT 15 percent exclusive, multi-currency no, multi-business yes, fiscal period monthly
Extend shared domain: add zod models and insert schemas for gl_accounts, gl_journal_entries, gl_journal_lines, inventory_movements, opening_balances, posting_rules, tax_rates, tax_codes in shared/schema.ts
Extend server Drizzle schema: add GL, inventory movements, tax tables and relationships in server/db/schema.ts and create migrations 0001_add_gl.sql
Seed default Chart of Accounts per business and protect system accounts; add server seeding script and bootstrap route (VAT 15% tax rate and tax codes included)
Fix client type mismatch: replace Shop with Business in client/src/lib/db.ts imports and Dexie stores; ensure businessId present in all client models and queries
Update Dexie schema: bump version and add GL tables, indices, and types in client/src/lib/db.ts; add typed accessors in HybridDatabase (schema bumped; accessors pending)
Extend MariaDB adapter: add REST calls for GL endpoints, inventory movements, tax endpoints in client/src/lib/dexie-mariadb-adapter.ts (GL accounts/journal/bootstrap done)
Implement API endpoints: CRUD for gl-accounts, journal entries and lines, inventory movements; posting endpoints for invoices, cashbook, payments; server-side validation for balanced entries in server/routes.ts (GL accounts/journal and cashbook posting done)
Remove duplicate cashbook endpoints and normalize payloads in server/routes.ts (scoped by businessId)
Implement posting engine library (shared logic): cash entry, invoice sale, invoice purchase, payment receipt, supplier payment, opening balances, inventory COGS with weighted average (cash entry implemented: server/services/posting.ts)
Update CashEntryModal and CashBook flow: require offset GL account and optional party; preview balanced journal; post to journal and cashbook consistently
Add VAT handling: tax rates config 15 percent exclusive, item tax flags, invoice tax calc; post VAT Output and VAT Input lines; VAT report
Wire invoices to posting engine: on approve, generate journal; support cash and credit; compute VAT and inventory COGS; allow multi-bank account receipt
Implement inventory movements on purchase and sale; compute weighted average cost; expose current item cost; reconcile GL postings (Inventory and COGS)
Build Journal viewer page: filter by date, account, business, and source; drill to entry and source document
Build Chart of Accounts manager page: list, tree, CRUD with safeguards; prevent posting to parent accounts; multi-business scoping
Implement Reports: Trial Balance, General Ledger with drilldowns, AR Aging, AP Aging, Inventory Valuation, Income Statement, Balance Sheet, VAT return
Opening Balance wizard per business (as of 2025-01-01): capture balances per GL and per party (AR/AP); generate single opening journal entry; lock when confirmed
Periods and locks: monthly fiscal periods; prevent posting to locked period; allow admin override with audit trail
Add unit tests: posting invariants, weighted average cost, VAT calculations, report aggregations; include offline-only tests with Dexie
Documentation: accounting model, posting rules, VAT setup, migration steps, user guides for shop owners
Performance and UX polish: pagination, indices, caching; background report computation; toast and error surfaces
Backup and export: JSON and CSV exports for journals, CoA; printable PDFs for reports; optional future cloud backup