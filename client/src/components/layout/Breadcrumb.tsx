import { useAuthStore } from '@/lib/auth-store';
import { ChevronRight } from 'lucide-react';

const businessBreadcrumbs: Record<string, string> = {
  dashboard: 'Dashboard',
  accounts: 'Accounts',
  cashbook: 'Cashbook',
  invoices: 'Invoices',
  inventory: 'Inventory',
  reports: 'Reports',
  settings: 'Settings',
};

const superAdminBreadcrumbs: Record<string, string> = {
  dashboard: 'Dashboard',
  businesses: 'Businesses',
  branches: 'Branches',
  users: 'Users & Roles',
  settings: 'App Settings',
  audit: 'Audit Trail',
  feedback: 'Feedback',
  diagnostics: 'Diagnostics',
};

export function Breadcrumb() {
  const { currentScreen, role } = useAuthStore();
  
  // Determine which breadcrumbs to use based on role
  const breadcrumbs = role === 'SuperAdmin' ? superAdminBreadcrumbs : businessBreadcrumbs;
  
  // Get the current page name
  const currentPage = breadcrumbs[currentScreen] || 'Dashboard';

  return (
    <div className="hidden lg:flex items-center space-x-2 text-sm text-muted-foreground mb-6">
      <span>Home</span>
      <ChevronRight className="h-4 w-4" />
      <span className="text-foreground font-medium">{currentPage}</span>
    </div>
  );
}