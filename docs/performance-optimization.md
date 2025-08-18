# Performance Optimization

## Overview
This document outlines the implementation of performance optimizations for the Credit Debit financial management application to meet Lighthouse targets (Perf ≥ 90, A11y ≥ 95, Best Practices ≥ 95).

## Performance Goals

### Lighthouse Targets
- Performance: ≥ 90
- Accessibility: ≥ 95
- Best Practices: ≥ 95

### Core Web Vitals
- Largest Contentful Paint (LCP): ≤ 2.5s
- First Input Delay (FID): ≤ 100ms
- Cumulative Layout Shift (CLS): ≤ 0.1

## Optimization Strategies

### Code Splitting
```tsx
// client/src/pages/index.ts
// Lazy load pages for better initial load performance
export const Dashboard = React.lazy(() => import('./Dashboard'));
export const Accounts = React.lazy(() => import('./Accounts'));
export const CashBook = React.lazy(() => import('./CashBook'));
export const Invoices = React.lazy(() => import('./Invoices'));
export const Inventory = React.lazy(() => import('./Inventory'));
export const Reports = React.lazy(() => import('./Reports'));
export const Settings = React.lazy(() => import('./Settings'));

// Route-based code splitting
const AppRouter: React.FC = () => {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/accounts" component={Accounts} />
        <Route path="/cashbook" component={CashBook} />
        <Route path="/invoices" component={Invoices} />
        <Route path="/inventory" component={Inventory} />
        <Route path="/reports" component={Reports} />
        <Route path="/settings" component={Settings} />
      </Switch>
    </Suspense>
  );
};
```

### Bundle Optimization
```json
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig({
  plugins: [
    react(),
    visualizer({
      filename: 'dist/stats.html',
      open: true,
    }),
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          ui: ['@/components/ui'],
          charts: ['recharts'],
          utils: ['@/lib/utils', '@/lib/api'],
        },
      },
    },
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
  },
});
```

### Image Optimization
```tsx
// client/src/components/Image.tsx
import { useState, useEffect } from 'react';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
}

export const OptimizedImage: React.FC<OptimizedImageProps> = ({ 
  src, 
  alt, 
  width, 
  height, 
  className 
}) => {
  const [imageSrc, setImageSrc] = useState('');
  
  useEffect(() => {
    // Use WebP format when supported
    const supportsWebP = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 1;
      canvas.height = 1;
      const data = canvas.toDataURL('image/webp');
      return data.indexOf('image/webp') === 0;
    };
    
    // Generate optimized image URL
    const optimizedSrc = supportsWebP() 
      ? src.replace(/\.(jpg|jpeg|png)$/i, '.webp')
      : src;
    
    setImageSrc(optimizedSrc);
  }, [src]);
  
  return (
    <img
      src={imageSrc}
      alt={alt}
      width={width}
      height={height}
      className={className}
      loading="lazy"
      decoding="async"
    />
  );
};
```

### Icon Optimization
```tsx
// client/src/lib/icons.ts
// Tree-shake lucide icons by importing only what's needed
export { 
  Home, 
  Wallet, 
  Receipt, 
  Package, 
  BarChart3, 
  Settings,
  Building2,
  TrendingUp,
  User,
  LogOut,
  Sun,
  Moon,
  Menu,
  X,
  Search,
  Plus,
  Edit,
  Trash2,
  Eye,
  Download,
  Filter,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';
```

### Virtualized Lists
```tsx
// client/src/components/VirtualizedTable.tsx
import { FixedSizeList as List } from 'react-window';
import { useMemo } from 'react';

interface VirtualizedTableProps {
  data: any[];
  columns: { key: string; header: string; width: number }[];
  rowHeight?: number;
  height?: number;
}

export const VirtualizedTable: React.FC<VirtualizedTableProps> = ({ 
  data, 
  columns, 
  rowHeight = 50, 
  height = 400 
}) => {
  const itemData = useMemo(() => ({ data, columns }), [data, columns]);
  
  const Row = ({ index, style }: { index: number; style: React.CSSProperties }) => {
    const row = data[index];
    return (
      <div style={style} className="flex border-b border-border">
        {columns.map(column => (
          <div 
            key={column.key} 
            className="px-4 py-2 text-sm text-foreground truncate"
            style={{ width: column.width }}
          >
            {row[column.key]}
          </div>
        ))}
      </div>
    );
  };
  
  return (
    <div className="border border-border rounded-lg">
      <div className="flex bg-muted border-b border-border">
        {columns.map(column => (
          <div 
            key={column.key} 
            className="px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider"
            style={{ width: column.width }}
          >
            {column.header}
          </div>
        ))}
      </div>
      <List
        height={height}
        itemCount={data.length}
        itemSize={rowHeight}
        itemData={itemData}
      >
        {Row}
      </List>
    </div>
  );
};
```

### Memoization
```tsx
// client/src/components/ExpensiveComponent.tsx
import { memo, useMemo } from 'react';

interface ExpensiveComponentProps {
  data: any[];
  filter: string;
  onItemSelect: (item: any) => void;
}

// Memoize the entire component
export const ExpensiveComponent = memo<ExpensiveComponentProps>(({
  data,
  filter,
  onItemSelect
}) => {
  // Memoize expensive calculations
  const filteredData = useMemo(() => {
    return data.filter(item => 
      item.name.toLowerCase().includes(filter.toLowerCase())
    );
  }, [data, filter]);
  
  const summaryStats = useMemo(() => {
    return {
      total: filteredData.length,
      average: filteredData.reduce((sum, item) => sum + item.value, 0) / filteredData.length,
      max: Math.max(...filteredData.map(item => item.value)),
      min: Math.min(...filteredData.map(item => item.value)),
    };
  }, [filteredData]);
  
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-4 gap-4">
        <StatCard label="Total" value={summaryStats.total} />
        <StatCard label="Average" value={summaryStats.average.toFixed(2)} />
        <StatCard label="Max" value={summaryStats.max} />
        <StatCard label="Min" value={summaryStats.min} />
      </div>
      <div className="space-y-2">
        {filteredData.map(item => (
          <ItemRow 
            key={item.id} 
            item={item} 
            onSelect={() => onItemSelect(item)} 
          />
        ))}
      </div>
    </div>
  );
});

// Memoize child components
const StatCard = memo(({ label, value }: { label: string; value: string | number }) => (
  <div className="p-4 bg-card border border-border rounded-lg">
    <div className="text-sm text-muted-foreground">{label}</div>
    <div className="text-2xl font-bold text-foreground">{value}</div>
  </div>
));

const ItemRow = memo(({ item, onSelect }: { item: any; onSelect: () => void }) => (
  <div 
    className="p-3 bg-card border border-border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
    onClick={onSelect}
  >
    <div className="font-medium text-foreground">{item.name}</div>
    <div className="text-sm text-muted-foreground">{item.description}</div>
  </div>
));
```

## Loading Strategies

### Skeleton Loading
```tsx
// client/src/components/SkeletonLoader.tsx
export const SkeletonLoader: React.FC<{ 
  rows?: number; 
  className?: string 
}> = ({ rows = 5, className }) => {
  return (
    <div className={className}>
      {[...Array(rows)].map((_, i) => (
        <div key={i} className="animate-pulse flex space-x-4 p-4">
          <div className="rounded-full bg-muted h-10 w-10"></div>
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-muted rounded w-3/4"></div>
            <div className="h-4 bg-muted rounded w-1/2"></div>
          </div>
        </div>
      ))}
    </div>
  );
};
```

### Progressive Enhancement
```tsx
// client/src/components/ProgressiveImage.tsx
import { useState, useEffect } from 'react';

interface ProgressiveImageProps {
  src: string;
  alt: string;
  className?: string;
}

export const ProgressiveImage: React.FC<ProgressiveImageProps> = ({ 
  src, 
  alt, 
  className 
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isError, setIsError] = useState(false);
  
  useEffect(() => {
    const img = new Image();
    img.src = src;
    
    img.onload = () => {
      setIsLoaded(true);
    };
    
    img.onerror = () => {
      setIsError(true);
    };
  }, [src]);
  
  if (isError) {
    return (
      <div className={cn("bg-muted flex items-center justify-center", className)}>
        <AlertCircle className="h-8 w-8 text-muted-foreground" />
      </div>
    );
  }
  
  return (
    <div className={className}>
      {!isLoaded && (
        <div className="animate-pulse bg-muted w-full h-full rounded" />
      )}
      <img
        src={src}
        alt={alt}
        className={cn(
          "transition-opacity duration-300",
          isLoaded ? "opacity-100" : "opacity-0"
        )}
        onLoad={() => setIsLoaded(true)}
        onError={() => setIsError(true)}
      />
    </div>
  );
};
```

## Performance Monitoring

### Web Vitals Tracking
```tsx
// client/src/lib/web-vitals.ts
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

export const reportWebVitals = (onPerfEntry?: (metric: any) => void) => {
  if (onPerfEntry && onPerfEntry instanceof Function) {
    getCLS(onPerfEntry);
    getFID(onPerfEntry);
    getFCP(onPerfEntry);
    getLCP(onPerfEntry);
    getTTFB(onPerfEntry);
  }
};

// In main.tsx
reportWebVitals(console.log);
```

### Performance Budgets
```json
// package.json
{
  "scripts": {
    "analyze": "vite build && npx bundlewatch --config bundlewatch.config.js"
  }
}
```

```js
// bundlewatch.config.js
module.exports = {
  files: [
    {
      path: 'dist/**/*.js',
      maxSize: '150kB',
    },
    {
      path: 'dist/**/*.css',
      maxSize: '50kB',
    },
  ],
};
```

## Implementation Plan

### Phase 1: Code Splitting and Bundle Optimization
1. Implement route-based code splitting
2. Configure bundle optimization in Vite
3. Set up bundle visualization
4. Tree-shake unused dependencies

### Phase 2: Asset Optimization
1. Optimize images with WebP format
2. Tree-shake icon libraries
3. Implement virtualized lists for large datasets
4. Add memoization for expensive components

### Phase 3: Loading Strategies
1. Implement skeleton loading
2. Add progressive enhancement
3. Optimize critical rendering path
4. Implement lazy loading for non-critical resources

### Phase 4: Performance Monitoring
1. Set up Web Vitals tracking
2. Implement performance budgets
3. Add performance monitoring to CI/CD
4. Create performance dashboard

## Testing Strategy

### Performance Testing
- Lighthouse audits
- WebPageTest.org testing
- Chrome DevTools performance panel
- Automated performance testing in CI/CD

### Bundle Analysis
- Bundle size analysis
- Dependency tree analysis
- Code coverage analysis
- Performance budget compliance

### User Experience Testing
- Real user monitoring (RUM)
- Core Web Vitals tracking
- User timing measurements
- Performance impact assessment

## Tools and Resources

### Build Tools
- Vite for fast builds
- Rollup for bundling
- Terser for minification
- PostCSS for CSS optimization

### Analysis Tools
- Webpack Bundle Analyzer
- Lighthouse CI
- BundleWatch
- Chrome DevTools

### Monitoring Tools
- Google Analytics 4
- Sentry for error tracking
- Web Vitals reporting
- Performance monitoring dashboards

## Performance Metrics

### Key Metrics to Track
- First Contentful Paint (FCP)
- Largest Contentful Paint (LCP)
- First Input Delay (FID)
- Cumulative Layout Shift (CLS)
- Time to Interactive (TTI)
- Bundle size
- Time to First Byte (TTFB)

### Performance Budgets
- JavaScript: < 150kB gzipped
- CSS: < 50kB gzipped
- Images: < 100kB total
- Fonts: < 50kB total
- Initial load time: < 2 seconds
- Time to Interactive: < 3 seconds

## Ongoing Maintenance

### Performance Audits
- Monthly performance audits
- Automated performance testing
- Bundle size monitoring
- User experience feedback collection

### Optimization Reviews
- Quarterly performance optimization reviews
- Dependency update impact assessment
- New feature performance impact analysis
- Performance regression prevention

### Team Practices
- Performance-focused code reviews
- Performance documentation
- Performance training for team members
- Performance champions program