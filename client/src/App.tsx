import { Switch, Route } from "wouter";
import { useEffect } from "react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { NavigationDrawer } from "@/components/layout/NavigationDrawer";
import { useAppStore } from "@/lib/store";

// Pages
import { Dashboard } from "@/pages/Dashboard";
import { CustomerDetail } from "@/pages/CustomerDetail";
import { CashBook } from "@/pages/CashBook";
import { Invoices } from "@/pages/Invoices";
import { Inventory } from "@/pages/Inventory";
import { Reports } from "@/pages/Reports";
import { Settings } from "@/pages/Settings";
import { NotFound } from "@/pages/not-found";

function AppRouter() {
  const { currentScreen } = useAppStore();

  // Simple screen-based routing using Zustand state
  const renderCurrentScreen = () => {
    switch (currentScreen) {
      case 'dashboard':
        return <Dashboard />;
      case 'customer-detail':
        return <CustomerDetail />;
      case 'cashbook':
        return <CashBook />;
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
    <>
      <NavigationDrawer />
      {renderCurrentScreen()}
    </>
  );
}

function App() {
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
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="min-h-screen bg-background text-foreground">
          <AppRouter />
          <Toaster />
        </div>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
