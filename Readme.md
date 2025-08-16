# Credit Debit Financial Management App  
## Overview  
Credit Debit is Progressive Web App designed for comprehensive financial management. The application enables users to track credit/debit accounts, manage invoices, maintain cash flow records, and generate financial reports. Built with modern web technologies, it provides a mobile-first experience with robust offline capabilities and optional cloud backup integration.  

The application follows a client-centric architecture where all data is stored locally in IndexedDB using Dexie, ensuring full offline functionality. 

The backend serves only as a static file server and API endpoint placeholder, with the primary business logic residing entirely on the client side.  

## User Preferences  
Preferred communication style: Simple, everyday language.  

## System Architecture  
### Frontend Architecture 
- **Framework**: React 18 with TypeScript and Vite for development tooling

- **UI Library**: Shadcn/ui components built on Radix UI primitives with Tailwind CSS for styling 

- **State Management**: Zustand for global application state with simple, centralized store pattern 

- **Routing**: Custom screen-based navigation using Zustand state instead of traditional URL routing 

- **Styling**: Tailwind CSS with Material Design 3 color scheme and CSS custom properties for theming  ### Data Management 

- **Local Storage**: Dexie (IndexedDB wrapper) serves as the primary database with typed schemas 

- **Data Models**: Comprehensive schema covering accounts, transactions, categories, cashbook entries, invoices, items, and user preferences 

- **Caching**: TanStack Query for server state management and caching (minimal server interaction) 

- **Offline Strategy**: All data operations occur locally with IndexedDB as the single source of truth  

### Progressive Web App Features 

- **Service Worker**: Custom implementation with precaching of static assets and runtime caching for external resources 

- **Manifest**: Comprehensive PWA manifest with shortcuts for quick actions 

- **Mobile Optimization**: Mobile-first responsive design with touch -friendly interactions  

### Component Architecture 

- **Layout Components**: Modular layout system with AppBar, NavigationDrawer, and BottomActionBar 

- **Form Handling**: React Hook Form with Zod validation for type-safe form management 

- **UI Components**: Extensive component library following Material Design principles 

- **Modal System**: Dialog-based modals for data entry and confirmations  

### Backend Architecture 

- **Server Framework**: Express.js serving as a minimal API server and static file host 

- **Development Setup**: Vite middleware integration for hot module replacement 

- **Storage Interface**: Abstract storage interface with in-memory implementation (not actively used) 

- **Static Assets**: Serves the built React application and handles API routing placeholder  

## External Dependencies  
### Core Frontend Dependencies 

- **React Ecosystem**: React 18, React DOM with TypeScript support 

- **Build Tools**: Vite for development and build processes with TypeScript configuration 

- **UI Framework**: Radix UI components (@radix-ui/*) for accessible primitive components 

- **Styling**: Tailwind CSS with PostCSS for processing and custom design system  ### Data and State Management 

- **Database**: Dexie for IndexedDB operations with migration support 

- **State Management**: Zustand for client-side state management 

- **Server State**: TanStack Query for async operations and caching 

- **Form Management**: React Hook Form with Hookform Resolvers for Zod integration 

- **Validation**: Zod for runtime type checking and schema validation  

### Development and Quality Tools 

- **TypeScript**: Full TypeScript support with strict configuration 

- **CSS Processing**: PostCSS with Tailwind CSS and Autoprefixer 

- **Development Utilities**: Various Replit-specific plugins for enhanced development experience  

### Planned Integrations (Not Currently Implemented) 

- **Google Drive API**: For cloud backup and synchronization using OAuth 

- **WebAuthn API**: For biometric authentication support 

- **Web Share API**: For sharing PDFs and receiving receipt images 

- **Notification APIs**: Web Notifications and Push API for reminders 

- **File System Access API**: For local file import/export operations 

- **PDF Generation**: Libraries like pdfmake or jsPDF for report generation 

- **Excel Export**: SheetJS (xlsx) for spreadsheet generation 

 ### Database Configuration - **Drizzle ORM**: Configured for MariaDB with schema definitions in TypeScript 

- **Neon Database**: @neondatabase/serverless for Mariadb connection (currently unused as app is offline-first) 

- **Migrations**: Drizzle Kit for database schema migrations  The application is designed to work entirely offline with all business logic and data storage happening on the client side, making it ideal for users who need reliable financial tracking without internet dependency.
---

# Project continuation: State, objectives, plan, architecture, and milestone execution

This section documents the current state, refined plan, and end-to-end implementation for Milestone 1 (posting foundation + tests + CI). It complements the existing overview above.

Quick code references:
- Server routes: [`registerRoutes()`](server/routes.ts:9)
- Posting service: [`postCashbookWithJournal()`](server/services/posting.ts:58)
- Shared domain schemas: [`shared/schema.ts`](shared/schema.ts)
- Server Drizzle schema: [`server/db/schema.ts`](server/db/schema.ts)
- Migration: [`migrations/0001_add_gl.sql`](migrations/0001_add_gl.sql)
- Client DB hybrid: [`client/src/lib/db.ts`](client/src/lib/db.ts)
- MariaDB adapter: [`client/src/lib/dexie-mariadb-adapter.ts`](client/src/lib/dexie-mariadb-adapter.ts)
- Cashbook UI: [`client/src/pages/CashBook.tsx`](client/src/pages/CashBook.tsx)
- Cash modal UI: [`client/src/components/modals/CashEntryModal.tsx`](client/src/components/modals/CashEntryModal.tsx)

## 1) Current state summary

- Offline-first React + TypeScript PWA, IndexedDB via Dexie as primary storage, minimal Express API. MariaDB optional for sync/reporting.
- Double-entry foundation added:
  - Chart of Accounts, Journal Entries, Journal Lines, Inventory Movements, Tax Rates/Codes, Posting Rules, Opening Balances in shared Zod schemas and server Drizzle schema.
  - Migration created: [`migrations/0001_add_gl.sql`](migrations/0001_add_gl.sql).
- Endpoints added and hardened:
  - GL Accounts: GET/POST/PUT
  - Journal: GET/POST (balanced validation, active leaf accounts enforced)
  - Cashbook: GET/POST scoped by business-id header
  - Posting: POST /api/post/cashbook -> atomic cashbook + balanced journal entry using [`postCashbookWithJournal()`](server/services/posting.ts:58)
  - Bootstrap: POST /api/bootstrap seeds default CoA and VAT 15%
- Client updates:
  - Dexie schema bumped for GL/Tax tables [`client/src/lib/db.ts`](client/src/lib/db.ts)
  - Adapter supports GL endpoints and bootstrap [`client/src/lib/dexie-mariadb-adapter.ts`](client/src/lib/dexie-mariadb-adapter.ts)
  - CashEntryModal requires Cash/Bank and Offset GL accounts; auto-bootstrap if CoA empty [`client/src/components/modals/CashEntryModal.tsx`](client/src/components/modals/CashEntryModal.tsx)
  - CashBook posts via /api/post/cashbook and computes summary in-memory [`client/src/pages/CashBook.tsx`](client/src/pages/CashBook.tsx)

What works now
- Seed default CoA and VAT 15% for a business.
- Create cashbook entries that also post balanced journal entries (double-entry) with multi-business scoping.

## 2) Objectives, constraints, assumptions, questions

Objectives (Config C):
- Multi-business, single currency ETB, VAT 15% exclusive, weighted-average inventory costing.
- Double-entry GL postings for: cash in/out, sales/purchases (cash and credit) with VAT and inventory, debt insertion/repayment, opening balances as of 2025-01-01.
- Reports: Trial Balance, General Ledger, AR/AP Aging, Inventory Valuation, P&L, Balance Sheet, VAT return.
- Offline-first UX.

Constraints:
- IndexedDB is the primary; server optional. Deterministic offline behavior.
- Simple UX for small shops, default CoA and VAT.

Assumptions (explicit):
- Single currency (ETB), no multi-currency.
- VAT 15% exclusive applied on sales/purchases for now; all items taxable unless flagged in future.
- Weighted-average cost per business per item.
- Monthly periods; period locks without mandatory closing entries.

Unblocking questions:
- Additional tax rates/exemptions required now? Default: only VAT 15%.
- Bank transfers/reconciliation required now? Default: later phase.
- VAT reporting format specifics for your jurisdiction? Default: summarized output.

## 3) Remaining tasks, dependencies, acceptance criteria, and milestones

Epics remaining
- Posting engine for invoices/purchases/payments/opening balances with VAT and inventory COGS.
- UI: Chart of Accounts manager, Journal viewer.
- Reports: TB, GL, AR/AP Aging, Inventory Valuation, P&L, Balance Sheet, VAT return.
- Periods & locks; Opening Balance wizard; Migration tooling; Tests; Docs; CI.

Global acceptance criteria
- All postings balanced (sum debit == sum credit, 2 decimals).
- Post only to active leaf accounts; system accounts protected.
- businessId enforced across all operations.
- Reports reconcile (TB balances to zero, P&L and BS consistent).
- Offline ops deterministic and tested.

Milestones (short, sequential)
- M1 (DELIVERED): Posting foundation, tests, CI, docs.
- M2: Journal viewer + Trial Balance endpoint/UI card.
- M3: Invoices/Purchases posting with VAT and Weighted-Average Inventory Movements (COGS).
- M4: AR/AP Aging, GL, Inventory Valuation reports.
- M5: CoA manager UI, Opening Balance wizard, Period locks.
- M6: Export/migration tooling and documentation hardening.

## 4) Refined architecture (immediately implementable)

Components and responsibilities
- Client: UI for cashbook, invoices, purchases, inventory, reports. Posting previews and submissions. Dexie-based offline DB; adapter for server endpoints.
- Server: REST APIs for GL Accounts, Journal, Posting, Reports, Bootstrap. Enforces invariants and business scoping.
- Storage/Indexing:
  - IndexedDB (Dexie): stores include gl_accounts, gl_journal_entries, gl_journal_lines, inventory_movements, tax_rates, tax_codes, posting_rules, opening_balances. Indices on businessId, entryDate, accountId, partyId, itemId.
  - MariaDB (Drizzle): same tables, with indices for reporting.

Interfaces and APIs (current + planned)
- GL Accounts: GET /api/gl/accounts; POST /api/gl/accounts; PUT /api/gl/accounts/:id
- Journal: GET /api/gl/journal?from&to; POST /api/gl/journal
- Posting:
  - POST /api/post/cashbook (implemented)
  - POST /api/post/invoice (planned)
  - POST /api/post/purchase (planned)
  - POST /api/post/payment (planned)
- Reports:
  - GET /api/reports/trial-balance (planned)
  - GET /api/reports/gl (planned)
  - GET /api/reports/ar-aging (planned)
  - GET /api/reports/ap-aging (planned)
  - GET /api/reports/inventory (planned)
  - GET /api/reports/pnl (planned)
  - GET /api/reports/bs (planned)
  - GET /api/reports/vat (planned)

Deployment and configuration
- Single Node.js process serves API + built SPA; dev runs Vite middleware.
- Config via .env (see `.env.example`) for PORT and DATABASE_URL.
- Headers `user-id` and `business-id` simulate auth/tenant scoping.

Security controls (initial)
- Tenant isolation via businessId filters.
- Input validation and server-side invariants.
- System accounts partially locked.

Logging, metrics, tracing
- Minimal request logging for /api in server.
- Future: structured logs (pino) and basic metrics (counter endpoints).

Error handling
- JSON errors with reasons on validation failures.
- UI toasts client-side; forms remain populated.

Performance targets
- Small-shop scale; tens of thousands of lines acceptable.
- Indexed queries; simple pagination in reports.

Operations
- Drizzle migrations; initial 0001 added.
- Backups: DB backups + later JSON/CSV exports.
- Sync conflicts: planned later.

Risks and mitigations
- Costing correctness: unit tests, reconciliation reports.
- VAT correctness: unit tests and deterministic rounding to 2 decimals.
- Tenant isolation: businessId filters + tests.
- Offline/online divergence: deterministic offline ops; later sync strategies.

## 5) Milestone 1 – End-to-end implementation

Added/updated files:
- Posting tests (Vitest): [`server/services/posting.test.ts`](server/services/posting.test.ts)
- CI pipeline (GitHub Actions): `.github/workflows/ci.yml`
- Environment example: `.env.example`
- State & plan docs: `docs/STATE-AND-PLAN.md`
- Posting service (server): [`postCashbookWithJournal()`](server/services/posting.ts:58)
- Shared schemas, server schemas, migrations, API routes, client UI and adapters updated as referenced at top.

Deterministic tests
- Vitest with deterministic `randomUUID()` stub.
- In-memory mock DB to validate:
  - Balanced lines created
  - Leaf/active account enforcement
  - Business scoping

Run tests locally
- `npm ci`
- `npm run test`

CI
- On each push/PR: install, type-check, build, test, and upload dist.

## 6) Setup and test instructions (macOS/Linux/Windows)

Prerequisites
- Node.js 20.x
- npm 10+
- (Optional for server persistence) MariaDB 10.6+ with database created (e.g., `ledger`)

Environment
- Copy .env.example to .env and adjust:
  ```
  PORT=5000
  DATABASE_URL=mysql://root:password@127.0.0.1:3306/ledger
  NODE_ENV=development
  ```

Install and run (development)
- Install dependencies:
  ```
  npm ci
  ```
- Start dev server:
  ```
  npm run dev
  ```
- Open: http://localhost:5000

Build (production)
- Build SPA and server bundle:
  ```
  npm run build
  ```
- Start:
  ```
  npm run start
  ```

Database migrations
- Generate (if schema changes):
  ```
  npm run db:generate
  ```
- Apply migrations:
  ```
  npm run db:migrate
  ```

Tests
- Unit tests:
  ```
  npm run test
  ```
- Type-check:
  ```
  npm run check
  ```

Seed defaults (Chart of Accounts + VAT 15%) and test endpoints

Bootstrap (seed CoA + VAT 15%)
```
curl -X POST http://localhost:5000/api/bootstrap \
  -H "Content-Type: application/json" \
  -H "business-id: default-business"
```

List GL accounts
```
curl -X GET http://localhost:5000/api/gl/accounts \
  -H "Content-Type: application/json" \
  -H "business-id: default-business"
```

Post Cash In with balanced journal
```
# Replace the IDs with ones returned by the GL accounts list:
CASH_ACC="ID_OF_1000_CASH"
EQUITY_ACC="ID_OF_3000_EQUITY"

curl -X POST http://localhost:5000/api/post/cashbook \
  -H "Content-Type: application/json" \
  -H "user-id: default-user" \
  -H "business-id: default-business" \
  -d "{
    \"dateTime\": \"2025-01-02T10:00:00.000Z\",
    \"direction\": \"in\",
    \"amount\": 1000,
    \"note\": \"Owner capital\",
    \"cashAccountId\": \"${CASH_ACC}\",
    \"offsetAccountId\": \"${EQUITY_ACC}\"
  }"
```

Get Journal
```
curl -X GET http://localhost:5000/api/gl/journal \
  -H "Content-Type: application/json" \
  -H "business-id: default-business"
```

## 7) Minimal CI configuration

- See `.github/workflows/ci.yml` – installs dependencies, type-checks, builds, tests, and uploads build artifacts.

## 8) Architecture diagram (text)

Client (React/TS, Dexie) -> HTTP -> Server (Express)
- Client: UI + local IndexedDB (Dexie), optional sync via REST.
- Server: REST endpoints for GL, Journal, Posting, Reports; Drizzle ORM -> MariaDB.
- Both share types via Zod in [`shared/schema.ts`](shared/schema.ts).

Flow: Cashbook entry -> Posting endpoint -> Validates + persists Cashbook row + Journal entry + Lines -> Visible in Journal and Trial Balance.

## 9) Architecture Decision Record (ADR)

See: `docs/ADR-0001-double-entry-ledger.md` (added in this milestone).

Key choices
- Double-entry GL at core; leaf-only posting; business scoping.
- Weighted-average inventory costing.
- VAT 15% exclusive baseline; simple initial model to unblock small shops.
- Offline-first by Dexie; optional server persistence.

## 10) Performance and reliability goals

- Posting latency: < 200ms on commodity hardware.
- Trial Balance for 50k lines: < 1s with indexed queries.
- Deterministic tests; no flakiness.
- Basic error handling with meaningful messages.

Verify locally
- Seed CoA and post a batch of entries; measure endpoints by curl (time).
- Check TB endpoint (in a later milestone) returns promptly.

## 11) Changelog (this milestone)

- Added GL/Tax/Inventory schemas and migration.
- Implemented GL accounts and journal endpoints with validation.
- Added posting service and endpoint for cashbook with balanced journals.
- Updated client cash entry flow to require GL accounts and post via journal.
- Seed defaults via `/api/bootstrap`.
- Added `.env.example`, CI workflow, and unit tests for posting.
- Documentation: `docs/STATE-AND-PLAN.md` with state and plan.

## 12) Brief test report

- Unit tests (`npm run test`):
  - Creates balanced journal lines for Cash In with Debit Cash/Credit Equity.
  - Rejects posting to non-leaf accounts.
  - Rejects posting with account outside business scope.
- Deterministic UUID sequence stubbing used to ensure stable snapshots.

## 13) Updated remaining tasks (next milestones)

- M2: Journal viewer (UI) and Trial Balance (API + UI).
- M3: Invoices/Purchases postings with VAT and Inventory COGS (weighted average).
- M4: AR/AP Aging, GL drilldown, Inventory Valuation.
- M5: CoA manager, Opening Balance wizard, Period locks.
- M6: Export/migration tooling, docs hardening.

## 14) Open questions and requests for feedback

- Confirm whether any additional tax rates or exemptions are required now.
- Confirm priority of Bank transfers/reconciliation in the roadmap.
- Provide jurisdiction-specific VAT return format if needed for M4/M6.
- Confirm acceptance criteria for performance targets (e.g., TB within 1s for 50k lines).