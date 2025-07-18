
import React from 'react';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';
import { Menu } from 'lucide-react';
import { useSystemSettings } from '@/hooks/useSystemSettings';
import { useAuth } from '@/hooks/useAuth';

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const { data: settings } = useSystemSettings();
  const { profile } = useAuth();
  
  const systemName = settings?.system_name || 'Oficina Check';
  const systemDescription = settings?.system_description || 'Sistema de Gestão';
  const isAdmin = profile?.role === 'admin';

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full no-horizontal-scroll mobile-text tap-highlight-none">
        <AppSidebar />
        
        <main className="flex-1 overflow-hidden">
          {/* Mobile Header - Visible only on mobile */}
          <header className="lg:hidden mobile-header-height flex items-center justify-between mobile-card-padding border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-40 safe-top touch-target">
            <div className="flex items-center gap-2">
              <SidebarTrigger className="p-2 touch-target">
                <Menu className="h-4 w-4" />
              </SidebarTrigger>
              <h1 className={`font-semibold truncate ${isAdmin ? 'mobile-text-sm' : 'mobile-text-lg'}`}>
                {systemName}
              </h1>
            </div>
          </header>

          {/* Desktop Header - Hidden on mobile */}
          <header className="hidden lg:flex h-14 items-center px-6 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <SidebarTrigger className="mr-4" />
            <div className="flex items-center gap-2">
              <h1 className={`font-semibold ${isAdmin ? 'text-sm' : 'text-lg'}`}>
                {systemName} - {systemDescription}
              </h1>
            </div>
          </header>
          
          {/* Main Content */}
          <div className="flex-1 overflow-auto smooth-scroll safe-bottom">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
