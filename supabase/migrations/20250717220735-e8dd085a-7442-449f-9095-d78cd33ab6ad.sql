
-- Criar tabela para armazenar logs do sistema
CREATE TABLE public.system_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  user_name TEXT,
  action TEXT NOT NULL, -- CREATE, UPDATE, DELETE
  table_name TEXT NOT NULL,
  record_id UUID,
  old_data JSONB,
  new_data JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar índices para performance
CREATE INDEX idx_system_logs_user_id ON public.system_logs(user_id);
CREATE INDEX idx_system_logs_table_name ON public.system_logs(table_name);
CREATE INDEX idx_system_logs_created_at ON public.system_logs(created_at DESC);
CREATE INDEX idx_system_logs_action ON public.system_logs(action);

-- Habilitar RLS
ALTER TABLE public.system_logs ENABLE ROW LEVEL SECURITY;

-- Política para admins poderem visualizar todos os logs
CREATE POLICY "Admins can view all logs" 
  ON public.system_logs 
  FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'admin'
  ));

-- Função para registrar logs automaticamente
CREATE OR REPLACE FUNCTION public.log_table_changes()
RETURNS TRIGGER AS $$
DECLARE
  user_profile RECORD;
BEGIN
  -- Buscar informações do usuário
  SELECT full_name INTO user_profile 
  FROM profiles 
  WHERE id = auth.uid();

  -- Inserir log baseado no tipo de operação
  IF TG_OP = 'DELETE' THEN
    INSERT INTO public.system_logs (
      user_id, user_name, action, table_name, record_id, old_data
    ) VALUES (
      auth.uid(),
      user_profile.full_name,
      'DELETE',
      TG_TABLE_NAME,
      OLD.id,
      row_to_json(OLD)::jsonb
    );
    RETURN OLD;
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO public.system_logs (
      user_id, user_name, action, table_name, record_id, old_data, new_data
    ) VALUES (
      auth.uid(),
      user_profile.full_name,
      'UPDATE',
      TG_TABLE_NAME,
      NEW.id,
      row_to_json(OLD)::jsonb,
      row_to_json(NEW)::jsonb
    );
    RETURN NEW;
  ELSIF TG_OP = 'INSERT' THEN
    INSERT INTO public.system_logs (
      user_id, user_name, action, table_name, record_id, new_data
    ) VALUES (
      auth.uid(),
      user_profile.full_name,
      'CREATE',
      TG_TABLE_NAME,
      NEW.id,
      row_to_json(NEW)::jsonb
    );
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Criar triggers para as principais tabelas
CREATE TRIGGER log_checklists_changes
  AFTER INSERT OR UPDATE OR DELETE ON public.checklists
  FOR EACH ROW EXECUTE FUNCTION public.log_table_changes();

CREATE TRIGGER log_checklist_items_changes
  AFTER INSERT OR UPDATE OR DELETE ON public.checklist_items
  FOR EACH ROW EXECUTE FUNCTION public.log_table_changes();

CREATE TRIGGER log_budgets_changes
  AFTER INSERT OR UPDATE OR DELETE ON public.budgets
  FOR EACH ROW EXECUTE FUNCTION public.log_table_changes();

CREATE TRIGGER log_budget_items_changes
  AFTER INSERT OR UPDATE OR DELETE ON public.budget_items
  FOR EACH ROW EXECUTE FUNCTION public.log_table_changes();

CREATE TRIGGER log_services_changes
  AFTER INSERT OR UPDATE OR DELETE ON public.services
  FOR EACH ROW EXECUTE FUNCTION public.log_table_changes();

CREATE TRIGGER log_vehicles_changes
  AFTER INSERT OR UPDATE OR DELETE ON public.vehicles
  FOR EACH ROW EXECUTE FUNCTION public.log_table_changes();

CREATE TRIGGER log_profiles_changes
  AFTER UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.log_table_changes();

CREATE TRIGGER log_system_settings_changes
  AFTER UPDATE ON public.system_settings
  FOR EACH ROW EXECUTE FUNCTION public.log_table_changes();
