
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Home, FileText, Settings, LogOut, Menu, Cog, DollarSign, ExternalLink, Download } from 'lucide-react';
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
import { useCapacitor } from '@/hooks/useCapacitor';
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
    title: 'Orçamentos',
    url: '/budgets',
    icon: DollarSign,
    description: 'Gestão de orçamentos'
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
    title: 'Sistema Principal',
    url: 'https://painel-srm.online/',
    icon: ExternalLink,
    description: 'Retornar ao sistema principal de gestão',
    external: true
  },
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
  const { isInstalled, canInstall, platform } = useCapacitor();
  
  const systemName = settings?.system_name || 'Oficina Check';
  const systemDescription = settings?.system_description || 'Sistema de Gestão';
  
  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  const handleNavigation = (item: any) => {
    if (item.external) {
      window.open(item.url, '_blank');
    } else {
      navigate(item.url);
    }
  };

  const handleLogout = async () => {
    try {
      console.log('Botão de logout clicado');
      toast.info('Fazendo logout...');
      await signOut();
      // O redirecionamento é feito dentro da função signOut
    } catch (error) {
      console.error('Erro no handleLogout:', error);
      toast.error('Erro ao fazer logout');
      // Em caso de erro, redirecionar mesmo assim
      window.location.href = '/auth';
    }
  };

  const handleInstallApp = async () => {
    console.log('Install button clicked, platform:', platform);
    
    // Check if beforeinstallprompt event is available (Android/Chrome)
    const deferredPrompt = (window as any).deferredInstallPrompt;
    
    if (deferredPrompt) {
      console.log('Using beforeinstallprompt for direct installation');
      try {
        // Show the install prompt
        const result = await deferredPrompt.prompt();
        console.log('Install prompt result:', result);
        
        // Wait for the user to respond to the prompt
        const choiceResult = await deferredPrompt.userChoice;
        console.log('User choice result:', choiceResult);
        
        if (choiceResult.outcome === 'accepted') {
          toast.success('Aplicativo instalado com sucesso!');
        } else {
          toast.info('Instalação cancelada pelo usuário');
        }
        
        // Clear the deferredPrompt
        (window as any).deferredInstallPrompt = null;
      } catch (error) {
        console.error('Error during installation:', error);
        toast.error('Erro durante a instalação');
      }
    } else {
      // Fallback for browsers that don't support beforeinstallprompt
      const userAgent = window.navigator.userAgent;
      const isIOS = /iPad|iPhone|iPod/.test(userAgent);
      const isAndroid = /Android/.test(userAgent);
      const isChrome = /Chrome/.test(userAgent);
      const isSamsung = /SamsungBrowser/.test(userAgent);
      const isFirefox = /Firefox/.test(userAgent);
      const isEdge = /Edg/.test(userAgent);
      
      console.log('No beforeinstallprompt available, showing platform instructions', {
        isIOS, isAndroid, isChrome, isSamsung, isFirefox, isEdge, userAgent
      });
      
      if (isIOS) {
        toast.info(
          'Para instalar no iOS: Toque no botão "Compartilhar" (⬆️) no Safari e selecione "Adicionar à Tela Inicial"',
          { duration: 8000 }
        );
      } else if (isAndroid) {
        if (isChrome) {
          toast.info(
            'Para instalar no Android Chrome: Toque no menu (⋮) e selecione "Adicionar à tela inicial" ou "Instalar app"',
            { duration: 8000 }
          );
        } else if (isSamsung) {
          toast.info(
            'Para instalar no Samsung Internet: Toque no menu e selecione "Adicionar página a" > "Tela inicial"',
            { duration: 8000 }
          );
        } else if (isFirefox) {
          toast.info(
            'Para instalar no Firefox: Toque no menu e selecione "Instalar" ou "Adicionar à tela inicial"',
            { duration: 8000 }
          );
        } else {
          toast.info(
            'Para instalar no Android: Use o Chrome ou Samsung Internet e procure pela opção "Adicionar à tela inicial"',
            { duration: 8000 }
          );
        }
      } else {
        if (isChrome || isEdge) {
          toast.info(
            'Para instalar: Clique no ícone de instalação na barra de endereços ou use o menu do navegador',
            { duration: 6000 }
          );
        } else {
          toast.info(
            'Para instalar: Use o Chrome, Edge ou outro navegador compatível com PWA',
            { duration: 6000 }
          );
        }
      }
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
              
              {/* Install App Button - Only for mechanics and if not installed but can install */}
              {profile?.role !== 'admin' && !isInstalled && canInstall && (
                <SidebarMenuItem>
                  <SidebarMenuButton
                    onClick={handleInstallApp}
                    className="w-full justify-start touch-target hover:bg-muted text-primary"
                  >
                    <Download className="h-4 w-4 flex-shrink-0" />
                    {state !== 'collapsed' && (
                      <div className="flex flex-col items-start ml-2">
                        <span className="mobile-text-sm lg:text-sm font-medium">Instalar App</span>
                        <span className="mobile-text-xs lg:text-xs opacity-70 hidden lg:block">Adicionar à tela inicial</span>
                      </div>
                    )}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}
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
                      onClick={() => handleNavigation(item)}
                      className={`w-full justify-start touch-target ${
                        !item.external && isActive(item.url) 
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
