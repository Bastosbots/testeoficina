
-- Criar tabela para configurações do sistema
CREATE TABLE public.system_settings (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  system_name text DEFAULT 'Oficina Check',
  system_description text DEFAULT 'Sistema de Gestão de Oficina',
  company_name text,
  company_cnpj text,
  company_address text,
  company_phone text,
  company_email text,
  company_website text,
  company_logo_url text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Inserir configurações padrão
INSERT INTO public.system_settings (
  system_name,
  system_description,
  company_name
) VALUES (
  'Oficina Check',
  'Sistema de Gestão de Oficina',
  'Sua Oficina'
);

-- Ativar RLS
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

-- Permitir que todos vejam as configurações
CREATE POLICY "Anyone can view system settings" 
  ON public.system_settings 
  FOR SELECT 
  USING (true);

-- Apenas admins podem atualizar
CREATE POLICY "Admins can update system settings" 
  ON public.system_settings 
  FOR UPDATE 
  USING (EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'admin'
  ));

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_system_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_system_settings_updated_at
    BEFORE UPDATE ON public.system_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_system_settings_updated_at();
