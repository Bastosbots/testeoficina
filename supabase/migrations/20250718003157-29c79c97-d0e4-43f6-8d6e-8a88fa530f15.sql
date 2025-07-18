
-- Remover colunas de configurações do aplicativo móvel
ALTER TABLE public.system_settings 
DROP COLUMN IF EXISTS app_name,
DROP COLUMN IF EXISTS app_id,
DROP COLUMN IF EXISTS app_icon_url,
DROP COLUMN IF EXISTS app_description,
DROP COLUMN IF EXISTS app_theme_color,
DROP COLUMN IF EXISTS app_background_color;
