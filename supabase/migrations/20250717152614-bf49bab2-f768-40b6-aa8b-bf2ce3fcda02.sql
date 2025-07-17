-- Remover as colunas service_order e video_url da tabela checklists
ALTER TABLE public.checklists DROP COLUMN service_order;
ALTER TABLE public.checklists DROP COLUMN video_url;