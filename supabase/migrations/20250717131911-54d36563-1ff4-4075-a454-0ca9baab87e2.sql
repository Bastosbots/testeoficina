-- Adicionar coluna status à tabela checklists
ALTER TABLE public.checklists 
ADD COLUMN status TEXT NOT NULL DEFAULT 'Pendente';

-- Definir os valores permitidos através de um check constraint
ALTER TABLE public.checklists 
ADD CONSTRAINT checklists_status_check 
CHECK (status IN ('Pendente', 'Em Andamento', 'Concluído', 'Cancelado'));