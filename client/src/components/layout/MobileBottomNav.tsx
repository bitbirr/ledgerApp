import { useAuthStore } from '@/lib/auth-store';
import { Button } from '@/components/ui/button';
import { 
  Home, 
  Wallet, 
  Receipt, 
  Package, 
  BarChart3,
  Building2,
  MapPin,
  Users,
  Settings
} from 'lucide-react';
import { cn } from '@/lib/utils';

const businessNavigationItems = [
  { id: 'dashboard', label: 'Home', icon: Home },
  { id: 'cashbook', label: 'Cash', icon: Wallet },
  { id: 'invoices', label: 'Bills', icon: Receipt },
  { id: 'inventory', label: 'Items', icon: Package },
  { id: 'reports', label: 'Reports', icon: BarChart3 },
];

const superAdminNavigationItems = [
  { id: 'businesses', label: 'Businesses', icon: Building2 },
  { id: 'branches', label: 'Branches', icon: MapPin },
  { id: 'users', label: 'Users', icon: Users },
  { id: 'reports', label: 'Reports', icon: BarChart3 },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export function MobileBottomNav() {
  const { setCurrentScreen, currentScreen, role } = useAuthStore();
  
  // Determine which navigation items to use based on role
  const navigationItems = role === 'SuperAdmin' ? superAdminNavigationItems : businessNavigationItems;

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