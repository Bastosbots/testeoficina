
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Smartphone, Eye } from 'lucide-react';
import { SystemSettings } from '@/hooks/useSystemSettings';

interface MobileAppPreviewProps {
  settings: SystemSettings | undefined;
}

const MobileAppPreview = ({ settings }: MobileAppPreviewProps) => {
  if (!settings) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Eye className="h-5 w-5" />
          Prévia do Aplicativo
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Smartphone className="h-32 w-20 text-muted-foreground" />
            <div 
              className="absolute inset-2 rounded-sm flex flex-col items-center justify-center text-xs"
              style={{ 
                backgroundColor: settings.app_background_color || '#000000',
                color: settings.app_theme_color || '#ffff00'
              }}
            >
              {settings.app_icon_url && (
                <img 
                  src={settings.app_icon_url} 
                  alt="App Icon" 
                  className="w-8 h-8 mb-1 rounded"
                />
              )}
              <span className="text-center px-1 font-medium">
                {settings.app_name || 'Oficina Check'}
              </span>
            </div>
          </div>
          
          <div className="flex-1 space-y-2">
            <div>
              <h4 className="font-medium">Nome do App</h4>
              <p className="text-sm text-muted-foreground">
                {settings.app_name || 'Não definido'}
              </p>
            </div>
            
            <div>
              <h4 className="font-medium">ID do App</h4>
              <p className="text-sm text-muted-foreground font-mono">
                {settings.app_id || 'Não definido'}
              </p>
            </div>
            
            <div>
              <h4 className="font-medium">Cores</h4>
              <div className="flex gap-2">
                <div 
                  className="w-4 h-4 rounded border"
                  style={{ backgroundColor: settings.app_theme_color }}
                  title="Cor do tema"
                />
                <div 
                  className="w-4 h-4 rounded border"
                  style={{ backgroundColor: settings.app_background_color }}
                  title="Cor de fundo"
                />
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-4 p-3 bg-muted rounded-md">
          <p className="text-xs text-muted-foreground">
            <strong>Nota:</strong> As configurações são sincronizadas automaticamente com o manifest.json e Capacitor. 
            Para aplicar no app nativo, execute <code>npx cap sync</code> após salvar as configurações.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default MobileAppPreview;
