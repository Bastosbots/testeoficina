
-- Desabilitar temporariamente todos os triggers de log
DROP TRIGGER IF EXISTS log_checklists_changes ON public.checklists;
DROP TRIGGER IF EXISTS log_checklist_items_changes ON public.checklist_items;
DROP TRIGGER IF EXISTS log_budgets_changes ON public.budgets;
DROP TRIGGER IF EXISTS log_budget_items_changes ON public.budget_items;
DROP TRIGGER IF EXISTS log_services_changes ON public.services;
DROP TRIGGER IF EXISTS log_vehicles_changes ON public.vehicles;
DROP TRIGGER IF EXISTS log_profiles_changes ON public.profiles;
DROP TRIGGER IF EXISTS log_system_settings_changes ON public.system_settings;

-- Recriar a função de log com lógica mais restritiva
CREATE OR REPLACE FUNCTION public.log_table_changes()
RETURNS TRIGGER AS $$
DECLARE
  user_profile RECORD;
  should_log BOOLEAN := true;
  recent_log_count INTEGER := 0;
BEGIN
  -- Verificar se o usuário existe
  IF auth.uid() IS NULL THEN
    -- Se não há usuário autenticado, não fazer log
    IF TG_OP = 'DELETE' THEN
      RETURN OLD;
    ELSE
      RETURN NEW;
    END IF;
  END IF;

  -- Buscar informações do usuário
  SELECT full_name INTO user_profile 
  FROM profiles 
  WHERE id = auth.uid();

  -- Verificar logs recentes para esta tabela e usuário (últimos 5 segundos)
  SELECT COUNT(*) INTO recent_log_count
  FROM public.system_logs 
  WHERE table_name = TG_TABLE_NAME 
    AND user_id = auth.uid()
    AND created_at > now() - interval '5 seconds';

  -- Se já existem muitos logs recentes, não criar mais
  IF recent_log_count >= 3 THEN
    should_log := false;
  END IF;

  -- Para updates, verificar se realmente houve mudança
  IF TG_OP = 'UPDATE' AND should_log THEN
    -- Comparar apenas campos importantes, ignorando updated_at e created_at
    DECLARE
      old_data_filtered JSONB;
      new_data_filtered JSONB;
    BEGIN
      old_data_filtered := row_to_json(OLD)::jsonb - 'updated_at' - 'created_at';
      new_data_filtered := row_to_json(NEW)::jsonb - 'updated_at' - 'created_at';
      
      IF old_data_filtered = new_data_filtered THEN
        should_log := false;
      END IF;
    END;
  END IF;

  -- Verificar se já existe um log idêntico muito recente (último segundo)
  IF should_log THEN
    IF TG_OP = 'UPDATE' AND EXISTS (
      SELECT 1 FROM public.system_logs 
      WHERE table_name = TG_TABLE_NAME 
        AND record_id = NEW.id 
        AND action = 'UPDATE'
        AND user_id = auth.uid()
        AND created_at > now() - interval '1 second'
    ) THEN
      should_log := false;
    ELSIF TG_OP = 'INSERT' AND EXISTS (
      SELECT 1 FROM public.system_logs 
      WHERE table_name = TG_TABLE_NAME 
        AND record_id = NEW.id 
        AND action = 'CREATE'
        AND user_id = auth.uid()
        AND created_at > now() - interval '1 second'
    ) THEN
      should_log := false;
    END IF;
  END IF;

  -- Só registrar se realmente necessário
  IF should_log THEN
    IF TG_OP = 'DELETE' THEN
      INSERT INTO public.system_logs (
        user_id, user_name, action, table_name, record_id, old_data
      ) VALUES (
        auth.uid(),
        COALESCE(user_profile.full_name, 'Usuário'),
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
        COALESCE(user_profile.full_name, 'Usuário'),
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
        COALESCE(user_profile.full_name, 'Usuário'),
        'CREATE',
        TG_TABLE_NAME,
        NEW.id,
        row_to_json(NEW)::jsonb
      );
      RETURN NEW;
    END IF;
  ELSE
    -- Retornar sem fazer log
    IF TG_OP = 'DELETE' THEN
      RETURN OLD;
    ELSE
      RETURN NEW;
    END IF;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recriar apenas os triggers principais com AFTER ao invés de múltiplos triggers
CREATE TRIGGER log_checklists_changes
  AFTER INSERT OR UPDATE OR DELETE ON public.checklists
  FOR EACH ROW EXECUTE FUNCTION public.log_table_changes();

CREATE TRIGGER log_budgets_changes
  AFTER INSERT OR UPDATE OR DELETE ON public.budgets
  FOR EACH ROW EXECUTE FUNCTION public.log_table_changes();

CREATE TRIGGER log_services_changes
  AFTER INSERT OR UPDATE OR DELETE ON public.services
  FOR EACH ROW EXECUTE FUNCTION public.log_table_changes();

CREATE TRIGGER log_vehicles_changes
  AFTER INSERT OR UPDATE OR DELETE ON public.vehicles
  FOR EACH ROW EXECUTE FUNCTION public.log_table_changes();

-- Triggers mais específicos para tabelas que podem ter muitas operações
CREATE TRIGGER log_profiles_changes
  AFTER UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.log_table_changes();

CREATE TRIGGER log_system_settings_changes
  AFTER UPDATE ON public.system_settings
  FOR EACH ROW EXECUTE FUNCTION public.log_table_changes();
