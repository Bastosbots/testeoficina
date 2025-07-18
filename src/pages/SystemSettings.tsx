
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Settings, Save, Building, Smartphone, Palette, Info } from "lucide-react";
import { useSystemSettings, useUpdateSystemSettings } from "@/hooks/useSystemSettings";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { LogoUpload } from "@/components/LogoUpload";

const SystemSettings = () => {
  const { data: settings, isLoading } = useSystemSettings();
  const updateSettingsMutation = useUpdateSystemSettings();
  const { profile } = useAuth();
  
  const [formData, setFormData] = useState({
    system_name: '',
    system_description: '',
    company_name: '',
    company_email: '',
    company_phone: '',
    company_address: '',
    company_cnpj: '',
    company_website: '',
    app_name: '',
    app_description: '',
    app_theme_color: '',
    app_background_color: ''
  });

  const isAdmin = profile?.role === 'admin';

  React.useEffect(() => {
    if (settings) {
      setFormData({
        system_name: settings.system_name || '',
        system_description: settings.system_description || '',
        company_name: settings.company_name || '',
        company_email: settings.company_email || '',
        company_phone: settings.company_phone || '',
        company_address: settings.company_address || '',
        company_cnpj: settings.company_cnpj || '',
        company_website: settings.company_website || '',
        app_name: settings.app_name || '',
        app_description: settings.app_description || '',
        app_theme_color: settings.app_theme_color || '',
        app_background_color: settings.app_background_color || ''
      });
    }
  }, [settings]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await updateSettingsMutation.mutateAsync(formData);
      toast.success('Configurações atualizadas com sucesso!');
    } catch (error) {
      console.error('Error updating settings:', error);
      toast.error('Erro ao atualizar configurações');
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando configurações...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${isAdmin ? 'lg:zoom-90' : ''}`}>
      <div className="flex items-center gap-2">
        <Settings className="h-5 w-5 text-primary" />
        <h1 className={`font-bold ${isAdmin ? 'text-lg lg:text-xl' : 'text-xl lg:text-2xl'}`}>
          Configurações do Sistema
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Configurações do Sistema */}
        <Card>
          <CardHeader>
            <CardTitle className={`flex items-center gap-2 ${isAdmin ? 'text-sm' : 'text-base'}`}>
              <Info className="h-4 w-4" />
              Informações do Sistema
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="system_name" className={isAdmin ? 'text-xs' : 'text-sm'}>
                Nome do Sistema
              </Label>
              <Input
                id="system_name"
                value={formData.system_name}
                onChange={(e) => handleInputChange('system_name', e.target.value)}
                placeholder="Nome do sistema"
                className={isAdmin ? 'h-8 text-xs' : 'h-10'}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="system_description" className={isAdmin ? 'text-xs' : 'text-sm'}>
                Descrição do Sistema
              </Label>
              <Input
                id="system_description"
                value={formData.system_description}
                onChange={(e) => handleInputChange('system_description', e.target.value)}
                placeholder="Descrição do sistema"
                className={isAdmin ? 'h-8 text-xs' : 'h-10'}
              />
            </div>
          </CardContent>
        </Card>

        {/* Informações da Empresa */}
        <Card>
          <CardHeader>
            <CardTitle className={`flex items-center gap-2 ${isAdmin ? 'text-sm' : 'text-base'}`}>
              <Building className="h-4 w-4" />
              Informações da Empresa
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            {/* Logomarca da Empresa */}
            <div className="md:col-span-2">
              <LogoUpload isAdmin={isAdmin} />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="company_name" className={isAdmin ? 'text-xs' : 'text-sm'}>
                Nome da Empresa
              </Label>
              <Input
                id="company_name"
                value={formData.company_name}
                onChange={(e) => handleInputChange('company_name', e.target.value)}
                placeholder="Nome da empresa"
                className={isAdmin ? 'h-8 text-xs' : 'h-10'}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="company_cnpj" className={isAdmin ? 'text-xs' : 'text-sm'}>
                CNPJ
              </Label>
              <Input
                id="company_cnpj"
                value={formData.company_cnpj}
                onChange={(e) => handleInputChange('company_cnpj', e.target.value)}
                placeholder="00.000.000/0000-00"
                className={isAdmin ? 'h-8 text-xs' : 'h-10'}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="company_email" className={isAdmin ? 'text-xs' : 'text-sm'}>
                E-mail
              </Label>
              <Input
                id="company_email"
                type="email"
                value={formData.company_email}
                onChange={(e) => handleInputChange('company_email', e.target.value)}
                placeholder="contato@empresa.com"
                className={isAdmin ? 'h-8 text-xs' : 'h-10'}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="company_phone" className={isAdmin ? 'text-xs' : 'text-sm'}>
                Telefone
              </Label>
              <Input
                id="company_phone"
                value={formData.company_phone}
                onChange={(e) => handleInputChange('company_phone', e.target.value)}
                placeholder="(00) 0000-0000"
                className={isAdmin ? 'h-8 text-xs' : 'h-10'}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="company_website" className={isAdmin ? 'text-xs' : 'text-sm'}>
                Website
              </Label>
              <Input
                id="company_website"
                value={formData.company_website}
                onChange={(e) => handleInputChange('company_website', e.target.value)}
                placeholder="https://www.empresa.com"
                className={isAdmin ? 'h-8 text-xs' : 'h-10'}
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="company_address" className={isAdmin ? 'text-xs' : 'text-sm'}>
                Endereço
              </Label>
              <Textarea
                id="company_address"
                value={formData.company_address}
                onChange={(e) => handleInputChange('company_address', e.target.value)}
                placeholder="Endereço completo da empresa"
                className={isAdmin ? 'min-h-16 text-xs' : 'min-h-20'}
              />
            </div>
          </CardContent>
        </Card>

        {/* Configurações do App */}
        <Card>
          <CardHeader>
            <CardTitle className={`flex items-center gap-2 ${isAdmin ? 'text-sm' : 'text-base'}`}>
              <Smartphone className="h-4 w-4" />
              Configurações do Aplicativo
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="app_name" className={isAdmin ? 'text-xs' : 'text-sm'}>
                Nome do App
              </Label>
              <Input
                id="app_name"
                value={formData.app_name}
                onChange={(e) => handleInputChange('app_name', e.target.value)}
                placeholder="Nome do aplicativo"
                className={isAdmin ? 'h-8 text-xs' : 'h-10'}
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="app_description" className={isAdmin ? 'text-xs' : 'text-sm'}>
                Descrição do App
              </Label>
              <Textarea
                id="app_description"
                value={formData.app_description}
                onChange={(e) => handleInputChange('app_description', e.target.value)}
                placeholder="Descrição do aplicativo"
                className={isAdmin ? 'min-h-16 text-xs' : 'min-h-20'}
              />
            </div>
          </CardContent>
        </Card>

        {/* Configurações de Tema */}
        <Card>
          <CardHeader>
            <CardTitle className={`flex items-center gap-2 ${isAdmin ? 'text-sm' : 'text-base'}`}>
              <Palette className="h-4 w-4" />
              Configurações de Tema
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="app_theme_color" className={isAdmin ? 'text-xs' : 'text-sm'}>
                Cor do Tema
              </Label>
              <Input
                id="app_theme_color"
                value={formData.app_theme_color}
                onChange={(e) => handleInputChange('app_theme_color', e.target.value)}
                placeholder="#000000"
                className={isAdmin ? 'h-8 text-xs' : 'h-10'}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="app_background_color" className={isAdmin ? 'text-xs' : 'text-sm'}>
                Cor de Fundo
              </Label>
              <Input
                id="app_background_color"
                value={formData.app_background_color}
                onChange={(e) => handleInputChange('app_background_color', e.target.value)}
                placeholder="#ffffff"
                className={isAdmin ? 'h-8 text-xs' : 'h-10'}
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button 
            type="submit" 
            disabled={updateSettingsMutation.isPending}
            className="flex items-center gap-2"
          >
            <Save className="h-4 w-4" />
            {updateSettingsMutation.isPending ? 'Salvando...' : 'Salvar Configurações'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default SystemSettings;
