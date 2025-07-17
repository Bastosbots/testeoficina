
import React from 'react';
import { UseFormRegister } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Smartphone, Palette } from 'lucide-react';
import { SystemSettings } from '@/hooks/useSystemSettings';

interface MobileAppSettingsProps {
  register: UseFormRegister<Partial<SystemSettings>>;
}

const MobileAppSettings = ({ register }: MobileAppSettingsProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Smartphone className="h-5 w-5" />
          Configurações do Aplicativo Móvel
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="app_name">Nome do Aplicativo</Label>
            <Input
              id="app_name"
              {...register('app_name')}
              placeholder="Ex: Oficina Check"
            />
            <p className="text-xs text-muted-foreground">
              Nome que aparecerá na tela inicial do dispositivo
            </p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="app_id">ID do Aplicativo</Label>
            <Input
              id="app_id"
              {...register('app_id')}
              placeholder="com.suaoficina.app"
            />
            <p className="text-xs text-muted-foreground">
              Identificador único do app (formato: com.empresa.app)
            </p>
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="app_description">Descrição do Aplicativo</Label>
          <Textarea
            id="app_description"
            {...register('app_description')}
            placeholder="Descrição que aparecerá nas lojas de aplicativos"
            rows={3}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="app_icon_url">URL do Ícone do App</Label>
          <Input
            id="app_icon_url"
            {...register('app_icon_url')}
            placeholder="https://exemplo.com/icone-512x512.png"
          />
          <p className="text-xs text-muted-foreground">
            Ícone do aplicativo (recomendado: 512x512px, formato PNG)
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="app_theme_color" className="flex items-center gap-2">
              <Palette className="h-4 w-4" />
              Cor do Tema
            </Label>
            <Input
              id="app_theme_color"
              {...register('app_theme_color')}
              placeholder="#ffff00"
              type="color"
            />
            <p className="text-xs text-muted-foreground">
              Cor principal do aplicativo
            </p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="app_background_color">Cor de Fundo</Label>
            <Input
              id="app_background_color"
              {...register('app_background_color')}
              placeholder="#000000"
              type="color"
            />
            <p className="text-xs text-muted-foreground">
              Cor de fundo da tela de carregamento
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MobileAppSettings;
