
import React from 'react';
import { useForm } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Settings, Building, Save, Loader2 } from 'lucide-react';
import { useSystemSettings, useUpdateSystemSettings, SystemSettings } from '@/hooks/useSystemSettings';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

const SystemSettingsPage = () => {
  const { profile } = useAuth();
  const { data: settings, isLoading } = useSystemSettings();
  const updateSettings = useUpdateSystemSettings();

  const { register, handleSubmit, reset, formState: { isDirty } } = useForm<Partial<SystemSettings>>();

  // Reset form when settings are loaded
  React.useEffect(() => {
    if (settings) {
      reset(settings);
    }
  }, [settings, reset]);

  // Check if user is admin
  if (profile?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <Settings className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h2 className="text-lg font-semibold mb-2">Acesso Restrito</h2>
              <p className="text-muted-foreground">
                Apenas administradores podem acessar as configurações do sistema.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const onSubmit = (data: Partial<SystemSettings>) => {
    if (settings?.id) {
      updateSettings.mutate({ ...data, id: settings.id });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Carregando configurações...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Settings className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Configurações do Sistema</h1>
            <p className="text-muted-foreground">
              Gerencie as configurações gerais do sistema e informações da empresa
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* System Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Configurações do Sistema
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="system_name">Nome do Sistema</Label>
                  <Input
                    id="system_name"
                    {...register('system_name')}
                    placeholder="Ex: Oficina Check"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="company_logo_url">URL do Logo</Label>
                  <Input
                    id="company_logo_url"
                    {...register('company_logo_url')}
                    placeholder="https://exemplo.com/logo.png"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="system_description">Descrição do Sistema</Label>
                <Textarea
                  id="system_description"
                  {...register('system_description')}
                  placeholder="Descreva brevemente o propósito do sistema"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          <Separator />

          {/* Company Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5" />
                Dados da Empresa
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="company_name">Nome da Empresa</Label>
                  <Input
                    id="company_name"
                    {...register('company_name')}
                    placeholder="Nome da sua oficina"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="company_cnpj">CNPJ</Label>
                  <Input
                    id="company_cnpj"
                    {...register('company_cnpj')}
                    placeholder="00.000.000/0000-00"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="company_address">Endereço</Label>
                <Textarea
                  id="company_address"
                  {...register('company_address')}
                  placeholder="Endereço completo da empresa"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="company_phone">Telefone</Label>
                  <Input
                    id="company_phone"
                    {...register('company_phone')}
                    placeholder="(11) 99999-9999"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="company_email">E-mail</Label>
                  <Input
                    id="company_email"
                    type="email"
                    {...register('company_email')}
                    placeholder="contato@suaoficina.com"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="company_website">Website</Label>
                <Input
                  id="company_website"
                  {...register('company_website')}
                  placeholder="https://www.suaoficina.com"
                />
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => reset(settings)}
              disabled={!isDirty || updateSettings.isPending}
            >
              Cancelar
            </Button>
            
            <Button
              type="submit"
              disabled={!isDirty || updateSettings.isPending}
              className="flex items-center gap-2"
            >
              {updateSettings.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              Salvar Configurações
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SystemSettingsPage;
