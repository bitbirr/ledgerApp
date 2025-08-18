# Performance Testing Implementation

## Overview
This document outlines the implementation of comprehensive performance testing for the Credit Debit application to ensure optimal user experience and meet Lighthouse performance thresholds.

## Performance Goals

### Lighthouse Targets
- **Performance**: ≥ 90
- **Accessibility**: ≥ 95
- **Best Practices**: ≥ 95
- **SEO**: ≥ 90

### Core Web Vitals
- **First Contentful Paint (FCP)**: ≤ 1.8 seconds
- **Largest Contentful Paint (LCP)**: ≤ 2.5 seconds
- **First Input Delay (FID)**: ≤ 100 milliseconds
- **Cumulative Layout Shift (CLS)**: ≤ 0.1

### Bundle Size Targets
- **JavaScript**: ≤ 200KB compressed
- **CSS**: ≤ 50KB compressed
- **Total Assets**: ≤ 1MB for critical path

## Performance Testing Strategy

### Testing Tools
1. **Lighthouse CI** - Automated performance testing
2. **WebPageTest** - Detailed performance analysis
3. **Bundle Analyzer** - Bundle size optimization
4. **React Profiler** - Component performance monitoring
5. **Chrome DevTools** - Manual performance profiling

### Test Scenarios
1. **Page Load Performance**
   - Initial page load times
   - Subsequent navigation performance
   - Caching effectiveness

2. **User Interaction Performance**
   - Form submission response times
   - Button click responsiveness
   - Modal/dialog opening times
   - Search/filter performance

3. **Data Loading Performance**
   - API response times
   - Large dataset rendering
   - Pagination performance
   - Real-time updates

4. **Resource Loading Performance**
   - Image loading optimization
   - Font loading strategies
   - Asset compression
   - CDN performance

## Performance Testing Implementation

### Lighthouse CI Configuration
```javascript
// lighthouserc.js
module.exports = {
  ci: {
    collect: {
      numberOfRuns: 3,
      url: [
        'http://localhost:3000/',
        'http://localhost:3000/dashboard',
        'http://localhost:3000/accounts',
        'http://localhost:3000/transactions',
        'http://localhost:3000/reports'
      ],
      settings: {
        preset: 'desktop',
        onlyCategories: ['performance', 'accessibility', 'best-practices'],
      }
    },
    assert: {
      preset: 'lighthouse:recommended',
      assertions: {
        'categories:performance': ['error', { minScore: 0.9 }],
        'categories:accessibility': ['error', { minScore: 0.95 }],
        'categories:best-practices': ['error', { minScore: 0.95 }],
        'first-contentful-paint': ['error', { maxNumericValue: 1800 }],
        'largest-contentful-paint': ['error', { maxNumericValue: 2500 }],
        'cumulative-layout-shift': ['error', { maxNumericValue: 0.1 }],
        'total-blocking-time': ['error', { maxNumericValue: 200 }],
      }
    },
    upload: {
      target: 'temporary-public-storage',
    },
  },
};
```

### WebPageTest Integration
```javascript
// performance-test.js
const WebPageTest = require('webpagetest');
const wpt = new WebPageTest('www.webpagetest.org', 'YOUR_API_KEY');

async function runPerformanceTest(url) {
  const result = await wpt.runTest(url, {
    location: 'Dulles:Chrome',
    connectivity: 'Cable',
    firstViewOnly: false,
    runs: 3,
    video: true,
    timeline: true,
    fullResolutionScreenshot: true
  });

  return result;
}

// Test critical pages
const pages = [
  '/',
  '/dashboard',
  '/accounts',
  '/transactions',
  '/reports'
];

pages.forEach(async (page) => {
  const result = await runPerformanceTest(`http://localhost:3000${page}`);
  console.log(`Performance test for ${page}:`, result);
});
```

### Bundle Analysis
```javascript
// vite.config.ts (with bundle analyzer)
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig({
  plugins: [
    react(),
    visualizer({
      filename: 'dist/stats.html',
      open: true,
      gzipSize: true,
      brotliSize: true,
    })
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          ui: ['@/components/ui'],
          charts: ['recharts'],
          forms: ['react-hook-form', '@hookform/resolvers'],
          state: ['zustand', '@tanstack/react-query'],
        }
      }
    }
  }
});
```

## Performance Optimization Techniques

### Code Splitting
```tsx
// Lazy loading pages
import { lazy, Suspense } from 'react';

const Dashboard = lazy(() => import('@/pages/business/Dashboard'));
const Accounts = lazy(() => import('@/pages/business/Accounts'));
const Transactions = lazy(() => import('@/pages/business/Transactions'));
const Reports = lazy(() => import('@/pages/business/Reports'));

function App() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/accounts" element={<Accounts />} />
        <Route path="/transactions" element={<Transactions />} />
        <Route path="/reports" element={<Reports />} />
      </Routes>
    </Suspense>
  );
}
```

### Component Memoization
```tsx
// Memoized component for better performance
import { memo, useMemo } from 'react';

interface AccountListProps {
  accounts: Account[];
  onAccountSelect: (account: Account) => void;
}

const AccountList = memo(({ accounts, onAccountSelect }: AccountListProps) => {
  const sortedAccounts = useMemo(() => {
    return [...accounts].sort((a, b) => a.name.localeCompare(b.name));
  }, [accounts]);

  return (
    <div className="account-list">
      {sortedAccounts.map(account => (
        <AccountItem
          key={account.id}
          account={account}
          onSelect={onAccountSelect}
        />
      ))}
    </div>
  );
});

// Memoized item component
const AccountItem = memo(({ account, onSelect }: { 
  account: Account; 
  onSelect: (account: Account) => void 
}) => {
  return (
    <div 
      className="account-item"
      onClick={() => onSelect(account)}
    >
      <h3>{account.name}</h3>
      <p>Balance: {formatCurrency(account.balance)}</p>
    </div>
  );
});
```

### Virtualized Lists
```tsx
// Virtualized list for large datasets
import { FixedSizeList as List } from 'react-window';

interface TransactionListProps {
  transactions: Transaction[];
}

const TransactionList: React.FC<TransactionListProps> = ({ transactions }) => {
  const itemCount = transactions.length;
  const itemSize = 60; // Height of each item in pixels

  const Row = ({ index, style }: { index: number; style: React.CSSProperties }) => {
    const transaction = transactions[index];
    return (
      <div style={style} className="transaction-row">
        <div>{transaction.date}</div>
        <div>{transaction.description}</div>
        <div>{formatCurrency(transaction.amount)}</div>
      </div>
    );
  };

  return (
    <List
      height={600}
      itemCount={itemCount}
      itemSize={itemSize}
      width="100%"
    >
      {Row}
    </List>
  );
};
```

### Image Optimization
```tsx
// Optimized image component
import { useState, useEffect } from 'react';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
}

const OptimizedImage: React.FC<OptimizedImageProps> = ({ 
  src, 
  alt, 
  width, 
  height,
  className 
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  // Generate WebP version for modern browsers
  const webpSrc = src.replace(/\.(jpg|jpeg|png)$/i, '.webp');

  return (
    <div className={`image-container ${className || ''}`}>
      {isLoading && <div className="image-placeholder">Loading...</div>}
      {hasError ? (
        <div className="image-error">Failed to load image</div>
      ) : (
        <picture>
          <source srcSet={webpSrc} type="image/webp" />
          <img
            src={src}
            alt={alt}
            width={width}
            height={height}
            loading="lazy"
            onLoad={() => setIsLoading(false)}
            onError={() => {
              setIsLoading(false);
              setHasError(true);
            }}
            className={isLoading ? 'loading' : 'loaded'}
          />
        </picture>
      )}
    </div>
  );
};
```

## Performance Monitoring

### Real User Monitoring (RUM)
```typescript
// Performance monitoring with Web Vitals
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

function sendToAnalytics(metric: any) {
  // Send metric to analytics service
  console.log('Performance Metric:', metric);
}

getCLS(sendToAnalytics);
getFID(sendToAnalytics);
getFCP(sendToAnalytics);
getLCP(sendToAnalytics);
getTTFB(sendToAnalytics);
```

### Custom Performance Metrics
```typescript
// Custom performance monitoring
class PerformanceMonitor {
  static measureInteraction(name: string, callback: () => void) {
    const start = performance.now();
    callback();
    const end = performance.now();
    
    const duration = end - start;
    console.log(`${name} took ${duration} milliseconds`);
    
    // Send to analytics
    if (duration > 100) {
      console.warn(`Slow interaction detected: ${name} (${duration}ms)`);
    }
  }

  static measureComponentRender(componentName: string) {
    return (WrappedComponent: React.ComponentType) => {
      return (props: any) => {
        const start = performance.now();
        const result = <WrappedComponent {...props} />;
        const end = performance.now();
        
        const duration = end - start;
        console.log(`${componentName} render time: ${duration}ms`);
        
        return result;
      };
    };
  }
}

// Usage
const MonitoredDashboard = PerformanceMonitor.measureComponentRender('Dashboard')(Dashboard);
```

## Performance Testing Scenarios

### Load Testing
```typescript
// Load testing with Artillery
// load-test.yml
config:
  target: "http://localhost:3000"
  phases:
    - duration: 60
      arrivalRate: 20
      name: "Load test"
  defaults:
    headers:
      content-type: "application/json"

scenarios:
  - name: "User Login Flow"
    flow:
      - get:
          url: "/login"
      - post:
          url: "/api/auth/login"
          json:
            username: "testuser"
            password: "password123"
      - get:
          url: "/dashboard"
      - get:
          url: "/accounts"
      - get:
          url: "/transactions"
```

### Stress Testing
```typescript
// Stress testing with multiple concurrent users
async function stressTest() {
  const concurrentUsers = 100;
  const requests = [];

  for (let i = 0; i < concurrentUsers; i++) {
    requests.push(fetch('/api/accounts', {
      headers: {
        'business-id': 'test-business',
        'user-id': `user-${i}`
      }
    }));
  }

  const start = Date.now();
  const responses = await Promise.all(requests);
  const end = Date.now();

  console.log(`Stress test completed in ${end - start}ms for ${concurrentUsers} users`);
  console.log(`Average response time: ${(end - start) / concurrentUsers}ms`);
}
```

## Performance Budgets

### Asset Size Budgets
```json
// package.json
{
  "scripts": {
    "build": "vite build",
    "analyze": "vite build && npx bundlewatch",
    "perf:test": "lighthouse http://localhost:3000 --view"
  },
  "bundlewatch": {
    "files": [
      {
        "path": "dist/assets/*.js",
        "maxSize": "200kB"
      },
      {
        "path": "dist/assets/*.css",
        "maxSize": "50kB"
      }
    ]
  }
}
```

### Performance Budget Enforcement
```javascript
// webpack.config.js (performance budget)
module.exports = {
  // ... other config
  performance: {
    maxAssetSize: 250000,
    maxEntrypointSize: 500000,
    hints: 'error'
  }
};
```

## Continuous Performance Monitoring

### GitHub Actions Integration
```yaml
# .github/workflows/performance.yml
name: Performance Tests
on: [push, pull_request]
jobs:
  performance:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      - name: Install dependencies
        run: npm ci
      - name: Build application
        run: npm run build
      - name: Run Lighthouse CI
        run: npx @lhci/cli@latest autorun
      - name: Check bundle size
        run: npx bundlewatch
      - name: Run load tests
        run: npx artillery run load-test.yml
```

### Performance Dashboard
```typescript
// Performance dashboard component
const PerformanceDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState({
    fcp: 0,
    lcp: 0,
    cls: 0,
    fid: 0,
    tbt: 0
  });

  useEffect(() => {
    // Collect performance metrics
    const observer = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        if (entry.name === 'first-contentful-paint') {
          setMetrics(prev => ({ ...prev, fcp: entry.startTime }));
        }
      });
    });

    observer.observe({ entryTypes: ['paint'] });

    return () => observer.disconnect();
  }, []);

  return (
    <div className="performance-dashboard">
      <h2>Performance Metrics</h2>
      <div className="metrics-grid">
        <MetricCard 
          title="First Contentful Paint" 
          value={metrics.fcp} 
          unit="ms" 
          target={1800}
        />
        <MetricCard 
          title="Largest Contentful Paint" 
          value={metrics.lcp} 
          unit="ms" 
          target={2500}
        />
        <MetricCard 
          title="Cumulative Layout Shift" 
          value={metrics.cls} 
          target={0.1}
        />
      </div>
    </div>
  );
};
```

This comprehensive performance testing implementation ensures the Credit Debit application meets high performance standards while providing tools and processes for continuous monitoring and optimization.