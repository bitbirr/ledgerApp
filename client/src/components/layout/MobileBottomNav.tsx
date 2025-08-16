import { useAppStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { 
  Home, 
  Wallet, 
  Receipt, 
  Package, 
  BarChart3
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navigationItems = [
  { id: 'dashboard', label: 'Home', icon: Home },
  { id: 'cashbook', label: 'Cash', icon: Wallet },
  { id: 'invoices', label: 'Bills', icon: Receipt },
  { id: 'inventory', label: 'Items', icon: Package },
  { id: 'reports', label: 'Reports', icon: BarChart3 },
];

export function MobileBottomNav() {
  const { setCurrentScreen, currentScreen } = useAppStore();

  const handleNavigation = (screenId: string) => {
    setCurrentScreen(screenId);
  };

  return (
    <nav className="nav-mobile safe-area-bottom">
      <div className="flex items-center justify-around py-2">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentScreen === item.id;
          
          return (
            <Button
              key={item.id}
              variant="ghost"
              size="sm"
              className={cn(
                "flex flex-col items-center space-y-1 h-auto py-2 px-3 touch-target",
                isActive && "text-primary"
              )}
              onClick={() => handleNavigation(item.id)}
            >
              <Icon className={cn(
                "h-5 w-5",
                isActive && "text-primary"
              )} />
              <span className={cn(
                "text-xs font-medium",
                isActive ? "text-primary" : "text-muted-foreground"
              )}>
                {item.label}
              </span>
            </Button>
          );
        })}
      </div>
    </nav>
  );
}