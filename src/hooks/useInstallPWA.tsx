
import { useState, useEffect } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

interface InstallPWAHook {
  canInstall: boolean;
  isInstalled: boolean;
  installApp: () => Promise<boolean>;
  isIOS: boolean;
  isAndroid: boolean;
  isMobile: boolean;
}

export const useInstallPWA = (): InstallPWAHook => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [canInstall, setCanInstall] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  // Detect platform
  const userAgent = typeof window !== 'undefined' ? window.navigator.userAgent : '';
  const isIOS = /iPad|iPhone|iPod/.test(userAgent);
  const isAndroid = /Android/.test(userAgent);
  const isMobile = isIOS || isAndroid;

  useEffect(() => {
    // Check if already installed
    const checkInstalled = () => {
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
                          (window.navigator as any).standalone === true;
      setIsInstalled(isStandalone);
    };

    checkInstalled();

    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      console.log('🚀 PWA Install prompt available');
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setCanInstall(true);
    };

    // Listen for app installed event
    const handleAppInstalled = () => {
      console.log('✅ PWA installed successfully');
      setIsInstalled(true);
      setCanInstall(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    // For iOS, we can install if not already installed and not in standalone mode
    if (isIOS && !isInstalled) {
      setCanInstall(true);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, [isIOS, isInstalled]);

  const installApp = async (): Promise<boolean> => {
    try {
      if (deferredPrompt) {
        // Use native install prompt for Android/Chrome
        console.log('🎯 Triggering native install prompt');
        await deferredPrompt.prompt();
        const choiceResult = await deferredPrompt.userChoice;
        
        setDeferredPrompt(null);
        setCanInstall(false);
        
        return choiceResult.outcome === 'accepted';
      }
      
      // For iOS or other cases, we'll show instructions
      return false;
    } catch (error) {
      console.error('❌ Error installing PWA:', error);
      return false;
    }
  };

  return {
    canInstall: canInstall && !isInstalled,
    isInstalled,
    installApp,
    isIOS,
    isAndroid,
    isMobile
  };
};
