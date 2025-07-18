
import { useEffect } from 'react';
import { useSystemSettings } from './useSystemSettings';

export const useCapacitorSync = () => {
  const { data: settings } = useSystemSettings();

  useEffect(() => {
    if (settings) {
      // Atualizar configurações do Capacitor dinamicamente
      const updateCapacitorConfig = () => {
        try {
          // Criar objeto de configuração baseado nas configurações do sistema
          const capacitorConfig = {
            appId: settings.app_id || 'app.lovable.4a87ca03fbb5474b9a612f3d191b195c',
            appName: settings.app_name || 'oficina-check-tudo-plus',
            webDir: 'dist',
            server: {
              url: 'https://4a87ca03-fbb5-474b-9a61-2f3d191b195c.lovableproject.com?forceHideBadge=true',
              cleartext: true
            },
            plugins: {
              SplashScreen: {
                launchShowDuration: 2000,
                backgroundColor: settings.app_background_color || '#000000',
                showSpinner: false
              }
            }
          };

          // Armazenar configurações no localStorage para uso posterior
          localStorage.setItem('capacitorConfig', JSON.stringify(capacitorConfig));

          console.log('Configurações do Capacitor atualizadas:', capacitorConfig);
        } catch (error) {
          console.error('Erro ao atualizar configurações do Capacitor:', error);
        }
      };

      updateCapacitorConfig();
    }
  }, [settings]);

  return settings;
};
