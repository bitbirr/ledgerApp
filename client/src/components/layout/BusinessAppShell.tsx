import { useState } from 'react';
import { useAuthStore } from '@/lib/auth-store';
import { AppHeader } from './AppHeader';
import { SidebarNav } from './SidebarNav';
import { MobileNavDrawer } from './MobileNavDrawer';
import { MobileBottomNav } from './MobileBottomNav';
import { Breadcrumb } from './Breadcrumb';

interface BusinessAppShellProps {
  children: React.ReactNode;
}

export function BusinessAppShell({ children }: BusinessAppShellProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const { role } = useAuthStore();

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Mobile Header */}
      <AppHeader 
        onMenuToggle={toggleMobileMenu}
        isMobileMenuOpen={isMobileMenuOpen}
      />
      
      {/* Mobile Navigation Drawer */}
      <MobileNavDrawer 
        isOpen={isMobileMenuOpen} 
        onClose={() => setIsMobileMenuOpen(false)} 
      />
      
      <div className="flex flex-1">
        {/* Desktop Sidebar */}
        <SidebarNav 
          isCollapsed={isSidebarCollapsed}
          onCollapseToggle={toggleSidebar}
        />
        
        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          <div className="p-4 lg:p-6">
            <Breadcrumb />
            <main className="container-responsive">
              {children}
            </main>
          </div>
        </div>
      </div>
      
      {/* Mobile Bottom Navigation */}
      <MobileBottomNav />
    </div>
  );
}