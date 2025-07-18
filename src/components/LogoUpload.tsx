
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, X, Image } from "lucide-react";
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useSystemSettings, useUpdateSystemSettings } from '@/hooks/useSystemSettings';

interface LogoUploadProps {
  isAdmin?: boolean;
}

export const LogoUpload: React.FC<LogoUploadProps> = ({ isAdmin = false }) => {
  const [uploading, setUploading] = useState(false);
  const { data: settings } = useSystemSettings();
  const updateSettings = useUpdateSystemSettings();

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validar tipo de arquivo
    if (!file.type.startsWith('image/')) {
      toast.error('Por favor, selecione apenas arquivos de imagem');
      return;
    }

    // Validar tamanho (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('O arquivo deve ter no máximo 5MB');
      return;
    }

    setUploading(true);
    try {
      // Gerar nome único para o arquivo
      const fileExt = file.name.split('.').pop();
      const fileName = `logo-${Date.now()}.${fileExt}`;

      // Upload para o Supabase Storage
      const { data, error } = await supabase.storage
        .from('system-logos')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) throw error;

      // Obter URL pública
      const { data: { publicUrl } } = supabase.storage
        .from('system-logos')
        .getPublicUrl(data.path);

      // Atualizar configurações do sistema
      if (settings?.id) {
        await updateSettings.mutateAsync({
          id: settings.id,
          company_logo_url: publicUrl
        });
      }
    } catch (error) {
      console.error('Erro ao fazer upload:', error);
      toast.error('Erro ao fazer upload da logo');
    } finally {
      setUploading(false);
      // Limpar input
      event.target.value = '';
    }
  };

  const handleRemoveLogo = async () => {
    if (!settings?.id || !settings.company_logo_url) return;

    try {
      // Extrair nome do arquivo da URL
      const url = new URL(settings.company_logo_url);
      const pathParts = url.pathname.split('/');
      const fileName = pathParts[pathParts.length - 1];

      // Remover arquivo do storage
      await supabase.storage
        .from('system-logos')
        .remove([fileName]);

      // Atualizar configurações
      await updateSettings.mutateAsync({
        id: settings.id,
        company_logo_url: null
      });

      toast.success('Logo removida com sucesso!');
    } catch (error) {
      console.error('Erro ao remover logo:', error);
      toast.error('Erro ao remover logo');
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label className={isAdmin ? 'text-xs' : 'text-sm'}>
          Logomarca do Sistema
        </Label>
        
        {settings?.company_logo_url ? (
          <div className="space-y-2">
            <div className="relative w-32 h-20 border rounded-lg overflow-hidden bg-muted">
              <img
                src={settings.company_logo_url}
                alt="Logo atual"
                className="w-full h-full object-contain"
              />
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute top-1 right-1 h-6 w-6"
                onClick={handleRemoveLogo}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
            <p className={`text-muted-foreground ${isAdmin ? 'text-xs' : 'text-sm'}`}>
              Logo atual - clique no X para remover
            </p>
          </div>
        ) : (
          <div className="flex items-center justify-center w-32 h-20 border-2 border-dashed border-muted-foreground/25 rounded-lg bg-muted/50">
            <Image className="h-8 w-8 text-muted-foreground/50" />
          </div>
        )}

        <div className="flex items-center gap-2">
          <Input
            id="logo-upload"
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            disabled={uploading}
            className="hidden"
          />
          <Button
            type="button"
            variant="outline"
            size={isAdmin ? "sm" : "default"}
            onClick={() => document.getElementById('logo-upload')?.click()}
            disabled={uploading}
            className="flex items-center gap-2"
          >
            <Upload className="h-4 w-4" />
            {uploading ? 'Enviando...' : settings?.company_logo_url ? 'Alterar Logo' : 'Enviar Logo'}
          </Button>
        </div>
        
        <p className={`text-muted-foreground ${isAdmin ? 'text-xs' : 'text-sm'}`}>
          Formatos aceitos: PNG, JPG, GIF (máx. 5MB)
        </p>
      </div>
    </div>
  );
};
