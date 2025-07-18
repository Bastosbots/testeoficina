
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Download, Smartphone, Share, Plus } from 'lucide-react';
import { useInstallPWA } from '@/hooks/useInstallPWA';
import { toast } from 'sonner';

interface InstallPWAProps {
  showAsButton?: boolean;
  buttonText?: string;
  className?: string;
}

export function InstallPWA({ 
  showAsButton = true, 
  buttonText = "Instalar App",
  className = "" 
}: InstallPWAProps) {
  const { canInstall, isInstalled, installApp, isIOS, isAndroid, isMobile } = useInstallPWA();
  const [isOpen, setIsOpen] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);

  // Don't show if already installed
  if (isInstalled) {
    return null;
  }

  // Don't show on desktop
  if (!isMobile) {
    return null;
  }

  const handleInstallClick = async () => {
    if (!canInstall) {
      setIsOpen(true);
      return;
    }

    setIsInstalling(true);
    try {
      const success = await installApp();
      if (success) {
        toast.success('Aplicativo instalado com sucesso!');
        setIsOpen(false);
      } else {
        // Show manual instructions
        setIsOpen(true);
      }
    } catch (error) {
      console.error('Install error:', error);
      toast.error('Erro ao instalar aplicativo');
      setIsOpen(true);
    } finally {
      setIsInstalling(false);
    }
  };

  const getInstallInstructions = () => {
    if (isIOS) {
      return {
        title: 'Instalar no iPhone/iPad',
        steps: [
          {
            icon: <Share className="h-5 w-5 text-blue-500" />,
            text: 'Toque no botão "Compartilhar" (⬆️) no Safari'
          },
          {
            icon: <Plus className="h-5 w-5 text-green-500" />,
            text: 'Selecione "Adicionar à Tela Inicial"'
          },
          {
            icon: <Download className="h-5 w-5 text-purple-500" />,
            text: 'Confirme tocando em "Adicionar"'
          }
        ]
      };
    }

    if (isAndroid) {
      return {
        title: 'Instalar no Android',
        steps: [
          {
            icon: <Download className="h-5 w-5 text-blue-500" />,
            text: 'Toque no menu (⋮) do navegador'
          },
          {
            icon: <Plus className="h-5 w-5 text-green-500" />,
            text: 'Selecione "Adicionar à tela inicial" ou "Instalar app"'
          },
          {
            icon: <Smartphone className="h-5 w-5 text-purple-500" />,
            text: 'Confirme a instalação'
          }
        ]
      };
    }

    return {
      title: 'Instalar Aplicativo',
      steps: [
        {
          icon: <Download className="h-5 w-5 text-blue-500" />,
          text: 'Use um navegador compatível (Chrome, Safari)'
        },
        {
          icon: <Plus className="h-5 w-5 text-green-500" />,
          text: 'Procure pela opção "Instalar" ou "Adicionar à tela inicial"'
        }
      ]
    };
  };

  const instructions = getInstallInstructions();

  if (!showAsButton) {
    return (
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <div />
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Smartphone className="h-5 w-5" />
              {instructions.title}
            </DialogTitle>
            <DialogDescription>
              Siga os passos abaixo para instalar o aplicativo:
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {instructions.steps.map((step, index) => (
              <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                <div className="mt-0.5">{step.icon}</div>
                <p className="text-sm">{step.text}</p>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          onClick={handleInstallClick}
          disabled={isInstalling}
          className={className}
          size="sm"
        >
          <Download className="h-4 w-4 mr-2" />
          {isInstalling ? 'Instalando...' : buttonText}
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Smartphone className="h-5 w-5" />
            {instructions.title}
          </DialogTitle>
          <DialogDescription>
            Siga os passos abaixo para instalar o aplicativo:
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          {instructions.steps.map((step, index) => (
            <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
              <div className="mt-0.5">{step.icon}</div>
              <p className="text-sm">{step.text}</p>
            </div>
          ))}
        </div>
        
        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Fechar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
