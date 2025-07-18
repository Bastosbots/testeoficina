import { useState, useEffect } from 'react';

interface CapacitorInfo {
  isNative: boolean;
  platform: 'web' | 'ios' | 'android';
  isInstalled: boolean;
  canInstall: boolean;
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
    isInstalled: false,
    canInstall: false
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

        // Check if can install - more permissive for testing
        const canInstall = !isInstalled && (
          !!(window as any).deferredInstallPrompt || 
          isIOSSafari() ||
          !isNative // Allow install button on web even without prompt for testing
        );

        console.log('Capacitor Info:', { isNative, platform, isInstalled, canInstall });

        setCapacitorInfo({
          isNative,
          platform,
          isInstalled,
          canInstall
        });
      } catch (error) {
        // Capacitor not available, running as regular web app
        const isInstalled = (window.navigator.standalone === true) || 
                           window.matchMedia('(display-mode: standalone)').matches;
        
        const canInstall = !isInstalled; // Always allow install attempt on web
        
        console.log('Web App Info:', { isInstalled, canInstall, hasPrompt: !!(window as any).deferredInstallPrompt });
        
        setCapacitorInfo({
          isNative: false,
          platform: 'web',
          isInstalled,
          canInstall
        });
      }
    };

    const isIOSSafari = () => {
      const userAgent = window.navigator.userAgent;
      const isIOS = /iPad|iPhone|iPod/.test(userAgent);
      const isSafari = /Safari/.test(userAgent) && !/Chrome|CriOS|FxiOS/.test(userAgent);
      return isIOS && isSafari;
    };

    const handleBeforeInstallPrompt = (e: Event) => {
      console.log('beforeinstallprompt event captured');
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Save the event so it can be triggered later
      (window as any).deferredInstallPrompt = e;
      
      // Update canInstall state immediately
      setCapacitorInfo(prev => {
        console.log('Updating canInstall to true after beforeinstallprompt');
        return {
          ...prev,
          canInstall: !prev.isInstalled
        };
      });
    };

    const handleAppInstalled = () => {
      console.log('PWA was installed successfully');
      (window as any).deferredInstallPrompt = null;
      setCapacitorInfo(prev => ({
        ...prev,
        isInstalled: true,
        canInstall: false
      }));
    };

    // Listen for the beforeinstallprompt event
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);
    
    // Initial check
    checkCapacitor();

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  return capacitorInfo;
};
