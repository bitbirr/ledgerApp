import React, { useMemo, useState } from "react";
import {
  LayoutGrid,
  Wallet,
  Receipt,
  FileText,
  Settings as SettingsIcon,
  ChartBar,
  ListChecks,
  RefreshCw,
  Banknote,
  Building2,
  Store,
  Search,
  CalendarIcon,
  ChevronDown,
  ChevronUp,
  Bell,
  Plus,
  Download,
  Filter,
  BadgeDollarSign,
  ArrowUpRight,
  ArrowDownRight,
  Package,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";

/**
 * LedgerPlus – Business-side Dashboard
 *
 * Menu structure:
 *  Dashboard
 *   ├─ Accounts
 *   ├─ Cashbook
 *   ├─ Invoices
 *   ├─ Inventory
 *   ├─ Reports
 *   └─ Settings
 *  BusinessInfo
 *
 * Scope hierarchy: Business → Branch → Credentials
 */

export default function LedgerLayout() {
  // ----- Global selectors
  const [business, setBusiness] = useState("Dugsinet Holdings");
  const [branch, setBranch] = useState("Addis Ababa – Bole");
  const [period] = useState("This Month");
  const [openRight, setOpenRight] = useState(false);

  // Left menu state
  const [dashboardOpen, setDashboardOpen] = useState(true);
  const [page, setPage] = useState<
    "accounts" | "cashbook" | "invoices" | "inventory" | "reports" | "settings" | "businessinfo"
  >("accounts");

  // Example KPIs
  const kpis = useMemo(
    () => [
      { key: "inflow", label: "Inflow", value: "ETB 254,300", change: +12.4, icon: ArrowUpRight },
      { key: "outflow", label: "Outflow", value: "ETB 199,120", change: -3.1, icon: ArrowDownRight },
      { key: "balance", label: "Cash Balance", value: "ETB 55,180", change: +9.7, icon: BadgeDollarSign },
    ],
    []
  );

  return (
    <div className="min-h-screen w-full bg-[radial-gradient(80rem_80rem_at_50%_-10%,#0f766e10,transparent_60%)]">
      {/* Top bar */}
      <header className="sticky top-0 z-40 border-b bg-white/70 backdrop-blur supports-[backdrop-filter]:bg-white/60">
        <div className="mx-auto flex max-w-7xl items-center gap-3 px-3 py-2 md:px-6">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-700 text-white shadow-sm">
              <LayoutGrid className="h-5 w-5" />
            </div>
            <div className="hidden flex-col leading-tight md:flex">
              <span className="text-sm font-semibold tracking-wide text-teal-800">LedgerPlus</span>
              <span className="text-[11px] text-muted-foreground">Business Dashboard</span>
            </div>
          </div>

          {/* Scope pickers */}
          <div className="ml-auto flex flex-1 items-center justify-end gap-2 sm:ml-0">
            <Select value={business} onValueChange={setBusiness}>
              <SelectTrigger className="w-44">
                <SelectValue placeholder="Select business" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Dugsinet Holdings">Dugsinet Holdings</SelectItem>
                <SelectItem value="LedgerPlus Retail PLC">LedgerPlus Retail PLC</SelectItem>
                <SelectItem value="Blue Nile Foods">Blue Nile Foods</SelectItem>
              </SelectContent>
            </Select>
            <Select value={branch} onValueChange={setBranch}>
              <SelectTrigger className="w-56">
                <SelectValue placeholder="Select branch" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Addis Ababa – Bole">Addis Ababa – Bole</SelectItem>
                <SelectItem value="Addis Ababa – Sarbet">Addis Ababa – Sarbet</SelectItem>
                <SelectItem value="Adama – Main">Adama – Main</SelectItem>
              </SelectContent>
            </Select>

            <div className="hidden items-center gap-2 md:flex">
              <div className="relative">
                <Search className="pointer-events-none absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input className="pl-8" placeholder="Search accounts, vouchers, …" />
              </div>
              <Button variant="outline" className="gap-2">
                <CalendarIcon className="h-4 w-4" />
                {period}
              </Button>
              <Button variant="ghost" size="icon" aria-label="Notifications">
                <Bell className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main */}
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-4 px-3 py-4 md:grid-cols-[240px_1fr] md:px-6">
        {/* Sidebar */}
        <aside className="hidden rounded-2xl border bg-white/60 p-2 shadow-sm md:block">
          {/* Collapsible Dashboard group */}
          <button
            className={cn(
              "flex w-full items-center justify-between rounded-xl px-3 py-2 text-sm font-semibold hover:bg-teal-50",
              "text-teal-900"
            )}
            onClick={() => setDashboardOpen((s) => !s)}
          >
            <span className="flex items-center gap-2">
              <ChartBar className="h-4 w-4" /> Dashboard
            </span>
            {dashboardOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
          {dashboardOpen && (
            <div className="mt-1 space-y-1 pl-2">
              <SubItem icon={LayoutGrid} label="Accounts" active={page === "accounts"} onClick={() => setPage("accounts")} />
              <SubItem icon={Wallet} label="Cashbook" active={page === "cashbook"} onClick={() => setPage("cashbook")} />
              <SubItem icon={Receipt} label="Invoices" active={page === "invoices"} onClick={() => setPage("invoices")} />
              <SubItem icon={Package} label="Inventory" active={page === "inventory"} onClick={() => setPage("inventory")} />
              <SubItem icon={FileText} label="Reports" active={page === "reports"} onClick={() => setPage("reports")} />
              <SubItem icon={SettingsIcon} label="Settings" active={page === "settings"} onClick={() => setPage("settings")} />
            </div>
          )}

          <div className="mt-2 border-t" />
          <button
            className={cn(
              "mt-2 flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm",
              page === "businessinfo" ? "bg-teal-700 text-white" : "hover:bg-teal-50"
            )}
            onClick={() => setPage("businessinfo")}
          >
            <Building2 className="h-4 w-4" />
            <span>BusinessInfo</span>
          </button>

          <div className="mt-3 rounded-xl bg-gradient-to-br from-teal-700 to-teal-600 p-3 text-white">
            <div className="flex items-center gap-2 text-xs opacity-90">
              <Building2 className="h-4 w-4" /> {business}
            </div>
            <div className="mt-1 flex items-center gap-2 text-xs opacity-90">
              <Store className="h-4 w-4" /> {branch}
            </div>
            <div className="mt-2 text-[11px] opacity-90">Scope controls which data you see and edit.</div>
          </div>
        </aside>

        {/* Content area */}
        <main className="flex min-w-0 flex-col gap-4">
          {/* KPI Row (hide when Settings or BusinessInfo to reduce clutter) */}
          {page !== "settings" && page !== "businessinfo" && (
            <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {kpis.map((k) => (
                <Card key={k.key} className="rounded-2xl">
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center justify-between text-sm font-medium text-muted-foreground">
                      {k.label}
                      <k.icon className="h-4 w-4" />
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex items-end justify-between">
                    <div className="text-2xl font-semibold tracking-tight">{k.value}</div>
                    <Badge className={cn("translate-y-1", k.change >= 0 ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700")}>
                      {k.change >= 0 ? "+" : ""}
                      {k.change}%
                    </Badge>
                  </CardContent>
                </Card>
              ))}
            </section>
          )}

          {/* Tabs mirror the sidebar for keyboard/quick access, but controlled by state */}
          <section className="rounded-2xl border bg-white/70 p-3 shadow-sm">
            <Tabs value={page} onValueChange={(v) => setPage(v as typeof page)}>
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <TabsList className="w-full md:w-auto overflow-x-auto">
                  <TabsTrigger value="accounts" className="gap-2"><LayoutGrid className="h-4 w-4" /> Accounts</TabsTrigger>
                  <TabsTrigger value="cashbook" className="gap-2"><Wallet className="h-4 w-4" /> Cashbook</TabsTrigger>
                  <TabsTrigger value="invoices" className="gap-2"><Receipt className="h-4 w-4" /> Invoices</TabsTrigger>
                  <TabsTrigger value="inventory" className="gap-2"><Package className="h-4 w-4" /> Inventory</TabsTrigger>
                  <TabsTrigger value="reports" className="gap-2"><FileText className="h-4 w-4" /> Reports</TabsTrigger>
                  <TabsTrigger value="settings" className="gap-2"><SettingsIcon className="h-4 w-4" /> Settings</TabsTrigger>
                  <TabsTrigger value="businessinfo" className="gap-2"><Building2 className="h-4 w-4" /> BusinessInfo</TabsTrigger>
                </TabsList>

                {/* Contextual actions */}
                <div className="flex flex-wrap items-center gap-2">
                  {page !== "settings" && page !== "businessinfo" && (
                    <>
                      <Button variant="outline" className="gap-2">
                        <Filter className="h-4 w-4" /> Filters
                      </Button>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button className="gap-2">
                            <Plus className="h-4 w-4" /> New Entry
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-xl">
                          <DialogHeader>
                            <DialogTitle>New Cash Entry</DialogTitle>
                          </DialogHeader>
                          <EntryForm />
                        </DialogContent>
                      </Dialog>
                      <Button variant="outline" className="gap-2">
                        <Download className="h-4 w-4" /> Export
                      </Button>
                      <Sheet open={openRight} onOpenChange={setOpenRight}>
                        <SheetTrigger asChild>
                          <Button variant="secondary" className="gap-2">
                            <Banknote className="h-4 w-4" /> Cash Drawer
                          </Button>
                        </SheetTrigger>
                        <SheetContent side="right" className="w-full sm:max-w-lg">
                          <SheetHeader>
                            <SheetTitle>Cash Drawer – {branch}</SheetTitle>
                          </SheetHeader>
                          <RightPanel />
                        </SheetContent>
                      </Sheet>
                    </>
                  )}
                </div>
              </div>

              <TabsContent value="accounts" className="mt-4"><AccountsView /></TabsContent>
              <TabsContent value="cashbook" className="mt-4"><CashbookView /></TabsContent>
              <TabsContent value="invoices" className="mt-4"><InvoicesView /></TabsContent>
              <TabsContent value="inventory" className="mt-4"><InventoryView /></TabsContent>
              <TabsContent value="reports" className="mt-4"><ReportsView /></TabsContent>
              <TabsContent value="settings" className="mt-4"><SettingsView /></TabsContent>
              <TabsContent value="businessinfo" className="mt-4"><BusinessInfoView business={business} branch={branch} /></TabsContent>
            </Tabs>
          </section>
        </main>
      </div>

      {/* Mobile bottom bar */}
      <MobileDock page={page} setPage={setPage} />
    </div>
  );
}

// -------------------- Sidebar helpers --------------------
function SubItem({ icon: Icon, label, active, onClick }: { icon: any; label: string; active?: boolean; onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm transition",
        active ? "bg-teal-700 text-white shadow-sm" : "hover:bg-teal-50"
      )}
    >
      <Icon className="h-4 w-4" />
      <span>{label}</span>
    </button>
  );
}

// -------------------- Views --------------------
function AccountsView() {
  const accounts = [
    { code: "1000", name: "Cash on Hand", type: "Asset", bal: 55180 },
    { code: "1010", name: "Bank – CBE", type: "Asset", bal: 302100 },
    { code: "2000", name: "Accounts Payable", type: "Liability", bal: -42100 },
  ];
  return (
    <Card className="rounded-2xl">
      <CardHeader className="pb-2"><CardTitle className="text-base">Accounts</CardTitle></CardHeader>
      <CardContent>
        <div className="overflow-auto rounded-xl border">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-left">
              <tr>
                <Th>Code</Th>
                <Th>Name</Th>
                <Th>Type</Th>
                <Th className="text-right">Balance</Th>
              </tr>
            </thead>
            <tbody>
              {accounts.map((a) => (
                <tr key={a.code} className="border-t hover:bg-teal-50/40">
                  <Td>{a.code}</Td>
                  <Td className="max-w-[320px] truncate">{a.name}</Td>
                  <Td>{a.type}</Td>
                  <Td className="text-right font-medium">{fmt(a.bal)}</Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

function CashbookView() {
  // reuse former LedgerTable rows
  const rows = [
    { date: "2025-08-01", ref: "VCH-1001", desc: "Opening Balance", debit: 0, credit: 55180, bal: 55180 },
    { date: "2025-08-02", ref: "RCPT-2034", desc: "Sales – EBIRR", debit: 0, credit: 12000, bal: 67180 },
    { date: "2025-08-02", ref: "PMT-8891", desc: "Supplier – Awash Bank", debit: 8200, credit: 0, bal: 58980 },
    { date: "2025-08-03", ref: "RCPT-2038", desc: "Sales – CBE", debit: 0, credit: 15400, bal: 74380 },
  ];
  return (
    <Card className="rounded-2xl">
      <CardHeader className="pb-2"><CardTitle className="text-base">Cashbook</CardTitle></CardHeader>
      <CardContent>
        <div className="overflow-auto rounded-xl border">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-left">
              <tr>
                <Th>Date</Th>
                <Th>Ref</Th>
                <Th>Description</Th>
                <Th className="text-right">Debit</Th>
                <Th className="text-right">Credit</Th>
                <Th className="text-right">Balance</Th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={i} className="border-t hover:bg-teal-50/40">
                  <Td>{r.date}</Td>
                  <Td>{r.ref}</Td>
                  <Td className="max-w-[320px] truncate">{r.desc}</Td>
                  <Td className="text-right">{fmt(r.debit)}</Td>
                  <Td className="text-right">{fmt(r.credit)}</Td>
                  <Td className="text-right font-medium">{fmt(r.bal)}</Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

function InvoicesView() {
  return (
    <Card className="rounded-2xl">
      <CardHeader className="pb-2"><CardTitle className="text-base">Invoices</CardTitle></CardHeader>
      <CardContent>
        <PlaceholderList />
      </CardContent>
    </Card>
  );
}

function InventoryView() {
  const items = [
    { sku: "TEA-001", name: "Green Tea 250g", stock: 42, uom: "pcs" },
    { sku: "SUG-005", name: "Sugar 1kg", stock: 120, uom: "bag" },
    { sku: "COF-010", name: "Coffee Beans 500g", stock: 18, uom: "bag" },
  ];
  return (
    <Card className="rounded-2xl">
      <CardHeader className="pb-2"><CardTitle className="text-base">Inventory</CardTitle></CardHeader>
      <CardContent>
        <div className="overflow-auto rounded-xl border">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-left">
              <tr>
                <Th>SKU</Th>
                <Th>Item</Th>
                <Th className="text-right">On Hand</Th>
                <Th>UoM</Th>
              </tr>
            </thead>
            <tbody>
              {items.map((it) => (
                <tr key={it.sku} className="border-t hover:bg-teal-50/40">
                  <Td>{it.sku}</Td>
                  <Td className="max-w-[320px] truncate">{it.name}</Td>
                  <Td className="text-right font-medium">{it.stock}</Td>
                  <Td>{it.uom}</Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

function ReportsView() {
  return (
    <Card className="rounded-2xl">
      <CardHeader className="pb-2"><CardTitle className="text-base">Reports</CardTitle></CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <ReportTile title="Cash Flow" description="Period inflow/outflow with method split (CBE, EBIRR, Awash, etc.)" />
          <ReportTile title="Aging" description="Receivables & payables buckets" />
          <ReportTile title="Daily Summary" description="Sales and payments by day" />
          <ReportTile title="Tax" description="VAT / Withholding summary" />
        </div>
      </CardContent>
    </Card>
  );
}

function SettingsView() {
  return (
    <Card className="rounded-2xl">
      <CardHeader className="pb-2"><CardTitle className="text-base">Settings</CardTitle></CardHeader>
      <CardContent className="space-y-4 text-sm">
        <div className="rounded-xl border p-3">
          <div className="font-semibold">General</div>
          <div className="mt-1 text-muted-foreground">Fiscal year, currency, numbering.</div>
        </div>
        <div className="rounded-xl border p-3">
          <div className="font-semibold">Payment Methods</div>
          <div className="mt-1 text-muted-foreground">Configure CBE, EBIRR, Awash, Dashen, Abyssinia.</div>
        </div>
      </CardContent>
    </Card>
  );
}

function BusinessInfoView({ business, branch }: { business: string; branch: string }) {
  return (
    <Card className="rounded-2xl">
      <CardHeader className="pb-2"><CardTitle className="text-base">Business Information</CardTitle></CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <InfoKV label="Business" value={business} />
          <InfoKV label="Branch" value={branch} />
          <InfoKV label="TIN" value="000-123-456" />
          <InfoKV label="Address" value="Bole, Addis Ababa" />
          <InfoKV label="Phone" value="+251 9 12 34 56 78" />
          <InfoKV label="Email" value="accounts@dugsinet.et" />
        </div>
        <div className="rounded-xl border p-3 text-sm text-muted-foreground">
          Manage registration details, tax numbers, and contact data. (Wire to your API.)
        </div>
      </CardContent>
    </Card>
  );
}

// -------------------- Shared pieces --------------------
function ReportTile({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-xl border p-4">
      <div className="text-sm font-semibold">{title}</div>
      <div className="mt-1 text-sm text-muted-foreground">{description}</div>
      <div className="mt-3 h-24 rounded-lg bg-gradient-to-tr from-teal-50 to-white" />
    </div>
  );
}

function PlaceholderList() {
  return (
    <div className="space-y-2">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="flex items-center justify-between gap-3 rounded-xl border p-3">
          <div className="flex min-w-0 items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-teal-100" />
            <div className="min-w-0">
              <div className="truncate text-sm font-medium">Sample row {i + 1}</div>
              <div className="truncate text-xs text-muted-foreground">Description and metadata go here…</div>
            </div>
          </div>
          <div className="text-sm font-medium">ETB {(i + 1) * 1370}</div>
        </div>
      ))}
    </div>
  );
}

function EntryForm() {
  return (
    <form className="space-y-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <Label>Type</Label>
          <Select defaultValue="receipt">
            <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="receipt">Receipt</SelectItem>
              <SelectItem value="payment">Payment</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Method</Label>
          <Select defaultValue="cbe">
            <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="cash">Cash</SelectItem>
              <SelectItem value="cbe">CBE</SelectItem>
              <SelectItem value="ebirr">EBIRR</SelectItem>
              <SelectItem value="awash">Awash</SelectItem>
              <SelectItem value="dashen">Dashen</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Amount (ETB)</Label>
          <Input className="mt-1" type="number" placeholder="0.00" />
        </div>
        <div>
          <Label>Counterparty</Label>
          <Input className="mt-1" placeholder="Customer / Supplier" />
        </div>
        <div className="sm:col-span-2">
          <Label>Memo</Label>
          <Input className="mt-1" placeholder="Optional note" />
        </div>
      </div>
      <div className="flex items-center justify-end gap-2">
        <Button variant="outline">Cancel</Button>
        <Button>Save Entry</Button>
      </div>
    </form>
  );
}

function RightPanel() {
  const [expanded, setExpanded] = useState(true);
  return (
    <ScrollArea className="h-[85vh] pr-3">
      <div className="space-y-4">
        <Card className="rounded-2xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Till Snapshot</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <KV label="Opening Float" value="ETB 5,000" />
            <KV label="Receipts" value="ETB 38,200" />
            <KV label="Payments" value="ETB -22,100" />
            <KV label="Expected" value="ETB 21,100" />
          </CardContent>
        </Card>

        <Card className="rounded-2xl">
          <CardHeader className="pb-0">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Payment Methods</CardTitle>
              <Button variant="ghost" size="icon" onClick={() => setExpanded((s) => !s)}>
                {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </Button>
            </div>
          </CardHeader>
          {expanded && (
            <CardContent className="mt-2 grid grid-cols-2 gap-2 text-sm">
              {[
                { name: "Cash", amt: 9100 },
                { name: "CBE", amt: 15400 },
                { name: "EBIRR", amt: 10200 },
                { name: "Awash", amt: 4200 },
                { name: "Dashen", amt: 1700 },
                { name: "Abyssinia", amt: 900 },
              ].map((m) => (
                <div key={m.name} className="flex items-center justify-between rounded-xl border p-2">
                  <span>{m.name}</span>
                  <span className="font-medium">{fmt(m.amt)}</span>
                </div>
              ))}
            </CardContent>
          )}
        </Card>

        <Card className="rounded-2xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            <Button className="gap-2" variant="secondary">
              <Plus className="h-4 w-4" /> Add Receipt
            </Button>
            <Button className="gap-2" variant="outline">
              <Plus className="h-4 w-4" /> Add Payment
            </Button>
            <Button className="gap-2" variant="outline">
              <Download className="h-4 w-4" /> Z Report
            </Button>
          </CardContent>
        </Card>
      </div>
    </ScrollArea>
  );
}

function MobileDock({ page, setPage }: { page: string; setPage: (p: any) => void }) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t bg-white/90 backdrop-blur md:hidden">
      <div className="mx-auto grid max-w-3xl grid-cols-5 gap-1 px-3 py-1">
        <DockItem icon={LayoutGrid} label="Accounts" active={page === "accounts"} onClick={() => setPage("accounts")} />
        <DockItem icon={Wallet} label="Cashbook" active={page === "cashbook"} onClick={() => setPage("cashbook")} />
        <DockItem icon={Plus} label="Add" center />
        <DockItem icon={Receipt} label="Invoices" active={page === "invoices"} onClick={() => setPage("invoices")} />
        <DockItem icon={SettingsIcon} label="Settings" active={page === "settings"} onClick={() => setPage("settings")} />
      </div>
    </div>
  );
}

function DockItem({ icon: Icon, label, active = false, center = false, onClick }: { icon: any; label: string; active?: boolean; center?: boolean; onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex flex-col items-center justify-center gap-1 rounded-xl px-2 py-1 text-xs",
        active ? "text-teal-700" : "text-muted-foreground",
        center && "-translate-y-2 rounded-2xl border bg-white px-3 py-2 shadow"
      )}
    >
      <Icon className="h-5 w-5" />
      <span>{label}</span>
    </button>
  );
}

function Th({ children, className = "" }: React.PropsWithChildren<{ className?: string }>) {
  return <th className={cn("px-3 py-2 text-xs font-semibold", className)}>{children}</th>;
}

function Td({ children, className = "" }: React.PropsWithChildren<{ className?: string }>) {
  return <td className={cn("px-3 py-2", className)}>{children}</td>;
}

function KV({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <div className="text-muted-foreground">{label}</div>
      <div className="font-medium">{value}</div>
    </div>
  );
}

function InfoKV({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border p-3">
      <div className="text-xs uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className="text-sm font-semibold">{value}</div>
    </div>
  );
}

function fmt(n: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "ETB", maximumFractionDigits: 0 }).format(n);
}
