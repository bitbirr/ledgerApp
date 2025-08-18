import { useState } from 'react';
import { useAuthStore } from '@/lib/auth-store';
import { Button } from '@/components/ui/button';
import { 
  Home, 
  Wallet, 
  Receipt, 
  Package, 
  BarChart3, 
  Settings,
  ChevronLeft,
  ChevronRight,
  Building2,
  Users,
  MapPin,
  FileText,
  MessageCircle,
  Activity
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface SidebarNavProps {
  isCollapsed: boolean;
  onCollapseToggle: () => void;
}

const businessNavigationItems = [
  { id: 'dashboard', label: 'Dashboard', icon: Home, roles: ['Admin', 'Staff'] },
  { id: 'accounts', label: 'Accounts', icon: Users, roles: ['Admin', 'Staff'] },
  { id: 'cashbook', label: 'Cashbook', icon: Wallet, roles: ['Admin', 'Staff'] },
  { id: 'invoices', label: 'Invoices', icon: Receipt, roles: ['Admin', 'Staff'] },
  { id: 'inventory', label: 'Inventory', icon: Package, roles: ['Admin', 'Staff'] },
  { id: 'reports', label: 'Reports', icon: BarChart3, roles: ['Admin', 'Staff'] },
  { id: 'settings', label: 'Settings', icon: Settings, roles: ['Admin', 'Staff'] },
];

const superAdminNavigationItems = [
  { id: 'businesses', label: 'Businesses', icon: Building2, roles: ['SuperAdmin'] },
  { id: 'branches', label: 'Branches', icon: MapPin, roles: ['SuperAdmin'] },
  { id: 'users', label: 'Users & Roles', icon: Users, roles: ['SuperAdmin'] },
  { id: 'settings', label: 'App Settings', icon: Settings, roles: ['SuperAdmin'] },
  { id: 'audit', label: 'Audit Trail', icon: FileText, roles: ['SuperAdmin'] },
  { id: 'feedback', label: 'Feedback', icon: MessageCircle, roles: ['SuperAdmin'] },
  { id: 'diagnostics', label: 'Diagnostics', icon: Activity, roles: ['SuperAdmin'] },
];

export function SidebarNav({ isCollapsed, onCollapseToggle }: SidebarNavProps) {
  const { role, currentScreen, setCurrentScreen } = useAuthStore();
  
  // Determine which navigation items to use based on role
  const navigationItems = role === 'SuperAdmin' ? superAdminNavigationItems : businessNavigationItems;
  
  // Filter navigation items based on user role
  const filteredNavigationItems = navigationItems.filter(item => 
    item.roles.includes(role as 'SuperAdmin' | 'Admin' | 'Staff')
  );

  const handleNavigation = (screenId: string) => {
    setCurrentScreen(screenId);
  };

  return (
    <aside className={cn(
      "bg-card border-r border-border hidden lg:block transition-all duration-300 ease-in-out",
      isCollapsed ? "w-16" : "w-64"
    )}>
      <div className="flex flex-col h-full">
        {/* Logo/Brand */}
        <div className={cn(
          "p-4 border-b border-border flex items-center",
          isCollapsed ? "justify-center" : "justify-between"
        )}>
          {!isCollapsed ? (
            <>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-primary-foreground" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-foreground">
                    {role === 'SuperAdmin' ? 'Admin Panel' : 'LedgerPro'}
                  </h1>
                  <p className="text-sm text-muted-foreground">
                    {role === 'SuperAdmin' ? 'System Management' : 'Financial Suite'}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={onCollapseToggle}
                aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
            </>
          ) : (
            <Button
              variant="ghost"
              size="icon"
              onClick={onCollapseToggle}
              aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {filteredNavigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentScreen === item.id;
            
            return (
              <Button
                key={item.id}
                variant={isActive ? "secondary" : "ghost"}
                className={cn(
                  "w-full justify-start h-12",
                  isCollapsed ? "px-2" : "px-4",
                  isActive && "bg-primary text-primary-foreground hover:bg-primary/90"
                )}
                onClick={() => handleNavigation(item.id)}
              >
                <Icon className="h-5 w-5" />
                {!isCollapsed && (
                  <span className="ml-3 font-medium">{item.label}</span>
                )}
              </Button>
            );
          })}
        </nav>

        {/* Business Info */}
        {!isCollapsed && role !== 'SuperAdmin' && (
          <div className="p-4 border-t border-border">
            <div className="flex items-center space-x-3 p-3 rounded-lg bg-muted/50">
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                <Building2 className="h-5 w-5 text-primary-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  Your Business
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  Professional Plan
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}