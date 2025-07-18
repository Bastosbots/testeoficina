
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
  const isMechanic = profile?.role === 'mechanic';

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full no-horizontal-scroll mobile-text tap-highlight-none">
        <AppSidebar />
        
        <main className="flex-1 overflow-hidden h-screen-mobile">
          {/* Mobile Header - Otimizado para mecânicos */}
          <header className={`lg:hidden flex items-center justify-between px-3 py-2 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-40 safe-top ${isMechanic ? 'h-12' : 'h-14'}`}>
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <SidebarTrigger className="p-2 touch-target flex-shrink-0">
                <Menu className="h-4 w-4" />
              </SidebarTrigger>
              <h1 className={`font-semibold truncate ${isMechanic ? 'text-sm' : 'text-base'}`}>
                {systemName}
              </h1>
            </div>
          </header>

          {/* Desktop Header - Mantido para admins */}
          <header className="hidden lg:flex h-14 items-center px-6 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <SidebarTrigger className="mr-4" />
            <div className="flex items-center gap-2">
              <h1 className={`font-semibold ${isAdmin ? 'text-sm' : 'text-lg'}`}>
                {systemName} - {systemDescription}
              </h1>
            </div>
          </header>
          
          {/* Main Content - Otimizado para mecânicos */}
          <div className={`flex-1 overflow-auto smooth-scroll safe-bottom ${isMechanic ? 'ios-bounce-fix android-scroll-fix' : ''}`}>
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
