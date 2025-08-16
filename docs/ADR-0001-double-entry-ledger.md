# ADR-0001: Adopt double-entry GL with leaf-only posting and multi-business scoping

- Date: 2025-08-16
- Status: Accepted
- Related Code:
  - GL endpoints and validation: [`server.registerRoutes()`](server/routes.ts:204)
  - Posting service: [`posting.postCashbookWithJournal()`](server/services/posting.ts:58)
  - Shared domain models: [`shared.schema.ts`](shared/schema.ts)
  - Migration for GL/Tax/Inventory: [`migrations/0001_add_gl.sql`](migrations/0001_add_gl.sql)

## Context

The application began with a single-entry, customer-centric model (Accounts, Transactions, Cashbook). Requirements evolved to support small-shop accounting grounded in double-entry bookkeeping, multi-business tenancy, VAT 15% exclusive, and inventory with weighted-average cost.

Key needs:
- Accuracy and auditability: balanced debits and credits.
- Flexibility: map various operations (cash, invoices, purchases, payments) to GL accounts.
- Extensibility: add VAT and inventory costing with minimal disruption.
- Offline-first with IndexedDB; optional server persistence and reporting.

## Decision

Adopt a proper General Ledger (GL) with:
- Chart of Accounts (CoA) per business.
- Journal Entries (header) and Journal Lines (details).
- Enforce invariants:
  - Sum(debit) == Sum(credit) per entry (2-decimal precision).
  - Post only to active leaf accounts; parent/system accounts protected.
  - All records are scoped by businessId for multi-tenant isolation.

Choose weighted-average inventory costing per item per business. VAT is treated as exclusive at 15% for now, with two primary codes: VAT Output (sales), VAT Input (purchases). Indexed storage supports reporting queries.

## Rationale

- Double-entry is a universal standard in accounting. It simplifies audits and reporting (TB, P&L, BS).
- Leaf-only posting prevents roll-up account contamination and simplifies reporting aggregates.
- Business scoping ensures tenant isolation.
- Weighted-average is a practical first costing method for small shops.
- VAT exclusive at 15% matches common expectations in the target region and keeps math straightforward.

## Consequences

- Additional tables: gl_accounts, gl_journal_entries, gl_journal_lines, inventory_movements, tax_rates, tax_codes, posting_rules, opening_balances.
- Validation required server-side for balanced posting and active leaf accounts.
- Client must select explicit GL accounts or rely on posting rules (to be expanded).
- Reports (TB, GL, Aging, VAT, P&L, BS) can be cleanly derived from journal lines.

## Alternatives Considered

- Single-entry with derived summaries: Not sufficiently robust for audit or formal financial statements.
- Posting to parent accounts: Confuses reporting and change management; rejected.
- FIFO costing: Adds complexity and data volume for limited benefit at this stage; can be phased later.

## Rollout Plan

- Seed default small-shop CoA and VAT codes via bootstrap route.
- Implement posting endpoints progressively: cashbook (done), invoices, purchases, payments, opening balances.
- Add Journal viewer and Trial Balance next; then reports and management UIs.