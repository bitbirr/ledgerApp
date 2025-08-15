import { useAppStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription, // Add this import
} from '@/components/ui/sheet';
import { 
  Home, 
  Wallet, 
  Receipt, 
  Package, 
  BarChart3, 
  Settings, 
  X 
} from 'lucide-react';

const navigationItems = [
  { id: 'dashboard', label: 'Dashboard', icon: Home },
  { id: 'cashbook', label: 'Cash Book', icon: Wallet },
  { id: 'invoices', label: 'Invoices', icon: Receipt },
  { id: 'inventory', label: 'Items', icon: Package },
  { id: 'reports', label: 'Reports', icon: BarChart3 },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export function NavigationDrawer() {
  const { drawerOpen, setDrawerOpen, setCurrentScreen, currentScreen } = useAppStore();

  const handleNavigation = (screenId: string) => {
    setCurrentScreen(screenId);
  };

  return (
    <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
      <SheetContent side="left" className="w-80 p-0">
        <SheetHeader className="p-4 border-b">
          <div className="flex items-center justify-between">
            <SheetTitle className="text-xl font-medium text-primary">
              Credit Debit
            </SheetTitle>
            <SheetDescription className="sr-only">
              Navigation menu for the Credit Debit application
            </SheetDescription>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setDrawerOpen(false)}
              data-testid="button-close-drawer"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </SheetHeader>

        <nav className="p-4 space-y-2">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentScreen === item.id;
            
            return (
              <Button
                key={item.id}
                variant={isActive ? "secondary" : "ghost"}
                className="w-full justify-start"
                onClick={() => handleNavigation(item.id)}
                data-testid={`button-nav-${item.id}`}
              >
                <Icon className="mr-3 h-5 w-5" />
                {item.label}
              </Button>
            );
          })}
        </nav>

        <div className="mt-8 p-4 border-t">
          <div className="text-sm text-muted-foreground">
            <p className="font-medium">Your Business</p>
            <p>123 Business Street</p>
            <p>City, State 12345</p>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

<SheetHeader>
  <SheetTitle>Navigation</SheetTitle>
  <SheetDescription>
    Navigate to different sections of the app
  </SheetDescription>
</SheetHeader>
