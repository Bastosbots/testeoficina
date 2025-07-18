
import React, { useState } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Download, Smartphone } from 'lucide-react';

interface InstallDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onInstall: () => void;
  platform: 'web' | 'ios' | 'android';
  hasPrompt: boolean;
}

export function InstallDialog({ open, onOpenChange, onInstall, platform, hasPrompt }: InstallDialogProps) {
  const [isInstalling, setIsInstalling] = useState(false);

  const handleInstall = async () => {
    setIsInstalling(true);
    try {
      await onInstall();
    } finally {
      setIsInstalling(false);
      onOpenChange(false);
    }
  };

  const getInstallInstructions = () => {
    const userAgent = window.navigator.userAgent;
    const isIOS = /iPad|iPhone|iPod/.test(userAgent);
    const isAndroid = /Android/.test(userAgent);
    const isChrome = /Chrome/.test(userAgent);
    const isSamsung = /SamsungBrowser/.test(userAgent);
    const isFirefox = /Firefox/.test(userAgent);

    if (isIOS) {
      return {
        title: 'Instalar no iPhone/iPad',
        description: 'Para instalar este app no seu dispositivo iOS:',
        steps: [
          '1. Toque no botão "Compartilhar" (⬆️) no Safari',
          '2. Selecione "Adicionar à Tela Inicial"',
          '3. Confirme tocando em "Adicionar"'
        ]
      };
    }

    if (isAndroid) {
      if (isChrome) {
        return {
          title: 'Instalar no Android (Chrome)',
          description: 'Para instalar este app no seu Android:',
          steps: [
            '1. Toque no menu (⋮) do Chrome',
            '2. Selecione "Adicionar à tela inicial" ou "Instalar app"',
            '3. Confirme a instalação'
          ]
        };
      }

      if (isSamsung) {
        return {
          title: 'Instalar no Android (Samsung Internet)',
          description: 'Para instalar este app no seu dispositivo:',
          steps: [
            '1. Toque no menu do Samsung Internet',
            '2. Selecione "Adicionar página a" > "Tela inicial"',
            '3. Confirme a instalação'
          ]
        };
      }

      return {
        title: 'Instalar no Android',
        description: 'Para instalar este app:',
        steps: [
          '1. Use o Chrome ou Samsung Internet',
          '2. Procure pela opção "Adicionar à tela inicial"',
          '3. Confirme a instalação'
        ]
      };
    }

    return {
      title: 'Instalar no Computador',
      description: 'Para instalar este app no seu computador:',
      steps: [
        '1. Procure pelo ícone de instalação na barra de endereços',
        '2. Ou use o menu do navegador',
        '3. Selecione "Instalar" ou "Adicionar à área de trabalho"'
      ]
    };
  };

  const instructions = getInstallInstructions();

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="sm:max-w-md">
        <AlertDialogHeader>
          <div className="flex items-center gap-2">
            <Smartphone className="h-5 w-5 text-primary" />
            <AlertDialogTitle>
              {hasPrompt ? 'Instalar Aplicativo' : instructions.title}
            </AlertDialogTitle>
          </div>
          <AlertDialogDescription>
            {hasPrompt ? 
              'Deseja instalar este aplicativo em seu dispositivo? Ele ficará disponível na sua tela inicial.' :
              instructions.description
            }
          </AlertDialogDescription>
        </AlertDialogHeader>

        {!hasPrompt && (
          <div className="space-y-2 text-sm text-muted-foreground">
            {instructions.steps.map((step, index) => (
              <div key={index} className="flex items-start gap-2">
                <span className="text-primary font-medium">{step.split('.')[0]}.</span>
                <span>{step.split('.').slice(1).join('.').trim()}</span>
              </div>
            ))}
          </div>
        )}

        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          {hasPrompt && (
            <AlertDialogAction asChild>
              <Button onClick={handleInstall} disabled={isInstalling}>
                <Download className="h-4 w-4 mr-2" />
                {isInstalling ? 'Instalando...' : 'Instalar'}
              </Button>
            </AlertDialogAction>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
