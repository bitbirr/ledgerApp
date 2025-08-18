Re-Design & Implement Responsive Frontend (Web / Mobile / Tablet)  
**Product**: Credit Debit — offline-first financial management app (accounts, cashbook, invoices, inventory, GL reports).  

**Context & Goals**  
Support all screen sizes (mobile-first), Progressive Web App (PWA), light/dark modes, and role-based layouts.  
Inspired by [etrade.gov.et](https://etrade.gov.et): calm, civic, trustworthy, content-first, strong hierarchy, generous spacing.  
Maintain existing API contracts (headers include `business-id`, and where used `user-id`). Data comes from API only; PWA caches the shell/UI.  
Prioritize accessibility (WCAG AA), performance (Core Web Vitals), and clarity over decoration.

**Tech Stack**  
React + Vite + TypeScript  
Tailwind CSS (colors from CSS variables via `hsl(var(--...))`)  
shadcn/ui (base primitives), lucide-react (icons)  
Wouter (routing), Zustand (app store), TanStack Query (data)  
Recharts (simple charts), react-aria patterns for a11y where helpful  
PWA: existing service worker + install/update banners  

**Visual Language & Tokens**  
Use and expand the CSS variables already defined in `index.css` (background, foreground, card, border, primary, success, warning, destructive, etc.). Keep radius = 8px feel.  

**Required Tokens (map to Tailwind theme)**  
Color: `--background`, `--foreground`, `--card`, `--card-foreground`, `--primary`, `--primary-foreground`, `--secondary`, `--secondary-foreground`, `--muted`, `--muted-foreground`, `--success`, `--warning`, `--destructive`, `--border`, `--input`, `--ring`  
Typography: `--font-sans` (Inter → fallback system), `--font-mono` (JetBrains Mono)  
Radii & Shadows: `--radius` (8px), `--shadow-sm`/`--shadow`/`--shadow-md`/`--shadow-lg`/`--shadow-xl`  
Motion: Prefer subtle; respect `prefers-reduced-motion`  
State shades: Hover/active/focus with 10–20% alpha overlays; keep contrast AA  

**Deliverable**: A Token sheet (and Tailwind extension) + a dark mode pair for each token. Ensure AA contrast for all foreground/background pairs.

**Breakpoints & Layout Grid**  
Mobile (≤640), Tablet (641–1024), Desktop (≥1025).  
Grid: 12 columns on tablet/desktop, 16px base spacing → 24/32 on larger screens.  
Max content width: 1200–1280px with comfortable gutters.

**Information Architecture & Shell**  
Two shells (shared component library):  

**Business App (/)**  
Top bar: logo/app name, global search, Business / Branch selector, user menu (profile, role, logout), theme toggle.  
Navigation:  
- Mobile: bottom nav or hamburger → drawer (Dashboard, Accounts, Cashbook, Invoices, Inventory, Reports, Settings).  
- Tablet/Desktop: left sidebar (collapsible); active item highlighted; breadcrumbs above content.  
Content area: page header (title + actions), content cards/tables, responsive filters.  
Sticky mobile actions when relevant.  

**SuperAdmin App (/admin/*)**  
Shared look, separate nav: Businesses, Branches, Users/Roles, App Settings, Audit, Feedback, Diagnostics.  
Add `/login` (Business) and `/admin/login` (SuperAdmin) with simple, branded forms. Business login has Business → Branch → Role selects.

**RBAC (scaffolding only)**  
Roles: SuperAdmin, Admin, Staff.  
Guarded routes (Wouter): hide unauthorized nav; redirect to login if missing/invalid role.  
Branch scoping: Staff sees only their branch; Admin sees all branches for their business; SuperAdmin sees global.  
UI reflects permissions (e.g., disabled actions, info text).

**Design System — Components (build once, reuse)**  
Use shadcn/ui primitives where possible; wrap in app components with prop contracts. All components respond to size (sm/md/lg) and state (loading/disabled/error).  

**Atoms**: Button (variants: primary/secondary/ghost/destructive), IconButton, Badge, Tag/Status (success/warning/destructive/neutral), Avatar, Tooltip, Toast, Divider, Progress, Skeleton, Pill.  
**Inputs**: Text, Number, Currency (mono), Textarea, Select, Combobox, Date/DateRange picker, Switch, Checkbox, Radio, File (with preview), Search input (with debounce).  
**Form patterns**: Labels, help/error text, required asterisk, success/error/warning states; async validation affordances.  
**Navigation**: AppHeader, MobileBottomNav, SidebarNav (collapsible), Breadcrumb, Tabs (underline), Stepper (for multi-step).  
**Surfaces**: Card (base/hoverable/elevated), Modal/Dialog, Drawer (mobile filters), Popover, Banner/Inline alert, Empty state.  
**Data display**: Table (responsive + sticky header), DataList (mobile alternative), Pagination, Sort/Filter chips, KPI tiles, ChartCard (Recharts).  
**Feedback**: Loading states (skeletons and spinners), Offline banner, Error fallbacks (retry), “No results” empty states.  
**Utilities**: CopyToClipboard, DownloadCSV, ResponsiveContainer, SafeArea pads (iOS), ScrollArea (styled)  

**Deliverable**: Component library with stories (or simple demo screen) showing states: default, hover, focus, disabled, loading, error.

**Key Screens (skeletons only—no deep feature UX)**  
**Login (/login)**: Business, Branch, Role selects; Username/Password; Remember me; “Switch theme” link; helpful error states.  
**Dashboard**: KPI cards (Receipts, Payments, Balance), small charts (Cashflow 30 days), “Recent activity” table, quick actions.  
**Accounts**: searchable/filterable table; mobile card list; Add/Edit modal; Details drawer (topline, recent transactions).  
**Cashbook**: date range filter; entry list/table; Add entry dialog; totals summary.  
**Invoices**: table w/ status chips; quick filters (Open/Paid/Overdue); detail drawer.  
**Inventory**: simple list (name, stock, low-stock state) + item dialog.  
**Reports**: Trial Balance table with totals; export buttons.  
**Settings**: Preferences (currency, date/time), Theme.  

Each page must ship with: page header, filters area (collapsible on mobile), content surface, empty/loading/error states.

**Data & State Patterns**  
Queries (TanStack Query): 1 key per endpoint (e.g., `['accounts', businessId]`); stale-time sensible (30–120s); retry minimal; suspense off; optimistic updates where safe.  
Zustand store: session (role, business, branch), UI prefs (theme, nav collapsed), ephemeral UI states.  
Headers on fetch: include `business-id` (and `user-id` where used). Never hardcode business IDs; read from store.  
PWA policy: Cache static shell only; always fetch data from API; show offline banner if `navigator.offline`, and cached shell with empty/error states.

**Accessibility & Internationalization**  
WCAG AA: contrast, font sizes (min 14px body), focus rings, keyboard nav, skip-to-content.  
Use `aria-` attributes for dialogs/drawers/popovers; trap focus; ESC to close; return focus.  
Language ready: keep text in a `messages.ts` map for future i18n; RTL-safe spacing using logical properties where trivial.

**Performance & Quality**  
Code split pages with `React.lazy`. Prefetch on hover (nav).  
Image & icon hygiene; tree-shake lucide icons.  
Lighthouse targets: Perf ≥ 90, A11y ≥ 95, Best Practices ≥ 95.  
Avoid long main thread work; keep JS bundles lean; memoize heavy tables; virtualize if >200 rows.

**Routing & Guards**  
Wouter: top-level routes for business app and admin app.  
Guard HOCs (or hooks) check role + branch + business; redirect to appropriate login (`/login` or `/admin/login`).  
Hide unauthorized nav links; show “No access” state if deep-linked to restricted page.

**Micro-interactions**  
Subtle lift on hover (cards), focus ring animations, loading skeletons for tables/cards, optimistic toasts for mutations, “Saved” inline confirmations.

**Deliverables**  
**Figma/Design Spec**  
Token board (light/dark), components (states), 3 breakpoints for each key screen.  

**Code**  
Implement tokens, core components, layout shell, guards, and skeleton pages with real API calls & states.  

**Docs (short)**  
How to add a page, how to use a component, how to gate a route, how to theme.

**Acceptance Criteria**  
Looks/feels like a modern gov portal (etrade-style): calm, readable, structured.  
Responsive excellence: mobile, tablet, desktop all first-class.  
Role-aware: superadmin vs business app nav separation; guards working.  
Accessible: keyboard & readers; visible focus; AA contrast.  
Fast: passes Lighthouse thresholds; sensible code splitting.  
API-faithful: honors headers; no mocked data; shell-only caching.