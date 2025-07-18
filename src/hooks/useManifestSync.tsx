
import { useEffect } from 'react';
import { useSystemSettings } from './useSystemSettings';

export const useManifestSync = () => {
  const { data: settings } = useSystemSettings();

  useEffect(() => {
    if (settings) {
      // Atualizar manifest.json dinamicamente
      const updateManifest = async () => {
        try {
          const manifestData = {
            name: settings.app_name || 'Oficina Check Tudo Plus',
            short_name: settings.app_name?.split(' ')[0] || 'Oficina Check',
            description: settings.app_description || 'Sistema de gestão para oficinas mecânicas',
            start_url: '/',
            display: 'standalone',
            background_color: settings.app_background_color || '#000000',
            theme_color: settings.app_theme_color || '#ffff00',
            orientation: 'portrait',
            icons: [
              {
                src: '/favicon.ico',
                sizes: '64x64 32x32 24x24 16x16',
                type: 'image/x-icon'
              },
              {
                src: settings.app_icon_url || '/placeholder.svg',
                type: settings.app_icon_url?.endsWith('.png') ? 'image/png' : 'image/svg+xml',
                sizes: '192x192'
              },
              {
                src: settings.app_icon_url || '/placeholder.svg',
                type: settings.app_icon_url?.endsWith('.png') ? 'image/png' : 'image/svg+xml',
                sizes: '512x512'
              }
            ]
          };

          // Atualizar o manifest no DOM
          const manifestLink = document.querySelector('link[rel="manifest"]') as HTMLLinkElement;
          if (manifestLink) {
            const blob = new Blob([JSON.stringify(manifestData, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            manifestLink.href = url;
          }

          console.log('Manifest atualizado com as configurações do sistema:', manifestData);
        } catch (error) {
          console.error('Erro ao atualizar manifest:', error);
        }
      };

      updateManifest();
    }
  }, [settings]);

  return settings;
};
