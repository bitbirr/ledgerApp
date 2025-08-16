import { useEffect, useState } from 'react';
import { useAppStore } from '@/lib/store';
import { DesktopSidebar } from './DesktopSidebar';
import { MobileBottomNav } from './MobileBottomNav';
import { ResponsiveHeader } from './ResponsiveHeader';
import { cn } from '@/lib/utils';

interface ResponsiveLayoutProps {
  children: React.ReactNode;
}

export function ResponsiveLayout({ children }: ResponsiveLayoutProps) {
  const [isMobile, setIsMobile] = useState(false);
  const { drawerOpen } = useAppStore();

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024); // lg breakpoint
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  if (isMobile) {
    return (
      <div className="flex flex-col min-h-screen">
        <ResponsiveHeader />
        <main className="flex-1 overflow-auto pb-16 safe-area-bottom">
          <div className="container-responsive py-4">
            {children}
          </div>
        </main>
        <MobileBottomNav />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      <DesktopSidebar />
      <div className="flex-1 flex flex-col">
        <ResponsiveHeader />
        <main className="flex-1 overflow-auto">
          <div className="container-responsive py-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}