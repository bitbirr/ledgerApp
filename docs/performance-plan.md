# Performance Optimization and Core Web Vitals Plan

## Overview
This document outlines the implementation plan for optimizing the performance of the Credit Debit financial management application and ensuring it meets Core Web Vitals thresholds. The goal is to achieve Lighthouse scores of Performance ≥ 90, Accessibility ≥ 95, and Best Practices ≥ 95.

## Current State Analysis
The existing application has:
- Basic React implementation
- Some performance optimizations
- No comprehensive performance monitoring
- No Core Web Vitals optimization strategy
- Limited code splitting

## Core Web Vitals Requirements
Based on Google's Core Web Vitals, we need to optimize:
1. **Largest Contentful Paint (LCP)** - < 2.5 seconds
2. **First Input Delay (FID)** - < 100 milliseconds
3. **Cumulative Layout Shift (CLS)** - < 0.1

## Performance Targets
- Performance score: ≥ 90
- Accessibility score: ≥ 95
- Best Practices score: ≥ 95
- Bundle size: < 200KB for critical path

## Implementation Approach

### 1. Code Splitting and Lazy Loading
Implement comprehensive code splitting:
- Route-based code splitting
- Component-based lazy loading
- Dynamic imports for non-critical features
- Prefetching for anticipated navigation

### 2. Asset Optimization
Optimize all assets:
- Image optimization and compression
- Icon tree-shaking
- Font optimization
- CSS minification

### 3. Bundle Size Reduction
Reduce overall bundle size:
- Remove unused dependencies
- Implement tree-shaking
- Use lightweight alternatives
- Code splitting for vendor libraries

### 4. Rendering Optimizations
Optimize rendering performance:
- Virtualized lists for large datasets
- Memoization of expensive components
- Efficient re-rendering strategies
- Proper use of React.memo and useMemo

## Detailed Implementation

### Code Splitting Implementation

#### Route-Based Code Splitting
```tsx
// Enhanced routing with code splitting
import { lazy, Suspense } from 'react';
import { Route, Switch } from 'wouter';

// Lazy load page components
const DashboardPage = lazy(() => import('@/pages/business/DashboardPage'));
const AccountsPage = lazy(() => import('@/pages/business/AccountsPage'));
const CashbookPage = lazy(() => import('@/pages/business/CashbookPage'));
const InvoicesPage = lazy(() => import('@/pages/business/InvoicesPage'));
const InventoryPage = lazy(() => import('@/pages/business/InventoryPage'));
const ReportsPage = lazy(() => import('@/pages/business/ReportsPage'));
const SettingsPage = lazy(() => import('@/pages/business/SettingsPage'));

const BusinessAppRoutes: React.FC = () => {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <Switch>
        <Route path="/" component={DashboardPage} />
        <Route path="/accounts" component={AccountsPage} />
        <Route path="/cashbook" component={CashbookPage} />
        <Route path="/invoices" component={InvoicesPage} />
        <Route path="/inventory" component={InventoryPage} />
        <Route path="/reports" component={ReportsPage} />
        <Route path="/settings" component={SettingsPage} />
        <Route>404: Page Not Found</Route>
      </Switch>
    </Suspense>
  );
};

// Page skeleton for loading states
const PageSkeleton: React.FC = () => {
  return (
    <div className="container-responsive py-6">
      <div className="animate-pulse">
        <div className="h-8 bg-muted rounded w-1/3 mb-6"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-32 bg-muted rounded"></div>
          <div className="h-32 bg-muted rounded"></div>
        </div>
        <div className="h-64 bg-muted rounded mt-6"></div>
      </div>
    </div>
  );
};
```

#### Component-Based Lazy Loading
```tsx
// Lazy load heavy components
const ChartCard = lazy(() => import('@/components/data-display/ChartCard'));
const DataList = lazy(() => import('@/components/data-display/DataList'));
const Table = lazy(() => import('@/components/data-display/Table'));

const DashboardPage: React.FC = () => {
  const { data: kpiData } = useQuery(['dashboard-kpi'], getDashboardKPI);
  const { data: chartData } = useQuery(['dashboard-chart'], getCashflowChart);
  
  return (
    <PageLayout title="Dashboard">
      {/* KPI Cards - always loaded */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {kpiData?.map(kpi => (
          <KPICard key={kpi.id} {...kpi} />
        ))}
      </div>
      
      {/* Charts - lazy loaded */}
      <Suspense fallback={<ChartSkeleton />}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <ChartCard title="Cashflow (30 days)">
            <CashflowChart data={chartData} />
          </ChartCard>
          <ChartCard title="Income vs Expenses">
            <IncomeExpenseChart data={chartData} />
          </ChartCard>
        </div>
      </Suspense>
    </PageLayout>
  );
};

const ChartSkeleton: React.FC = () => {
  return (
    <div className="h-64 bg-muted rounded animate-pulse"></div>
  );
};
```

#### Prefetching Implementation
```tsx
// Prefetching for anticipated navigation
const NavigationLink: React.FC<NavigationLinkProps> = ({ 
  to, 
  children, 
  prefetch = false,
  ...props 
}) => {
  useEffect(() => {
    if (prefetch && 'connection' in navigator) {
      const connection = (navigator as any).connection;
      // Only prefetch on fast connections
      if (connection.effectiveType !== 'slow-2g' && connection.effectiveType !== '2g') {
        const prefetchLink = document.createElement('link');
        prefetchLink.rel = 'prefetch';
        prefetchLink.href = to;
        document.head.appendChild(prefetchLink);
        
        return () => {
          document.head.removeChild(prefetchLink);
        };
      }
    }
  }, [prefetch, to]);
  
  return (
    <Link to={to} {...props}>
      {children}
    </Link>
  );
};

// Usage in navigation components
const SidebarNav: React.FC<SidebarNavProps> = ({ items }) => {
  return (
    <nav className="bg-card border-r border-border h-full">
      <ul className="space-y-1 p-4">
        {items.map((item) => (
          <li key={item.id}>
            <NavigationLink 
              to={item.path} 
              prefetch={true}
              className={({ isActive }) => 
                cn(
                  'flex items-center gap-3 w-full p-3 rounded-lg transition-colors',
                  isActive ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
                )
              }
            >
              {item.icon && <span aria-hidden="true">{item.icon}</span>}
              <span>{item.label}</span>
            </NavigationLink>
          </li>
        ))}
      </ul>
    </nav>
  );
};
```

### Asset Optimization

#### Image Optimization
```tsx
// Optimized image component
const OptimizedImage: React.FC<OptimizedImageProps> = ({ 
  src, 
  alt, 
  className,
  width,
  height,
  ...props 
}) => {
  // Use modern image formats when supported
  const [imageSrc, setImageSrc] = useState(src);
  
  useEffect(() => {
    // Check for WebP support
    if (typeof window !== 'undefined' && 'supports' in window) {
      (window as any).supports('image/webp').then((supportsWebP: boolean) => {
        if (supportsWebP && src.includes('.jpg')) {
          setImageSrc(src.replace('.jpg', '.webp'));
        }
      });
    }
  }, [src]);
  
  return (
    <img
      src={imageSrc}
      alt={alt}
      className={cn('max-w-full h-auto', className)}
      width={width}
      height={height}
      loading="lazy"
      decoding="async"
      {...props}
    />
  );
};

// Usage for user avatars
const UserAvatar: React.FC<UserAvatarProps> = ({ 
  name, 
  src, 
  size = 'md',
  ...props 
}) => {
  const initials = getInitials(name);
  
  if (src) {
    return (
      <OptimizedImage
        src={src}
        alt={name}
        className={cn(
          'rounded-full object-cover',
          size === 'sm' && 'w-8 h-8',
          size === 'md' && 'w-10 h-10',
          size === 'lg' && 'w-16 h-16'
        )}
        width={size === 'sm' ? 32 : size === 'md' ? 40 : 64}
        height={size === 'sm' ? 32 : size === 'md' ? 40 : 64}
        {...props}
      />
    );
  }
  
  return (
    <div
      className={cn(
        'rounded-full bg-primary text-primary-foreground flex items-center justify-center font-medium',
        size === 'sm' && 'w-8 h-8 text-xs',
        size === 'md' && 'w-10 h-10 text-sm',
        size === 'lg' && 'w-16 h-16 text-lg'
      )}
      {...props}
    >
      {initials}
    </div>
  );
};
```

#### Icon Optimization
```tsx
// Tree-shaken icon imports
import { 
  Home, 
  Wallet, 
  Receipt, 
  Package, 
  BarChart3, 
  Settings,
  User,
  Search,
  Bell,
  Menu,
  Plus,
  TrendingUp,
  TrendingDown,
  FileText,
  AlertCircle,
  CheckCircle,
  AlertTriangle,
  Download,
  CreditCard,
  FilePlus,
  PackagePlus,
  Building,
  Users,
  Activity,
  Heart,
  Shield,
  WifiOff,
  RefreshCw,
  X,
  ChevronUp,
  ChevronDown,
  LayoutList,
  LayoutGrid,
  UserPlus
} from 'lucide-react';

// Only import icons that are actually used
// Configure bundler to tree-shake unused icons
```

#### Font Optimization
```css
/* Optimized font loading */
@font-face {
  font-family: 'Inter';
  font-style: normal;
  font-weight: 400;
  font-display: swap;
  src: url('/fonts/inter-regular.woff2') format('woff2');
}

@font-face {
  font-family: 'Inter';
  font-style: normal;
  font-weight: 500;
  font-display: swap;
  src: url('/fonts/inter-medium.woff2') format('woff2');
}

@font-face {
  font-family: 'Inter';
  font-style: normal;
  font-weight: 600;
  font-display: swap;
  src: url('/fonts/inter-semibold.woff2') format('woff2');
}

@font-face {
  font-family: 'Inter';
  font-style: normal;
  font-weight: 700;
  font-display: swap;
  src: url('/fonts/inter-bold.woff2') format('woff2');
}

/* System font fallback */
.font-sans {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
}

.font-mono {
  font-family: 'JetBrains Mono', 'Fira Code', monospace;
}
```

### Bundle Size Reduction

#### Dependency Analysis
```json
// package.json optimization
{
  "dependencies": {
    // Remove unused dependencies
    // Replace heavy libraries with lighter alternatives
    "@tanstack/react-query": "^4.0.0", // Instead of older versions
    "lucide-react": "^0.100.0", // Tree-shakable icons
    "zustand": "^4.0.0", // Lightweight state management
    // Remove unused libraries like lodash if not needed
  },
  "devDependencies": {
    // Optimize build tools
    "vite": "^4.0.0", // Faster builds
    "@vitejs/plugin-react": "^3.0.0",
    // Remove unused dev dependencies
  }
}
```

#### Tree Shaking Configuration
```javascript
// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Split vendor libraries
          react: ['react', 'react-dom'],
          router: ['wouter'],
          state: ['zustand'],
          query: ['@tanstack/react-query'],
          charts: ['recharts'],
          icons: ['lucide-react'],
          ui: ['@/components/ui'],
        }
      }
    },
    // Enable minification
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    }
  },
  // Optimize dependencies
  optimizeDeps: {
    include: ['react', 'react-dom', 'wouter', 'zustand', '@tanstack/react-query'],
    exclude: ['lucide-react'] // Tree-shake icons
  }
});
```

### Rendering Optimizations

#### Virtualized Lists
```tsx
// Virtualized table for large datasets
import { FixedSizeList as List } from 'react-window';
import { memo, useMemo } from 'react';

interface VirtualizedTableProps {
  data: any[];
  columns: Column[];
  rowHeight?: number;
}

const VirtualizedTable: React.FC<VirtualizedTableProps> = memo(({ 
  data, 
  columns, 
  rowHeight = 50 
}) => {
  const itemCount = data.length;
  
  const Row = memo(({ index, style }: { index: number; style: React.CSSProperties }) => {
    const item = data[index];
    return (
      <div style={style} className="border-b border-border">
        <TableRow item={item} columns={columns} />
      </div>
    );
  });
  
  return (
    <div className="h-96">
      <div className="grid grid-cols-4 gap-4 px-4 py-3 border-b bg-muted text-sm font-medium">
        {columns.map(column => (
          <div key={column.key}>{column.title}</div>
        ))}
      </div>
      <List
        height={352}
        itemCount={itemCount}
        itemSize={rowHeight}
        width="100%"
      >
        {Row}
      </List>
    </div>
  );
});

// Usage for accounts table
const AccountsPage: React.FC = () => {
  const { data: accounts, isLoading } = useQuery(['accounts'], getAccounts);
  
  if (isLoading) {
    return <PageSkeleton />;
  }
  
  if (accounts && accounts.length > 200) {
    // Use virtualized table for large datasets
    return (
      <PageLayout title="Accounts">
        <VirtualizedTable 
          data={accounts} 
          columns={accountColumns} 
        />
      </PageLayout>
    );
  }
  
  // Use regular table for smaller datasets
  return (
    <PageLayout title="Accounts">
      <Table data={accounts} columns={accountColumns} />
    </PageLayout>
  );
};
```

#### Memoization Implementation
```tsx
// Memoized components for expensive calculations
const AccountCard: React.FC<AccountCardProps> = memo(({ 
  account, 
  balance 
}) => {
  // Memoize expensive calculations
  const balanceColor = useMemo(() => {
    return balance > 0 ? 'text-success' : 'text-destructive';
  }, [balance]);
  
  const balanceLabel = useMemo(() => {
    return balance > 0 ? 'Advance' : 'Due';
  }, [balance]);
  
  const initials = useMemo(() => {
    return account.name
      .split(' ')
      .filter(Boolean)
      .map(n => n[0])
      .join('')
      .toUpperCase();
  }, [account.name]);
  
  return (
    <Card className="p-4 cursor-pointer transition-all duration-200 hover:shadow-md hover:-translate-y-0.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Avatar className="w-12 h-12">
            <AvatarFallback className="bg-primary text-primary-foreground font-medium">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <div className="font-semibold truncate">
              {account.name}
            </div>
            {account.phone && (
              <div className="text-sm text-muted-foreground truncate">
                {account.phone}
              </div>
            )}
          </div>
        </div>
        <div className="text-right">
          <div className={cn('font-medium', balanceColor)}>
            {formatCurrency(Math.abs(balance))}
          </div>
          <div className="text-sm text-muted-foreground">
            {balanceLabel}
          </div>
        </div>
      </div>
    </Card>
  );
});

// Memoized chart components
const CashflowChart: React.FC<CashflowChartProps> = memo(({ data }) => {
  // Memoize processed data
  const processedData = useMemo(() => {
    return data.map(item => ({
      ...item,
      date: new Date(item.date),
      net: item.inflows - item.outflows
    }));
  }, [data]);
  
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={processedData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey="inflows" fill="hsl(var(--success))" name="Cash In" />
        <Bar dataKey="outflows" fill="hsl(var(--destructive))" name="Cash Out" />
      </BarChart>
    </ResponsiveContainer>
  );
});
```

### Core Web Vitals Optimization

#### Largest Contentful Paint (LCP) Optimization
```tsx
// Optimize critical rendering path
const App: React.FC = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  
  // Preload critical resources
  useEffect(() => {
    // Preload fonts
    const fontLink = document.createElement('link');
    fontLink.rel = 'preload';
    fontLink.as = 'font';
    fontLink.type = 'font/woff2';
    fontLink.crossOrigin = 'anonymous';
    fontLink.href = '/fonts/inter-regular.woff2';
    document.head.appendChild(fontLink);
    
    // Preload critical CSS
    const cssLink = document.createElement('link');
    cssLink.rel = 'preload';
    cssLink.as = 'style';
    cssLink.href = '/src/index.css';
    document.head.appendChild(cssLink);
    
    return () => {
      document.head.removeChild(fontLink);
      document.head.removeChild(cssLink);
    };
  }, []);
  
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="min-h-screen bg-background text-foreground antialiased">
          {!isOnline && <OfflineBanner />}
          <AppRouter />
          <Toaster />
        </div>
      </TooltipProvider>
    </QueryClientProvider>
  );
};
```

#### First Input Delay (FID) Optimization
```tsx
// Optimize main thread work
const usePassiveTouch = () => {
  useEffect(() => {
    // Set touch action to passive to prevent blocking
    const setPassive = () => {
      document.body.style.touchAction = 'manipulation';
    };
    
    setPassive();
    
    return () => {
      document.body.style.touchAction = '';
    };
  }, []);
};

// Use in components that handle touch events
const MobileBottomNav: React.FC = () => {
  usePassiveTouch();
  
  return (
    <nav className="nav-mobile safe-area-bottom">
      {/* Navigation items */}
    </nav>
  );
};
```

#### Cumulative Layout Shift (CLS) Optimization
```tsx
// Reserve space for dynamic content
const PageHeader: React.FC<PageHeaderProps> = ({ 
  title, 
  actions 
}) => {
  return (
    <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
      <div className="min-h-[2rem]"> {/* Reserve space for title */}
        <h1 className="text-2xl font-bold text-foreground">{title}</h1>
      </div>
      {actions && (
        <div className="min-h-[2.5rem] min-w-[120px]"> {/* Reserve space for actions */}
          <div className="flex gap-2">
            {actions}
          </div>
        </div>
      )}
    </header>
  );
};

// Reserve space for images
const UserAvatar: React.FC<UserAvatarProps> = ({ 
  name, 
  src, 
  size = 'md' 
}) => {
  return (
    <div className={cn(
      'flex-shrink-0', // Prevent flexbox from shrinking
      size === 'sm' && 'w-8 h-8',
      size === 'md' && 'w-10 h-10',
      size === 'lg' && 'w-16 h-16'
    )}>
      {src ? (
        <img
          src={src}
          alt={name}
          className="w-full h-full rounded-full object-cover"
          loading="lazy"
          decoding="async"
        />
      ) : (
        <div className="w-full h-full rounded-full bg-primary text-primary-foreground flex items-center justify-center font-medium">
          {getInitials(name)}
        </div>
      )}
    </div>
  );
};
```

## File Structure
```
client/src/
├── lib/
│   ├── performance/
│   │   ├── lazy-loader.ts
│   │   ├── image-optimizer.ts
│   │   └── resource-preloader.ts
│   └── hooks/
│       ├── usePassiveTouch.ts
│       └── usePrefetch.ts
├── components/
│   └── performance/
│       ├── VirtualizedList.tsx
│       ├── SuspenseFallback.tsx
│       └── PerformanceObserver.tsx
└── utils/
    └── performance-utils.ts
```

## Implementation Steps

### Phase 1: Code Splitting
1. Implement route-based code splitting
2. Add component-based lazy loading
3. Implement prefetching for navigation
4. Create loading skeletons

### Phase 2: Asset Optimization
1. Optimize images with WebP format
2. Implement tree-shaking for icons
3. Optimize font loading with font-display swap
4. Minify and compress CSS/JS assets

### Phase 3: Bundle Size Reduction
1. Analyze and remove unused dependencies
2. Configure tree-shaking for all libraries
3. Split vendor bundles
4. Enable compression in build process

### Phase 4: Rendering Optimizations
1. Implement virtualized lists for large datasets
2. Add memoization for expensive components
3. Optimize re-rendering with React.memo
4. Implement efficient state management

### Phase 5: Core Web Vitals Optimization
1. Optimize LCP with critical resource preloading
2. Reduce FID with main thread optimization
3. Minimize CLS with reserved space for dynamic content
4. Monitor performance metrics

## Performance Monitoring

### Metrics to Track
- First Contentful Paint (FCP)
- Largest Contentful Paint (LCP)
- First Input Delay (FID)
- Cumulative Layout Shift (CLS)
- Time to Interactive (TTI)
- Bundle size
- Memory usage

### Monitoring Tools
- Lighthouse for Core Web Vitals
- Web Vitals extension for real-user monitoring
- Performance monitoring in CI pipeline
- Bundle size tracking

## Testing Strategy

### Performance Testing
- Lighthouse audits in CI pipeline
- WebPageTest for detailed performance analysis
- Bundle size monitoring
- Real-user monitoring with Web Vitals

### Optimization Validation
- Before/after performance comparisons
- Core Web Vitals threshold validation
- Mobile performance testing
- Slow network simulation

## Documentation

Each optimization will include:
1. Purpose and benefits
2. Implementation details
3. Performance impact
4. Testing guidelines
5. Monitoring recommendations