
-- Atualizar a função de log para ser mais seletiva
CREATE OR REPLACE FUNCTION public.log_table_changes()
RETURNS TRIGGER AS $$
DECLARE
  user_profile RECORD;
  should_log BOOLEAN := true;
BEGIN
  -- Buscar informações do usuário
  SELECT full_name INTO user_profile 
  FROM profiles 
  WHERE id = auth.uid();

  -- Verificar se já existe um log recente para esta ação (últimos 2 segundos)
  IF TG_OP = 'UPDATE' THEN
    -- Para updates, verificar se realmente houve mudança significativa
    IF row_to_json(OLD)::jsonb = row_to_json(NEW)::jsonb THEN
      should_log := false;
    END IF;
    
    -- Evitar logs duplicados muito próximos no tempo
    IF should_log AND EXISTS (
      SELECT 1 FROM public.system_logs 
      WHERE table_name = TG_TABLE_NAME 
        AND record_id = NEW.id 
        AND action = 'UPDATE'
        AND user_id = auth.uid()
        AND created_at > now() - interval '2 seconds'
    ) THEN
      should_log := false;
    END IF;
  END IF;

  -- Só registrar se necessário
  IF should_log THEN
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
