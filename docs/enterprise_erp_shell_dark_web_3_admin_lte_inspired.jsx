import React, { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BarChart2,
  Building2,
  CalendarDays,
  ChevronDown,
  ChevronRight,
  FileBarChart,
  FileText,
  Layers,
  LayoutDashboard,
  LineChart,
  PackageSearch,
  Settings,
  ShoppingCart,
  Users,
  Wallet,
  Workflow,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Bar,
  ComposedChart,
  Line,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

//
// THEME NOTES
// - Dark base: bg-zinc-950 / bg-zinc-900
// - Text: text-white / text-zinc-100
// - Accents: lime-400 (primary), lime-300 (graphics), emerald-400 (secondary)
// - Focus rings & borders use lime-400/500 for Web3 neon vibes
//

// ------------------------------
// Types & Menu Model
// ------------------------------

type SubItem = {
  key: string;
  label: string;
  icon?: React.ReactNode;
};

type MenuItem = {
  key: string;
  label: string;
  icon: React.ReactNode;
  children?: SubItem[];
};

const MENU: MenuItem[] = [
  {
    key: "dashboard",
    label: "Dashboard",
    icon: <LayoutDashboard className="h-5 w-5" />,
    children: [
      { key: "overview", label: "Overview", icon: <BarChart2 className="h-4 w-4" /> },
      { key: "kpi", label: "KPIs", icon: <LineChart className="h-4 w-4" /> },
    ],
  },
  {
    key: "sales",
    label: "Sales",
    icon: <ShoppingCart className="h-5 w-5" />,
    children: [
      { key: "orders", label: "Orders" },
      { key: "invoices", label: "Invoices" },
      { key: "returns", label: "Returns" },
    ],
  },
  {
    key: "inventory",
    label: "Inventory",
    icon: <PackageSearch className="h-5 w-5" />,
    children: [
      { key: "stock", label: "Stock Levels" },
      { key: "transfers", label: "Transfers" },
      { key: "suppliers", label: "Suppliers" },
    ],
  },
  {
    key: "finance",
    label: "Finance",
    icon: <Wallet className="h-5 w-5" />,
    children: [
      { key: "gl", label: "General Ledger" },
      { key: "ap", label: "Payables" },
      { key: "ar", label: "Receivables" },
      { key: "reports", label: "Reports" },
    ],
  },
  {
    key: "hr",
    label: "HR & People",
    icon: <Users className="h-5 w-5" />,
    children: [
      { key: "employees", label: "Employees" },
      { key: "payroll", label: "Payroll" },
      { key: "recruitment", label: "Recruitment" },
    ],
  },
  {
    key: "projects",
    label: "Projects",
    icon: <Workflow className="h-5 w-5" />,
    children: [
      { key: "board", label: "Board" },
      { key: "timeline", label: "Timeline" },
      { key: "reports", label: "Reports" },
    ],
  },
  {
    key: "company",
    label: "Company",
    icon: <Building2 className="h-5 w-5" />,
    children: [
      { key: "branches", label: "Branches" },
      { key: "settings", label: "Settings" },
    ],
  },
];

// ------------------------------
// Fake data for charts
// ------------------------------

const kpiSeries = [
  { name: "Jan", revenue: 42000, cost: 28000, orders: 310 },
  { name: "Feb", revenue: 46000, cost: 30000, orders: 340 },
  { name: "Mar", revenue: 52000, cost: 32000, orders: 360 },
  { name: "Apr", revenue: 58000, cost: 35000, orders: 390 },
  { name: "May", revenue: 61000, cost: 37000, orders: 415 },
  { name: "Jun", revenue: 68000, cost: 42000, orders: 470 },
];

// ------------------------------
// Utility Components
// ------------------------------

function NeonPulse() {
  return (
    <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      <motion.div
        initial={{ opacity: 0.2, scale: 0.9 }}
        animate={{ opacity: 0.45, scale: 1 }}
        transition={{ duration: 4, repeat: Infinity, repeatType: "reverse" }}
        className="absolute left-1/2 top-[-10%] h-64 w-[60rem] -translate-x-1/2 rounded-full bg-lime-500/20 blur-3xl"
      />
      <motion.div
        initial={{ opacity: 0.15, y: 20 }}
        animate={{ opacity: 0.25, y: 0 }}
        transition={{ duration: 5, repeat: Infinity, repeatType: "reverse" }}
        className="absolute bottom-[-10%] left-1/2 h-64 w-[45rem] -translate-x-1/2 rounded-full bg-emerald-400/10 blur-3xl"
      />
    </div>
  );
}

function TopBar() {
  return (
    <div className="sticky top-0 z-40 border-b border-lime-500/20 bg-zinc-950/80 backdrop-blur supports-[backdrop-filter]:bg-zinc-950/60">
      <div className="flex h-14 items-center gap-4 px-4">
        <div className="flex items-center gap-2">
          <div className="h-6 w-6 rounded bg-gradient-to-br from-lime-400 to-emerald-400" />
          <span className="font-semibold tracking-tight text-white">NovaERP</span>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <Input
            placeholder="Search anything…"
            className="h-9 w-64 border-zinc-800 bg-zinc-900 text-white placeholder:text-zinc-400 focus-visible:ring-lime-400"
          />
          <Button className="h-9 border border-lime-500/40 bg-lime-500/20 text-lime-300 hover:bg-lime-500/30">
            Quick Action
          </Button>
        </div>
      </div>
    </div>
  );
}

function Sidebar({
  activeMain,
  setActiveMain,
  activeSub,
  setActiveSub,
}: {
  activeMain: string;
  setActiveMain: (k: string) => void;
  activeSub: string;
  setActiveSub: (k: string) => void;
}) {
  const [openKeys, setOpenKeys] = useState<string[]>(["dashboard"]);

  const toggle = (key: string) => {
    setOpenKeys((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  return (
    <aside className="hidden w-68 shrink-0 border-r border-lime-500/10 bg-zinc-950/90 p-2 text-zinc-200 md:block">
      <NeonPulse />
      <nav className="space-y-1">
        {MENU.map((m) => {
          const isOpen = openKeys.includes(m.key);
          const isActiveMain = activeMain === m.key;
          return (
            <div key={m.key} className="rounded-xl">
              <button
                className={cn(
                  "group flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left transition focus:outline-none",
                  isActiveMain
                    ? "bg-lime-500/15 text-lime-300 ring-1 ring-lime-500/30"
                    : "hover:bg-zinc-900"
                )}
                onClick={() => {
                  setActiveMain(m.key);
                  toggle(m.key);
                  // Default to first child on open
                  if (m.children?.length) setActiveSub(m.children[0].key);
                }}
              >
                <span className={cn("opacity-90 group-hover:opacity-100", isActiveMain && "text-lime-300")}>{m.icon}</span>
                <span className="flex-1 text-sm font-medium">{m.label}</span>
                {m.children && (
                  <span className="text-zinc-400">
                    {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                  </span>
                )}
              </button>
              <AnimatePresence initial={false}>
                {m.children && isOpen && (
                  <motion.ul
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.22 }}
                    className="ml-2 overflow-hidden border-l border-zinc-800 pl-2"
                  >
                    {m.children.map((c) => {
                      const active = activeSub === c.key && isActiveMain;
                      return (
                        <li key={c.key}>
                          <button
                            onClick={() => {
                              setActiveMain(m.key);
                              setActiveSub(c.key);
                            }}
                            className={cn(
                              "group mt-1 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-[13px] transition",
                              active
                                ? "bg-lime-500/15 text-lime-300"
                                : "text-zinc-300 hover:bg-zinc-900"
                            )}
                          >
                            <span className="opacity-80">
                              {c.icon ?? <Layers className="h-3.5 w-3.5" />}
                            </span>
                            <span className="flex-1">{c.label}</span>
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
      <div className="mt-3 border-t border-zinc-800 pt-3">
        <button className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-zinc-300 hover:bg-zinc-900">
          <Settings className="h-4 w-4" />
          Preferences
        </button>
      </div>
    </aside>
  );
}

// ------------------------------
// Dashboard (AdminLTE-inspired)
// ------------------------------

function StatCard({ title, value, delta, icon }: { title: string; value: string; delta?: string; icon: React.ReactNode }) {
  return (
    <Card className="bg-zinc-900 text-zinc-100 shadow-[0_0_0_1px_rgba(163,230,53,.15)]">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between text-sm text-zinc-300">
          {title}
          <span className="text-lime-400">{icon}</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-end justify-between">
          <span className="text-2xl font-semibold text-white">{value}</span>
          {delta && (
            <span className="text-xs text-emerald-400">{delta}</span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function Dashboard() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Revenue" value="$68,000" delta="↑ 7.3% MoM" icon={<FileBarChart className="h-4 w-4" />} />
        <StatCard title="Orders" value="470" delta="↑ 4.6%" icon={<ShoppingCart className="h-4 w-4" />} />
        <StatCard title="Active Projects" value="32" delta="—" icon={<Workflow className="h-4 w-4" />} />
        <StatCard title="Headcount" value="143" delta="+3" icon={<Users className="h-4 w-4" />} />
      </div>

      <Card className="bg-zinc-900 text-zinc-100">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-white">Performance Overview</CardTitle>
            <div className="flex items-center gap-2">
              <Button variant="outline" className="h-8 border-lime-500/30 bg-zinc-950 text-zinc-200 hover:bg-zinc-900">
                Export
              </Button>
              <Button className="h-8 border border-lime-500/40 bg-lime-500/20 text-lime-300 hover:bg-lime-500/30">
                Analyze
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={kpiSeries} margin={{ top: 10, right: 20, bottom: 0, left: 0 }}>
              <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
              <XAxis dataKey="name" stroke="#a1a1aa" tickLine={false} axisLine={{ stroke: "#3f3f46" }} />
              <YAxis stroke="#a1a1aa" tickLine={false} axisLine={{ stroke: "#3f3f46" }} />
              <Tooltip contentStyle={{ background: "#09090b", border: "1px solid rgba(163,230,53,.25)", color: "#fff" }} />
              <Area type="monotone" dataKey="revenue" fill="#bef26433" stroke="#bef264" strokeWidth={2} />
              <Bar dataKey="orders" barSize={16} fill="#84cc1633" />
              <Line type="monotone" dataKey="cost" stroke="#22c55e" strokeWidth={2} dot={false} />
            </ComposedChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <Card className="bg-zinc-900 text-zinc-100 xl:col-span-2">
          <CardHeader>
            <CardTitle className="text-white">Sales Velocity</CardTitle>
          </CardHeader>
          <CardContent className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={kpiSeries} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
                <XAxis dataKey="name" stroke="#a1a1aa" tickLine={false} axisLine={{ stroke: "#3f3f46" }} />
                <YAxis stroke="#a1a1aa" tickLine={false} axisLine={{ stroke: "#3f3f46" }} />
                <Tooltip contentStyle={{ background: "#09090b", border: "1px solid rgba(163,230,53,.25)", color: "#fff" }} />
                <Area type="monotone" dataKey="orders" stroke="#a3e635" fill="#a3e63522" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900 text-zinc-100">
          <CardHeader>
            <CardTitle className="text-white">Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {[
                { t: "Invoice #INV-2025 sent", time: "2m ago" },
                { t: "Stock transfer approved (BR-002)", time: "1h ago" },
                { t: "New hire onboarded: Sara K.", time: "4h ago" },
                { t: "PO #PO-104 fulfilled", time: "Yesterday" },
              ].map((i) => (
                <li key={i.t} className="flex items-center gap-3">
                  <div className="h-2.5 w-2.5 rounded-full bg-lime-400" />
                  <div className="flex-1 text-sm text-zinc-200">{i.t}</div>
                  <span className="text-xs text-zinc-400">{i.time}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ------------------------------
// Shell & Router-lite
// ------------------------------

function ScreenTitle({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-4 flex items-center justify-between">
      <div>
        <h1 className="text-xl font-semibold text-white">{title}</h1>
        {subtitle && <p className="text-sm text-zinc-400">{subtitle}</p>}
      </div>
      <div className="flex items-center gap-2">
        <Button variant="outline" className="h-8 border-lime-500/30 bg-zinc-950 text-zinc-200 hover:bg-zinc-900">
          <CalendarDays className="mr-1 h-4 w-4" /> This Month
        </Button>
        <Button className="h-8 border border-lime-500/40 bg-lime-500/20 text-lime-300 hover:bg-lime-500/30">
          <FileText className="mr-1 h-4 w-4" /> New
        </Button>
      </div>
    </div>
  );
}

function Placeholder({ label }: { label: string }) {
  return (
    <div className="grid h-[50vh] place-items-center rounded-xl border border-dashed border-lime-500/20 bg-zinc-900/60 p-6 text-center">
      <div>
        <p className="text-2xl font-semibold text-white">{label}</p>
        <p className="mt-1 text-zinc-400">All content renders inside this application shell.</p>
      </div>
    </div>
  );
}

function ContentRouter({ main, sub }: { main: string; sub: string }) {
  const node = useMemo(() => {
    if (main === "dashboard" && ["overview", "kpi"].includes(sub)) {
      return (
        <>
          <ScreenTitle title="Executive Dashboard" subtitle="AdminLTE-inspired widgets with a Web3 twist" />
          <Dashboard />
        </>
      );
    }

    // Other sections render placeholders to illustrate nested routing
    const pretty = `${main.toUpperCase()} — ${sub.replace(/(^|\s)\S/g, (t) => t.toUpperCase())}`;
    return (
      <>
        <ScreenTitle title={pretty} subtitle="Enterprise module area" />
        <Placeholder label={`${pretty} content`} />
      </>
    );
  }, [main, sub]);

  return <div className="p-4">{node}</div>;
}

export default function EnterpriseERPShell() {
  const [activeMain, setActiveMain] = useState<string>("dashboard");
  const [activeSub, setActiveSub] = useState<string>("overview");

  return (
    <div className="flex h-dvh w-full bg-zinc-950 text-white">
      <Sidebar
        activeMain={activeMain}
        setActiveMain={setActiveMain}
        activeSub={activeSub}
        setActiveSub={setActiveSub}
      />

      <div className="relative flex min-w-0 flex-1 flex-col">
        <TopBar />
        <main className="relative flex-1 overflow-y-auto">
          <NeonPulse />
          <ContentRouter main={activeMain} sub={activeSub} />
        </main>
        <footer className="border-t border-zinc-800 px-4 py-2 text-xs text-zinc-400">
          © {new Date().getFullYear()} NovaERP — Built for clarity, speed, and scale
        </footer>
      </div>
    </div>
  );
}

// ------------------------------
// Quick Tailwind suggestions (add to globals.css if needed):
// :root { color-scheme: dark; }
// .glass { @apply bg-zinc-900/60 backdrop-blur supports-[backdrop-filter]:bg-zinc-900/40; }
// .ring-neon { box-shadow: 0 0 0 1px rgba(163,230,53,.25), 0 0 40px rgba(163,230,53,.08) inset; }
