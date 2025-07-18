
import { useState, useEffect } from 'react';

interface CapacitorInfo {
  isNative: boolean;
  platform: 'web' | 'ios' | 'android';
  isInstalled: boolean;
}

// Extend the Navigator interface to include the standalone property
declare global {
  interface Navigator {
    standalone?: boolean;
  }
  interface Window {
    deferredInstallPrompt?: any;
  }
}

export const useCapacitor = (): CapacitorInfo => {
  const [capacitorInfo, setCapacitorInfo] = useState<CapacitorInfo>({
    isNative: false,
    platform: 'web',
    isInstalled: false
  });

  useEffect(() => {
    const checkCapacitor = async () => {
      try {
        // Check if Capacitor is available
        const { Capacitor } = await import('@capacitor/core');
        
        const isNative = Capacitor.isNativePlatform();
        const platform = Capacitor.getPlatform() as 'web' | 'ios' | 'android';
        
        // Check if app is installed (running as PWA or native app)
        const isInstalled = (window.navigator.standalone === true) || 
                           window.matchMedia('(display-mode: standalone)').matches ||
                           isNative;

        setCapacitorInfo({
          isNative,
          platform,
          isInstalled
        });
      } catch (error) {
        // Capacitor not available, running as regular web app
        const isInstalled = (window.navigator.standalone === true) || 
                           window.matchMedia('(display-mode: standalone)').matches;
        
        setCapacitorInfo({
          isNative: false,
          platform: 'web',
          isInstalled
        });
      }
    };

    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Save the event so it can be triggered later
      (window as any).deferredInstallPrompt = e;
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    checkCapacitor();

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  return capacitorInfo;
};
