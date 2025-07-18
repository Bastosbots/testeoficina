
import { useState, useEffect } from 'react';

interface CapacitorInfo {
  isNative: boolean;
  platform: 'web' | 'ios' | 'android';
  isInstalled: boolean;
  canInstall: boolean;
  deferredPrompt?: any;
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
    canInstall: false,
    deferredPrompt: null
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

        // Check if can install
        const canInstall = !isInstalled && !isNative;

        console.log('Capacitor Info:', { isNative, platform, isInstalled, canInstall });

        setCapacitorInfo(prev => ({
          ...prev,
          isNative,
          platform,
          isInstalled,
          canInstall,
          deferredPrompt: (window as any).deferredInstallPrompt || null
        }));
      } catch (error) {
        // Capacitor not available, running as regular web app
        const isInstalled = (window.navigator.standalone === true) || 
                           window.matchMedia('(display-mode: standalone)').matches;
        
        const canInstall = !isInstalled;
        
        console.log('Web App Info:', { isInstalled, canInstall, hasPrompt: !!(window as any).deferredInstallPrompt });
        
        setCapacitorInfo(prev => ({
          ...prev,
          isNative: false,
          platform: 'web',
          isInstalled,
          canInstall,
          deferredPrompt: (window as any).deferredInstallPrompt || null
        }));
      }
    };

    const isIOSSafari = () => {
      const userAgent = window.navigator.userAgent;
      const isIOS = /iPad|iPhone|iPod/.test(userAgent);
      const isSafari = /Safari/.test(userAgent) && !/Chrome|CriOS|FxiOS/.test(userAgent);
      return isIOS && isSafari;
    };

    const handleBeforeInstallPrompt = (e: Event) => {
      console.log('beforeinstallprompt event captured:', e);
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      
      // Save the event so it can be triggered later
      (window as any).deferredInstallPrompt = e;
      
      // Update state immediately with the new prompt
      setCapacitorInfo(prev => {
        console.log('Updating state with deferredPrompt');
        return {
          ...prev,
          canInstall: !prev.isInstalled,
          deferredPrompt: e
        };
      });
    };

    const handleAppInstalled = () => {
      console.log('PWA was installed successfully');
      (window as any).deferredInstallPrompt = null;
      setCapacitorInfo(prev => ({
        ...prev,
        isInstalled: true,
        canInstall: false,
        deferredPrompt: null
      }));
    };

    // Listen for the beforeinstallprompt event
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);
    
    // Check periodically if the deferredPrompt is available
    const checkPromptInterval = setInterval(() => {
      const currentPrompt = (window as any).deferredInstallPrompt;
      if (currentPrompt && !capacitorInfo.deferredPrompt) {
        console.log('Found deferredInstallPrompt in interval check');
        setCapacitorInfo(prev => ({
          ...prev,
          deferredPrompt: currentPrompt,
          canInstall: !prev.isInstalled
        }));
      }
    }, 1000);
    
    // Initial check
    checkCapacitor();

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      clearInterval(checkPromptInterval);
    };
  }, []);

  return capacitorInfo;
};

// Export function to trigger install prompt
export const triggerInstallPrompt = async (): Promise<boolean> => {
  const deferredPrompt = (window as any).deferredInstallPrompt;
  
  if (!deferredPrompt) {
    console.log('No deferred install prompt available');
    return false;
  }

  try {
    console.log('Triggering install prompt');
    // Show the install prompt
    const result = await deferredPrompt.prompt();
    console.log('Install prompt result:', result);
    
    // Wait for the user to respond to the prompt
    const choiceResult = await deferredPrompt.userChoice;
    console.log('User choice result:', choiceResult);
    
    // Clear the deferredPrompt
    (window as any).deferredInstallPrompt = null;
    
    return choiceResult.outcome === 'accepted';
  } catch (error) {
    console.error('Error during installation:', error);
    return false;
  }
};
