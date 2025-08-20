import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Home,
  LayoutGrid,
  Receipt,
  Package,
  Wallet,
  Settings as SettingsIcon,
  ChevronDown,
  ChevronRight,
  CalendarDays,
  Search,
  Bell,
  Layers,
  Zap,
  Building2,
  BarChart2,
  Users as UsersIcon,
  X,
  Menu,
} from "lucide-react";

// UI kit (shadcn/ui assumed)
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

// ======= REAL PAGES (corrected import paths) =======
import { Dashboard as DashboardPage } from "@/pages/Dashboard";
import { Accounts } from "@/pages/business/Accounts";
import { Cashbook } from "@/pages/business/Cashbook";
import { Inventory } from "@/pages/Inventory";
import { Invoices } from "@/pages/Invoices";
import { Reports } from "@/pages/Reports";
import { Settings } from "@/pages/Settings";
import { ChartOfAccounts } from "@/pages/ChartOfAccounts";
import { Businesses } from "@/pages/admin/Businesses";
import { Branches } from "@/pages/admin/Branches";
import { UsersRoles } from "@/pages/admin/UsersRoles";
import { Feedback } from "@/pages/admin/Feedback";
import { Audit } from "@/pages/admin/Audit";
import { AppSettings } from "@/pages/admin/AppSettings";
import NotFound from "@/pages/not-found";

// ------------------------------
// Navigation model
// ------------------------------

type NavItem = {
  id: string;
  label: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  items: { id: string; label: string }[];
};

const NAV: NavItem[] = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: Home,
    items: [{ id: "overview", label: "Overview" }],
  },
  {
    id: "accounting",
    label: "Accounting",
    icon: LayoutGrid,
    items: [
      { id: "accounts", label: "Accounts" },
      { id: "chart-of-accounts", label: "Chart of Accounts" },
      { id: "cashbook", label: "Cashbook" },
      { id: "journal", label: "Journal Entries" }, // coming soon
      { id: "general-ledger", label: "General Ledger" }, // coming soon
    ],
  },
  {
    id: "sales",
    label: "Sales",
    icon: Receipt,
    items: [
      { id: "invoices", label: "Invoices" },
      { id: "quotations", label: "Quotations" }, // coming soon
      { id: "sales-orders", label: "Sales Orders" }, // coming soon
    ],
  },
  {
    id: "inventory",
    label: "Inventory",
    icon: Package,
    items: [
      { id: "items", label: "Items" },
      { id: "stock", label: "Stock Levels" }, // coming soon
      { id: "warehouses", label: "Warehouses" }, // coming soon
      { id: "adjustments", label: "Adjustments" }, // coming soon
    ],
  },
  {
    id: "company",
    label: "Company",
    icon: Building2,
    items: [
      { id: "businesses", label: "Businesses" },
      { id: "branches", label: "Branches" },
      { id: "users-roles", label: "Users & Roles" },
      { id: "feedback", label: "Feedback" },
    ],
  },
  {
    id: "reports",
    label: "Reports",
    icon: BarChart2,
    items: [{ id: "suite", label: "Report Suite" }],
  },
  {
    id: "settings",
    label: "Settings",
    icon: SettingsIcon,
    items: [
      { id: "preferences", label: "Preferences" },
      { id: "app-settings", label: "App Settings" },
      { id: "audit", label: "Audit Log" },
    ],
  },
];

// Map existing pages to route keys
const ROUTES: Record<string, React.ComponentType<any>> = {
  "dashboard:overview": DashboardPage,
  "accounting:accounts": Accounts,
  "accounting:chart-of-accounts": ChartOfAccounts,
  "accounting:cashbook": Cashbook,
  "sales:invoices": Invoices,
  "inventory:items": Inventory,
  "company:businesses": Businesses,
  "company:branches": Branches,
  "company:users-roles": UsersRoles,
  "company:feedback": Feedback,
  "reports:suite": Reports,
  "settings:preferences": Settings,
  "settings:app-settings": AppSettings,
  "settings:audit": Audit,
};

// ------------------------------
// Visual helpers & theme polish
// ------------------------------

function NeonBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      <motion.div
        initial={{ opacity: 0.1, scale: 0.9 }}
        animate={{ opacity: 0.22, scale: 1 }}
        transition={{ duration: 6, repeat: Infinity, repeatType: "reverse" }}
        className="absolute left-1/2 top-[-10%] h-64 w-[60rem] -translate-x-1/2 rounded-full bg-lime-400/20 blur-3xl"/>
      <motion.div
        initial={{ opacity: 0.08, y: 20 }}
        animate={{ opacity: 0.16, y: 0 }}
        transition={{ duration: 7, repeat: Infinity, repeatType: "reverse" }}
        className="absolute bottom-[-10%] left-1/2 h-64 w-[45rem] -translate-x-1/2 rounded-full bg-emerald-400/10 blur-3xl"/>
    </div>
  );
}

function ComingSoon({ title }: { title: string }) {
  return (
    <div className="grid min-h-[50vh] place-items-center rounded-xl border border-dashed border-lime-400/25 bg-zinc-900/70 p-6 text-center">
      <div>
        <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-lime-400/15 text-lime-300">
          <Zap className="h-5 w-5" />
        </div>
        <p className="text-2xl font-semibold text-white">{title}</p>
        <p className="mt-1 text-zinc-400">This page is being built. Check back soon.</p>
      </div>
    </div>
  );
}

function TopBar({ onToggleSidebar }: { onToggleSidebar: () => void }) {
  return (
    <div className="sticky top-0 z-40 border-b border-zinc-800/80 bg-zinc-950/90 backdrop-blur supports-[backdrop-filter]:bg-zinc-950/70">
      <div className="flex h-14 items-center gap-3 px-3 sm:px-4">
        <Button variant="ghost" size="icon" onClick={onToggleSidebar} className="md:hidden text-zinc-300 hover:text-white hover:bg-zinc-900">
          <Menu className="h-5 w-5" />
        </Button>
        <div className="flex items-center gap-2">
          <div className="h-6 w-6 rounded bg-gradient-to-br from-lime-400 to-emerald-400" />
          <span className="font-semibold tracking-tight text-white">LedgerPlus</span>
          <span className="ml-2 hidden text-xs text-zinc-400 sm:inline">Enterprise ERP</span>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <div className="relative hidden sm:block">
            <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
            <Input
              placeholder="Search…"
              className="h-9 w-56 sm:w-64 border-zinc-800 bg-zinc-900 text-white placeholder:text-zinc-500 focus-visible:ring-lime-400"
            />
          </div>
          <Button variant="outline" className="hidden h-9 border-lime-400/30 bg-zinc-950 text-zinc-200 hover:bg-zinc-900 sm:inline-flex">
            <CalendarDays className="mr-1 h-4 w-4" /> This Month
          </Button>
          <Button variant="ghost" size="icon" className="text-zinc-300 hover:text-white hover:bg-zinc-900">
            <Bell className="h-5 w-5" />
          </Button>
      </div>
    </div>
  </div>
  );
}

function Sidebar({
  expanded,
  setExpanded,
  active,
  setActive,
  mobileOpen,
  setMobileOpen,
}: {
  expanded: string[];
  setExpanded: (s: string[]) => void;
  active: { main: string; sub: string };
  setActive: (v: { main: string; sub: string }) => void;
  mobileOpen: boolean;
  setMobileOpen: (v: boolean) => void;
}) {
  const toggle = (key: string) => {
    setExpanded(expanded.includes(key) ? expanded.filter((k) => k !== key) : [...expanded, key]);
  };

  const sidebarCore = (
    <nav className="space-y-1 p-2">
      {NAV.map((m) => {
        const open = expanded.includes(m.id);
        const activeMain = active.main === m.id;
        return (
          <div key={m.id} className="rounded-xl">
            <button
              className={cn(
                "group flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left transition focus:outline-none",
                activeMain ? "bg-lime-400/15 text-lime-300 ring-1 ring-lime-400/30" : "hover:bg-zinc-900"
              )}
              onClick={() => {
                toggle(m.id);
                setActive({ main: m.id, sub: m.items[0]?.id ?? "overview" });
              }}
            >
              <m.icon className="h-5 w-5" />
              <span className="flex-1 text-sm font-medium">{m.label}</span>
              <span className="text-zinc-400">{open ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}</span>
            </button>
            <AnimatePresence initial={false}>
              {open && (
                <motion.ul
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.22 }}
                  className="ml-2 overflow-hidden border-l border-zinc-800 pl-2"
                >
                  {m.items.map((it) => {
                    const isActive = activeMain && active.sub === it.id;
                    return (
                      <li key={it.id}>
                        <button
                          onClick={() => {
                            setActive({ main: m.id, sub: it.id });
                            setMobileOpen(false);
                          }}
                          className={cn(
                            "group mt-1 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-[13px] transition",
                            isActive ? "bg-lime-400/15 text-lime-300" : "text-zinc-300 hover:bg-zinc-900"
                          )}
                        >
                          <Layers className="h-3.5 w-3.5 opacity-80" />
                          <span className="flex-1">{it.label}</span>
                        </button>
                      </li>
                    );
                  })}
                </motion.ul>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </nav>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:block w-64 shrink-0 border-r border-zinc-800 bg-zinc-950/95 text-zinc-200">
        <NeonBackground />
        {sidebarCore}
      </aside>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.aside
            initial={{ x: -320, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -320, opacity: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 24 }}
            className="fixed inset-y-0 left-0 z-50 w-72 border-r border-zinc-800 bg-zinc-950/95 text-zinc-200 shadow-2xl md:hidden"
            aria-modal
            role="dialog"
          >
            <div className="flex items-center justify-between border-b border-zinc-800 px-3 py-2">
              <div className="flex items-center gap-2">
                <div className="h-6 w-6 rounded bg-gradient-to-br from-lime-400 to-emerald-400" />
                <span className="font-semibold">Menu</span>
              </div>
              <Button size="icon" variant="ghost" onClick={() => setMobileOpen(false)} className="text-zinc-300 hover:text-white">
                <X className="h-5 w-5" />
              </Button>
            </div>
            {sidebarCore}
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Backdrop for mobile */}
      {mobileOpen && (
        <motion.div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setMobileOpen(false)}
        />
      )}
    </>
  );
}

// ------------------------------
// Main Shell
// ------------------------------

function Shell({ children }: { children?: React.ReactNode }) {
  const [expanded, setExpanded] = useState<string[]>(["dashboard", "accounting", "sales", "inventory"]);
  const [active, setActive] = useState<{ main: string; sub: string }>({ main: "dashboard", sub: "overview" });
  const [mobileOpen, setMobileOpen] = useState(false);

  const pageKey = useMemo(() => `${active.main}:${active.sub}`, [active]);
  const Page = ROUTES[pageKey];

  useEffect(() => {
    // Close mobile drawer on desktop resize
    const onResize = () => {
      if (window.innerWidth >= 768) setMobileOpen(false);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return (
    <div className="flex min-h-dvh w-full bg-zinc-950 text-white">
      <Sidebar
        expanded={expanded}
        setExpanded={setExpanded}
        active={active}
        setActive={setActive}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />

      <div className="relative flex min-w-0 flex-1 flex-col">
        <TopBar onToggleSidebar={() => setMobileOpen(true)} />

        <main className="relative flex-1 overflow-y-auto p-3 sm:p-4">
          <NeonBackground />
          {children ? (
            children
          ) : Page ? (
            <Page />
          ) : (
            <ComingSoon
              title={`${active.main.toUpperCase()} — ${active.sub.replace(/(^|\s)\S/g, (t) => t.toUpperCase())}`}
            />
          )}
        </main>

        <footer className="border-t border-zinc-800 px-3 py-2 text-[11px] text-zinc-400 sm:px-4">
          © {new Date().getFullYear()} LedgerPlus — Built for clarity, speed, and scale
        </footer>
      </div>
    </div>
  );
}

export default Shell;
export { Shell as LedgerLayout };
