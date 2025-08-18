import { Switch, Route, Redirect } from "wouter";
import { useEffect, useState } from "react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuthStore } from "@/lib/auth-store";

// Business App Pages
import { BusinessLogin } from "@/pages/business/Login";
import { Dashboard } from "@/pages/business/Dashboard";
import { Accounts } from "@/pages/business/Accounts";
import { Cashbook } from "@/pages/business/Cashbook";
import { Invoices } from "@/pages/business/Invoices";
import { Inventory } from "@/pages/business/Inventory";
import { Reports } from "@/pages/business/Reports";
import { Settings } from "@/pages/business/Settings";

// SuperAdmin App Pages
import { SuperAdminLogin } from "@/pages/admin/Login";
import { SuperAdminDashboard } from "@/pages/admin/Dashboard";
import { Businesses } from "@/pages/admin/Businesses";

// Layout Components
import { BusinessAppShell } from "@/components/layout/BusinessAppShell";
import { SuperAdminAppShell } from "@/components/layout/SuperAdminAppShell";

function BusinessApp() {
  const { currentScreen } = useAuthStore();
  
  // Simple screen-based routing using Zustand state
  const renderCurrentScreen = () => {
    switch (currentScreen) {
      case 'dashboard':
        return <Dashboard />;
      case 'accounts':
        return <Accounts />;
      case 'cashbook':
        return <Cashbook />;
      case 'invoices':
        return <Invoices />;
      case 'inventory':
        return <Inventory />;
      case 'reports':
        return <Reports />;
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <BusinessAppShell>
      {renderCurrentScreen()}
    </BusinessAppShell>
  );
}

function SuperAdminApp() {
  const { currentScreen } = useAuthStore();
  
  // Simple screen-based routing for SuperAdmin
  const renderCurrentScreen = () => {
    switch (currentScreen) {
      case 'dashboard':
        return <SuperAdminDashboard />;
      case 'businesses':
        return <Businesses />;
      // Add other SuperAdmin pages here
      default:
        return <SuperAdminDashboard />;
    }
  };

  return (
    <SuperAdminAppShell>
      {renderCurrentScreen()}
    </SuperAdminAppShell>
  );
}

function App() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const { isAuthenticated, role } = useAuthStore();

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

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="min-h-screen bg-background text-foreground antialiased">
          {!isOnline && (
            <div className="bg-warning text-warning-foreground px-4 py-2 text-center text-sm font-medium">
              You're currently offline. Some features may be limited.
            </div>
          )}
          
          <Switch>
            {/* Public Routes */}
            <Route path="/login" component={BusinessLogin} />
            <Route path="/admin/login" component={SuperAdminLogin} />
            
            {/* Business App Routes (Protected) */}
            <Route path="/" nest>
              {isAuthenticated && role !== 'SuperAdmin' ? (
                <BusinessApp />
              ) : isAuthenticated && role === 'SuperAdmin' ? (
                <Redirect to="/admin" />
              ) : (
                <Redirect to="/login" />
              )}
            </Route>
            
            {/* SuperAdmin App Routes (Protected) */}
            <Route path="/admin" nest>
              {isAuthenticated && role === 'SuperAdmin' ? (
                <SuperAdminApp />
              ) : isAuthenticated && role !== 'SuperAdmin' ? (
                <Redirect to="/" />
              ) : (
                <Redirect to="/admin/login" />
              )}
            </Route>
            
            {/* Default Redirect */}
            <Route>
              {isAuthenticated ? (
                role === 'SuperAdmin' ? <Redirect to="/admin" /> : <Redirect to="/" />
              ) : (
                <Redirect to="/login" />
              )}
            </Route>
          </Switch>
          
          <Toaster />
        </div>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
