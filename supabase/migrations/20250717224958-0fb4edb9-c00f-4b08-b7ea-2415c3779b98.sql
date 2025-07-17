
-- Remover todos os triggers de log
DROP TRIGGER IF EXISTS log_checklists_changes ON public.checklists;
DROP TRIGGER IF EXISTS log_budgets_changes ON public.budgets;
DROP TRIGGER IF EXISTS log_services_changes ON public.services;
DROP TRIGGER IF EXISTS log_vehicles_changes ON public.vehicles;
DROP TRIGGER IF EXISTS log_profiles_changes ON public.profiles;
DROP TRIGGER IF EXISTS log_system_settings_changes ON public.system_settings;

-- Remover a função de log
DROP FUNCTION IF EXISTS public.log_table_changes();

-- Remover a tabela de logs
DROP TABLE IF EXISTS public.system_logs;
