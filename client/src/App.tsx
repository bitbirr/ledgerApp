import { useEffect, useState } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuthStore } from "@/lib/auth-store";
import { queryClient } from "@/lib/queryClient";
import { BusinessAppShell } from "@/components/layout/BusinessAppShell";
import { SuperAdminAppShell } from "@/components/layout/SuperAdminAppShell";
import { BusinessLogin } from "@/pages/business/Login";
import { SuperAdminLogin } from "@/pages/admin/Login";
import { useLocation, Route, Switch, Redirect } from "wouter";

// Business App Pages
import { Dashboard } from "@/pages/business/Dashboard";
import { Accounts } from "@/pages/business/Accounts";
import { Cashbook } from "@/pages/business/Cashbook";
import { Invoices } from "@/pages/business/Invoices";
import { Inventory } from "@/pages/business/Inventory";
import { Reports } from "@/pages/business/Reports";
import { Settings } from "@/pages/business/Settings";

// Admin App Pages (using placeholders for now)
const AdminDashboard = () => <div>Admin Dashboard</div>;
const Businesses = () => <div>Businesses Management</div>;
const Branches = () => <div>Branches Management</div>;
const Users = () => <div>Users Management</div>;
const AppSettings = () => <div>App Settings</div>;
const Audit = () => <div>Audit Trail</div>;
const Feedback = () => <div>Feedback Management</div>;
const Diagnostics = () => <div>System Diagnostics</div>;

function BusinessApp() {
  const [location] = useLocation();
  
  return (
    <BusinessAppShell>
      <Switch location={location}>
        <Route path="/" component={Dashboard} />
        <Route path="/dashboard" component={Dashboard} />
        <Route path="/accounts" component={Accounts} />
        <Route path="/cashbook" component={Cashbook} />
        <Route path="/invoices" component={Invoices} />
        <Route path="/inventory" component={Inventory} />
        <Route path="/reports" component={Reports} />
        <Route path="/settings" component={Settings} />
        <Route>
          <div className="p-8 text-center">
            <h1 className="text-2xl font-bold mb-4">Page Not Found</h1>
            <p className="text-muted-foreground mb-4">The page you're looking for doesn't exist.</p>
            <button 
              className="text-primary hover:underline"
              onClick={() => window.location.href = '/'}
            >
              Go back to dashboard
            </button>
          </div>
        </Route>
      </Switch>
    </BusinessAppShell>
  );
}

function SuperAdminApp() {
  const [location] = useLocation();
  
  return (
    <SuperAdminAppShell>
      <Switch location={location}>
        <Route path="/admin" component={AdminDashboard} />
        <Route path="/admin/businesses" component={Businesses} />
        <Route path="/admin/branches" component={Branches} />
        <Route path="/admin/users" component={Users} />
        <Route path="/admin/settings" component={AppSettings} />
        <Route path="/admin/audit" component={Audit} />
        <Route path="/admin/feedback" component={Feedback} />
        <Route path="/admin/diagnostics" component={Diagnostics} />
        <Route>
          <div className="p-8 text-center">
            <h1 className="text-2xl font-bold mb-4">Page Not Found</h1>
            <p className="text-muted-foreground mb-4">The page you're looking for doesn't exist.</p>
            <button 
              className="text-primary hover:underline"
              onClick={() => window.location.href = '/admin'}
            >
              Go back to dashboard
            </button>
          </div>
        </Route>
      </Switch>
    </SuperAdminAppShell>
  );
}

function App() {
  const { isAuthenticated, role, token } = useAuthStore();
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [location, setLocation] = useLocation();
  // Persist hydration status to avoid race conditions where persisted state overrides fresh login
  const [hydrated, setHydrated] = useState((useAuthStore as any).persist?.hasHydrated?.() ?? false);

  useEffect(() => {
    // Register service worker for PWA functionality
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then((registration) => {
          console.log('SW registered: ', registration);
        })
        .catch((registrationError) => {
          console.log('SW registration failed: ', registrationError);
        });
    }

    // Handle PWA install prompt
    let deferredPrompt: any;
    
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      deferredPrompt = e;
      // Could show install button here
    });

    // Initialize theme from localStorage or system preference
    const savedTheme = localStorage.getItem('theme');
    const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme === 'dark' || (!savedTheme && systemDark)) {
      document.documentElement.classList.add('dark');
    }

    // Handle online/offline status
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    // Viewport height fix for mobile browsers
    const setVH = () => {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
    };
    
    setVH();
    window.addEventListener('resize', setVH);
    window.addEventListener('orientationchange', setVH);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('resize', setVH);
      window.removeEventListener('orientationchange', setVH);
    };
  }, []);

  // Ensure store hydration completes to prevent bounce due to stale persisted auth
  useEffect(() => {
    try {
      const persistApi = (useAuthStore as any).persist;
      if (persistApi?.hasHydrated?.()) {
        setHydrated(true);
        try { console.debug('[AuthNav] hydration already complete', useAuthStore.getState()); } catch {}
      }
      const unsub = persistApi?.onFinishHydration?.(() => {
        setHydrated(true);
        try { console.debug('[AuthNav] hydration complete', useAuthStore.getState()); } catch {}
      });
      return () => { if (typeof unsub === 'function') unsub(); };
    } catch (e) {
      // If persist API not available, assume hydrated
      setHydrated(true);
    }
  }, []);

  // Centralized post-login redirect and diagnostics
  useEffect(() => {
    try {
      console.debug('[AuthNav] state', { isAuthenticated, hasToken: !!token, role, location, hydrated });
      if (!hydrated) return; // Wait for hydration

      if (isAuthenticated) {
        const current = location || '/';
        const roleLower = (role as any)?.toString?.().toLowerCase?.() || '';

        if (roleLower === 'superadmin') {
          if (!current.startsWith('/admin')) {
            console.debug('[AuthNav] redirect -> /admin');
            setLocation('/admin');
          }
        } else if (roleLower === 'admin' || roleLower === 'staff' || roleLower === '') {
          // If at any login-like or root/admin paths, go to business dashboard
          const isLoginLike = current.includes('login');
          if (isLoginLike || current === '/admin' || current === '/' || current === '' || current.startsWith('/admin')) {
            console.debug('[AuthNav] redirect -> /dashboard');
            setLocation('/dashboard');
          }
        }
      }
    } catch (e) {
      console.error('[AuthNav] redirect effect error', e);
    }
  }, [hydrated, isAuthenticated, role, location, setLocation]);

  // Wait until auth store is hydrated before deciding what to render
  if (!hydrated) {
    return null;
  }

  // Show login pages if not authenticated (do not gate on token to avoid race/falsy issues)
  if (!isAuthenticated) {
    // Check if we're on an admin route
    if (location.startsWith('/admin')) {
      return <SuperAdminLogin />;
    }
    return <BusinessLogin />;
  }

  // Show appropriate app based on role
  if (role === 'SuperAdmin') {
    // Redirect to admin routes if on business routes
    if (!location.startsWith('/admin')) {
      return <Redirect to="/admin" />;
    }
    return <SuperAdminApp />;
  } else if (role === 'Admin' || role === 'Staff') {
    // Redirect to business routes if on admin routes
    if (location.startsWith('/admin')) {
      return <Redirect to="/" />;
    }
    return <BusinessApp />;
  }

  // Fallback - unknown role but authenticated: default to Business app
  return <BusinessApp />;
}

export default function AppWrapper() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="min-h-screen bg-background text-foreground antialiased">
          <App />
          <Toaster />
        </div>
      </TooltipProvider>
    </QueryClientProvider>
  );
}
