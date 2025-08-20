import React, { useEffect, useMemo, useState } from "react";
import {
  LayoutGrid, Wallet, Receipt, FileText, Settings as SettingsIcon, ChartBar,
  ChevronDown, ChevronUp, Bell, Plus, Download, Banknote, Building2, Store,
  Search, CalendarIcon, ArrowUpRight, ArrowDownRight, Package, Menu
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

// ⬇️ use your API (uploaded as api.ts). Change the path to where you export it in your app.
import { api } from "@/lib/api";
import { useAuthStore } from "@/lib/auth-store";

// ---- Types (reuse your api.ts types if exported; else define light mirrors) ----
type ID = string;

type Business = {
  id: ID;
  name: string;
};

type Branch = {
  id: ID;
  name: string;
  businessId: ID;
};

// Define types that match what the component expects but are compatible with the API
type Account = {
  id: ID;
  code?: string;
  name: string;
  type: string;
  businessId: ID;
  archived?: boolean;
};

type CashbookEntry = {
  id: ID;
  businessId: ID;
  date: string;     // Will map from dateTime
  ref?: string;     // Will map from note
  description?: string; // Will map from note
  debit: number;    // Will calculate from direction and amount
  credit: number;   // Will calculate from direction and amount
  balance?: number; // Will need to calculate or get from API if available
};

type Invoice = {
  id: ID;
  businessId: ID;
  branchId?: ID;
  number: string;   // Will map from invoiceNumber
  date: string;     // Will map from issueDate
  customer?: string; // Will map from customerId (need to get customer name separately)
  total: number;    // Will convert from string
  status?: string;  // Will map from status
};

type Item = {
  id: ID;
  name: string;
  rate: number;
  uom: string;
  businessId: ID;
};

interface LedgerLayoutProps {
  children?: React.ReactNode;
}

export function LedgerLayout({ children }: LedgerLayoutProps) {
  // Get user ID from auth store
  const { user } = useAuthStore();
  const sessionUserId = user?.id;

  // ---- Global scope (business, branch) loaded from API instead of static ----
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [businessId, setBusinessId] = useState<ID | null>(null);
  const [branchId, setBranchId] = useState<ID | null>(null);

  // Pretty labels for the selectors (fallback to names once loaded)
  const [businessLabel, setBusinessLabel] = useState("Select business");
  const [branchLabel, setBranchLabel] = useState("Select branch");

  // Period (for now static text; you likely have date filters elsewhere)
  const [period] = useState("This Month");

  const [openRight, setOpenRight] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Left menu state
  const [dashboardOpen, setDashboardOpen] = useState(true);
  const [page, setPage] = useState<
    "accounts" | "cashbook" | "invoices" | "inventory" | "reports" | "settings" | "businessinfo"
  >("accounts");

  // ---- Data for views (fetched) ----
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [cashbook, setCashbook] = useState<CashbookEntry[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [items, setItems] = useState<Item[]>([]);

  // ---- Loading / error states ----
  const [loadingBusinesses, setLoadingBusinesses] = useState(false);
  const [loadingBranches, setLoadingBranches] = useState(false);
  const [loadingAccounts, setLoadingAccounts] = useState(false);
  const [loadingCashbook, setLoadingCashbook] = useState(false);
  const [loadingInvoices, setLoadingInvoices] = useState(false);
  const [loadingItems, setLoadingItems] = useState(false);

  const [err, setErr] = useState<string | null>(null);

  // ---- Bootstrap: businesses + default branch ----
  useEffect(() => {
    let ignore = false;
    (async () => {
      try {
        setLoadingBusinesses(true);
        setErr(null);
        // Fetch businesses user has access to
        const bs = await api.getBusinesses(); // expects auth token in headers
        if (ignore) return;
        setBusinesses(bs || []);
        if (bs?.length) {
          setBusinessId(bs[0].id);
          setBusinessLabel(bs[0].name);
        }
      } catch (e: any) {
        if (!ignore) setErr(e?.message || "Failed to load businesses");
      } finally {
        if (!ignore) setLoadingBusinesses(false);
      }
    })();
    return () => { ignore = true; };
  }, []);

  // ---- Load branches whenever business changes ----
  useEffect(() => {
    if (!businessId) return;
    let ignore = false;
    (async () => {
      try {
        setLoadingBranches(true);
        setErr(null);

        // If you need public branches (no auth), use getBranchesPublic(businessId)
        // otherwise use the authed route:
        const brs = await (api.getBranches ? api.getBranches(businessId) : api.getBranchesPublic(businessId));
        if (ignore) return;

        setBranches(brs || []);
        if (brs?.length) {
          setBranchId(brs[0].id);
          setBranchLabel(brs[0].name);
        } else {
          setBranchId(null);
          setBranchLabel("No branches");
        }
      } catch (e: any) {
        if (!ignore) setErr(e?.message || "Failed to load branches");
      } finally {
        if (!ignore) setLoadingBranches(false);
      }
    })();
    return () => { ignore = true; };
  }, [businessId]);

  // ---- Load each view’s data when scope changes ----
  useEffect(() => {
    if (!businessId) return;
    let ignore = false;

    (async () => {
      try {
        setLoadingAccounts(true);
        // Only call API if we have a valid sessionUserId
        if (sessionUserId) {
          const apiAccounts = await api.getAccounts(businessId, sessionUserId);
          if (!ignore) setAccounts(apiAccounts.map(transformAccount) || []);
        } else {
          // Handle case when user ID is not available
          if (!ignore) {
            setAccounts([]);
            setErr("User session not available");
          }
        }
      } catch (e: any) {
        if (!ignore) setErr(e?.message || "Failed to load accounts");
      } finally {
        if (!ignore) setLoadingAccounts(false);
      }
    })();
    
        (async () => {
          try {
            setLoadingCashbook(true);
            // You can pass startDate/endDate if you have filters
            const apiEntries = await api.getCashbookEntries(businessId);
            if (!ignore) setCashbook(apiEntries.map(transformCashbookEntry) || []);
          } catch (e: any) {
            if (!ignore) setErr(e?.message || "Failed to load cashbook");
          } finally {
            if (!ignore) setLoadingCashbook(false);
          }
        })();
    
        (async () => {
          try {
            setLoadingInvoices(true);
            const apiInvoices = await api.getInvoices(businessId, branchId || undefined);
            if (!ignore) setInvoices(apiInvoices.map(transformInvoice) || []);
          } catch (e: any) {
            if (!ignore) setErr(e?.message || "Failed to load invoices");
          } finally {
            if (!ignore) setLoadingInvoices(false);
          }
        })();

    (async () => {
      try {
        setLoadingItems(true);
        const list = await api.getItems(businessId);
        if (!ignore) setItems(list || []);
      } catch (e: any) {
        if (!ignore) setErr(e?.message || "Failed to load items");
      } finally {
        if (!ignore) setLoadingItems(false);
      }
    })();

    // Optionally: load preferences and set defaults (currency, fiscal year, etc.)
    (async () => {
      try {
        // If you store UI defaults in preferences:
        // const prefs = await api.getPreferences(businessId);
        // use prefs to set default period etc.
      } catch {
        // non-fatal
      }
    })();

    return () => { ignore = true; };
  }, [businessId, branchId]);


  const businessName = useMemo(() => businesses.find(b => b.id === businessId)?.name ?? businessLabel, [businessId, businesses, businessLabel]);
    const branchName = useMemo(() => branches.find(b => b.id === branchId)?.name ?? branchLabel, [branchId, branches, branchLabel]);
  
    // Helper functions to transform API data to component format
    const transformAccount = (apiAccount: import('@/lib/api').Account): Account => ({
      id: apiAccount.id,
      code: '', // API doesn't have code field, set default
      name: apiAccount.name,
      type: apiAccount.type,
      businessId: apiAccount.businessId,
      archived: apiAccount.archived,
    });
  
    const transformCashbookEntry = (apiEntry: import('@/lib/api').CashbookEntry): CashbookEntry => ({
      id: apiEntry.id,
      businessId: apiEntry.businessId,
      date: apiEntry.dateTime,
      ref: apiEntry.note ?? '',
      description: apiEntry.note ?? '',
      // Convert direction and amount to debit/credit
      debit: apiEntry.direction === 'in' ? parseFloat(apiEntry.amount) || 0 : 0,
      credit: apiEntry.direction === 'out' ? parseFloat(apiEntry.amount) || 0 : 0,
      balance: 0, // Will need to calculate this separately if needed
    });
  
    const transformInvoice = (apiInvoice: import('@/lib/api').Invoice): Invoice => ({
      id: apiInvoice.id,
      businessId: apiInvoice.businessId,
      branchId: apiInvoice.branchId,
      number: apiInvoice.invoiceNumber,
      date: apiInvoice.issueDate,
      customer: '', // Need to fetch customer name separately
      total: parseFloat(apiInvoice.total) || 0,
      status: apiInvoice.status,
    });
  
    // Update KPI calculation to work with transformed data
    const kpis = useMemo(() => {
      if (!cashbook?.length) {
        return [
          { key: "inflow", label: "Inflow", value: "—", change: 0, icon: ArrowUpRight },
          { key: "outflow", label: "Outflow", value: "—", change: 0, icon: ArrowDownRight },
          { key: "balance", label: "Cash Balance", value: "—", change: 0, icon: ArrowUpRight },
        ] as const;
      }
      const inflow = cashbook.reduce((s, r) => s + (r.debit || 0), 0);
      const outflow = cashbook.reduce((s, r) => s + (r.credit || 0), 0);
      const balance = (cashbook[cashbook.length - 1]?.balance) ??
                      (inflow - outflow);
  
      // Change% placeholders (you can compute against previous period)
      const inflowPct = 0;
      const outflowPct = 0;
      const balPct = 0;
  
      const fmt = (n: number) => `ETB ${n.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
      return [
        { key: "inflow",  label: "Inflow",       value: fmt(inflow),  change: +inflowPct,  icon: ArrowUpRight },
        { key: "outflow", label: "Outflow",      value: fmt(outflow), change: -outflowPct, icon: ArrowDownRight },
        { key: "balance", label: "Cash Balance", value: fmt(balance), change: +balPct,     icon: ArrowUpRight },
      ] as const;
    }, [cashbook]);

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

          {/* Mobile menu button */}
          <Button variant="ghost" size="icon" className="md:hidden ml-auto" onClick={() => setMobileMenuOpen(true)}>
            <Menu className="h-5 w-5" />
          </Button>

          {/* Scope pickers */}
          <div className="ml-auto hidden md:flex flex-1 items-center justify-end gap-2 sm:ml-0">
            <Select
              value={businessId ?? ""}
              onValueChange={(val) => setBusinessId(val)}
              disabled={loadingBusinesses || !businesses.length}
            >
              <SelectTrigger className="w-56">
                <SelectValue placeholder={loadingBusinesses ? "Loading…" : "Select business"}>
                  {businessName}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {businesses.map(b => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}
              </SelectContent>
            </Select>

            <Select
              value={branchId ?? ""}
              onValueChange={(val) => setBranchId(val)}
              disabled={loadingBranches || !branches.length}
            >
              <SelectTrigger className="w-56">
                <SelectValue placeholder={loadingBranches ? "Loading…" : "Select branch"}>
                  {branchName}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {branches.map(br => <SelectItem key={br.id} value={br.id}>{br.name}</SelectItem>)}
              </SelectContent>
            </Select>

            <div className="hidden items-center gap-2 lg:flex">
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

      {/* Mobile Navigation Sheet */}
      <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <SheetContent side="left" className="w-full sm:max-w-sm">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-700 text-white">
                <LayoutGrid className="h-4 w-4" />
              </div>
              LedgerPlus
            </SheetTitle>
          </SheetHeader>

          <div className="mt-6 space-y-4">
            {/* Mobile scope selectors */}
            <div className="space-y-3">
              <Select
                value={businessId ?? ""}
                onValueChange={(val) => setBusinessId(val)}
                disabled={loadingBusinesses || !businesses.length}
              >
                <SelectTrigger>
                  <SelectValue placeholder={loadingBusinesses ? "Loading…" : "Select business"}>
                    {businessName}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {businesses.map(b => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}
                </SelectContent>
              </Select>

              <Select
                value={branchId ?? ""}
                onValueChange={(val) => setBranchId(val)}
                disabled={loadingBranches || !branches.length}
              >
                <SelectTrigger>
                  <SelectValue placeholder={loadingBranches ? "Loading…" : "Select branch"}>
                    {branchName}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {branches.map(br => <SelectItem key={br.id} value={br.id}>{br.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            {/* Mobile navigation */}
            <div className="space-y-2">
              <div className="text-sm font-semibold text-teal-900 mb-2">Dashboard</div>
              <MobileNavItem icon={LayoutGrid} label="Accounts" active={page === "accounts"} onClick={() => { setPage("accounts"); setMobileMenuOpen(false); }} />
              <MobileNavItem icon={Wallet} label="Cashbook" active={page === "cashbook"} onClick={() => { setPage("cashbook"); setMobileMenuOpen(false); }} />
              <MobileNavItem icon={Receipt} label="Invoices" active={page === "invoices"} onClick={() => { setPage("invoices"); setMobileMenuOpen(false); }} />
              <MobileNavItem icon={Package} label="Inventory" active={page === "inventory"} onClick={() => { setPage("inventory"); setMobileMenuOpen(false); }} />
              <MobileNavItem icon={FileText} label="Reports" active={page === "reports"} onClick={() => { setPage("reports"); setMobileMenuOpen(false); }} />
              <MobileNavItem icon={SettingsIcon} label="Settings" active={page === "settings"} onClick={() => { setPage("settings"); setMobileMenuOpen(false); }} />
              <div className="border-t pt-2 mt-3">
                <MobileNavItem icon={Building2} label="BusinessInfo" active={page === "businessinfo"} onClick={() => { setPage("businessinfo"); setMobileMenuOpen(false); }} />
              </div>
            </div>

            {/* Mobile context card */}
            <div className="mt-6 rounded-xl bg-gradient-to-br from-teal-700 to-teal-600 p-3 text-white">
              <div className="flex items-center gap-2 text-xs opacity-90">
                <Building2 className="h-4 w-4" /> {businessName}
              </div>
              <div className="mt-1 flex items-center gap-2 text-xs opacity-90">
                <Store className="h-4 w-4" /> {branchName}
              </div>
              <div className="mt-2 text-[11px] opacity-90">Scope controls which data you see and edit.</div>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Main */}
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-4 px-3 py-4 md:grid-cols-[240px_1fr] md:px-6">
        {/* Desktop Sidebar */}
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
              <Building2 className="h-4 w-4" /> {businessName}
            </div>
            <div className="mt-1 flex items-center gap-2 text-xs opacity-90">
              <Store className="h-4 w-4" /> {branchName}
            </div>
            <div className="mt-2 text-[11px] opacity-90">Scope controls which data you see and edit.</div>
          </div>
        </aside>

        {/* Content area */}
        <main className="flex min-w-0 flex-col gap-4">
          {/* KPI Row */}
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

          {/* Tabs */}
          <section className="rounded-2xl border bg-white/70 p-3 shadow-sm">
            <Tabs value={page} onValueChange={(v) => setPage(v as typeof page)}>
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <ScrollArea className="w-full">
                  <TabsList className="w-full md:w-auto">
                    <TabsTrigger value="accounts" className="gap-2 text-xs sm:text-sm"><LayoutGrid className="h-4 w-4" /> <span className="hidden sm:inline">Accounts</span></TabsTrigger>
                    <TabsTrigger value="cashbook" className="gap-2 text-xs sm:text-sm"><Wallet className="h-4 w-4" /> <span className="hidden sm:inline">Cashbook</span></TabsTrigger>
                    <TabsTrigger value="invoices" className="gap-2 text-xs sm:text-sm"><Receipt className="h-4 w-4" /> <span className="hidden sm:inline">Invoices</span></TabsTrigger>
                    <TabsTrigger value="inventory" className="gap-2 text-xs sm:text-sm"><Package className="h-4 w-4" /> <span className="hidden sm:inline">Inventory</span></TabsTrigger>
                    <TabsTrigger value="reports" className="gap-2 text-xs sm:text-sm"><FileText className="h-4 w-4" /> <span className="hidden sm:inline">Reports</span></TabsTrigger>
                    <TabsTrigger value="settings" className="gap-2 text-xs sm:text-sm"><SettingsIcon className="h-4 w-4" /> <span className="hidden sm:inline">Settings</span></TabsTrigger>
                    <TabsTrigger value="businessinfo" className="gap-2 text-xs sm:text-sm"><Building2 className="h-4 w-4" /> <span className="hidden sm:inline">BusinessInfo</span></TabsTrigger>
                  </TabsList>
                </ScrollArea>

                {/* Action buttons */}
                <div className="flex flex-wrap items-center gap-2">
                  {page !== "settings" && page !== "businessinfo" && (
                    <>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button className="gap-2 text-xs sm:text-sm"><Plus className="h-4 w-4" /> <span className="hidden sm:inline">New Entry</span></Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-md">
                          <DialogHeader><DialogTitle>New Entry</DialogTitle></DialogHeader>
                          <EntryForm businessId={businessId || ""} />
                        </DialogContent>
                      </Dialog>
                      <Button variant="outline" className="gap-2 text-xs sm:text-sm"><Download className="h-4 w-4" /> <span className="hidden sm:inline">Export</span></Button>
                      <Sheet open={openRight} onOpenChange={setOpenRight}>
                        <SheetTrigger asChild>
                          <Button variant="secondary" className="gap-2 text-xs sm:text-sm"><Banknote className="h-4 w-4" /> <span className="hidden sm:inline">Cash Drawer</span></Button>
                        </SheetTrigger>
                        <SheetContent side="right" className="w-full sm:max-w-lg">
                          <SheetHeader><SheetTitle>Cash Drawer – {branchName}</SheetTitle></SheetHeader>
                          <RightPanel />
                        </SheetContent>
                      </Sheet>
                    </>
                  )}
                </div>
              </div>

              <TabsContent value="accounts" className="mt-4">
                <AccountsView loading={loadingAccounts} accounts={accounts} />
              </TabsContent>

              <TabsContent value="cashbook" className="mt-4">
                <CashbookView loading={loadingCashbook} rows={cashbook} />
              </TabsContent>

              <TabsContent value="invoices" className="mt-4">
                <InvoicesView loading={loadingInvoices} invoices={invoices} />
              </TabsContent>

              <TabsContent value="inventory" className="mt-4">
                <InventoryView loading={loadingItems} items={items} />
              </TabsContent>

              <TabsContent value="reports" className="mt-4"><ReportsView /></TabsContent>
              <TabsContent value="settings" className="mt-4"><SettingsView /></TabsContent>
              <TabsContent value="businessinfo" className="mt-4"><BusinessInfoView business={businessName} branch={branchName} /></TabsContent>
            </Tabs>
          </section>

          {/* Custom children content */}
          {children && (
            <section className="rounded-2xl border bg-white/70 p-4 shadow-sm">
              {children}
            </section>
          )}
        </main>
      </div>

      {/* Mobile bottom bar */}
      <MobileDock page={page} setPage={setPage} />

      {/* Error toast zone (simple) */}
      {err && (
        <div className="fixed bottom-20 right-3 z-50 rounded-md bg-rose-600 text-white px-3 py-2 text-sm shadow">
          {err}
        </div>
      )}
    </div>
  );
}

// Helper Components
function SubItem({ icon: Icon, label, active, onClick }: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      className={cn(
        "flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors",
        active ? "bg-teal-700 text-white" : "hover:bg-teal-50 text-gray-700"
      )}
      onClick={onClick}
    >
      <Icon className="h-4 w-4" />
      <span>{label}</span>
    </button>
  );
}

function MobileNavItem({ icon: Icon, label, active, onClick }: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      className={cn(
        "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
        active ? "bg-teal-700 text-white" : "hover:bg-teal-50 text-gray-700"
      )}
      onClick={onClick}
    >
      <Icon className="h-4 w-4" />
      <span>{label}</span>
    </button>
  );
}

function MobileDock({ page, setPage }: {
  page: string;
  setPage: (page: "accounts" | "cashbook" | "invoices" | "inventory" | "reports" | "settings" | "businessinfo") => void;
}) {
  const items = [
    { id: "accounts", icon: LayoutGrid, label: "Accounts" },
    { id: "cashbook", icon: Wallet, label: "Cashbook" },
    { id: "invoices", icon: Receipt, label: "Invoices" },
    { id: "inventory", icon: Package, label: "Inventory" },
    { id: "reports", icon: FileText, label: "Reports" },
  ] as const;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/80 md:hidden">
      <div className="grid grid-cols-5 gap-1 px-2 py-1">
        {items.map((item) => (
          <button
            key={item.id}
            className={cn(
              "flex flex-col items-center gap-1 rounded-lg px-2 py-2 text-xs transition-colors",
              page === item.id ? "bg-teal-700 text-white" : "text-gray-600 hover:bg-teal-50"
            )}
            onClick={() => setPage(item.id as any)}
          >
            <item.icon className="h-5 w-5" />
            <span className="truncate">{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

// ---- View Components wired to API data ----

function AccountsView({ loading, accounts }: { loading: boolean; accounts: Account[] }) {
    return (
      <Card className="rounded-2xl">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Chart of Accounts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-auto rounded-xl border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 text-left">
                <tr>
                  <Th>Code</Th>
                  <Th>Account Name</Th>
                  <Th>Type</Th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  [...Array(6)].map((_, i) => (
                    <tr key={i} className="border-t">
                      <Td><Skeleton w="6ch" /></Td>
                      <Td><Skeleton w="28ch" /></Td>
                      <Td><Skeleton w="10ch" /></Td>
                    </tr>
                  ))
                ) : (
                  accounts.map((a) => (
                    <tr key={a.id} className="border-t hover:bg-teal-50/40">
                      <Td>{a.code || '—'}</Td>
                      <Td className="max-w-[320px] truncate">{a.name}</Td>
                      <Td>{a.type}</Td>
                    </tr>
                  ))
                )}
                {!loading && accounts.length === 0 && (
                  <tr className="border-t">
                    <Td colSpan={3} className="text-center text-muted-foreground py-6">No accounts</Td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    );
  }

function CashbookView({ loading, rows }: { loading: boolean; rows: CashbookEntry[] }) {
    const fmt = (n: number) => n === 0 ? "—" : `ETB ${n.toLocaleString()}`;
    return (
      <Card className="rounded-2xl">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Cashbook</CardTitle>
        </CardHeader>
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
                {loading ? (
                  [...Array(6)].map((_, i) => (
                    <tr key={i} className="border-t">
                      <Td><Skeleton w="12ch" /></Td>
                      <Td><Skeleton w="10ch" /></Td>
                      <Td><Skeleton w="30ch" /></Td>
                      <Td className="text-right"><Skeleton w="10ch" /></Td>
                      <Td className="text-right"><Skeleton w="10ch" /></Td>
                      <Td className="text-right"><Skeleton w="10ch" /></Td>
                    </tr>
                  ))
                ) : (
                  rows.map((r) => (
                    <tr key={r.id} className="border-t hover:bg-teal-50/40">
                      <Td>{r.date?.slice(0,10)}</Td>
                      <Td>{r.ref ?? "—"}</Td>
                      <Td className="max-w-[280px] truncate">{r.description ?? "—"}</Td>
                      <Td className="text-right font-medium">{fmt(r.debit || 0)}</Td>
                      <Td className="text-right font-medium">{fmt(r.credit || 0)}</Td>
                      <Td className="text-right font-semibold">{fmt(r.balance ?? 0)}</Td>
                    </tr>
                  ))
                )}
                {!loading && rows.length === 0 && (
                  <tr className="border-t">
                    <Td colSpan={6} className="text-center text-muted-foreground py-6">No entries</Td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    );
  }

function InvoicesView({ loading, invoices }: { loading: boolean; invoices: Invoice[] }) {
  return (
    <Card className="rounded-2xl">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Invoices</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <PlaceholderList skeleton count={6} />
        ) : invoices.length ? (
          <div className="space-y-2">
            {invoices.map(inv => (
              <div key={inv.id} className="flex items-center justify-between gap-3 rounded-xl border p-3 hover:bg-teal-50/40 transition-colors">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="h-9 w-9 rounded-full bg-teal-100" />
                  <div className="min-w-0">
                    <div className="truncate text-sm font-medium">{inv.number} • {inv.customer ?? "—"}</div>
                    <div className="truncate text-xs text-muted-foreground">{inv.date?.slice(0,10)} • {inv.status ?? "—"}</div>
                  </div>
                </div>
                <div className="text-sm font-medium">ETB {inv.total.toLocaleString()}</div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-sm text-muted-foreground">No invoices</div>
        )}
      </CardContent>
    </Card>
  );
}

function InventoryView({ loading, items }: { loading: boolean; items: Item[] }) {
  return (
    <Card className="rounded-2xl">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Inventory</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <PlaceholderList skeleton count={6} />
        ) : items.length ? (
          <div className="space-y-2">
            {items.map((it) => (
              <div key={it.id} className="flex items-center justify-between gap-3 rounded-xl border p-3 hover:bg-teal-50/40 transition-colors">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="h-9 w-9 rounded-full bg-teal-100" />
                  <div className="min-w-0">
                    <div className="truncate text-sm font-medium">{it.name}</div>
                    <div className="truncate text-xs text-muted-foreground">{it.uom} • Rate: ETB {it.rate.toLocaleString()}</div>
                  </div>
                </div>
                <div className="text-sm font-medium">ETB {it.rate.toLocaleString()}</div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-sm text-muted-foreground">No items</div>
        )}
      </CardContent>
    </Card>
  );
}

function ReportsView() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <ReportTile title="Profit & Loss" description="Income statement for the selected period" />
      <ReportTile title="Balance Sheet" description="Financial position as of date" />
      <ReportTile title="Cash Flow" description="Cash movements and liquidity analysis" />
      <ReportTile title="Trial Balance" description="All account balances verification" />
      <ReportTile title="Aged Receivables" description="Outstanding customer balances by age" />
      <ReportTile title="Aged Payables" description="Outstanding supplier balances by age" />
    </div>
  );
}

function SettingsView() {
  // (Optional) Bind to your preferences API here if you like.
  return (
    <Card className="rounded-2xl">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Settings</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <Label>Fiscal Year</Label>
              <Select defaultValue="2025">
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="2025">2025</SelectItem>
                  <SelectItem value="2024">2024</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Currency</Label>
              <Select defaultValue="ETB">
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="ETB">Ethiopian Birr (ETB)</SelectItem>
                  <SelectItem value="USD">US Dollar (USD)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="text-sm text-muted-foreground">
            Configure accounting preferences, user permissions, and system settings.
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function BusinessInfoView({ business, branch }: { business: string; branch: string }) {
  return (
    <Card className="rounded-2xl">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Business Information</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <KeyValue label="Business Name" value={business} />
          <KeyValue label="Branch" value={branch} />
          <KeyValue label="Tax ID" value="—" />
          <KeyValue label="Address" value="—" />
          <KeyValue label="Phone" value="—" />
          <KeyValue label="Email" value="—" />
          <div className="text-sm text-muted-foreground">
            Manage registration details, tax numbers, and contact data.
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Shared Components
function ReportTile({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-xl border p-4 hover:bg-teal-50/40 transition-colors cursor-pointer">
      <div className="text-sm font-semibold">{title}</div>
      <div className="mt-1 text-sm text-muted-foreground">{description}</div>
      <div className="mt-3 h-24 rounded-lg bg-gradient-to-tr from-teal-50 to-white" />
    </div>
  );
}

function PlaceholderList({ skeleton = false, count = 6 }: { skeleton?: boolean; count?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-center justify-between gap-3 rounded-xl border p-3">
          <div className="flex min-w-0 items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-teal-100" />
            <div className="min-w-0">
              {skeleton ? (
                <>
                  <Skeleton w="18ch" />
                  <div className="mt-1"><Skeleton w="28ch" h={12} /></div>
                </>
              ) : (
                <>
                  <div className="truncate text-sm font-medium">Sample row {i + 1}</div>
                  <div className="truncate text-xs text-muted-foreground">Description and metadata go here…</div>
                </>
              )}
            </div>
          </div>
          <div className="text-sm font-medium">{skeleton ? <Skeleton w="10ch" /> : `ETB ${(i + 1) * 1370}`}</div>
        </div>
      ))}
    </div>
  );
}

function EntryForm({ businessId }: { businessId: ID }) {
  // This can call api.createCashbookEntry / api.createTransaction etc. depending on your flow
  return (
    <form className="space-y-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <Label>Type</Label>
          <Select>
            <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="receipt">Receipt</SelectItem>
              <SelectItem value="payment">Payment</SelectItem>
              <SelectItem value="journal">Journal</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Amount</Label>
          <Input type="number" placeholder="0.00" />
        </div>
      </div>
      <div>
        <Label>Description</Label>
        <Input placeholder="Enter description" />
      </div>
      <div className="flex gap-2 justify-end">
        <Button type="button" variant="outline">Cancel</Button>
        <Button type="submit">Save Entry</Button>
      </div>
    </form>
  );
}

function RightPanel() {
  return (
    <div className="space-y-4 mt-4">
      <div className="text-sm text-muted-foreground">Cash drawer operations and daily reconciliation tools.</div>
      <PlaceholderList skeleton />
    </div>
  );
}

function KeyValue({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
      <span className="text-sm font-medium text-gray-600">{label}</span>
      <span className="text-sm text-gray-900">{value}</span>
    </div>
  );
}

// Table Components
function Th({ children, className }: { children: React.ReactNode; className?: string }) {
  return <th className={cn("px-3 py-2 text-xs font-semibold text-muted-foreground", className)}>{children}</th>;
}

function Td({ children, className, colSpan }: { children: React.ReactNode; className?: string; colSpan?: number }) {
  return <td colSpan={colSpan} className={cn("px-3 py-2", className)}>{children}</td>;
}

// Tiny skeleton helper
function Skeleton({ w = "100%", h = 16 }: { w?: string; h?: number }) {
  return <div style={{ width: w, height: h }} className="animate-pulse rounded bg-gray-200" />;
}
