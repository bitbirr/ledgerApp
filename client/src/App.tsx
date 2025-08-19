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
import { useLocation, Redirect } from "wouter";

// Business App Pages
import { Dashboard } from "@/pages/business/Dashboard";
import { Accounts } from "@/pages/business/Accounts";
import { Cashbook } from "@/pages/business/Cashbook";
import { Invoices } from "@/pages/business/Invoices";
import { Inventory } from "@/pages/business/Inventory";
import { Reports } from "@/pages/business/Reports";
import { Settings } from "@/pages/business/Settings";

// Admin App Pages
import { SuperAdminDashboard as AdminDashboard } from "@/pages/admin/Dashboard";
import { Businesses } from "@/pages/admin/Businesses";
import { Branches } from "@/pages/admin/Branches";
import { UsersRoles as Users } from "@/pages/admin/UsersRoles";
import { AppSettings } from "@/pages/admin/AppSettings";
import { Audit } from "@/pages/admin/Audit";
import { Feedback } from "@/pages/admin/Feedback";
import { Diagnostics } from "@/pages/admin/Diagnostics";

function BusinessApp() {
  const { currentScreen } = useAuthStore();
  
  // Map screen IDs to components
  const renderScreen = () => {
    switch (currentScreen) {
      case 'accounts': return <Accounts />;
      case 'cashbook': return <Cashbook />;
      case 'invoices': return <Invoices />;
      case 'inventory': return <Inventory />;
      case 'reports': return <Reports />;
      case 'settings': return <Settings />;
      case 'dashboard':
      default: return <Dashboard />;
    }
  };
  
  return (
    <BusinessAppShell>
      {renderScreen()}
    </BusinessAppShell>
  );
}

function SuperAdminApp() {
  const { currentScreen } = useAuthStore();
  
  // Map screen IDs to components
  const renderScreen = () => {
    switch (currentScreen) {
      case 'businesses': return <Businesses />;
      case 'branches': return <Branches />;
      case 'users': return <Users />;
      case 'settings': return <AppSettings />;
      case 'audit': return <Audit />;
      case 'feedback': return <Feedback />;
      case 'diagnostics': return <Diagnostics />;
      case 'dashboard':
      default: return <AdminDashboard />;
    }
  };
  
  return (
    <SuperAdminAppShell>
      {renderScreen()}
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
