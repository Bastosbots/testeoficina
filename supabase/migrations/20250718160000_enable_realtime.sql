
-- Enable realtime for budgets table
ALTER TABLE public.budgets REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.budgets;

-- Enable realtime for budget_items table
ALTER TABLE public.budget_items REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.budget_items;

-- Enable realtime for checklists table
ALTER TABLE public.checklists REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.checklists;

-- Enable realtime for checklist_items table
ALTER TABLE public.checklist_items REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.checklist_items;

-- Enable realtime for vehicles table
ALTER TABLE public.vehicles REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.vehicles;

-- Enable realtime for services table
ALTER TABLE public.services REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.services;

-- Enable realtime for profiles table
ALTER TABLE public.profiles REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;
