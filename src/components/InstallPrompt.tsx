
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Download, Smartphone, X } from 'lucide-react';
import { useCapacitor } from '@/hooks/useCapacitor';
import { useIsMobile } from '@/hooks/use-mobile';

const InstallPrompt = () => {
  const [showPrompt, setShowPrompt] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const { isInstalled, platform } = useCapacitor();
  const isMobile = useIsMobile();

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      
      // Show install prompt after 30 seconds if not installed and on mobile
      setTimeout(() => {
        if (!isInstalled && isMobile) {
          setShowPrompt(true);
        }
      }, 30000);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, [isInstalled, isMobile]);

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
        setShowPrompt(false);
      }
    }
  };

  const handleClose = () => {
    setShowPrompt(false);
    // Don't show again for 24 hours
    localStorage.setItem('installPromptClosed', Date.now().toString());
  };

  // Don't show if not on mobile, already installed, or if user closed recently
  if (!isMobile || isInstalled) return null;
  
  const lastClosed = localStorage.getItem('installPromptClosed');
  if (lastClosed && Date.now() - parseInt(lastClosed) < 24 * 60 * 60 * 1000) {
    return null;
  }

  if (!showPrompt) return null;

  return (
    <Dialog open={showPrompt} onOpenChange={setShowPrompt}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Smartphone className="h-5 w-5 text-primary" />
            Instalar Aplicativo
          </DialogTitle>
          <DialogDescription>
            Instale o Oficina Check Tudo Plus em seu dispositivo para uma melhor experiência
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-full">
                  <Download className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-sm">Acesso Rápido</h4>
                  <p className="text-xs text-muted-foreground">
                    Acesse o sistema diretamente da tela inicial
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-full">
                  <Smartphone className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-sm">Experiência Nativa</h4>
                  <p className="text-xs text-muted-foreground">
                    Interface otimizada para dispositivos móveis
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-2">
            {deferredPrompt && (
              <Button onClick={handleInstall} className="flex-1">
                <Download className="h-4 w-4 mr-2" />
                Instalar
              </Button>
            )}
            <Button variant="outline" onClick={handleClose} className="flex-1">
              Agora não
            </Button>
          </div>

          {platform === 'ios' && !deferredPrompt && (
            <div className="text-xs text-muted-foreground p-3 bg-muted rounded-md">
              <p className="font-medium mb-1">Para instalar no iOS:</p>
              <p>1. Toque no botão compartilhar (□↗)</p>
              <p>2. Selecione "Adicionar à Tela Inicial"</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default InstallPrompt;
