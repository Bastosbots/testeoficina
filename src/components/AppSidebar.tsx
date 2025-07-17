
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Home, FileText, Settings, LogOut, Menu, Cog } from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useSystemSettings } from '@/hooks/useSystemSettings';
import { toast } from 'sonner';

const navigation = [
  {
    title: 'Dashboard',
    url: '/',
    icon: Home,
    description: 'Painel inicial do sistema'
  },
  {
    title: 'Todos os Checklists',
    url: '/checklists',
    icon: FileText,
    description: 'Arquivo de todos os checklists'
  },
  {
    title: 'Tabela de Serviços',
    url: '/services',
    icon: Settings,
    description: 'Serviços e preços da oficina'
  }
];

const adminNavigation = [
  {
    title: 'Configurações',
    url: '/settings',
    icon: Cog,
    description: 'Configurações do sistema'
  }
];

export function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut, profile } = useAuth();
  const { data: settings } = useSystemSettings();
  
  const systemName = settings?.system_name || 'Oficina Check';
  const systemDescription = settings?.system_description || 'Sistema de Gestão';
  
  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  const handleLogout = async () => {
    try {
      await signOut();
      toast.success('Logout realizado com sucesso!');
      navigate('/auth');
    } catch (error) {
      toast.error('Erro ao fazer logout');
    }
  };

  return (
    <Sidebar className={`${state === 'collapsed' ? 'w-16' : 'w-64'} mobile-dropdown safe-top`}>
      <div className="flex items-center justify-between mobile-card-padding lg:p-4 border-b border-border touch-target">
        {state !== 'collapsed' && (
          <div className="flex flex-col">
            <h2 className="mobile-text-lg lg:text-lg font-semibold text-foreground">{systemName}</h2>
            <p className="mobile-text-xs lg:text-xs text-muted-foreground">{systemDescription}</p>
          </div>
        )}
        <SidebarTrigger className="ml-auto touch-target" />
      </div>

      <SidebarContent>
        {/* User Info */}
        {state !== 'collapsed' && (
          <div className="mobile-card-padding lg:p-4 border-b border-border">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 lg:w-8 lg:h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center mobile-text-xs lg:text-sm font-medium">
                {profile?.full_name?.[0]?.toUpperCase() || 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="mobile-text-sm lg:text-sm font-medium text-foreground truncate">
                  {profile?.full_name || 'Usuário'}
                </p>
                <p className="mobile-text-xs lg:text-xs text-muted-foreground capitalize">
                  {profile?.role || 'usuário'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel>Menu Principal</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigation.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    onClick={() => navigate(item.url)}
                    className={`w-full justify-start touch-target ${
                      isActive(item.url) 
                        ? 'bg-primary text-primary-foreground' 
                        : 'hover:bg-muted'
                    }`}
                  >
                    <item.icon className="h-4 w-4 flex-shrink-0" />
                    {state !== 'collapsed' && (
                      <div className="flex flex-col items-start ml-2">
                        <span className="mobile-text-sm lg:text-sm font-medium">{item.title}</span>
                        <span className="mobile-text-xs lg:text-xs opacity-70 hidden lg:block">{item.description}</span>
                      </div>
                    )}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Admin Navigation */}
        {profile?.role === 'admin' && (
          <SidebarGroup>
            <SidebarGroupLabel>Administração</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {adminNavigation.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      onClick={() => navigate(item.url)}
                      className={`w-full justify-start touch-target ${
                        isActive(item.url) 
                          ? 'bg-primary text-primary-foreground' 
                          : 'hover:bg-muted'
                      }`}
                    >
                      <item.icon className="h-4 w-4 flex-shrink-0" />
                      {state !== 'collapsed' && (
                        <div className="flex flex-col items-start ml-2">
                          <span className="mobile-text-sm lg:text-sm font-medium">{item.title}</span>
                          <span className="mobile-text-xs lg:text-xs opacity-70 hidden lg:block">{item.description}</span>
                        </div>
                      )}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        <div className="mt-auto p-4 border-t border-border safe-bottom">
          <Button
            variant="ghost"
            onClick={handleLogout}
            className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10 touch-target"
          >
            <LogOut className="h-4 w-4 flex-shrink-0" />
            {state !== 'collapsed' && <span className="ml-2">Sair do Sistema</span>}
          </Button>
        </div>
      </SidebarContent>
    </Sidebar>
  );
}
