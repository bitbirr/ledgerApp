# Skeleton Pages Implementation Plan

## Overview
This document outlines the implementation plan for creating skeleton pages for all required screens in the Credit Debit financial management application. These skeleton pages will provide the basic structure and layout for each screen while maintaining consistency with the design system and responsive behavior.

## Current State Analysis
The existing application has:
- Basic dashboard page implementation
- Some page components (CashBook, Invoices, etc.)
- Simple routing system
- Limited responsive design implementation

## Required Screens
Based on the requirements, we need to implement skeleton pages for:

### Business App Screens
1. **Login** - Business user login with Business/Branch/Role selection
2. **Dashboard** - KPI cards, charts, recent activity
3. **Accounts** - Account list/table, filters, details
4. **Cashbook** - Cash entries, date filters, totals
5. **Invoices** - Invoice list, status filters, details
6. **Inventory** - Item list, stock levels, details
7. **Reports** - Financial reports, export options
8. **Settings** - User preferences, theme settings

### SuperAdmin App Screens
1. **Login** - SuperAdmin login
2. **Dashboard** - System overview, metrics
3. **Businesses** - Business management
4. **Branches** - Branch management
5. **Users/Roles** - User management
6. **App Settings** - Application configuration
7. **Audit** - Audit trail viewer
8. **Feedback** - Feedback management
9. **Diagnostics** - System diagnostics

## Page Structure Requirements
Each page must include:
1. **Page Header** - Title and primary actions
2. **Filters Area** - Collapsible on mobile
3. **Content Surface** - Main content area
4. **Empty/Loading/Error States** - Appropriate states for all scenarios

## Implementation Approach

### 1. Page Layout Components
Create reusable layout components for consistent page structure:

```tsx
interface PageLayoutProps {
  title: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

const PageLayout: React.FC<PageLayoutProps> = ({ 
  title, 
  actions, 
  children, 
  className 
}) => {
  return (
    <div className={cn('container-responsive py-6', className)}>
      <PageHeader title={title} actions={actions} />
      {children}
    </div>
  );
};

interface PageHeaderProps {
  title: string;
  actions?: React.ReactNode;
  className?: string;
}

const PageHeader: React.FC<PageHeaderProps> = ({ 
  title, 
  actions, 
  className 
}) => {
  return (
    <div className={cn('flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6', className)}>
      <h1 className="text-2xl font-bold text-foreground">{title}</h1>
      {actions && <div className="flex gap-2">{actions}</div>}
    </div>
  );
};
```

### 2. Filter Components
Create responsive filter components that collapse on mobile:

```tsx
interface FilterSectionProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
  defaultOpen?: boolean;
}

const FilterSection: React.FC<FilterSectionProps> = ({ 
  title, 
  children, 
  className,
  defaultOpen = true
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  
  return (
    <div className={cn('bg-card border border-border rounded-lg mb-6', className)}>
      {title && (
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-lg font-semibold text-foreground">{title}</h2>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setIsOpen(!isOpen)}
            className="mobile-only"
          >
            {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        </div>
      )}
      <div className={cn('p-4', (title && !isOpen) ? 'mobile-only:hidden' : '')}>
        {children}
      </div>
    </div>
  );
};
```

### 3. Content Surface Components
Create consistent content surfaces with proper states:

```tsx
interface ContentSurfaceProps {
  children: React.ReactNode;
  isLoading?: boolean;
  isEmpty?: boolean;
  isError?: boolean;
  emptyState?: React.ReactNode;
  errorState?: React.ReactNode;
  className?: string;
}

const ContentSurface: React.FC<ContentSurfaceProps> = ({ 
  children, 
  isLoading = false, 
  isEmpty = false, 
  isError = false,
  emptyState,
  errorState,
  className
}) => {
  if (isLoading) {
    return (
      <div className={cn('bg-card border border-border rounded-lg p-6', className)}>
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }
  
  if (isError) {
    return (
      <div className={cn('bg-card border border-border rounded-lg p-6', className)}>
        {errorState || (
          <div className="text-center py-12">
            <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">Something went wrong</h3>
            <p className="text-muted-foreground mb-4">We couldn't load the data. Please try again.</p>
            <Button variant="primary">Retry</Button>
          </div>
        )}
      </div>
    );
  }
  
  if (isEmpty) {
    return (
      <div className={cn('bg-card border border-border rounded-lg p-6', className)}>
        {emptyState || (
          <div className="text-center py-12">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">No data found</h3>
            <p className="text-muted-foreground">There's no data to display right now.</p>
          </div>
        )}
      </div>
    );
  }
  
  return (
    <div className={cn('bg-card border border-border rounded-lg', className)}>
      {children}
    </div>
  );
};
```

## Detailed Page Implementations

### 1. Login Pages

#### Business Login Page
```tsx
const BusinessLoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [selectedBusiness, setSelectedBusiness] = useState<string>('');
  const [branches, setBranches] = useState<Branch[]>([]);
  const [selectedBranch, setSelectedBranch] = useState<string>('');
  const [roles, setRoles] = useState<string[]>([]);
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [step, setStep] = useState<'credentials' | 'context'>('credentials');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    try {
      // API call to login
      const response = await api.login({ email, password });
      
      if (response.success) {
        // Fetch business context
        const businessList = await api.getBusinesses(response.userId);
        setBusinesses(businessList);
        setStep('context');
      } else {
        setError(response.error || 'Login failed');
      }
    } catch (err) {
      setError('An error occurred during login');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleContextSelect = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    try {
      // API call to select context
      const response = await api.selectContext({
        businessId: selectedBusiness,
        branchId: selectedBranch,
        role: selectedRole
      });
      
      if (response.success) {
        // Redirect to dashboard
        window.location.href = '/';
      } else {
        setError(response.error || 'Failed to set context');
      }
    } catch (err) {
      setError('An error occurred while setting context');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-primary rounded-lg flex items-center justify-center mb-4">
            <TrendingUp className="h-8 w-8 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Credit Debit</h1>
          <p className="text-muted-foreground">Financial Management System</p>
        </div>
        
        {step === 'credentials' ? (
          <Card className="p-6">
            <form onSubmit={handleLogin}>
              <div className="space-y-4">
                <FormField label="Email" required>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    required
                  />
                </FormField>
                
                <FormField label="Password" required>
                  <Input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    required
                  />
                </FormField>
                
                {error && (
                  <div className="text-destructive text-sm flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" />
                    {error}
                  </div>
                )}
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Checkbox id="remember" />
                    <label htmlFor="remember" className="ml-2 text-sm text-foreground">
                      Remember me
                    </label>
                  </div>
                  <Button variant="link" size="sm" className="text-sm">
                    Forgot password?
                  </Button>
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full" 
                  isLoading={isLoading}
                  disabled={isLoading}
                >
                  Sign In
                </Button>
                
                <div className="text-center text-sm">
                  <Button 
                    variant="link" 
                    size="sm" 
                    className="text-sm"
                    onClick={() => window.location.href = '/admin/login'}
                  >
                    SuperAdmin Login
                  </Button>
                </div>
              </div>
            </form>
          </Card>
        ) : (
          <Card className="p-6">
            <form onSubmit={handleContextSelect}>
              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-foreground text-center mb-4">
                  Select Business Context
                </h2>
                
                <FormField label="Business" required>
                  <Select
                    value={selectedBusiness}
                    onValueChange={setSelectedBusiness}
                    options={businesses.map(b => ({ value: b.id, label: b.name }))}
                    placeholder="Select a business"
                  />
                </FormField>
                
                {selectedBusiness && (
                  <>
                    <FormField label="Branch" required>
                      <Select
                        value={selectedBranch}
                        onValueChange={setSelectedBranch}
                        options={branches.map(b => ({ value: b.id, label: b.name }))}
                        placeholder="Select a branch"
                      />
                    </FormField>
                    
                    <FormField label="Role" required>
                      <Select
                        value={selectedRole}
                        onValueChange={setSelectedRole}
                        options={roles.map(r => ({ value: r, label: r }))}
                        placeholder="Select a role"
                      />
                    </FormField>
                  </>
                )}
                
                {error && (
                  <div className="text-destructive text-sm flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" />
                    {error}
                  </div>
                )}
                
                <div className="flex gap-2">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setStep('credentials')}
                    className="flex-1"
                  >
                    Back
                  </Button>
                  <Button 
                    type="submit" 
                    className="flex-1" 
                    isLoading={isLoading}
                    disabled={isLoading || !selectedBusiness || !selectedBranch || !selectedRole}
                  >
                    Continue
                  </Button>
                </div>
              </div>
            </form>
          </Card>
        )}
        
        <div className="text-center mt-6 text-sm text-muted-foreground">
          <Button 
            variant="link" 
            size="sm" 
            className="text-sm"
            onClick={() => document.documentElement.classList.toggle('dark')}
          >
            Switch to {document.documentElement.classList.contains('dark') ? 'Light' : 'Dark'} Mode
          </Button>
        </div>
      </div>
    </div>
  );
};
```

#### SuperAdmin Login Page
```tsx
const SuperAdminLoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    try {
      // API call to login
      const response = await api.adminLogin({ email, password });
      
      if (response.success) {
        // Redirect to SuperAdmin dashboard
        window.location.href = '/admin';
      } else {
        setError(response.error || 'Login failed');
      }
    } catch (err) {
      setError('An error occurred during login');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-primary rounded-lg flex items-center justify-center mb-4">
            <Shield className="h-8 w-8 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Credit Debit</h1>
          <p className="text-muted-foreground">SuperAdmin Portal</p>
        </div>
        
        <Card className="p-6">
          <form onSubmit={handleLogin}>
            <div className="space-y-4">
              <FormField label="Email" required>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                />
              </FormField>
              
              <FormField label="Password" required>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                />
              </FormField>
              
              {error && (
                <div className="text-destructive text-sm flex items-center gap-1">
                  <AlertCircle className="h-4 w-4" />
                  {error}
                </div>
              )}
              
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Checkbox id="remember" />
                  <label htmlFor="remember" className="ml-2 text-sm text-foreground">
                    Remember me
                  </label>
                </div>
                <Button variant="link" size="sm" className="text-sm">
                  Forgot password?
                </Button>
              </div>
              
              <Button 
                type="submit" 
                className="w-full" 
                isLoading={isLoading}
                disabled={isLoading}
              >
                Sign In
              </Button>
              
              <div className="text-center text-sm">
                <Button 
                  variant="link" 
                  size="sm" 
                  className="text-sm"
                  onClick={() => window.location.href = '/login'}
                >
                  Business User Login
                </Button>
              </div>
            </div>
          </form>
        </Card>
        
        <div className="text-center mt-6 text-sm text-muted-foreground">
          <Button 
            variant="link" 
            size="sm" 
            className="text-sm"
            onClick={() => document.documentElement.classList.toggle('dark')}
          >
            Switch to {document.documentElement.classList.contains('dark') ? 'Light' : 'Dark'} Mode
          </Button>
        </div>
      </div>
    </div>
  );
};
```

### 2. Dashboard Page
```tsx
const DashboardPage: React.FC = () => {
  const { data: kpiData, isLoading: kpiLoading } = useQuery({
    queryKey: ['dashboard-kpi'],
    queryFn: () => api.getDashboardKPI()
  });
  
  const { data: chartData, isLoading: chartLoading } = useQuery({
    queryKey: ['dashboard-chart'],
    queryFn: () => api.getCashflowChart()
  });
  
  const { data: recentActivity, isLoading: activityLoading } = useQuery({
    queryKey: ['dashboard-activity'],
    queryFn: () => api.getRecentActivity()
  });
  
  return (
    <PageLayout title="Dashboard">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <KPICard
          title="Total Receipts"
          value={kpiData?.totalReceipts}
          change={kpiData?.receiptsChange}
          icon={<TrendingUp className="h-5 w-5 text-success" />}
          isLoading={kpiLoading}
        />
        <KPICard
          title="Total Payments"
          value={kpiData?.totalPayments}
          change={kpiData?.paymentsChange}
          icon={<TrendingDown className="h-5 w-5 text-destructive" />}
          isLoading={kpiLoading}
        />
        <KPICard
          title="Account Balance"
          value={kpiData?.accountBalance}
          change={kpiData?.balanceChange}
          icon={<Wallet className="h-5 w-5 text-primary" />}
          isLoading={kpiLoading}
        />
        <KPICard
          title="Pending Invoices"
          value={kpiData?.pendingInvoices}
          change={kpiData?.invoicesChange}
          icon={<FileText className="h-5 w-5 text-warning" />}
          isLoading={kpiLoading}
        />
      </div>
      
      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <ChartCard
          title="Cashflow (30 days)"
          isLoading={chartLoading}
        >
          {chartData && <CashflowChart data={chartData} />}
        </ChartCard>
        
        <ChartCard
          title="Income vs Expenses"
          isLoading={chartLoading}
        >
          {chartData && <IncomeExpenseChart data={chartData} />}
        </ChartCard>
      </div>
      
      {/* Recent Activity */}
      <ContentSurface
        isLoading={activityLoading}
        isEmpty={!recentActivity?.length}
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-foreground">Recent Activity</h2>
            <Button variant="link" size="sm">
              View All
            </Button>
          </div>
          
          {recentActivity && (
            <div className="space-y-3">
              {recentActivity.map(activity => (
                <ActivityItem 
                  key={activity.id} 
                  activity={activity} 
                />
              ))}
            </div>
          )}
        </div>
      </ContentSurface>
      
      {/* Quick Actions */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-6">
        <QuickActionCard
          title="Add Account"
          icon={<UserPlus className="h-5 w-5" />}
          onClick={() => {/* Navigate to add account */}}
        />
        <QuickActionCard
          title="Record Payment"
          icon={<CreditCard className="h-5 w-5" />}
          onClick={() => {/* Open payment modal */}}
        />
        <QuickActionCard
          title="Create Invoice"
          icon={<FilePlus className="h-5 w-5" />}
          onClick={() => {/* Navigate to create invoice */}}
        />
        <QuickActionCard
          title="Add Item"
          icon={<PackagePlus className="h-5 w-5" />}
          onClick={() => {/* Navigate to add item */}}
        />
      </div>
    </PageLayout>
  );
};
```

### 3. Accounts Page
```tsx
const AccountsPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [filterType, setFilterType] = useState('all');
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  
  const { data: accounts, isLoading } = useQuery({
    queryKey: ['accounts', searchTerm, sortBy, filterType],
    queryFn: () => api.getAccounts({ searchTerm, sortBy, filterType })
  });
  
  const filteredAccounts = accounts?.filter(account => {
    const matchesSearch = account.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || account.type === filterType;
    return matchesSearch && matchesType;
  });
  
  return (
    <PageLayout 
      title="Accounts" 
      actions={
        <Button onClick={() => {/* Open add account modal */}}>
          <Plus className="h-4 w-4 mr-2" />
          Add Account
        </Button>
      }
    >
      {/* Filters */}
      <FilterSection title="Filters">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="sm:col-span-2">
            <Input
              placeholder="Search accounts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              icon={<Search className="h-4 w-4" />}
            />
          </div>
          <div className="flex gap-2">
            <Select
              value={filterType}
              onValueChange={setFilterType}
              options={[
                { value: 'all', label: 'All Types' },
                { value: 'customer', label: 'Customers' },
                { value: 'supplier', label: 'Suppliers' },
                { value: 'other', label: 'Other' }
              ]}
            />
            <Select
              value={sortBy}
              onValueChange={setSortBy}
              options={[
                { value: 'name', label: 'Sort by Name' },
                { value: 'balance', label: 'Sort by Balance' },
                { value: 'date', label: 'Sort by Date' }
              ]}
            />
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setViewMode(viewMode === 'table' ? 'cards' : 'table')}
              className="mobile-only:hidden"
            >
              {viewMode === 'table' ? <LayoutList className="h-4 w-4" /> : <LayoutGrid className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </FilterSection>
      
      {/* Content */}
      <ContentSurface
        isLoading={isLoading}
        isEmpty={!filteredAccounts?.length}
      >
        {viewMode === 'table' ? (
          <AccountTable accounts={filteredAccounts} />
        ) : (
          <AccountCardList accounts={filteredAccounts} />
        )}
      </ContentSurface>
    </PageLayout>
  );
};
```

### 4. Cashbook Page
```tsx
const CashbookPage: React.FC = () => {
  const [dateRange, setDateRange] = useState<DateRange>({
    from: new Date(new Date().setDate(new Date().getDate() - 30)),
    to: new Date()
  });
  const [entryType, setEntryType] = useState<'all' | 'in' | 'out'>('all');
  
  const { data: entries, isLoading } = useQuery({
    queryKey: ['cashbook', dateRange, entryType],
    queryFn: () => api.getCashbookEntries({ dateRange, entryType })
  });
  
  const totals = useMemo(() => {
    if (!entries) return { totalIn: 0, totalOut: 0, balance: 0 };
    
    const totalIn = entries
      .filter(e => e.direction === 'in')
      .reduce((sum, e) => sum + e.amount, 0);
      
    const totalOut = entries
      .filter(e => e.direction === 'out')
      .reduce((sum, e) => sum + e.amount, 0);
      
    return { totalIn, totalOut, balance: totalIn - totalOut };
  }, [entries]);
  
  return (
    <PageLayout 
      title="Cashbook" 
      actions={
        <Button onClick={() => {/* Open add entry modal */}}>
          <Plus className="h-4 w-4 mr-2" />
          Add Entry
        </Button>
      }
    >
      {/* Filters */}
      <FilterSection title="Filters">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="lg:col-span-2">
            <DateRangePicker
              value={dateRange}
              onChange={setDateRange}
            />
          </div>
          <Select
            value={entryType}
            onValueChange={setEntryType as any}
            options={[
              { value: 'all', label: 'All Entries' },
              { value: 'in', label: 'Cash In' },
              { value: 'out', label: 'Cash Out' }
            ]}
          />
          <div className="flex justify-end">
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>
      </FilterSection>
      
      {/* Totals Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <SummaryCard
          title="Total Cash In"
          amount={totals.totalIn}
          variant="success"
          icon={TrendingUp}
          isLoading={isLoading}
        />
        <SummaryCard
          title="Total Cash Out"
          amount={totals.totalOut}
          variant="destructive"
          icon={TrendingDown}
          isLoading={isLoading}
        />
        <SummaryCard
          title="Cash Balance"
          amount={totals.balance}
          variant="primary"
          icon={Wallet}
          isLoading={isLoading}
        />
      </div>
      
      {/* Entries Table */}
      <ContentSurface
        isLoading={isLoading}
        isEmpty={!entries?.length}
      >
        <CashbookTable entries={entries} />
      </ContentSurface>
    </PageLayout>
  );
};
```

### 5. Invoices Page
```tsx
const InvoicesPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'open' | 'paid' | 'overdue'>('all');
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  
  const { data: invoices, isLoading } = useQuery({
    queryKey: ['invoices', searchTerm, statusFilter, dateRange],
    queryFn: () => api.getInvoices({ searchTerm, statusFilter, dateRange })
  });
  
  return (
    <PageLayout 
      title="Invoices" 
      actions={
        <Button onClick={() => {/* Open create invoice modal */}}>
          <Plus className="h-4 w-4 mr-2" />
          Create Invoice
        </Button>
      }
    >
      {/* Filters */}
      <FilterSection title="Filters">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <Input
              placeholder="Search invoices..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              icon={<Search className="h-4 w-4" />}
            />
          </div>
          <Select
            value={statusFilter}
            onValueChange={setStatusFilter as any}
            options={[
              { value: 'all', label: 'All Statuses' },
              { value: 'open', label: 'Open' },
              { value: 'paid', label: 'Paid' },
              { value: 'overdue', label: 'Overdue' }
            ]}
          />
          <div>
            <DateRangePicker
              value={dateRange}
              onChange={setDateRange}
              placeholder="Filter by date"
            />
          </div>
          <div className="flex justify-end">
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>
      </FilterSection>
      
      {/* Invoices Table */}
      <ContentSurface
        isLoading={isLoading}
        isEmpty={!invoices?.length}
      >
        <InvoiceTable invoices={invoices} />
      </ContentSurface>
    </PageLayout>
  );
};
```

### 6. Inventory Page
```tsx
const InventoryPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [stockFilter, setStockFilter] = useState<'all' | 'low' | 'out'>('all');
  
  const { data: items, isLoading } = useQuery({
    queryKey: ['inventory', searchTerm, categoryFilter, stockFilter],
    queryFn: () => api.getInventoryItems({ searchTerm, categoryFilter, stockFilter })
  });
  
  return (
    <PageLayout 
      title="Inventory" 
      actions={
        <Button onClick={() => {/* Open add item modal */}}>
          <Plus className="h-4 w-4 mr-2" />
          Add Item
        </Button>
      }
    >
      {/* Filters */}
      <FilterSection title="Filters">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <Input
              placeholder="Search items..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              icon={<Search className="h-4 w-4" />}
            />
          </div>
          <Select
            value={categoryFilter}
            onValueChange={setCategoryFilter}
            options={[
              { value: 'all', label: 'All Categories' },
              // ... category options from API
            ]}
          />
          <Select
            value={stockFilter}
            onValueChange={setStockFilter as any}
            options={[
              { value: 'all', label: 'All Stock Levels' },
              { value: 'low', label: 'Low Stock' },
              { value: 'out', label: 'Out of Stock' }
            ]}
          />
        </div>
      </FilterSection>
      
      {/* Items List */}
      <ContentSurface
        isLoading={isLoading}
        isEmpty={!items?.length}
      >
        <InventoryItemList items={items} />
      </ContentSurface>
    </PageLayout>
  );
};
```

### 7. Reports Page
```tsx
const ReportsPage: React.FC = () => {
  const [reportType, setReportType] = useState('trial-balance');
  const [dateRange, setDateRange] = useState<DateRange>({
    from: new Date(new Date().getFullYear(), 0, 1),
    to: new Date()
  });
  
  const { data: reportData, isLoading } = useQuery({
    queryKey: ['reports', reportType, dateRange],
    queryFn: () => api.getReport({ type: reportType, dateRange })
  });
  
  return (
    <PageLayout title="Reports">
      {/* Report Selector */}
      <FilterSection>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Select
            value={reportType}
            onValueChange={setReportType}
            options={[
              { value: 'trial-balance', label: 'Trial Balance' },
              { value: 'profit-loss', label: 'Profit & Loss' },
              { value: 'balance-sheet', label: 'Balance Sheet' },
              { value: 'cash-flow', label: 'Cash Flow' }
            ]}
          />
          <div className="sm:col-span-2">
            <DateRangePicker
              value={dateRange}
              onChange={setDateRange}
            />
          </div>
          <div className="flex justify-end">
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>
      </FilterSection>
      
      {/* Report Content */}
      <ContentSurface
        isLoading={isLoading}
        isEmpty={!reportData}
      >
        {reportType === 'trial-balance' && (
          <TrialBalanceReport data={reportData} />
        )}
        {/* Other report types */}
      </ContentSurface>
    </PageLayout>
  );
};
```

### 8. Settings Page
```tsx
const SettingsPage: React.FC = () => {
  const [preferences, setPreferences] = useState({
    currency: 'ETB',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: '12',
    theme: 'system',
    notifications: true
  });
  
  const handleSave = async () => {
    // Save preferences to API
    await api.updatePreferences(preferences);
  };
  
  return (
    <PageLayout title="Settings">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <Card className="p-6">
            <nav className="space-y-1">
              <Button variant="ghost" className="w-full justify-start font-normal">
                <User className="h-4 w-4 mr-2" />
                Profile
              </Button>
              <Button variant="secondary" className="w-full justify-start font-normal">
                <Settings className="h-4 w-4 mr-2" />
                Preferences
              </Button>
              <Button variant="ghost" className="w-full justify-start font-normal">
                <Shield className="h-4 w-4 mr-2" />
                Security
              </Button>
              <Button variant="ghost" className="w-full justify-start font-normal">
                <Bell className="h-4 w-4 mr-2" />
                Notifications
              </Button>
            </nav>
          </Card>
        </div>
        
        <div className="lg:col-span-2">
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-foreground mb-6">Preferences</h2>
            
            <div className="space-y-6">
              <FormField label="Currency">
                <Select
                  value={preferences.currency}
                  onValueChange={(value) => setPreferences(prev => ({ ...prev, currency: value }))}
                  options={[
                    { value: 'ETB', label: 'Ethiopian Birr (ETB)' },
                    { value: 'USD', label: 'US Dollar (USD)' },
                    { value: 'EUR', label: 'Euro (EUR)' }
                  ]}
                />
              </FormField>
              
              <FormField label="Date Format">
                <Select
                  value={preferences.dateFormat}
                  onValueChange={(value) => setPreferences(prev => ({ ...prev, dateFormat: value }))}
                  options={[
                    { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY' },
                    { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY' },
                    { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD' }
                  ]}
                />
              </FormField>
              
              <FormField label="Time Format">
                <Select
                  value={preferences.timeFormat}
                  onValueChange={(value) => setPreferences(prev => ({ ...prev, timeFormat: value }))}
                  options={[
                    { value: '12', label: '12-hour' },
                    { value: '24', label: '24-hour' }
                  ]}
                />
              </FormField>
              
              <FormField label="Theme">
                <Select
                  value={preferences.theme}
                  onValueChange={(value) => setPreferences(prev => ({ ...prev, theme: value }))}
                  options={[
                    { value: 'light', label: 'Light' },
                    { value: 'dark', label: 'Dark' },
                    { value: 'system', label: 'System Default' }
                  ]}
                />
              </FormField>
              
              <div className="flex items-center justify-between pt-4">
                <div>
                  <h3 className="font-medium text-foreground">Notifications</h3>
                  <p className="text-sm text-muted-foreground">
                    Receive email notifications for important events
                  </p>
                </div>
                <Switch
                  checked={preferences.notifications}
                  onCheckedChange={(checked) => setPreferences(prev => ({ ...prev, notifications: checked }))}
                />
              </div>
              
              <div className="pt-4">
                <Button onClick={handleSave}>
                  Save Changes
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </PageLayout>
  );
};
```

## SuperAdmin Pages Implementation

### SuperAdmin Dashboard
```tsx
const SuperAdminDashboardPage: React.FC = () => {
  return (
    <PageLayout title="SuperAdmin Dashboard">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <StatCard
          title="Total Businesses"
          value={12}
          icon={<Building className="h-5 w-5" />}
          trend="+2 this month"
        />
        <StatCard
          title="Total Users"
          value={142}
          icon={<Users className="h-5 w-5" />}
          trend="+15 this month"
        />
        <StatCard
          title="Active Sessions"
          value={28}
          icon={<Activity className="h-5 w-5" />}
          trend="3% increase"
        />
        <StatCard
          title="System Health"
          value="98%"
          icon={<Heart className="h-5 w-5" />}
          trend="All systems normal"
        />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">Recent Activity</h2>
          <div className="space-y-3">
            {/* Activity items */}
          </div>
        </Card>
        
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">System Metrics</h2>
          <div className="space-y-4">
            {/* System metrics charts */}
          </div>
        </Card>
      </div>
    </PageLayout>
  );
};
```

## File Structure
```
client/src/
├── pages/
│   ├── business/
│   │   ├── LoginPage.tsx
│   │   ├── DashboardPage.tsx
│   │   ├── AccountsPage.tsx
│   │   ├── CashbookPage.tsx
│   │   ├── InvoicesPage.tsx
│   │   ├── InventoryPage.tsx
│   │   ├── ReportsPage.tsx
│   │   └── SettingsPage.tsx
│   ├── admin/
│   │   ├── AdminLoginPage.tsx
│   │   ├── SuperAdminDashboardPage.tsx
│   │   ├── BusinessesPage.tsx
│   │   ├── BranchesPage.tsx
│   │   ├── UsersRolesPage.tsx
│   │   ├── AppSettingsPage.tsx
│   │   ├── AuditPage.tsx
│   │   ├── FeedbackPage.tsx
│   │   └── DiagnosticsPage.tsx
│   └── shared/
│       ├── PageLayout.tsx
│       ├── PageHeader.tsx
│       ├── FilterSection.tsx
│       └── ContentSurface.tsx
└── components/
    └── page-specific/
        ├── dashboard/
        │   ├── KPICard.tsx
        │   ├── ChartCard.tsx
        │   └── QuickActionCard.tsx
        ├── accounts/
        │   ├── AccountTable.tsx
        │   ├── AccountCardList.tsx
        │   └── AccountDetails.tsx
        ├── cashbook/
        │   ├── CashbookTable.tsx
        │   └── SummaryCard.tsx
        ├── invoices/
        │   ├── InvoiceTable.tsx
        │   └── InvoiceDetails.tsx
        ├── inventory/
        │   └── InventoryItemList.tsx
        ├── reports/
        │   └── TrialBalanceReport.tsx
        └── settings/
            └── PreferenceForm.tsx
```

## Implementation Steps

### Phase 1: Shared Components
1. PageLayout and PageHeader
2. FilterSection component
3. ContentSurface with states
4. Form components for settings

### Phase 2: Business App Pages
1. LoginPage with context selection
2. Dashboard with KPIs and charts
3. Accounts page with table/cards view
4. Cashbook page with filters and totals
5. Invoices page with status filters
6. Inventory page with stock level filters
7. Reports page with export options
8. Settings page with preferences

### Phase 3: SuperAdmin App Pages
1. AdminLoginPage
2. SuperAdminDashboard with system metrics
3. Businesses management page
4. Branches management page
5. Users/Roles management page
6. App Settings page
7. Audit trail viewer
8. Feedback management page
9. Diagnostics page

## Responsive Considerations

### Mobile Adaptations
- Collapsible filter sections
- Card-based layouts instead of tables
- Bottom action buttons
- Touch-friendly controls
- iOS safe area padding

### Tablet Adaptations
- Multi-column layouts
- Sidebar navigation
- Breadcrumb navigation
- Enhanced filter controls

### Desktop Adaptations
- Full sidebar navigation
- Complex data tables
- Advanced filtering options
- Multi-panel layouts

## Accessibility Implementation

### Keyboard Navigation
- Proper tab order
- Focus management
- Keyboard shortcuts for actions
- Skip to content link

### Screen Reader Support
- Semantic HTML structure
- ARIA labels and descriptions
- Live regions for dynamic content
- Proper heading hierarchy

### Visual Accessibility
- Sufficient color contrast
- Text scaling support
- Reduced motion options
- High contrast mode support

## Performance Optimization

### Code Splitting
- Route-based code splitting
- Component lazy loading
- Dynamic imports for heavy components

### Data Fetching
- Efficient query caching
- Pagination for large datasets
- Background data preloading
- Error boundary implementation

### Rendering Optimization
- Virtualized lists for large datasets
- Memoization of expensive components
- Conditional rendering of non-critical elements
- Skeleton loading states

## Testing Strategy

### Unit Tests
- Component rendering
- State management
- Event handling
- Accessibility attributes

### Integration Tests
- Form validation
- Data flow
- User interactions
- Error handling

### E2E Tests
- Login flows
- Navigation between pages
- Data entry and editing
- Export functionality

## Documentation

Each page will include:
1. Purpose and functionality
2. Component structure
3. Data flow
4. Responsive behavior
5. Accessibility features
6. Performance considerations