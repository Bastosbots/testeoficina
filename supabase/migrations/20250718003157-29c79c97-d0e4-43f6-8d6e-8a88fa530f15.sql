
-- Adicionar colunas para configurações do aplicativo móvel
ALTER TABLE public.system_settings 
ADD COLUMN app_name text,
ADD COLUMN app_id text,
ADD COLUMN app_icon_url text,
ADD COLUMN app_description text,
ADD COLUMN app_theme_color text DEFAULT '#ffff00',
ADD COLUMN app_background_color text DEFAULT '#000000';

-- Atualizar o registro existente com valores padrão
UPDATE public.system_settings 
SET 
  app_name = 'Oficina Check',
  app_id = 'com.oficina.check',
  app_description = 'Sistema de gestão para oficinas mecânicas',
  app_theme_color = '#ffff00',
  app_background_color = '#000000'
WHERE id IS NOT NULL;
