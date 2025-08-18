# Skeleton Pages Implementation

## Overview
This document outlines the implementation of skeleton pages for all key screens in the Credit Debit financial management application. These pages will include proper page headers, filters areas, content surfaces, and empty/loading/error states.

## Key Screens

### Login (/login)
- Business, Branch, Role selects
- Username/Password fields
- Remember me checkbox
- "Switch theme" link
- Helpful error states

### Dashboard
- Page header with title and actions
- KPI cards (Receipts, Payments, Balance)
- Small charts (Cashflow 30 days)
- "Recent activity" table
- Quick actions
- Filters area (collapsible on mobile)
- Content surface
- Empty/loading/error states

### Accounts
- Page header with title and actions
- Searchable/filterable table
- Mobile card list alternative
- Add/Edit modal
- Details drawer (topline, recent transactions)
- Filters area (collapsible on mobile)
- Content surface
- Empty/loading/error states

### Cashbook
- Page header with title and actions
- Date range filter
- Entry list/table
- Add entry dialog
- Totals summary
- Filters area (collapsible on mobile)
- Content surface
- Empty/loading/error states

### Invoices
- Page header with title and actions
- Table with status chips
- Quick filters (Open/Paid/Overdue)
- Detail drawer
- Filters area (collapsible on mobile)
- Content surface
- Empty/loading/error states

### Inventory
- Page header with title and actions
- Simple list (name, stock, low-stock state)
- Item dialog
- Filters area (collapsible on mobile)
- Content surface
- Empty/loading/error states

### Reports
- Page header with title and actions
- Trial Balance table with totals
- Export buttons
- Filters area (collapsible on mobile)
- Content surface
- Empty/loading/error states

### Settings
- Page header with title and actions
- Preferences (currency, date/time)
- Theme settings
- Filters area (collapsible on mobile)
- Content surface
- Empty/loading/error states

## Page Structure

### Common Page Layout
```tsx
interface PageLayoutProps {
  title: string;
  actions?: React.ReactNode;
  filters?: React.ReactNode;
  children: React.ReactNode;
  loading?: boolean;
  error?: string | null;
  isEmpty?: boolean;
  emptyState?: React.ReactNode;
}

const PageLayout: React.FC<PageLayoutProps> = ({
  title,
  actions,
  filters,
  children,
  loading = false,
  error = null,
  isEmpty = false,
  emptyState
}) => {
  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader 
          title={<Skeleton className="h-8 w-48" />}
          actions={<Skeleton className="h-10 w-24" />}
        />
        {filters && (
          <div className="p-4 bg-muted/30 rounded-lg">
            <Skeleton className="h-12 w-full" />
          </div>
        )}
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-24 w-full rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <PageHeader title={title} actions={actions} />
        <ErrorState 
          title="Something went wrong"
          description={error}
          onRetry={() => window.location.reload()}
        />
      </div>
    );
  }

  if (isEmpty && emptyState) {
    return (
      <div className="space-y-6">
        <PageHeader title={title} actions={actions} />
        {emptyState}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader title={title} actions={actions} />
      {filters && (
        <CollapsibleFilters>
          {filters}
        </CollapsibleFilters>
      )}
      {children}
    </div>
  );
};
```

### Page Header Component
```tsx
interface PageHeaderProps {
  title: string;
  actions?: React.ReactNode;
  breadcrumbs?: BreadcrumbItem[];
}

const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  actions,
  breadcrumbs
}) => {
  return (
    <div className="space-y-4">
      {breadcrumbs && <Breadcrumbs items={breadcrumbs} />}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-foreground">{title}</h1>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>
    </div>
  );
};
```

### Collapsible Filters Component
```tsx
interface CollapsibleFiltersProps {
  children: React.ReactNode;
}

const CollapsibleFilters: React.FC<CollapsibleFiltersProps> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(true);
  
  return (
    <div className="border border-border rounded-lg bg-card">
      <div className="flex items-center justify-between p-4 border-b border-border">
        <h2 className="text-lg font-medium text-foreground">Filters</h2>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </Button>
      </div>
      {isOpen && (
        <div className="p-4">
          {children}
        </div>
      )}
    </div>
  );
};
```

## Dashboard Page Implementation

### Dashboard Page Structure
```tsx
const DashboardPage: React.FC = () => {
  const { data: kpiData, isLoading: kpiLoading, error: kpiError } = useKpiQuery();
  const { data: chartData, isLoading: chartLoading, error: chartError } = useChartDataQuery();
  const { data: activityData, isLoading: activityLoading, error: activityError } = useActivityQuery();
  
  return (
    <PageLayout
      title="Dashboard"
      actions={
        <Button onClick={() => console.log('Add quick action')}>
          <Plus className="h-4 w-4 mr-2" />
          Quick Action
        </Button>
      }
      loading={kpiLoading && chartLoading && activityLoading}
      error={kpiError || chartError || activityError}
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <KPICard 
          title="Total Receipts" 
          value={kpiData?.totalReceipts} 
          loading={kpiLoading}
          error={kpiError}
        />
        <KPICard 
          title="Total Payments" 
          value={kpiData?.totalPayments} 
          loading={kpiLoading}
          error={kpiError}
        />
        <KPICard 
          title="Net Balance" 
          value={kpiData?.netBalance} 
          loading={kpiLoading}
          error={kpiError}
        />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard
          title="Cashflow (30 days)"
          data={chartData}
          loading={chartLoading}
          error={chartError}
        />
        
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium">Recent Activity</h3>
            <Button variant="link" size="sm">
              View All
            </Button>
          </div>
          <ActivityTable 
            data={activityData} 
            loading={activityLoading} 
            error={activityError} 
          />
        </Card>
      </div>
    </PageLayout>
  );
};
```

## Accounts Page Implementation

### Accounts Page Structure
```tsx
const AccountsPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [accountType, setAccountType] = useState('all');
  const { data: accounts, isLoading, error } = useAccountsQuery();
  
  const filteredAccounts = accounts?.filter(account => {
    const matchesSearch = account.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = accountType === 'all' || account.type === accountType;
    return matchesSearch && matchesType;
  });
  
  const isEmpty = !isLoading && (!filteredAccounts || filteredAccounts.length === 0);
  
  return (
    <PageLayout
      title="Accounts"
      actions={
        <Button onClick={() => console.log('Add account')}>
          <Plus className="h-4 w-4 mr-2" />
          Add Account
        </Button>
      }
      filters={
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            placeholder="Search accounts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            icon={<Search className="h-4 w-4" />}
          />
          <Select value={accountType} onValueChange={setAccountType}>
            <SelectTrigger>
              <SelectValue placeholder="Account Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="customer">Customers</SelectItem>
              <SelectItem value="supplier">Suppliers</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
      }
      loading={isLoading}
      error={error}
      isEmpty={isEmpty}
      emptyState={
        <EmptyState
          title="No accounts found"
          description="Get started by creating your first account."
          action={
            <Button onClick={() => console.log('Add account')}>
              <Plus className="h-4 w-4 mr-2" />
              Add Account
            </Button>
          }
        />
      }
    >
      <div className="hidden sm:block">
        <AccountsTable 
          accounts={filteredAccounts} 
          loading={isLoading} 
          error={error} 
        />
      </div>
      <div className="sm:hidden">
        <AccountsList 
          accounts={filteredAccounts} 
          loading={isLoading} 
          error={error} 
        />
      </div>
    </PageLayout>
  );
};
```

## Implementation Plan

### Phase 1: Core Components
1. Create PageLayout component
2. Implement PageHeader component
3. Create CollapsibleFilters component
4. Add loading skeletons
5. Add error states
6. Add empty states

### Phase 2: Dashboard Implementation
1. Create KPI cards
2. Implement chart components
3. Create activity table
4. Add quick actions
5. Implement responsive layout

### Phase 3: Accounts Page
1. Create accounts table
2. Implement mobile list view
3. Add search and filter functionality
4. Create account details drawer
5. Add account management modals

### Phase 4: Cashbook Page
1. Create cashbook table
2. Implement date range filters
3. Add entry management dialogs
4. Create totals summary
5. Implement responsive layout

### Phase 5: Invoices Page
1. Create invoices table
2. Implement status chips
3. Add quick filters
4. Create invoice details drawer
5. Implement responsive layout

### Phase 6: Inventory Page
1. Create inventory list
2. Implement stock level indicators
3. Add item management dialogs
4. Create low-stock alerts
5. Implement responsive layout

### Phase 7: Reports Page
1. Create trial balance table
2. Implement export functionality
3. Add report filters
4. Create totals calculations
5. Implement responsive layout

### Phase 8: Settings Page
1. Create settings form
2. Implement preference controls
3. Add theme selector
4. Create save functionality
5. Implement responsive layout

## Responsive Considerations

### Mobile Optimizations
- Collapsible filters by default
- Card-based layouts instead of tables
- Touch-friendly controls
- Appropriate spacing for mobile
- iOS safe area support

### Tablet Optimizations
- Expandable filters
- Hybrid table/card layouts
- Multi-column grids
- Enhanced touch targets

### Desktop Optimizations
- Full filter visibility
- Complex table layouts
- Multi-column grids
- Keyboard shortcuts
- Enhanced hover states

## Accessibility Features

### Keyboard Navigation
- Proper tab order
- Focus management
- Keyboard shortcuts
- Skip-to-content links

### Screen Reader Support
- Semantic HTML structure
- ARIA labels and roles
- Live regions for dynamic content
- Proper heading hierarchy

### Visual Design
- Sufficient color contrast
- Clear focus indicators
- Text scaling support
- Reduced motion support